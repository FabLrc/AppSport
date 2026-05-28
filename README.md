# AppSport

> **Nom de code provisoire.** Le nom, le logo et l'identité visuelle ne sont
> pas définitifs. Voir [`docs/BRANDING.md`](docs/BRANDING.md) pour la procédure
> de changement.

MVP d'une application mobile de suivi d'entraînement, mono-utilisateur par
installation, 100 % hors ligne. React Native (Expo), distribution Android via
APK GitHub Releases et iOS via TestFlight.

Source de vérité produit : [`docs/cahier-des-charges.md`](docs/cahier-des-charges.md).

## Démarrage rapide

### Prérequis

- **Node.js 22 ou 24** (LTS).
- **npm 10+** (livré avec Node).
- Pour exécuter sur device physique : l'application **Expo Go** (Android et iOS).
- Pour exécuter sur émulateur :
  - Android : Android Studio + AVD configuré.
  - iOS (macOS uniquement) : Xcode + un simulateur installé.

### Installation

```bash
npm install
```

### Lancer en développement

```bash
npm start
```

Metro démarre, affiche un QR code et les raccourcis :

- `i` → ouvre le simulateur iOS (macOS uniquement).
- `a` → ouvre l'émulateur Android.
- QR code → scanner avec Expo Go sur device physique.

L'app affiche un **écran placeholder** indiquant que le socle est prêt. C'est
attendu : le Lot 1 (onboarding et première séance) n'est pas encore livré.
Voir [`docs/ROADMAP.md`](docs/ROADMAP.md).

### Vérifications statiques

```bash
npm run typecheck    # TypeScript strict
npm run lint         # ESLint
npm run format:check # Prettier (lecture seule)
npm run format       # Prettier (écriture)
npm run check        # combine les trois précédents (CI / pré-commit)
```

## Documentation projet

- [`docs/cahier-des-charges.md`](docs/cahier-des-charges.md) — source de vérité fonctionnelle.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — choix techniques, structure, conventions.
- [`docs/BRANDING.md`](docs/BRANDING.md) — comment changer nom, couleurs, logo.
- [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) — modèle de données et état des tables.
- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) — workflow dev, ajouter une feature, ajouter une migration.
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — avancement des 8 lots du cahier.
- [`src/db/README.md`](src/db/README.md) — détails couche données et migrations.
- [`branding/assets/README.md`](branding/assets/README.md) — formats des assets brandés.

## Statut

| Lot | Périmètre                                             | Statut     |
| --- | ----------------------------------------------------- | ---------- |
| 0   | Socle (Expo, branding, theme, navigation, migrations) | ✅ livré   |
| 1   | Onboarding sprint, Séance Zéro, écran de séance       | ⏳ à venir |
| 2   | Suivi corporel                                        | ⏳ à venir |
| 3   | Intelligence d'entraînement                           | ⏳ à venir |
| 4   | Course à pied                                         | ⏳ à venir |
| 5   | Rappels                                               | ⏳ à venir |
| 6   | Gamification, nutrition, onboarding progressif        | ⏳ à venir |
| 7   | Sauvegarde                                            | ⏳ à venir |
| 8   | Distribution et mise à jour                           | ⏳ à venir |

Détails dans [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Stack

- Expo SDK 54 (React Native 0.81)
- TypeScript strict
- React Navigation 7 (native-stack + bottom-tabs)
- expo-sqlite (stockage local)
- Zustand (state global), react-hook-form + zod (formulaires)
- ESLint 9 (flat config) + Prettier 3

Détails et justifications dans [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
