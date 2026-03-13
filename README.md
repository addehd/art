# Maria

## Publishing

### iOS (App Store / TestFlight)

1. **Build** for production:

```sh
eas build --platform ios --profile production
```

2. **Submit** to App Store Connect:

```sh
eas submit --platform ios --profile production
```

Once submitted, the build appears in [App Store Connect](https://appstoreconnect.apple.com). From there you can:

- **TestFlight**: Go to the TestFlight tab → add testers → distribute the build for testing.
- **App Store**: Go to the App Store tab → select the build → submit for review.

> `eas build` alone does **not** publish to TestFlight. You need `eas submit` to upload, then enable TestFlight distribution in App Store Connect.

### Build + Submit in one step

Next time you can skip the extra step by using `--auto-submit` on the build command — it'll submit automatically when the build completes.

```sh
eas build --platform ios --profile production --auto-submit
```
