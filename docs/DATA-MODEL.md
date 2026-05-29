# Modèle de données

Ce document liste **toutes** les entités prévues par le cahier des charges
(section 6) et leur statut d'implémentation. Mettre à jour à chaque lot.

> **Convention** : les noms de tables et de colonnes sont en `snake_case` ;
> les types côté TypeScript suivent le `PascalCase` pour les entités et le
> `camelCase` pour les champs. Le mapping se fait dans les repositories.

## Tables métadonnées

### `_schema_version` — ✅ socle (migration 001)

Suivi des migrations appliquées. Ne pas insérer manuellement — c'est le
runner qui s'en charge.

| Colonne      | Type                                      | Notes                                    |
| ------------ | ----------------------------------------- | ---------------------------------------- |
| `version`    | `INTEGER PRIMARY KEY`                     | numéro de migration                      |
| `name`       | `TEXT NOT NULL`                           | nom court de la migration (logs / debug) |
| `applied_at` | `TEXT NOT NULL DEFAULT (datetime('now'))` | horodatage UTC ISO 8601                  |

## Tables métier — par lot

Aucune n'est créée pour l'instant — chacune arrivera avec son lot.

### Lot 1 — Onboarding & première séance

#### `profil` — ✅ Lot 1

Une seule ligne par installation (cahier section 6 — Profil).

| Colonne                  | Type                                      | Notes                                                                  |
| ------------------------ | ----------------------------------------- | ---------------------------------------------------------------------- |
| `id`                     | `INTEGER PRIMARY KEY CHECK (id = 1)`      | mono-utilisateur : ligne unique                                        |
| `prenom`                 | `TEXT NOT NULL`                           | personnalisation des messages                                          |
| `taille_cm`              | `INTEGER`                                 | optionnel, ajouté à l'onboarding étendu                                |
| `poids_depart_kg`        | `REAL`                                    | idem                                                                   |
| `objectif`               | `TEXT NOT NULL`                           | enum : `'recomposition' \| 'prise_de_masse' \| 'perte' \| 'endurance'` |
| `niveau`                 | `TEXT NOT NULL`                           | enum : `'debutant' \| 'intermediaire' \| 'confirme'`                   |
| `xp_total`               | `INTEGER NOT NULL DEFAULT 0`              | redondant avec calcul depuis events, mais utile en lecture rapide      |
| `rang_courant`           | `TEXT NOT NULL DEFAULT 'E'`               | enum : `'E' \| 'D' \| ... \| 'S++'`                                    |
| `streak_courant`         | `INTEGER NOT NULL DEFAULT 0`              | jours actifs consécutifs                                               |
| `gel_streak_disponible`  | `INTEGER NOT NULL DEFAULT 0`              | 0 ou 1                                                                 |
| `date_derniere_activite` | `TEXT`                                    | ISO 8601                                                               |
| `created_at`             | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `updated_at`             | `TEXT NOT NULL DEFAULT (datetime('now'))` |

#### `onboarding_progression` — ✅ Lot 6

État de la quête de profil (section 9.1 du cahier). Singleton id=1.

| Colonne                  | Type                                 | Notes                                            |
| ------------------------ | ------------------------------------ | ------------------------------------------------ |
| `id`                     | `INTEGER PRIMARY KEY CHECK (id = 1)` | une seule ligne                                  |
| `mensurations_configure` | `INTEGER NOT NULL DEFAULT 0`         | bool — true après première mensuration           |
| `rappels_configure`      | `INTEGER NOT NULL DEFAULT 0`         | bool — true à la première visite RemindersScreen |
| `nutrition_configure`    | `INTEGER NOT NULL DEFAULT 0`         | bool — true après NutritionSetupScreen           |
| `planning_configure`     | `INTEGER NOT NULL DEFAULT 0`         | bool — true après sauvegarde MacroPlanningScreen |
| `mensurations_xp_donne`  | `INTEGER NOT NULL DEFAULT 0`         | bool — évite le double-award XP onboarding       |
| `rappels_xp_donne`       | `INTEGER NOT NULL DEFAULT 0`         |
| `nutrition_xp_donne`     | `INTEGER NOT NULL DEFAULT 0`         |
| `planning_xp_donne`      | `INTEGER NOT NULL DEFAULT 0`         |

