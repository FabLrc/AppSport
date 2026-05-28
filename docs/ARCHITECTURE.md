# Architecture

## Vue d'ensemble

L'application est un MVP React Native (Expo) **mono-utilisateur par
installation, 100 % hors ligne**. Toutes les données vivent dans une base
SQLite locale ; aucune synchronisation, aucun compte, aucun serveur. La
seule connexion réseau utilisée concerne la vérification de mise à jour
(Lot 8).

Le code source est organisé pour qu'un autre développeur puisse :

1. Trouver rapidement où ajouter une fonctionnalité d'un lot du cahier.
2. Refaçonner le branding sans toucher au code applicatif.
3. Étendre le schéma de données sans casser les installations existantes.

## Stack et choix techniques

| Élément       | Choix                                                | Justification                                                    |
| ------------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| Runtime       | Expo SDK 56 (managed)                                | Build APK + TestFlight via EAS, APIs natives `expo-*` cohérentes |
| Langage       | TypeScript strict                                    | Maintenabilité, refacto sereins sur un projet à long terme       |
| Navigation    | React Navigation 7 (native-stack + bottom-tabs)      | Standard de fait, dark mode natif, animations natives            |
| Stockage      | `expo-sqlite`                                        | Imposé par le cahier (section 3)                                 |
| State global  | Zustand                                              | Léger, sans boilerplate, un store par domaine                    |
| Formulaires   | `react-hook-form` + `zod`                            | Validation typée, peu de re-renders, schémas réutilisables       |
| Dates         | `date-fns`                                           | Léger, tree-shakeable, FR locale                                 |
| Lint / format | ESLint 9 (flat config) + Prettier 3                  | Cohérence du code, CI rapide                                     |
| UI            | StyleSheet + tokens centralisés (pas de lib externe) | Contrôle total, zéro friction pour le branding                   |

Dépendances **non installées** dans le socle, ajoutées avec leur lot :

- `expo-notifications` (Lot 5)
- `expo-image-picker`, `expo-file-system`, `expo-sharing` (Lots 2 et 7)
- bibliothèque de charts (Lot 2+) — choix entre Victory Native et composant maison à statuer

## Structure de dossiers

```
AppSport/
├── app.config.ts            ← config Expo dynamique, lit branding/
├── branding/                ← TOUT ce qui est brandé (nom, couleurs, assets)
│   ├── branding.config.json   ← source de vérité (pure data)
│   ├── branding.config.ts     ← wrapper TypeScript (types + exports)
│   └── assets/                ← icônes, splash, favicon
├── docs/                    ← ce dossier
├── src/
│   ├── app/                   ← composant racine, navigation, providers
│   │   ├── App.tsx              ← root: GestureHandler + SafeArea + DB + Nav
│   │   ├── navigation/          ← stack racine, types de routes, thème
│   │   └── providers/           ← DatabaseProvider, ThemeProvider (à venir)
│   ├── features/              ← un dossier par domaine (Lot 1+)
│   │   ├── _placeholder/        ← écran provisoire du socle
│   │   ├── onboarding/          ← Lot 1
│   │   ├── training/            ← Lots 1, 3
│   │   ├── running/             ← Lot 4
│   │   ├── body/                ← Lot 2
│   │   ├── nutrition/           ← Lot 6
│   │   ├── reminders/           ← Lot 5
│   │   ├── gamification/        ← Lot 6
│   │   └── settings/            ← Lot 7
│   ├── shared/                ← réutilisable transverse
│   │   ├── components/          ← Screen, Text, Button, Card…
│   │   ├── hooks/               ← hooks génériques
│   │   ├── theme/               ← colors, spacing, typography, radius
│   │   ├── utils/               ← helpers purs (dates, formats…)
│   │   └── strings.ts           ← chaînes FR centralisées
│   ├── db/                    ← couche données
│   │   ├── client.ts            ← singleton SQLite
│   │   ├── migrate.ts           ← runner versionné
│   │   ├── migrations/          ← une migration par fichier, ordonnées
│   │   └── repositories/        ← une fonction CRUD par entité (Lot 1+)
│   ├── domain/                ← logique métier pure, sans dépendance RN
│   │   ├── xp/                  ← Lot 6
│   │   ├── ranks/               ← Lot 6
│   │   ├── streak/              ← Lot 6
│   │   ├── progressive-overload/← Lot 3
│   │   └── personal-records/    ← Lot 4
│   └── state/                 ← stores Zustand (Lot 1+)
├── App.tsx                  ← thin wrapper, exporte src/app/App.tsx
└── index.ts                 ← entrypoint Expo (registerRootComponent)
```

