# Mechanisim Calculator

A static robotics mechanism calculator app for quick mechanical design
estimates.

The site is client-side only and can be hosted as static GitHub Pages output.

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
