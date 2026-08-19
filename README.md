# Maria

## Local testing (iPhone + Viro)

Expo Go doesn't support Viro (ARKit)—use a dev build.

### 1. Build dev client (only needed once, or after native changes)

Builds in the cloud—no Xcode needed. Your iPhone's UDID must be registered in your Apple Developer account.

```sh
eas build --profile development --platform ios
```

`--profile development` = dev client that connects to Metro. `--platform ios` = iOS only.

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

Local:

```sh
eas build --platform ios --profile production
```

Submit via [App Store Connect](https://appstoreconnect.apple.com), or `--auto-submit` to upload to TestFlight.

GitHub Actions: **Actions → iOS Deploy → Run workflow**. Uses EAS (`eas.json` production submit). Add repo secret `EXPO_TOKEN` from [Expo access tokens](https://expo.dev/accounts/addehd11/settings/access-tokens).
