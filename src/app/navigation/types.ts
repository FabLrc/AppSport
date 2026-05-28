export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  WorkoutSession: { seanceId: number; seanceTypeId: number; seanceTypeName: string };
  WorkoutSummary: { seanceId: number; xpEarned: number; isSeanceZero: boolean };
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
