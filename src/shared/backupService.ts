import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

import { exportAllData, importAllData } from '@/db/repositories/backupRepository';
import type { AppBackup } from '@/domain/backup/backupTypes';
import { BACKUP_SCHEMA_VERSION } from '@/domain/backup/backupTypes';

const EXPORT_FILENAME = 'appsport_backup.json';

function isValidBackup(obj: unknown): obj is AppBackup {
  if (typeof obj !== 'object' || obj === null) return false;
  const b = obj as Record<string, unknown>;
  if (typeof b['schema_version'] !== 'string') return false;
  if (typeof b['data'] !== 'object' || b['data'] === null) return false;
  const d = b['data'] as Record<string, unknown>;
  return (
    Array.isArray(d['exercices']) &&
    Array.isArray(d['seances']) &&
    Array.isArray(d['serie_performances']) &&
    Array.isArray(d['mesures_corporelles']) &&
    Array.isArray(d['courses'])
  );
}

/**
 * Exporte toutes les données et ouvre la feuille de partage native.
 * Retourne true en cas de succès, false si le partage n'est pas disponible.
 */
export async function exportAndShare(): Promise<boolean> {
  const backup = await exportAllData();
  const json = JSON.stringify(backup, null, 2);

  const tmpFile = new File(Paths.cache, EXPORT_FILENAME);
  tmpFile.write(json);

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    return false;
  }

  await Sharing.shareAsync(tmpFile.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Partager la sauvegarde AppSport',
    UTI: 'public.json',
  });

  return true;
}

export type ImportResult =
  | { ok: true }
  | { ok: false; reason: 'cancelled' | 'invalid_file' | 'incompatible_version' | 'error' };

/**
 * Ouvre le sélecteur de fichier, lit le JSON et importe les données.
 */
export async function importFromFile(): Promise<ImportResult> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || result.assets.length === 0) {
    return { ok: false, reason: 'cancelled' };
  }

  const asset = result.assets[0];
  if (!asset) return { ok: false, reason: 'cancelled' };

  let raw: string;
  try {
    const file = new File(asset.uri);
    raw = await file.text();
  } catch {
    return { ok: false, reason: 'error' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'invalid_file' };
  }

  if (!isValidBackup(parsed)) {
    return { ok: false, reason: 'invalid_file' };
  }

  if (parsed.schema_version !== BACKUP_SCHEMA_VERSION) {
    return { ok: false, reason: 'incompatible_version' };
  }

  try {
    await importAllData(parsed);
  } catch {
    return { ok: false, reason: 'error' };
  }

  return { ok: true };
}
