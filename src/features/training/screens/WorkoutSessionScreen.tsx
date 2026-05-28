import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
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

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

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
    reorderRemainingExercices,
  } = useSessionStore();

  const [saving, setSaving] = useState(false);

  // --- Chronomètre de repos ---
  const [restActive, setRestActive] = useState(false);
  const [restElapsed, setRestElapsed] = useState(0);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (restIntervalRef.current !== null) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, []);

  const handleToggleTimer = () => {
    if (restActive) {
      if (restIntervalRef.current !== null) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
      setRestActive(false);
      setRestElapsed(0);
    } else {
      setRestActive(true);
      setRestElapsed(0);
      restIntervalRef.current = setInterval(() => {
        setRestElapsed((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (restIntervalRef.current !== null) {
      clearInterval(restIntervalRef.current);
      restIntervalRef.current = null;
    }
    setRestActive(false);
    setRestElapsed(0);
  };

  // --- Modal de réorganisation des exercices restants ---
  const [reorderVisible, setReorderVisible] = useState(false);
  const [reorderList, setReorderList] = useState<ExerciceAvecConfig[]>([]);

  const openReorder = () => {
    if (session === null) return;
    const remaining = session.exercises.slice(session.currentExerciseIndex + 1);
    setReorderList([...remaining]);
    setReorderVisible(true);
  };

  const handleReorderMoveUp = (index: number) => {
    if (index === 0) return;
    setReorderList((prev) => {
      const next = [...prev];
      const a = next[index - 1];
      const b = next[index];
      if (a === undefined || b === undefined) return prev;
      next[index - 1] = b;
      next[index] = a;
      return next;
    });
  };

  const handleReorderMoveDown = (index: number) => {
    setReorderList((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      const a = next[index];
      const b = next[index + 1];
      if (a === undefined || b === undefined) return prev;
      next[index] = b;
      next[index + 1] = a;
      return next;
    });
  };

  const handleReorderDone = () => {
    reorderRemainingExercices(reorderList);
    setReorderVisible(false);
  };

  // --- Logique séance ---
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
    stopTimer(); // stoppe le chrono entre les séries
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
    stopTimer();
    advanceToNextExercise();
  };

  const handleFinish = async () => {
    setSaving(true);
    stopTimer();
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
          stopTimer();
          await completeSeance(seanceId, 0);
          clearSession();
          navigation.goBack();
        },
      },
    ]);
  };

  const totalSeriesAll = session.exercises.reduce((acc, e) => acc + e.series_cible, 0);
  const doneSeriesAll = Object.values(session.completedSeriesCount).reduce((acc, n) => acc + n, 0);

  // Exercices restants (après le courant) pour la réorganisation
  const remainingCount = session.exercises.length - session.currentExerciseIndex - 1;

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
          {/* Nom exercice */}
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

          {/* Indicateur de séries (points) */}
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

          {/* Info série courante */}
          <View style={styles.serieInfo}>
            <Text variant="headingSmall" color="primary">
              {allDone ? strings.workout.allSeriesDone : serieLabel}
            </Text>
            <Text variant="bodySmall" color="textMuted">
              {targetLabel}
            </Text>
          </View>

          {/* Formulaire de saisie — clé pour forcer le remount à chaque série */}
          {!allDone && (
            <SerieInputForm
              key={`${session.currentExerciseIndex}-${completedForCurrent}`}
              exerciceConfig={currentEx}
              saving={saving}
              onValidate={handleValidateSerie}
            />
          )}

          {/* Boutons de navigation (quand toutes les séries sont faites) */}
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

        {/* Chronomètre de repos — barre fixe avant les exercices restants */}
        <View style={styles.timerBar}>
          {restActive ? (
            <>
              <Text variant="numeric" style={styles.timerText}>
                {formatTime(restElapsed)}
              </Text>
              <Pressable onPress={handleToggleTimer} style={styles.timerStopBtn}>
                <Text variant="caption" color="textSecondary">
                  {strings.restTimer.stop}
                </Text>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={handleToggleTimer} style={styles.timerStartBtn}>
              <Text variant="caption" color="textMuted">
                ⏱ {strings.restTimer.label}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Liste des exercices restants + bouton réorganiser */}
        {session.exercises.length > 1 && (
          <View style={styles.upcomingContainer}>
            {remainingCount > 1 && (
              <Pressable onPress={openReorder} style={styles.reorderBtn}>
                <Text variant="caption" color="textMuted">
                  {strings.reorder.button} ↕
                </Text>
              </Pressable>
            )}
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

      {/* Modal de réorganisation */}
      <Modal visible={reorderVisible} transparent animationType="slide">
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <View style={modalStyles.header}>
              <Text variant="headingSmall">{strings.reorder.title}</Text>
              <Pressable onPress={handleReorderDone} hitSlop={8}>
                <Text variant="bodySmall" color="primary">
                  {strings.reorder.done}
                </Text>
              </Pressable>
            </View>
            <Text variant="caption" color="textMuted" style={modalStyles.hint}>
              {strings.reorder.hint}
            </Text>
            <FlatList
              data={reorderList}
              keyExtractor={(item) => String(item.exercice.id)}
              style={modalStyles.list}
              renderItem={({ item, index }) => (
                <View style={modalStyles.row}>
                  <Text variant="body" style={modalStyles.rowName} numberOfLines={1}>
                    {item.exercice.nom}
                  </Text>
                  <View style={modalStyles.arrows}>
                    <Pressable
                      onPress={() => handleReorderMoveUp(index)}
                      disabled={index === 0}
                      hitSlop={8}
                      style={[modalStyles.arrowBtn, index === 0 ? modalStyles.arrowDisabled : null]}
                    >
                      <Text variant="bodySmall" color={index === 0 ? 'textMuted' : 'textSecondary'}>
                        ↑
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleReorderMoveDown(index)}
                      disabled={index === reorderList.length - 1}
                      hitSlop={8}
                      style={[
                        modalStyles.arrowBtn,
                        index === reorderList.length - 1 ? modalStyles.arrowDisabled : null,
                      ]}
                    >
                      <Text
                        variant="bodySmall"
                        color={index === reorderList.length - 1 ? 'textMuted' : 'textSecondary'}
                      >
                        ↓
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Formulaire de saisie d'une série
// Monté avec une clé unique par série/exercice — React recrée le composant
// et son state local est réinitialisé sans useEffect de reset.
// ---------------------------------------------------------------------------
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
      {/* Charge (exercices avec charge uniquement) */}
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

      {/* Répétitions / durée */}
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

      {/* Difficulté subjective (poids du corps uniquement) */}
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

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
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
  // --- Timer ---
  timerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
    minHeight: 44,
  },
  timerText: {
    color: theme.colors.primary,
    fontSize: 22,
    letterSpacing: 2,
  },
  timerStopBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timerStartBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  // --- Upcoming exercises strip ---
  upcomingContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  reorderBtn: {
    alignSelf: 'flex-end',
    paddingVertical: theme.spacing.xs,
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

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.surfaceElevated,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  hint: {
    marginBottom: theme.spacing.md,
  },
  list: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  rowName: {
    flex: 1,
  },
  arrows: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  arrowDisabled: {
    opacity: 0.3,
  },
});
