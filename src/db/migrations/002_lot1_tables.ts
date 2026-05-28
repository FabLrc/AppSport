import type { Migration } from '../migrate';

interface ExerciceSeed {
  nom: string;
  groupe_musculaire: string;
  type: string;
  mode_charge: string;
  variantes: readonly string[] | null;
  description: string | null;
}

const EXERCICES: readonly ExerciceSeed[] = [
  // --- Séance Zéro (ids 1-6, seront insérés en premier) ---
  {
    nom: 'Pompes',
    groupe_musculaire: 'Poitrine',
    type: 'compose',
    mode_charge: 'poids_corps',
    variantes: ['Pompes normales', 'Pompes déclinées', 'Pompes pieds surélevés', 'Pompes claquées'],
    description:
      'En position de planche, mains à la largeur des épaules. Fléchis les coudes pour descendre la poitrine puis pousse pour revenir.',
  },
  {
    nom: 'Squats corps',
    groupe_musculaire: 'Quadriceps',
    type: 'compose',
    mode_charge: 'poids_corps',
    variantes: ['Squats normaux', 'Squats sautés', 'Squats bulgares', 'Pistol squat'],
    description:
      "Pieds à la largeur des épaules, orteils légèrement ouverts. Descends les hanches jusqu'à ce que les cuisses soient parallèles au sol.",
  },
  {
    nom: 'Gainage',
    groupe_musculaire: 'Core',
    type: 'compose',
    mode_charge: 'poids_corps',
    variantes: ['Gainage frontal', 'Gainage latéral', 'Gainage dynamique'],
    description:
      'En appui sur les avant-bras et les orteils, dos droit et abdos gainés. Tiens la position sans laisser les hanches tomber.',
  },
  {
    nom: 'Fentes alternées',
    groupe_musculaire: 'Quadriceps',
    type: 'compose',
    mode_charge: 'poids_corps',
    variantes: ['Fentes alternées', 'Fentes bulgares', 'Fentes sautées'],
    description:
      'Debout, fais un grand pas en avant et descends le genou arrière près du sol. Reviens et alterne les jambes.',
  },
  {
    nom: 'Crunchs',
    groupe_musculaire: 'Core',
    type: 'isolation',
    mode_charge: 'poids_corps',
    variantes: ['Crunchs', 'Relevés de jambes', 'Pédalier', 'Crunchs lestés'],
    description:
      'Allongé sur le dos, genoux fléchis. Soulève les épaules en contractant les abdos, sans tirer sur la nuque.',
  },
  {
    nom: 'Dips sur chaise',
    groupe_musculaire: 'Triceps',
    type: 'compose',
    mode_charge: 'poids_corps',
    variantes: ['Dips sur chaise', 'Dips sur parallèles', 'Dips lestés'],
    description:
      "Mains sur le bord d'une chaise derrière toi, jambes tendues. Fléchis les coudes pour descendre les hanches puis pousse.",
  },
  // --- Catalogue avec charge (ids 7-16) ---
  {
    nom: 'Développé couché',
    groupe_musculaire: 'Poitrine',
    type: 'compose',
    mode_charge: 'charge',
    variantes: null,
    description: null,
  },
  {
    nom: 'Rowing haltères',
    groupe_musculaire: 'Dos',
    type: 'compose',
    mode_charge: 'charge',
    variantes: null,
    description: null,
  },
  {
    nom: 'Développé militaire',
    groupe_musculaire: 'Épaules',
    type: 'compose',
    mode_charge: 'charge',
    variantes: null,
    description: null,
  },
  {
    nom: 'Curl biceps haltères',
    groupe_musculaire: 'Biceps',
    type: 'isolation',
    mode_charge: 'charge',
    variantes: null,
    description: null,
  },
  {
    nom: 'Extension triceps poulie',
    groupe_musculaire: 'Triceps',
    type: 'isolation',
    mode_charge: 'charge',
    variantes: null,
    description: null,
  },
  {
    nom: 'Squat barre',
    groupe_musculaire: 'Quadriceps',
    type: 'compose',
    mode_charge: 'charge',
    variantes: null,
    description: null,
  },
  {
    nom: 'Soulevé de terre roumain',
    groupe_musculaire: 'Ischio-jambiers',
    type: 'compose',
    mode_charge: 'charge',
    variantes: null,
    description: null,
  },
  {
    nom: 'Fentes haltères',
    groupe_musculaire: 'Quadriceps',
    type: 'compose',
    mode_charge: 'charge',
    variantes: null,
    description: null,
  },
  {
    nom: 'Élévations mollets',
    groupe_musculaire: 'Mollets',
    type: 'isolation',
    mode_charge: 'charge',
    variantes: null,
    description: null,
  },
  {
    nom: 'Tractions',
    groupe_musculaire: 'Dos',
    type: 'compose',
    mode_charge: 'poids_corps',
    variantes: [
      'Tractions australiennes',
      'Tractions assistées (élastique)',
      'Tractions normales',
      'Tractions lestées',
    ],
    description:
      "Suspendu à une barre, paumes vers l'avant. Tire jusqu'à ce que le menton dépasse la barre.",
  },
];

