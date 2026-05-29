import { getDatabase } from '@/db/client';
import type {
  AppBackup,
  BackupRawCourse,
  BackupRawExercice,
  BackupRawJournalRappel,
  BackupRawMacroPlanning,
  BackupRawMesureCorporelle,
  BackupRawObjectifNutritionnel,
  BackupRawOnboardingProgression,
  BackupRawProfil,
  BackupRawSeance,
  BackupRawSeanceType,
  BackupRawSeanceTypeExercice,
  BackupRawSeriePerformance,
  BackupRawValidationNutrition,
} from '@/domain/backup/backupTypes';
import { BACKUP_SCHEMA_VERSION } from '@/domain/backup/backupTypes';
import { branding } from '@branding/branding.config';

/** Exporte toutes les données utilisateur sous forme d'objet brut sérialisable. */
export async function exportAllData(): Promise<AppBackup> {
  const db = await getDatabase();

  const [
    profil,
    exercices,
    seance_types,
    seance_type_exercices,
    seances,
    serie_performances,
    mesures_corporelles,
    courses,
    macro_planning,
    journal_rappels,
    objectif_nutritionnel,
    validations_nutrition,
    onboarding_progression,
  ] = await Promise.all([
    db.getFirstAsync<BackupRawProfil>(`SELECT * FROM profil WHERE id = 1`),
    db.getAllAsync<BackupRawExercice>(`SELECT * FROM exercice ORDER BY id`),
    db.getAllAsync<BackupRawSeanceType>(`SELECT * FROM seance_type ORDER BY id`),
    db.getAllAsync<BackupRawSeanceTypeExercice>(`SELECT * FROM seance_type_exercice ORDER BY id`),
    db.getAllAsync<BackupRawSeance>(`SELECT * FROM seance ORDER BY id`),
    db.getAllAsync<BackupRawSeriePerformance>(`SELECT * FROM serie_performance ORDER BY id`),
    db.getAllAsync<BackupRawMesureCorporelle>(`SELECT * FROM mesure_corporelle ORDER BY id`),
    db.getAllAsync<BackupRawCourse>(`SELECT * FROM course ORDER BY id`),
    db.getFirstAsync<BackupRawMacroPlanning>(`SELECT * FROM macro_planning WHERE id = 1`),
    db.getAllAsync<BackupRawJournalRappel>(`SELECT * FROM journal_rappel ORDER BY id`),
    db.getFirstAsync<BackupRawObjectifNutritionnel>(
      `SELECT * FROM objectif_nutritionnel WHERE id = 1`,
    ),
    db.getAllAsync<BackupRawValidationNutrition>(
      `SELECT * FROM validation_nutrition_quotidienne ORDER BY date`,
    ),
    db.getFirstAsync<BackupRawOnboardingProgression>(
      `SELECT * FROM onboarding_progression WHERE id = 1`,
    ),
  ]);

  return {
    schema_version: BACKUP_SCHEMA_VERSION,
    app_version: branding.app.version,
    exported_at: new Date().toISOString(),
    data: {
      profil: profil ?? null,
      exercices,
      seance_types,
      seance_type_exercices,
      seances,
      serie_performances,
      mesures_corporelles,
      courses,
      macro_planning: macro_planning ?? null,
      journal_rappels,
      objectif_nutritionnel: objectif_nutritionnel ?? null,
      validations_nutrition,
      onboarding_progression: onboarding_progression ?? null,
    },
  };
}

/**
 * Importe une sauvegarde complète dans la base.
 * Efface toutes les données existantes puis réinsère depuis la sauvegarde.
 * Opération atomique (transaction).
 */
