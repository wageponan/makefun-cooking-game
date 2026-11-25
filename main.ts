// Warung Nusantara hand-in program (Node 22, standard library only).
// The game is this directory's game/ folder: plain static files a desktop
// browser loads offline (game/index.html, its stylesheet and ES modules, no
// library and no network request). This program hands the entry in: it copies
// game/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with buildDossier from
// the vendored make.fun library in vendor/makefun-game.ts.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The program runs twice in the grader and both runs write the same bytes:
// the copies are verbatim and buildDossier is deterministic over the tree.

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (from the kit's gate): only text_max_bytes shapes the
// dossier bytes; the others refuse an entry the scorer would refuse anyway
// (more than 4 screenshots or one over 256 KiB; more than 993 files and
// directories in game/ or 48 MiB of game files in all, or a path under game/
// over 1000 UTF-8 bytes). Warung Nusantara is 7 small files, far under them.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

// Verify the hand-in before reporting success: re-read dossier.json, parse
// it as JSON, and require a non-empty top-level object. Any failure here
// means the judge would be handed a broken summary, so fail loudly instead.
const dossierPath = join(out, 'dossier.json');
try {
  const raw = readFileSync(dossierPath, 'utf8');
  if (raw.trim().length === 0) {
    throw new Error('dossier.json is empty');
  }
  const parsed = JSON.parse(raw);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('dossier.json top level is not a JSON object');
  }
  if (Object.keys(parsed).length === 0) {
    throw new Error('dossier.json top-level object has no fields');
  }
} catch (err) {
  console.error(`main.ts: dossier verification failed for ${dossierPath}: ${err.message}`);
  process.exit(1);
}