// Exercice IDs (by insertion order, table starts empty on first install)
const EX = {
  POMPES: 1,
  SQUATS_CORPS: 2,
  GAINAGE: 3,
  FENTES_ALTERNEES: 4,
  CRUNCHS: 5,
  DIPS_CHAISE: 6,
  DEVELOPPE_COUCHE: 7,
  ROWING: 8,
  MILITAIRE: 9,
  CURL: 10,
  EXTENSION: 11,
  SQUAT_BARRE: 12,
  SDT_ROUMAIN: 13,
  FENTES_HALT: 14,
  MOLLETS: 15,
  // TRACTIONS: 16 — disponible dans le catalogue mais pas dans les programmes par défaut
} as const;

// seance_type IDs : Séance Zéro = 1, Programme Haut = 2, Programme Bas = 3
const ST = { SEANCE_ZERO: 1, HAUT: 2, BAS: 3 } as const;

// [seance_type_id, exercice_id, ordre, series_cible, reps_min, reps_max, duree_seconde_cible]
type StExoRow = [number, number, number, number, number, number, number | null];

const SEANCE_ZERO_EXOS: readonly StExoRow[] = [
  [ST.SEANCE_ZERO, EX.POMPES, 1, 3, 8, 12, null],
  [ST.SEANCE_ZERO, EX.SQUATS_CORPS, 2, 3, 12, 15, null],
  [ST.SEANCE_ZERO, EX.GAINAGE, 3, 3, 20, 40, 30],
  [ST.SEANCE_ZERO, EX.FENTES_ALTERNEES, 4, 3, 8, 10, null],
  [ST.SEANCE_ZERO, EX.CRUNCHS, 5, 3, 12, 15, null],
  [ST.SEANCE_ZERO, EX.DIPS_CHAISE, 6, 3, 8, 12, null],
];

const HAUT_EXOS: readonly StExoRow[] = [
  [ST.HAUT, EX.DEVELOPPE_COUCHE, 1, 3, 8, 12, null],
  [ST.HAUT, EX.ROWING, 2, 3, 8, 12, null],
  [ST.HAUT, EX.MILITAIRE, 3, 3, 8, 12, null],
  [ST.HAUT, EX.CURL, 4, 3, 10, 15, null],
  [ST.HAUT, EX.EXTENSION, 5, 3, 10, 15, null],
  [ST.HAUT, EX.GAINAGE, 6, 3, 20, 40, 30],
];

const BAS_EXOS: readonly StExoRow[] = [
  [ST.BAS, EX.SQUAT_BARRE, 1, 3, 8, 12, null],
  [ST.BAS, EX.SDT_ROUMAIN, 2, 3, 8, 12, null],
  [ST.BAS, EX.FENTES_HALT, 3, 3, 10, 12, null],
  [ST.BAS, EX.MOLLETS, 4, 3, 15, 20, null],
  [ST.BAS, EX.CRUNCHS, 5, 3, 12, 15, null],
];

