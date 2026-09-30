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

Every push to `main` deploys to GitHub Pages via `.github/workflows/pages.yml`. The workflow runs
`scripts/review-build.mjs` on the build output: it rewrites root-relative URLs to relative ones (the Pages site sits
under a sub-path) and marks the site `noindex` with a `robots.txt` that disallows crawling, so the review build never
appears in search engines. The source keeps root-relative paths and stays indexable for the production domain.

## Ad landing helpers

- `?v=files`, `?v=pitch`, `?v=keynote` swap the hero copy for message-matched ad groups (see `heroVariants` in `index.astro`).
- `utm_*` parameters on the landing URL are appended to every Setapp link.
- Before launch, set the public origin in `src/consts.ts` (`SITE_URL`) and the CTA target (`TRY_URL`).
