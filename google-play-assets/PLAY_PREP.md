# Google Play prep

Дата: 2026-07-06

## Apps

### Brunch 365
- Android package: `eu.brunch365.twa`
- Web start URL: `https://brunch.freefrom365.com/`
- Manifest: `/breakfast/manifest.json`
- Privacy policy: `https://brunch.freefrom365.com/privacy.html`
- App icon: `google-play-assets/icons/brunch-icon-512.png`
- Phone screenshots: `google-play-assets/screenshots-play/brunch/`
- Splash preview: `google-play-assets/splash-previews/brunch-splash.png`

### Healthy Gut 365
- Android package: `eu.healthygut365.twa`
- Web start URL: `https://mixmaster365.eu/free-from/`
- Manifest: `/free-from/manifest.json`
- Privacy policy: `https://mixmaster365.eu/privacy.html`
- App icon: `google-play-assets/icons/healthy-gut-icon-512.png`
- Phone screenshots: `google-play-assets/screenshots-play/healthy-gut/`
- Splash preview: `google-play-assets/splash-previews/healthy-gut-splash.png`

## Ready files

- Final icons are copied in `google-play-assets/icons/`.
- Play-ready screenshots are PNG, 1080 x 1920, in `google-play-assets/screenshots-play/`.
- Splash previews are PNG in `google-play-assets/splash-previews/`.
- Contact sheet preview: `google-play-assets/screenshots-play/contact-sheet.png`
- Brunch currently has 236 published recipes and 12 image-ready recipes awaiting language review.
- The release target remains 365 fully reviewed recipes with unique images.

## Before upload

- Publish the latest site files before generating/releasing the Android bundles.
- In Play Console, after App Signing is enabled, confirm the SHA-256 certificate fingerprint and update `.well-known/assetlinks.json` if Google provides a different fingerprint.
- Keep app access marked as not requiring login.
- Data safety: no account, no ads, no payment, no camera, no location, no third-party analytics in the current web apps.
- Content rating: recipe/food app, no user-generated content, no medical claims.
