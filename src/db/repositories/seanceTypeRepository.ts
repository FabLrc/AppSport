import { getDatabase } from '@/db/client';
import { parseJsonArray } from '@/shared/json';
import type { SeanceType, SeanceTypeExercice, ExerciceAvecConfig, Exercice } from './types';

interface RawSeanceType {
  id: number;
  nom: string;
  description: string | null;
  is_seance_zero: number;
  created_at: string;
}

interface RawSeanceTypeExercice {
  id: number;
  seance_type_id: number;
  exercice_id: number;
  ordre: number;
  series_cible: number;
  reps_min: number;
  reps_max: number;
  duree_seconde_cible: number | null;
}

interface RawExercice {
  id: number;
  nom: string;
  groupe_musculaire: string;
  type: string;
  mode_charge: string;
  variantes: string | null;
  description: string | null;
}

function fromRawSeanceType(raw: RawSeanceType): SeanceType {
  return {
    id: raw.id,
    nom: raw.nom,
    description: raw.description,
    is_seance_zero: raw.is_seance_zero === 1,
    created_at: raw.created_at,
  };
}

function fromRawSTE(raw: RawSeanceTypeExercice): SeanceTypeExercice {
  return {
    id: raw.id,
    seance_type_id: raw.seance_type_id,
    exercice_id: raw.exercice_id,
    ordre: raw.ordre,
    series_cible: raw.series_cible,
    reps_min: raw.reps_min,
    reps_max: raw.reps_max,
    duree_seconde_cible: raw.duree_seconde_cible,
  };
}

function fromRawExercice(raw: RawExercice): Exercice {
  return {
    id: raw.id,
    nom: raw.nom,
    groupe_musculaire: raw.groupe_musculaire,
    type: raw.type as Exercice['type'],
    mode_charge: raw.mode_charge as Exercice['mode_charge'],
    variantes: raw.variantes !== null ? parseJsonArray<string>(raw.variantes) : null,
    description: raw.description,
  };
}

export async function getAllSeanceTypes(): Promise<SeanceType[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RawSeanceType>(`SELECT * FROM seance_type ORDER BY id`);
  return rows.map(fromRawSeanceType);
}

export async function getSeanceTypeById(id: number): Promise<SeanceType | null> {
  const db = await getDatabase();
  const raw = await db.getFirstAsync<RawSeanceType>(`SELECT * FROM seance_type WHERE id = ?`, [id]);
  return raw !== null ? fromRawSeanceType(raw) : null;
}

/**
 * Retourne les exercices d'un type de séance, dans l'ordre, avec leur config
 * (séries cibles, fourchette de reps, durée cible).
 */
export async function getExercicesAvecConfig(seanceTypeId: number): Promise<ExerciceAvecConfig[]> {
  const db = await getDatabase();

  interface JoinRow extends RawSeanceTypeExercice, RawExercice {
    ste_id: number;
  }

  const rows = await db.getAllAsync<JoinRow>(
    `SELECT
       ste.id          AS ste_id,
       ste.seance_type_id,
       ste.exercice_id,
       ste.ordre,
       ste.series_cible,
       ste.reps_min,
       ste.reps_max,
       ste.duree_seconde_cible,
       e.id,
       e.nom,
       e.groupe_musculaire,
       e.type,
       e.mode_charge,
       e.variantes,
       e.description
     FROM seance_type_exercice ste
     JOIN exercice e ON e.id = ste.exercice_id
     WHERE ste.seance_type_id = ?
     ORDER BY ste.ordre`,
    [seanceTypeId],
  );

  return rows.map((row) => ({
    exercice: fromRawExercice(row),
    seance_type_exercice_id: row.ste_id,
    ordre: row.ordre,
    series_cible: row.series_cible,
    reps_min: row.reps_min,
    reps_max: row.reps_max,
    duree_seconde_cible: row.duree_seconde_cible,
  }));
}

export { fromRawSTE };

// ---------------------------------------------------------------------------
// Lot 3 — Édition des programmes
// ---------------------------------------------------------------------------

/**
 * Ajoute un exercice à un programme (en dernière position).
 */
export async function addExerciceToSeanceType(
  seanceTypeId: number,
  exerciceId: number,
  config: {
    series_cible: number;
    reps_min: number;
    reps_max: number;
    duree_seconde_cible: number | null;
  },
): Promise<void> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ max_ordre: number | null }>(
    `SELECT MAX(ordre) AS max_ordre FROM seance_type_exercice WHERE seance_type_id = ?`,
    [seanceTypeId],
  );
  const nextOrdre = (row?.max_ordre ?? 0) + 1;
  await db.runAsync(
    `INSERT INTO seance_type_exercice
       (seance_type_id, exercice_id, ordre, series_cible, reps_min, reps_max, duree_seconde_cible)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      seanceTypeId,
      exerciceId,
      nextOrdre,
      config.series_cible,
      config.reps_min,
      config.reps_max,
      config.duree_seconde_cible,
    ],
  );
}

/**
 * Retire un exercice d'un programme via son identifiant de lien.
 */
export async function removeExerciceFromSeanceType(steId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM seance_type_exercice WHERE id = ?`, [steId]);
}

/**
 * Met à jour la configuration d'un exercice dans un programme
 * (séries cibles et fourchette de répétitions).
 */
export async function updateExerciceConfig(
  steId: number,
  config: { series_cible: number; reps_min: number; reps_max: number },
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE seance_type_exercice
     SET series_cible = ?, reps_min = ?, reps_max = ?
     WHERE id = ?`,
    [config.series_cible, config.reps_min, config.reps_max, steId],
  );
}

/**
 * Réordonne les exercices d'un programme à partir d'une liste d'identifiants
 * dans le nouvel ordre souhaité.
 */
export async function reorderExercices(
  seanceTypeId: number,
  orderedSteIds: number[],
): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < orderedSteIds.length; i++) {
      const steId = orderedSteIds[i];
      if (steId === undefined) continue;
      await db.runAsync(
        `UPDATE seance_type_exercice SET ordre = ? WHERE id = ? AND seance_type_id = ?`,
        [i + 1, steId, seanceTypeId],
      );
    }
  });
}
