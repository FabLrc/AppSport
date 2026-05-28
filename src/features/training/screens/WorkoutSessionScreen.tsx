import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { Button } from '@/shared/components/Button';
import { useSessionStore } from '@/state/sessionStore';
import { createSerie } from '@/db/repositories/seriePerformanceRepository';
import { completeSeance, countSeanceZeroCompletees } from '@/db/repositories/seanceRepository';
import { strings } from '@/shared/strings';
import { theme } from '@/shared/theme';
import type { ExerciceAvecConfig, DifficulteSubjective } from '@/db/repositories/types';
import type { RootStackParamList } from '@/app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutSession'>;

const XP_SEANCE = 100;
const XP_SEANCE_ZERO_FIRST = 80;

export function WorkoutSessionScreen({ navigation, route }: Props) {
  const { seanceId } = route.params;
  const session = useSessionStore((s) => s.session);
  const {
    recordSerieCompleted,
    advanceToNextExercise,
    clearSession,
    allSerisDoneForCurrent,
    isLastExercice,
    currentExercice,
  } = useSessionStore();

  const [saving, setSaving] = useState(false);

  const currentEx = currentExercice();
  const allDone = allSerisDoneForCurrent();
  const isLast = isLastExercice();

  if (session === null || currentEx === null) {
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

  const { exercice, series_cible, reps_min, reps_max, duree_seconde_cible } = currentEx;
  const completedForCurrent = session.completedSeriesCount[exercice.id] ?? 0;

  const targetLabel =
    duree_seconde_cible !== null
      ? strings.workout.targetSec
          .replace('{min}', String(reps_min))
          .replace('{max}', String(reps_max))
      : strings.workout.targetReps
          .replace('{min}', String(reps_min))
          .replace('{max}', String(reps_max));

  const serieLabel = strings.workout.serieLabel
    .replace('{current}', String(completedForCurrent + 1))
    .replace('{total}', String(series_cible));

  const handleValidateSerie = async (
    charge: number | null,
    reps: number,
    difficulte: DifficulteSubjective | null,
  ) => {
    setSaving(true);
    try {
      await createSerie({
        seance_id: seanceId,
        exercice_id: exercice.id,
        ordre: completedForCurrent + 1,
        charge_kg: charge,
        reps_realisees: reps,
        difficulte_subjective: difficulte,
      });
      recordSerieCompleted(exercice.id);
    } finally {
      setSaving(false);
    }
  };

  const handleNextExercise = () => {
    advanceToNextExercise();
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const allBodyweight = session.exercises.every(
        (e) => e.exercice.mode_charge === 'poids_corps',
      );
      const prevCount = allBodyweight ? await countSeanceZeroCompletees() : 1;
      const xpEarned = allBodyweight && prevCount === 0 ? XP_SEANCE_ZERO_FIRST : XP_SEANCE;
      await completeSeance(seanceId, xpEarned);
      clearSession();
      navigation.replace('WorkoutSummary', {
        seanceId,
        xpEarned,
        isSeanceZero: allBodyweight && prevCount === 0,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAbandon = () => {
    Alert.alert(strings.workout.abandonConfirmTitle, strings.workout.abandonConfirmBody, [
      { text: strings.workout.abandonConfirmNo, style: 'cancel' },
      {
        text: strings.workout.abandonConfirmYes,
        style: 'destructive',
        onPress: async () => {
          await completeSeance(seanceId, 0);
          clearSession();
          navigation.goBack();
        },
      },
    ]);
  };

  const totalSeriesAll = session.exercises.reduce((acc, e) => acc + e.series_cible, 0);
  const doneSeriesAll = Object.values(session.completedSeriesCount).reduce((acc, n) => acc + n, 0);

  return (
    <Screen paddingHorizontal={0}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleAbandon} style={styles.closeBtn} hitSlop={8}>
            <Text variant="bodySmall" color="textMuted">
              ✕
            </Text>
          </Pressable>
          <Text variant="headingSmall" style={styles.headerTitle}>
            {session.seanceTypeName}
          </Text>
          <Text variant="caption" color="textMuted">
            {doneSeriesAll}/{totalSeriesAll}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Exercise name + description */}
          <View style={styles.exerciseHeader}>
            <Text variant="display" style={styles.exerciseName}>
              {exercice.nom}
            </Text>
            {exercice.description !== null && (
              <Text variant="bodySmall" color="textSecondary" style={styles.exerciseDesc}>
                {exercice.description}
              </Text>
            )}
          </View>

          {/* Series progress dots */}
          <View style={styles.seriesDots}>
            {Array.from({ length: series_cible }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < completedForCurrent ? styles.dotDone : null,
                  i === completedForCurrent && !allDone ? styles.dotActive : null,
                ]}
              />
            ))}
          </View>

          {/* Serie info */}
          <View style={styles.serieInfo}>
            <Text variant="headingSmall" color="primary">
              {allDone ? strings.workout.allSeriesDone : serieLabel}
            </Text>
            <Text variant="bodySmall" color="textMuted">
              {targetLabel}
            </Text>
          </View>

          {/* Form de saisie — clé pour forcer le remount à chaque nouvelle série */}
          {!allDone && (
            <SerieInputForm
              key={`${session.currentExerciseIndex}-${completedForCurrent}`}
              exerciceConfig={currentEx}
              saving={saving}
              onValidate={handleValidateSerie}
            />
          )}

          {/* Navigation buttons when series done */}
          {allDone && (
            <View style={styles.navButtons}>
              {!isLast ? (
                <Button
                  label={strings.workout.nextExercise}
                  fullWidth
                  onPress={handleNextExercise}
                />
              ) : (
                <Button
                  label={strings.workout.finishWorkout}
                  fullWidth
                  onPress={handleFinish}
                  loading={saving}
                />
              )}
            </View>
          )}
        </ScrollView>

        {/* Upcoming exercises */}
        {session.exercises.length > 1 && (
          <View style={styles.upcomingList}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {session.exercises.map((ex, idx) => {
                const done = session.completedSeriesCount[ex.exercice.id] ?? 0;
                const isCurrent = idx === session.currentExerciseIndex;
                const isComplete = done >= ex.series_cible;
                return (
                  <View
                    key={ex.exercice.id}
                    style={[
                      styles.upcomingItem,
                      isCurrent ? styles.upcomingItemActive : null,
                      isComplete ? styles.upcomingItemDone : null,
                    ]}
                  >
                    <Text
                      variant="caption"
                      color={isCurrent ? 'primary' : isComplete ? 'textMuted' : 'textSecondary'}
                      numberOfLines={1}
                    >
                      {ex.exercice.nom}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

// Formulaire de saisie d'une série. Monté avec une clé unique par série/exercice :
// quand la clé change, React recrée le composant et son state local est réinitialisé.
function SerieInputForm({
  exerciceConfig,
  saving,
  onValidate,
}: {
  exerciceConfig: ExerciceAvecConfig;
  saving: boolean;
  onValidate: (charge: number | null, reps: number, diff: DifficulteSubjective | null) => void;
}) {
  const { exercice, duree_seconde_cible } = exerciceConfig;
  const isPoidsCorp = exercice.mode_charge === 'poids_corps';
  const isTimed = duree_seconde_cible !== null;

  const [chargeInput, setChargeInput] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [difficulte, setDifficulte] = useState<DifficulteSubjective | null>(null);

  const canValidate = () => {
    if (saving) return false;
    if (!isPoidsCorp) {
      const charge = parseFloat(chargeInput.replace(',', '.'));
      if (isNaN(charge) || charge < 0) return false;
    }
    const reps = parseInt(repsInput, 10);
    return !isNaN(reps) && reps > 0;
  };

  const handlePress = () => {
    if (!canValidate()) return;
    const reps = parseInt(repsInput, 10);
    const charge = isPoidsCorp ? null : parseFloat(chargeInput.replace(',', '.'));
    onValidate(charge ?? null, reps, difficulte);
  };

  return (
    <View style={formStyles.container}>
      {/* Charge input (weighted only) */}
      {!isPoidsCorp && (
        <View style={formStyles.inputGroup}>
          <Text variant="label" color="textSecondary">
            {strings.workout.chargeLabel}
          </Text>
          <TextInput
            style={formStyles.input}
            placeholder="0"
            placeholderTextColor={theme.colors.textMuted}
            value={chargeInput}
            onChangeText={setChargeInput}
            keyboardType="decimal-pad"
            returnKeyType="next"
            selectTextOnFocus
          />
        </View>
      )}

      {/* Reps / duration */}
      <View style={formStyles.inputGroup}>
        <Text variant="label" color="textSecondary">
          {isTimed ? strings.workout.durationLabel : strings.workout.repsLabel}
        </Text>
        <TextInput
          style={formStyles.input}
          placeholder={isTimed ? '30' : '10'}
          placeholderTextColor={theme.colors.textMuted}
          value={repsInput}
          onChangeText={setRepsInput}
          keyboardType="number-pad"
          returnKeyType="done"
          selectTextOnFocus
          autoFocus
        />
      </View>

      {/* Difficulty (bodyweight only) */}
      {isPoidsCorp && (
        <View style={formStyles.difficulteGroup}>
          <Text variant="label" color="textSecondary">
            {strings.workout.difficulte.label}
          </Text>
          <View style={formStyles.difficulteRow}>
            {(
              [
                {
                  key: 'facile',
                  label: strings.workout.difficulte.facile,
                  color: theme.colors.success,
                },
                {
                  key: 'correct',
                  label: strings.workout.difficulte.correct,
                  color: theme.colors.warning,
                },
                {
                  key: 'difficile',
                  label: strings.workout.difficulte.difficile,
                  color: theme.colors.error,
                },
              ] as const
            ).map(({ key, label, color }) => (
              <Pressable
                key={key}
                onPress={() => setDifficulte(difficulte === key ? null : key)}
                style={[
                  formStyles.difficulteBtn,
                  difficulte === key ? { borderColor: color, backgroundColor: `${color}22` } : null,
                ]}
              >
                <Text
                  variant="caption"
                  style={{ color: difficulte === key ? color : theme.colors.textSecondary }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <Button
        label={strings.workout.validateSerie}
        fullWidth
        onPress={handlePress}
        disabled={!canValidate()}
        loading={saving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  exerciseHeader: {
    gap: theme.spacing.sm,
  },
  exerciseName: {
    lineHeight: 40,
  },
  exerciseDesc: {
    lineHeight: 20,
  },
  seriesDots: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.border,
  },
  dotActive: { backgroundColor: theme.colors.primary },
  dotDone: { backgroundColor: theme.colors.success },
  serieInfo: {
    gap: theme.spacing.xs,
  },
  navButtons: {
    gap: theme.spacing.md,
  },
  upcomingList: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
  upcomingItem: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    maxWidth: 120,
  },
  upcomingItemActive: {
    backgroundColor: theme.colors.primarySoft,
  },
  upcomingItemDone: {
    opacity: 0.4,
  },
});

const formStyles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
  },
  inputGroup: {
    gap: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    minHeight: 72,
  },
  difficulteGroup: {
    gap: theme.spacing.sm,
  },
  difficulteRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  difficulteBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
});
