import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { getAllSeanceTypes } from '@/db/repositories/seanceTypeRepository';
import { strings } from '@/shared/strings';
import { theme } from '@/shared/theme';
import type { SeanceType } from '@/db/repositories/types';
import type { RootStackParamList } from '@/app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProgramList'>;

export function ProgramListScreen({ navigation }: Props) {
  const [seanceTypes, setSeanceTypes] = useState<SeanceType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const types = await getAllSeanceTypes();
    // Exclut la Séance Zéro — elle n'est pas un programme éditable
    setSeanceTypes(types.filter((t) => !t.is_seance_zero));
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  return (
    <Screen paddingHorizontal={0}>
      <View style={styles.header}>
        <Button
          label={strings.common.back}
          variant="ghost"
          size="sm"
          onPress={() => navigation.goBack()}
        />
        <Text variant="headingSmall" style={styles.headerTitle}>
          {strings.programs.title}
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
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {seanceTypes.map((st) => (
            <Card key={st.id} variant="elevated" style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.cardInfo}>
                  <Text variant="headingSmall">{st.nom}</Text>
                  {st.description !== null && (
                    <Text variant="bodySmall" color="textSecondary">
                      {st.description}
                    </Text>
                  )}
                </View>
                <Button
                  label={strings.programs.editButton}
                  size="sm"
                  variant="secondary"
                  onPress={() =>
                    navigation.navigate('ProgramEdit', {
                      seanceTypeId: st.id,
                      seanceTypeName: st.nom,
                    })
                  }
                />
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
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
  content: {
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
  card: {},
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  cardInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
});