#### `exercice` — ✅ Lot 1

Table de référence (cahier section 6 — Exercice).

| Colonne             | Type                                | Notes                                              |
| ------------------- | ----------------------------------- | -------------------------------------------------- |
| `id`                | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `nom`               | `TEXT NOT NULL`                     |
| `groupe_musculaire` | `TEXT NOT NULL`                     | enum à définir                                     |
| `type`              | `TEXT NOT NULL`                     | `'compose' \| 'isolation'`                         |
| `mode_charge`       | `TEXT NOT NULL`                     | `'charge' \| 'poids_corps'`                        |
| `variantes`         | `TEXT`                              | JSON ordered list pour exercices au poids du corps |
| `description`       | `TEXT`                              | une à deux phrases (Séance Zéro)                   |

Pré-rempli au premier lancement avec un catalogue de base + les exercices
de la Séance Zéro.

#### `seance_type` — ✅ Lot 1

Modèles de séance (Haut, Bas, Séance Zéro).

| Colonne          | Type                                      | Notes |
| ---------------- | ----------------------------------------- | ----- |
| `id`             | `INTEGER PRIMARY KEY AUTOINCREMENT`       |
| `nom`            | `TEXT NOT NULL`                           |
| `description`    | `TEXT`                                    |
| `is_seance_zero` | `INTEGER NOT NULL DEFAULT 0`              |
| `created_at`     | `TEXT NOT NULL DEFAULT (datetime('now'))` |

#### `seance_type_exercice` — ✅ Lot 1

Liste ordonnée d'exercices par séance type, avec séries cibles et
fourchette de répétitions.

| Colonne               | Type                                                            | Notes                                 |
| --------------------- | --------------------------------------------------------------- | ------------------------------------- |
| `id`                  | `INTEGER PRIMARY KEY AUTOINCREMENT`                             |
| `seance_type_id`      | `INTEGER NOT NULL REFERENCES seance_type(id) ON DELETE CASCADE` |
| `exercice_id`         | `INTEGER NOT NULL REFERENCES exercice(id)`                      |
| `ordre`               | `INTEGER NOT NULL`                                              |
| `series_cible`        | `INTEGER NOT NULL`                                              |
| `reps_min`            | `INTEGER NOT NULL`                                              |
| `reps_max`            | `INTEGER NOT NULL`                                              |
| `duree_seconde_cible` | `INTEGER`                                                       | pour les exercices en temps (gainage) |

#### `seance` — ✅ Lot 1

Séance de musculation réalisée.

| Colonne          | Type                                      | Notes                       |
| ---------------- | ----------------------------------------- | --------------------------- |
| `id`             | `INTEGER PRIMARY KEY AUTOINCREMENT`       |
| `date`           | `TEXT NOT NULL`                           | ISO 8601                    |
| `seance_type_id` | `INTEGER REFERENCES seance_type(id)`      |
| `statut`         | `TEXT NOT NULL`                           | `'en_cours' \| 'completee'` |
| `xp_attribue`    | `INTEGER NOT NULL DEFAULT 0`              |
| `created_at`     | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `completed_at`   | `TEXT`                                    |

#### `serie_performance` — ✅ Lot 1

Une série effectuée dans une séance.

| Colonne                 | Type                                                       | Notes                                                           |
| ----------------------- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| `id`                    | `INTEGER PRIMARY KEY AUTOINCREMENT`                        |
| `seance_id`             | `INTEGER NOT NULL REFERENCES seance(id) ON DELETE CASCADE` |
| `exercice_id`           | `INTEGER NOT NULL REFERENCES exercice(id)`                 |
| `ordre`                 | `INTEGER NOT NULL`                                         |
| `charge_kg`             | `REAL`                                                     | null pour les exercices au poids du corps                       |
| `reps_realisees`        | `INTEGER NOT NULL`                                         |
| `difficulte_subjective` | `TEXT`                                                     | `'facile' \| 'correct' \| 'difficile'` (optionnel, Séance Zéro) |
| `created_at`            | `TEXT NOT NULL DEFAULT (datetime('now'))`                  |

