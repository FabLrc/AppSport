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
};

export type MainTabParamList = {
  Home: undefined;
  Settings: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
