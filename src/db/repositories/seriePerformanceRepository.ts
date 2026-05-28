import { getDatabase } from '@/db/client';
import type { SeriePerformance, DifficulteSubjective } from './types';

interface RawSerie {
  id: number;
  seance_id: number;
  exercice_id: number;
  ordre: number;
  charge_kg: number | null;
  reps_realisees: number;
  difficulte_subjective: string | null;
  created_at: string;
}

function fromRaw(raw: RawSerie): SeriePerformance {
  return {
    id: raw.id,
    seance_id: raw.seance_id,
    exercice_id: raw.exercice_id,
    ordre: raw.ordre,
    charge_kg: raw.charge_kg,
    reps_realisees: raw.reps_realisees,
    difficulte_subjective: raw.difficulte_subjective as DifficulteSubjective | null,
    created_at: raw.created_at,
  };
}

export interface CreateSerieInput {
  seance_id: number;
  exercice_id: number;
  ordre: number;
  charge_kg: number | null;
  reps_realisees: number;
  difficulte_subjective: DifficulteSubjective | null;
}

export async function createSerie(input: CreateSerieInput): Promise<SeriePerformance> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO serie_performance
       (seance_id, exercice_id, ordre, charge_kg, reps_realisees, difficulte_subjective)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.seance_id,
      input.exercice_id,
      input.ordre,
      input.charge_kg,
      input.reps_realisees,
      input.difficulte_subjective,
    ],
  );
  const created = await db.getFirstAsync<RawSerie>(`SELECT * FROM serie_performance WHERE id = ?`, [
    result.lastInsertRowId,
  ]);
  if (created === null) throw new Error('Impossible de créer la série');
  return fromRaw(created);
}

export async function getSeriesParSeance(seanceId: number): Promise<SeriePerformance[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RawSerie>(
    `SELECT * FROM serie_performance WHERE seance_id = ? ORDER BY exercice_id, ordre`,
    [seanceId],
  );
  return rows.map(fromRaw);
}

/**
 * Compte de séries effectuées par exercice pour une séance donnée.
 * Retourne un Record<exercice_id, count>.
 */
export async function countSeriesParExercice(seanceId: number): Promise<Record<number, number>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ exercice_id: number; n: number }>(
    `SELECT exercice_id, COUNT(*) AS n
     FROM serie_performance
     WHERE seance_id = ?
     GROUP BY exercice_id`,
    [seanceId],
  );
  const result: Record<number, number> = {};
  for (const row of rows) {
    result[row.exercice_id] = row.n;
  }
  return result;
}
