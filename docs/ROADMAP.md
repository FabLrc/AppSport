# Roadmap

État d'avancement des 8 lots définis dans [`cahier-des-charges.md`](cahier-des-charges.md)
section 10. À mettre à jour à chaque fin de lot.

## Légende

- ✅ livré et utilisable
- 🔄 en cours
- ⏳ pas encore commencé
- ⚠️ livré avec une dette identifiée à reprendre

## Lot 0 — Socle ✅

Hors cahier : préparation à l'implémentation. **Livré dans cette session.**

- ✅ Projet Expo SDK 54 + TypeScript strict initialisé
- ✅ ESLint 9 (flat config) + Prettier 3 + scripts npm (`lint`, `format`, `typecheck`, `check`)
- ✅ Paths alias `@/*` (src) et `@branding/*` (branding)
- ✅ Branding centralisé : `branding/branding.config.json` (source) + wrapper TS
- ✅ Configuration Expo dynamique (`app.config.ts`) consommant le branding
- ✅ Theme tokens (`src/shared/theme/`) : colors, spacing, typography, radius
- ✅ Composants UI primitifs : `Screen`, `Text`, `Button`, `Card`
- ✅ Navigation React Navigation 7 avec thème dark adapté à la palette
- ✅ Écran placeholder « Socle prêt »
- ✅ Client SQLite singleton (`expo-sqlite`)
- ✅ Runner de migrations versionnées avec table `_schema_version`
- ✅ Migration 001 (initialisation métadonnées)
- ✅ `DatabaseProvider` qui ordonne le démarrage (DB prête → navigation montée)
- ✅ Documentation complète (README, ARCHITECTURE, BRANDING, DATA-MODEL, DEVELOPMENT, ROADMAP)
- ✅ Copie du cahier des charges sous `docs/cahier-des-charges.md`

## Lot 1 — Onboarding sprint + Séance Zéro + saisie séance ✅

Cahier section 10, ligne « Lot 1 ». Premier lot fonctionnel ; rend l'app
**utilisable dès le premier lancement**.

- ✅ Onboarding sprint — 3 questions en < 2 min (prénom, objectif, niveau)
- ✅ Profil créé en base ; programme-type pré-configuré automatiquement
- ✅ Migration 002 — tables `profil`, `exercice`, `seance_type`,
  `seance_type_exercice`, `seance`, `serie_performance` + index
- ✅ Catalogue d'exercices seedé (16 exercices : Séance Zéro + programmes Haut/Bas)
- ✅ Séance Zéro disponible (au poids du corps, descriptions, difficulté subjective)
- ✅ Programmes Haut et Bas pré-configurés (exercices avec charge)
- ✅ Écran de séance générique :
  - Exercices au poids du corps : compteur de reps + difficulté subjective
  - Exercices avec charge : champ charge + champ reps
  - Exercices chronométrés : champ durée en secondes
- ✅ Reprise d'une séance interrompue (statut `en_cours` + reconstruction depuis DB)
- ✅ Récapitulatif en fin de séance avec XP gagné (+80 XP première Séance Zéro, +100 XP sinon)
- ✅ Onglets principaux (Accueil + Réglages placeholder)
- ✅ Repositories : `profilRepository`, `exerciceRepository`, `seanceTypeRepository`,
  `seanceRepository`, `seriePerformanceRepository`
- ✅ Stores Zustand : `profileStore`, `sessionStore`

## Lot 2 — Suivi corporel ✅

Cahier section 5.5, section 10. Saisie hebdomadaire poids / mensurations /
photo, courbes par mesure.

- ✅ Migration 003 — table `mesure_corporelle` + index sur `date`
- ✅ Types `MesureCorporelle`, `CreateMesureCorporelleInput`, `UpdateMesureCorporelleInput`
- ✅ `mesureCorporelleRepository` : CRUD complet (create, read, update, delete)
- ✅ `AddMeasurementScreen` : saisie poids + 5 tours + photo (galerie/caméra) + notes
- ✅ `BodyTrackingScreen` : résumé dernière mesure, courbes par métrique (LineChart SVG), galerie photos datée, historique éditable/supprimable
- ✅ Visionneuse photo plein écran (modal)
- ✅ Onglet « Corps » dans la barre de navigation principale
- ✅ `expo-image-picker` + `expo-file-system` (API v18 : Paths/File/Directory)
- ✅ Permissions caméra/galerie déclarées dans `app.config.ts`

## Lot 3 — Intelligence d'entraînement ✅

