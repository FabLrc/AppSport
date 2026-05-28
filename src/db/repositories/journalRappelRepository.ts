import { getDatabase } from '@/db/client';
import type { JournalRappel, RappelType, UpdateRappelInput } from './types';

type RawRow = {
  id: number;
  type: string;
  actif: number;
  horaire: string;
  notification_ids: string;
};

function mapRow(row: RawRow): JournalRappel {
  return {
    id: row.id,
    type: row.type as RappelType,
    actif: row.actif === 1,
    horaire: row.horaire,
    notification_ids: JSON.parse(row.notification_ids) as string[],
  };
}

export async function getAllRappels(): Promise<JournalRappel[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RawRow>('SELECT * FROM journal_rappel ORDER BY id ASC');
  return rows.map(mapRow);
}

export async function getRappelByType(type: RappelType): Promise<JournalRappel | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RawRow>('SELECT * FROM journal_rappel WHERE type = ?', [type]);
  return row ? mapRow(row) : null;
}

export async function updateRappel(type: RappelType, updates: UpdateRappelInput): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (updates.actif !== undefined) {
    fields.push('actif = ?');
    values.push(updates.actif ? 1 : 0);
  }
  if (updates.horaire !== undefined) {
    fields.push('horaire = ?');
    values.push(updates.horaire);
  }
  if (updates.notification_ids !== undefined) {
    fields.push('notification_ids = ?');
    values.push(JSON.stringify(updates.notification_ids));
  }

  if (fields.length === 0) return;

  values.push(type);
  await db.runAsync(`UPDATE journal_rappel SET ${fields.join(', ')} WHERE type = ?`, values);
}
