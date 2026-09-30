# KeyComposerWeb

Landing page for [KeyComposer](https://setapp.com/apps/keycomposer), MacPaw's AI presentation maker for Mac.

## Stack

- **Astro** (static output) — `src/pages/index.astro` is the whole page; `public/styles.css` and `public/main.js` hold the styling and behaviour.
- **Fixel** is self-hosted from `public/fonts` (SIL OFL 1.1, licence alongside).
- Screenshots and the eight sample slides in `public/assets` are real captures from the app.

## Develop

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in ./dist
npm run preview   # serves ./dist
```

## Review builds

Every push to `main` deploys to GitHub Pages via `.github/workflows/pages.yml`. Because the Pages site sits under a
sub-path, the workflow runs `scripts/relativize.mjs`, which rewrites the build's root-relative URLs to relative ones.
The source itself keeps root-relative paths for the production domain.

## Ad landing helpers

- `?v=files`, `?v=pitch`, `?v=keynote` swap the hero copy for message-matched ad groups (see `heroVariants` in `index.astro`).
- `utm_*` parameters on the landing URL are appended to every Setapp link.
- Before launch, set the public origin in `src/consts.ts` (`SITE_URL`) and the CTA target (`TRY_URL`).
