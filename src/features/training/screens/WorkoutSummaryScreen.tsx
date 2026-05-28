import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { Button } from '@/shared/components/Button';
import { strings } from '@/shared/strings';
import { theme } from '@/shared/theme';
import type { RootStackParamList } from '@/app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutSummary'>;

export function WorkoutSummaryScreen({ navigation, route }: Props) {
  const { xpEarned, isSeanceZero } = route.params;

  const title = isSeanceZero ? strings.summary.titleSeanceZero : strings.summary.title;

  const xpLabel = strings.summary.xpEarned.replace('{xp}', String(xpEarned));

  const handleBack = () => {
    navigation.navigate('Main');
  };

  return (
    <Screen paddingHorizontal={0}>
      <View style={styles.container}>
        <View style={styles.main}>
          <Text variant="displayLarge" style={styles.trophy}>
            {isSeanceZero ? '🏆' : '✅'}
          </Text>

          <Text variant="headingLarge" style={styles.title}>
            {title}
          </Text>

          <View style={styles.xpBadge}>
            <Text variant="numeric" style={styles.xpText}>
              {xpLabel}
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              {isSeanceZero ? 'Bonus première fois !' : 'XP gagné'}
            </Text>
          </View>

          {isSeanceZero && (
            <Text variant="body" color="textSecondary" style={styles.nudge}>
              {strings.summary.nudgeSeanceZero}
            </Text>
          )}
        </View>

        <Button
          label={strings.summary.backToHome}
          fullWidth
          style={styles.backBtn}
          onPress={handleBack}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  trophy: {
    fontSize: 72,
    lineHeight: 88,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
  },
  xpBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.xs,
  },
  xpText: {
    color: theme.colors.xp,
  },
  nudge: {
    textAlign: 'center',
    maxWidth: 280,
  },
  backBtn: {},
});