### Lot 2 — Suivi corporel

#### `mesure_corporelle` — ✅ Lot 2

Relevé hebdomadaire.

| Colonne            | Type                                      | Notes                                                      |
| ------------------ | ----------------------------------------- | ---------------------------------------------------------- |
| `id`               | `INTEGER PRIMARY KEY AUTOINCREMENT`       |
| `date`             | `TEXT NOT NULL`                           | ISO 8601, unique par semaine recommandé mais non contraint |
| `poids_kg`         | `REAL`                                    |
| `tour_taille_cm`   | `REAL`                                    |
| `tour_hanches_cm`  | `REAL`                                    |
| `tour_poitrine_cm` | `REAL`                                    |
| `tour_bras_cm`     | `REAL`                                    |
| `tour_cuisses_cm`  | `REAL`                                    |
| `photo_uri`        | `TEXT`                                    | chemin de fichier local (filesystem expo)                  |
| `notes`            | `TEXT`                                    |
| `created_at`       | `TEXT NOT NULL DEFAULT (datetime('now'))` |

#### Notes d'implémentation Lot 2

- **Photos** : copiées dans `FileSystem.Paths.document/photos/` via la nouvelle API `expo-file-system`
  v18 (classes `File`, `Directory`, `Paths`). Le chemin stocké en base est le `uri` local retourné
  par `destFile.uri`.
- **Repository** : `src/db/repositories/mesureCorporelleRepository.ts` — fonctions `createMesure`,
  `getAllMesures` (tri DESC par date), `getMesureById`, `updateMesure` (mise à jour partielle), `deleteMesure`.
- **Écrans** : `src/features/body-tracking/screens/` — `BodyTrackingScreen` (onglet) + `AddMeasurementScreen`
  (modal).
- **Composant LineChart** : réutilise `src/shared/components/LineChart.tsx` du Lot 3 (react-native-svg),
  sélecteur de métrique par chips horizontaux.

### Lot 3 — Intelligence d'entraînement ✅

Pas de nouvelle table. Les fonctionnalités du Lot 3 s'appuient exclusivement
sur les tables existantes via de nouvelles fonctions de repository :

