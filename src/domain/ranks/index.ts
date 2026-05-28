import type { RangKey } from '@/db/repositories/types';

export interface RangInfo {
  key: RangKey;
  label: string;
  titre: string;
  motto: string;
  xpMin: number;
  xpMax: number | null; // null pour S++
}

export const RANGS: RangInfo[] = [
  {
    key: 'E',
    label: 'Rang E',
    titre: 'Recrue',
    motto: 'Le premier pas est le plus important.',
    xpMin: 0,
    xpMax: 499,
  },
  {
    key: 'D',
    label: 'Rang D',
    titre: 'Pratiquant',
    motto: 'Tu construis tes bases, séance après séance.',
    xpMin: 500,
    xpMax: 1499,
  },
  {
    key: 'C',
    label: 'Rang C',
    titre: 'Compétiteur',
    motto: "Tu tiens là où d'autres abandonnent.",
    xpMin: 1500,
    xpMax: 3499,
  },
  {
    key: 'B',
    label: 'Rang B',
    titre: 'Athlète',
    motto: "Tu n'es plus celui que tu étais.",
    xpMin: 3500,
    xpMax: 6999,
  },
  {
    key: 'A',
    label: 'Rang A',
    titre: 'Élite',
    motto: 'Peu atteignent ce niveau. Continue.',
    xpMin: 7000,
    xpMax: 11999,
  },
  {
    key: 'S',
    label: 'Rang S',
    titre: 'Champion',
    motto: 'Le sommet est en vue.',
    xpMin: 12000,
    xpMax: 19999,
  },
  {
    key: 'S+',
    label: 'Rang S+',
    titre: 'Vétéran',
    motto: "L'expérience forgée dans la durée.",
    xpMin: 20000,
    xpMax: 34999,
  },
  {
    key: 'S++',
    label: 'Rang S++',
    titre: 'Légende',
    motto: "Celui qui n'a jamais arrêté.",
    xpMin: 35000,
    xpMax: null,
  },
];

export function getRangForXp(xp: number): RangInfo {
  for (let i = RANGS.length - 1; i >= 0; i--) {
    const rang = RANGS[i];
    if (rang !== undefined && xp >= rang.xpMin) return rang;
  }
  return RANGS[0]!;
}

export function getProgressionToNextRang(xp: number): {
  current: RangInfo;
  next: RangInfo | null;
  progressPercent: number;
} {
  const current = getRangForXp(xp);
  const nextIndex = RANGS.findIndex((r) => r.key === current.key) + 1;
  const next = nextIndex < RANGS.length ? (RANGS[nextIndex] ?? null) : null;

  if (next === null) {
    return { current, next: null, progressPercent: 100 };
  }

  const rangeSize = next.xpMin - current.xpMin;
  const xpInRange = xp - current.xpMin;
  const progressPercent = Math.min(100, Math.round((xpInRange / rangeSize) * 100));
  return { current, next, progressPercent };
}
