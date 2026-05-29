import { useEffect, useState } from 'react';
import {
  Alert,
  ActionSheetIOS,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Paths, File, Directory } from 'expo-file-system';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/Text';
import { Button } from '@/shared/components/Button';
import { theme } from '@/shared/theme';
import { strings } from '@/shared/strings';
import {
  createMesure,
  getMesureById,
  updateMesure,
} from '@/db/repositories/mesureCorporelleRepository';
import {
  marquerModuleComplete,
  marquerXpDonne,
} from '@/db/repositories/onboardingProgressionRepository';
import { addXpToProfil } from '@/db/repositories/profilRepository';
import { useProfileStore } from '@/state/profileStore';
import { XP } from '@/domain/xp';
import type { RootStackParamList } from '@/app/navigation/types';

type RouteParams = RouteProp<RootStackParamList, 'AddMeasurement'>;

type MesureKey =
  | 'poids_kg'
  | 'tour_taille_cm'
  | 'tour_hanches_cm'
  | 'tour_poitrine_cm'
  | 'tour_bras_cm'
  | 'tour_cuisses_cm';

const FIELDS: Array<{ key: MesureKey; label: string; unit: string }> = [
  {
    key: 'poids_kg',
    label: strings.bodyTracking.measures.poids_kg,
    unit: strings.bodyTracking.units.poids_kg,
  },
  {
    key: 'tour_taille_cm',
    label: strings.bodyTracking.measures.tour_taille_cm,
    unit: strings.bodyTracking.units.tour_taille_cm,
  },
  {
    key: 'tour_hanches_cm',
    label: strings.bodyTracking.measures.tour_hanches_cm,
    unit: strings.bodyTracking.units.tour_hanches_cm,
  },
  {
    key: 'tour_poitrine_cm',
    label: strings.bodyTracking.measures.tour_poitrine_cm,
    unit: strings.bodyTracking.units.tour_poitrine_cm,
  },
  {
    key: 'tour_bras_cm',
    label: strings.bodyTracking.measures.tour_bras_cm,
    unit: strings.bodyTracking.units.tour_bras_cm,
  },
  {
    key: 'tour_cuisses_cm',
    label: strings.bodyTracking.measures.tour_cuisses_cm,
    unit: strings.bodyTracking.units.tour_cuisses_cm,
  },
];

function copyPhotoToAppDir(uri: string): string {
  const photosDir = new Directory(Paths.document, 'photos');
  if (!photosDir.exists) {
    photosDir.create({ idempotent: true });
  }
  const ext = uri.split('.').pop() ?? 'jpg';
  const filename = `progress_${Date.now()}.${ext}`;
  const destFile = new File(photosDir, filename);
  const sourceFile = new File(uri);
  sourceFile.copy(destFile);
  return destFile.uri;
}

