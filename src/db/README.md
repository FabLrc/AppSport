# Couche données — SQLite et migrations

## Vue d'ensemble

- **`client.ts`** : ouvre l'unique handle SQLite (`appsport.db`), pose les PRAGMA
  d'hygiène (WAL, foreign keys), et l'expose en singleton.
- **`migrate.ts`** : runner de migrations versionnées. Lit la version courante
  dans `_schema_version`, applique chaque migration manquante dans sa propre
  transaction, met à jour la table de suivi.
- **`migrations/`** : une migration par fichier, numérotée et nommée.
- **`repositories/`** : (à venir) une fonction CRUD par entité. Les écrans ne
  doivent jamais écrire de SQL directement — ils passent par un repository.

## Ajouter une migration

1. Créer un fichier `NNN_description_courte.ts` dans `src/db/migrations/`, où
   `NNN` est le numéro suivant disponible (zéro-paddé sur 3 chiffres pour le
   tri alphabétique des fichiers, mais c'est purement cosmétique — c'est le
   champ `version` qui fait foi).
2. Exporter un objet `Migration` :

   ```ts
   import type { Migration } from '../migrate';

   export const migration: Migration = {
     version: 2, // strictement supérieur à la précédente
     name: 'add_profil_table',
     async up(db) {
       await db.execAsync(`
         CREATE TABLE profil (
           id INTEGER PRIMARY KEY CHECK (id = 1),
           prenom TEXT NOT NULL,
           objectif TEXT NOT NULL,
           ...
         );
       `);
     },
   };
   ```

3. Ajouter l'import dans `migrations/index.ts` à la fin du tableau
   `ALL_MIGRATIONS`.
4. Tester localement : démarrer l'app, vérifier qu'au démarrage le runner
   logge l'application de la migration et que la table est créée.

## Règles inviolables

- **Ne jamais modifier une migration déjà publiée.** Si une correction est
  nécessaire, créer une nouvelle migration qui modifie (ALTER, etc.) le
  schéma. Une migration peut avoir été appliquée chez d'autres testeurs et
  changer son contenu casserait leurs bases.
- **Ne jamais réordonner.** Le numéro de version est la source de vérité ;
  le tableau dans `index.ts` doit rester en ordre croissant strict.
- **Pas de `DROP TABLE` sur une table contenant des données utilisateur**
  sans plan de migration sérieux. Les testeurs ne doivent pas perdre leur
  progression entre deux versions (c'est tout l'intérêt du système).

## Pourquoi pas `PRAGMA user_version` ?

SQLite a un mécanisme intégré (`PRAGMA user_version`) pour le numéro de
schéma. On préfère une table dédiée parce qu'elle permet de stocker aussi
le **nom** de chaque migration appliquée et son **horodatage**, ce qui
facilite le debug en cas de problème chez un testeur.
