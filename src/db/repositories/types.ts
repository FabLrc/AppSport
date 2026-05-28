export type Objectif = 'recomposition' | 'prise_de_masse' | 'perte' | 'endurance';
export type Niveau = 'debutant' | 'intermediaire' | 'confirme';
export type RangKey = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'S+' | 'S++';
export type ModeCharge = 'charge' | 'poids_corps';
export type TypeExercice = 'compose' | 'isolation';
export type StatutSeance = 'en_cours' | 'completee';
export type DifficulteSubjective = 'facile' | 'correct' | 'difficile';

export interface Profil {
  id: 1;
  prenom: string;
  taille_cm: number | null;
  poids_depart_kg: number | null;
  objectif: Objectif;
  niveau: Niveau;
  xp_total: number;
  rang_courant: RangKey;
  streak_courant: number;
  gel_streak_disponible: boolean;
  date_derniere_activite: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateProfilInput = Pick<Profil, 'prenom' | 'objectif' | 'niveau'>;

export interface Exercice {
  id: number;
  nom: string;
  groupe_musculaire: string;
  type: TypeExercice;
  mode_charge: ModeCharge;
  variantes: string[] | null;
  description: string | null;
}

export interface SeanceType {
  id: number;
  nom: string;
  description: string | null;
  is_seance_zero: boolean;
  created_at: string;
}

export interface SeanceTypeExercice {
  id: number;
  seance_type_id: number;
  exercice_id: number;
  ordre: number;
  series_cible: number;
  reps_min: number;
  reps_max: number;
  duree_seconde_cible: number | null;
}

export interface Seance {
  id: number;
  date: string;
  seance_type_id: number | null;
  statut: StatutSeance;
  xp_attribue: number;
  created_at: string;
  completed_at: string | null;
}

export interface SeriePerformance {
  id: number;
  seance_id: number;
  exercice_id: number;
  ordre: number;
  charge_kg: number | null;
  reps_realisees: number;
  difficulte_subjective: DifficulteSubjective | null;
  created_at: string;
}

export interface ExerciceAvecConfig {
  exercice: Exercice;
  seance_type_exercice_id: number;
  ordre: number;
  series_cible: number;
  reps_min: number;
  reps_max: number;
  duree_seconde_cible: number | null;
}

export interface MesureCorporelle {
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

export type CreateMesureCorporelleInput = Omit<MesureCorporelle, 'id' | 'created_at'>;
export type UpdateMesureCorporelleInput = Partial<Omit<MesureCorporelle, 'id' | 'created_at'>>;
