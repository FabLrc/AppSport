import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { Button } from '@/shared/components/Button';
import { LineChart, type ChartDataPoint } from '@/shared/components/LineChart';
import { theme } from '@/shared/theme';
import { strings } from '@/shared/strings';
import { getAllMesures, deleteMesure } from '@/db/repositories/mesureCorporelleRepository';
import type { MesureCorporelle } from '@/db/repositories/types';
import type { RootStackParamList } from '@/app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type MesureKey =
  | 'poids_kg'
  | 'tour_taille_cm'
  | 'tour_hanches_cm'
  | 'tour_poitrine_cm'
  | 'tour_bras_cm'
  | 'tour_cuisses_cm';

const CHART_METRICS: Array<{ key: MesureKey; label: string; unit: string; color: string }> = [
  {
    key: 'poids_kg',
    label: strings.bodyTracking.measures.poids_kg,
    unit: strings.bodyTracking.units.poids_kg,
    color: theme.colors.primary,
  },
  {
    key: 'tour_taille_cm',
    label: strings.bodyTracking.measures.tour_taille_cm,
    unit: strings.bodyTracking.units.tour_taille_cm,
    color: theme.colors.info,
  },
  {
    key: 'tour_hanches_cm',
    label: strings.bodyTracking.measures.tour_hanches_cm,
    unit: strings.bodyTracking.units.tour_hanches_cm,
    color: theme.colors.success,
  },
  {
    key: 'tour_poitrine_cm',
    label: strings.bodyTracking.measures.tour_poitrine_cm,
    unit: strings.bodyTracking.units.tour_poitrine_cm,
    color: theme.colors.warning,
  },
  {
    key: 'tour_bras_cm',
    label: strings.bodyTracking.measures.tour_bras_cm,
    unit: strings.bodyTracking.units.tour_bras_cm,
    color: theme.colors.accent1,
  },
  {
    key: 'tour_cuisses_cm',
    label: strings.bodyTracking.measures.tour_cuisses_cm,
    unit: strings.bodyTracking.units.tour_cuisses_cm,
    color: theme.colors.accent2,
  },
];

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

function formatValue(value: number): string {
  return value % 1 === 0 ? String(value) : value.toFixed(1);
}

interface MeasureRowProps {
  label: string;
  value: number | null;
  unit: string;
}

function MeasureRow({ label, value, unit }: MeasureRowProps) {
  if (value === null) return null;
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>
        {formatValue(value)} {unit}
      </Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  label: { color: theme.colors.textSecondary, fontSize: 14 },
  value: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
});

