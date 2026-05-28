/**
 * Types de routes pour la navigation. Une seule source de vérité, importée par
 * chaque écran qui a besoin de typer `useNavigation` ou `useRoute`.
 *
 * Convention : `RootStackParamList` est l'arbre racine. Quand un nouveau lot
 * apporte des écrans, on ajoute leurs entrées ici. `undefined` veut dire
 * « pas de paramètres de route ».
 */

export type RootStackParamList = {
  Placeholder: undefined;
  // Onboarding: undefined;     // Lot 1
  // Main: undefined;           // Lot 1 (tab navigator imbriqué)
  // WorkoutSession: { seanceId: string }; // Lot 1
  // ExerciseHistory: { exerciseId: string }; // Lot 3
  // SettingsDetail: { section: 'profile' | 'reminders' | 'data' };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // Pattern recommandé par React Navigation pour typer globalement les routes.
    // L'interface vide est intentionnelle : elle étend RootStackParamList sans
    // ajouter de membres, ce qui rend `useNavigation()` typé partout sans import.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
