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

// ---------------------------------------------------------------------------
// Lot 3 — Historique et surcharge progressive
// ---------------------------------------------------------------------------

export interface HistoriqueEntry {
  seance_id: number;
  session_date: string;
  max_charge: number | null;
  max_reps: number;
  total_reps: number;
  nombre_series: number;
}

/**
 * Retourne l'historique d'un exercice : une ligne par séance complétée,
 * avec la charge maximale, le nombre de reps max et le total de reps.
 * Limité aux 50 dernières séances pour la performance.
 */
export async function getHistoriqueExercice(exerciceId: number): Promise<HistoriqueEntry[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    seance_id: number;
    session_date: string;
    max_charge: number | null;
    max_reps: number;
    total_reps: number;
    nombre_series: number;
  }>(
    `SELECT
       sp.seance_id,
       s.date           AS session_date,
       MAX(sp.charge_kg) AS max_charge,
       MAX(sp.reps_realisees) AS max_reps,
       SUM(sp.reps_realisees) AS total_reps,
       COUNT(*)          AS nombre_series
     FROM serie_performance sp
     JOIN seance s ON s.id = sp.seance_id
     WHERE sp.exercice_id = ?
       AND s.statut = 'completee'
     GROUP BY sp.seance_id
     ORDER BY s.date ASC
     LIMIT 50`,
    [exerciceId],
  );
  return rows;
}

/**
 * Retourne les séries d'une séance groupées par exercice.
 * Utilisé pour alimenter la détection de surcharge progressive.
 */
export async function getSeriesParExercicePourSurcharge(
  seanceId: number,
): Promise<Record<number, Array<{ charge_kg: number | null; reps_realisees: number }>>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    exercice_id: number;
    charge_kg: number | null;
    reps_realisees: number;
  }>(
    `SELECT exercice_id, charge_kg, reps_realisees
     FROM serie_performance
     WHERE seance_id = ?
     ORDER BY exercice_id, ordre`,
    [seanceId],
  );

  const result: Record<number, Array<{ charge_kg: number | null; reps_realisees: number }>> = {};
  for (const row of rows) {
    const existing = result[row.exercice_id];
    if (existing === undefined) {
      result[row.exercice_id] = [{ charge_kg: row.charge_kg, reps_realisees: row.reps_realisees }];
    } else {
      existing.push({ charge_kg: row.charge_kg, reps_realisees: row.reps_realisees });
    }
  }
  return result;
}
