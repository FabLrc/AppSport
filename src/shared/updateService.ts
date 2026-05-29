import { Platform } from 'react-native';

import { branding } from '@branding/branding.config';
import { isNewerVersion } from '@/domain/updates';

/**
 * Service de vérification de mise à jour (cahier section 9.9).
 *
 * Interroge l'API publique GitHub pour la dernière release du dépôt et
 * détermine si une version plus récente que celle installée est disponible.
 *
 * **Non bloquant par conception** : tout échec (hors-ligne, timeout, réponse
 * inattendue, dépôt sans release) renvoie `null`. L'application démarre
 * normalement et la vérification est simplement ignorée — elle n'empêche
 * jamais l'usage hors ligne.
 */

/** Délai au-delà duquel on abandonne l'appel réseau (en millisecondes). */
const FETCH_TIMEOUT_MS = 6000;

/** Mise à jour disponible et prête à être présentée à l'utilisateur. */
export type UpdateInfo = {
  /** Version distante normalisée, sans le « v » (ex. `"1.2.0"`). */
  version: string;
  /** Notes de version (corps Markdown de la release GitHub). */
  notes: string;
  /**
   * URL d'action selon la plateforme : APK joint à la release (Android) ou
   * lien TestFlight si configuré, sinon la page de la release (iOS).
   */
  actionUrl: string;
  /** Page de la release sur GitHub (lien « voir en ligne »). */
  releaseUrl: string;
};

/** Sous-ensemble de la réponse GitHub `releases/latest` qu'on exploite. */
type GitHubAsset = { name?: string; browser_download_url?: string };
type GitHubRelease = {
  tag_name?: string;
  body?: string;
  html_url?: string;
  assets?: GitHubAsset[];
};

/**
 * Choisit l'URL vers laquelle envoyer l'utilisateur selon la plateforme.
 * Android : APK joint à la release. iOS : TestFlight si renseigné dans le
 * branding, sinon la page de la release. Repli sur la page release dans tous
 * les cas où la cible idéale est absente.
 */
function selectActionUrl(release: GitHubRelease): string {
  const releaseUrl = release.html_url ?? '';

  if (Platform.OS === 'ios') {
    // Lu en `string` (et non en littéral JSON) pour autoriser le test de vacuité.
    const testflightUrl: string = branding.app.testflightUrl;
    return testflightUrl !== '' ? testflightUrl : releaseUrl;
  }

  const apk = release.assets?.find((asset) => asset.name?.toLowerCase().endsWith('.apk') ?? false);
  return apk?.browser_download_url ?? releaseUrl;
}

/**
 * Vérifie la disponibilité d'une mise à jour. Retourne les informations de la
 * release si elle est plus récente que la version installée, sinon `null`.
 */
export async function checkForUpdate(): Promise<UpdateInfo | null> {
  // Lu en `string` (et non en littéral JSON) pour autoriser le test de vacuité.
  const repository: string = branding.app.repository;
  if (repository === '') return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`https://api.github.com/repos/${repository}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const release = (await response.json()) as GitHubRelease;
    const tag = release.tag_name ?? '';
    if (tag === '') return null;

    if (!isNewerVersion(tag, branding.app.version)) return null;

    return {
      version: tag.replace(/^v/i, ''),
      notes: release.body?.trim() ?? '',
      actionUrl: selectActionUrl(release),
      releaseUrl: release.html_url ?? '',
    };
  } catch {
    // Hors-ligne, timeout, JSON inattendu… : silencieux et non bloquant.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
