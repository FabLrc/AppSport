/**
 * Logique pure de comparaison de versions sémantiques, sans dépendance React
 * Native ni réseau. Sert à décider si une release publiée sur GitHub est plus
 * récente que la version installée (cahier section 9.9).
 *
 * On reste volontairement minimaliste : `MAJOR.MINOR.PATCH`, tolérance au
 * préfixe « v » des tags GitHub et aux suffixes de pré-release / build qui sont
 * ignorés pour la comparaison. Toute chaîne non parsable est traitée comme
 * « pas de mise à jour » : on ne propose jamais une montée de version douteuse.
 */

/** Version sémantique parsée en triplet `[major, minor, patch]`. */
export type SemVer = [number, number, number];

/**
 * Parse une chaîne de version (`"1.2.3"`, `"v1.2.3"`, `"1.2"`, `"v2"`) en
 * triplet numérique. Le préfixe « v » est toléré, les segments manquants sont
 * complétés par 0, et un éventuel suffixe `-beta` / `+build` est ignoré.
 *
 * Retourne `null` si la chaîne ne commence pas par un entier non négatif
 * valide — le caller doit alors considérer qu'aucune comparaison n'est possible.
 */
export function parseVersion(raw: string): SemVer | null {
  const core = raw.trim().replace(/^v/i, '').split(/[-+]/)[0] ?? '';
  const segments = core.split('.');

  const parsed: number[] = [];
  for (let i = 0; i < 3; i += 1) {
    const segment = segments[i];
    if (segment === undefined || segment === '') {
      parsed.push(0);
      continue;
    }
    if (!/^\d+$/.test(segment)) return null;
    parsed.push(Number(segment));
  }

  // Le segment majeur doit avoir été réellement fourni (pas seulement complété).
  const major = segments[0];
  if (major === undefined || !/^\d+$/.test(major)) return null;

  return [parsed[0]!, parsed[1]!, parsed[2]!];
}

/**
 * Compare deux versions parsées. `-1` si `a < b`, `0` si égales, `1` si `a > b`.
 */
export function compareVersions(a: SemVer, b: SemVer): -1 | 0 | 1 {
  for (let i = 0; i < 3; i += 1) {
    const left = a[i]!;
    const right = b[i]!;
    if (left < right) return -1;
    if (left > right) return 1;
  }
  return 0;
}

/**
 * Indique si `remote` est strictement plus récente que `local`. Si l'une des
 * deux chaînes n'est pas parsable, retourne `false` (aucune mise à jour
 * proposée).
 */
export function isNewerVersion(remote: string, local: string): boolean {
  const remoteVersion = parseVersion(remote);
  const localVersion = parseVersion(local);
  if (remoteVersion === null || localVersion === null) return false;
  return compareVersions(remoteVersion, localVersion) === 1;
}
