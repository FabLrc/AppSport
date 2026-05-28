import { getDatabase } from '@/db/client';
import type { ActivitePlanning, JourSemaine, MacroPlanning } from './types';

type RawPlanning = {
  id: number;
  lundi: string;
  mardi: string;
  mercredi: string;
  jeudi: string;
  vendredi: string;
  samedi: string;
  dimanche: string;
};

function fromRaw(raw: RawPlanning): MacroPlanning {
  return {
    id: 1,
    lundi: raw.lundi as ActivitePlanning,
    mardi: raw.mardi as ActivitePlanning,
    mercredi: raw.mercredi as ActivitePlanning,
    jeudi: raw.jeudi as ActivitePlanning,
    vendredi: raw.vendredi as ActivitePlanning,
    samedi: raw.samedi as ActivitePlanning,
    dimanche: raw.dimanche as ActivitePlanning,
  };
}

export async function getMacroplanning(): Promise<MacroPlanning> {
  const db = await getDatabase();
  const raw = await db.getFirstAsync<RawPlanning>(`SELECT * FROM macro_planning WHERE id = 1`);
  if (raw === null) throw new Error('macro_planning row missing — check migration 004');
  return fromRaw(raw);
}

export async function updateMacroplanning(
  updates: Partial<Record<JourSemaine, ActivitePlanning>>,
): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: string[] = [];

  for (const [jour, activite] of Object.entries(updates) as [JourSemaine, ActivitePlanning][]) {
    fields.push(`${jour} = ?`);
    values.push(activite);
  }
  if (fields.length === 0) return;
  values.push('1');
  await db.runAsync(`UPDATE macro_planning SET ${fields.join(', ')} WHERE id = ?`, values);
}

const DAY_INDEX_TO_JOUR: JourSemaine[] = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
];

export async function getActiviteAujourdhui(): Promise<ActivitePlanning> {
  const planning = await getMacroplanning();
  const dayIndex = new Date().getDay();
  const jour = DAY_INDEX_TO_JOUR[dayIndex]!;
  return planning[jour];
}
