# Mechanisim Calculator

A static, GitHub Pages-ready framework for future robotics mechanism
calculators. No calculations are implemented yet.

## Project Goals

- Host directly on GitHub Pages.
- Keep the site frontend-only: no backend API, database, accounts, cookies, or
  saved user data.
- Stay fast and dependency-free with plain HTML, CSS, and JavaScript modules.
- Leave clear places to add future tools for arms, rollers, swerve speeds,
  elevators, flywheels, belts, chain, gearing, and drivetrain planning.

## Run Locally

Open `index.html` directly in a browser, or serve the folder locally:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## GitHub Pages

This repo includes `.github/workflows/pages.yml`, which deploys the static site
from the repository root using GitHub Actions.

After pushing to GitHub:

1. Open the repository settings.
2. Go to **Pages**.
3. Set the source to **GitHub Actions**.
4. Push to `main`, or run the workflow manually.

Because there is no build step, the deployed site is the same static file tree
you see in the repository.

## Structure

```text
.
├── index.html
├── assets/
│   ├── mechanism-board.svg
│   └── mechanism-mark.svg
├── src/
│   ├── main.js
│   ├── styles.css
│   ├── toolCatalog.js
│   └── tools/
│       └── README.md
└── .github/
    └── workflows/
        └── pages.yml
```

## Adding Calculators Later

Use `src/toolCatalog.js` for tool metadata and add future browser-only modules
under `src/tools/`. Keep formulas as pure functions so they can be tested
without UI code.
