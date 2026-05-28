import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { theme } from '@/shared/theme';
import { strings } from '@/shared/strings';
import { getAllRappels, updateRappel } from '@/db/repositories/journalRappelRepository';
import {
  marquerModuleComplete,
  marquerXpDonne,
} from '@/db/repositories/onboardingProgressionRepository';
import { addXpToProfil } from '@/db/repositories/profilRepository';
import { useProfileStore } from '@/state/profileStore';
import { XP } from '@/domain/xp';
import { syncRappel } from '@/shared/notifications';
import type { JournalRappel, RappelType } from '@/db/repositories/types';

const RAPPEL_META: Record<
  RappelType,
  { icon: string; description: string; timeEditable: boolean }
> = {
  seance_musculation: {
    icon: '🏋️',
    description: strings.reminders.desc_seance_musculation,
    timeEditable: true,
  },
  course: {
    icon: '🏃',
    description: strings.reminders.desc_course,
    timeEditable: true,
  },
  hydratation: {
    icon: '💧',
    description: strings.reminders.desc_hydratation,
    timeEditable: false,
  },
  petit_dejeuner: {
    icon: '🥐',
    description: strings.reminders.desc_petit_dejeuner,
    timeEditable: true,
  },
  dejeuner: {
    icon: '🥗',
    description: strings.reminders.desc_dejeuner,
    timeEditable: true,
  },
  collation: {
    icon: '🍎',
    description: strings.reminders.desc_collation,
    timeEditable: true,
  },
  diner: {
    icon: '🍽️',
    description: strings.reminders.desc_diner,
    timeEditable: true,
  },
  pause_posture: {
    icon: '🧘',
    description: strings.reminders.desc_pause_posture,
    timeEditable: false,
  },
  mensurations: {
    icon: '📏',
    description: strings.reminders.desc_mensurations,
    timeEditable: true,
  },
};

function isValidHoraire(s: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(s);
}

function RappelRow({
  rappel,
  onToggle,
  onTimeChange,
}: {
  rappel: JournalRappel;
  onToggle: (type: RappelType, value: boolean) => void;
  onTimeChange: (type: RappelType, horaire: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(rappel.horaire);
  const meta = RAPPEL_META[rappel.type];
  const label = strings.reminders.types[rappel.type];

  function commitTime() {
    if (!isValidHoraire(draft)) {
      setDraft(rappel.horaire);
      Alert.alert(strings.common.error, strings.reminders.invalidTime);
    } else if (draft !== rappel.horaire) {
      onTimeChange(rappel.type, draft);
    }
    setEditing(false);
  }

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.rowHeader}>
          <Text style={styles.rowIcon}>{meta?.icon ?? '🔔'}</Text>
          <Text style={styles.rowLabel}>{label}</Text>
        </View>
        <Text style={styles.rowDesc}>{meta?.description ?? ''}</Text>
        {meta?.timeEditable && rappel.actif && (
          <TouchableOpacity onPress={() => setEditing((e) => !e)} style={styles.timeRow}>
            {editing ? (
              <TextInput
                style={styles.timeInput}
                value={draft}
                onChangeText={setDraft}
                autoFocus
                keyboardType="numbers-and-punctuation"
                onBlur={commitTime}
                onSubmitEditing={commitTime}
                maxLength={5}
                returnKeyType="done"
              />
            ) : (
              <Text style={styles.timeValue}>{rappel.horaire}</Text>
            )}
            <Text style={styles.timeEdit}>{editing ? '✓' : strings.reminders.editTime}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Switch
        value={rappel.actif}
        onValueChange={(v) => onToggle(rappel.type, v)}
        trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
        thumbColor={theme.colors.surface}
      />
    </View>
  );
}

export function RemindersScreen() {
  const navigation = useNavigation();
  const { loadProfile } = useProfileStore();
  const [rappels, setRappels] = useState<JournalRappel[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllRappels().then(setRappels);
      void (async () => {
        const isNew = await marquerModuleComplete('rappels');
        if (isNew) {
          await addXpToProfil(XP.ONBOARDING_RAPPELS);
          await marquerXpDonne('rappels');
          await loadProfile();
        }
      })();
    }, [loadProfile]),
  );

  async function handleToggle(type: RappelType, value: boolean) {
    setRappels((prev) => prev.map((r) => (r.type === type ? { ...r, actif: value } : r)));
    await updateRappel(type, { actif: value });
    await syncRappel(type);
  }

  async function handleTimeChange(type: RappelType, horaire: string) {
    setRappels((prev) => prev.map((r) => (r.type === type ? { ...r, horaire } : r)));
    await updateRappel(type, { horaire });
    await syncRappel(type);
  }

  return (
    <Screen paddingHorizontal={0}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ {strings.common.back}</Text>
        </TouchableOpacity>
        <Text variant="headingLarge">{strings.reminders.title}</Text>
        <Text variant="bodySmall" color="textSecondary" style={styles.subtitle}>
          {strings.reminders.subtitle}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {rappels.length === 0 ? (
          <Text color="textMuted" style={styles.loading}>
            {strings.common.loading}
          </Text>
        ) : (
          rappels.map((r) => (
            <RappelRow
              key={r.type}
              rappel={r}
              onToggle={handleToggle}
              onTimeChange={handleTimeChange}
            />
          ))
        )}
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
  },
  loading: { textAlign: 'center', marginTop: theme.spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  rowLeft: {
    flex: 1,
    gap: 4,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  rowIcon: { fontSize: 18 },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  rowDesc: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 17,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: 4,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  timeInput: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    minWidth: 44,
    paddingVertical: 2,
  },
  timeEdit: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
});
