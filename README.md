# Vice Cover Studio — GTA 6 Cover Art Maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/gaplek15/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/gaplek15/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Turn your photo into a GTA-style three-panel poster cover. Pick a photo
for each panel (or use one photo for all three), add a caption, choose a
colour grade and a post size, then export a PNG to share. Built for the
[make.fun gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) ($250, top 50 share).

## What it does

- Three-panel poster layout: a big hero panel plus two supporting panels.
- Any photo per panel — upload your own or tap one of the four built-in samples.
- Bold Anton lettering for the caption, with a gold spaced tagline above it.
- Three colour grades: Sunset, Neon, Noir.
- Three post sizes: Square 1080 × 1080, Portrait 1080 × 1350, Wide 1920 × 1080.
- Drag a photo inside its panel to reposition it; zoom each panel from 100% to 220%.
- Fully offline: no network request, no tracking, no account. Everything
  (scripts, styles, font, samples) ships in `app/`.

## How to run

```sh
node serve.ts
```

Then open http://localhost:8080 in a browser. (Node 22; the port can be
changed with `node serve.ts --port 8080`.)

## How to hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` into `out/` and writes
`out/dossier.json`.

## Screenshots

- `screenshots/1-cover.jpg` — an exported Wide cover, Sunset grade, "Sunset Heist".
- `screenshots/2-editor.jpg` — the editor with photos loaded in all three panels.
- `screenshots/3-portrait.jpg` — an exported Portrait cover, Sunset grade.
- `screenshots/4-square.jpg` — an exported Square cover, Neon grade, "Neon Nights".

## License

MIT — see `LICENSE`. The Anton font in `app/fonts/` is under the SIL Open
Font License 1.1, see `app/fonts/OFL.txt`.
