import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { useProfileStore } from '@/state/profileStore';
import { getAllSeanceTypes } from '@/db/repositories/seanceTypeRepository';
import { createSeance, getSeanceEnCours, abandonSeance } from '@/db/repositories/seanceRepository';
import { countSeriesParExercice } from '@/db/repositories/seriePerformanceRepository';
import { getExercicesAvecConfig } from '@/db/repositories/seanceTypeRepository';
import { useSessionStore } from '@/state/sessionStore';
import { strings } from '@/shared/strings';
import { theme } from '@/shared/theme';
import type { Seance, SeanceType } from '@/db/repositories/types';
import type { RootStackParamList, MainTabParamList } from '@/app/navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const { profile } = useProfileStore();
  const { startSession } = useSessionStore();
  const [seanceTypes, setSeanceTypes] = useState<SeanceType[]>([]);
  const [interruptedSeance, setInterruptedSeance] = useState<Seance | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [types, enCours] = await Promise.all([getAllSeanceTypes(), getSeanceEnCours()]);
    setSeanceTypes(types);
    setInterruptedSeance(enCours);
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, loadData]);

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

  const hour = new Date().getHours();
  const greeting =
    hour >= 18
      ? strings.home.greetingEvening.replace('{prenom}', profile?.prenom ?? '')
      : strings.home.greeting.replace('{prenom}', profile?.prenom ?? '');

  const seanceZero = seanceTypes.find((s) => s.is_seance_zero);
  const mainPrograms = seanceTypes.filter((s) => !s.is_seance_zero);

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

        {/* Séance Zéro */}
        {seanceZero !== undefined && (
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
                style={styles.startBtn}
                onPress={() => handleStart(seanceZero)}
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
                onStart={() => handleStart(program)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function ProgramCard({ program, onStart }: { program: SeanceType; onStart: () => void }) {
  return (
    <Card variant="surface" style={styles.programCard}>
      <View style={styles.programRow}>
        <View style={styles.programInfo}>
          <Text variant="headingSmall">{program.nom}</Text>
          {program.description !== null && (
            <Text variant="bodySmall" color="textSecondary">
              {program.description}
            </Text>
          )}
        </View>
        <Button label={strings.home.startSeance} size="sm" onPress={onStart} />
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
  startBtn: {},
  programCard: {
    marginBottom: 0,
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  programInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
});
