# Domaine métier

Code **pur** qui exprime les règles du cahier des charges.

## Règle d'or

**Aucune dépendance React Native, Expo, SQLite ou de provenance "framework".**
Le code de ce dossier doit pouvoir être exécuté par un Jest standard, dans
un Node nu, sans setup.

Concrètement :

- Pas d'`import { ... } from 'react-native'`.
- Pas d'`import * as SQLite from 'expo-sqlite'`.
- Pas de hooks React, pas de `useState`, pas de `useEffect`.
- Pas d'accès à `Date.now()` directement dans le corps des fonctions —
  passer l'horloge en paramètre (`currentDate: Date`) si la fonction
  dépend de la date courante. Cela rend les tests déterministes.

## Quoi y mettre

- **Calcul d'XP** par type d'action (séance, course, rappel respecté…).
  Le barème vient du cahier section 7.2.
- **Progression de rang** à partir d'un total d'XP : courbe croissante,
  rang courant, XP jusqu'au rang suivant. Cahier 7.3.
- **Gestion du streak** : incrément quotidien, gel de streak, reprise après
  saisie rétroactive d'une activité manquée. Cahier 7.4.
- **Surcharge progressive** : à partir des dernières séries d'un exercice,
  proposer un nouveau poids ou une nouvelle cible de reps. Cahier 7.1.
- **Records personnels course** : détection à partir de l'historique.
  Cahier 7.5.
- **Validation d'une séance** : règles d'éligibilité, contraintes minimums.

## Quoi n'y pas mettre

- L'**affichage** d'un message de félicitation (c'est un écran).
- La **persistance** d'une nouvelle valeur de XP (c'est un repository).
- La **planification** d'une notification (c'est une feature `reminders`).

## Structure attendue

```
src/domain/
├── xp/
│   ├── calculateXpForSeance.ts
│   ├── calculateXpForCourse.ts
│   ├── calculateXpForRappel.ts
│   ├── types.ts
│   └── index.ts
├── ranks/
│   ├── computeRank.ts
│   ├── nextRankThreshold.ts
│   ├── ranks.ts                ← seuils par rang
│   └── index.ts
├── streak/
├── progressive-overload/
├── personal-records/
└── README.md                    ← ce fichier
```

Une fonction publique par fichier (plus simple à trouver, à tester, à
nommer). L'`index.ts` du dossier ré-exporte ce qui est utile à l'extérieur.

## Tests

Chaque fonction qui implémente une règle du cahier **doit avoir un test
unitaire** (à mettre en place avec le Lot 1). Le test cite la section du
cahier qu'il vérifie pour qu'on puisse retrouver la règle si le cahier
évolue.

Exemple :

```ts
// src/domain/streak/applyDay.test.ts
describe('applyDay (cahier 7.4)', () => {
  test('incrémente le streak quand une séance est complétée le jour prévu', () => {
    // ...
  });

  test('utilise le gel de streak quand un jour est manqué', () => {
    // ...
  });

  test('remet le streak à zéro après un jour manqué sans gel', () => {
    // ...
  });
});
```
