import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '@/shared/components/Button';
import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { useUpdateStore } from '@/state/updateStore';
import { strings } from '@/shared/strings';
import { theme } from '@/shared/theme';
import type { RootStackParamList } from '@/app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ReleaseNotes'>;

/**
 * Écran modal présentant les notes de la dernière version disponible (cahier
 * section 9.9). Les informations sont lues dans le store de mise à jour. Le
 * bouton d'action dépend de la plateforme : téléchargement de l'APK (Android)
 * ou ouverture de TestFlight / page de release (iOS).
 */
export function ReleaseNotesScreen({ navigation }: Props) {
  const u = strings.updates;
  const update = useUpdateStore((state) => state.update);

  const installLabel = Platform.OS === 'ios' ? u.installIos : u.installAndroid;

  return (
    <Screen paddingHorizontal={0}>
      <View style={styles.headerRow}>
        <Text variant="heading">{u.notesTitle}</Text>
        <Button
          label={strings.common.close}
          variant="ghost"
          size="sm"
          onPress={() => navigation.goBack()}
        />
      </View>

      {update === null ? (
        <View style={styles.emptyWrapper}>
          <Text variant="body" color="textSecondary" center>
            {u.notesEmpty}
          </Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text variant="label" color="primary">
              {u.notesVersionLabel.replace('{v}', update.version)}
            </Text>
            <Text variant="body" color="textSecondary" style={styles.notes}>
              {update.notes !== '' ? update.notes : u.notesEmpty}
            </Text>
            {update.releaseUrl !== '' && (
              <Button
                label={u.notesViewOnline}
                variant="ghost"
                size="sm"
                onPress={() => void Linking.openURL(update.releaseUrl)}
              />
            )}
          </ScrollView>
          <View style={styles.footer}>
            <Button
              label={installLabel}
              fullWidth
              onPress={() => void Linking.openURL(update.actionUrl)}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  notes: {
    lineHeight: 22,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
