import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { Button } from '@/shared/components/Button';
import { theme } from '@/shared/theme';
import { strings } from '@/shared/strings';
import { createCourse, getCoursesForRecord } from '@/db/repositories/courseRepository';
import { detecterRecords, formatAllure } from '@/domain/personal-records';

const RESSENTI_OPTIONS = [1, 2, 3, 4, 5] as const;
type Ressenti = (typeof RESSENTI_OPTIONS)[number];

const RESSENTI_LABELS: Record<Ressenti, string> = {
  1: strings.running.ressenti['1'],
  2: strings.running.ressenti['2'],
  3: strings.running.ressenti['3'],
  4: strings.running.ressenti['4'],
  5: strings.running.ressenti['5'],
};

const RESSENTI_COLORS: Record<Ressenti, string> = {
  1: '#4CAF50',
  2: '#8BC34A',
  3: '#FFB300',
  4: '#FF7043',
  5: '#E53935',
};

function calcAllure(distanceStr: string, minutesStr: string, secondsStr: string): number | null {
  const distance = parseFloat(distanceStr.replace(',', '.'));
  const minutes = parseInt(minutesStr, 10);
  const seconds = parseInt(secondsStr, 10);
  if (isNaN(distance) || distance <= 0) return null;
  if (isNaN(minutes) && isNaN(seconds)) return null;
  const totalMinutes = (isNaN(minutes) ? 0 : minutes) + (isNaN(seconds) ? 0 : seconds) / 60;
  if (totalMinutes <= 0) return null;
  return totalMinutes / distance;
}

export function AddRunScreen() {
  const navigation = useNavigation();
  const today = new Date().toISOString().split('T')[0] ?? '';

  const [distance, setDistance] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [ressenti, setRessenti] = useState<Ressenti | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const allure = calcAllure(distance, minutes, seconds);

  async function handleSave() {
    const dist = parseFloat(distance.replace(',', '.'));
    if (isNaN(dist) || dist <= 0) {
      Alert.alert(strings.common.error, strings.running.errorNoDistance);
      return;
    }
    const mins = parseInt(minutes, 10);
    const secs = parseInt(seconds, 10);
    const totalMinutes = (isNaN(mins) ? 0 : mins) + (isNaN(secs) ? 0 : secs) / 60;
    if (totalMinutes <= 0) {
      Alert.alert(strings.common.error, strings.running.errorNoDuration);
      return;
    }

    setSaving(true);
    try {
      const historique = await getCoursesForRecord();
      const nouvelleCourse = { distance_km: dist, allure_min_par_km: totalMinutes / dist };
      const records = detecterRecords(nouvelleCourse, historique);
      const hasRecord = records.length > 0;
      const xp = hasRecord ? 150 : 100;

      await createCourse({
        date: today,
        distance_km: dist,
        duree_minutes: totalMinutes,
        ressenti,
        statut: 'completee',
        xp_attribue: xp,
        notes: notes || null,
      });

      if (hasRecord) {
        const messages = records.map((r) => {
          if (r.type === 'distance') {
            return strings.running.newRecordDistance.replace('{dist}', dist.toFixed(1));
          }
          return strings.running.newRecordAllure.replace(
            '{allure}',
            formatAllure(nouvelleCourse.allure_min_par_km),
          );
        });
        Alert.alert(strings.running.newRecord, messages.join('\n'), [
          { text: 'Super !', onPress: () => navigation.goBack() },
        ]);
      } else {
        navigation.goBack();
      }
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
        <Text variant="headingLarge">{strings.running.addRun}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Distance */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{strings.running.distanceLabel}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
              placeholder="0.0"
              placeholderTextColor={theme.colors.textMuted}
            />
            <Text style={styles.unit}>{strings.running.km}</Text>
          </View>
        </View>

        {/* Durée */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Durée</Text>
          <View style={styles.durationRow}>
            <View style={styles.durationField}>
              <TextInput
                style={styles.input}
                value={minutes}
                onChangeText={setMinutes}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={theme.colors.textMuted}
                maxLength={3}
              />
              <Text style={styles.durationUnit}>{strings.running.min}</Text>
            </View>
            <Text style={styles.durationSep}>:</Text>
            <View style={styles.durationField}>
              <TextInput
                style={styles.input}
                value={seconds}
                onChangeText={setSeconds}
                keyboardType="number-pad"
                placeholder="00"
                placeholderTextColor={theme.colors.textMuted}
                maxLength={2}
              />
              <Text style={styles.durationUnit}>{strings.running.sec}</Text>
            </View>
          </View>
        </View>

        {/* Allure calculée */}
        {allure !== null && (
          <View style={styles.allurePreview}>
            <Text style={styles.allureLabel}>Allure calculée</Text>
            <Text style={styles.allureValue}>{formatAllure(allure)}</Text>
          </View>
        )}

        {/* Ressenti */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{strings.running.ressenti.label}</Text>
          <View style={styles.ressentiRow}>
            {RESSENTI_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRessenti(ressenti === r ? null : r)}
                style={[
                  styles.ressentiBtn,
                  ressenti === r && {
                    backgroundColor: RESSENTI_COLORS[r] + '33',
                    borderColor: RESSENTI_COLORS[r],
                  },
                ]}
              >
                <Text style={[styles.ressentiNum, ressenti === r && { color: RESSENTI_COLORS[r] }]}>
                  {r}
                </Text>
                <Text
                  style={[styles.ressentiLabel, ressenti === r && { color: RESSENTI_COLORS[r] }]}
                  numberOfLines={1}
                >
                  {RESSENTI_LABELS[r]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{strings.running.notesLabel}</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Conditions, sensations…"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        <Button
          label={saving ? strings.common.loading : strings.common.save}
          onPress={handleSave}
          disabled={saving}
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
  },
  backBtn: {
    marginBottom: theme.spacing.xs,
  },
  backText: {
    color: theme.colors.primary,
    fontSize: 16,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  field: { gap: theme.spacing.xs },
  fieldLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: 16,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  unit: {
    color: theme.colors.textMuted,
    fontSize: 14,
    width: 30,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  durationField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  durationUnit: {
    color: theme.colors.textMuted,
    fontSize: 14,
    width: 28,
  },
  durationSep: {
    color: theme.colors.textMuted,
    fontSize: 20,
    fontWeight: '600',
  },
  allurePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  allureLabel: {
    color: theme.colors.primary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  allureValue: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  ressentiRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  ressentiBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: 2,
  },
  ressentiNum: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  ressentiLabel: {
    fontSize: 9,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  saveBtn: {
    marginTop: theme.spacing.sm,
  },
});
