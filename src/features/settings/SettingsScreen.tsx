import { ScrollView, StyleSheet, View } from 'react-native';
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

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function SettingsScreen({ navigation }: Props) {
  const { profile } = useProfileStore();

  const versionLabel = strings.settings.version.replace('{v}', branding.app.version);

  return (
    <Screen paddingHorizontal={0}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Titre */}
        <Text variant="headingLarge" style={styles.pageTitle}>
          {strings.settings.title}
        </Text>

        {/* Section Profil */}
        {profile !== null && (
          <View style={styles.section}>
            <Text variant="label" color="textMuted" style={styles.sectionTitle}>
              {strings.settings.profile}
            </Text>
            <Card variant="elevated">
              <View style={styles.settingRow}>
                <Text variant="bodySmall" color="textSecondary">
                  {strings.settings.profileName}
                </Text>
                <Text variant="body">{profile.prenom}</Text>
              </View>
            </Card>
          </View>
        )}

        {/* Section Entraînement */}
        <View style={styles.section}>
          <Text variant="label" color="textMuted" style={styles.sectionTitle}>
            {strings.settings.entrainement}
          </Text>
          <Card variant="elevated">
            <View style={styles.settingRowBtn}>
              <View style={styles.settingInfo}>
                <Text variant="body">{strings.settings.programs}</Text>
                <Text variant="bodySmall" color="textSecondary">
                  {strings.settings.programsSubtitle}
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
                <Text variant="body">{strings.settings.planning}</Text>
                <Text variant="bodySmall" color="textSecondary">
                  {strings.settings.planningSubtitle}
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
                <Text variant="body">{strings.settings.reminders}</Text>
                <Text variant="bodySmall" color="textSecondary">
                  {strings.settings.remindersSubtitle}
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
                <Text variant="body">{strings.settings.nutrition}</Text>
                <Text variant="bodySmall" color="textSecondary">
                  {strings.settings.nutritionSubtitle}
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

        {/* Version */}
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
