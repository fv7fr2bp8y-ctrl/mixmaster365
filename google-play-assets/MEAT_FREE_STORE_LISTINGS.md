# Meat Free 365 - Google Play listing

Този файл съдържа целия ред за създаване и публикуване на приложението, готовите отговори за декларациите и текстовете за шестте езика.

## 1. Create app

От Google Play Console избери **All apps -> Create app** и въведи:

- App name: `Meat Free 365`
- Default language: `English (United States) - en-US`
- App or game: `App`
- Free or paid: `Free`
- Developer Program Policies: потвърди
- US export laws: потвърди

Package name след качването на bundle трябва да бъде точно:

`eu.meatfree365.twa`

Името на пакета не може да се сменя след създаването на приложението.

## 2. Store settings

Отвори **Grow users -> Store presence -> Store settings**:

- App or game: `App`
- Category: `Food & Drink`
- Tags: `Recipes`, `Cooking`, `Vegetarian` (ако са налични)
- Email: `support@tastemaster.eu`
- Website: `https://meat-free.freefrom365.com/`
- Phone: остави празно
- External marketing: може да остане включено

## 3. App content declarations

### Privacy policy

`https://meat-free.freefrom365.com/privacy.html`

### Ads

На въпроса дали приложението съдържа реклами избери **No**.

### Sign in details / App access

На въпроса дали част от приложението е ограничена избери **No**.

Текст при поискване на пояснение:

`All functionality is available without sign-in, payment, membership or special access.`

### Content rating

- Category: `All Other App Types`
- Downloaded app ratings-relevant content: `No`
- User content sharing: `No`
- Promotion or sale of age-restricted products or activities: `No`
- Violence, sexual content, offensive language, gambling or controlled substances: `No`
- Приложението зарежда онлайн рецепти и снимки, но няма потребителско съдържание или комуникация между потребители.

### Target audience and content

- Target age groups: `13-15`, `16-17`, `18 and over`
- App designed primarily for children: `No`
- Appeal to children: `No`
- Ads: `No`

### Data safety

За текущата версия на приложението:

- Does your app collect or share any of the required user data types? `No`
- Is all user data encrypted in transit? `Yes`
- Account creation: `No account creation`
- Data deletion request: не се изисква, защото няма профил или сървърно съхранявани лични данни

Тези отговори са валидни, докато няма включени Vercel Web Analytics, Speed Insights, реклами, профили или друг SDK за проследяване. Езикът, мерните единици и любимите рецепти се пазят само локално на устройството.

### Health apps

- Is this a health app? `No`
- Приложението е каталог с рецепти и не предоставя медицински съвети, диагноза или здравно наблюдение.

### Other declarations

- Government app: `No`
- Financial features: `No`
- News app: `No`
- Advertising ID: `No`

## 4. Main store listing

Първо попълни английската локализация от секцията **English (United States) - en-US** по-долу. След това избери **Manage translations -> Add your own translation** и добави:

1. Spanish (Spain) - `es-ES`
2. French (France) - `fr-FR`
3. German - `de-DE`
4. Russian - `ru-RU`
5. Bulgarian - `bg`

За всяка локализация постави съответните App name, Short description и Full description от този файл.

### Graphics

- App icon: `google-play-assets/icons/meat-free-icon-512.png`
- Feature graphic: `google-play-assets/feature-graphics/meat-free-1024x500.png`
- Phone screenshots, в този ред:
  1. `google-play-assets/screenshots-play/meat-free/01-home.png`
  2. `google-play-assets/screenshots-play/meat-free/02-catalog.png`
  3. `google-play-assets/screenshots-play/meat-free/03-recipe.png`
  4. `google-play-assets/screenshots-play/meat-free/04-languages.png`
- Video: остави празно
- Tablet, Chromebook и XR изображения: засега остави празни

## 5. Countries and pricing

От **Reach and devices -> Countries / regions** избери всички желани държави. За глобално издание може да избереш **Add countries / regions -> Select all available countries / regions**.

Приложението остава **Free**. По-късно могат да се добавят покупки или абонамент, но Data safety, App access и Play Billing декларациите трябва да се обновят.

## 6. Production release

Отвори **Test and release -> Production -> Create new release**.

Качи:

`android/meat-free-twa/app-release-bundle.aab`

Въведи:

