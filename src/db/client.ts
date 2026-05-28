import * as SQLite from 'expo-sqlite';

/**
 * Nom du fichier SQLite stocké sur l'appareil. Garder un nom stable :
 * le changer revient à perdre les données existantes (le fichier précédent
 * reste sur disque mais n'est plus ouvert).
 */
export const DATABASE_NAME = 'appsport.db';

let cachedDb: SQLite.SQLiteDatabase | null = null;

/**
 * Ouvre (ou récupère) l'instance SQLite. Singleton : un seul handle par session
 * app. Réutilisable depuis n'importe quel repository.
 *
 * Au premier appel, le fichier est créé si nécessaire et les PRAGMA d'hygiène
 * sont posés (foreign keys, journal_mode WAL pour la concurrence).
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (cachedDb !== null) {
    return cachedDb;
  }
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);
  cachedDb = db;
  return db;
}

/**
 * Ferme le handle SQLite et invalide le cache. Utile pour les tests, ou avant
 * un import/restauration de sauvegarde qui remplace le fichier.
 */
export async function closeDatabase(): Promise<void> {
  if (cachedDb !== null) {
    await cachedDb.closeAsync();
    cachedDb = null;
  }
}

export type Database = SQLite.SQLiteDatabase;
