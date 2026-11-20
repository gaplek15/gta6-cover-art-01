// Hand-in program for Vice Cover Studio: copies app/ and screenshots/
// beside this file into the output directory and writes dossier.json
// from them. Node 22, standard library only; run with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });

for (const name of ['app', 'screenshots']) {
  const src = join(here, name);
  if (!existsSync(src)) {
    throw new Error(`main.ts: ${name}/ is missing beside main.ts`);
  }
  cpSync(src, join(outDir, name), { recursive: true });
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});

writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`Wrote ${join(outDir, 'dossier.json')} (${dossier.length} bytes)`);
