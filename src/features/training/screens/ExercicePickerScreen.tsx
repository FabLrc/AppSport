import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { getAllExercices } from '@/db/repositories/exerciceRepository';
import { addExerciceToSeanceType } from '@/db/repositories/seanceTypeRepository';
import { strings } from '@/shared/strings';
import { theme } from '@/shared/theme';
import type { Exercice } from '@/db/repositories/types';
import type { RootStackParamList } from '@/app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ExercicePicker'>;

interface AddConfig {
  exercice: Exercice;
  series: string;
  repsMin: string;
  repsMax: string;
}

export function ExercicePickerScreen({ navigation, route }: Props) {
  const { seanceTypeId } = route.params;
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addConfig, setAddConfig] = useState<AddConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const exs = await getAllExercices();
      if (!active) return;
      setExercices(exs);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Filtrage par recherche textuelle
  const filtered = useMemo(() => {
    if (search.trim() === '') return exercices;
    const q = search.toLowerCase().trim();
    return exercices.filter(
      (e) => e.nom.toLowerCase().includes(q) || e.groupe_musculaire.toLowerCase().includes(q),
    );
  }, [exercices, search]);

  // Regroupement par groupe musculaire
  const grouped = useMemo(() => {
    const map = new Map<string, Exercice[]>();
    for (const ex of filtered) {
      const group = ex.groupe_musculaire;
      const existing = map.get(group);
      if (existing !== undefined) {
        existing.push(ex);
      } else {
        map.set(group, [ex]);
      }
    }
    // Aplatit en items de liste avec des séparateurs de section
    type ListItem = { kind: 'header'; group: string } | { kind: 'exercice'; exercice: Exercice };
    const items: ListItem[] = [];
    for (const [group, exs] of map) {
      items.push({ kind: 'header', group });
      for (const ex of exs) {
        items.push({ kind: 'exercice', exercice: ex });
      }
    }
    return items;
  }, [filtered]);

  const handleSelect = (exercice: Exercice) => {
    setAddConfig({
      exercice,
      series: strings.programs.defaultSeries,
      repsMin: strings.programs.defaultRepsMin,
      repsMax: strings.programs.defaultRepsMax,
    });
  };

  const handleAdd = async () => {
    if (addConfig === null) return;
    const series = parseInt(addConfig.series, 10);
    const repsMin = parseInt(addConfig.repsMin, 10);
    const repsMax = parseInt(addConfig.repsMax, 10);
    if (isNaN(series) || series < 1) return;
    if (isNaN(repsMin) || repsMin < 1) return;
    if (isNaN(repsMax) || repsMax < repsMin) return;

    setSaving(true);
    try {
      await addExerciceToSeanceType(seanceTypeId, addConfig.exercice.id, {
        series_cible: series,
        reps_min: repsMin,
        reps_max: repsMax,
        duree_seconde_cible: null,
      });
      setAddConfig(null);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const canAdd =
    addConfig !== null &&
    parseInt(addConfig.series, 10) >= 1 &&
    parseInt(addConfig.repsMin, 10) >= 1 &&
    parseInt(addConfig.repsMax, 10) >= parseInt(addConfig.repsMin, 10);

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
        <Text variant="headingSmall" style={styles.headerTitle}>
          {strings.programs.exercicePickerTitle}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher…"
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
          autoCapitalize="none"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text variant="body" color="textSecondary">
            {strings.common.loading}
          </Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item) =>
            item.kind === 'header' ? `hdr-${item.group}` : `ex-${item.exercice.id}`
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            if (item.kind === 'header') {
              return (
                <Text variant="label" color="textMuted" style={styles.groupHeader}>
                  {item.group}
                </Text>
              );
            }
            const { exercice } = item;
            return (
              <Pressable onPress={() => handleSelect(exercice)}>
                <Card variant="surface" style={styles.exerciceCard}>
                  <View style={styles.exerciceRow}>
                    <View style={styles.exerciceInfo}>
                      <Text variant="body">{exercice.nom}</Text>
                      <Text variant="caption" color="textMuted">
                        {exercice.mode_charge === 'charge' ? '🏋️' : '💪'}{' '}
                        {exercice.type === 'compose' ? 'Composé' : 'Isolation'}
                      </Text>
                    </View>
                    <Text variant="caption" color="primary">
                      +
                    </Text>
                  </View>
                </Card>
              </Pressable>
            );
          }}
        />
      )}

      {/* Modal de configuration avant ajout */}
      <Modal visible={addConfig !== null} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={modalStyles.kav}
        >
          <Pressable style={modalStyles.overlay} onPress={() => setAddConfig(null)}>
            <Pressable style={modalStyles.container} onPress={() => undefined}>
              <Text variant="headingSmall" style={modalStyles.title}>
                {addConfig?.exercice.nom ?? ''}
              </Text>
              <Text variant="bodySmall" color="textSecondary" style={modalStyles.subtitle}>
                {strings.programs.configSectionTitle}
              </Text>

              <View style={modalStyles.fields}>
                <View style={modalStyles.field}>
                  <Text variant="label" color="textSecondary">
                    {strings.programs.seriesLabel}
                  </Text>
                  <TextInput
                    style={modalStyles.input}
                    value={addConfig?.series ?? ''}
                    onChangeText={(v) =>
                      setAddConfig((prev) => (prev !== null ? { ...prev, series: v } : prev))
                    }
                    keyboardType="number-pad"
                    selectTextOnFocus
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
                <View style={modalStyles.field}>
                  <Text variant="label" color="textSecondary">
                    {strings.programs.repsMinLabel}
                  </Text>
                  <TextInput
                    style={modalStyles.input}
                    value={addConfig?.repsMin ?? ''}
                    onChangeText={(v) =>
                      setAddConfig((prev) => (prev !== null ? { ...prev, repsMin: v } : prev))
                    }
                    keyboardType="number-pad"
                    selectTextOnFocus
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
                <View style={modalStyles.field}>
                  <Text variant="label" color="textSecondary">
                    {strings.programs.repsMaxLabel}
                  </Text>
                  <TextInput
                    style={modalStyles.input}
                    value={addConfig?.repsMax ?? ''}
                    onChangeText={(v) =>
                      setAddConfig((prev) => (prev !== null ? { ...prev, repsMax: v } : prev))
                    }
                    keyboardType="number-pad"
                    selectTextOnFocus
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
              </View>

              <Button
                label={strings.programs.addToProgram}
                fullWidth
                onPress={() => void handleAdd()}
                loading={saving}
                disabled={!canAdd}
              />
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
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
    width: 68,
  },
  searchBar: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 15,
    minHeight: 44,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.xxxl,
  },
  groupHeader: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  exerciceCard: {
    marginBottom: 0,
  },
  exerciceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  exerciceInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
});

const modalStyles = StyleSheet.create({
  kav: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.surfaceElevated,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.lg,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: -theme.spacing.md,
  },
  fields: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  field: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    minHeight: 56,
  },
});
