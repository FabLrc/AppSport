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
- ⚠️ Notifications de fin de repos : foreground uniquement — expo-notifications différé au Lot 5

## Lot 4 — Course à pied ⏳

Cahier section 5.6, section 7.5, section 10.

À livrer :

- Saisie manuelle d'une sortie (distance, durée, ressenti)
- Calcul auto allure moyenne
- Historique, courbe d'allure
- Volume hebdo et mensuel
- Records personnels (`src/domain/personal-records/`)
- Intégration au macro-planning (table `macro_planning`)
- Tables `course`, `macro_planning` + repositories

## Lot 5 — Rappels ⏳

Cahier section 5.8, section 8, section 10.

À livrer :

- 9 rappels par défaut (musculation, course, hydratation, repas, posture, mensurations)
- Activation/désactivation et horaire modifiables par rappel
- Rappels d'activité pilotés par le `macro_planning` (déclenchés uniquement
  les jours où l'activité est prévue)
- Table `journal_rappel` + repository
- Intégration `expo-notifications`

## Lot 6 — Gamification + nutrition + onboarding progressif ⏳

Cahier sections 5.7, 7.2, 7.3, 7.4, 9.1, section 10.

À livrer :

- Calcul XP (`src/domain/xp/`)
- Rangs E→S++ et titres (`src/domain/ranks/`)
- Streak avec gel de streak (`src/domain/streak/`)
- Messages de félicitation sur événements clés
- Dashboard finalisé (rang + barre XP + streak + prochaine séance)
- Objectifs nutritionnels + validation quotidienne (tables `objectif_nutritionnel`,
  `validation_nutrition_quotidienne`)
- Section « ⚡ Gagne tes premiers XP » (table `onboarding_progression`)
- Nudges contextuels (bandeaux non intrusifs, logique d'extinction après 2 ignores)

## Lot 7 — Sauvegarde ⏳

Cahier section 9.8, section 10.

À livrer :

- Export JSON via menu de partage natif (`expo-sharing`)
- Import depuis JSON
- Effacement complet des données avec double confirmation (RGPD section 12)

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