- Release name: `Meat Free 365 v1.0`
- Release notes: постави целия блок от секцията **Release notes - paste as one block** по-долу

След качването отвори **Protected with Play -> Play app signing** и копирай **SHA-256 certificate fingerprint** от секцията **App signing key certificate**. Това не е Upload key certificate. Новият fingerprint трябва да се добави към `.well-known/assetlinks.json`, преди да започне пълното разпространение.

## 7. Final review

Преди **Start rollout to Production** провери:

- Package: `eu.meatfree365.twa`
- Privacy URL се отваря публично
- Има икона, feature graphic и поне 4 телефонни скрийншота
- Шестте store listing локализации са записани
- Content rating е издаден
- Data safety е завършен
- Ads е `No`
- App access е `No restrictions`
- Category е `Food & Drink`
- Държавите са избрани
- Google Play app-signing SHA-256 е добавен и публикуван в Digital Asset Links
- Няма нерешени грешки в Publishing overview

Когато всички проверки са зелени, избери **Send changes for review** или **Start rollout to Production**, според показвания бутон.

## App setup

- App name: `Meat Free 365`
- Package name: `eu.meatfree365.twa`
- App type: App
- Pricing: Free
- Category: Food & Drink
- Website: `https://meat-free.freefrom365.com/`
- Privacy policy: `https://meat-free.freefrom365.com/privacy.html`
- Support email: `support@tastemaster.eu`
- Ads: No
- Restricted access: No
- Target audience: 13 and over

## English (United States) - en-US

**App name**

Meat Free 365

**Short description**

Inspiring meat-free recipes with photos, exact quantities and smart filters.

**Full description**

Discover colourful meat-free cooking from around the world with Meat Free 365.

Browse more than 240 carefully selected vegetarian recipes for breakfast, lunch, dinner, snacks and special occasions. Every available recipe includes a food photo, clear ingredient quantities and practical step-by-step instructions.

Find the right dish quickly with search and useful filters. Save favourites, share recipes with friends and explore a different featured recipe every day.

Meat Free 365 supports English, Spanish, French, German, Russian and Bulgarian. Recipes are shown in each language only when their translation is ready.

No account is required. The app contains no advertising.

## Spanish (Spain) - es-ES

**Nombre de la aplicación**

Meat Free 365

**Descripción breve**

Recetas sin carne con fotos, cantidades exactas y filtros prácticos.

**Descripción completa**

Descubre una cocina sin carne, colorida y variada, con Meat Free 365.

Explora más de 240 recetas vegetarianas cuidadosamente seleccionadas para desayunos, comidas, cenas, tentempiés y ocasiones especiales. Cada receta disponible incluye una foto, cantidades claras e instrucciones prácticas paso a paso.

Encuentra el plato adecuado con la búsqueda y los filtros. Guarda tus favoritas, comparte recetas y descubre una propuesta diferente cada día.

Meat Free 365 está disponible en inglés, español, francés, alemán, ruso y búlgaro. En cada idioma solo se muestran las recetas cuya traducción está terminada.

No se necesita una cuenta. La aplicación no contiene publicidad.

## French (France) - fr-FR

**Nom de l'application**

Meat Free 365

**Description courte**

Recettes sans viande avec photos, quantités précises et filtres pratiques.

**Description complète**

Découvrez une cuisine sans viande colorée et variée avec Meat Free 365.

Parcourez plus de 240 recettes végétariennes soigneusement sélectionnées pour le petit-déjeuner, le déjeuner, le dîner, les en-cas et les occasions spéciales. Chaque recette disponible comprend une photo, des quantités claires et des instructions pratiques étape par étape.

Trouvez rapidement le bon plat grâce à la recherche et aux filtres. Enregistrez vos favoris, partagez des recettes et découvrez chaque jour une nouvelle suggestion.

Meat Free 365 est disponible en anglais, espagnol, français, allemand, russe et bulgare. Seules les recettes dont la traduction est terminée apparaissent dans la langue choisie.

Aucun compte n'est nécessaire. L'application ne contient aucune publicité.

## German - de-DE

**App-Name**

Meat Free 365

**Kurzbeschreibung**

Fleischfreie Rezepte mit Fotos, genauen Mengen und praktischen Filtern.

**Vollständige Beschreibung**

Entdecke mit Meat Free 365 eine farbenfrohe und abwechslungsreiche fleischfreie Küche.

