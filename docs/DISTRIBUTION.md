# Distribution et mise à jour

Procédure de build, de signature, de publication et de vérification de mise à
jour (cahier section 9.9, Lot 8). Ce document part du principe qu'**aucun
compte ni clé n'existe encore** : il couvre donc leur création.

> **Modèle de distribution du MVP**
>
> - **Android** : APK signé, hors store, publié sur les **GitHub Releases** du
>   dépôt. Les testeurs téléchargent l'APK et l'installent (sources inconnues).
> - **iOS** : distribution bêta via **TestFlight** (compte Apple Developer requis).
> - **Mise à jour** : au démarrage, l'app interroge l'API GitHub, compare la
>   version installée à la dernière release, et affiche une bannière non
>   intrusive. **Jamais bloquant** : hors-ligne → démarrage normal.

---

## 1. Ce qui est déjà dans le dépôt

| Élément                              | Fichier                                         |
| ------------------------------------ | ----------------------------------------------- |
| Profils de build EAS                 | [`eas.json`](../eas.json)                       |
| Vérification de MAJ (domaine pur)    | `src/domain/updates/`                           |
| Service réseau (API GitHub)          | `src/shared/updateService.ts`                   |
| État de session (bannière, dismiss)  | `src/state/updateStore.ts`                      |
| Bannière + écran de notes de version | `src/features/updates/`                         |
| Config dépôt / TestFlight / versions | `branding/branding.config.json` (section `app`) |
| CI qualité + release sur tag         | `.github/workflows/ci.yml` · `release.yml`      |

Il **ne reste qu'à créer les comptes**, lancer les builds et publier.

---

## 2. Versionnage

La **source de vérité** est `branding/branding.config.json`, section `app` :

| Champ                | Rôle                                                       |
| -------------------- | ---------------------------------------------------------- |
| `version`            | version affichée et **comparée** aux releases (SemVer)     |
| `androidVersionCode` | entier monotone Android (incrémenté à chaque build publié) |
| `iosBuildNumber`     | numéro de build iOS (chaîne)                               |

`eas.json` utilise `appVersionSource: "local"` : ces valeurs sont lues
directement depuis le branding (via `app.config.ts`). **Avant chaque release** :

1. Bumper `version` (ex. `0.1.0` → `0.1.1`).
2. Incrémenter `androidVersionCode` (ex. `1` → `2`) — obligatoire pour
   qu'Android accepte l'installation par-dessus la précédente.
3. Incrémenter `iosBuildNumber` si build iOS.
4. Commiter, puis taguer : `git tag v0.1.1 && git push --tags`.

> Le **tag** (`v0.1.1`) doit correspondre à `version`. C'est lui que l'API
> GitHub renvoie et que l'app compare. Le préfixe `v` est toléré.

---

## 3. Comptes et outils à créer

### 3.1 Compte Expo + EAS CLI (gratuit, requis Android & iOS)

