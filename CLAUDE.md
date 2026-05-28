@AGENTS.md

# AppSport — contexte pour Claude Code

## Quoi

MVP d'application mobile de suivi d'entraînement, mono-utilisateur par
installation, 100 % hors ligne. React Native (Expo SDK 54) + TypeScript
strict. Distribution APK Android + TestFlight iOS.

**Source de vérité fonctionnelle** : [`docs/cahier-des-charges.md`](docs/cahier-des-charges.md).
À considérer comme un contrat. Ne pas modifier sans validation produit
explicite. À l'inverse, si le code dévie de ce qui est écrit dedans, c'est
le code qui est en retard — pas le cahier.

## Documentation à lire en priorité

1. [`docs/cahier-des-charges.md`](docs/cahier-des-charges.md) — quoi construire et pourquoi
2. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — choix techniques et structure
3. [`docs/ROADMAP.md`](docs/ROADMAP.md) — ce qui est fait, ce qui reste
4. [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) — comment ajouter une feature
5. [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) — schéma planifié et statut
6. [`docs/BRANDING.md`](docs/BRANDING.md) — comment rebrander
7. [`src/db/README.md`](src/db/README.md) — détails couche données

## Conventions clés

- **Feature-based** : chaque domaine du cahier sous `src/features/<domain>/`.
  Pas de dossier global `screens/` ou `components/`.
- **Domaine pur** : règles métier dans `src/domain/`, sans dépendance RN.
  Testable seul, réutilisable.
- **Repository pattern** : accès SQLite isolé dans `src/db/repositories/`.
  Les écrans n'écrivent jamais de SQL direct.
- **Migrations** : versionnées, jamais modifiées après publication. Ajouter
  une nouvelle migration plutôt que d'éditer une ancienne.
- **Branding** : tout dans `branding/branding.config.json` + assets dans
  `branding/assets/`. Aucune valeur de branding en dur ailleurs.
- **Couleurs et espacements** : passer par `theme.colors.*` / `theme.spacing.*`,
  jamais en dur dans les composants.
- **Strings UI** : `src/shared/strings.ts` (FR pour le MVP).

## Outils de vérification

- `npm run typecheck` — TypeScript strict
- `npm run lint` — ESLint
- `npm run format:check` — Prettier (lecture seule)
- `npm run check` — combine les trois

Lancer `npm run check` avant chaque commit.

## Style de commits

Messages **courts, descriptifs, en français, sans co-author, sans mention
d'IA**. Préfixes `feat:` / `fix:` / `chore:` / `docs:` / `refactor:` / `test:`.

## Ce qui n'est PAS encore en place

Le socle livre l'infrastructure (build, branding, theme, navigation,
migrations, docs). **Aucune fonctionnalité utilisateur n'est implémentée.**
Le premier vrai écran (onboarding + Séance Zéro) arrive au Lot 1.

L'écran qui s'affiche au démarrage est une **page placeholder** indiquant
« Socle prêt ». C'est attendu.

## Anti-patterns à éviter

- Ne pas inliner les styles (`style={{ ... }}`) — utiliser `StyleSheet.create`.
- Ne pas dupliquer les règles du cahier dans les écrans — passer par
  `src/domain/`.
- Ne pas faire de SQL dans les écrans — passer par un repository.
- Ne pas hardcoder un nom d'app, un slug, une couleur de marque — passer
  par le branding.
- Ne pas modifier une migration déjà commitée — créer une nouvelle.
- Ne pas ajouter de dépendance sans s'assurer qu'elle est compatible Expo
  SDK 54 (utiliser `npx expo install <pkg>` plutôt que `npm install` pour
  les packages `expo-*` et les peers React Native).