Stöbere in mehr als 240 sorgfältig ausgewählten vegetarischen Rezepten für Frühstück, Mittagessen, Abendessen, Snacks und besondere Anlässe. Jedes verfügbare Rezept enthält ein Foto, klare Mengenangaben und praktische Schritt-für-Schritt-Anleitungen.

Mit Suche und Filtern findest du schnell das passende Gericht. Speichere Favoriten, teile Rezepte und entdecke jeden Tag einen neuen Vorschlag.

Meat Free 365 unterstützt Englisch, Spanisch, Französisch, Deutsch, Russisch und Bulgarisch. In jeder Sprache werden nur vollständig übersetzte Rezepte angezeigt.

Es ist kein Konto erforderlich. Die App enthält keine Werbung.

## Russian - ru-RU

**Название приложения**

Meat Free 365

**Краткое описание**

Рецепты без мяса с фото, точными количествами и удобными фильтрами.

**Полное описание**

Откройте для себя яркую и разнообразную кухню без мяса вместе с Meat Free 365.

В приложении собрано более 240 тщательно отобранных вегетарианских рецептов для завтрака, обеда, ужина, перекуса и особых случаев. Каждый доступный рецепт содержит фотографию, понятные количества ингредиентов и практичные пошаговые инструкции.

Используйте поиск и фильтры, сохраняйте избранное, делитесь рецептами и каждый день открывайте новое блюдо дня.

Meat Free 365 поддерживает английский, испанский, французский, немецкий, русский и болгарский языки. На выбранном языке отображаются только полностью переведённые рецепты.

Регистрация не требуется. В приложении нет рекламы.

## Bulgarian - bg

**Име на приложението**

Meat Free 365

**Кратко описание**

Рецепти без месо със снимки, точни количества и удобни филтри.

**Пълно описание**

Открий цветна и разнообразна кухня без месо с Meat Free 365.

Разгледай над 240 внимателно подбрани вегетариански рецепти за закуска, обяд, вечеря, междинни хапвания и специални поводи. Всяка достъпна рецепта има снимка, ясни количества на съставките и практични инструкции стъпка по стъпка.

Намери подходящото ястие бързо с търсене и полезни филтри. Запазвай любими, споделяй рецепти и откривай различно предложение всеки ден.

Meat Free 365 поддържа английски, испански, френски, немски, руски и български. На избрания език се показват само рецептите с готов превод.

Не е необходим профил. Приложението няма реклами.

## Release

**Release name**

Meat Free 365 v1.0

**Release notes - paste as one block**

```text
<en-US>
First release of Meat Free 365 with more than 240 recipes, photos, precise quantities, search, filters, favourites and six languages.
</en-US>
<es-ES>
Primera versión de Meat Free 365 con más de 240 recetas, fotos, cantidades precisas, búsqueda, filtros, favoritos y seis idiomas.
</es-ES>
<fr-FR>
Première version de Meat Free 365 avec plus de 240 recettes, photos, quantités précises, recherche, filtres, favoris et six langues.
</fr-FR>
<de-DE>
Erste Version von Meat Free 365 mit mehr als 240 Rezepten, Bildern, genauen Mengenangaben, Suche, Filtern, Favoriten und sechs Sprachen.
</de-DE>
<ru-RU>
Первый выпуск Meat Free 365: более 240 рецептов с фотографиями, точными количествами, поиском, фильтрами, избранным и шестью языками.
</ru-RU>
<bg>
Първо издание на Meat Free 365 с над 240 рецепти, снимки, точни количества, търсене, филтри, любими и шест езика.
</bg>
```

## Upload files

- App bundle: `android/meat-free-twa/app-release-bundle.aab`
- App icon: `google-play-assets/icons/meat-free-icon-512.png`
- Feature graphic: `google-play-assets/feature-graphics/meat-free-1024x500.png`
- Phone screenshots: `google-play-assets/screenshots-play/meat-free/01-home.png` through `04-languages.png`

## Signing

- Upload certificate SHA-256: `9E:8A:25:59:60:43:F0:5E:BB:AD:EE:F5:5C:79:F4:E2:C0:87:03:A0:02:82:3B:F0:91:4A:75:DE:C7:8E:86:76`
- After the first bundle upload, copy the Google Play app-signing SHA-256 and add it to `.well-known/assetlinks.json` beside the upload certificate.
