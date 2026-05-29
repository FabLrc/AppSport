/**
 * Désérialise de façon défensive une colonne JSON stockée en base en tableau.
 *
 * Retourne `[]` si la valeur est `null`, illisible (JSON corrompu) ou n'est pas
 * un tableau — évite qu'une donnée invalide en base fasse planter l'app au
 * mapping. Les écritures restent faites via `JSON.stringify` côté repository.
 */
export function parseJsonArray<T = string>(raw: string | null): T[] {
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}
