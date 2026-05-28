# Développement

Comment travailler sur ce projet au quotidien. Cible : un développeur qui
n'a jamais vu le repo et qui doit ajouter une fonctionnalité prévue par le
cahier des charges.

## Préambule

- Lire [`cahier-des-charges.md`](cahier-des-charges.md) en entier (~15 minutes).
- Lire [`ARCHITECTURE.md`](ARCHITECTURE.md) pour comprendre la structure.
- Lire [`ROADMAP.md`](ROADMAP.md) pour savoir ce qui est fait / à faire.
- Démarrer l'app au moins une fois (`npm install && npm start`) pour vérifier
  l'environnement.

## Workflow standard

1. Identifier la story du cahier à implémenter (section 4, ou un lot précis
   de la section 10).
2. Vérifier dans [`DATA-MODEL.md`](DATA-MODEL.md) si une table doit être
   créée / modifiée.
3. Si oui : créer une migration (voir « Ajouter une migration » ci-dessous).
4. Créer / mettre à jour le repository de l'entité dans `src/db/repositories/`.
5. Si logique métier non triviale : la modéliser comme **fonction pure** dans
   `src/domain/` (testable seule). Exemples : calcul d'XP, détection d'un
   record, application de la surcharge progressive.
6. Implémenter écrans et store Zustand dans `src/features/<domain>/`.
7. Câbler dans la navigation (`src/app/navigation/`).
8. Mettre à jour la doc : `ROADMAP.md`, `DATA-MODEL.md` si nouvelle table.
9. Lancer `npm run check`, corriger les éventuelles erreurs.
10. Commit descriptif. Pas de co-author. Préfixe (`feat:` / `fix:` / `chore:` / `docs:` / `refactor:`).

## Ajouter une feature

Exemple : ajouter l'écran d'historique d'un exercice (cahier 5.3, Lot 3).

```
src/features/training/
├── ExerciseHistoryScreen.tsx        ← écran (UI)
├── useExerciseHistory.ts            ← hook qui lit via repository
├── ExerciseProgressChart.tsx        ← sous-composant
└── ...
```

- L'écran lit les données via un **hook** qui appelle le **repository**.
- Le hook peut utiliser Zustand si l'état doit être partagé entre écrans,
  sinon `useState` / `useReducer` local.
- L'écran utilise **uniquement** les composants de `src/shared/components/`
  - `View`/`ScrollView` natifs. Pas de design custom inline.
- Ajouter une entrée dans `RootStackParamList` (`src/app/navigation/types.ts`).
- Ajouter le `Stack.Screen` correspondant dans `RootNavigator.tsx`.

## Ajouter une migration

Voir aussi [`src/db/README.md`](../src/db/README.md).

1. Créer `src/db/migrations/NNN_description.ts` (numéro suivant disponible).
2. Implémenter `up(db)` avec le SQL nécessaire. Une migration = un sujet
   cohérent (pas dix `CREATE TABLE` mélangés).
3. Ajouter l'import dans `migrations/index.ts`, à la fin du tableau
   `ALL_MIGRATIONS`.
4. Documenter la nouvelle table dans [`DATA-MODEL.md`](DATA-MODEL.md).
5. Tester localement : démarrer l'app, vérifier le log
   `[db] migrations appliquées : vX → vY`.

