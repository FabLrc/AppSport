import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { useProfileStore } from '@/state/profileStore';
import { getAllSeanceTypes } from '@/db/repositories/seanceTypeRepository';
import {
  createSeance,
  getSeanceEnCours,
  abandonSeance,
  countSeanceZeroCompletees,
} from '@/db/repositories/seanceRepository';
import { countSeriesParExercice } from '@/db/repositories/seriePerformanceRepository';
import { getExercicesAvecConfig } from '@/db/repositories/seanceTypeRepository';
import { getActiviteAujourdhui } from '@/db/repositories/macroPlanningRepository';
import { getOnboardingProgression } from '@/db/repositories/onboardingProgressionRepository';
import {
  getValidationAujourdhui,
  setValidationAujourdhui,
  getObjectifNutritionnel,
} from '@/db/repositories/nutritionRepository';
import { addXpToProfil } from '@/db/repositories/profilRepository';
import { useSessionStore } from '@/state/sessionStore';
import { useUpdateStore } from '@/state/updateStore';
import { UpdateBanner } from '@/features/updates/components/UpdateBanner';
import { strings } from '@/shared/strings';
import { theme } from '@/shared/theme';
import { getProgressionToNextRang } from '@/domain/ranks';
import { XP } from '@/domain/xp';
import type {
  ActivitePlanning,
  ObjectifNutritionnel,
  OnboardingProgression,
  Seance,
  SeanceType,
} from '@/db/repositories/types';
import type { RootStackParamList, MainTabParamList } from '@/app/navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const today = new Date().toISOString().split('T')[0] ?? '';