export async function importAllData(backup: AppBackup): Promise<void> {
  const db = await getDatabase();
  const { data } = backup;

  await db.withTransactionAsync(async () => {
    // Désactiver temporairement les FK pour simplifier l'ordre de suppression
    await db.execAsync(`PRAGMA foreign_keys = OFF`);

    // Vider toutes les tables utilisateur
    await db.execAsync(`
      DELETE FROM serie_performance;
      DELETE FROM seance;
      DELETE FROM mesure_corporelle;
      DELETE FROM course;
      DELETE FROM validation_nutrition_quotidienne;
      DELETE FROM onboarding_progression;
      DELETE FROM objectif_nutritionnel;
      DELETE FROM journal_rappel;
      DELETE FROM macro_planning;
      DELETE FROM seance_type_exercice;
      DELETE FROM seance_type;
      DELETE FROM exercice;
      DELETE FROM profil;
    `);

    // Réinitialiser les séquences AUTOINCREMENT
    await db.execAsync(`
      DELETE FROM sqlite_sequence WHERE name IN (
        'exercice','seance_type','seance_type_exercice',
        'seance','serie_performance','mesure_corporelle',
        'course','journal_rappel'
      );
    `);

    // Réinsérer dans l'ordre (parents avant enfants)
    if (data.profil !== null) {
      const p = data.profil;
      await db.runAsync(
        `INSERT OR REPLACE INTO profil
           (id,prenom,taille_cm,poids_depart_kg,objectif,niveau,
            xp_total,rang_courant,streak_courant,gel_streak_disponible,
            date_derniere_activite,created_at,updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          p.id,
          p.prenom,
          p.taille_cm,
          p.poids_depart_kg,
          p.objectif,
          p.niveau,
          p.xp_total,
          p.rang_courant,
          p.streak_courant,
          p.gel_streak_disponible,
          p.date_derniere_activite,
          p.created_at,
          p.updated_at,
        ],
      );
    }

    for (const ex of data.exercices) {
      await db.runAsync(
        `INSERT OR REPLACE INTO exercice
           (id,nom,groupe_musculaire,type,mode_charge,variantes,description)
         VALUES (?,?,?,?,?,?,?)`,
        [
          ex.id,
          ex.nom,
          ex.groupe_musculaire,
          ex.type,
          ex.mode_charge,
          ex.variantes,
          ex.description,
        ],
      );
    }

    for (const st of data.seance_types) {
      await db.runAsync(
        `INSERT OR REPLACE INTO seance_type
           (id,nom,description,is_seance_zero,created_at)
         VALUES (?,?,?,?,?)`,
        [st.id, st.nom, st.description, st.is_seance_zero, st.created_at],
      );
    }

    for (const ste of data.seance_type_exercices) {
      await db.runAsync(
        `INSERT OR REPLACE INTO seance_type_exercice
           (id,seance_type_id,exercice_id,ordre,series_cible,reps_min,reps_max,duree_seconde_cible)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          ste.id,
          ste.seance_type_id,
          ste.exercice_id,
          ste.ordre,
          ste.series_cible,
          ste.reps_min,
          ste.reps_max,
          ste.duree_seconde_cible,
        ],
      );
    }

    for (const s of data.seances) {
      await db.runAsync(
        `INSERT OR REPLACE INTO seance
           (id,date,seance_type_id,statut,xp_attribue,created_at,completed_at)
         VALUES (?,?,?,?,?,?,?)`,
        [s.id, s.date, s.seance_type_id, s.statut, s.xp_attribue, s.created_at, s.completed_at],
      );
    }

    for (const sp of data.serie_performances) {
      await db.runAsync(
        `INSERT OR REPLACE INTO serie_performance
           (id,seance_id,exercice_id,ordre,charge_kg,reps_realisees,difficulte_subjective,created_at)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          sp.id,
          sp.seance_id,
          sp.exercice_id,
          sp.ordre,
          sp.charge_kg,
          sp.reps_realisees,
          sp.difficulte_subjective,
          sp.created_at,
        ],
      );
    }

    for (const m of data.mesures_corporelles) {
      await db.runAsync(
        `INSERT OR REPLACE INTO mesure_corporelle
           (id,date,poids_kg,tour_taille_cm,tour_hanches_cm,tour_poitrine_cm,
            tour_bras_cm,tour_cuisses_cm,photo_uri,notes,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [
          m.id,
          m.date,
          m.poids_kg,
          m.tour_taille_cm,
          m.tour_hanches_cm,
          m.tour_poitrine_cm,
          m.tour_bras_cm,
          m.tour_cuisses_cm,
          m.photo_uri,
          m.notes,
          m.created_at,
        ],
      );
    }

    for (const c of data.courses) {
      await db.runAsync(
        `INSERT OR REPLACE INTO course
           (id,date,distance_km,duree_minutes,allure_min_par_km,ressenti,statut,xp_attribue,notes,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          c.id,
          c.date,
          c.distance_km,
          c.duree_minutes,
          c.allure_min_par_km,
          c.ressenti,
          c.statut,
          c.xp_attribue,
          c.notes,
          c.created_at,
        ],
      );
    }

    if (data.macro_planning !== null) {
      const mp = data.macro_planning;
      await db.runAsync(
        `INSERT OR REPLACE INTO macro_planning
           (id,lundi,mardi,mercredi,jeudi,vendredi,samedi,dimanche)
         VALUES (?,?,?,?,?,?,?,?)`,
        [mp.id, mp.lundi, mp.mardi, mp.mercredi, mp.jeudi, mp.vendredi, mp.samedi, mp.dimanche],
      );
    }

    for (const jr of data.journal_rappels) {
      await db.runAsync(
        `INSERT OR REPLACE INTO journal_rappel (id,type,actif,horaire,notification_ids)
         VALUES (?,?,?,?,?)`,
        [jr.id, jr.type, jr.actif, jr.horaire, jr.notification_ids],
      );
    }

    if (data.objectif_nutritionnel !== null) {
      const on = data.objectif_nutritionnel;
      await db.runAsync(
        `INSERT OR REPLACE INTO objectif_nutritionnel (id,kcal_cible,proteines_g)
         VALUES (?,?,?)`,
        [on.id, on.kcal_cible, on.proteines_g],
      );
    }

    for (const vn of data.validations_nutrition) {
      await db.runAsync(
        `INSERT OR REPLACE INTO validation_nutrition_quotidienne (date,atteint,created_at)
         VALUES (?,?,?)`,
        [vn.date, vn.atteint, vn.created_at],
      );
    }

    if (data.onboarding_progression !== null) {
      const op = data.onboarding_progression;
      await db.runAsync(
        `INSERT OR REPLACE INTO onboarding_progression
           (id,mensurations_configure,rappels_configure,nutrition_configure,planning_configure,
            mensurations_xp_donne,rappels_xp_donne,nutrition_xp_donne,planning_xp_donne)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          op.id,
          op.mensurations_configure,
          op.rappels_configure,
          op.nutrition_configure,
          op.planning_configure,
          op.mensurations_xp_donne,
          op.rappels_xp_donne,
          op.nutrition_xp_donne,
          op.planning_xp_donne,
        ],
      );
    }

    // Réactiver les FK
    await db.execAsync(`PRAGMA foreign_keys = ON`);
  });
}