## Principes architecturaux

### Feature-based

Chaque domaine fonctionnel a son dossier sous `src/features/`. À l'intérieur :
écrans, hooks, stores Zustand spécifiques. **Pas de dossier global `screens/`
ni `components/`** : ces dossiers grossissent sans organisation et rendent la
navigation dans le code pénible passé une certaine taille.

Les composants partagés entre features (UI primitifs, helpers) vivent dans
`src/shared/`.

### Domaine pur

`src/domain/` contient la logique métier **sans dépendance React Native ni
SQLite**. Pure functions, types, calculs. Exemples : calcul d'XP gagné pour
une séance, détection d'un record de course, calcul du rang à partir d'XP
total, application de la règle de surcharge progressive.

C'est testable en isolation (Jest, sans setup RN) et réutilisable depuis
plusieurs écrans / stores. Cela permet aussi d'éviter de dupliquer les règles
du cahier au fil des écrans.

### Repository pattern

L'accès à SQLite passe **exclusivement** par les fichiers de
`src/db/repositories/<entity>.ts`. Un repository expose des fonctions typées
(`getSeanceById`, `createCourse`, …) qui parlent en termes d'entités du
domaine, jamais en termes de SQL ou de lignes brutes.

Conséquence : si on change le schéma (renommage de colonne, table jointe), on
modifie le repository sans toucher aux écrans qui en dépendent.

### Branding piloté par un seul fichier

`branding/branding.config.json` est la **source unique** pour tout ce qui
identifie l'application (nom, slug, bundle ID, version, palette de
couleurs, polices). Le wrapper TypeScript `branding.config.ts` apporte les
types et est lu par le thème runtime. La config Expo (`app.config.ts`)
importe le JSON directement.

Voir [`BRANDING.md`](BRANDING.md) pour la procédure complète.

### Migrations SQLite versionnées

Chaque évolution du schéma est une **migration numérotée** dans
`src/db/migrations/`. Le runner (`src/db/migrate.ts`) lit la version courante
dans la table `_schema_version`, applique les migrations manquantes en
transaction, met à jour le registre. **Une migration publiée n'est jamais
modifiée** ; toute correction passe par une nouvelle migration.

C'est ce mécanisme qui garantit qu'un testeur installant une nouvelle version
de l'APK conserve ses données. Voir [`src/db/README.md`](../src/db/README.md).

### Pas de Context superflu

Le DatabaseProvider n'expose pas de Context React : la base SQLite est
accessible via `getDatabase()` (singleton). Le provider sert uniquement à
**séquencer** les choses : on ne monte pas la navigation avant que la base
soit prête. Cela évite la prop-drilling et le boilerplate de Context API
pour quelque chose qui est, par nature, global.

Pour l'état applicatif (profil, séance en cours, etc.), on utilisera Zustand
avec un store par domaine.

## Flux de démarrage

1. Expo charge `index.ts` → `registerRootComponent(App)`.
2. `App.tsx` (root) ré-exporte `src/app/App.tsx`.
3. `src/app/App.tsx` monte la pile de providers :
   - `GestureHandlerRootView` (requis par RN gesture handler)
   - `SafeAreaProvider`
   - `StatusBar` en mode `light`
   - `DatabaseProvider` (ouvre SQLite, applique les migrations)
   - `NavigationContainer` avec `navigationTheme` (dark, palette branding)
   - `RootNavigator` (stack)
4. Tant que la base n'est pas prête, le `DatabaseProvider` affiche un
   spinner ou, en cas d'échec, un écran d'erreur avec un bouton « Réessayer ».
5. Une fois prête, le `RootNavigator` affiche l'écran initial (placeholder
   pour l'instant ; à terme : onboarding si profil non configuré, sinon
   dashboard).

## Conventions de code

- **Indentation** : 2 espaces.
- **Quotes** : simples (`'`) en TS/JS, doubles en JSON.
- **Imports** : groupés (externes / `@branding` / `@/` / relatifs), triés
  alphabétiquement par groupe.
- **Composants** : `function ComponentName(...)`, jamais `const ComponentName: FC<...>`.
- **Styles** : `StyleSheet.create({...})` au bas du fichier, jamais inline
  (sauf style dynamique calculé sur place, et minimal).
- **Strings UI** : passer par `src/shared/strings.ts` plutôt que d'inliner.
- **Couleurs et espacements** : `theme.colors.*` / `theme.spacing.*`,
  jamais en dur dans les composants.
- **Commits** : courts, descriptifs, en français, sans co-author. Préfixes
  `feat:` / `fix:` / `chore:` / `docs:` / `refactor:` / `test:`.
