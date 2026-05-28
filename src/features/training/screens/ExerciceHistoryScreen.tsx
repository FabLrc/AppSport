import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { LineChart } from '@/shared/components/LineChart';
import type { ChartDataPoint } from '@/shared/components/LineChart';
import { getExerciceById } from '@/db/repositories/exerciceRepository';
import {
  getHistoriqueExercice,
  type HistoriqueEntry,
} from '@/db/repositories/seriePerformanceRepository';
import { strings } from '@/shared/strings';
import { theme } from '@/shared/theme';
import type { Exercice } from '@/db/repositories/types';
import type { RootStackParamList } from '@/app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ExerciceHistory'>;

export function ExerciceHistoryScreen({ navigation, route }: Props) {
  const { exerciceId, exerciceNom } = route.params;
  const [exercice, setExercice] = useState<Exercice | null>(null);
  const [historique, setHistorique] = useState<HistoriqueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [ex, hist] = await Promise.all([
        getExerciceById(exerciceId),
        getHistoriqueExercice(exerciceId),
      ]);
      if (!active) return;
      setExercice(ex);
      setHistorique(hist);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [exerciceId]);

  const isWeighted = exercice?.mode_charge === 'charge';

  // Construction des points pour le graphique
  const chartData: ChartDataPoint[] = historique.map((entry) => {
    const date = parseISO(entry.session_date);
    const label = format(date, 'dd/MM', { locale: fr });
    const value = isWeighted ? (entry.max_charge ?? 0) : entry.max_reps;
    return { label, value };
  });

  const unit = isWeighted ? ' kg' : '';
  const chartLabel = isWeighted ? strings.history.chartLabelCharge : strings.history.chartLabelReps;

  return (
    <Screen paddingHorizontal={0}>
      {/* En-tête */}
      <View style={styles.header}>
        <Button
          label={strings.common.back}
          variant="ghost"
          size="sm"
          onPress={() => navigation.goBack()}
        />
        <Text variant="headingSmall" style={styles.headerTitle} numberOfLines={1}>
          {exerciceNom}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text variant="body" color="textSecondary">
            {strings.common.loading}
          </Text>
        </View>
      ) : historique.length === 0 ? (
        <View style={styles.center}>
          <Text variant="body" color="textSecondary" style={styles.noDataText}>
            {strings.history.noData}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Graphique */}
          <Card variant="elevated" style={styles.chartCard}>
            <Text variant="label" color="textMuted">
              {chartLabel}
            </Text>
            <LineChart data={chartData} unit={unit} color={theme.colors.primary} height={200} />
          </Card>

          {/* Liste des séances passées */}
          <Text variant="label" color="textMuted" style={styles.sectionLabel}>
            {strings.history.sessions}
          </Text>

          {[...historique].reverse().map((entry) => {
            const date = parseISO(entry.session_date);
            const dateStr = format(date, 'EEEE d MMMM yyyy', { locale: fr });
            const metric = isWeighted ? `${entry.max_charge ?? 0} kg` : `${entry.max_reps} reps`;
            const seriesLabel = strings.history.serieCount
              .replace('{n}', String(entry.nombre_series))
              .replace('{s}', entry.nombre_series > 1 ? 's' : '');
            const repsLabel = strings.history.totalReps.replace('{n}', String(entry.total_reps));

            return (
              <Card key={entry.seance_id} variant="surface" style={styles.sessionCard}>
                <View style={styles.sessionRow}>
                  <View style={styles.sessionInfo}>
                    <Text variant="body" style={styles.sessionDate}>
                      {dateStr}
                    </Text>
                    <Text variant="caption" color="textMuted">
                      {seriesLabel} · {repsLabel}
                    </Text>
                  </View>
                  <Text variant="headingSmall" color="primary">
                    {metric}
                  </Text>
                </View>
              </Card>
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 68, // compense la largeur du bouton "Retour"
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  noDataText: {
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
  chartCard: {
    gap: theme.spacing.md,
    overflow: 'hidden',
  },
  sectionLabel: {
    marginTop: theme.spacing.md,
  },
  sessionCard: {
    marginBottom: 0,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  sessionInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  sessionDate: {
    textTransform: 'capitalize',
  },
});
