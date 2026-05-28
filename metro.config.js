// Configuration Metro étendant la config par défaut d'Expo.
// Ne rien ajouter ici tant qu'on n'a pas un besoin concret (assets custom,
// resolver custom, transformer custom). La présence du fichier suffit à
// rassurer expo-doctor et à servir de point d'extension futur.
//
// Voir https://docs.expo.dev/guides/customizing-metro/.

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
