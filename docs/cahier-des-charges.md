<!--
  Source de vérité fonctionnelle du projet. Ce document décrit le périmètre
  du MVP et ses règles métier. Toute évolution produit doit le mettre à
  jour avant ou pendant le code. À l'inverse, le code ne doit jamais
  dériver silencieusement de ce qui est écrit ici — c'est lui qui est en
  retard, pas le cahier.

  Mis à jour pour la dernière fois : voir l'historique git.
-->

# Cahier des charges — MVP application fitness

> Application mono-utilisateur par installation : chaque personne installe l'app sur son propre téléphone et dispose de ses propres données. Générique et entièrement configurable, elle n'est pas spécifique à un utilisateur donné. Pas de comptes, pas de synchronisation. Ce MVP sert de prototype de test, destiné à être utilisé par le développeur et un cercle de testeurs sur Android et iOS, en vue d'une éventuelle application complète ultérieure.

---

## 1. Contexte et objectif

L'application est un outil de suivi d'entraînement, de progression corporelle et de motivation. Elle centralise un programme de musculation, le suivi des mensurations, des rappels de routine et une couche de gamification à système de rangs (E à S). Elle est générique : chaque utilisateur configure son profil, son programme et ses paramètres lors de l'onboarding puis depuis les réglages.

Le profil de référence ayant servi à concevoir l'application : pratiquant débutant, 28 ans, 72 kg pour 1m75, objectif de recomposition corporelle (gain musculaire et baisse de masse grasse), 4 séances par semaine le matin avant le travail, avec un travail correctif de posture. Ce profil n'est pas figé dans l'application : il illustre le besoin initial et sert de base aux valeurs par défaut et au programme-type pré-intégré.

**Objectif du MVP** : disposer d'un outil immédiatement utilisable au quotidien, remplaçant le carnet papier et centralisant le suivi, avec assez de motivation intégrée pour soutenir l'assiduité. Le MVP sert également de prototype testable par plusieurs personnes afin d'évaluer la pertinence d'une application complète ultérieure.

---

## 2. Périmètre du MVP

### Inclus
- Suivi des séances avec saisie des charges, exercice par exercice
- Macro-planning hebdomadaire (activité prévue par jour : musculation, course ou repos)
- Programme(s)-type pré-intégré(s), sélectionnables et entièrement éditables
- Onboarding au premier lancement (configuration complète du profil)
- Réorganisation de l'ordre des exercices en cours de séance
- Chronomètre de repos intégré
- Historique et courbe de progression par exercice
- Édition des exercices et du programme depuis l'application
- Séances de course à pied (saisie manuelle, sans GPS) : distance, durée, allure, ressenti
- Historique de course, volume hebdomadaire/mensuel et records personnels
- Suivi corporel : mensurations principales et poids, hebdomadaire
- Stockage des photos de progression dans l'application
- Affichage des objectifs nutritionnels (kcal et protéines cibles) avec validation quotidienne
- Rappels configurables (séance, hydratation, repas, posture, mensurations)
- Gamification : XP, rangs (E à S), streak
- Séance Zéro : programme de découverte au poids du corps, sans matériel, jouable dès le premier lancement
- Export/partage de la sauvegarde des données
- Vérification de mise à jour de l'application via GitHub Releases
- Thème sombre, fonctionnement 100 % hors ligne

