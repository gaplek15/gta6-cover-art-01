# Vice Cover Studio — GTA 6 Cover Art Maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/gaplek15/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/gaplek15/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

A web app that turns your photo and a caption into a GTA-style poster
cover, built for [make.fun's GTA 6 cover art bounty](https://make.fun/bounty/gta6-cover-art-01)
($250 in USDC, top 50 entries share the prize).

## What it does

- **Three panels** — a hero panel plus two smaller ones, in the
  multi-panel poster look. Wide covers put the hero on the left;
  square and portrait covers stack it on top.
- **Any photo** — upload your own photo into each panel, or try the
  four built-in samples. Zoom each panel with a slider, drag the
  preview to move a photo inside its panel, or fill all three panels
  with the hero photo in one click.
- **Bold lettering** — a caption in big Anton capitals (SIL Open Font
  License, shipped under `app/fonts/`) with a black outline and a
  magenta drop shadow, plus a small spaced tagline above it.
- **Colour grades** — Sunset, Neon and Noir washes over the whole
  cover, with a vignette.
- **Three post sizes** — Square 1080 × 1080, Portrait 1080 × 1350 and
  Wide 1920 × 1080. One click exports the cover as a PNG.
- **Offline** — plain static files under `app/`, no build step, no
  network request. Serve `app/` with any static server and open
  `index.html`.

## How to run

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

Or serve `app/` with any static HTTP server and open `index.html`.

## How to hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output folder and
writes `dossier.json` with the kit's vendored library
(`vendor/makefun-app.ts`, unchanged).

## Screenshots

- `1-cover.jpg` — an exported Wide cover (1920 × 1080).
- `2-editor.jpg` — the editor in a browser with photos loaded.
- `3-portrait.jpg` — an exported Portrait cover (1080 × 1350).
- `4-square.jpg` — an exported Square cover (1080 × 1080, Neon grade).

The photos in the screenshots are AI-made samples shipped with the
app (the two starter samples plus two made for this entry) — no real
person's photo, no Rockstar artwork, no Rockstar font.

## License

MIT. See `LICENSE`. The Anton font is licensed under the SIL Open
Font License 1.1 (see `app/fonts/OFL.txt`).
