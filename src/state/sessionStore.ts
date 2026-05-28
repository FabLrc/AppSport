import { create } from 'zustand';

import type { ExerciceAvecConfig } from '@/db/repositories/types';

export interface ActiveSession {
  seanceId: number;
  seanceTypeName: string;
  exercises: ExerciceAvecConfig[];
  currentExerciseIndex: number;
  currentSerieIndex: number;
  completedSeriesCount: Record<number, number>; // exercice_id → nb séries complétées
}

interface SessionState {
  session: ActiveSession | null;
  startSession: (
    seanceId: number,
    seanceTypeName: string,
    exercises: ExerciceAvecConfig[],
    resumeCounts?: Record<number, number>,
  ) => void;
  recordSerieCompleted: (exerciceId: number) => void;
  advanceToNextExercise: () => void;
  clearSession: () => void;
  currentExercice: () => ExerciceAvecConfig | null;
  isLastExercice: () => boolean;
  allSerisDoneForCurrent: () => boolean;
  /** Réordonne les exercices restants (à partir du suivant) sans toucher aux complétés. */
  reorderRemainingExercices: (newRemaining: ExerciceAvecConfig[]) => void;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  session: null,

  startSession: (seanceId, seanceTypeName, exercises, resumeCounts = {}) => {
    // Trouve le premier exercice non complété pour la reprise
    let startIndex = 0;
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      if (ex === undefined) continue;
      const done = resumeCounts[ex.exercice.id] ?? 0;
      if (done < ex.series_cible) {
        startIndex = i;
        break;
      }
    }

    set({
      session: {
        seanceId,
        seanceTypeName,
        exercises,
        currentExerciseIndex: startIndex,
        currentSerieIndex: resumeCounts[exercises[startIndex]?.exercice.id ?? 0] ?? 0,
        completedSeriesCount: { ...resumeCounts },
      },
    });
  },

  recordSerieCompleted: (exerciceId) => {
    set((state) => {
      if (state.session === null) return state;
      const prev = state.session.completedSeriesCount[exerciceId] ?? 0;
      return {
        session: {
          ...state.session,
          currentSerieIndex: prev + 1,
          completedSeriesCount: {
            ...state.session.completedSeriesCount,
            [exerciceId]: prev + 1,
          },
        },
      };
    });
  },

  advanceToNextExercise: () => {
    set((state) => {
      if (state.session === null) return state;
      const nextIndex = state.session.currentExerciseIndex + 1;
      if (nextIndex >= state.session.exercises.length) return state;
      const nextExId = state.session.exercises[nextIndex]?.exercice.id ?? 0;
      return {
        session: {
          ...state.session,
          currentExerciseIndex: nextIndex,
          currentSerieIndex: state.session.completedSeriesCount[nextExId] ?? 0,
        },
      };
    });
  },

  clearSession: () => set({ session: null }),

  currentExercice: () => {
    const s = get().session;
    if (s === null) return null;
    return s.exercises[s.currentExerciseIndex] ?? null;
  },

  isLastExercice: () => {
    const s = get().session;
    if (s === null) return false;
    return s.currentExerciseIndex >= s.exercises.length - 1;
  },

  allSerisDoneForCurrent: () => {
    const s = get().session;
    if (s === null) return false;
    const current = s.exercises[s.currentExerciseIndex];
    if (current === undefined) return false;
    const done = s.completedSeriesCount[current.exercice.id] ?? 0;
    return done >= current.series_cible;
  },

  reorderRemainingExercices: (newRemaining) => {
    set((state) => {
      if (state.session === null) return state;
      const alreadyDone = state.session.exercises.slice(0, state.session.currentExerciseIndex + 1);
      return {
        session: {
          ...state.session,
          exercises: [...alreadyDone, ...newRemaining],
        },
      };
    });
  },
}));
