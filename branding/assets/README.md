# Assets du branding

Tous les visuels brandés de l'application vivent ici. Pour rebrander l'app,
remplacer ces fichiers en conservant les noms et les dimensions.

## Fichiers et formats requis

| Fichier                       | Usage                                        | Format          | Dimensions recommandées                         |
| ----------------------------- | -------------------------------------------- | --------------- | ----------------------------------------------- |
| `icon.png`                    | Icône iOS et fallback                        | PNG carré       | 1024 × 1024                                     |
| `splash-icon.png`             | Logo affiché sur le splash screen Expo       | PNG transparent | 1024 × 1024 (le splash centre l'image)          |
| `android-icon-foreground.png` | Couche avant de l'icône adaptative Android   | PNG transparent | 1024 × 1024 (zone visible ~432 × 432 au centre) |
| `android-icon-background.png` | Couche arrière de l'icône adaptative Android | PNG opaque      | 1024 × 1024                                     |
| `android-icon-monochrome.png` | Icône monochrome (Material You)              | PNG, 1 canal    | 1024 × 1024                                     |
| `favicon.png`                 | Favicon pour l'export web                    | PNG carré       | 48 × 48 (ou multiple)                           |

## Règles à respecter

- **PNG uniquement** (Expo ne gère ni JPEG ni WebP pour ces emplacements).
- **Fond opaque** pour `icon.png` et `android-icon-background.png`.
- **Fond transparent** pour `splash-icon.png`, `android-icon-foreground.png`, `android-icon-monochrome.png`.
- Conserver les **noms exactes** (sinon il faut aussi modifier `branding/branding.config.ts`).
- Tester sur device après remplacement : un mauvais format peut faire planter le build Android.

## Génération automatique recommandée

Le plus simple est de partir d'un logo unique en SVG (1024 × 1024) et de
générer les variantes avec un outil dédié, par exemple :

- `npx expo-icon-tools` ou `npx @expo/icon-tools`
- [Icon Kitchen](https://icon.kitchen/) pour les variantes Android adaptatives
- [App Icon Generator](https://www.appicon.co/) pour des packs iOS/Android complets

## État actuel

Les assets en place sont les **placeholders du template Expo**. Ils servent
uniquement à valider que le build fonctionne. À remplacer dès qu'une identité
visuelle est arrêtée (voir `docs/BRANDING.md`).