Cahier section 7.1, section 10. Intelligence ajoutée à la séance en cours,
aux programmes et aux suggestions de progression.

- ✅ Chronomètre de repos intégré (foreground — notifications différées au Lot 5)
- ✅ Réorganisation des exercices en cours de séance (boutons ↑/↓ sans bibliothèque de drag-and-drop)
- ✅ Historique par exercice avec courbe de progression (charge ou reps selon le mode)
- ✅ Composant SVG `LineChart` réutilisable (`react-native-svg`, sans lib externe)
- ✅ Détection de surcharge progressive (`src/domain/progressive-overload/`, logique pure sans dépendance RN) :
  - Variante « charge » → suggestion +2,5 kg (arrondi au 0,5 kg le plus proche)
  - Variante « poids du corps » → +2 reps ou première variante plus difficile
- ✅ Suggestions affichées dans le récapitulatif de fin de séance
- ✅ Édition des programmes :
  - Ajout d'un exercice depuis le catalogue complet (avec configuration séries/reps)
  - Suppression avec confirmation
  - Réglage séries/reps cibles par exercice
  - Réorganisation de l'ordre (↑/↓)
- ✅ Écran Réglages opérationnel (profil + accès aux programmes)
- ✅ Notifications de fin de repos : notification arrière-plan livréeau Lot 5 (AppState + `scheduleRestEndNotification`)

## Lot 4 — Course à pied ✅

Cahier section 5.6, section 7.5, section 10.

- ✅ Migration 004 — tables `course` + `macro_planning` (singleton 7 jours, valeur par défaut `repos`)
- ✅ Types `Course`, `CreateCourseInput`, `CourseRecords`, `VolumeStats`, `MacroPlanning`, `ActivitePlanning`, `JourSemaine`
- ✅ `courseRepository` : CRUD, stats volume hebdo/mensuel (7 j / 30 j), records (distance max, allure min)
- ✅ `macroPlanningRepository` : lecture singleton, mise à jour partielle par jour, activité du jour
- ✅ `src/domain/personal-records/` : détection PR distance + allure (logique pure sans dépendance RN), `formatAllure`
- ✅ `AddRunScreen` : distance, durée (min+sec), allure calculée en temps réel, ressenti 1-5 colorisé, notes
- ✅ `RunningScreen` : stats volume hebdo/mensuel, records, courbe allure (LineChart SVG), historique des sorties
- ✅ `MacroPlanningScreen` : 7 jours × 4 activités (chips colorisés), sauvegarde et retour
- ✅ Onglet « Running » dans la barre de navigation principale
- ✅ Détection et affichage des records personnels lors de l'enregistrement d'une sortie (+150 XP PR, +100 XP normal)
- ✅ `HomeScreen` : carte d'activité du jour pilotée par le macro-planning (repos / course / musculation)
- ✅ Settings : lien vers `MacroPlanningScreen`

## Lot 5 — Rappels ✅

Cahier section 5.8, section 8, section 10.

- ✅ Migration 005 — table `journal_rappel` (9 rappels pré-seedés)
- ✅ Types `JournalRappel`, `RappelType`, `UpdateRappelInput`
- ✅ `journalRappelRepository` : `getAllRappels`, `getRappelByType`, `updateRappel`
- ✅ `src/domain/reminders/` : `buildNotificationSpecs` — logique pure de scheduling
  - `seance_musculation` / `course` : WEEKLY uniquement les jours planifiés dans `macro_planning`
  - `hydratation` : DAILY toutes les 2h de 9h à 19h (6 notifications)
  - `pause_posture` : DAILY toutes les heures de 9h à 18h (10 notifications)
  - `mensurations` : WEEKLY samedi
  - `petit_dejeuner`, `dejeuner`, `collation`, `diner` : DAILY à heure fixe
- ✅ `src/shared/notifications.ts` : permissions, `syncAllReminders`, `syncRappel`, `scheduleRestEndNotification`
- ✅ `RemindersScreen` : 9 rappels listés avec toggle ON/OFF et modification d'horaire (sauf hydratation/posture)
- ✅ `DatabaseProvider` : demande de permission + sync au démarrage (non bloquant)
- ✅ `WorkoutSessionScreen` : notification de fin de repos quand l'app passe en arrière-plan
- ✅ Navigation : route `Reminders` + lien dans Settings
- ✅ `expo-notifications` v0.32 installé + plugin configuré dans `app.config.ts`
- ⚠️ Notification Lot 3 (repos en avant-plan) : marquée résolue — la notification arrière-plan est maintenant fonctionnelle

