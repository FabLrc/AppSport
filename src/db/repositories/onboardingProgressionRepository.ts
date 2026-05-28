import { getDatabase } from '@/db/client';
import type { OnboardingProgression } from './types';

type RawRow = {
  id: number;
  mensurations_configure: number;
  rappels_configure: number;
  nutrition_configure: number;
  planning_configure: number;
  mensurations_xp_donne: number;
  rappels_xp_donne: number;
  nutrition_xp_donne: number;
  planning_xp_donne: number;
};

function fromRaw(r: RawRow): OnboardingProgression {
  return {
    id: 1,
    mensurations_configure: r.mensurations_configure === 1,
    rappels_configure: r.rappels_configure === 1,
    nutrition_configure: r.nutrition_configure === 1,
    planning_configure: r.planning_configure === 1,
    mensurations_xp_donne: r.mensurations_xp_donne === 1,
    rappels_xp_donne: r.rappels_xp_donne === 1,
    nutrition_xp_donne: r.nutrition_xp_donne === 1,
    planning_xp_donne: r.planning_xp_donne === 1,
  };
}

export async function getOnboardingProgression(): Promise<OnboardingProgression> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RawRow>('SELECT * FROM onboarding_progression WHERE id = 1');
  return row
    ? fromRaw(row)
    : {
        id: 1,
        mensurations_configure: false,
        rappels_configure: false,
        nutrition_configure: false,
        planning_configure: false,
        mensurations_xp_donne: false,
        rappels_xp_donne: false,
        nutrition_xp_donne: false,
        planning_xp_donne: false,
      };
}

export type OnboardingModule = 'mensurations' | 'rappels' | 'nutrition' | 'planning';

export async function marquerModuleComplete(module: OnboardingModule): Promise<boolean> {
  const db = await getDatabase();
  const col = `${module}_configure`;
  const xpCol = `${module}_xp_donne`;
  const existing = await db.getFirstAsync<{ val: number; xpDonne: number }>(
    `SELECT ${col} AS val, ${xpCol} AS xpDonne FROM onboarding_progression WHERE id = 1`,
  );
  if (existing?.val === 1) return false; // déjà marqué
  await db.runAsync(`UPDATE onboarding_progression SET ${col} = 1 WHERE id = 1`);
  return true; // nouveau marquage → XP à attribuer
}

export async function marquerXpDonne(module: OnboardingModule): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`UPDATE onboarding_progression SET ${module}_xp_donne = 1 WHERE id = 1`);
}
