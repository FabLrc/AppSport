import { getDatabase } from '@/db/client';
import { getRangForXp } from '@/domain/ranks';
import { calculerStreakApresActivite } from '@/domain/streak';
import type { Profil, CreateProfilInput } from './types';

interface RawProfil {
  id: number;
  prenom: string;
  taille_cm: number | null;
  poids_depart_kg: number | null;
  objectif: string;
  niveau: string;
  xp_total: number;
  rang_courant: string;
  streak_courant: number;
  gel_streak_disponible: number;
  date_derniere_activite: string | null;
  created_at: string;
  updated_at: string;
}

function fromRaw(raw: RawProfil): Profil {
  return {
    id: 1,
    prenom: raw.prenom,
    taille_cm: raw.taille_cm,
    poids_depart_kg: raw.poids_depart_kg,
    objectif: raw.objectif as Profil['objectif'],
    niveau: raw.niveau as Profil['niveau'],
    xp_total: raw.xp_total,
    rang_courant: raw.rang_courant as Profil['rang_courant'],
    streak_courant: raw.streak_courant,
    gel_streak_disponible: raw.gel_streak_disponible === 1,
    date_derniere_activite: raw.date_derniere_activite,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export async function getProfil(): Promise<Profil | null> {
  const db = await getDatabase();
  const raw = await db.getFirstAsync<RawProfil>(`SELECT * FROM profil WHERE id = 1`);
  return raw !== null ? fromRaw(raw) : null;
}

export async function createProfil(input: CreateProfilInput): Promise<Profil> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO profil (id, prenom, objectif, niveau)
     VALUES (1, ?, ?, ?)`,
    [input.prenom, input.objectif, input.niveau],
  );
  const created = await getProfil();
  if (created === null) throw new Error('Impossible de créer le profil');
  return created;
}

export async function updateProfilXp(
  xpTotal: number,
  rangCourant: Profil['rang_courant'],
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE profil SET xp_total = ?, rang_courant = ?, updated_at = datetime('now') WHERE id = 1`,
    [xpTotal, rangCourant],
  );
}

export async function updateDerniereActivite(date: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE profil SET date_derniere_activite = ?, updated_at = datetime('now') WHERE id = 1`,
    [date],
  );
}

/** Ajoute des XP au profil, recalcule le rang, et met à jour la base. */
export async function addXpToProfil(amount: number): Promise<Profil> {
  const current = await getProfil();
  if (current === null) throw new Error('Profil introuvable');
  const newXp = current.xp_total + amount;
  const newRang = getRangForXp(newXp);
  await updateProfilXp(newXp, newRang.key);
  return { ...current, xp_total: newXp, rang_courant: newRang.key };
}

/**
 * Met à jour le streak après une activité (séance ou course).
 * Recalcule streak, gel, et date de dernière activité.
 */
export async function updateStreakApresActivite(today: string): Promise<void> {
  const profil = await getProfil();
  if (profil === null) return;
  const update = calculerStreakApresActivite(
    {
      streak_courant: profil.streak_courant,
      gel_streak_disponible: profil.gel_streak_disponible,
      date_derniere_activite: profil.date_derniere_activite,
    },
    today,
  );
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE profil
     SET streak_courant = ?,
         gel_streak_disponible = ?,
         date_derniere_activite = ?,
         updated_at = datetime('now')
     WHERE id = 1`,
    [update.streak_courant, update.gel_streak_disponible ? 1 : 0, update.date_derniere_activite],
  );
}

export async function updateStreak(
  streak_courant: number,
  gel_streak_disponible: boolean,
  date_derniere_activite: string,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE profil
     SET streak_courant = ?, gel_streak_disponible = ?, date_derniere_activite = ?, updated_at = datetime('now')
     WHERE id = 1`,
    [streak_courant, gel_streak_disponible ? 1 : 0, date_derniere_activite],
  );
}