export function HomeScreen({ navigation }: Props) {
  const { profile, loadProfile } = useProfileStore();
  const { startSession } = useSessionStore();
  const { update, dismissed, checkOnce, dismiss } = useUpdateStore();
  const [seanceTypes, setSeanceTypes] = useState<SeanceType[]>([]);
  const [interruptedSeance, setInterruptedSeance] = useState<Seance | null>(null);
  const [activiteJour, setActiviteJour] = useState<ActivitePlanning | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingProgression | null>(null);
  const [nutritionObjectif, setNutritionObjectif] = useState<ObjectifNutritionnel | null>(null);
  const [nutritionValidated, setNutritionValidated] = useState(false);
  const [seanceZeroFaite, setSeanceZeroFaite] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [types, enCours, activite, prog, nutritionObjt, nutritionVal, nbZero] = await Promise.all(
      [
        getAllSeanceTypes(),
        getSeanceEnCours(),
        getActiviteAujourdhui().catch(() => null),
        getOnboardingProgression().catch(() => null),
        getObjectifNutritionnel().catch(() => null),
        getValidationAujourdhui(today).catch(() => false),
        countSeanceZeroCompletees().catch(() => 0),
      ],
    );
    setSeanceTypes(types);
    setInterruptedSeance(enCours);
    setActiviteJour(activite);
    setOnboarding(prog);
    setNutritionObjectif(nutritionObjt);
    setNutritionValidated(nutritionVal);
    setSeanceZeroFaite(nbZero > 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  // Vérification de mise à jour au démarrage — non bloquante, une fois par session.
  useEffect(() => {
    void checkOnce();
  }, [checkOnce]);

  const handleStart = async (seanceType: SeanceType) => {
    const seance = await createSeance(seanceType.id);
    const exercises = await getExercicesAvecConfig(seanceType.id);
    startSession(seance.id, seanceType.nom, exercises);
    navigation.navigate('WorkoutSession', {
      seanceId: seance.id,
      seanceTypeId: seanceType.id,
      seanceTypeName: seanceType.nom,
    });
  };

  const handleResume = async () => {
    if (interruptedSeance === null || interruptedSeance.seance_type_id === null) return;
    const seanceType = seanceTypes.find((s) => s.id === interruptedSeance.seance_type_id);
    if (seanceType === undefined) return;

    const [exercises, doneCounts] = await Promise.all([
      getExercicesAvecConfig(interruptedSeance.seance_type_id),
      countSeriesParExercice(interruptedSeance.id),
    ]);
    startSession(interruptedSeance.id, seanceType.nom, exercises, doneCounts);
    navigation.navigate('WorkoutSession', {
      seanceId: interruptedSeance.id,
      seanceTypeId: interruptedSeance.seance_type_id,
      seanceTypeName: seanceType.nom,
    });
  };

  const handleAbandon = () => {
    if (interruptedSeance === null) return;
    Alert.alert(strings.workout.abandonConfirmTitle, strings.workout.abandonConfirmBody, [
      { text: strings.workout.abandonConfirmNo, style: 'cancel' },
      {
        text: strings.workout.abandonConfirmYes,
        style: 'destructive',
        onPress: async () => {
          await abandonSeance(interruptedSeance.id);
          setInterruptedSeance(null);
        },
      },
    ]);
  };

  const handleNutritionToggle = async () => {
    const newValue = !nutritionValidated;
    setNutritionValidated(newValue);
    await setValidationAujourdhui(today, newValue);
    if (newValue) {
      await addXpToProfil(XP.NUTRITION_QUOTIDIENNE);
      await loadProfile();
    }
  };

  const hour = new Date().getHours();
  const greeting =
    hour >= 18
      ? strings.home.greetingEvening.replace('{prenom}', profile?.prenom ?? '')
      : strings.home.greeting.replace('{prenom}', profile?.prenom ?? '');

  const seanceZero = seanceTypes.find((s) => s.is_seance_zero);
  const mainPrograms = seanceTypes.filter((s) => !s.is_seance_zero);

  const rankProgression = profile !== null ? getProgressionToNextRang(profile.xp_total) : null;

  const onboardingModules = onboarding
    ? [
        {
          key: 'mensurations' as const,
          done: onboarding.mensurations_configure,
          label: strings.gamification.modules.mensurations.label,
          accroche: strings.gamification.modules.mensurations.accroche,
          xpLabel: strings.gamification.modules.mensurations.xp,
          onPress: () => navigation.navigate('AddMeasurement'),
        },
        {
          key: 'rappels' as const,
          done: onboarding.rappels_configure,
          label: strings.gamification.modules.rappels.label,
          accroche: strings.gamification.modules.rappels.accroche,
          xpLabel: strings.gamification.modules.rappels.xp,
          onPress: () => navigation.navigate('Reminders'),
        },
        {
          key: 'nutrition' as const,
          done: onboarding.nutrition_configure,
          label: strings.gamification.modules.nutrition.label,
          accroche: strings.gamification.modules.nutrition.accroche,
          xpLabel: strings.gamification.modules.nutrition.xp,
          onPress: () => navigation.navigate('NutritionSetup'),
        },
        {
          key: 'planning' as const,
          done: onboarding.planning_configure,
          label: strings.gamification.modules.planning.label,
          accroche: strings.gamification.modules.planning.accroche,
          xpLabel: strings.gamification.modules.planning.xp,
          onPress: () => navigation.navigate('MacroPlanning'),
        },
      ]
    : [];

  const pendingModules = onboardingModules.filter((m) => !m.done);
  const showOnboarding = pendingModules.length > 0;

  if (loading) {
    return (
      <Screen paddingHorizontal={0}>
        <View style={styles.center}>
          <Text variant="body" color="textSecondary">
            {strings.common.loading}
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen paddingHorizontal={0}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="headingLarge" style={styles.greeting}>
          {greeting}
        </Text>

        {/* Bannière de mise à jour (lot 8) — non intrusive, fermable */}
        {update !== null && !dismissed && (
          <UpdateBanner
            version={update.version}
            onOpenNotes={() => navigation.navigate('ReleaseNotes')}
            onUpdate={() => void Linking.openURL(update.actionUrl)}
            onDismiss={dismiss}
          />
        )}

        {/* Rang + XP + Streak */}
        {profile !== null && rankProgression !== null && (
          <Card variant="surface" style={styles.statsCard}>
            <View style={styles.statsRow}>
              {/* Rang */}
              <View style={styles.statItem}>
                <Text style={styles.statBadge}>{rankProgression.current.key}</Text>
                <Text style={styles.statLabel}>{rankProgression.current.titre}</Text>
              </View>
              {/* Séparateur */}
              <View style={styles.statDivider} />
              {/* Streak */}
              <View style={styles.statItem}>
                <Text style={styles.statValue}>🔥 {profile.streak_courant}</Text>
                <Text style={styles.statLabel}>{strings.gamification.streakLabel}</Text>
              </View>
              {/* Séparateur */}
              <View style={styles.statDivider} />
              {/* XP */}
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile.xp_total}</Text>
                <Text style={styles.statLabel}>{strings.gamification.xpLabel}</Text>
              </View>
            </View>
            {/* Barre de progression XP */}
            {rankProgression.next !== null && (
              <View style={styles.xpBarWrapper}>
                <View style={styles.xpBarBg}>
                  <View
                    style={[
                      styles.xpBarFill,
                      { width: `${rankProgression.progressPercent}%` as `${number}%` },
                    ]}
                  />
                </View>
                <Text style={styles.xpBarLabel}>
                  {strings.gamification.nextRank} : {rankProgression.next.titre} (
                  {rankProgression.next.xpMin} XP)
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Onboarding progressif */}
        {showOnboarding && (
          <Card variant="surface" style={styles.onboardingCard}>
            <Text variant="headingSmall">{strings.gamification.gagne_tes_xp}</Text>
            <Text variant="bodySmall" color="textSecondary">
              {strings.gamification.progression
                .replace('{done}', String(onboardingModules.length - pendingModules.length))
                .replace('{total}', String(onboardingModules.length))
                .replace('{s}', onboardingModules.length > 1 ? 's' : '')}
            </Text>
            {pendingModules.map((m) => (
              <TouchableOpacity key={m.key} onPress={m.onPress} style={styles.onboardingRow}>
                <View style={styles.onboardingInfo}>
                  <Text style={styles.onboardingLabel}>{m.label}</Text>
                  <Text style={styles.onboardingAccroche}>{m.accroche}</Text>
                </View>
                <Text style={styles.onboardingXp}>{m.xpLabel}</Text>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Activité du jour (macro-planning) */}
        {activiteJour !== null && (
          <ActivityCard activite={activiteJour} onAddRun={() => navigation.navigate('AddRun')} />
        )}

        {/* Nutrition du jour */}
        {nutritionObjectif !== null && (
          <NutritionCard
            objectif={nutritionObjectif}
            validated={nutritionValidated}
            onToggle={handleNutritionToggle}
          />
        )}

        {/* Bannière reprise séance interrompue */}
        {interruptedSeance !== null && (
          <Card variant="elevated" style={styles.resumeCard}>
            <Text variant="headingSmall" color="warning">
              {strings.home.resumeBanner}
            </Text>
            <Text variant="bodySmall" color="textSecondary" style={styles.resumeSubtitle}>
              {seanceTypes.find((s) => s.id === interruptedSeance.seance_type_id)?.nom ?? ''}
            </Text>
            <View style={styles.resumeActions}>
              <Button
                label={strings.home.resumeAction}
                variant="primary"
                size="sm"
                onPress={handleResume}
                style={styles.resumeBtn}
              />
              <Button
                label={strings.home.abandonAction}
                variant="ghost"
                size="sm"
                onPress={handleAbandon}
              />
            </View>
          </Card>
        )}

        {/* Séance Zéro — masquée une fois complétée */}
        {seanceZero !== undefined && !seanceZeroFaite && (
          <View style={styles.section}>
            <Card variant="elevated" style={styles.seanceZeroCard}>
              <View style={styles.seanceZeroHeader}>
                <View>
                  <Text variant="headingSmall">{strings.home.seanceZeroLabel}</Text>
                  <Text variant="bodySmall" color="textSecondary">
                    {strings.home.seanceZeroSubtitle}
                  </Text>
                </View>
              </View>
              {seanceZero.description !== null && (
                <Text variant="bodySmall" color="textSecondary" style={styles.seanceZeroDesc}>
                  {seanceZero.description}
                </Text>
              )}
              <Button
                label={strings.home.startSeance}
                fullWidth
                onPress={() => void handleStart(seanceZero)}
              />
            </Card>
          </View>
        )}

        {/* Programmes */}
        {mainPrograms.length > 0 && (
          <View style={styles.section}>
            <Text variant="label" color="textMuted" style={styles.sectionTitle}>
              {strings.home.programs}
            </Text>
            {mainPrograms.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onStart={() => void handleStart(program)}
                onEdit={() =>
                  navigation.navigate('ProgramEdit', {
                    seanceTypeId: program.id,
                    seanceTypeName: program.nom,
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function NutritionCard({
  objectif,
  validated,
  onToggle,
}: {
  objectif: ObjectifNutritionnel;
  validated: boolean;
  onToggle: () => void;
}) {
  return (
    <Card variant="surface" style={nutritionStyles.card}>
      <View style={nutritionStyles.header}>
        <Text variant="headingSmall">🍽️ {strings.nutrition.todayTitle}</Text>
        <Text variant="bodySmall" color="textSecondary">
          {objectif.kcal_cible} {strings.nutrition.kcalUnit} · {objectif.proteines_g}{' '}
          {strings.nutrition.proteinesUnit}
        </Text>
      </View>
      <Button
        label={validated ? strings.nutrition.unvalidate : strings.nutrition.validate}
        variant={validated ? 'secondary' : 'primary'}
        size="sm"
        onPress={onToggle}
      />
      {validated && (
        <Text style={nutritionStyles.validatedLabel}>{strings.nutrition.validated}</Text>
      )}
    </Card>
  );
}

const nutritionStyles = StyleSheet.create({
  card: { gap: theme.spacing.sm },
  header: { gap: 2 },
  validatedLabel: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
  },
});

function ActivityCard({
  activite,
  onAddRun,
}: {
  activite: ActivitePlanning;
  onAddRun: () => void;
}) {
  if (activite === 'repos') {
    return (
      <Card variant="surface" style={activityStyles.card}>
        <Text variant="headingSmall">{strings.planning.todayRest}</Text>
        <Text variant="bodySmall" color="textSecondary">
          {strings.planning.todayRestMsg}
        </Text>
      </Card>
    );
  }
  if (activite === 'course') {
    return (
      <Card variant="elevated" style={activityStyles.card}>
        <Text variant="headingSmall" color="primary">
          🏃 {strings.planning.todayActivity}
        </Text>
        <Text variant="bodySmall" color="textSecondary">
          {strings.planning.todayRunMsg}
        </Text>
        <Button label={strings.running.addRun} size="sm" onPress={onAddRun} />
      </Card>
    );
  }
  return (
    <Card variant="elevated" style={activityStyles.card}>
      <Text variant="headingSmall" color="primary">
        💪 {strings.planning.todayActivity}
      </Text>
      <Text variant="bodySmall" color="textSecondary">
        {strings.planning.todayMuscuMsg}
      </Text>
    </Card>
  );
}

const activityStyles = StyleSheet.create({
  card: { gap: theme.spacing.sm },
});

function ProgramCard({
  program,
  onStart,
  onEdit,
}: {
  program: SeanceType;
  onStart: () => void;
  onEdit: () => void;
}) {
  return (
    <Card variant="surface" style={styles.programCard}>
      <View style={styles.programInfo}>
        <Text variant="headingSmall">{program.nom}</Text>
        {program.description !== null && (
          <Text variant="bodySmall" color="textSecondary">
            {program.description}
          </Text>
        )}
      </View>
      <View style={styles.programRow}>
        <Button label={strings.programs.editButton} size="sm" variant="ghost" onPress={onEdit} />
        <Button
          label={strings.home.startSeance}
          size="sm"
          onPress={onStart}
          style={styles.startBtn}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.lg,
  },
  greeting: {
    marginBottom: theme.spacing.xs,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    marginBottom: theme.spacing.xs,
  },
  // Stats (rang / streak / XP)
  statsCard: { gap: theme.spacing.sm },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: theme.colors.border,
  },
  statBadge: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  xpBarWrapper: { gap: 4 },
  xpBarBg: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  xpBarLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'right',
  },
  // Onboarding
  onboardingCard: { gap: theme.spacing.sm },
  onboardingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  onboardingInfo: { flex: 1, gap: 2 },
  onboardingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  onboardingAccroche: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  onboardingXp: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  // Reprise
  resumeCard: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warning,
    gap: theme.spacing.xs,
  },
  resumeSubtitle: {
    marginBottom: theme.spacing.sm,
  },
  resumeActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  resumeBtn: {
    flex: 1,
  },
  seanceZeroCard: {
    gap: theme.spacing.md,
  },
  seanceZeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seanceZeroDesc: {
    lineHeight: 20,
  },
  programCard: {
    marginBottom: 0,
    gap: theme.spacing.md,
  },
  programInfo: {
    gap: theme.spacing.xs,
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  startBtn: {
    flex: 1,
  },
});