export const migration: Migration = {
  version: 2,
  name: 'lot1_tables',
  async up(db) {
    // DDL — tables Lot 1
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS profil (
        id                     INTEGER PRIMARY KEY CHECK (id = 1),
        prenom                 TEXT NOT NULL,
        taille_cm              INTEGER,
        poids_depart_kg        REAL,
        objectif               TEXT NOT NULL,
        niveau                 TEXT NOT NULL,
        xp_total               INTEGER NOT NULL DEFAULT 0,
        rang_courant           TEXT NOT NULL DEFAULT 'E',
        streak_courant         INTEGER NOT NULL DEFAULT 0,
        gel_streak_disponible  INTEGER NOT NULL DEFAULT 0,
        date_derniere_activite TEXT,
        created_at             TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at             TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS exercice (
        id                INTEGER PRIMARY KEY AUTOINCREMENT,
        nom               TEXT NOT NULL,
        groupe_musculaire TEXT NOT NULL,
        type              TEXT NOT NULL,
        mode_charge       TEXT NOT NULL,
        variantes         TEXT,
        description       TEXT
      );

      CREATE TABLE IF NOT EXISTS seance_type (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        nom            TEXT NOT NULL,
        description    TEXT,
        is_seance_zero INTEGER NOT NULL DEFAULT 0,
        created_at     TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS seance_type_exercice (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        seance_type_id      INTEGER NOT NULL REFERENCES seance_type(id) ON DELETE CASCADE,
        exercice_id         INTEGER NOT NULL REFERENCES exercice(id),
        ordre               INTEGER NOT NULL,
        series_cible        INTEGER NOT NULL,
        reps_min            INTEGER NOT NULL,
        reps_max            INTEGER NOT NULL,
        duree_seconde_cible INTEGER
      );

      CREATE TABLE IF NOT EXISTS seance (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        date           TEXT NOT NULL,
        seance_type_id INTEGER REFERENCES seance_type(id),
        statut         TEXT NOT NULL,
        xp_attribue    INTEGER NOT NULL DEFAULT 0,
        created_at     TEXT NOT NULL DEFAULT (datetime('now')),
        completed_at   TEXT
      );

      CREATE TABLE IF NOT EXISTS serie_performance (
        id                    INTEGER PRIMARY KEY AUTOINCREMENT,
        seance_id             INTEGER NOT NULL REFERENCES seance(id) ON DELETE CASCADE,
        exercice_id           INTEGER NOT NULL REFERENCES exercice(id),
        ordre                 INTEGER NOT NULL,
        charge_kg             REAL,
        reps_realisees        INTEGER NOT NULL,
        difficulte_subjective TEXT,
        created_at            TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_seance_date         ON seance(date);
      CREATE INDEX IF NOT EXISTS idx_serie_seance_exercice ON serie_performance(seance_id, exercice_id);
    `);

    // Seed — exercices
    for (const ex of EXERCICES) {
      await db.runAsync(
        `INSERT INTO exercice (nom, groupe_musculaire, type, mode_charge, variantes, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          ex.nom,
          ex.groupe_musculaire,
          ex.type,
          ex.mode_charge,
          ex.variantes !== null ? JSON.stringify(ex.variantes) : null,
          ex.description,
        ],
      );
    }

    // Seed — types de séances
    await db.runAsync(
      `INSERT INTO seance_type (nom, description, is_seance_zero) VALUES (?, ?, ?)`,
      ['Séance Zéro', 'Programme au poids du corps, sans matériel. Idéal pour démarrer.', 1],
    );
    await db.runAsync(
      `INSERT INTO seance_type (nom, description, is_seance_zero) VALUES (?, ?, ?)`,
      ['Programme Haut', 'Haut du corps : poitrine, dos, épaules, bras.', 0],
    );
    await db.runAsync(
      `INSERT INTO seance_type (nom, description, is_seance_zero) VALUES (?, ?, ?)`,
      ['Programme Bas', 'Bas du corps : quadriceps, ischio-jambiers, mollets.', 0],
    );

    // Seed — exercices par type de séance
    for (const row of [...SEANCE_ZERO_EXOS, ...HAUT_EXOS, ...BAS_EXOS]) {
      const [stId, exId, ordre, series, repsMin, repsMax, duree] = row;
      await db.runAsync(
        `INSERT INTO seance_type_exercice
           (seance_type_id, exercice_id, ordre, series_cible, reps_min, reps_max, duree_seconde_cible)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [stId, exId, ordre, series, repsMin, repsMax, duree],
      );
    }
  },
};