- **`seriePerformanceRepository`** : `getHistoriqueExercice()` (agrégats par
  séance, LIMIT 50, ordre chronologique) et `getSeriesParExercicePourSurcharge()`
  (séries brutes d'une séance pour le moteur de suggestion).
- **`seanceTypeRepository`** : `addExerciceToSeanceType()`, `removeExerciceFromSeanceType()`,
  `updateExerciceConfig()`, `reorderExercices()` (via transaction SQLite).
- **`exerciceRepository`** : `createExercice()` (pour ajout d'exercices personnalisés,
  non exposé dans l'UI pour l'instant).
- **`src/domain/progressive-overload/`** : logique pure TypeScript (zero dépendance
  RN), testable en isolation.

Aucune migration n'a été nécessaire pour ce lot.

### Lot 4 — Course à pied ✅

#### `macro_planning` — ✅ Lot 4

Affectation d'activité par jour de la semaine.

| Colonne    | Type                                 | Notes                                                                   |
| ---------- | ------------------------------------ | ----------------------------------------------------------------------- |
| `id`       | `INTEGER PRIMARY KEY CHECK (id = 1)` | une seule ligne, encode 7 jours                                         |
| `lundi`    | `TEXT NOT NULL DEFAULT 'repos'`      | enum : `'musculation_haut' \| 'musculation_bas' \| 'course' \| 'repos'` |
| `mardi`    | `TEXT NOT NULL DEFAULT 'repos'`      |
| `mercredi` | `TEXT NOT NULL DEFAULT 'repos'`      |
| `jeudi`    | `TEXT NOT NULL DEFAULT 'repos'`      |
| `vendredi` | `TEXT NOT NULL DEFAULT 'repos'`      |
| `samedi`   | `TEXT NOT NULL DEFAULT 'repos'`      |
| `dimanche` | `TEXT NOT NULL DEFAULT 'repos'`      |

#### `course` — ✅ Lot 4

| Colonne             | Type                                      | Notes                      |
| ------------------- | ----------------------------------------- | -------------------------- |
| `id`                | `INTEGER PRIMARY KEY AUTOINCREMENT`       |
| `date`              | `TEXT NOT NULL`                           |
| `distance_km`       | `REAL NOT NULL`                           |
| `duree_minutes`     | `REAL NOT NULL`                           |
| `allure_min_par_km` | `REAL NOT NULL`                           | calculé = duree / distance |
| `ressenti`          | `INTEGER`                                 | échelle 1-5                |
| `statut`            | `TEXT NOT NULL DEFAULT 'completee'`       |
| `xp_attribue`       | `INTEGER NOT NULL DEFAULT 0`              | 100 normal / 150 record    |
| `notes`             | `TEXT`                                    |
| `created_at`        | `TEXT NOT NULL DEFAULT (datetime('now'))` |

#### Notes d'implémentation Lot 4

- **Allure** : calculée à la création (`duree_minutes / distance_km`), stockée dénormalisée pour
  faciliter les agrégats (records, courbe). `formatAllure(n)` dans `src/domain/personal-records/`
  convertit en `"MM:SS /km"`.
- **Records personnels** : logique pure dans `src/domain/personal-records/index.ts` —
  `detecterRecords(nouvelleCourse, historique)` compare distance et allure à l'historique existant
  avant l'insertion.
- **Repository course** : `src/db/repositories/courseRepository.ts` — `getVolumeStats()` retourne les
  km cumulés sur les 7 et 30 derniers jours ; `getCourseRecords()` retourne `MAX(distance_km)` et
  `MIN(allure_min_par_km)`.
- **Macro-planning** : singleton `id=1` seedé dans la migration 004 (`INSERT OR IGNORE`). Le repository
  expose `getActiviteAujourdhui()` qui mappe `new Date().getDay()` (0=Dimanche) sur les colonnes SQLite.
- **Écrans** : `src/features/running/screens/` + `src/features/planning/screens/MacroPlanningScreen.tsx`.

### Lot 5 — Rappels ✅

#### `journal_rappel` — ✅ Lot 5

9 rappels configurables (section 6 — JournalRappel, section 8 — Rappels par défaut).

| Colonne            | Type                                | Notes                                                                       |
| ------------------ | ----------------------------------- | --------------------------------------------------------------------------- |
| `id`               | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `type`             | `TEXT NOT NULL UNIQUE`              | enum : voir `RappelType` dans `types.ts`                                    |
| `actif`            | `INTEGER NOT NULL DEFAULT 1`        | bool                                                                        |
| `horaire`          | `TEXT NOT NULL`                     | `"HH:MM"` — heure de déclenchement (ou heure de début pour plages répétées) |
| `notification_ids` | `TEXT NOT NULL DEFAULT '[]'`        | JSON array des identifiants expo-notifications actifs                       |

#### Notes d'implémentation Lot 5

- **Schéma simplifié** : pas de colonne `frequence` (déduite du type en domaine). Le champ
  `notification_ids` stocke un tableau JSON d'IDs expo — plusieurs IDs pour hydratation (6) et
  posture (10).
- **Repository** : `src/db/repositories/journalRappelRepository.ts` — `getAllRappels`,
  `getRappelByType`, `updateRappel` (partial).
- **Domaine** : `src/domain/reminders/index.ts` — `buildNotificationSpecs(rappel, planning)` retourne
  les specs sans dépendance expo ; la conversion en trigger expo se fait dans `src/shared/notifications.ts`.
- **Sync** : `syncAllReminders()` appelé au démarrage (après migration), `syncRappel(type)` lors de
  chaque modification utilisateur dans `RemindersScreen`.
- **Rappels activité** : `seance_musculation` et `course` ne se déclenchent que les jours définis dans
  `macro_planning` (triggers WEEKLY).

À voir au Lot 6 : table `journal_rappel_occurrence` pour le suivi XP des rappels respectés.

### Lot 6 — Gamification, nutrition ✅

#### `objectif_nutritionnel` — ✅ Lot 6

Singleton id=1 pré-seedé (kcal=2000, protéines=150 g).

| Colonne       | Type                                 | Notes                    |
| ------------- | ------------------------------------ | ------------------------ |
| `id`          | `INTEGER PRIMARY KEY CHECK (id = 1)` | une seule ligne          |
| `kcal_cible`  | `INTEGER NOT NULL DEFAULT 2000`      |                          |
| `proteines_g` | `INTEGER NOT NULL DEFAULT 150`       | grammes (pas de suffixe) |

#### `validation_nutrition_quotidienne` — ✅ Lot 6

| Colonne      | Type                                      | Notes                                 |
| ------------ | ----------------------------------------- | ------------------------------------- |
| `date`       | `TEXT PRIMARY KEY`                        | format YYYY-MM-DD, une ligne par jour |
| `atteint`    | `INTEGER NOT NULL DEFAULT 0`              | bool                                  |
| `created_at` | `TEXT NOT NULL DEFAULT (datetime('now'))` |

#### Notes d'implémentation Lot 6

- **XP** : constantes dans `src/domain/xp/index.ts`. `addXpToProfil(amount)` dans
  `profilRepository` — lit le XP courant, recalcule le rang via `getRangForXp`, met à jour en base.
- **Rangs** : `src/domain/ranks/index.ts` — 8 rangs (E/D/C/B/A/S/S+/S++) avec seuils XP et titres.
  `getProgressionToNextRang(xp)` retourne le pourcentage de progression vers le rang suivant.
- **Streak** : `src/domain/streak/index.ts` — logique pure. Gel de streak disponible à partir de
  7 jours consécutifs ; consommé automatiquement si l'écart est de 2 jours.
- **Onboarding** : `onboardingProgressionRepository` — `marquerModuleComplete` retourne `true` si
  premier marquage (permet d'attribuer l'XP une seule fois). Double protection via `*_xp_donne`.

L'XP n'est **pas** stockée comme entité distincte (cf. cahier section 6 dernière
note) : c'est une valeur dérivée du total des séances, courses, rappels
respectés et mesures saisies. Le champ `profil.xp_total` est une **dénormalisation
de lecture** mise à jour à chaque event créé.

### Lot 7 — Sauvegarde ✅

Pas de nouvelle table. L'export / import / effacement opèrent sur les tables
existantes via `src/db/repositories/backupRepository.ts` (`exportAllData`,
`importAllData` en transaction atomique, `clearAllData` + re-seed). La structure
du fichier JSON est typée dans `src/domain/backup/backupTypes.ts`.

### Lot 8 — Distribution et mise à jour ✅

Pas de nouvelle table. La vérification de mise à jour est **sans état persisté** :
le résultat et le drapeau « ignorer » vivent en mémoire dans
`src/state/updateStore.ts` et sont réinitialisés à chaque lancement. Aucune
migration n'a été nécessaire.

## Conventions transverses

- **Dates** : stockées en `TEXT` au format ISO 8601 (UTC). Avantage : tri
  lexicographique, lisible en debug. SQLite gère mal les `DATE` natifs.
- **Booléens** : stockés en `INTEGER` (0/1). SQLite n'a pas de type bool.
- **JSON** : sérialisé en `TEXT`. Lu/écrit avec `JSON.parse` / `JSON.stringify`
  côté repository.
- **Foreign keys** : `ON DELETE CASCADE` pour les sous-tables qui n'ont
  aucun sens sans leur parent (`serie_performance` → `seance`).
- **Indexes** : ajoutés au cas par cas. Penser à indexer `seance.date`,
  `serie_performance(seance_id, exercice_id)`, `course.date`,
  `mesure_corporelle.date`.

## Évolutions du schéma

Pour ajouter / modifier une table, voir [`src/db/README.md`](../src/db/README.md)
(section « Ajouter une migration »). Ne pas modifier les migrations déjà
publiées : créer une nouvelle migration `NNN_…` qui altère le schéma.
