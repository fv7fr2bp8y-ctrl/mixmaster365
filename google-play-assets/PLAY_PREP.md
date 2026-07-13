# Google Play prep

Дата: 2026-07-14

## Apps

### Brunch 365
- Android package: `eu.brunch365.twa`
- Web start URL: `https://brunch.freefrom365.com/`
- Manifest: `https://brunch.freefrom365.com/manifest.json`
- Privacy policy: `https://brunch.freefrom365.com/privacy.html`
- App icon: `google-play-assets/icons/brunch-icon-512.png`
- Phone screenshots: `google-play-assets/screenshots-play/brunch/`
- Feature graphic: `google-play-assets/feature-graphics/brunch-1024x500.png`
- Splash preview: `google-play-assets/splash-previews/brunch-splash.png`
- Digital Asset Links: `https://brunch.freefrom365.com/.well-known/assetlinks.json`

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
- Brunch has 365 reviewed recipes, 365 unique Drive images, quantities and complete records in Bulgarian, English, Spanish, French, German and Russian.
- The Brunch phone screenshots were regenerated from the current 365-recipe interface on 2026-07-14.

## Before upload

- Publish the latest site files before generating/releasing the Android bundles.
- In Play Console, after App Signing is enabled, confirm the SHA-256 certificate fingerprint and update `.well-known/assetlinks.json` if Google provides a different fingerprint.
- Keep app access marked as not requiring login.
- Data safety: no account, no ads, no payment, no camera, no location, no third-party analytics in the current web apps.
- Content rating: recipe/food app, no user-generated content, no medical claims.
- Category: Food & Drink.
- Ads: No.
- App access: All functionality is available without login.
- Target audience: General adult audience; the app is not designed for children.
- Release model for the first production build: free app with no in-app purchases. Any later digital subscription must use Google Play Billing.