### Exclu du MVP (évolutions ultérieures)
- Système de quêtes et défis hebdomadaires
- Suivi nutritionnel détaillé (délégué à une application tierce)
- Synchronisation cloud et multi-appareils
- Thème clair
- Badges et récompenses visuelles avancées
- Mise à jour OTA du code JavaScript (Expo Updates)
- Mise à jour forcée / version minimale supportée
- Suivi GPS des courses (tracé cartographique, profil d'altitude, allure instantanée, splits, audio-coaching)
- Publication sur le Google Play Store et l'App Store (distribution par APK et TestFlight pour le MVP)
- Crash reporting automatique
- Internationalisation et support des unités impériales

---

## 3. Contraintes techniques

| Élément | Choix |
|---|---|
| Framework | React Native (Expo) |
| Plateforme cible | Android et iOS |
| Stockage | Local sur l'appareil (SQLite) |
| Connexion | Aucune requise — 100 % hors ligne (hors vérification de mise à jour) |
| Notifications | Locales, sans serveur |
| Thème | Sombre uniquement |
| Sauvegarde | Export manuel via le menu de partage Android |
| Distribution | Android : APK hors store, publié sur GitHub Releases. iOS : TestFlight (distribution bêta Apple) |
| Signature | Android : clé de signature unique, conservée et sauvegardée de façon sécurisée, identique pour tous les builds. iOS : certificat de distribution Apple via compte développeur |

---

## 4. User stories

### Onboarding
- En tant que nouvel utilisateur, je réponds à 3 questions en moins de 2 minutes et je démarre ma première séance immédiatement.
- Je vois sur le dashboard les modules que je n'ai pas encore configurés, avec l'XP que chacun me rapportera.
- Je configure un module directement depuis le dashboard en un tap et je vois mon XP crédité immédiatement.
- Je reçois une suggestion contextuelle au bon moment (après ma première séance, après 7 jours de streak…) m'invitant à compléter un module avec l'XP associé.
- Une suggestion ignorée deux fois ne réapparaît plus.
- La section « Gagne tes premiers XP » disparaît une fois tous les modules configurés.

### Entraînement
- En tant qu'utilisateur, je démarre une séance et je vois mes exercices s'enchaîner un par un.
- Je saisis pour chaque série la charge et le nombre de répétitions réalisées.
- Je réordonne les exercices si une machine est occupée.
- Je déclenche un chronomètre de repos entre mes séries.
- Je consulte la progression d'un exercice donné sous forme de courbe.
- Je reçois une suggestion d'augmentation de charge quand j'ai atteint mes objectifs de répétitions.
- Je modifie mon programme : ajout, suppression, remplacement d'exercices, ajustement des séries et fourchettes de répétitions.

### Course à pied
- Je planifie une séance de course dans mon macro-planning, au même titre qu'une séance de musculation.
- Après une sortie, je saisis manuellement la distance et la durée ; l'allure moyenne est calculée automatiquement.
- J'indique mon ressenti d'effort sur une échelle simple après la sortie.
- Je consulte l'historique de mes courses et la progression de mon allure dans le temps.
- Je visualise mon volume de course hebdomadaire et mensuel (kilomètres cumulés).
- Je suis informé lorsque je bats un record personnel (plus longue distance, meilleure allure).

### Suivi corporel
- Je saisis chaque semaine mon poids et mes mensurations principales.
- J'ajoute une photo de progression associée à un relevé.
- Je visualise l'évolution de chaque mesure sous forme de courbe.

### Nutrition
- Je consulte mes objectifs quotidiens de calories et de protéines.
- Je valide ou non, chaque jour, l'atteinte de ces objectifs.

### Rappels
- Je reçois des notifications pour mes séances, mon hydratation, mes repas, mes pauses posture et mes mensurations.
- J'active, désactive ou modifie l'horaire de chaque rappel.

### Gamification
- Je gagne de l'XP en réalisant mes actions quotidiennes.
- Je monte en rang et débloque de nouveaux titres.
- Je vois mon streak progresser jour après jour.
- Je reçois un message de félicitation à chaque événement marquant (séance complétée, record personnel, nouveau rang).

### Données
- J'exporte l'ensemble de mes données pour les sauvegarder ou les transférer.
- J'importe une sauvegarde JSON existante.

### Mise à jour
- Au démarrage, je suis informé si une version plus récente de l'application est disponible.
- Je consulte les notes de version décrivant les changements.
- Je choisis de télécharger et installer la mise à jour, ou de l'ignorer.
- En l'absence de connexion, l'application démarre normalement sans bloquer.

---

## 5. Description fonctionnelle des écrans

### 5.1 Dashboard (accueil)
Écran d'ouverture. Affiche en élément principal le **rang** et son titre, avec la barre de progression d'XP vers le rang suivant. En dessous : le **streak** en cours, la **prochaine séance** prévue, et un bouton d'accès rapide **« Démarrer la séance »**. Accès à la validation nutritionnelle du jour.

Tant que des modules restent à configurer, une section **« ⚡ Gagne tes premiers XP »** s'affiche sous les éléments principaux, listant les modules non complétés avec leur gain d'XP et un accès direct à leur configuration (voir section 9.1). Des bandeaux de nudge contextuel peuvent également s'afficher ponctuellement selon les déclencheurs définis en section 9.1.

Lorsque la prochaine séance prévue est un jour de repos ou qu'aucune séance n'est planifiée, le dashboard affiche un message positif (*« Aujourd'hui c'est repos — ta prochaine séance est [jour] »*) et propose en accès secondaire la **Séance Zéro** pour s'entraîner sans matériel.

### 5.2 Séance en cours
Déroulé des exercices un par un. Pour l'exercice actif : nom, séries cibles, fourchette de répétitions, et saisie charge + répétitions par série. Pour les exercices au poids du corps : compteur de répétitions uniquement, sans champ charge, avec un indicateur de difficulté subjective optionnel (facile / correct / difficile). Bouton de chronomètre de repos. Possibilité de réordonner la liste des exercices restants. En fin de séance, écran récapitulatif avec XP gagné (animé), rang mis à jour et message de félicitation.

### 5.3 Historique d'exercice
Sélection d'un exercice et affichage de la courbe de progression (charge dans le temps), avec le détail des séances passées.

### 5.4 Édition du programme
Liste des séances types (Haut, Bas). Pour chaque séance : liste ordonnée des exercices, modifiables (ajout, suppression, remplacement, réglage des séries et répétitions).

### 5.5 Suivi corporel
Saisie hebdomadaire du poids et des mensurations. Ajout d'une photo. Visualisation des courbes par mesure et galerie de photos datées.

### 5.6 Course à pied
Saisie d'une sortie de course : distance, durée, ressenti d'effort, avec calcul automatique de l'allure moyenne. Historique des courses, courbe de progression de l'allure, volume hebdomadaire et mensuel cumulé, et affichage des records personnels.

### 5.7 Nutrition
Affichage des objectifs quotidiens (calories et protéines cibles). Bouton de validation quotidienne « objectif atteint / non atteint ».

### 5.8 Rappels
Liste des rappels, chacun activable/désactivable et avec horaire modifiable.

### 5.9 Réglages
Données du profil, export/partage de la sauvegarde, import d'une sauvegarde, effacement complet des données, gestion du programme et des rappels, signalement d'un problème, accès à la politique de confidentialité.

---

## 6. Modèle de données (SQLite)

### OnboardingProgression
Suivi de l'état de complétion de la quête de profil : pour chaque module (mensurations, rappels, nutrition, planning), un booléen indiquant s'il a été configuré et si l'XP associé a été attribué. Permet d'afficher ou masquer la section « Gagne tes premiers XP » et de ne jamais attribuer le bonus deux fois. Stocke également l'état de chaque nudge contextuel (non déclenché / affiché une fois / ignoré / complété).

### Profil
Données de l'unique utilisateur de l'installation, renseignées à l'onboarding : taille, poids de départ, objectif, XP totale, rang courant, streak courant, gel de streak disponible, date de dernière activité. Une seule ligne par installation — l'application ne gère pas plusieurs profils sur un même appareil.

### Exercice
Table de référence : nom, groupe musculaire, type (composé ou isolation), mode de charge (avec charge / au poids du corps). Pour les exercices au poids du corps : liste optionnelle de variantes progressives ordonnées par difficulté. Pré-remplie avec un catalogue d'exercices de base incluant les exercices de la Séance Zéro, entièrement modifiable par l'utilisateur.

### SeanceType
Modèle de séance (Haut, Bas) : liste ordonnée d'exercices avec, pour chacun, le nombre de séries cibles et la fourchette de répétitions.

### MacroPlanning
Affectation d'un type d'activité à chaque jour de la semaine : séance de musculation (Haut, Bas), course à pied, ou repos. Pilote la prochaine activité affichée, le rappel correspondant et la qualification des jours de repos.

### Seance
Séance de musculation réalisée : date, type, statut (en cours, complétée), XP attribuée.

### SeriePerformance
Une série effectuée : rattachée à une séance et un exercice, avec l'ordre, la charge et les répétitions réalisées. Table qui alimente l'historique et la détection de surcharge progressive.

### Course
Sortie de course réalisée : date, distance, durée, allure moyenne (calculée), ressenti d'effort, statut, XP attribuée. Table qui alimente l'historique de course, le calcul du volume hebdomadaire/mensuel et la détection de records personnels.

### MesureCorporelle
Relevé hebdomadaire : date, poids, mensurations principales, chemin de la photo associée.

### ObjectifNutritionnel
Cibles quotidiennes : calories, protéines. Et un journal de validation : date, objectif atteint ou non.

### JournalRappel
Configuration et historique : type de rappel, horaire, état actif/inactif, et suivi des occurrences faites ou non.

> L'XP n'est pas stockée comme entité distincte : c'est une valeur dérivée, agrégée à partir des séances de musculation et des courses complétées, des rappels respectés, des mesures saisies et des objectifs nutritionnels validés.

---

## 7. Règles métier

### 7.1 Surcharge progressive
À la clôture d'une séance, pour chaque exercice, l'application vérifie si l'utilisateur a atteint le haut de la fourchette de répétitions sur l'ensemble des séries. Si oui, elle suggère une progression :
- Pour les exercices **avec charge** : suggestion d'augmentation du poids (+2,5 kg par défaut, ajustable).
- Pour les exercices **au poids du corps** : suggestion d'augmentation des répétitions (+2 reps) ou passage à une variante plus difficile (ex. pompes normales → pompes déclinées), si une variante est définie dans le catalogue.

La suggestion est toujours une proposition : l'utilisateur la valide ou l'ajuste manuellement avant qu'elle ne soit retenue.

### 7.2 Système d'XP
Les actions positives rapportent de l'**XP**, avec une pondération qui valorise la régularité plutôt que le volume. Certaines absences en retirent. Barème indicatif à ajuster :

| Action | XP |
|---|---|
| Séance de musculation complétée | +100 |
| Séance de course complétée | +100 |
| Record personnel de course battu | +150 |
| Séance Zéro complétée (première fois, unique) | +80 |
| Jour de repos respecté (pas d'activité prévue, journée saine) | +30 |
| Rappel respecté (hydratation, repas, posture) | +5 chacun |
| Mensurations hebdomadaires saisies | +50 |
| Objectif nutritionnel quotidien validé | +20 |
| Bonus semaine complète (toutes activités prévues réalisées) | +150 |
| Activité prévue manquée (séance ou course) | −50 |
| Jour de repos non respecté | −20 |
| Objectif nutritionnel quotidien non atteint | −10 |
| Onboarding — mensurations de départ configurées | +50 (unique) |
| Onboarding — rappels configurés | +30 (unique) |
| Onboarding — objectifs nutritionnels configurés | +30 (unique) |
| Onboarding — planning hebdomadaire configuré | +20 (unique) |

Une séance de musculation et une séance de course sont traitées de façon équivalente pour l'XP, afin que les deux types d'activité pèsent de manière cohérente. Une activité saisie **rétroactivement** rapporte l'XP normale, comme si elle avait été enregistrée le jour même.

### 7.3 Rangs et titres
Huit paliers à courbe d'XP croissante, du rang E au rang S avec deux paliers supplémentaires au sommet. Le seuil de chaque rang augmente progressivement pour étaler la progression.

| Rang | Titre | Message de progression |
|---|---|---|
| 1 | **Rang E — Recrue** | « Le premier pas est le plus important. » |
| 2 | **Rang D — Pratiquant** | « Tu construis tes bases, séance après séance. » |
| 3 | **Rang C — Compétiteur** | « Tu tiens là où d'autres abandonnent. » |
| 4 | **Rang B — Athlète** | « Tu n'es plus celui que tu étais. » |
| 5 | **Rang A — Élite** | « Peu atteignent ce niveau. Continue. » |
| 6 | **Rang S — Champion** | « Le sommet est en vue. » |
| 7 | **Rang S+ — Vétéran** | « L'expérience forgée dans la durée. » |
| 8 | **Rang S++ — Légende** | « Celui qui n'a jamais arrêté. » |

### 7.4 Streak
Compteur de jours actifs consécutifs. Un jour est « actif » si une séance (musculation ou course) est complétée ou, un jour sans activité prévue, si la routine est respectée.

Un **gel de streak** protège d'un jour manqué unique : il préserve le compteur sans le faire progresser ce jour-là. Le gel se débloque en atteignant un streak de 7 jours, n'est pas cumulable (un seul gel disponible à la fois), et se reconstitue de la même manière après usage. Au-delà d'un jour manqué sans gel disponible, le streak est remis à zéro.

Si une activité manquée est saisie **rétroactivement**, le streak rompu est repris à sa valeur d'avant la rupture.

### 7.5 Records personnels de course
À l'enregistrement d'une course, l'application compare ses données aux courses passées et détecte les records : plus longue distance parcourue et meilleure allure moyenne. Un record battu est signalé à l'utilisateur avec un message de félicitation et donne lieu à un bonus d'XP.

---

## 8. Rappels par défaut

| Rappel | Horaire par défaut | Fréquence |
|---|---|---|
| Séance de musculation | 6h45 | Jours de musculation |
| Course à pied | 6h45 | Jours de course |
| Hydratation | 9h–19h | Toutes les 2 h |
| Petit-déjeuner | 8h30 | Quotidien |
| Déjeuner | 12h30 | Quotidien |
| Collation | 16h30 | Quotidien |
| Dîner | 19h30 | Quotidien |
| Pause posture | 9h–18h | Toutes les heures |
| Mensurations | Samedi 10h | Hebdomadaire |

Tous les rappels sont individuellement activables, désactivables et modifiables. Les rappels d'activité (séance de musculation, course) ne se déclenchent que les jours où le macro-planning prévoit l'activité correspondante.

---

## 9. Comportements détaillés et cycle de vie

### 9.1 Premier lancement et onboarding progressif

L'onboarding est découpé en trois temps pour maximiser la rétention : donner de la valeur immédiatement, révéler la richesse de l'app sans submerger, et inviter à compléter au moment le plus pertinent.

#### Temps 1 — Sprint initial (< 2 minutes, 3 questions)
Au tout premier démarrage, seules trois informations sont demandées :
- Le prénom de l'utilisateur (pour personnaliser les messages)
- Son objectif principal (recomposition corporelle / prise de masse / perte de poids / endurance)
- Son niveau (débutant / intermédiaire / confirmé)

Ces réponses permettent de sélectionner et pré-configurer automatiquement le programme-type le plus adapté et les valeurs par défaut du macro-planning. L'utilisateur est ensuite directement invité à démarrer la **Séance Zéro** pour une première séance immédiate — aucune autre configuration n'est requise.

#### Temps 2 — Quête de profil sur le dashboard (J1 en permanence)
Dès l'accueil, une section **« ⚡ Gagne tes premiers XP »** présente les modules non encore configurés, avec leur gain d'XP associé :

| Module | Accroche | XP |
|---|---|---|
| 📸 Mensurations de départ | « Vois ta transformation semaine après semaine » | +50 XP |
| 🔔 Rappels personnalisés | « Ne rate plus jamais une séance » | +30 XP |
| 🍽️ Objectifs nutritionnels | « Cible tes calories et protéines quotidiennes » | +30 XP |
| 📅 Planning hebdomadaire | « Organise ta semaine d'entraînement » | +20 XP |

Chaque ligne est un accès direct à l'écran de configuration correspondant. Une barre de progression globale indique le nombre de modules complétés (ex. « 1/4 complété »). Un module complété disparaît de la liste et l'XP est immédiatement crédité. La section entière disparaît une fois tous les modules configurés.

#### Temps 3 — Nudges contextuels (J1 à J14)
Des suggestions non intrusives apparaissent sous forme de bandeaux sur le dashboard, déclenchées par des événements précis. Chaque nudge ne s'affiche qu'une fois (deux fois maximum si ignoré) et disparaît définitivement une fois l'action réalisée ou après deux refus :

| Déclencheur | Message |
|---|---|
| Fin de la Séance Zéro | « Première séance dans la boîte ! Ajoute tes mensurations de départ pour mesurer ta progression — +50 XP » |
| J3, si rappels non configurés | « Tu t'entraînes tôt — veux-tu qu'on te rappelle ta séance chaque matin ? — +30 XP » |
| Streak de 7 jours atteint | « 7 jours d'affilée 🔥 — prends une photo de progression, tu le mériteras dans 3 mois — +50 XP » |
| Premier record de course | « Nouveau record ! Configure tes objectifs nutritionnels pour soutenir cette progression — +30 XP » |

Les données complétées lors de l'onboarding étendu (mensurations, rappels, nutrition, planning) restent éditables à tout moment depuis les réglages.

### 9.2 Programmes-type pré-intégrés
L'application est livrée avec au moins un programme-type prêt à l'emploi (programme Haut/Bas orienté débutant avec travail correctif de posture). L'utilisateur en sélectionne un à l'onboarding, puis peut le modifier librement : ajout, suppression, remplacement d'exercices, réglage des séries et fourchettes de répétitions. Le programme n'est jamais figé dans le code : il constitue une donnée modifiable.

### 9.2b Séance Zéro (programme de découverte sans matériel)
La **Séance Zéro** est un programme spécial au poids du corps, disponible dès le premier lancement et accessible à tout moment depuis le dashboard. Elle est conçue pour être complétée n'importe où, sans équipement, en environ 20 minutes.

**Composition (indicative, ajustable)** :
- Pompes — 3 × 8-12 reps
- Squats au poids du corps — 3 × 12-15 reps
- Gainage (planche) — 3 × 20-40 secondes
- Fentes alternées — 3 × 8-10 reps par jambe
- Abdominaux (crunchs ou relevés de buste) — 3 × 12-15 reps
- Dips sur chaise — 3 × 8-12 reps

**Spécificités techniques** :
- Aucun champ charge : compteur de répétitions uniquement, avec indicateur de difficulté subjective optionnel (facile / correct / difficile) utilisé pour la progression.
- Chaque exercice affiche une description courte (1-2 phrases) pour guider un débutant complet.
- La surcharge progressive suggère +2 reps ou le passage à une variante plus difficile (ex. pompes normales → pompes déclinées → pompes pieds surélevés), selon les variantes définies dans le catalogue.
- La Séance Zéro rapporte +80 XP à sa première complétion (bonus unique), puis +100 XP comme toute autre séance de musculation.

**Disponibilité permanente** :
La Séance Zéro reste accessible après l'onboarding depuis le dashboard (affichée en accès secondaire les jours de repos ou quand aucune séance n'est planifiée) et depuis la bibliothèque de programmes. Elle constitue la réponse naturelle aux jours de déplacement, salle fermée, ou semaines légères.

### 9.3 Macro-planning
Un planning détermine quelle activité (séance de musculation Haut ou Bas, course à pied, ou repos) est prévue chaque jour de la semaine. Il pilote l'affichage de la prochaine activité sur le dashboard, le déclenchement du rappel correspondant, et la qualification des jours de repos pour le streak et l'XP. Il est modifiable par l'utilisateur.

### 9.4 Séance interrompue
Une séance quittée avant sa clôture est automatiquement sauvegardée dans son état courant. À la réouverture de l'application, l'utilisateur se voit proposer de reprendre cette séance là où il s'est arrêté, ou de la terminer en l'état.

### 9.5 Chronomètre de repos
Le chronomètre se déclenche manuellement. Lorsque l'application est en arrière-plan, une notification locale signale la fin du temps de repos.

### 9.6 Modification des données
Tout relevé corporel ou toute performance saisie peut être corrigé en cas d'erreur. Les recalculs dépendants (courbes, XP, suggestions) sont mis à jour en conséquence.

### 9.7 Unités
L'application utilise le kilogramme comme unité unique pour les charges et le poids corporel.

### 9.8 Export, import et suppression des données
L'export génère un fichier JSON contenant l'intégralité des données, transmis via le menu de partage natif (Android et iOS). Une fonction d'import permet de réinjecter une sauvegarde JSON, notamment lors d'un changement d'appareil ou pour transmettre ses données de test au développeur.

Une fonction **« Effacer toutes mes données »** est accessible depuis les réglages. Elle supprime l'intégralité des données locales et remet l'application dans son état initial (retour à l'onboarding), après confirmation explicite de l'utilisateur. Cette fonctionnalité est requise par le RGPD (droit à l'effacement).

### 9.9 Mise à jour de l'application
**Android** : l'application est distribuée sous forme d'APK hors store, publié sur les GitHub Releases du dépôt. Chaque version est taguée (versionnage sémantique, ex. `v1.2.0`), accompagnée de ses notes de version et de l'APK en pièce jointe.

**iOS** : la distribution bêta passe par TestFlight. Les testeurs sont invités via leur adresse Apple ID. Les nouvelles versions sont poussées depuis App Store Connect ; TestFlight notifie les testeurs de la disponibilité d'une mise à jour.

À chaque démarrage, l'application interroge l'API publique de GitHub pour récupérer la dernière release publiée et compare son numéro de version à la version installée. Si une version plus récente existe, une bannière non intrusive informe l'utilisateur et affiche les notes de version. Sur Android, l'utilisateur peut télécharger l'APK et lancer son installation. Sur iOS, la bannière renvoie vers TestFlight.

Règles de comportement :
- La vérification est **non bloquante** : sans connexion ou en cas d'échec de l'appel, l'application démarre normalement et la vérification est simplement ignorée. La mise à jour n'empêche jamais l'usage de l'application.
- La mise à jour est **toujours optionnelle** : aucun forçage, aucune version minimale imposée dans le périmètre du MVP.
- Sur Android, l'installation passe par l'écran système ; l'utilisateur doit autoriser l'installation d'applications de sources inconnues et confirmer manuellement.
- Tous les builds Android sont signés avec une **clé de signature identique**, condition pour que la mise à jour s'installe par-dessus la précédente en conservant les données locales. **Cette clé doit être sauvegardée de façon sécurisée dès le départ** (gestionnaire de mots de passe, stockage chiffré hors dépôt) : sa perte rendrait toute mise à jour impossible sans réinstallation complète chez tous les utilisateurs.

### 9.10 Migrations du schéma de données
Le schéma SQLite étant amené à évoluer au fil des versions, l'application gère des **migrations versionnées**. La base stocke un numéro de version de schéma ; au démarrage, l'application applique dans l'ordre les migrations manquantes pour amener la base à la version courante, sans perte des données existantes (séances, mensurations, progression, XP). Ce mécanisme est la contrepartie indispensable d'une distribution à mises à jour fréquentes : il garantit qu'un testeur passant d'une version ancienne à une version récente conserve l'intégralité de ses données.

---

## 10. Découpage en lots de développement

**Lot 1 — Socle**
Mise en place du projet React Native, modèle de données SQLite avec système de migrations versionnées, onboarding sprint (3 questions, sélection automatique du programme), Séance Zéro (programme au poids du corps sans matériel, descriptions d'exercices, progression par reps/variantes), écran de séance avec saisie adaptée selon le type d'exercice (charge + reps ou compteur de reps seul). À l'issue de ce lot, l'application est utilisable dès le premier lancement, sans salle ni équipement.

**Lot 2 — Suivi corporel**
Écran de mensurations, poids et photos, avec courbes d'évolution.

**Lot 3 — Intelligence d'entraînement**
Réorganisation des exercices, chronomètre de repos, historique et courbe par exercice, détection de surcharge progressive, édition du programme.

**Lot 4 — Course à pied**
Type d'activité course, écran de saisie d'une sortie (distance, durée, ressenti), calcul de l'allure, historique, volume hebdomadaire/mensuel, records personnels. Intégration au macro-planning.

**Lot 5 — Rappels**
Notifications locales configurables pour l'ensemble des routines, y compris les rappels d'activité (musculation, course) pilotés par le macro-planning.

**Lot 6 — Gamification, nutrition et onboarding progressif**
Calcul de l'XP (séances musculation et course), rangs et titres (E à S++), streak avec gel de streak, messages de félicitation sur les événements clés (séance complétée, record personnel, nouveau rang), dashboard finalisé, objectifs nutritionnels et validation quotidienne. Section « ⚡ Gagne tes premiers XP » avec suivi de complétion et attribution d'XP unique par module. Nudges contextuels (bandeaux non intrusifs, logique de déclenchement et d'extinction).

**Lot 7 — Sauvegarde**
Fonction d'export, de partage et d'import des données au format JSON. Fonction « Effacer toutes mes données » avec confirmation explicite.

**Lot 8 — Distribution et mise à jour**
Mise en place du build APK Android signé et du build iOS pour TestFlight, publication sur GitHub Releases, et vérification de mise à jour au démarrage avec bannière et notes de version (renvoi TestFlight sur iOS).

Chaque lot livre une version utilisable : l'application gagne en confort à chaque étape sans jamais rester inachevée. Le système de migrations du Lot 1 est mis en place dès le départ, car il conditionne la préservation des données à chaque mise à jour ultérieure.

---

## 11. Critères d'acceptation du MVP

Le MVP est considéré comme abouti lorsque l'utilisateur peut, hors connexion internet pour toutes les fonctions cœur : compléter l'onboarding initial, réaliser une séance de musculation complète avec saisie et historique (y compris reprise d'une séance interrompue), recevoir une suggestion de surcharge progressive à valider, enregistrer une sortie de course et consulter son historique, son volume et ses records, enregistrer ses mensurations hebdomadaires avec photo, recevoir ses rappels quotidiens pilotés par le macro-planning, voir son rang et son streak évoluer (gains et pertes d'XP, gel de streak), valider ses objectifs nutritionnels, exporter et importer l'ensemble de ses données au format JSON, et effacer l'intégralité de ses données depuis les réglages. Lorsqu'une connexion est disponible, l'application détecte au démarrage la présence d'une version plus récente sur GitHub et permet de la télécharger (Android) ou renvoie vers TestFlight (iOS) ; cette vérification n'empêche jamais l'usage hors ligne. Une mise à jour installée par-dessus une version antérieure conserve l'intégralité des données grâce aux migrations de schéma. L'application est fonctionnelle sur Android (APK GitHub) et iOS (TestFlight).

---

## 12. Confidentialité et conformité RGPD

L'application traite des données à caractère personnel (poids, mensurations, photos de progression). Bien que ces données soient stockées exclusivement en local sur l'appareil de l'utilisateur et ne soient jamais transmises à un serveur tiers, la distribution à des personnes extérieures impose de respecter les principes du RGPD.

### 12.1 Principes appliqués
- **Données locales uniquement** : aucune donnée personnelle ne quitte l'appareil, sauf action explicite de l'utilisateur (export JSON, partage de sauvegarde). Ce point est communiqué clairement à l'utilisateur lors de l'onboarding.
- **Droit à l'effacement** : la fonction « Effacer toutes mes données » (section 9.8) permet à l'utilisateur de supprimer l'intégralité de ses données à tout moment, sans condition.
- **Minimisation des données** : seules les données nécessaires au fonctionnement de l'application sont collectées.
- **Pas de pistage, pas de publicité** : aucun SDK analytique, publicitaire ou de tracking n'est intégré dans le MVP.

### 12.2 Politique de confidentialité
Une politique de confidentialité synthétique doit être accessible depuis les réglages de l'application. Elle précise a minima : la nature des données collectées, leur lieu de stockage (appareil local), l'absence de transmission à des tiers, et les droits de l'utilisateur (accès, export, suppression). Ce document est également requis par Apple (App Store / TestFlight) et Google (Play Store) pour toute application traitant des données personnelles.

---

## 13. Feedback et remontée d'erreurs

Avec plusieurs utilisateurs sur des appareils variés, il n'est plus possible de se reposer uniquement sur l'expérience du développeur pour détecter les problèmes.

### 13.1 Signalement in-app
Un bouton **« Signaler un problème »** est accessible depuis les réglages. Il ouvre le client mail natif avec un message pré-rempli contenant :
- la version de l'application installée,
- le système d'exploitation et sa version,
- le modèle de l'appareil,
- un champ libre pour la description du problème.

### 13.2 Crash reporting (post-MVP)
L'intégration d'un outil de remontée automatique de plantages (ex. Sentry, en mode sans données personnelles) est envisagée pour une version ultérieure, afin de détecter les erreurs sans dépendre du signalement manuel des utilisateurs.

---

## 14. Roadmap post-MVP

Points identifiés lors de la conception du MVP, à traiter dans les versions ultérieures :

| Évolution | Justification |
|---|---|
| Publication sur le Google Play Store et l'App Store | Simplifier l'installation (suppression de la contrainte "sources inconnues" sur Android, suppression de TestFlight sur iOS) |
| Internationalisation (i18n) et support des unités impériales (lbs) | Ouvrir l'application à des utilisateurs hors de France |
| Crash reporting automatique (ex. Sentry) | Améliorer la détection des bugs sans dépendre du signalement manuel |
| Système de quêtes et défis hebdomadaires | Enrichir la gamification |
| Suivi nutritionnel détaillé | Intégration ou remplacement de l'application tierce déléguée |
| Synchronisation cloud et multi-appareils | Permettre l'utilisation sur plusieurs appareils par un même utilisateur |
| Thème clair | Accessibilité et préférences utilisateur |
| Badges et récompenses visuelles avancées | Enrichir la gamification |
| Mise à jour OTA du code JavaScript (Expo Updates) | Simplifier le déploiement de correctifs mineurs |
| Mise à jour forcée / version minimale supportée | Garantir la cohérence des données sur le terrain |
| Suivi GPS des courses | Tracé cartographique, profil d'altitude, allure instantanée, splits, audio-coaching |