/**
 * Efface intégralement les données utilisateur et remet la base dans son état
 * initial (état post-migrations, avant onboarding). Opération atomique.
 */
export async function clearAllData(): Promise<void> {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    await db.execAsync(`PRAGMA foreign_keys = OFF`);

    await db.execAsync(`
      DELETE FROM serie_performance;
      DELETE FROM seance;
      DELETE FROM mesure_corporelle;
      DELETE FROM course;
      DELETE FROM validation_nutrition_quotidienne;
      DELETE FROM onboarding_progression;
      DELETE FROM objectif_nutritionnel;
      DELETE FROM journal_rappel;
      DELETE FROM macro_planning;
      DELETE FROM seance_type_exercice;
      DELETE FROM seance_type;
      DELETE FROM exercice;
      DELETE FROM profil;
    `);

    await db.execAsync(`
      DELETE FROM sqlite_sequence WHERE name IN (
        'exercice','seance_type','seance_type_exercice',
        'seance','serie_performance','mesure_corporelle',
        'course','journal_rappel'
      );
    `);

    // Recréer le catalogue d'exercices par défaut
    const exercices = [
      [
        'Pompes',
        'Poitrine',
        'compose',
        'poids_corps',
        '["Pompes normales","Pompes déclinées","Pompes pieds surélevés","Pompes claquées"]',
        'En position de planche, mains à la largeur des épaules. Fléchis les coudes pour descendre la poitrine puis pousse pour revenir.',
      ],
      [
        'Squats corps',
        'Quadriceps',
        'compose',
        'poids_corps',
        '["Squats normaux","Squats sautés","Squats bulgares","Pistol squat"]',
        "Pieds à la largeur des épaules, orteils légèrement ouverts. Descends les hanches jusqu'à ce que les cuisses soient parallèles au sol.",
      ],
      [
        'Gainage',
        'Core',
        'compose',
        'poids_corps',
        '["Gainage frontal","Gainage latéral","Gainage dynamique"]',
        'En appui sur les avant-bras et les orteils, dos droit et abdos gainés. Tiens la position sans laisser les hanches tomber.',
      ],
      [
        'Fentes alternées',
        'Quadriceps',
        'compose',
        'poids_corps',
        '["Fentes alternées","Fentes bulgares","Fentes sautées"]',
        'Debout, fais un grand pas en avant et descends le genou arrière près du sol. Reviens et alterne les jambes.',
      ],
      [
        'Crunchs',
        'Core',
        'isolation',
        'poids_corps',
        '["Crunchs","Relevés de jambes","Pédalier","Crunchs lestés"]',
        'Allongé sur le dos, genoux fléchis. Soulève les épaules en contractant les abdos, sans tirer sur la nuque.',
      ],
      [
        'Dips sur chaise',
        'Triceps',
        'compose',
        'poids_corps',
        '["Dips sur chaise","Dips sur parallèles","Dips lestés"]',
        "Mains sur le bord d'une chaise derrière toi, jambes tendues. Fléchis les coudes pour descendre les hanches puis pousse.",
      ],
      ['Développé couché', 'Poitrine', 'compose', 'charge', null, null],
      ['Rowing haltères', 'Dos', 'compose', 'charge', null, null],
      ['Développé militaire', 'Épaules', 'compose', 'charge', null, null],
      ['Curl biceps haltères', 'Biceps', 'isolation', 'charge', null, null],
      ['Extension triceps poulie', 'Triceps', 'isolation', 'charge', null, null],
      ['Squat barre', 'Quadriceps', 'compose', 'charge', null, null],
      ['Soulevé de terre roumain', 'Ischio-jambiers', 'compose', 'charge', null, null],
      ['Fentes haltères', 'Quadriceps', 'compose', 'charge', null, null],
      ['Élévations mollets', 'Mollets', 'isolation', 'charge', null, null],
      [
        'Tractions',
        'Dos',
        'compose',
        'poids_corps',
        '["Tractions australiennes","Tractions assistées (élastique)","Tractions normales","Tractions lestées"]',
        "Suspendu à une barre, paumes vers l'avant. Tire jusqu'à ce que le menton dépasse la barre.",
      ],
    ] as const;

    for (const ex of exercices) {
      await db.runAsync(
        `INSERT INTO exercice (nom,groupe_musculaire,type,mode_charge,variantes,description)
         VALUES (?,?,?,?,?,?)`,
        [...ex],
      );
    }

    await db.runAsync(`INSERT INTO seance_type (nom,description,is_seance_zero) VALUES (?,?,?)`, [
      'Séance Zéro',
      'Programme au poids du corps, sans matériel. Idéal pour démarrer.',
      1,
    ]);
    await db.runAsync(`INSERT INTO seance_type (nom,description,is_seance_zero) VALUES (?,?,?)`, [
      'Programme Haut',
      'Haut du corps : poitrine, dos, épaules, bras.',
      0,
    ]);
    await db.runAsync(`INSERT INTO seance_type (nom,description,is_seance_zero) VALUES (?,?,?)`, [
      'Programme Bas',
      'Bas du corps : quadriceps, ischio-jambiers, mollets.',
      0,
    ]);

    // seance_type_exercice: [st_id, ex_id, ordre, series, reps_min, reps_max, duree]
    const stExos: readonly [number, number, number, number, number, number, number | null][] = [
      [1, 1, 1, 3, 8, 12, null],
      [1, 2, 2, 3, 12, 15, null],
      [1, 3, 3, 3, 20, 40, 30],
      [1, 4, 4, 3, 8, 10, null],
      [1, 5, 5, 3, 12, 15, null],
      [1, 6, 6, 3, 8, 12, null],
      [2, 7, 1, 3, 8, 12, null],
      [2, 8, 2, 3, 8, 12, null],
      [2, 9, 3, 3, 8, 12, null],
      [2, 10, 4, 3, 10, 15, null],
      [2, 11, 5, 3, 10, 15, null],
      [2, 3, 6, 3, 20, 40, 30],
      [3, 12, 1, 3, 8, 12, null],
      [3, 13, 2, 3, 8, 12, null],
      [3, 14, 3, 3, 10, 12, null],
      [3, 15, 4, 3, 15, 20, null],
      [3, 5, 5, 3, 12, 15, null],
    ];
    for (const row of stExos) {
      await db.runAsync(
        `INSERT INTO seance_type_exercice
           (seance_type_id,exercice_id,ordre,series_cible,reps_min,reps_max,duree_seconde_cible)
         VALUES (?,?,?,?,?,?,?)`,
        [...row],
      );
    }

    // Macro-planning par défaut (tous repos)
    await db.runAsync(
      `INSERT INTO macro_planning
         (id,lundi,mardi,mercredi,jeudi,vendredi,samedi,dimanche)
       VALUES (1,'repos','repos','repos','repos','repos','repos','repos')`,
    );

    // Rappels par défaut
    await db.execAsync(`
      INSERT INTO journal_rappel (type,actif,horaire) VALUES
        ('seance_musculation', 1, '06:45'),
        ('course',             1, '06:45'),
        ('hydratation',        1, '09:00'),
        ('petit_dejeuner',     1, '08:30'),
        ('dejeuner',           1, '12:30'),
        ('collation',          1, '16:30'),
        ('diner',              1, '19:30'),
        ('pause_posture',      1, '09:00'),
        ('mensurations',       1, '10:00');
    `);

    // Singletons par défaut
    await db.execAsync(`
      INSERT INTO objectif_nutritionnel (id) VALUES (1);
      INSERT INTO onboarding_progression (id) VALUES (1);
    `);

    await db.execAsync(`PRAGMA foreign_keys = ON`);
  });
}