1. Créer un compte sur [expo.dev](https://expo.dev/signup).
2. Installer le CLI : `npm install -g eas-cli`.
3. Se connecter : `eas login`.
4. Lier le projet : `eas init`. La commande affiche un **projectId**. Comme la
   config est dynamique (`app.config.ts`), elle ne peut pas l'écrire seule :
   ajouter manuellement à `app.config.ts`

   ```ts
   const config: ExpoConfig = {
     // …
     owner: 'TON_USERNAME_EXPO',
     extra: {
       eas: { projectId: 'LE-PROJECT-ID-AFFICHÉ' },
     },
   };
   ```

### 3.2 Compte Apple Developer (payant, requis iOS uniquement)

- S'inscrire au [Apple Developer Program](https://developer.apple.com/programs/)
  (99 $/an). Nécessaire pour TestFlight.
- Aucune action immédiate côté Google : le MVP Android ne passe **pas** par le
  Play Store.

---

## 4. Clé de signature Android — à sauvegarder absolument

Au **premier** `eas build` Android, EAS propose de **générer le keystore** et le
conserve sur ses serveurs. Cette clé signe tous les builds : **tous les APK
doivent être signés avec la même clé**, sinon la mise à jour ne s'installe pas
par-dessus la précédente (les données locales seraient perdues).

**Dès le premier build**, exporter et sauvegarder le keystore hors dépôt :

```bash
eas credentials            # Android → Keystore → Download
```

Ranger le `.jks` + les mots de passe dans un **gestionnaire de mots de passe**
ou un stockage chiffré. Le `.gitignore` exclut déjà `*.jks`, `*.p12`, `*.key` :
**ne jamais committer la clé**. Sa perte rendrait toute mise à jour impossible
sans réinstallation complète chez tous les testeurs.

---

## 5. Build Android (APK) et publication

### 5.1 Manuel

```bash
eas build --platform android --profile preview
```

Le profil `preview` produit un **APK** (`buildType: apk`, distribution
`internal`). À la fin, EAS fournit une URL ; télécharger l'APK puis :

```bash
gh release create v0.1.1 ./appsport-v0.1.1.apk --title "AppSport v0.1.1" --generate-notes
```

(ou créer la release via l'interface GitHub et y joindre l'APK).

### 5.2 Automatique (recommandé) — workflow sur tag

Le workflow [`.github/workflows/release.yml`](../.github/workflows/release.yml)
fait tout sur un tag `v*` : build EAS → téléchargement de l'APK → création de la
release avec notes générées.

Prérequis unique : ajouter le secret **`EXPO_TOKEN`** au dépôt
(Settings → Secrets and variables → Actions → New secret). Le jeton se crée sur
[expo.dev → Account settings → Access tokens](https://expo.dev/accounts/[account]/settings/access-tokens).

Ensuite, publier une version revient à :

```bash
git tag v0.1.1 && git push origin v0.1.1
```

---

## 6. Build et distribution iOS (TestFlight)

Après inscription au programme Apple Developer :

```bash
eas build --platform ios --profile production     # build store-ready
eas submit --platform ios --profile production    # envoi à App Store Connect
```

`eas submit` demande une **clé API App Store Connect** (App Store Connect →
Users and Access → Integrations). Une fois le build traité par Apple, l'inviter
les testeurs depuis **App Store Connect → TestFlight** (par Apple ID). TestFlight
notifie automatiquement les testeurs des nouvelles versions.

Renseigner ensuite le **lien d'invitation TestFlight public** dans le branding
pour que la bannière iOS y renvoie :

```json
"app": { "testflightUrl": "https://testflight.apple.com/join/XXXXXXXX" }
```

---

## 7. Vérification de mise à jour in-app

### Fonctionnement

1. Au premier affichage du dashboard, `updateStore.checkOnce()` appelle
   `checkForUpdate()` (une seule fois par session).
2. `checkForUpdate()` interroge
   `https://api.github.com/repos/<repository>/releases/latest`, avec un timeout
   de 6 s et un `try/catch` global : **tout échec renvoie `null`** (hors-ligne,
   timeout, JSON inattendu, pas de release) — l'app démarre normalement.
3. Si le tag de la release est strictement plus récent que `branding.app.version`
   (`src/domain/updates`), une **bannière non intrusive** s'affiche en tête du
   dashboard, ouvrant l'écran de **notes de version** (corps Markdown de la
   release). Le bouton « Mettre à jour » ouvre l'APK (Android) ou TestFlight /
   la page de release (iOS).
4. Fermer la bannière la masque **pour la session** ; elle réapparaît au
   prochain lancement tant que la mise à jour n'est pas installée.

Un bouton **« Vérifier »** dans Réglages → À propos permet une vérification
manuelle à tout moment.

### Configuration requise

- `branding.app.repository` (`"FabLrc/AppSport"`) : le dépôt interrogé. Il doit
  être **public** — l'API `releases/latest` et le téléchargement de l'APK sans
  jeton n'existent que pour les dépôts publics (on n'embarque jamais de token
  GitHub dans une app cliente distribuée).
- `branding.app.testflightUrl` : lien TestFlight (vide tant qu'iOS n'est pas en
  place ; la bannière iOS retombe alors sur la page de release).

---

## 8. Checklist de release

- [ ] `npm run check` au vert.
- [ ] `version` + `androidVersionCode` (+ `iosBuildNumber` si iOS) bumpés dans
      `branding/branding.config.json`.
- [ ] Commit + tag `vX.Y.Z` poussé.
- [ ] (Auto) workflow `release.yml` vert → release GitHub avec APK.
      (Manuel) APK joint à la release et notes rédigées.
- [ ] Dépôt public, APK téléchargeable sans authentification.
- [ ] (iOS) build soumis à TestFlight, testeurs invités, `testflightUrl` à jour.
- [ ] Installer l'APK par-dessus une version antérieure : les données sont
      conservées (migrations + même clé de signature).
