import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { useProfileStore } from '@/state/profileStore';
import { strings } from '@/shared/strings';
import { theme } from '@/shared/theme';
import type { RootStackParamList, MainTabParamList } from '@/app/navigation/types';
import { branding } from '@branding/branding.config';
import { exportAndShare, importFromFile } from '@/shared/backupService';
import { clearAllData } from '@/db/repositories/backupRepository';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function SettingsScreen({ navigation }: Props) {
  const { profile, resetProfile } = useProfileStore();
  const s = strings.settings;

  const versionLabel = s.version.replace('{v}', branding.app.version);

  async function handleExport() {
    try {
      const ok = await exportAndShare();
      if (!ok) {
        Alert.alert(strings.common.error, s.exportError);
      }
    } catch {
      Alert.alert(strings.common.error, s.exportError);
    }
  }

  async function handleImport() {
    const result = await importFromFile();
    if (result.ok === false) {
      if (result.reason === 'cancelled') return;
      const msg =
        result.reason === 'invalid_file'
          ? s.importErrorInvalid
          : result.reason === 'incompatible_version'
            ? s.importErrorVersion
            : s.importErrorGeneric;
      Alert.alert(strings.common.error, msg);
      return;
    }
    Alert.alert('', s.importSuccess, [{ text: strings.common.ok }]);
    resetProfile();
  }

  function handleImportPress() {
    Alert.alert(s.importConfirmTitle, s.importConfirmBody, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: s.importConfirmYes,
        style: 'destructive',
        onPress: () => void handleImport(),
      },
    ]);
  }

  function handleClearPress() {
    Alert.alert(s.clearConfirm1Title, s.clearConfirm1Body, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: s.clearConfirm1Yes,
        style: 'destructive',
        onPress: () => {
          Alert.alert(s.clearConfirm2Title, s.clearConfirm2Body, [
            { text: strings.common.cancel, style: 'cancel' },
            {
              text: s.clearConfirm2Yes,
              style: 'destructive',
              onPress: () => void handleClearConfirmed(),
            },
          ]);
        },
      },
    ]);
  }

  async function handleClearConfirmed() {
    try {
      await clearAllData();
      Alert.alert('', s.clearSuccess, [{ text: strings.common.ok }]);
      resetProfile();
    } catch {
      Alert.alert(strings.common.error, s.clearError);
    }
  }

  return (
    <Screen paddingHorizontal={0}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="headingLarge" style={styles.pageTitle}>
          {s.title}
        </Text>

        {/* Section Profil */}
        {profile !== null && (
          <View style={styles.section}>
            <Text variant="label" color="textMuted" style={styles.sectionTitle}>
              {s.profile}
            </Text>
            <Card variant="elevated">
              <View style={styles.settingRow}>
                <Text variant="bodySmall" color="textSecondary">
                  {s.profileName}
                </Text>
                <Text variant="body">{profile.prenom}</Text>
              </View>
            </Card>
          </View>
        )}

        {/* Section Entraînement */}
        <View style={styles.section}>
          <Text variant="label" color="textMuted" style={styles.sectionTitle}>
            {s.entrainement}
          </Text>
          <Card variant="elevated">
            <View style={styles.settingRowBtn}>
              <View style={styles.settingInfo}>
                <Text variant="body">{s.programs}</Text>
                <Text variant="bodySmall" color="textSecondary">
                  {s.programsSubtitle}
                </Text>
              </View>
              <Button
                label={strings.programs.editButton}
                size="sm"
                variant="secondary"
                onPress={() => navigation.navigate('ProgramList')}
              />
            </View>
            <View style={[styles.settingRowBtn, styles.settingBorder]}>
              <View style={styles.settingInfo}>
                <Text variant="body">{s.planning}</Text>
                <Text variant="bodySmall" color="textSecondary">
                  {s.planningSubtitle}
                </Text>
              </View>
              <Button
                label={strings.programs.editButton}
                size="sm"
                variant="secondary"
                onPress={() => navigation.navigate('MacroPlanning')}
              />
            </View>
            <View style={[styles.settingRowBtn, styles.settingBorder]}>
              <View style={styles.settingInfo}>
                <Text variant="body">{s.reminders}</Text>
                <Text variant="bodySmall" color="textSecondary">
                  {s.remindersSubtitle}
                </Text>
              </View>
              <Button
                label={strings.programs.editButton}
                size="sm"
                variant="secondary"
                onPress={() => navigation.navigate('Reminders')}
              />
            </View>
            <View style={[styles.settingRowBtn, styles.settingBorder]}>
              <View style={styles.settingInfo}>
                <Text variant="body">{s.nutrition}</Text>
                <Text variant="bodySmall" color="textSecondary">
                  {s.nutritionSubtitle}
                </Text>
              </View>
              <Button
                label={strings.programs.editButton}
                size="sm"
                variant="secondary"
                onPress={() => navigation.navigate('NutritionSetup')}
              />
            </View>
          </Card>
        </View>

        {/* Section Données */}
        <View style={styles.section}>
          <Text variant="label" color="textMuted" style={styles.sectionTitle}>
            {s.donneesSection}
          </Text>
          <Card variant="elevated">
            <View style={styles.settingRowBtn}>
              <View style={styles.settingInfo}>
                <Text variant="body">{s.exportLabel}</Text>
                <Text variant="bodySmall" color="textSecondary">
                  {s.exportSubtitle}
                </Text>
              </View>
              <Button
                label="Exporter"
                size="sm"
                variant="secondary"
                onPress={() => void handleExport()}
              />
            </View>
            <View style={[styles.settingRowBtn, styles.settingBorder]}>
              <View style={styles.settingInfo}>
                <Text variant="body">{s.importLabel}</Text>
                <Text variant="bodySmall" color="textSecondary">
                  {s.importSubtitle}
                </Text>
              </View>
              <Button label="Importer" size="sm" variant="secondary" onPress={handleImportPress} />
            </View>
          </Card>
        </View>

        {/* Section Zone danger */}
        <View style={styles.section}>
          <Text variant="label" color="textMuted" style={styles.sectionTitle}>
            {s.dangerZone}
          </Text>
          <Card variant="elevated">
            <View style={styles.settingRowBtn}>
              <View style={styles.settingInfo}>
                <Text variant="body" color="error">
                  {s.clearLabel}
                </Text>
                <Text variant="bodySmall" color="textSecondary">
                  {s.clearSubtitle}
                </Text>
              </View>
              <Button label="Effacer" size="sm" variant="destructive" onPress={handleClearPress} />
            </View>
          </Card>
        </View>

        <Text variant="caption" color="textMuted" style={styles.version}>
          {versionLabel}
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  pageTitle: {
    marginBottom: theme.spacing.xs,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  settingRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  settingBorder: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  settingInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  version: {
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});
