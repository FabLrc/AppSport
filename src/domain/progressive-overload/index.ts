/**
 * Logique de surcharge progressive — module pur sans dépendance React Native.
 * Appelé en fin de séance pour suggérer une progression à l'utilisateur.
 *
 * Règle du cahier (section 7.1) :
 *   Si toutes les séries d'un exercice ont atteint le haut de la fourchette
 *   de répétitions → suggérer une progression.
 *   - Avec charge : +2,5 kg
 *   - Au poids du corps : +2 reps, ou passage à la variante suivante si définie
 */

export interface SeriesData {
  charge_kg: number | null;
  reps_realisees: number;
}

export interface ExercicePerformance {
  exercice_id: number;
  exercice_nom: string;
  mode_charge: 'charge' | 'poids_corps';
  /** Variantes progressives ordonnées par difficulté croissante (optionnel). */
  variantes: string[] | null;
  /** Objectif maximum de répétitions pour cet exercice dans le programme. */
  reps_max: number;
  /** Séries effectuées pendant la séance. */
  series: SeriesData[];
}

export type ProgressionSuggestion =
  | {
      type: 'charge';
      exercice_id: number;
      exercice_nom: string;
      charge_actuelle: number;
      charge_suggeree: number;
    }
  | {
      type: 'reps';
      exercice_id: number;
      exercice_nom: string;
      reps_actuelles: number;
      reps_suggerees: number;
    }
  | {
      type: 'variante';
      exercice_id: number;
      exercice_nom: string;
      variante_suggeree: string;
    };

/**
 * Détecte les exercices méritant une progression et retourne les suggestions.
 *
 * @param exercices - performances de chaque exercice de la séance
 * @returns liste de suggestions (peut être vide)
 */
export function detecterSurchargeProgressive(
  exercices: ExercicePerformance[],
): ProgressionSuggestion[] {
  const suggestions: ProgressionSuggestion[] = [];

  for (const ex of exercices) {
    if (ex.series.length === 0) continue;

    // Critère : toutes les séries ont atteint ou dépassé reps_max
    const toutesAuMax = ex.series.every((s) => s.reps_realisees >= ex.reps_max);
    if (!toutesAuMax) continue;

    if (ex.mode_charge === 'charge') {
      const charges = ex.series.map((s) => s.charge_kg).filter((c): c is number => c !== null);
      if (charges.length === 0) continue;

      const chargeMax = Math.max(...charges);
      // Arrondi au multiple de 0,5 le plus proche (gestion des demi-plaques)
      const chargeSuggeree = Math.round((chargeMax + 2.5) * 2) / 2;

      suggestions.push({
        type: 'charge',
        exercice_id: ex.exercice_id,
        exercice_nom: ex.exercice_nom,
        charge_actuelle: chargeMax,
        charge_suggeree: chargeSuggeree,
      });
    } else {
      // Poids du corps : variante si disponible, sinon +2 reps
      if (ex.variantes !== null && ex.variantes.length > 0) {
        const prochaineVariante = ex.variantes[0];
        if (prochaineVariante === undefined) continue;
        suggestions.push({
          type: 'variante',
          exercice_id: ex.exercice_id,
          exercice_nom: ex.exercice_nom,
          variante_suggeree: prochaineVariante,
        });
      } else {
        const repsMax = Math.max(...ex.series.map((s) => s.reps_realisees));
        suggestions.push({
          type: 'reps',
          exercice_id: ex.exercice_id,
          exercice_nom: ex.exercice_nom,
          reps_actuelles: repsMax,
          reps_suggerees: repsMax + 2,
        });
      }
    }
  }

  return suggestions;
}
