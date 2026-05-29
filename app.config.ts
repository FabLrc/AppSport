/**
 * Configuration Expo dynamique. Tout ce qui est brandé est délégué à
 * `branding/branding.config.json`. Les autres réglages techniques (plateformes,
 * orientation, plugins) vivent ici.
 *
 * On importe le JSON directement (et pas le wrapper TS) car au build Expo
 * exécute ce fichier dans un contexte Node qui ne sait pas résoudre les
 * imports `.ts` transitifs.
 *
 * Voir https://docs.expo.dev/workflow/configuration/#dynamic-configuration.
 */

import type { ExpoConfig } from 'expo/config';

import branding from './branding/branding.config.json';

const config: ExpoConfig = {
  owner: 'fablrc',
  extra: {
    eas: { projectId: 'afb0ef7a-c57c-4d55-8714-8083ca6dd705' },
  },
  name: branding.app.name,
  slug: branding.app.slug,
  scheme: branding.app.scheme,
  version: branding.app.version,
  orientation: 'portrait',
  icon: branding.assets.icon,
  userInterfaceStyle: 'dark',
  ios: {
    supportsTablet: true,
    bundleIdentifier: branding.app.bundleIdentifier,
    buildNumber: branding.app.iosBuildNumber,
  },
  android: {
    package: branding.app.bundleIdentifier,
    versionCode: branding.app.androidVersionCode,
    adaptiveIcon: {
      foregroundImage: branding.assets.adaptiveIconForeground,
      backgroundImage: branding.assets.adaptiveIconBackground,
      monochromeImage: branding.assets.adaptiveIconMonochrome,
      backgroundColor: branding.colors.background,
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: branding.assets.favicon,
  },
  plugins: [
    'expo-sqlite',
    [
      'expo-splash-screen',
      {
        image: branding.assets.splashIcon,
        backgroundColor: branding.colors.splashBackground,
        resizeMode: 'contain',
        imageWidth: 200,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Cette app accède à ta galerie pour enregistrer tes photos de progression.',
        cameraPermission: 'Cette app accède à ta caméra pour prendre des photos de progression.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: branding.assets.adaptiveIconForeground,
        color: branding.colors.primary,
        defaultChannel: 'default',
        sounds: [],
      },
    ],
  ],
};

export default config;