## Lot 6 — Gamification + nutrition + onboarding progressif ✅

Cahier sections 5.7, 7.2, 7.3, 7.4, 9.1, section 10.

- ✅ `src/domain/xp/` : constantes XP pour tous les événements (séances, courses, mensurations, nutrition, onboarding, malus)
- ✅ `src/domain/ranks/` : 8 rangs E→S++ avec seuils XP, titres et mottos
- ✅ `src/domain/streak/` : logique pure `calculerStreakApresActivite` — gel automatique à gap=2 si disponible, déblocage du gel à 7 jours consécutifs
- ✅ Migration 006 — tables `objectif_nutritionnel`, `validation_nutrition_quotidienne`, `onboarding_progression`
- ✅ `profilRepository` : `addXpToProfil(amount)` (lecture → calcul → maj rang), `updateStreakApresActivite(today)`
- ✅ `nutritionRepository` : `getObjectifNutritionnel`, `updateObjectifNutritionnel`, `getValidationAujourdhui`, `setValidationAujourdhui`
- ✅ `onboardingProgressionRepository` : `marquerModuleComplete` (retourne `true` si première fois), `marquerXpDonne`
- ✅ `NutritionSetupScreen` : saisie kcal/protéines + XP onboarding à la première config
- ✅ `HomeScreen` revu : badge rang, streak 🔥, barre de progression XP vers rang suivant, section onboarding « ⚡ Gagne tes premiers XP », carte nutrition du jour (valider / invalider)
- ✅ Attribution XP dans `WorkoutSummaryScreen` (séances muscu + streak)
- ✅ Attribution XP dans `AddRunScreen` (courses + streak + détection record)
- ✅ Attribution XP dans `AddMeasurementScreen` (mensurations + onboarding)
- ✅ Attribution XP dans `MacroPlanningScreen` (onboarding planning + re-sync rappels)
- ✅ Attribution XP dans `RemindersScreen` (onboarding rappels à la première visite)
- ⚠️ Nudges contextuels (logique d'extinction) non implémentés — section onboarding disparaît naturellement quand tous les modules sont configurés

## Lot 7 — Sauvegarde ✅

Cahier section 9.8, section 10.

- ✅ `src/domain/backup/backupTypes.ts` — structure typée `AppBackup` (schéma v1.0)
- ✅ `src/db/repositories/backupRepository.ts` :
  - `exportAllData()` — lit toutes les tables et retourne un objet JSON sérialisable
  - `importAllData(backup)` — vide toutes les tables + réinsère depuis la sauvegarde (transaction atomique, FK OFF pendant l'opération)
  - `clearAllData()` — efface toutes les données utilisateur et re-seed le catalogue par défaut (exercices, programmes, planning, rappels, singletons)
- ✅ `src/shared/backupService.ts` :
  - `exportAndShare()` — écrit le JSON dans le cache puis ouvre la feuille de partage native via `expo-sharing`
  - `importFromFile()` — sélecteur de fichier JSON (`expo-document-picker`), validation de structure, import
- ✅ `SettingsScreen` : section « Données » (exporter, importer) + section « Zone danger » (effacer avec double confirmation)
- ✅ `profileStore.resetProfile()` — remet `profile: null` pour déclencher le retour à l'onboarding après import/effacement
- ✅ `expo-sharing` + `expo-document-picker` installés (SDK 54 compatibles)

## Lot 8 — Distribution et mise à jour ⏳

Cahier section 9.9, section 10. **Lot final, prépare la diffusion aux testeurs.**

À livrer :

- Build APK signé Android (clé sauvegardée hors dépôt)
- Build TestFlight iOS (compte Apple Developer requis)
- Publication APK sur GitHub Releases
- Vérification de mise à jour au démarrage (API GitHub, comparaison version)
- Bannière non intrusive si nouvelle version disponible
- Notes de version affichées dans l'app
- Comportement non bloquant (fallback démarrage normal si pas de connexion)

## Hors MVP — Roadmap post-MVP

Cf. cahier section 14. Pas avant que le MVP soit utilisé par le cercle de
testeurs et validé.

- Publication Google Play Store + App Store
- i18n + unités impériales
- Crash reporting (Sentry)
- Système de quêtes et défis hebdomadaires
- Suivi nutritionnel détaillé intégré
- Sync cloud, thème clair, badges visuels
- Mise à jour OTA (Expo Updates)
- Mise à jour forcée / version minimale
- Suivi GPS des courses
