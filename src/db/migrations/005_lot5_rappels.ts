import type { Migration } from '../migrate';
import type { Database } from '../client';

export const migration: Migration = {
  version: 5,
  name: 'lot5_rappels',
  async up(db: Database) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS journal_rappel (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        type       TEXT NOT NULL UNIQUE,
        actif      INTEGER NOT NULL DEFAULT 1,
        horaire    TEXT NOT NULL,
        notification_ids TEXT NOT NULL DEFAULT '[]'
      );

      INSERT OR IGNORE INTO journal_rappel (type, actif, horaire) VALUES
        ('seance_musculation', 1, '06:45'),
        ('course',             1, '06:45'),
        ('hydratation',        1, '09:00'),
        ('petit_dejeuner',     1, '08:30'),
        ('dejeuner',           1, '12:30'),
        ('collation',          1, '16:30'),
        ('diner',              1, '19:30'),
        ('pause_posture',      1, '09:00'),
        ('mensurations',       1, '10:00');
    `);
  },
};
