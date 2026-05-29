import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import {
  detecterSurchargeProgressive,
  type ExercicePerformance,
  type ProgressionSuggestion,
} from '@/domain/progressive-overload';
import { getSeanceById } from '@/db/repositories/seanceRepository';
import { getExercicesAvecConfig } from '@/db/repositories/seanceTypeRepository';
import { getSeriesParExercicePourSurcharge } from '@/db/repositories/seriePerformanceRepository';
import { addXpToProfil, updateStreakApresActivite } from '@/db/repositories/profilRepository';
import { useProfileStore } from '@/state/profileStore';
import { strings } from '@/shared/strings';
import { theme } from '@/shared/theme';
import type { RootStackParamList } from '@/app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutSummary'>;

export function WorkoutSummaryScreen({ navigation, route }: Props) {
  const { seanceId, xpEarned, isSeanceZero } = route.params;
  const { loadProfile } = useProfileStore();
  const [suggestions, setSuggestions] = useState<ProgressionSuggestion[]>([]);

  // Attribution XP et mise à jour streak au montage
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0] ?? '';
    Promise.all([addXpToProfil(xpEarned), updateStreakApresActivite(todayStr)])
      .then(() => loadProfile())
      .catch(() => undefined);
  }, [xpEarned, loadProfile]);

  // Calcul asynchrone des suggestions de surcharge progressive
  useEffect(() => {
    // Pas de suggestions pour la Séance Zéro (poids du corps, pas de charge à suivre)
    if (isSeanceZero) return;

    let active = true;
    void (async () => {
      const seance = await getSeanceById(seanceId);
      if (!active || seance === null || seance.seance_type_id === null) return;

      const [exercises, seriesMap] = await Promise.all([
        getExercicesAvecConfig(seance.seance_type_id),
        getSeriesParExercicePourSurcharge(seanceId),
      ]);

      const performances: ExercicePerformance[] = exercises.map((ex) => ({
        exercice_id: ex.exercice.id,
        exercice_nom: ex.exercice.nom,
        mode_charge: ex.exercice.mode_charge,
        variantes: ex.exercice.variantes,
        reps_max: ex.reps_max,
        series: seriesMap[ex.exercice.id] ?? [],
      }));

      if (!active) return;
      setSuggestions(detecterSurchargeProgressive(performances));
    })();

    return () => {
      active = false;
    };
  }, [seanceId, isSeanceZero]);

  const title = isSeanceZero ? strings.summary.titleSeanceZero : strings.summary.title;
  const xpLabel = strings.summary.xpEarned.replace('{xp}', String(xpEarned));

  const handleBack = () => {
    navigation.navigate('Main');
  };

  return (
    <Screen paddingHorizontal={0}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Zone principale : icône + titre + XP */}
        <View style={styles.main}>
          <Text variant="displayLarge" style={styles.trophy}>
            {isSeanceZero ? '🏆' : '✅'}
          </Text>

          <Text variant="headingLarge" style={styles.title}>
            {title}
          </Text>

          <View style={styles.xpBadge}>
            <Text variant="numeric" style={styles.xpText}>
              {xpLabel}
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              {isSeanceZero ? strings.summary.xpBonusFirstTime : strings.summary.xpEarnedLabel}
            </Text>
          </View>

          {isSeanceZero && (
            <Text variant="body" color="textSecondary" style={styles.nudge}>
              {strings.summary.nudgeSeanceZero}
            </Text>
          )}
        </View>

        {/* Suggestions de surcharge progressive */}
        {suggestions.length > 0 && (
          <View style={styles.suggestions}>
            <Text variant="label" color="textMuted" style={styles.suggestionsTitle}>
              {strings.progressionSuggestions.title}
            </Text>
            {suggestions.map((s, i) => (
              <SuggestionCard key={i} suggestion={s} />
            ))}
          </View>
        )}

        <Button
          label={strings.summary.backToHome}
          fullWidth
          style={styles.backBtn}
          onPress={handleBack}
        />
      </ScrollView>
    </Screen>
  );
}

function SuggestionCard({ suggestion: s }: { suggestion: ProgressionSuggestion }) {
  let text: string;

  if (s.type === 'charge') {
    text = strings.progressionSuggestions.charge
      .replace('{suggested}', String(s.charge_suggeree))
      .replace('{nom}', s.exercice_nom);
  } else if (s.type === 'reps') {
    text = strings.progressionSuggestions.reps
      .replace('{suggested}', String(s.reps_suggerees))
      .replace('{nom}', s.exercice_nom);
  } else {
    text = strings.progressionSuggestions.variante
      .replace('{nom}', s.exercice_nom)
      .replace('{variante}', s.variante_suggeree);
  }

  return (
    <Card variant="surface" style={styles.suggestionCard}>
      <View style={styles.suggestionRow}>
        <Text variant="bodySmall" color="success" style={styles.suggestionArrow}>
          ↑
        </Text>
        <Text variant="bodySmall" style={styles.suggestionText}>
          {text}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: theme.spacing.xl,
    gap: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  main: {
    alignItems: 'center',
    gap: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  trophy: {
    fontSize: 72,
    lineHeight: 88,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
  },
  xpBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.xs,
  },
  xpText: {
    color: theme.colors.xp,
  },
  nudge: {
    textAlign: 'center',
    maxWidth: 280,
  },
  suggestions: {
    gap: theme.spacing.sm,
  },
  suggestionsTitle: {
    marginBottom: theme.spacing.xs,
  },
  suggestionCard: {
    marginBottom: 0,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  suggestionArrow: {
    color: theme.colors.success,
    fontWeight: '700',
  },
  suggestionText: {
    flex: 1,
  },
  backBtn: {},
});
