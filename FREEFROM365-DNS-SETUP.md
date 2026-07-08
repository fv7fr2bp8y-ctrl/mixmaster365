# freefrom365.com DNS setup

Domain bought at Namecheap:

- `freefrom365.com`

## Phase 1: breakfast only

For now GitHub Pages stays as it is for the cocktail site. Do not change the existing `CNAME` file with `mixmaster365.eu`.

The first Vercel app/domain setup is only:

- `breakfast.freefrom365.com` -> `breakfast/`
- `freefrom365.com` -> redirects to `breakfast.freefrom365.com`
- `www.freefrom365.com` -> redirects to `breakfast.freefrom365.com`

The current `vercel.json` is intentionally limited to this Phase 1 setup.

## Later app subdomains

- `breakfast.freefrom365.com` -> `breakfast/`
- `healthy-gut.freefrom365.com` -> `free-from/`
- `gluten-free.freefrom365.com` -> `gluten-free/`
- `dairy-free.freefrom365.com` -> `dairy-free/`
- `meat-free.freefrom365.com` -> `meat-free/`
- `plant-based.freefrom365.com` -> `plant-based/`

## Best hosting approach

Use Vercel if we want each subdomain to behave like a separate app root.

GitHub Pages can host the folder paths, but mapping many subdomains to different folders is awkward without a routing layer.

Later, when we are ready, `vercel.json` can be expanded with subdomain rewrites:

```txt
breakfast.freefrom365.com   -> /breakfast/
healthy-gut.freefrom365.com -> /free-from/
gluten-free.freefrom365.com -> /gluten-free/
dairy-free.freefrom365.com  -> /dairy-free/
meat-free.freefrom365.com   -> /meat-free/
plant-based.freefrom365.com -> /plant-based/
```

For Phase 1 the root domain redirects to `breakfast.freefrom365.com`.

## Vercel project setup

1. Go to Vercel and import this GitHub repo.
2. Framework preset: `Other`.
3. Build command: leave empty.
4. Output directory: leave empty.
5. Deploy.
6. Project -> Settings -> Domains, add only:

```txt
freefrom365.com
www.freefrom365.com
breakfast.freefrom365.com
```

## Namecheap DNS records

If using Vercel, add the domains in Vercel first. Vercel will show the exact DNS target, usually:

```txt
Type: CNAME
Host: breakfast
Value: cname.vercel-dns.com
```

For the apex domain:

```txt
Type: A
Host: @
Value: 76.76.21.21
```

Then set `www`:

```txt
Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

Later, add more CNAME records only when we activate those apps:

```txt
healthy-gut -> cname.vercel-dns.com
gluten-free -> cname.vercel-dns.com
dairy-free -> cname.vercel-dns.com
meat-free -> cname.vercel-dns.com
plant-based -> cname.vercel-dns.com
```

## Suggested routing

If all apps stay in this static repo, configure hosting redirects/rewrite rules:

```txt
breakfast.freefrom365.com   -> /breakfast/index.html
healthy-gut.freefrom365.com -> /free-from/index.html
gluten-free.freefrom365.com -> /gluten-free/index.html
dairy-free.freefrom365.com  -> /dairy-free/index.html
meat-free.freefrom365.com   -> /meat-free/index.html
plant-based.freefrom365.com -> /plant-based/index.html
```

## Google Play / PWA notes

Each app already has its own:

- `manifest.json`
- `sw.js`
- app name
- icon paths
- local favorites storage key
- route scope

For separate subdomains, we may later change each manifest `start_url` and `scope` from folder paths to `/`, depending on hosting layout.
