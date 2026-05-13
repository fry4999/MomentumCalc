# Mechanisim Calculator

A rebranded, static robotics mechanism calculator app based on the MIT-licensed
ReCalc project.

The site is client-side only. Analytics, external scouting API calls, credential
helpers, and server deployment files have been removed so the app can be hosted
as static GitHub Pages output.

## Local Setup

```sh
pnpm install
pnpm start
```

The dev server runs at `http://localhost:3000`.

## Build

```sh
pnpm build
```

The static output is written to `build/`. The build also creates `build/404.html`
for GitHub Pages client-side routing and `build/.nojekyll`.

## GitHub Pages

This repo includes `.github/workflows/pages.yml`. Push to `main`, set Pages to
use GitHub Actions, and the workflow will build and deploy the static site.

## Attribution

This app is based on [tervay/recalc](https://github.com/tervay/recalc), which is
licensed under the MIT License. The original copyright notice is preserved in
`LICENSE.md`.