export function AddMeasurementScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const { loadProfile } = useProfileStore();
  const mesureId = route.params?.mesureId;

  const today = new Date().toISOString().split('T')[0] ?? '';

  const [values, setValues] = useState<Record<MesureKey, string>>({
    poids_kg: '',
    tour_taille_cm: '',
    tour_hanches_cm: '',
    tour_poitrine_cm: '',
    tour_bras_cm: '',
    tour_cuisses_cm: '',
  });
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mesureId === undefined) return;
    getMesureById(mesureId).then((m) => {
      if (m === null) return;
      setValues({
        poids_kg: m.poids_kg !== null ? String(m.poids_kg) : '',
        tour_taille_cm: m.tour_taille_cm !== null ? String(m.tour_taille_cm) : '',
        tour_hanches_cm: m.tour_hanches_cm !== null ? String(m.tour_hanches_cm) : '',
        tour_poitrine_cm: m.tour_poitrine_cm !== null ? String(m.tour_poitrine_cm) : '',
        tour_bras_cm: m.tour_bras_cm !== null ? String(m.tour_bras_cm) : '',
        tour_cuisses_cm: m.tour_cuisses_cm !== null ? String(m.tour_cuisses_cm) : '',
      });
      setNotes(m.notes ?? '');
      setPhotoUri(m.photo_uri);
    });
  }, [mesureId]);

  function parseField(raw: string): number | null {
    const n = parseFloat(raw.replace(',', '.'));
    return isNaN(n) ? null : n;
  }

  async function pickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(strings.addMeasure.permissionDeniedTitle, strings.addMeasure.permissionGallery);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled && result.assets[0]) {
      const dest = copyPhotoToAppDir(result.assets[0].uri);
      setPhotoUri(dest);
    }
  }

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(strings.addMeasure.permissionDeniedTitle, strings.addMeasure.permissionCamera);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled && result.assets[0]) {
      const dest = copyPhotoToAppDir(result.assets[0].uri);
      setPhotoUri(dest);
    }
  }

  function showPhotoOptions() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            strings.common.cancel,
            strings.addMeasure.photoSourceCamera,
            strings.addMeasure.photoSourceGallery,
          ],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) void pickFromCamera();
          if (idx === 2) void pickFromGallery();
        },
      );
    } else {
      Alert.alert(strings.addMeasure.photoSourceTitle, undefined, [
        { text: strings.common.cancel, style: 'cancel' },
        { text: strings.addMeasure.photoSourceCamera, onPress: () => void pickFromCamera() },
        { text: strings.addMeasure.photoSourceGallery, onPress: () => void pickFromGallery() },
      ]);
    }
  }

  async function handleSave() {
    const parsed = {
      poids_kg: parseField(values.poids_kg),
      tour_taille_cm: parseField(values.tour_taille_cm),
      tour_hanches_cm: parseField(values.tour_hanches_cm),
      tour_poitrine_cm: parseField(values.tour_poitrine_cm),
      tour_bras_cm: parseField(values.tour_bras_cm),
      tour_cuisses_cm: parseField(values.tour_cuisses_cm),
    };

    const hasValue = Object.values(parsed).some((v) => v !== null) || photoUri !== null;
    if (!hasValue) {
      Alert.alert(strings.common.error, strings.addMeasure.errorEmpty);
      return;
    }

    setSaving(true);
    try {
      if (mesureId !== undefined) {
        await updateMesure(mesureId, { ...parsed, photo_uri: photoUri, notes: notes || null });
      } else {
        await createMesure({
          date: today,
          ...parsed,
          photo_uri: photoUri,
          notes: notes || null,
        });
        // XP mensurations + onboarding (une seule fois)
        await addXpToProfil(XP.MENSURATIONS);
        const isFirst = await marquerModuleComplete('mensurations');
        if (isFirst) {
          await addXpToProfil(XP.ONBOARDING_MENSURATIONS);
          await marquerXpDonne('mensurations');
        }
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
        <Text variant="headingLarge">
          {mesureId !== undefined ? strings.addMeasure.editTitle : strings.addMeasure.title}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {FIELDS.map(({ key, label, unit }) => (
          <View key={key} style={styles.field}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={values[key]}
                onChangeText={(t) => setValues((prev) => ({ ...prev, [key]: t }))}
                keyboardType="decimal-pad"
                placeholder="—"
                placeholderTextColor={theme.colors.textMuted}
              />
              <Text style={styles.unit}>{unit}</Text>
            </View>
          </View>
        ))}

        {/* Photo */}
        <View style={styles.photoSection}>
          <Text style={styles.fieldLabel}>{strings.addMeasure.photoLabel}</Text>
          {photoUri !== null ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
              <View style={styles.photoActions}>
                <TouchableOpacity onPress={showPhotoOptions} style={styles.photoBtn}>
                  <Text style={styles.photoBtnText}>{strings.addMeasure.changePhoto}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPhotoUri(null)}
                  style={[styles.photoBtn, styles.photoBtnDanger]}
                >
                  <Text style={[styles.photoBtnText, styles.photoBtnDangerText]}>
                    {strings.addMeasure.removePhoto}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={showPhotoOptions} style={styles.addPhotoBtn}>
              <Text style={styles.addPhotoBtnText}>📷 {strings.addMeasure.addPhoto}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{strings.addMeasure.notesLabel}</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Rien à noter"
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  field: {
    gap: theme.spacing.xs,
  },
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
    width: 28,
  },
  photoSection: {
    gap: theme.spacing.sm,
  },
  photoContainer: {
    gap: theme.spacing.sm,
  },
  photoPreview: {
    width: '100%',
    height: 220,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  photoActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  photoBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  photoBtnDanger: {
    borderColor: theme.colors.error,
  },
  photoBtnText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  photoBtnDangerText: {
    color: theme.colors.error,
  },
  addPhotoBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  addPhotoBtnText: {
    color: theme.colors.textMuted,
    fontSize: 15,
  },
  saveBtn: {
    marginTop: theme.spacing.lg,
  },
});
