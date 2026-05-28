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

## Lot 1 — Onboarding sprint + Séance Zéro + saisie séance ⏳

Cahier section 10, ligne « Lot 1 ». Premier lot fonctionnel ; rend l'app
**utilisable dès le premier lancement**.

À livrer :

- Onboarding sprint (3 questions : prénom, objectif, niveau) < 2 minutes
- Sélection automatique du programme-type d'après objectif + niveau
- Séance Zéro (programme au poids du corps, descriptions d'exercices,
  compteur de reps + difficulté subjective)
- Écran de séance générique avec saisie adaptée selon `mode_charge`
  (charge + reps OU compteur reps seul)
- Reprise d'une séance interrompue (cahier 9.4)
- Tables `profil`, `exercice`, `seance_type`, `seance_type_exercice`,
  `seance`, `serie_performance` + repositories

Voir [`DATA-MODEL.md`](DATA-MODEL.md) pour le schéma planifié.

## Lot 2 — Suivi corporel ⏳

Cahier section 5.5, section 10. Saisie hebdomadaire poids / mensurations /
photo, courbes par mesure.

À livrer :

- Écran de saisie de mesures (poids + tours principaux)
- Stockage photo via `expo-image-picker` + `expo-file-system`
- Galerie photos datées
- Courbes par mesure (composant de chart à arrêter)
- Table `mesure_corporelle` + repository

Dépendances à installer : `expo-image-picker`, `expo-file-system`, lib de chart.

## Lot 3 — Intelligence d'entraînement ⏳

Cahier section 7.1, section 10.

À livrer :

- Réorganisation des exercices en cours de séance (drag handle)
- Chronomètre de repos intégré + notification locale fin de repos
- Historique par exercice + courbe de progression
- Détection de surcharge progressive (`src/domain/progressive-overload/`)
  - Variante « charge » → suggestion +2,5 kg
  - Variante « poids du corps » → +2 reps ou variante plus difficile
- Édition du programme (ajout, suppression, remplacement, réglage séries/reps)

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
