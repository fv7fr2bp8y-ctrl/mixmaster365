# Brunch 365 - Play Console release sheet

Проверено: 14 юли 2026 г.

## Неизменяеми идентификатори

- App name: `Brunch 365`
- Default language: Bulgarian (`bg-BG`)
- Package name: `eu.brunch365.twa`
- Version code: `1`
- Version name: `1`
- Category: Food & Drink
- Contact email: `support@freefrom365.com`
- Website: https://brunch.freefrom365.com/
- Privacy policy: https://brunch.freefrom365.com/privacy.html
- Target API: 35
- Minimum API: 21

Package name не може да се сменя след първото качване в Play Console.

## Първи release

- Цена: Free
- Ads: No
- In-app purchases: No
- Subscription: No
- Login/account: No
- Restricted content: No
- User-generated content: No
- Location, camera, microphone and contacts: Not used
- Target audience: general adult audience; not designed for children

Платено съдържание не се добавя в този build. Ако по-късно има freemium или абонамент, Android версията трябва да използва Google Play Billing и server-side entitlement.

## App access

Избери `All functionality is available without special access`. Няма акаунт или заключен екран. За review:

```text
Open the app and browse recipes immediately. Search, filters, language selection,
favorites and recipe sharing do not require an account.
```

## Data safety worksheet

Текущият build няма analytics SDK, ads SDK, account system или payment SDK. Изборът на език, мерни единици и любими се пази само локално на устройството.

Преди подаване на формуляра провери отново production сайта и всички външни доставчици. Текущото съдържание се доставя през Vercel, Google Drive, Google Fonts и Unsplash; privacy policy описва стандартната техническа обработка от доставчиците.

Работен отговор за първия release:

- Does your app collect or share required user data? `No`, ако няма добавени analytics/logging услуги извън стандартната временна доставка на съдържание.
- Is all user data encrypted in transit? `Yes` - всички production URLs са HTTPS.
- Account deletion URL: `Not applicable` - приложението няма акаунти.

Окончателната декларация трябва да съвпада с реалния production build в деня на подаване.

## Content rating

- App type: Utility / recipe catalogue
- Violence: None
- Sexual content: None
- Language: None
- Controlled substances: None
- Gambling: None
- User interaction: None
- Location sharing: None
- Digital purchases: None in version 1

## Store assets

- App icon: `google-play-assets/icons/brunch-icon-512.png`
- Feature graphic: `google-play-assets/feature-graphics/brunch-1024x500.png`
- Four phone screenshots (1080 x 1920): `google-play-assets/screenshots-play/brunch/`
- Localized listings: `google-play-assets/store-listings/brunch/`

## Signing and Digital Asset Links

1. Създай и архивирай отделен Brunch upload key.
2. Подпиши `.aab` и го качи в Internal testing.
3. Активирай Play App Signing.
4. Копирай SHA-256 fingerprint на **App signing key certificate**, не само upload certificate.
5. Добави fingerprint към `/.well-known/assetlinks.json` за package `eu.brunch365.twa`.
6. Deploy-ни сайта и провери Digital Asset Links преди теста на устройство.

## Release order

1. Publish сайта със support адреса.
2. Run Brunch audit и PWA validation.
3. Build и подпиши Android App Bundle.
4. Create app в Play Console с package `eu.brunch365.twa`.
5. Upload в Internal testing.
6. Complete Store listing, App content, Data safety и Content rating.
7. Update production Digital Asset Links с Play fingerprint.
8. Install от Internal testing и провери splash, full-screen TWA, back, share и recipe links.
9. Promote към Closed testing или Production според изискванията на developer account-а.
