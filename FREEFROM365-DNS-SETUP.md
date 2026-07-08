# freefrom365.com DNS setup

Domain bought at Namecheap:

- `freefrom365.com`

GitHub Pages stays as it is for the cocktail site. Do not change the existing `CNAME` file with `mixmaster365.eu`.

## Active Vercel apps

This repo uses `vercel.json` to route each subdomain to its static app folder:

```txt
breakfast.freefrom365.com   -> /breakfast/
healthy-gut.freefrom365.com -> /free-from/
gluten-free.freefrom365.com -> /gluten-free/
dairy-free.freefrom365.com  -> /dairy-free/
meat-free.freefrom365.com   -> /meat-free/
plant-based.freefrom365.com -> /plant-based/
```

The root domain redirects to the main Healthy Gut app:

```txt
freefrom365.com     -> healthy-gut.freefrom365.com/free-from/
www.freefrom365.com -> healthy-gut.freefrom365.com/free-from/
```

## Vercel domains

In Vercel Project -> Settings -> Domains, add:

```txt
freefrom365.com
www.freefrom365.com
breakfast.freefrom365.com
healthy-gut.freefrom365.com
gluten-free.freefrom365.com
dairy-free.freefrom365.com
meat-free.freefrom365.com
plant-based.freefrom365.com
```

If Vercel offers "Redirect apex domains to www", leave it off. Redirects are handled in `vercel.json`.

## Namecheap DNS records

In Namecheap -> Domain List -> `freefrom365.com` -> Manage -> Advanced DNS, keep these records:

```txt
Type: A Record
Host: @
Value: 76.76.21.21
TTL: Automatic
```

```txt
Type: CNAME Record
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
```

```txt
Type: CNAME Record
Host: breakfast
Value: cname.vercel-dns.com
TTL: Automatic
```

```txt
Type: CNAME Record
Host: healthy-gut
Value: cname.vercel-dns.com
TTL: Automatic
```

```txt
Type: CNAME Record
Host: gluten-free
Value: cname.vercel-dns.com
TTL: Automatic
```

```txt
Type: CNAME Record
Host: dairy-free
Value: cname.vercel-dns.com
TTL: Automatic
```

```txt
Type: CNAME Record
Host: meat-free
Value: cname.vercel-dns.com
TTL: Automatic
```

```txt
Type: CNAME Record
Host: plant-based
Value: cname.vercel-dns.com
TTL: Automatic
```

Remove Namecheap parking, URL redirect, or old records for the same hosts.

## Google Play / PWA notes

Each app has its own:

- `manifest.json`
- `sw.js`
- app name
- icon paths
- local favorites storage key
- route scope

The apps currently install with folder scopes such as `/breakfast/` and `/free-from/`. That is expected for this single static Vercel project setup.
