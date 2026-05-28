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
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
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
const REST_DURATION = 90; // secondes — modifiable sans impact sur l'UX

// Dimensions du cadran SVG
const TIMER_SIZE = 260;
const TIMER_R = 100;
const TIMER_STROKE = 14;
const TIMER_C = TIMER_SIZE / 2;
const TIMER_CIRC = 2 * Math.PI * TIMER_R;

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
  const [restMode, setRestMode] = useState<'idle' | 'counting' | 'done'>('idle');
  const [restRemaining, setRestRemaining] = useState(REST_DURATION);
  const [restNextLabel, setRestNextLabel] = useState('');
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Ref miroir pour lire le décompte sans problème de closure dans l'interval
  const restRemainingRef = useRef(REST_DURATION);

  useEffect(() => {
    return () => {
      if (restIntervalRef.current !== null) clearInterval(restIntervalRef.current);
    };
  }, []);

  const startRestTimer = (nextLabel: string) => {
    if (restIntervalRef.current !== null) clearInterval(restIntervalRef.current);
    setRestNextLabel(nextLabel);
    restRemainingRef.current = REST_DURATION;
    setRestRemaining(REST_DURATION);
    setRestMode('counting');
    restIntervalRef.current = setInterval(() => {
      restRemainingRef.current -= 1;
      setRestRemaining(restRemainingRef.current);
      if (restRemainingRef.current <= 0) {
        if (restIntervalRef.current !== null) clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
        setRestMode('done');
      }
    }, 1000);
  };

  const skipRestTimer = () => {
    if (restIntervalRef.current !== null) {
      clearInterval(restIntervalRef.current);
      restIntervalRef.current = null;
    }
    restRemainingRef.current = REST_DURATION;
    setRestMode('idle');
    setRestRemaining(REST_DURATION);
  };

  const stopTimer = () => {
    if (restIntervalRef.current !== null) {
      clearInterval(restIntervalRef.current);
      restIntervalRef.current = null;
    }
    restRemainingRef.current = REST_DURATION;
    setRestMode('idle');
    setRestRemaining(REST_DURATION);
  };

  // --- Modal de réorganisation ---
  const [reorderVisible, setReorderVisible] = useState(false);
  const [reorderList, setReorderList] = useState<ExerciceAvecConfig[]>([]);

  const openReorder = () => {
    if (session === null) return;
    setReorderList([...session.exercises.slice(session.currentExerciseIndex + 1)]);
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
    // Calculer le prochain label AVANT la mise à jour du store
    const afterCount = completedForCurrent + 1;
    const willFinishExercise = afterCount >= series_cible;
    const currentlyLastEx = isLastExercice();

    let nextLabel = '';
    if (!willFinishExercise) {
      nextLabel = strings.restTimer.nextSerie
        .replace('{current}', String(afterCount + 1))
        .replace('{total}', String(series_cible));
    } else if (!currentlyLastEx) {
      const nextEx = session.exercises[session.currentExerciseIndex + 1];
      if (nextEx !== undefined) {
        nextLabel = strings.restTimer.nextExercice.replace('{nom}', nextEx.exercice.nom);
      }
    }

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

      // Démarre le repos, sauf après la toute dernière série de la séance
      if (!(willFinishExercise && currentlyLastEx)) {
        startRestTimer(nextLabel);
      }
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
          {/* Nom exercice + historique */}
          <View style={styles.exerciseHeader}>
            <View style={styles.exerciseNameRow}>
              <Text variant="display" style={styles.exerciseName}>
                {exercice.nom}
              </Text>
              <Pressable
                onPress={() =>
                  navigation.navigate('ExerciceHistory', {
                    exerciceId: exercice.id,
                    exerciceNom: exercice.nom,
                  })
                }
                hitSlop={8}
                style={styles.historyBtn}
              >
                <Text variant="caption" color="textMuted">
                  📈
                </Text>
              </Pressable>
            </View>
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

          {/* Formulaire de saisie — clé pour forcer le remount */}
          {!allDone && (
            <SerieInputForm
              key={`${session.currentExerciseIndex}-${completedForCurrent}`}
              exerciceConfig={currentEx}
              saving={saving}
              onValidate={handleValidateSerie}
            />
          )}

          {/* Navigation (quand toutes les séries de l'exercice sont faites) */}
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
                  onPress={() => void handleFinish()}
                  loading={saving}
                />
              )}
            </View>
          )}
        </ScrollView>

        {/* Bande des exercices à venir */}
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

      {/* Overlay plein écran — chronomètre de repos */}
      <Modal
        visible={restMode !== 'idle'}
        animationType="fade"
        statusBarTranslucent
        transparent={false}
      >
        <RestTimerOverlay
          remaining={restRemaining}
          total={REST_DURATION}
          mode={restMode as 'counting' | 'done'}
          nextLabel={restNextLabel}
          seanceTypeName={session.seanceTypeName}
          onSkip={skipRestTimer}
        />
      </Modal>

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
// Overlay chronomètre de repos — cadran SVG physique
// ---------------------------------------------------------------------------
function RestTimerOverlay({
  remaining,
  total,
  mode,
  nextLabel,
  seanceTypeName,
  onSkip,
}: {
  remaining: number;
  total: number;
  mode: 'counting' | 'done';
  nextLabel: string;
  seanceTypeName: string;
  onSkip: () => void;
}) {
  const isDone = mode === 'done';
  const progress = remaining / total; // 1.0 → 0.0
  // L'arc se vide au fil du décompte ; quand terminé, on repasse à plein (couleur succès)
  const strokeDashoffset = isDone ? 0 : TIMER_CIRC * (1 - progress);

  const arcColor = isDone
    ? theme.colors.success
    : remaining > 30
      ? theme.colors.primary
      : remaining > 10
        ? theme.colors.warning
        : theme.colors.error;

  // 12 graduations comme un cadran de montre (majeures à 12h, 3h, 6h, 9h)
  const tickInnerEdge = TIMER_R - TIMER_STROKE / 2 - 1;
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const isMajor = i % 3 === 0;
    const angle = (i * 30 * Math.PI) / 180;
    const outerR = tickInnerEdge;
    const innerR = outerR - (isMajor ? 11 : 6);
    const x1 = TIMER_C + Math.sin(angle) * outerR;
    const y1 = TIMER_C - Math.cos(angle) * outerR;
    const x2 = TIMER_C + Math.sin(angle) * innerR;
    const y2 = TIMER_C - Math.cos(angle) * innerR;
    return (
      <Line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={theme.colors.border}
        strokeWidth={isMajor ? 2.5 : 1.5}
        strokeLinecap="round"
      />
    );
  });

  return (
    <View style={overlayStyles.screen}>
      {/* Nom de la séance en haut */}
      <Text variant="caption" color="textMuted" style={overlayStyles.sessionName}>
        {seanceTypeName}
      </Text>

      {/* Contenu centré */}
      <View style={overlayStyles.main}>
        {/* Label "REPOS" / "REPOS TERMINÉ" */}
        <Text variant="label" color="textMuted" style={overlayStyles.restLabel}>
          {isDone ? strings.restTimer.done.toUpperCase() : strings.restTimer.label}
        </Text>

        {/* Cadran SVG — texte inclus dans le SVG pour éviter les conflits de couche Android */}
        <View style={overlayStyles.dialWrapper}>
          <Svg width={TIMER_SIZE} height={TIMER_SIZE}>
            {/* Piste de fond */}
            <Circle
              cx={TIMER_C}
              cy={TIMER_C}
              r={TIMER_R}
              stroke={theme.colors.surface}
              strokeWidth={TIMER_STROKE}
              fill="none"
            />
            {/* Graduations */}
            {ticks}
            {/* Arc de décompte */}
            <Circle
              cx={TIMER_C}
              cy={TIMER_C}
              r={TIMER_R}
              stroke={arcColor}
              strokeWidth={TIMER_STROKE}
              fill="none"
              strokeDasharray={TIMER_CIRC}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${TIMER_C}, ${TIMER_C}`}
            />
            {/* Temps centré — dans le SVG pour rester dans la même couche native */}
            <SvgText
              x={TIMER_C}
              y={isDone ? TIMER_C + 12 : TIMER_C + 22}
              textAnchor="middle"
              fontSize={58}
              fontWeight="700"
              fill={arcColor}
            >
              {formatTime(remaining)}
            </SvgText>
            {/* Coche de fin */}
            {isDone && (
              <SvgText
                x={TIMER_C}
                y={TIMER_C + 46}
                textAnchor="middle"
                fontSize={20}
                fill={theme.colors.success}
              >
                ✓
              </SvgText>
            )}
          </Svg>
        </View>

        {/* Prochain exercice / série */}
        {nextLabel !== '' && (
          <Text variant="bodySmall" color="textSecondary" style={overlayStyles.nextLabel}>
            {nextLabel}
          </Text>
        )}
      </View>

      {/* Bouton Passer / Continuer */}
      <View style={overlayStyles.actions}>
        <Button
          label={isDone ? strings.restTimer.continue : strings.restTimer.skip}
          fullWidth
          variant={isDone ? 'primary' : 'ghost'}
          onPress={onSkip}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Formulaire de saisie d'une série
// Monté avec une clé unique — React recrée le composant et son state local
// est réinitialisé sans useEffect de reset.
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
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  exerciseName: {
    flex: 1,
    lineHeight: 40,
  },
  historyBtn: {
    paddingTop: theme.spacing.sm,
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

const overlayStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxxl,
  },
  sessionName: {
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xl,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
    width: '100%',
  },
  restLabel: {
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  dialWrapper: {
    width: TIMER_SIZE,
    height: TIMER_SIZE,
  },
  doneCheck: {
    color: theme.colors.success,
    marginTop: 4,
  },
  nextLabel: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  actions: {
    width: '100%',
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
