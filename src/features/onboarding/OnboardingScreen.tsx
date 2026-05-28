import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { Button } from '@/shared/components/Button';
import { useProfileStore } from '@/state/profileStore';
import { strings } from '@/shared/strings';
import { theme } from '@/shared/theme';
import type { Objectif, Niveau } from '@/db/repositories/types';
import type { RootStackParamList } from '@/app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

type Step = 'prenom' | 'objectif' | 'niveau' | 'done';

const OBJECTIFS: { key: Objectif; label: string; description: string }[] = [
  {
    key: 'recomposition',
    label: strings.onboarding.stepObjectif.options.recomposition.label,
    description: strings.onboarding.stepObjectif.options.recomposition.description,
  },
  {
    key: 'prise_de_masse',
    label: strings.onboarding.stepObjectif.options.prise_de_masse.label,
    description: strings.onboarding.stepObjectif.options.prise_de_masse.description,
  },
  {
    key: 'perte',
    label: strings.onboarding.stepObjectif.options.perte.label,
    description: strings.onboarding.stepObjectif.options.perte.description,
  },
  {
    key: 'endurance',
    label: strings.onboarding.stepObjectif.options.endurance.label,
    description: strings.onboarding.stepObjectif.options.endurance.description,
  },
];

const NIVEAUX: { key: Niveau; label: string; description: string }[] = [
  {
    key: 'debutant',
    label: strings.onboarding.stepNiveau.options.debutant.label,
    description: strings.onboarding.stepNiveau.options.debutant.description,
  },
  {
    key: 'intermediaire',
    label: strings.onboarding.stepNiveau.options.intermediaire.label,
    description: strings.onboarding.stepNiveau.options.intermediaire.description,
  },
  {
    key: 'confirme',
    label: strings.onboarding.stepNiveau.options.confirme.label,
    description: strings.onboarding.stepNiveau.options.confirme.description,
  },
];

