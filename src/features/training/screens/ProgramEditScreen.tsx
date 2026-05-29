import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
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
import {
  getExercicesAvecConfig,
  removeExerciceFromSeanceType,
  updateExerciceConfig,
  reorderExercices,
} from '@/db/repositories/seanceTypeRepository';
import { strings } from '@/shared/strings';
import { theme } from '@/shared/theme';
import type { ExerciceAvecConfig } from '@/db/repositories/types';
import type { RootStackParamList } from '@/app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProgramEdit'>;

interface ConfigEdit {
  steId: number;
  exerciceNom: string;
  series: string;
  repsMin: string;
  repsMax: string;
}

export function ProgramEditScreen({ navigation, route }: Props) {
  const { seanceTypeId, seanceTypeName } = route.params;
  const [exercises, setExercises] = useState<ExerciceAvecConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [configEdit, setConfigEdit] = useState<ConfigEdit | null>(null);

  const loadData = useCallback(async () => {
    const exs = await getExercicesAvecConfig(seanceTypeId);
    setExercises(exs);
    setLoading(false);
  }, [seanceTypeId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const next = [...exercises];
    const a = next[index - 1];
    const b = next[index];
    if (a === undefined || b === undefined) return;
    next[index - 1] = b;
    next[index] = a;
    setExercises(next);
    await reorderExercices(
      seanceTypeId,
      next.map((e) => e.seance_type_exercice_id),
    );
  };

  const handleMoveDown = async (index: number) => {
    if (index >= exercises.length - 1) return;
    const next = [...exercises];
    const a = next[index];
    const b = next[index + 1];
    if (a === undefined || b === undefined) return;
    next[index] = b;
    next[index + 1] = a;
    setExercises(next);
    await reorderExercices(
      seanceTypeId,
      next.map((e) => e.seance_type_exercice_id),
    );
  };

  const handleDelete = (ex: ExerciceAvecConfig) => {
    const title = strings.programs.removeConfirmTitle.replace('{nom}', ex.exercice.nom);
    Alert.alert(title, strings.programs.removeConfirmBody, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: strings.programs.removeExercice,
        style: 'destructive',
        onPress: async () => {
          await removeExerciceFromSeanceType(ex.seance_type_exercice_id);
          setExercises((prev) =>
            prev.filter((e) => e.seance_type_exercice_id !== ex.seance_type_exercice_id),
          );
        },
      },
    ]);
  };

  const openConfigEdit = (ex: ExerciceAvecConfig) => {
    setConfigEdit({
      steId: ex.seance_type_exercice_id,
      exerciceNom: ex.exercice.nom,
      series: String(ex.series_cible),
      repsMin: String(ex.reps_min),
      repsMax: String(ex.reps_max),
    });
  };

  const handleSaveConfig = async () => {
    if (configEdit === null) return;
    const series = parseInt(configEdit.series, 10);
    const repsMin = parseInt(configEdit.repsMin, 10);
    const repsMax = parseInt(configEdit.repsMax, 10);

    if (isNaN(series) || series < 1) return;
    if (isNaN(repsMin) || repsMin < 1) return;
    if (isNaN(repsMax) || repsMax < repsMin) return;

    await updateExerciceConfig(configEdit.steId, {
      series_cible: series,
      reps_min: repsMin,
      reps_max: repsMax,
    });

    setExercises((prev) =>
      prev.map((e) =>
        e.seance_type_exercice_id === configEdit.steId
          ? { ...e, series_cible: series, reps_min: repsMin, reps_max: repsMax }
          : e,
      ),
    );
    setConfigEdit(null);
  };

  const canSaveConfig =
    configEdit !== null &&
    parseInt(configEdit.series, 10) >= 1 &&
    parseInt(configEdit.repsMin, 10) >= 1 &&
    parseInt(configEdit.repsMax, 10) >= parseInt(configEdit.repsMin, 10);

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
          {seanceTypeName}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text variant="body" color="textSecondary">
            {strings.common.loading}
          </Text>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => String(item.seance_type_exercice_id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text variant="body" color="textSecondary" style={styles.emptyText}>
              {strings.programs.noExercices}
            </Text>
          }
          ListFooterComponent={
            <Button
              label={strings.programs.addExercice}
              variant="ghost"
              fullWidth
              style={styles.addBtn}
              onPress={() =>
                navigation.navigate('ExercicePicker', {
                  seanceTypeId,
                  seanceTypeName,
                })
              }
            />
          }
          renderItem={({ item, index }) => {
            const seriesLabel = strings.programs.seriesRepsLabel
              .replace('{series}', String(item.series_cible))
              .replace('{min}', String(item.reps_min))
              .replace('{max}', String(item.reps_max));

            return (
              <Card variant="surface" style={styles.exerciceCard}>
                <View style={styles.exerciceMain}>
                  <View style={styles.exerciceInfo}>
                    <Text variant="body">{item.exercice.nom}</Text>
                    <Text variant="caption" color="textMuted">
                      {seriesLabel}
                    </Text>
                  </View>
                  <View style={styles.exerciceActions}>
                    {/* Réorganisation */}
                    <Pressable
                      onPress={() => void handleMoveUp(index)}
                      disabled={index === 0}
                      hitSlop={8}
                      style={[styles.arrowBtn, index === 0 ? styles.arrowDisabled : null]}
                    >
                      <Text variant="bodySmall" color={index === 0 ? 'textMuted' : 'textSecondary'}>
                        ↑
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void handleMoveDown(index)}
                      disabled={index === exercises.length - 1}
                      hitSlop={8}
                      style={[
                        styles.arrowBtn,
                        index === exercises.length - 1 ? styles.arrowDisabled : null,
                      ]}
                    >
                      <Text
                        variant="bodySmall"
                        color={index === exercises.length - 1 ? 'textMuted' : 'textSecondary'}
                      >
                        ↓
                      </Text>
                    </Pressable>
                    {/* Éditer config */}
                    <Pressable
                      onPress={() => openConfigEdit(item)}
                      hitSlop={8}
                      style={styles.editBtn}
                    >
                      <Text variant="caption" color="textSecondary">
                        ✎
                      </Text>
                    </Pressable>
                    {/* Supprimer */}
                    <Pressable
                      onPress={() => handleDelete(item)}
                      hitSlop={8}
                      style={styles.deleteBtn}
                    >
                      <Text variant="caption" color="error">
                        ✕
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Card>
            );
          }}
        />
      )}

      {/* Modal d'édition de la configuration séries/reps */}
      <Modal visible={configEdit !== null} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={modalStyles.kav}
        >
          <Pressable style={modalStyles.overlay} onPress={() => setConfigEdit(null)}>
            <Pressable style={modalStyles.container} onPress={() => undefined}>
              <Text variant="headingSmall" style={modalStyles.title}>
                {strings.programs.editConfigTitle}
              </Text>
              <Text variant="bodySmall" color="textSecondary" style={modalStyles.subtitle}>
                {configEdit?.exerciceNom ?? ''}
              </Text>

              <View style={modalStyles.fields}>
                <View style={modalStyles.field}>
                  <Text variant="label" color="textSecondary">
                    {strings.programs.seriesLabel}
                  </Text>
                  <TextInput
                    style={modalStyles.input}
                    value={configEdit?.series ?? ''}
                    onChangeText={(v) =>
                      setConfigEdit((prev) => (prev !== null ? { ...prev, series: v } : prev))
                    }
                    keyboardType="number-pad"
                    selectTextOnFocus
                    placeholder="3"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
                <View style={modalStyles.field}>
                  <Text variant="label" color="textSecondary">
                    {strings.programs.repsMinLabel}
                  </Text>
                  <TextInput
                    style={modalStyles.input}
                    value={configEdit?.repsMin ?? ''}
                    onChangeText={(v) =>
                      setConfigEdit((prev) => (prev !== null ? { ...prev, repsMin: v } : prev))
                    }
                    keyboardType="number-pad"
                    selectTextOnFocus
                    placeholder="8"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
                <View style={modalStyles.field}>
                  <Text variant="label" color="textSecondary">
                    {strings.programs.repsMaxLabel}
                  </Text>
                  <TextInput
                    style={modalStyles.input}
                    value={configEdit?.repsMax ?? ''}
                    onChangeText={(v) =>
                      setConfigEdit((prev) => (prev !== null ? { ...prev, repsMax: v } : prev))
                    }
                    keyboardType="number-pad"
                    selectTextOnFocus
                    placeholder="12"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
              </View>

              <Button
                label={strings.common.save}
                fullWidth
                onPress={() => void handleSaveConfig()}
                disabled={!canSaveConfig}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xxxl,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: theme.spacing.xl,
  },
  addBtn: {
    marginTop: theme.spacing.md,
  },
  exerciceCard: {
    marginBottom: 0,
  },
  exerciceMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  exerciceInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  exerciceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  editBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const modalStyles = StyleSheet.create({
  kav: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
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
