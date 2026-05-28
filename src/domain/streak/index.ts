/**
 * Logique de streak — module pur sans dépendance React Native.
 * Un jour est "actif" si une séance ou une course y est enregistrée.
 *
 * Gel de streak : protège d'un seul jour manqué. Se débloque au streak=7.
 * Ne se cumule pas (un seul disponible à la fois).
 */

export interface StreakState {
  streak_courant: number;
  gel_streak_disponible: boolean;
  date_derniere_activite: string | null;
}

export interface StreakUpdate {
  streak_courant: number;
  gel_streak_disponible: boolean;
  date_derniere_activite: string;
  gelUtilise: boolean;
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86400000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

const STREAK_GEL_THRESHOLD = 7;

/**
 * Calcule le nouvel état de streak après l'enregistrement d'une activité aujourd'hui.
 * Retourne null si le jour est déjà comptabilisé (activité du même jour).
 */
export function calculerStreakApresActivite(
  state: StreakState,
  today: string, // YYYY-MM-DD
): StreakUpdate {
  const { streak_courant, gel_streak_disponible, date_derniere_activite } = state;

  // Même jour que la dernière activité — pas de changement
  if (date_derniere_activite === today) {
    return {
      streak_courant,
      gel_streak_disponible,
      date_derniere_activite: today,
      gelUtilise: false,
    };
  }

  let newStreak: number;
  let gelUtilise = false;

  if (date_derniere_activite === null) {
    // Première activité
    newStreak = 1;
  } else {
    const gap = daysBetween(date_derniere_activite, today);
    if (gap === 1) {
      // Jours consécutifs
      newStreak = streak_courant + 1;
    } else if (gap === 2 && gel_streak_disponible) {
      // Un jour manqué avec gel disponible → gel utilisé
      newStreak = streak_courant + 1;
      gelUtilise = true;
    } else {
      // Streak rompu (gap > 1 sans gel, ou gap > 2 avec gel)
      newStreak = 1;
    }
  }

  // Gel se débloque à 7 jours consécutifs (si pas déjà disponible et pas utilisé)
  const nouveauGel = gelUtilise
    ? false // gel consommé
    : gel_streak_disponible || newStreak >= STREAK_GEL_THRESHOLD;

  return {
    streak_courant: newStreak,
    gel_streak_disponible: nouveauGel,
    date_derniere_activite: today,
    gelUtilise,
  };
}