export function OnboardingScreen({ navigation }: Props) {
  const { createProfile } = useProfileStore();
  const [step, setStep] = useState<Step>('prenom');
  const [prenom, setPrenom] = useState('');
  const [prenomError, setPrenomError] = useState('');
  const [objectif, setObjectif] = useState<Objectif | null>(null);
  const [niveau, setNiveau] = useState<Niveau | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePrenomNext = () => {
    if (prenom.trim().length === 0) {
      setPrenomError(strings.onboarding.stepPrenom.errorRequired);
      return;
    }
    setPrenomError('');
    setStep('objectif');
  };

  const handleObjectifSelect = (key: Objectif) => {
    setObjectif(key);
    setStep('niveau');
  };

  const handleNiveauSelect = async (key: Niveau) => {
    setNiveau(key);
    setSaving(true);
    try {
      await createProfile({ prenom: prenom.trim(), objectif: objectif!, niveau: key });
      setStep('done');
    } finally {
      setSaving(false);
    }
  };

  const handleStartSeanceZero = () => {
    navigation.replace('Main');
    // Le HomeScreen détectera qu'il s'agit du premier lancement et proposera la Séance Zéro
  };

  const handleSkip = () => {
    navigation.replace('Main');
  };

  if (step === 'prenom') {
    return (
      <Screen paddingHorizontal={0}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.stepIndicator}>
              <StepDot active />
              <StepDot />
              <StepDot />
            </View>
            <Text variant="headingLarge" style={styles.title}>
              {strings.onboarding.stepPrenom.title}
            </Text>
            <Text variant="body" color="textSecondary" style={styles.subtitle}>
              {strings.onboarding.stepPrenom.subtitle}
            </Text>
            <TextInput
              style={[styles.textInput, prenomError ? styles.textInputError : null]}
              placeholder={strings.onboarding.stepPrenom.placeholder}
              placeholderTextColor={theme.colors.textMuted}
              value={prenom}
              onChangeText={(v) => {
                setPrenom(v);
                if (prenomError) setPrenomError('');
              }}
              autoFocus
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={handlePrenomNext}
            />
            {prenomError ? (
              <Text variant="bodySmall" color="error" style={styles.errorText}>
                {prenomError}
              </Text>
            ) : null}
            <Button
              label={strings.common.next}
              fullWidth
              style={styles.cta}
              onPress={handlePrenomNext}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </Screen>
    );
  }

  if (step === 'objectif') {
    return (
      <Screen paddingHorizontal={0}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.stepIndicator}>
            <StepDot done />
            <StepDot active />
            <StepDot />
          </View>
          <Text variant="headingLarge" style={styles.title}>
            {strings.onboarding.stepObjectif.title}
          </Text>
          <Text variant="body" color="textSecondary" style={styles.subtitle}>
            {strings.onboarding.stepObjectif.subtitle}
          </Text>
          {OBJECTIFS.map((opt) => (
            <ChoiceCard
              key={opt.key}
              label={opt.label}
              description={opt.description}
              selected={objectif === opt.key}
              onPress={() => handleObjectifSelect(opt.key)}
            />
          ))}
        </ScrollView>
      </Screen>
    );
  }

  if (step === 'niveau') {
    return (
      <Screen paddingHorizontal={0}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.stepIndicator}>
            <StepDot done />
            <StepDot done />
            <StepDot active />
          </View>
          <Text variant="headingLarge" style={styles.title}>
            {strings.onboarding.stepNiveau.title}
          </Text>
          <Text variant="body" color="textSecondary" style={styles.subtitle}>
            {strings.onboarding.stepNiveau.subtitle}
          </Text>
          {NIVEAUX.map((opt) => (
            <ChoiceCard
              key={opt.key}
              label={opt.label}
              description={opt.description}
              selected={niveau === opt.key}
              onPress={() => {
                setNiveau(opt.key);
                handleNiveauSelect(opt.key);
              }}
              disabled={saving}
            />
          ))}
        </ScrollView>
      </Screen>
    );
  }

  // step === 'done'
  const firstName = prenom.trim();
  return (
    <Screen paddingHorizontal={0}>
      <View style={styles.doneContent}>
        <Text variant="displayLarge" style={styles.doneEmoji}>
          🎉
        </Text>
        <Text variant="headingLarge" style={styles.title}>
          {strings.onboarding.done.title.replace('{prenom}', firstName)}
        </Text>
        <Text variant="body" color="textSecondary" style={styles.subtitle}>
          {strings.onboarding.done.subtitle}
        </Text>
        <View style={styles.doneActions}>
          <Button
            label={strings.onboarding.done.ctaSeanceZero}
            fullWidth
            style={styles.cta}
            onPress={handleStartSeanceZero}
          />
          <Button
            label={strings.onboarding.done.ctaSkip}
            variant="ghost"
            fullWidth
            onPress={handleSkip}
          />
        </View>
      </View>
    </Screen>
  );
}

function StepDot({ active, done }: { active?: boolean; done?: boolean }) {
  return (
    <View style={[styles.dot, active ? styles.dotActive : null, done ? styles.dotDone : null]} />
  );
}

function ChoiceCard({
  label,
  description,
  selected,
  onPress,
  disabled,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.choiceCard, selected ? styles.choiceCardSelected : null]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
    >
      <Text variant="headingSmall" color={selected ? 'primary' : 'text'}>
        {label}
      </Text>
      <Text variant="bodySmall" color="textSecondary" style={styles.choiceDesc}>
        {description}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  dotActive: { backgroundColor: theme.colors.primary, width: 24 },
  dotDone: { backgroundColor: theme.colors.success },
  title: { marginBottom: theme.spacing.xs },
  subtitle: { marginBottom: theme.spacing.lg },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 17,
    marginBottom: theme.spacing.sm,
  },
  textInputError: { borderColor: theme.colors.error },
  errorText: { marginBottom: theme.spacing.sm },
  cta: { marginTop: theme.spacing.md },
  choiceCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  choiceCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  choiceDesc: { marginTop: theme.spacing.xs },
  doneContent: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  doneEmoji: { textAlign: 'center', marginBottom: theme.spacing.lg },
  doneActions: { marginTop: theme.spacing.xxl, gap: theme.spacing.md },
});
