import { migration as migration001 } from './001_init';
import { migration as migration002 } from './002_lot1_tables';
import { migration as migration003 } from './003_lot2_mesures';
import { migration as migration004 } from './004_lot4_course';
import { migration as migration005 } from './005_lot5_rappels';
import { migration as migration006 } from './006_lot6_gamification';

import type { Migration } from '../migrate';

/**
 * Liste ordonnée et exhaustive des migrations à appliquer, du plus ancien au
 * plus récent. **Ne jamais réordonner, ne jamais modifier le contenu d'une
 * migration déjà publiée** : ajouter une nouvelle entrée à la suite.
 *
 * Voir `src/db/README.md` pour la procédure d'ajout.
 */
export const ALL_MIGRATIONS: readonly Migration[] = [
  migration001,
  migration002,
  migration003,
  migration004,
  migration005,
  migration006,
];
