import { getDatabase } from '@/db/client';
import type {
  CreateMesureCorporelleInput,
  MesureCorporelle,
  UpdateMesureCorporelleInput,
} from './types';

interface RawMesure {
  id: number;
  date: string;
  poids_kg: number | null;
  tour_taille_cm: number | null;
  tour_hanches_cm: number | null;
  tour_poitrine_cm: number | null;
  tour_bras_cm: number | null;
  tour_cuisses_cm: number | null;
  photo_uri: string | null;
  notes: string | null;
  created_at: string;
}

function fromRaw(raw: RawMesure): MesureCorporelle {
  return {
    id: raw.id,
    date: raw.date,
    poids_kg: raw.poids_kg,
    tour_taille_cm: raw.tour_taille_cm,
    tour_hanches_cm: raw.tour_hanches_cm,
    tour_poitrine_cm: raw.tour_poitrine_cm,
    tour_bras_cm: raw.tour_bras_cm,
    tour_cuisses_cm: raw.tour_cuisses_cm,
    photo_uri: raw.photo_uri,
    notes: raw.notes,
    created_at: raw.created_at,
  };
}

export async function createMesure(input: CreateMesureCorporelleInput): Promise<MesureCorporelle> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO mesure_corporelle
       (date, poids_kg, tour_taille_cm, tour_hanches_cm, tour_poitrine_cm, tour_bras_cm, tour_cuisses_cm, photo_uri, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.date,
      input.poids_kg ?? null,
      input.tour_taille_cm ?? null,
      input.tour_hanches_cm ?? null,
      input.tour_poitrine_cm ?? null,
      input.tour_bras_cm ?? null,
      input.tour_cuisses_cm ?? null,
      input.photo_uri ?? null,
      input.notes ?? null,
    ],
  );
  const created = await getMesureById(result.lastInsertRowId);
  if (created === null) throw new Error('Impossible de créer la mesure');
  return created;
}

export async function getMesureById(id: number): Promise<MesureCorporelle | null> {
  const db = await getDatabase();
  const raw = await db.getFirstAsync<RawMesure>(`SELECT * FROM mesure_corporelle WHERE id = ?`, [
    id,
  ]);
  return raw !== null ? fromRaw(raw) : null;
}

export async function getAllMesures(): Promise<MesureCorporelle[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RawMesure>(
    `SELECT * FROM mesure_corporelle ORDER BY date DESC`,
  );
  return rows.map(fromRaw);
}

export async function updateMesure(id: number, input: UpdateMesureCorporelleInput): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (input.date !== undefined) {
    fields.push('date = ?');
    values.push(input.date);
  }
  if (input.poids_kg !== undefined) {
    fields.push('poids_kg = ?');
    values.push(input.poids_kg);
  }
  if (input.tour_taille_cm !== undefined) {
    fields.push('tour_taille_cm = ?');
    values.push(input.tour_taille_cm);
  }
  if (input.tour_hanches_cm !== undefined) {
    fields.push('tour_hanches_cm = ?');
    values.push(input.tour_hanches_cm);
  }
  if (input.tour_poitrine_cm !== undefined) {
    fields.push('tour_poitrine_cm = ?');
    values.push(input.tour_poitrine_cm);
  }
  if (input.tour_bras_cm !== undefined) {
    fields.push('tour_bras_cm = ?');
    values.push(input.tour_bras_cm);
  }
  if (input.tour_cuisses_cm !== undefined) {
    fields.push('tour_cuisses_cm = ?');
    values.push(input.tour_cuisses_cm);
  }
  if (input.photo_uri !== undefined) {
    fields.push('photo_uri = ?');
    values.push(input.photo_uri);
  }
  if (input.notes !== undefined) {
    fields.push('notes = ?');
    values.push(input.notes);
  }

  if (fields.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE mesure_corporelle SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteMesure(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM mesure_corporelle WHERE id = ?`, [id]);
}
