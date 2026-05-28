import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { Button } from '@/shared/components/Button';
import { LineChart, type ChartDataPoint } from '@/shared/components/LineChart';
import { theme } from '@/shared/theme';
import { strings } from '@/shared/strings';
import {
  getAllCourses,
  getCourseRecords,
  getVolumeStats,
  deleteCourse,
} from '@/db/repositories/courseRepository';
import { formatAllure } from '@/domain/personal-records';
import type { Course, CourseRecords, VolumeStats } from '@/db/repositories/types';
import type { RootStackParamList } from '@/app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const RESSENTI_LABELS: Record<number, string> = {
  1: strings.running.ressenti['1'],
  2: strings.running.ressenti['2'],
  3: strings.running.ressenti['3'],
  4: strings.running.ressenti['4'],
  5: strings.running.ressenti['5'],
};

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  const s = Math.round((minutes % 1) * 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}`;
  return `${m}min${s > 0 ? ` ${s.toString().padStart(2, '0')}s` : ''}`;
}

export function RunningScreen() {
  const navigation = useNavigation<Nav>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [records, setRecords] = useState<CourseRecords>({ distanceMax: null, allureMin: null });
  const [volume, setVolume] = useState<VolumeStats>({ hebdo: 0, mensuel: 0 });

  useFocusEffect(
    useCallback(() => {
      Promise.all([getAllCourses(), getCourseRecords(), getVolumeStats()]).then(([c, r, v]) => {
        setCourses(c);
        setRecords(r);
        setVolume(v);
      });
    }, []),
  );

  const chartData: ChartDataPoint[] = courses
    .slice()
    .reverse()
    .map((c) => ({
      label: formatShortDate(c.date),
      value: c.allure_min_par_km,
    }));

  async function handleDelete(c: Course) {
    Alert.alert(strings.running.deleteConfirmTitle, strings.running.deleteConfirmBody, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: strings.common.delete,
        style: 'destructive',
        onPress: async () => {
          await deleteCourse(c.id);
          setCourses((prev) => prev.filter((x) => x.id !== c.id));
        },
      },
    ]);
  }

  return (
    <Screen paddingHorizontal={0}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text variant="headingLarge">{strings.running.title}</Text>
          <Button
            label={strings.running.addRun}
            size="sm"
            onPress={() => navigation.navigate('AddRun')}
          />
        </View>

        {courses.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{strings.running.noRuns}</Text>
          </View>
        ) : (
          <>
            {/* Stats volume */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>{strings.running.volumeHebdo}</Text>
                <Text style={styles.statValue}>{volume.hebdo.toFixed(1)}</Text>
                <Text style={styles.statUnit}>{strings.running.km}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>{strings.running.volumeMensuel}</Text>
                <Text style={styles.statValue}>{volume.mensuel.toFixed(1)}</Text>
                <Text style={styles.statUnit}>{strings.running.km}</Text>
              </View>
            </View>

            {/* Records */}
            {(records.distanceMax !== null || records.allureMin !== null) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{strings.running.recordsSection}</Text>
                <View style={styles.recordsRow}>
                  {records.distanceMax !== null && (
                    <View style={styles.recordCard}>
                      <Text style={styles.recordLabel}>🏅 {strings.running.recordDistance}</Text>
                      <Text style={styles.recordValue}>{records.distanceMax.toFixed(1)} km</Text>
                    </View>
                  )}
                  {records.allureMin !== null && (
                    <View style={styles.recordCard}>
                      <Text style={styles.recordLabel}>⚡ {strings.running.recordAllure}</Text>
                      <Text style={styles.recordValue}>{formatAllure(records.allureMin)}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Courbe allure */}
            {chartData.length >= 2 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{strings.running.chartSection}</Text>
                <LineChart data={chartData} unit=" /km" color={theme.colors.primary} height={160} />
              </View>
            )}

            {/* Historique */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{strings.running.historySection}</Text>
              {courses.map((c) => (
                <View key={c.id} style={styles.runRow}>
                  <View style={styles.runLeft}>
                    <View style={styles.runMainLine}>
                      <Text style={styles.runDistance}>{c.distance_km.toFixed(1)} km</Text>
                      <Text style={styles.runAllure}>{formatAllure(c.allure_min_par_km)}</Text>
                    </View>
                    <View style={styles.runDetails}>
                      <Text style={styles.runDate}>{formatDate(c.date)}</Text>
                      <Text style={styles.runDuration}>{formatDuration(c.duree_minutes)}</Text>
                      {c.ressenti !== null && RESSENTI_LABELS[c.ressenti] !== undefined && (
                        <Text style={styles.runRessenti}>{RESSENTI_LABELS[c.ressenti]}</Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => void handleDelete(c)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: theme.spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statUnit: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  section: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: theme.spacing.sm,
  },
  recordsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  recordCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  recordLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  recordValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  runRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  runLeft: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  runMainLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.sm,
  },
  runDistance: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  runAllure: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  runDetails: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  runDate: { fontSize: 12, color: theme.colors.textMuted },
  runDuration: { fontSize: 12, color: theme.colors.textSecondary },
  runRessenti: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  deleteBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.errorSoft,
  },
  deleteBtnText: {
    color: theme.colors.error,
    fontSize: 12,
  },
});
