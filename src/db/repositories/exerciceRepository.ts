import { getDatabase } from '@/db/client';
import type { Exercice } from './types';

interface RawExercice {
  id: number;
  nom: string;
  groupe_musculaire: string;
  type: string;
  mode_charge: string;
  variantes: string | null;
  description: string | null;
}

function fromRaw(raw: RawExercice): Exercice {
  return {
    id: raw.id,
    nom: raw.nom,
    groupe_musculaire: raw.groupe_musculaire,
    type: raw.type as Exercice['type'],
    mode_charge: raw.mode_charge as Exercice['mode_charge'],
    variantes: raw.variantes !== null ? (JSON.parse(raw.variantes) as string[]) : null,
    description: raw.description,
  };
}

export async function getAllExercices(): Promise<Exercice[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RawExercice>(`SELECT * FROM exercice ORDER BY id`);
  return rows.map(fromRaw);
}

export async function getExerciceById(id: number): Promise<Exercice | null> {
  const db = await getDatabase();
  const raw = await db.getFirstAsync<RawExercice>(`SELECT * FROM exercice WHERE id = ?`, [id]);
  return raw !== null ? fromRaw(raw) : null;
}

// ---------------------------------------------------------------------------
// Lot 3 — Création d'exercice personnalisé
// ---------------------------------------------------------------------------

export interface CreateExerciceInput {
  nom: string;
  groupe_musculaire: string;
  type: 'compose' | 'isolation';
  mode_charge: 'charge' | 'poids_corps';
  variantes: string[] | null;
  description: string | null;
}

export async function createExercice(input: CreateExerciceInput): Promise<Exercice> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO exercice (nom, groupe_musculaire, type, mode_charge, variantes, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.nom,
      input.groupe_musculaire,
      input.type,
      input.mode_charge,
      input.variantes !== null ? JSON.stringify(input.variantes) : null,
      input.description,
    ],
  );
  const created = await db.getFirstAsync<RawExercice>(`SELECT * FROM exercice WHERE id = ?`, [
    result.lastInsertRowId,
  ]);
  if (created === null) throw new Error("Impossible de créer l'exercice");
  return fromRaw(created);
}
