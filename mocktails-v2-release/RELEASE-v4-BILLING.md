# 365 Mocktails v4 — Google Play Billing

Prepared on 20 August 2026.

## Android bundle

- Package: `eu.mixmaster365.twa`
- Version code: `4`
- Version name: `4`
- Compile SDK: `36`
- Target SDK: `36`
- Start URL: `https://mixmaster365.eu/mocktails/`
- One-time product: `mocktails_premium`
- Android Browser Helper: `2.7.2`
- Android Browser Helper Billing: `1.2.0`
- Google Play Billing Client: `8.3.0`

## Verified

- Clean Gradle release build passes.
- The generated AAB validates with Bundletool 1.18.1.
- The AAB manifest contains `com.android.vending.BILLING`.
- The AAB manifest contains the Android Browser Helper `PaymentActivity`.
- Package, version code, version name and target SDK match this release document.
- The web checkout uses the `mocktails_premium` product ID.
- The displayed price is loaded from Google Play for the user's locale and country.
- Purchases are acknowledged and existing entitlements are restored from Google Play.

## Release notes

English:

`Premium purchase and restore are now available through Google Play. Prices are shown in the user's local currency. Includes Android 16 compatibility and billing reliability improvements.`

Bulgarian:

`Премиум покупката и възстановяването вече са достъпни чрез Google Play. Цените се показват в местната валута на потребителя. Включва съвместимост с Android 16 и подобрения в надеждността на плащанията.`

