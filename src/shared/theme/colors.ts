import { branding } from '@branding/branding.config';

/**
 * Couleurs runtime exposées au reste de l'app. Source : `branding.config.json`.
 * Pour modifier la palette, éditer le JSON, pas ce fichier.
 */
export const colors = branding.colors;

export type Colors = typeof colors;
export type ColorToken = keyof Colors;
