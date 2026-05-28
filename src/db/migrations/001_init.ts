import type { Migration } from '../migrate';

/**
 * Migration 001 — initialise la métadonnée du schéma.
 *
 * Crée la table `_schema_version` qui sert au runner à savoir quelles
 * migrations ont déjà été appliquées. Aucune table métier n'est créée ici :
 * chaque lot fonctionnel apportera ses propres migrations numérotées.
 *
 * Cette migration n'est jamais réversible et ne doit jamais être modifiée
 * après publication (toute installation existante l'aura déjà appliquée).
 */
export const migration: Migration = {
  version: 1,
  name: 'init',
  async up(db) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS _schema_version (
        version    INTEGER PRIMARY KEY,
        name       TEXT NOT NULL,
        applied_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  },
};
