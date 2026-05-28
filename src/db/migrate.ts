import { getDatabase, type Database } from './client';
import { ALL_MIGRATIONS } from './migrations';

/**
 * Une migration de schéma. La `version` est un entier strictement croissant.
 * Le `name` est purement informatif (utilisé dans les logs et la table de
 * suivi). `up` exécute la migration ; il n'y a pas de `down` dans le périmètre
 * du MVP (pas de rollback).
 */
export type Migration = {
  version: number;
  name: string;
  up: (db: Database) => Promise<void>;
};

/**
 * Résultat agrégé d'un passage du runner. Permet à l'UI ou aux logs de
 * comprendre ce qu'il s'est passé sans avoir à inspecter la base.
 */
export type MigrationOutcome = {
  fromVersion: number;
  toVersion: number;
  applied: { version: number; name: string }[];
};

const SCHEMA_VERSION_TABLE = '_schema_version';

/**
 * Récupère la version maximale connue dans `_schema_version`. Renvoie 0 si la
 * table n'existe pas encore (cas d'une première installation).
 */
async function readCurrentVersion(db: Database): Promise<number> {
  const tableExists = await db.getFirstAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [SCHEMA_VERSION_TABLE],
  );
  if (tableExists === null) {
    return 0;
  }
  const row = await db.getFirstAsync<{ max: number | null }>(
    `SELECT MAX(version) AS max FROM ${SCHEMA_VERSION_TABLE}`,
  );
  return row?.max ?? 0;
}

/**
 * Applique toutes les migrations manquantes pour amener la base à la version
 * la plus récente disponible. Chaque migration est exécutée dans sa propre
 * transaction : en cas d'échec, l'état précédent est restauré et l'erreur
 * est propagée.
 *
 * Ce point d'entrée est idempotent — l'appeler sur une base déjà à jour est
 * sans effet. À appeler une fois au démarrage de l'app, avant tout accès
 * aux repositories.
 */
export async function runMigrations(): Promise<MigrationOutcome> {
  const db = await getDatabase();
  const fromVersion = await readCurrentVersion(db);

  // Sécurité : les versions doivent être strictement croissantes et uniques.
  const sorted = [...ALL_MIGRATIONS].sort((a, b) => a.version - b.version);
  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    const previous = sorted[i - 1];
    if (current === undefined || previous === undefined) {
      continue;
    }
    if (current.version <= previous.version) {
      throw new Error(
        `Migration ${current.name} (v${current.version}) doit être strictement postérieure à ${previous.name} (v${previous.version})`,
      );
    }
  }

  const pending = sorted.filter((m) => m.version > fromVersion);
  const applied: MigrationOutcome['applied'] = [];

  for (const migration of pending) {
    await db.withTransactionAsync(async () => {
      await migration.up(db);
      await db.runAsync(`INSERT INTO ${SCHEMA_VERSION_TABLE} (version, name) VALUES (?, ?)`, [
        migration.version,
        migration.name,
      ]);
    });
    applied.push({ version: migration.version, name: migration.name });
  }

  const toVersion = applied.length > 0 ? applied[applied.length - 1]!.version : fromVersion;
  return { fromVersion, toVersion, applied };
}
