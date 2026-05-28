import type { Migration } from '../migrate';

export const migration: Migration = {
  version: 3,
  name: 'lot2_mesures',
  async up(db) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS mesure_corporelle (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        date             TEXT NOT NULL,
        poids_kg         REAL,
        tour_taille_cm   REAL,
        tour_hanches_cm  REAL,
        tour_poitrine_cm REAL,
        tour_bras_cm     REAL,
        tour_cuisses_cm  REAL,
        photo_uri        TEXT,
        notes            TEXT,
        created_at       TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_mesure_date ON mesure_corporelle(date);
    `);
  },
};
