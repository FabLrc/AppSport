import { create } from 'zustand';

import { checkForUpdate, type UpdateInfo } from '@/shared/updateService';

/**
 * État de la vérification de mise à jour pour la session courante.
 *
 * Le « dismiss » de la bannière est volontairement **non persisté** : fermer la
 * bannière la masque jusqu'au prochain démarrage de l'application. Tant que la
 * mise à jour n'est pas installée, elle réapparaîtra au lancement suivant — ce
 * qui pousse en douceur les testeurs à se mettre à jour, sans table dédiée.
 */
interface UpdateState {
  /** Mise à jour disponible détectée, sinon `null`. */
  update: UpdateInfo | null;
  /** Passe à `true` une fois la vérification automatique terminée (réussie ou non). */
  checked: boolean;
  /** `true` pendant qu'une vérification manuelle est en cours. */
  checking: boolean;
  /** `true` si l'utilisateur a fermé la bannière pour cette session. */
  dismissed: boolean;
  /** Lance la vérification automatique au démarrage, une seule fois par session. */
  checkOnce: () => Promise<void>;
  /** Relance une vérification (déclenchée manuellement). Retourne le résultat. */
  recheck: () => Promise<UpdateInfo | null>;
  /** Masque la bannière jusqu'au prochain démarrage. */
  dismiss: () => void;
}

/** Garde-fou hors store : garantit un seul appel réseau automatique par session. */
let autoCheckStarted = false;

export const useUpdateStore = create<UpdateState>()((set) => ({
  update: null,
  checked: false,
  checking: false,
  dismissed: false,

  checkOnce: async () => {
    if (autoCheckStarted) return;
    autoCheckStarted = true;
    const update = await checkForUpdate();
    set({ update, checked: true });
  },

  recheck: async () => {
    set({ checking: true });
    const update = await checkForUpdate();
    set({ update, checked: true, checking: false, dismissed: false });
    return update;
  },

  dismiss: () => {
    set({ dismissed: true });
  },
}));
