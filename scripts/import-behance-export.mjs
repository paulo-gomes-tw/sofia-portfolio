#!/usr/bin/env node
/* ============================================================
   Import a browser-extracted Behance export → projects.json
   ------------------------------------------------------------
   Companion to scripts/browser/extract-profile.js and
   extract-project-detail.js. Those run in your browser console
   on Sofia's own Behance pages and print/copy JSON; this script
   takes that JSON and merges it into assets/data/projects.json,
   the same file the site actually reads.

   Usage:
     npm run import:behance -- behance-export.json
     npm run import:behance -- behance-export.json --detail-dir=detail
     npm run import:behance -- behance-export.json --dry-run
     npm run import:behance -- behance-export.json --locale=pt-BR

   --detail-dir points at a folder of files produced by
   extract-project-detail.js, one per project, named to match
   either the project's Behance slug or numeric id
   (e.g. detail/maison-lera.json or detail/1234567.json).
   ============================================================ */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JSON_PATH = path.join(ROOT, 'assets', 'data', 'projects.json');

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const has = (f) => args.includes(f);
const val = (name, dflt) => {
  const hit = args.find((a) => a.startsWith('--' + name + '='));
  return hit ? hit.split('=').slice(1).join('=') : dflt;
};

const EXPORT_PATH = positional[0];
const DETAIL_DIR = val('detail-dir', '');
const DRY = has('--dry-run');
const SRC_LOCALE = val('locale', 'en-US');

function die(msg, extra) {
  console.error('\n✖ ' + msg + '\n');
  if (extra) console.error(extra + '\n');
  process.exit(1);
}

if (!EXPORT_PATH) {
  die('No export file given.',
`Usage:
  npm run import:behance -- behance-export.json
  npm run import:behance -- behance-export.json --detail-dir=detail

That file comes from pasting scripts/browser/extract-profile.js
into your browser console while viewing Sofia's Behance profile,
then saving the printed/copied JSON to disk.`);
}

const slugify = (s) =>
  String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'project';

const PLACEHOLDERS = ['01', '02', '03', '04', '05'];

async function loadDetail(dir, slug, behanceId) {
  if (!dir) return null;
  const full = path.isAbsolute(dir) ? dir : path.join(ROOT, dir);
  if (!existsSync(full)) return null;
  let files;
  try { files = await readdir(full); } catch { return null; }
  const match = files.find((f) => {
    const stem = f.replace(/\.json$/i, '');
    return stem === slug || stem === String(behanceId);
  });
  if (!match) return null;
  try {
    return JSON.parse(await readFile(path.join(full, match), 'utf8'));
  } catch (e) {
    console.warn(`  ! could not parse detail file ${match}: ${e.message}`);
    return null;
  }
}

function normalise(entry, detail, index, previous) {
  const id = slugify(entry.slug || entry.title || String(entry.behanceId));
  const prev = previous.get(id) || previous.get(String(entry.behanceId)) || null;

  const body = detail && Array.isArray(detail.paragraphs) && detail.paragraphs.length
    ? detail.paragraphs
    : (prev && prev.i18n && prev.i18n[SRC_LOCALE] && prev.i18n[SRC_LOCALE].body) || [];

  const gallery = detail && Array.isArray(detail.images) && detail.images.length
    ? detail.images.slice(1).map((src) => ({ src, alt: '' })) // first image is usually the cover
    : (prev && prev.gallery) || [];

  const cover = entry.cover
    ? { src: entry.cover }
    : (detail && detail.images && detail.images[0] ? { src: detail.images[0] } : (prev && prev.cover) || null);

  const i18n = {};
  if (prev && prev.i18n) {
    for (const [loc, table] of Object.entries(prev.i18n)) {
      if (loc !== SRC_LOCALE) i18n[loc] = table;
    }
  }
  i18n[SRC_LOCALE] = {
    title: entry.title || (prev && prev.i18n && prev.i18n[SRC_LOCALE] && prev.i18n[SRC_LOCALE].title) || 'Untitled',
    category: (prev && prev.i18n && prev.i18n[SRC_LOCALE] && prev.i18n[SRC_LOCALE].category) || '',
    summary: body[0] ? body[0].slice(0, 180) : ((prev && prev.i18n && prev.i18n[SRC_LOCALE] && prev.i18n[SRC_LOCALE].summary) || ''),
    body
  };

  return {
    id,
    behanceId: entry.behanceId ? Number(entry.behanceId) : (prev && prev.behanceId) || null,
    url: entry.url || (prev && prev.url) || '',
    year: (prev && prev.year) || '',
    featured: prev ? !!prev.featured : index === 0,
    placeholder: (prev && prev.placeholder) || PLACEHOLDERS[index % PLACEHOLDERS.length],
    cover,
    gallery,
    meta: (prev && prev.meta) || { client: entry.title || '', role: '', services: [] },
    i18n
  };
}

async function main() {
  console.log(`\n→ Importing Behance export "${EXPORT_PATH}"…`);

  let raw;
  try {
    raw = JSON.parse(await readFile(path.resolve(EXPORT_PATH), 'utf8'));
  } catch (e) {
    die(`Could not read/parse "${EXPORT_PATH}": ${e.message}`);
  }

  const entries = Array.isArray(raw.projects) ? raw.projects : Array.isArray(raw) ? raw : null;
  if (!entries || !entries.length) {
    die('The export file has no projects.',
        'Make sure you pasted the full output of extract-profile.js and that it found at least one project.');
  }
  console.log(`  · ${entries.length} project(s) in the export`);

  const previous = new Map();
  let existing = { $schema: './projects.schema.md', source: 'seed', syncedAt: null, profile: {}, projects: [] };
  if (existsSync(JSON_PATH)) {
    try {
      existing = JSON.parse(await readFile(JSON_PATH, 'utf8'));
      (existing.projects || []).forEach((p) => {
        previous.set(p.id, p);
        if (p.behanceId) previous.set(String(p.behanceId), p);
      });
      console.log(`  · merging against ${(existing.projects || []).length} existing project(s)`);
    } catch {
      console.warn('  ! existing projects.json is not valid JSON — it will be replaced');
    }
  }

  const projects = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const detail = await loadDetail(DETAIL_DIR, entry.slug, entry.behanceId);
    if (DETAIL_DIR) console.log(`  · ${detail ? 'matched' : 'no'} detail file for "${entry.title}"`);
    projects.push(normalise(entry, detail, i, previous));
  }

  const out = {
    $schema: './projects.schema.md',
    source: 'behance-browser-export',
    syncedAt: new Date().toISOString(),
    profile: existing.profile && existing.profile.url ? existing.profile : { user: '', url: '' },
    projects
  };

  console.log('\n  Projects:');
  projects.forEach((p) => {
    console.log(`   – ${p.id}  cover:${p.cover ? 'yes' : 'placeholder'}  body-paras:${p.i18n[SRC_LOCALE].body.length}  locales:${Object.keys(p.i18n).join(',')}`);
  });

  if (DRY) {
    console.log('\n✓ Dry run — nothing written.\n');
    return;
  }

  await writeFile(JSON_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`\n✓ Wrote ${path.relative(ROOT, JSON_PATH)}`);

  const { buildData } = await import('./build-data.mjs');
  await buildData();

  console.log(
`\nNext: most entries only have a title/cover/link — no year, role, or
services (those aren't visible on the profile grid). Open
assets/data/projects.json and fill in "year", "meta.role",
"meta.services", and translations for pt-BR/es-ES as needed.\n`);
}

main().catch((err) => die('Import failed: ' + err.message, err.stack));
