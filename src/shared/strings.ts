/**
 * Toutes les chaînes textuelles affichées dans l'app, en français.
 *
 * L'objet est figé (`as const`) pour avoir des littéraux et de l'autocomplétion.
 * Les clés sont structurées par feature pour limiter la friction quand un lot
 * arrive et apporte ses propres écrans.
 *
 * Quand on aura besoin d'i18n (post-MVP), ce fichier servira de base à
 * l'extraction des clés vers `react-i18next` ou équivalent.
 */
export const strings = {
  common: {
    appName: '', // injecté depuis le branding pour ne pas dupliquer la valeur
    next: 'Suivant',
    back: 'Retour',
    save: 'Enregistrer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    delete: 'Supprimer',
    edit: 'Modifier',
    close: 'Fermer',
    yes: 'Oui',
    no: 'Non',
    loading: 'Chargement…',
    error: 'Une erreur est survenue',
    retry: 'Réessayer',
  },
  placeholder: {
    title: 'Socle prêt',
    subtitle: 'En attente du Lot 1 — onboarding, Séance Zéro et écran de séance.',
    cta: 'Ouvrir les notes de version',
  },
} as const;

export type Strings = typeof strings;
