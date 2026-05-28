import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { Button } from '@/shared/components/Button';
import { theme } from '@/shared/theme';
import { strings } from '@/shared/strings';
import { getMacroplanning, updateMacroplanning } from '@/db/repositories/macroPlanningRepository';
import type { ActivitePlanning, JourSemaine, MacroPlanning } from '@/db/repositories/types';

const JOURS: JourSemaine[] = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
];

const ACTIVITES: Array<{ key: ActivitePlanning; label: string; color: string }> = [
  {
    key: 'musculation_haut',
    label: strings.planning.activites.musculation_haut,
    color: theme.colors.primary,
  },
  {
    key: 'musculation_bas',
    label: strings.planning.activites.musculation_bas,
    color: theme.colors.info,
  },
  { key: 'course', label: strings.planning.activites.course, color: theme.colors.success },
  { key: 'repos', label: strings.planning.activites.repos, color: theme.colors.textMuted },
];

function jourLabel(jour: JourSemaine): string {
  return strings.planning.days[jour];
}

export function MacroPlanningScreen() {
  const navigation = useNavigation();
  const [planning, setPlanning] = useState<MacroPlanning | null>(null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getMacroplanning().then(setPlanning);
    }, []),
  );

  function setActivite(jour: JourSemaine, activite: ActivitePlanning) {
    setPlanning((prev) => (prev === null ? null : { ...prev, [jour]: activite }));
  }

  async function handleSave() {
    if (planning === null) return;
    setSaving(true);
    try {
      const updates: Partial<Record<JourSemaine, ActivitePlanning>> = {};
      for (const jour of JOURS) {
        updates[jour] = planning[jour];
      }
      await updateMacroplanning(updates);
      Alert.alert('', strings.planning.savedSuccess, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert(strings.common.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen paddingHorizontal={0}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ {strings.common.back}</Text>
        </TouchableOpacity>
        <Text variant="headingLarge">{strings.planning.title}</Text>
        <Text variant="bodySmall" color="textSecondary" style={styles.subtitle}>
          {strings.planning.subtitle}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {planning === null ? (
          <Text color="textMuted" style={styles.loadingText}>
            {strings.common.loading}
          </Text>
        ) : (
          JOURS.map((jour) => (
            <View key={jour} style={styles.dayRow}>
              <Text style={styles.dayLabel}>{jourLabel(jour)}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.activiteList}
              >
                {ACTIVITES.map(({ key, label, color }) => {
                  const active = planning[jour] === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => setActivite(jour, key)}
                      style={[
                        styles.activiteChip,
                        active && { backgroundColor: color + '22', borderColor: color },
                      ]}
                    >
                      <Text style={[styles.activiteChipText, active && { color }]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ))
        )}

        <Button
          label={saving ? strings.common.loading : strings.common.save}
          onPress={handleSave}
          disabled={saving || planning === null}
          style={styles.saveBtn}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  backBtn: { marginBottom: theme.spacing.xs },
  backText: { color: theme.colors.primary, fontSize: 16 },
  subtitle: { marginTop: theme.spacing.xs },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  loadingText: { textAlign: 'center', marginTop: theme.spacing.xxl },
  dayRow: {
    gap: theme.spacing.xs,
  },
  dayLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  activiteList: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
  },
  activiteChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  activiteChipText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  saveBtn: { marginTop: theme.spacing.lg },
});
