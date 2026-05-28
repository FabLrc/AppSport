/**
 * Wrapper TypeScript autour de `branding.config.json` — la source de vérité du branding.
 *
 * Pourquoi cette dualité JSON + TS :
 *  - JSON est lisible et consommable par n'importe quel outil (Expo, scripts de
 *    génération d'assets, etc.) sans transpilation.
 *  - Le wrapper TS apporte les types, l'autocomplétion et la documentation des champs.
 *
 * **Pour modifier le branding** : éditer `branding.config.json` (et remplacer les
 * fichiers de `branding/assets/`). Aucune logique ici. Voir `docs/BRANDING.md`.
 *
 * ## Schéma
 *
 * - `app`        : identité de l'application (nom, slug, scheme, bundle id, version, tagline).
 * - `assets`     : chemins des images / icônes utilisés par Expo au build.
 * - `colors`     : palette consommée par le thème runtime (`src/shared/theme/`).
 * - `ranks`      : couleur et titre des 8 rangs (E → S++) du système de gamification.
 * - `fonts`      : noms de familles de police (pour le MVP : police système).
 */

import data from './branding.config.json';

export const branding = data;

export type Branding = typeof branding;
export type BrandingColors = Branding['colors'];
export type BrandingRanks = Branding['ranks'];
export type RankKey = keyof BrandingRanks;

/** Ordre canonique des rangs, de la recrue à la légende. */
export const RANK_ORDER: readonly RankKey[] = ['E', 'D', 'C', 'B', 'A', 'S', 'S+', 'S++'] as const;