export function BodyTrackingScreen() {
  const navigation = useNavigation<Nav>();
  const [mesures, setMesures] = useState<MesureCorporelle[]>([]);
  const [activeMetric, setActiveMetric] = useState<MesureKey>('poids_kg');
  const [fullPhotoUri, setFullPhotoUri] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getAllMesures().then(setMesures);
    }, []),
  );

  const last = mesures[0] ?? null;

  const chartData: ChartDataPoint[] = mesures
    .filter((m) => m[activeMetric] !== null)
    .slice()
    .reverse()
    .map((m) => ({
      label: formatShortDate(m.date),
      value: m[activeMetric] as number,
    }));

  const activeMetricInfo = CHART_METRICS.find((m) => m.key === activeMetric) ?? CHART_METRICS[0]!;

  const photos = mesures.filter((m) => m.photo_uri !== null);

  async function handleDelete(m: MesureCorporelle) {
    Alert.alert(strings.bodyTracking.deleteConfirmTitle, strings.bodyTracking.deleteConfirmBody, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: strings.common.delete,
        style: 'destructive',
        onPress: async () => {
          await deleteMesure(m.id);
          setMesures((prev) => prev.filter((x) => x.id !== m.id));
        },
      },
    ]);
  }

  return (
    <Screen paddingHorizontal={0}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text variant="headingLarge">{strings.bodyTracking.title}</Text>
          <Button
            label={strings.bodyTracking.addMeasure}
            onPress={() => navigation.navigate('AddMeasurement', undefined)}
            size="sm"
          />
        </View>

        {mesures.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{strings.bodyTracking.noMeasures}</Text>
          </View>
        ) : (
          <>
            {/* Dernière mesure */}
            {last !== null && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{strings.bodyTracking.lastMeasure}</Text>
                  <Text style={styles.cardDate}>{formatDate(last.date)}</Text>
                </View>
                <MeasureRow
                  label={strings.bodyTracking.measures.poids_kg}
                  value={last.poids_kg}
                  unit={strings.bodyTracking.units.poids_kg}
                />
                <MeasureRow
                  label={strings.bodyTracking.measures.tour_taille_cm}
                  value={last.tour_taille_cm}
                  unit={strings.bodyTracking.units.tour_taille_cm}
                />
                <MeasureRow
                  label={strings.bodyTracking.measures.tour_hanches_cm}
                  value={last.tour_hanches_cm}
                  unit={strings.bodyTracking.units.tour_hanches_cm}
                />
                <MeasureRow
                  label={strings.bodyTracking.measures.tour_poitrine_cm}
                  value={last.tour_poitrine_cm}
                  unit={strings.bodyTracking.units.tour_poitrine_cm}
                />
                <MeasureRow
                  label={strings.bodyTracking.measures.tour_bras_cm}
                  value={last.tour_bras_cm}
                  unit={strings.bodyTracking.units.tour_bras_cm}
                />
                <MeasureRow
                  label={strings.bodyTracking.measures.tour_cuisses_cm}
                  value={last.tour_cuisses_cm}
                  unit={strings.bodyTracking.units.tour_cuisses_cm}
                />
                {last.notes !== null && last.notes.length > 0 && (
                  <Text style={styles.notes}>{last.notes}</Text>
                )}
              </View>
            )}

            {/* Section courbes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{strings.bodyTracking.chartSection}</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.metricPicker}
                contentContainerStyle={styles.metricPickerContent}
              >
                {CHART_METRICS.map((m) => {
                  const hasData = mesures.some((mes) => mes[m.key] !== null);
                  if (!hasData) return null;
                  return (
                    <TouchableOpacity
                      key={m.key}
                      onPress={() => setActiveMetric(m.key)}
                      style={[
                        styles.metricChip,
                        activeMetric === m.key && {
                          backgroundColor: m.color + '33',
                          borderColor: m.color,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.metricChipText,
                          activeMetric === m.key && { color: m.color },
                        ]}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {chartData.length >= 1 ? (
                <LineChart
                  data={chartData}
                  unit={` ${activeMetricInfo.unit}`}
                  color={activeMetricInfo.color}
                  height={180}
                />
              ) : (
                <Text style={styles.noChartData}>
                  Pas encore assez de données pour cette mesure.
                </Text>
              )}
            </View>

            {/* Galerie photos */}
            {photos.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{strings.bodyTracking.photosSection}</Text>
                <FlatList
                  data={photos}
                  keyExtractor={(item) => String(item.id)}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.galleryContent}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => setFullPhotoUri(item.photo_uri)}>
                      <View style={styles.galleryItem}>
                        <Image
                          source={{ uri: item.photo_uri! }}
                          style={styles.galleryThumb}
                          resizeMode="cover"
                        />
                        <Text style={styles.galleryDate}>{formatShortDate(item.date)}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Historique */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Historique</Text>
              {mesures.map((m) => (
                <View key={m.id} style={styles.historyRow}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyDate}>{formatDate(m.date)}</Text>
                    <Text style={styles.historyValues} numberOfLines={1}>
                      {[
                        m.poids_kg !== null ? `${m.poids_kg} kg` : null,
                        m.tour_taille_cm !== null ? `Taille ${m.tour_taille_cm} cm` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  <View style={styles.historyActions}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('AddMeasurement', { mesureId: m.id })}
                      style={styles.historyBtn}
                    >
                      <Text style={styles.historyBtnText}>{strings.common.edit}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => void handleDelete(m)}
                      style={[styles.historyBtn, styles.historyBtnDanger]}
                    >
                      <Text style={[styles.historyBtnText, styles.historyBtnDangerText]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Visionneuse photo plein écran */}
      <Modal
        visible={fullPhotoUri !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFullPhotoUri(null)}
      >
        <Pressable style={styles.photoModal} onPress={() => setFullPhotoUri(null)}>
          {fullPhotoUri !== null && (
            <Image source={{ uri: fullPhotoUri }} style={styles.photoFull} resizeMode="contain" />
          )}
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: theme.spacing.xxl,
  },
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
  card: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 15,
  },
  cardDate: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  notes: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
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
  metricPicker: {
    marginBottom: theme.spacing.sm,
  },
  metricPickerContent: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
  },
  metricChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  metricChipText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  noChartData: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
  },
  galleryContent: {
    gap: theme.spacing.sm,
  },
  galleryItem: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  galleryThumb: {
    width: 100,
    height: 130,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  galleryDate: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  historyLeft: {
    flex: 1,
    gap: 2,
  },
  historyDate: {
    fontSize: 14,
    color: theme.colors.text,
  },
  historyValues: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  historyActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  historyBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  historyBtnDanger: {
    borderColor: theme.colors.errorSoft,
  },
  historyBtnText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  historyBtnDangerText: {
    color: theme.colors.error,
  },
  photoModal: {
    flex: 1,
    backgroundColor: theme.colors.overlayStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoFull: {
    width: '100%',
    height: '85%',
  },
});
