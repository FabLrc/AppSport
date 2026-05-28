import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { Button } from '@/shared/components/Button';
import { theme } from '@/shared/theme';
import { strings } from '@/shared/strings';
import {
  getObjectifNutritionnel,
  updateObjectifNutritionnel,
} from '@/db/repositories/nutritionRepository';
import {
  marquerModuleComplete,
  marquerXpDonne,
} from '@/db/repositories/onboardingProgressionRepository';
import { addXpToProfil } from '@/db/repositories/profilRepository';
import { useProfileStore } from '@/state/profileStore';
import { XP } from '@/domain/xp';

export function NutritionSetupScreen() {
  const navigation = useNavigation();
  const { loadProfile } = useProfileStore();
  const [kcal, setKcal] = useState('2000');
  const [proteines, setProteines] = useState('150');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getObjectifNutritionnel().then((obj) => {
      setKcal(String(obj.kcal_cible));
      setProteines(String(obj.proteines_g));
    });
  }, []);

  async function handleSave() {
    const k = parseInt(kcal, 10);
    const p = parseInt(proteines, 10);
    if (isNaN(k) || k <= 0 || isNaN(p) || p <= 0) {
      Alert.alert(strings.common.error, strings.nutrition.errorInvalid);
      return;
    }
    setSaving(true);
    try {
      await updateObjectifNutritionnel(k, p);
      // Onboarding XP (une seule fois)
      const isNew = await marquerModuleComplete('nutrition');
      if (isNew) {
        await addXpToProfil(XP.ONBOARDING_NUTRITION);
        await marquerXpDonne('nutrition');
        await loadProfile();
      }
      navigation.goBack();
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
        <Text variant="headingLarge">{strings.nutrition.setupTitle}</Text>
        <Text variant="bodySmall" color="textSecondary" style={styles.subtitle}>
          {strings.nutrition.setupSubtitle}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{strings.nutrition.kcalLabel}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={kcal}
              onChangeText={setKcal}
              keyboardType="number-pad"
              placeholder="2000"
              placeholderTextColor={theme.colors.textMuted}
            />
            <Text style={styles.unit}>kcal</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{strings.nutrition.proteinesLabel}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={proteines}
              onChangeText={setProteines}
              keyboardType="number-pad"
              placeholder="150"
              placeholderTextColor={theme.colors.textMuted}
            />
            <Text style={styles.unit}>g</Text>
          </View>
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
    gap: theme.spacing.xs,
  },
  backBtn: { marginBottom: theme.spacing.xs },
  backText: { color: theme.colors.primary, fontSize: 16 },
  subtitle: { marginTop: theme.spacing.xs },
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
    fontSize: 24,
    fontWeight: '700',
  },
  unit: {
    color: theme.colors.textMuted,
    fontSize: 14,
    width: 36,
  },
  saveBtn: { marginTop: theme.spacing.md },
});
