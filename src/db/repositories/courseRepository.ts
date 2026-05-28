import { getDatabase } from '@/db/client';
import type { Course, CourseRecords, CreateCourseInput, VolumeStats } from './types';

interface RawCourse {
  id: number;
  date: string;
  distance_km: number;
  duree_minutes: number;
  allure_min_par_km: number;
  ressenti: number | null;
  statut: string;
  xp_attribue: number;
  notes: string | null;
  created_at: string;
}

function fromRaw(raw: RawCourse): Course {
  return {
    id: raw.id,
    date: raw.date,
    distance_km: raw.distance_km,
    duree_minutes: raw.duree_minutes,
    allure_min_par_km: raw.allure_min_par_km,
    ressenti: raw.ressenti,
    statut: 'completee',
    xp_attribue: raw.xp_attribue,
    notes: raw.notes,
    created_at: raw.created_at,
  };
}

export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const allure = input.duree_minutes / input.distance_km;
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO course (date, distance_km, duree_minutes, allure_min_par_km, ressenti, statut, xp_attribue, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.date,
      input.distance_km,
      input.duree_minutes,
      allure,
      input.ressenti ?? null,
      input.statut,
      input.xp_attribue,
      input.notes ?? null,
    ],
  );
  const created = await getCourseById(result.lastInsertRowId);
  if (created === null) throw new Error('Impossible de créer la course');
  return created;
}

export async function getCourseById(id: number): Promise<Course | null> {
  const db = await getDatabase();
  const raw = await db.getFirstAsync<RawCourse>(`SELECT * FROM course WHERE id = ?`, [id]);
  return raw !== null ? fromRaw(raw) : null;
}

export async function getAllCourses(): Promise<Course[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RawCourse>(`SELECT * FROM course ORDER BY date DESC`);
  return rows.map(fromRaw);
}

export async function deleteCourse(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM course WHERE id = ?`, [id]);
}

export async function getVolumeStats(): Promise<VolumeStats> {
  const db = await getDatabase();
  const now = new Date();
  const hebd = new Date(now);
  hebd.setDate(hebd.getDate() - 7);
  const mens = new Date(now);
  mens.setDate(mens.getDate() - 30);

  const rowHebdo = await db.getFirstAsync<{ total: number | null }>(
    `SELECT SUM(distance_km) AS total FROM course WHERE date >= ?`,
    [hebd.toISOString()],
  );
  const rowMensuel = await db.getFirstAsync<{ total: number | null }>(
    `SELECT SUM(distance_km) AS total FROM course WHERE date >= ?`,
    [mens.toISOString()],
  );

  return {
    hebdo: rowHebdo?.total ?? 0,
    mensuel: rowMensuel?.total ?? 0,
  };
}

export async function getCourseRecords(): Promise<CourseRecords> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ distMax: number | null; allureMin: number | null }>(
    `SELECT MAX(distance_km) AS distMax, MIN(allure_min_par_km) AS allureMin FROM course`,
  );
  return {
    distanceMax: row?.distMax ?? null,
    allureMin: row?.allureMin ?? null,
  };
}

/** Retourne les courses sans la course d'id exclu (pour la détection de record). */
export async function getCoursesForRecord(
  excludeId?: number,
): Promise<{ distance_km: number; allure_min_par_km: number }[]> {
  const db = await getDatabase();
  if (excludeId !== undefined) {
    return db.getAllAsync<{ distance_km: number; allure_min_par_km: number }>(
      `SELECT distance_km, allure_min_par_km FROM course WHERE id != ?`,
      [excludeId],
    );
  }
  return db.getAllAsync<{ distance_km: number; allure_min_par_km: number }>(
    `SELECT distance_km, allure_min_par_km FROM course`,
  );
}
