import type { Migration } from '../migrate';

export const migration: Migration = {
  version: 4,
  name: 'lot4_course',
  async up(db) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS course (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        date             TEXT NOT NULL,
        distance_km      REAL NOT NULL,
        duree_minutes    REAL NOT NULL,
        allure_min_par_km REAL NOT NULL,
        ressenti         INTEGER,
        statut           TEXT NOT NULL DEFAULT 'completee',
        xp_attribue      INTEGER NOT NULL DEFAULT 0,
        notes            TEXT,
        created_at       TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS macro_planning (
        id       INTEGER PRIMARY KEY CHECK (id = 1),
        lundi    TEXT NOT NULL DEFAULT 'repos',
        mardi    TEXT NOT NULL DEFAULT 'repos',
        mercredi TEXT NOT NULL DEFAULT 'repos',
        jeudi    TEXT NOT NULL DEFAULT 'repos',
        vendredi TEXT NOT NULL DEFAULT 'repos',
        samedi   TEXT NOT NULL DEFAULT 'repos',
        dimanche TEXT NOT NULL DEFAULT 'repos'
      );

      CREATE INDEX IF NOT EXISTS idx_course_date ON course(date);

      INSERT OR IGNORE INTO macro_planning (id) VALUES (1);
    `);
  },
};
