# Maria

## Local testing (iPhone + Viro)

Expo Go only ships a fixed set of native modules. Viro needs extra iOS code (ARKit, etc.) that isn’t in that bundle, so it won’t run in Expo Go. Use a **dev build**—your own app binary with Viro linked in. It still connects to Metro; you install and open that app instead of Expo Go.

### 1. Build dev client (only needed once, or after native changes)

Builds in the cloud with Expo. No Xcode needed. Your iPhone's UDID must be registered in your Apple Developer account.

```sh
eas build --profile development --platform ios
```

### 2. Check existing builds

Before rebuilding, check if a recent dev build already exists:

```sh
eas build:list --platform ios --limit 5
```

To get install details for a specific build:

```sh
eas build:view <BUILD_ID>
```

Open the EAS build page on your iPhone (Safari) and tap **Install**.

> Rebuilding is only needed if you've changed native code (e.g. `app.json` plugins, `ios/` folder, or native deps). JS-only changes work with the existing build.

### 3. Start Metro

Requires Node 22:

```sh
nvm use 22
yarn start
```

Open the dev client app on your iPhone → connect to Metro (Mac and iPhone must be on the same network) → app loads.


---

## Publishing

### One command (bump, build, submit)

`package.json` defines **`yarn deploy`** / **`npm run deploy`**, which runs `scripts/deploy.mjs`. It:

1. **Bumps the patch** in `app.json` → `expo.version` (e.g. `1.2.3` → `1.2.4`) and writes the file.
2. **`eas build --platform ios --profile production`**
3. **`eas submit --platform ios --latest --profile production`** (uploads the build you just made)

So each deploy is a new patch number, then an iOS production build, then App Store Connect submission. To change **major** or **minor** versions, edit `expo.version` in `app.json` before running, or adjust the script.

### GitHub Actions

**Actions → iOS Deploy → Run workflow**. Profile `production` (optional TestFlight submit) or `development`. Needs repo secret `EXPO_TOKEN`. Build numbers come from EAS (`autoIncrement` + remote `appVersionSource`); this does not bump `expo.version` in `app.json`.