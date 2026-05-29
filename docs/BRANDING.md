# Branding — changer nom, logo, couleurs

Tout ce qui identifie visuellement l'app est centralisé. Pour rebrander, **un
seul fichier** + **les assets dans un dossier** suffit. Aucun autre fichier
du code applicatif ne devrait avoir besoin d'être modifié.

## Source de vérité

```
branding/
├── branding.config.json    ← LE fichier à éditer
├── branding.config.ts      ← wrapper TypeScript (ne pas modifier, juste lu)
└── assets/                 ← icônes, splash, favicon (à remplacer)
```

## Procédure complète

### 1. Choisir l'identité

Avant de toucher le code, arrêter :

- **Nom** (ce qui s'affiche sous l'icône).
- **Slug** (kebab-case, sans accents — sert d'identifiant projet EAS).
- **Bundle identifier** (reverse-DNS, ex. `com.acme.fitapp`). Cohérent iOS / Android.
- **Tagline** (une phrase, affichée à plusieurs endroits — onboarding, splash).
- **Palette principale** : un fond sombre, une couleur d'accent, un succès,
  un warning, un error. Voir le fichier JSON pour la liste exhaustive.

### 2. Mettre à jour `branding.config.json`

Ouvrir `branding/branding.config.json` et modifier les champs concernés :

- Section `app` → identité textuelle **et paramètres de distribution** :
  - `name`, `slug`, `scheme`, `bundleIdentifier`, `version`, `tagline` — identité.
  - `androidVersionCode` (entier), `iosBuildNumber` (chaîne) — numéros de build
    (Lot 8), à incrémenter à chaque release. Voir [`DISTRIBUTION.md`](DISTRIBUTION.md).
  - `repository` (`"owner/repo"`) — dépôt GitHub interrogé pour la vérification de
    mise à jour au démarrage.
  - `testflightUrl` — lien d'invitation TestFlight (laisser vide tant qu'iOS n'est
    pas distribué ; la bannière iOS retombe alors sur la page de release).
- Section `colors` → palette runtime (consommée par le thème).
- Section `ranks` → couleurs et titres des rangs de gamification (Lot 6).
  Le titre est en français — le traduire si l'app sort en multi-langue.
- Section `fonts` → noms de familles. Pour le MVP : police système. Pour une
  police custom, l'enregistrer via `expo-font` au démarrage et utiliser son
  nom ici.

Garder les **noms de clés** intacts : les renommer casserait les imports
côté TypeScript.

### 3. Remplacer les assets

Les fichiers de `branding/assets/` ont des **noms et dimensions imposés**.
Voir [`branding/assets/README.md`](../branding/assets/README.md) pour la
liste complète et les outils de génération recommandés.

Au minimum :

- `icon.png` (1024 × 1024, PNG opaque).
- `splash-icon.png` (1024 × 1024, PNG transparent).
- Les trois variantes Android (`android-icon-foreground.png`,
  `android-icon-background.png`, `android-icon-monochrome.png`).

### 4. (Optionnel) Renommer le projet npm

Le nom dans `package.json` n'est pas exposé à l'utilisateur final, mais il
peut être cohérent. Pour le changer :

```bash
npm pkg set name=mon-app-fitness
```

### 5. Vérifier le résultat

```bash
npm start
```

Recharger l'app sur Expo Go. Le nouvel écran placeholder doit afficher le
nouveau nom et la nouvelle palette. Si quelque chose semble inchangé :

- Vider le cache Metro : `npm start -- --clear`.
- Pour les changements d'icônes/splash, sortir d'Expo Go et rouvrir.

### 6. Vérifier la config Expo

```bash
npx expo config --type public
```

Cette commande affiche la configuration appliquée. Confirmer que `name`,
`slug`, `ios.bundleIdentifier`, `android.package` ont les nouvelles valeurs
et que les chemins d'assets pointent bien vers `branding/assets/`.

## Pourquoi cette dualité JSON + TypeScript ?

Le `.json` est **lu par Expo au build** (via `app.config.ts`) et par le
runtime de l'app (via le wrapper `.ts`). On garde le JSON pour deux raisons :

1. Expo exécute `app.config.ts` dans un contexte Node qui ne sait pas résoudre
   les imports TypeScript transitifs. Un fichier JSON, lui, est trivialement
   importable depuis JS comme depuis TS.
2. Le JSON peut être lu / écrit par d'autres outils sans transpilation
   (scripts de migration de palette, générateurs d'assets, etc.).

Le wrapper TypeScript (`branding.config.ts`) apporte simplement les **types**
pour l'autocomplétion à l'usage côté app (`branding.colors.primary` est typé,
les rangs sont énumérés, etc.).

## Et plus tard ?

- **Police custom** : enregistrer via `expo-font` au démarrage (par exemple
  dans un nouveau `FontProvider`), puis remplacer les valeurs `fonts.base` /
  `fonts.heading` dans le JSON par les noms de familles chargées.
- **Thème clair** : non prévu au MVP. Quand ce sera le cas, dupliquer la
  section `colors` du JSON en deux palettes (dark / light) et passer le
  thème runtime via un Context. Pas besoin de toucher aux composants —
  ils lisent déjà via `theme.colors.*`.
- **A/B test de palette** : on peut créer plusieurs fichiers de branding et
  pointer `app.config.ts` vers un autre via une variable d'environnement.