**Règle absolue** : une migration publiée (sur n'importe quel testeur) ne
doit **jamais** être modifiée. Toute correction = nouvelle migration.

## Ajouter un repository

Convention : un fichier par entité, dans `src/db/repositories/<entity>.ts`.
Exporte des fonctions typées qui parlent en termes du domaine, **jamais**
en SQL côté caller.

```ts
// src/db/repositories/seance.ts
import { getDatabase } from '../client';

export type Seance = {
  id: number;
  date: string;
  seanceTypeId: number | null;
  statut: 'en_cours' | 'completee';
  xpAttribue: number;
};

export async function getSeanceById(id: number): Promise<Seance | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    id: number;
    date: string;
    seance_type_id: number | null;
    statut: string;
    xp_attribue: number;
  }>(`SELECT * FROM seance WHERE id = ?`, [id]);
  if (row === null) return null;
  return {
    id: row.id,
    date: row.date,
    seanceTypeId: row.seance_type_id,
    statut: row.statut as Seance['statut'],
    xpAttribue: row.xp_attribue,
  };
}
```

Le **mapping `snake_case` ↔ `camelCase`** se fait dans le repository, pas
dans l'écran. Les écrans manipulent des objets en `camelCase` cohérent avec
TypeScript.

## Ajouter de la logique de domaine

Quand une règle métier dépasse 5 lignes ou apparaît à plusieurs endroits,
l'extraire dans `src/domain/`. Exemple :

```ts
// src/domain/xp/calculateXpForSeance.ts
export function calculateXpForSeance(seance: SeanceCompletee): number {
  // logique pure, sans appel DB, sans dépendance RN
}
```

Une fonction de domaine :

- n'a **aucune dépendance** sur React Native, SQLite, ou Expo.
- prend ses entrées en paramètres, renvoie un résultat.
- est testable avec un Jest standard (pas de setup RN).
- est nommée et documentée par son intention métier, pas son implémentation.

## Tests

Pour le MVP, on **ne s'impose pas** de couverture sur les écrans (testing-library
RN configuration sera ajoutée si besoin). En revanche :

- Toute fonction de `src/domain/` qui implémente une règle du cahier
  **doit** avoir un test unitaire. Ce sont les seules vraies règles à ne
  pas casser silencieusement.
- Pour le runner de migrations : un test d'intégration sera utile au Lot 1
  quand des données métier seront présentes.

À ajouter avec les premiers tests : `jest`, `@testing-library/react-native`
(ce dernier pour quand on testera des composants).

## Commandes utiles

| Commande                        | Effet                                                                 |
| ------------------------------- | --------------------------------------------------------------------- |
| `npm start`                     | démarre Metro et l'interface de dev Expo                              |
| `npm run android` / `ios`       | comme `start` mais ouvre directement la plateforme                    |
| `npm run typecheck`             | vérifie TypeScript (strict)                                           |
| `npm run lint`                  | ESLint                                                                |
| `npm run lint:fix`              | ESLint avec corrections automatiques                                  |
| `npm run format`                | Prettier (écriture)                                                   |
| `npm run format:check`          | Prettier (lecture seule)                                              |
| `npm run check`                 | typecheck + lint + format:check (le combo CI)                         |
| `npx expo install <pkg>`        | installe un package compatible avec le SDK Expo actuel                |
| `npx expo config --type public` | affiche la config Expo appliquée (utile après changement de branding) |

## Conventions de commit

Messages courts, descriptifs, en français, **sans mention d'IA et sans
co-author**. Préfixes :

- `feat:` — nouvelle fonctionnalité utilisateur
- `fix:` — bug fix
- `refactor:` — code modifié sans changement de comportement
- `chore:` — outillage, dépendances, scripts
- `docs:` — documentation seule
- `test:` — tests seuls
- `style:` — formatage seul (peu fréquent vu Prettier en CI)

Exemples :

- `feat: écran d'onboarding sprint avec sélection automatique du programme`
- `fix: gel de streak s'applique après une journée manquée et non avant`
- `chore: bump react-navigation à 7.17`

## Débogage

- **Logs** : `console.log` apparaît dans la console Metro. Pour le DevTools
  React, presser `j` dans le terminal Metro.
- **Base de données** : pas d'outil intégré pour inspecter la base à chaud
  dans le périmètre du socle. À ajouter (si besoin) : un écran de debug en
  build dev qui dumpe les tables, ou utiliser `expo-sqlite`'s
  `getAllAsync('SELECT * FROM …')` ponctuel.
- **Cache Metro** : `npm start -- --clear` après changement de config,
  d'alias ou de plugin.

## Quand demander un point produit

Si quelque chose dans le cahier des charges est ambigu, ne pas inventer.
Marquer un `TODO(spec)` dans le code et lever la question avec le produit
avant de coder. Le cahier est la source de vérité ; le code ne doit pas
silencieusement la trahir.
