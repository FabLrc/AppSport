export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  WorkoutSession: { seanceId: number; seanceTypeId: number; seanceTypeName: string };
  WorkoutSummary: { seanceId: number; xpEarned: number; isSeanceZero: boolean };
  // Lot 3 — historique et édition programme
  ExerciceHistory: { exerciceId: number; exerciceNom: string };
  ProgramList: undefined;
  ProgramEdit: { seanceTypeId: number; seanceTypeName: string };
  ExercicePicker: { seanceTypeId: number; seanceTypeName: string };
  // Lot 2 — suivi corporel
  AddMeasurement: { mesureId?: number } | undefined;
  // Lot 4 — course à pied
  AddRun: undefined;
  MacroPlanning: undefined;
  // Lot 5 — rappels
  Reminders: undefined;
  // Lot 6 — nutrition
  NutritionSetup: undefined;
  // Lot 8 — notes de version (mise à jour)
  ReleaseNotes: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  BodyTracking: undefined;
  Running: undefined;
  Settings: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
