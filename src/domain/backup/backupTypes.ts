export const BACKUP_SCHEMA_VERSION = '1.0';

export interface BackupRawProfil {
  id: 1;
  prenom: string;
  taille_cm: number | null;
  poids_depart_kg: number | null;
  objectif: string;
  niveau: string;
  xp_total: number;
  rang_courant: string;
  streak_courant: number;
  gel_streak_disponible: number;
  date_derniere_activite: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackupRawExercice {
  id: number;
  nom: string;
  groupe_musculaire: string;
  type: string;
  mode_charge: string;
  variantes: string | null;
  description: string | null;
}

export interface BackupRawSeanceType {
  id: number;
  nom: string;
  description: string | null;
  is_seance_zero: number;
  created_at: string;
}

export interface BackupRawSeanceTypeExercice {
  id: number;
  seance_type_id: number;
  exercice_id: number;
  ordre: number;
  series_cible: number;
  reps_min: number;
  reps_max: number;
  duree_seconde_cible: number | null;
}

export interface BackupRawSeance {
  id: number;
  date: string;
  seance_type_id: number | null;
  statut: string;
  xp_attribue: number;
  created_at: string;
  completed_at: string | null;
}

export interface BackupRawSeriePerformance {
  id: number;
  seance_id: number;
  exercice_id: number;
  ordre: number;
  charge_kg: number | null;
  reps_realisees: number;
  difficulte_subjective: string | null;
  created_at: string;
}

export interface BackupRawMesureCorporelle {
  id: number;
  date: string;
  poids_kg: number | null;
  tour_taille_cm: number | null;
  tour_hanches_cm: number | null;
  tour_poitrine_cm: number | null;
  tour_bras_cm: number | null;
  tour_cuisses_cm: number | null;
  photo_uri: string | null;
  notes: string | null;
  created_at: string;
}

export interface BackupRawCourse {
  id: number;
  date: string;
  distance_km: number;
  duree_minutes: number;
  allure_min_par_km: number;
  ressenti: number | null;
  statut: string;
  xp_attribue: number;
  notes: string | null;
  created_at: string;
}

export interface BackupRawMacroPlanning {
  id: 1;
  lundi: string;
  mardi: string;
  mercredi: string;
  jeudi: string;
  vendredi: string;
  samedi: string;
  dimanche: string;
}

export interface BackupRawJournalRappel {
  id: number;
  type: string;
  actif: number;
  horaire: string;
  notification_ids: string;
}

export interface BackupRawObjectifNutritionnel {
  id: 1;
  kcal_cible: number;
  proteines_g: number;
}

export interface BackupRawValidationNutrition {
  date: string;
  atteint: number;
  created_at: string;
}

export interface BackupRawOnboardingProgression {
  id: 1;
  mensurations_configure: number;
  rappels_configure: number;
  nutrition_configure: number;
  planning_configure: number;
  mensurations_xp_donne: number;
  rappels_xp_donne: number;
  nutrition_xp_donne: number;
  planning_xp_donne: number;
}

export interface AppBackup {
  schema_version: string;
  app_version: string;
  exported_at: string;
  data: {
    profil: BackupRawProfil | null;
    exercices: BackupRawExercice[];
    seance_types: BackupRawSeanceType[];
    seance_type_exercices: BackupRawSeanceTypeExercice[];
    seances: BackupRawSeance[];
    serie_performances: BackupRawSeriePerformance[];
    mesures_corporelles: BackupRawMesureCorporelle[];
    courses: BackupRawCourse[];
    macro_planning: BackupRawMacroPlanning | null;
    journal_rappels: BackupRawJournalRappel[];
    objectif_nutritionnel: BackupRawObjectifNutritionnel | null;
    validations_nutrition: BackupRawValidationNutrition[];
    onboarding_progression: BackupRawOnboardingProgression | null;
  };
}
