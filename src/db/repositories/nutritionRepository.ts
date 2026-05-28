import { getDatabase } from '@/db/client';
import type { ObjectifNutritionnel, ValidationNutritionQuotidienne } from './types';

export async function getObjectifNutritionnel(): Promise<ObjectifNutritionnel> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ kcal_cible: number; proteines_g: number }>(
    'SELECT kcal_cible, proteines_g FROM objectif_nutritionnel WHERE id = 1',
  );
  return row !== null
    ? { id: 1, kcal_cible: row.kcal_cible, proteines_g: row.proteines_g }
    : { id: 1, kcal_cible: 2000, proteines_g: 150 };
}

export async function updateObjectifNutritionnel(
  kcal_cible: number,
  proteines_g: number,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO objectif_nutritionnel (id, kcal_cible, proteines_g) VALUES (1, ?, ?)',
    [kcal_cible, proteines_g],
  );
}

export async function getValidationAujourdhui(date: string): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ atteint: number }>(
    'SELECT atteint FROM validation_nutrition_quotidienne WHERE date = ?',
    [date],
  );
  return row?.atteint === 1;
}

export async function setValidationAujourdhui(date: string, atteint: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO validation_nutrition_quotidienne (date, atteint)
     VALUES (?, ?)
     ON CONFLICT(date) DO UPDATE SET atteint = excluded.atteint`,
    [date, atteint ? 1 : 0],
  );
}

export async function getHistoriqueNutrition(
  limit = 30,
): Promise<ValidationNutritionQuotidienne[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ date: string; atteint: number; created_at: string }>(
    'SELECT * FROM validation_nutrition_quotidienne ORDER BY date DESC LIMIT ?',
    [limit],
  );
  return rows.map((r) => ({ date: r.date, atteint: r.atteint === 1, created_at: r.created_at }));
}
