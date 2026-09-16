/* ============================================================
   Sofia Ferraz — import one-line project summaries
   ------------------------------------------------------------
   The Behance sync brings back titles, covers and categories,
   but almost never body copy — so most projects reach the site
   with no sentence saying what the brand actually is. That
   sentence is the only thing a search or answer engine can
   quote about the work, and it has to come from the studio.

   This takes the written sentences and puts them where the
   site reads them, without touching anything else in
   projects.json.

     node scripts/import-summaries.mjs frases.json
     node scripts/import-summaries.mjs frases.json --dry-run
     node scripts/import-summaries.mjs frases.json --locale=pt-BR

   Input is JSON keyed by project id, in either shape:

     { "dorian": "Uma marca de moda que…" }            ← one locale
     { "dorian": { "pt-BR": "…", "en-US": "…" } }      ← several

   Note on re-syncing: a later Behance import preserves every
   locale except its source one (en-US), whose summary it
   overwrites from the case study's first paragraph. So pt-BR
   and es-ES sentences are safe forever; an en-US sentence is
   safe until a detail file for that project arrives.
   ============================================================ */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const JSON_PATH = join(ROOT, 'assets/data/projects.json');

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const DEFAULT_LOCALE = (args.find((a) => a.startsWith('--locale=')) || '--locale=pt-BR').split('=')[1];
const input = args.find((a) => !a.startsWith('--'));

if (!input) {
  console.error('\n  usage: node scripts/import-summaries.mjs <frases.json> [--locale=pt-BR] [--dry-run]\n');
  process.exit(1);
}

/* The Behance import writes this when a project has no case-study text. It is a
   call to action, not a description, and must never be imported as one. */
const PLACEHOLDERS = [
  'veja o estudo de caso completo no behance.',
  'see the full case study on behance.',
  'vea el caso de estudio completo en behance.',
];
const isPlaceholder = (s) => PLACEHOLDERS.includes(String(s).trim().toLowerCase());

const data = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
const incoming = JSON.parse(readFileSync(resolve(input), 'utf8'));
const byId = new Map(data.projects.map((p) => [p.id, p]));

let written = 0;
const skipped = [];
const unknown = [];

for (const [id, value] of Object.entries(incoming)) {
  const project = byId.get(id);
  if (!project) { unknown.push(id); continue; }

  const perLocale = typeof value === 'string' ? { [DEFAULT_LOCALE]: value } : value;

  for (const [locale, raw] of Object.entries(perLocale)) {
    const text = String(raw == null ? '' : raw).trim();
    if (!text) { skipped.push(`${id} (${locale}): vazio`); continue; }
    if (isPlaceholder(text)) { skipped.push(`${id} (${locale}): é o placeholder do Behance`); continue; }

    project.i18n = project.i18n || {};
    project.i18n[locale] = project.i18n[locale] || {};
    if (project.i18n[locale].summary === text) continue;

    project.i18n[locale].summary = text;
    written++;
    console.log(`  ${id} (${locale}) — ${text.length} caracteres`);
  }
}

if (unknown.length) console.warn(`\n  ⚠ ids que não existem em projects.json: ${unknown.join(', ')}`);
if (skipped.length) console.warn(`\n  ⚠ ignorados:\n    ${skipped.join('\n    ')}`);

if (DRY) {
  console.log(`\n  ✓ dry run — ${written} frase(s) seriam escritas, nada gravado.\n`);
} else if (written) {
  writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`\n  ✓ ${written} frase(s) escritas em assets/data/projects.json`);
  console.log('    a seguir:  npm run build:data && npm run build:seo\n');
} else {
  console.log('\n  nada a fazer — as frases já lá estavam.\n');
}

// What is still missing, in the locale the site indexes. On a dry run the
// objects above were already updated in memory, so this is the state the
// import *would* leave behind — say which one it is.
const empty = data.projects.filter((p) => {
  const s = ((p.i18n?.[DEFAULT_LOCALE]?.summary) || '').trim();
  return !s || isPlaceholder(s);
});
if (empty.length) {
  console.log(`  ${DRY ? 'ficariam' : 'ainda'} sem frase em ${DEFAULT_LOCALE} ` +
    `(${empty.length}/${data.projects.length}): ` + empty.map((p) => p.id).join(', ') + '\n');
} else {
  console.log(`  ✓ todos os ${data.projects.length} projetos têm frase em ${DEFAULT_LOCALE}.\n`);
}
