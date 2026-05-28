import { getDatabase } from '@/db/client';
import type { Seance } from './types';

interface RawSeance {
  id: number;
  date: string;
  seance_type_id: number | null;
  statut: string;
  xp_attribue: number;
  created_at: string;
  completed_at: string | null;
}

function fromRaw(raw: RawSeance): Seance {
  return {
    id: raw.id,
    date: raw.date,
    seance_type_id: raw.seance_type_id,
    statut: raw.statut as Seance['statut'],
    xp_attribue: raw.xp_attribue,
    created_at: raw.created_at,
    completed_at: raw.completed_at,
  };
}

export async function createSeance(seanceTypeId: number): Promise<Seance> {
  const db = await getDatabase();
  const date = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO seance (date, seance_type_id, statut) VALUES (?, ?, 'en_cours')`,
    [date, seanceTypeId],
  );
  const created = await getSeanceById(result.lastInsertRowId);
  if (created === null) throw new Error('Impossible de créer la séance');
  return created;
}

export async function getSeanceById(id: number): Promise<Seance | null> {
  const db = await getDatabase();
  const raw = await db.getFirstAsync<RawSeance>(`SELECT * FROM seance WHERE id = ?`, [id]);
  return raw !== null ? fromRaw(raw) : null;
}

export async function getSeanceEnCours(): Promise<Seance | null> {
  const db = await getDatabase();
  const raw = await db.getFirstAsync<RawSeance>(
    `SELECT * FROM seance WHERE statut = 'en_cours' ORDER BY created_at DESC LIMIT 1`,
  );
  return raw !== null ? fromRaw(raw) : null;
}

export async function completeSeance(id: number, xpAttribue: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE seance
     SET statut = 'completee', xp_attribue = ?, completed_at = datetime('now')
     WHERE id = ?`,
    [xpAttribue, id],
  );
}

export async function abandonSeance(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE seance
     SET statut = 'completee', completed_at = datetime('now')
     WHERE id = ?`,
    [id],
  );
}

/**
 * Compte le nombre de séances Séance Zéro complétées pour savoir si l'XP
 * de première complétion a déjà été accordé.
 */
export async function countSeanceZeroCompletees(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n
     FROM seance s
     JOIN seance_type st ON st.id = s.seance_type_id
     WHERE s.statut = 'completee' AND st.is_seance_zero = 1`,
  );
  return row?.n ?? 0;
}
