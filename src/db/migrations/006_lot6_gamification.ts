import type { Migration } from '../migrate';
import type { Database } from '../client';

export const migration: Migration = {
  version: 6,
  name: 'lot6_gamification',
  async up(db: Database) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS objectif_nutritionnel (
        id            INTEGER PRIMARY KEY CHECK (id = 1),
        kcal_cible    INTEGER NOT NULL DEFAULT 2000,
        proteines_g   INTEGER NOT NULL DEFAULT 150
      );

      CREATE TABLE IF NOT EXISTS validation_nutrition_quotidienne (
        date       TEXT PRIMARY KEY,
        atteint    INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS onboarding_progression (
        id                       INTEGER PRIMARY KEY CHECK (id = 1),
        mensurations_configure   INTEGER NOT NULL DEFAULT 0,
        rappels_configure        INTEGER NOT NULL DEFAULT 0,
        nutrition_configure      INTEGER NOT NULL DEFAULT 0,
        planning_configure       INTEGER NOT NULL DEFAULT 0,
        mensurations_xp_donne    INTEGER NOT NULL DEFAULT 0,
        rappels_xp_donne         INTEGER NOT NULL DEFAULT 0,
        nutrition_xp_donne       INTEGER NOT NULL DEFAULT 0,
        planning_xp_donne        INTEGER NOT NULL DEFAULT 0
      );

      INSERT OR IGNORE INTO objectif_nutritionnel (id) VALUES (1);
      INSERT OR IGNORE INTO onboarding_progression (id) VALUES (1);
    `);
  },
};
