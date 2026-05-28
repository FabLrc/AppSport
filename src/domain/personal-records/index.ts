/**
 * Détection de records personnels de course — module pur sans dépendance React Native.
 * Appelé lors de l'enregistrement d'une course (section 7.5 du cahier).
 *
 * Records suivis :
 *   - Plus longue distance parcourue
 *   - Meilleure allure moyenne (plus petit min/km = plus rapide)
 */

export type RecordType = 'distance' | 'allure';

export interface CourseRecord {
  type: RecordType;
  /** Nouvelle valeur record. */
  value: number;
  /** Ancienne valeur (null si c'est la première course). */
  previousValue: number | null;
}

export interface CourseSnapshot {
  distance_km: number;
  /** Allure en min/km — une valeur plus faible = plus rapide. */
  allure_min_par_km: number;
}

/**
 * Compare une nouvelle course à l'historique et retourne les records battus.
 * L'historique passé en paramètre NE doit PAS inclure la course qui vient d'être créée.
 */
export function detecterRecords(
  nouvelleCourse: CourseSnapshot,
  historique: CourseSnapshot[],
): CourseRecord[] {
  const records: CourseRecord[] = [];

  const distanceMax =
    historique.length > 0 ? Math.max(...historique.map((c) => c.distance_km)) : null;

  const allureMin =
    historique.length > 0 ? Math.min(...historique.map((c) => c.allure_min_par_km)) : null;

  if (distanceMax === null || nouvelleCourse.distance_km > distanceMax) {
    records.push({
      type: 'distance',
      value: nouvelleCourse.distance_km,
      previousValue: distanceMax,
    });
  }

  if (allureMin === null || nouvelleCourse.allure_min_par_km < allureMin) {
    records.push({
      type: 'allure',
      value: nouvelleCourse.allure_min_par_km,
      previousValue: allureMin,
    });
  }

  return records;
}

/** Formate une allure en min/km → "5:30 /km" */
export function formatAllure(allureMinParKm: number): string {
  const minutes = Math.floor(allureMinParKm);
  const seconds = Math.round((allureMinParKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
}
