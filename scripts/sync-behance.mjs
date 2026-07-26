#!/usr/bin/env node
/* ============================================================
   Sync Sofia's Behance projects → assets/data/projects.json
   ------------------------------------------------------------
   Usage:
     BEHANCE_USER=sofiaferraz BEHANCE_API_KEY=xxx npm run sync:behance
     ... or with an OAuth bearer token:
     BEHANCE_USER=sofiaferraz BEHANCE_TOKEN=xxx npm run sync:behance

   Flags:
     --dry-run        fetch + normalise, print summary, write nothing
     --limit=N        only take the first N projects
     --detail         also fetch each project's modules (gallery + prose)
     --locale=xx-XX   which locale Behance copy populates (default en-US)

   Why a script and not a browser fetch?
     The site is static. A key shipped to the browser is public, and
     Behance does not send CORS headers for cross-origin browser calls.
     So we fetch here (server-side), commit the normalised JSON, and the
     site reads that — no secrets exposed, and the page still renders if
     Behance is unreachable.
   ============================================================ */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JSON_PATH = path.join(ROOT, 'assets', 'data', 'projects.json');

// Override to point at a proxy, a mock, or a future API host.
const API_BASE = process.env.BEHANCE_API_BASE || 'https://api.behance.net/v2';

/* ----------  args & config  ---------- */
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (name, dflt) => {
  const hit = args.find((a) => a.startsWith('--' + name + '='));
  return hit ? hit.split('=').slice(1).join('=') : dflt;
};

const DRY = has('--dry-run');
const WANT_DETAIL = has('--detail');
const LIMIT = parseInt(val('limit', '0'), 10) || 0;
const SRC_LOCALE = val('locale', 'en-US');

const USER = process.env.BEHANCE_USER || '';
const API_KEY = process.env.BEHANCE_API_KEY || '';
const TOKEN = process.env.BEHANCE_TOKEN || '';

function die(msg, extra) {
  console.error('\n✖ ' + msg + '\n');
  if (extra) console.error(extra + '\n');
  process.exit(1);
}

if (!USER) {
  die('BEHANCE_USER is not set.',
`Set Sofia's Behance username (the part after behance.net/):

  export BEHANCE_USER=her-handle
  export BEHANCE_API_KEY=your-key      # or BEHANCE_TOKEN=oauth-token
  npm run sync:behance

Note: Adobe restricted public Behance API registration — if you cannot get
a key, see the "If the API is unavailable" section in README.md for the
supported alternatives (the site's data format is identical either way).`);
}

if (!API_KEY && !TOKEN) {
  die('No Behance credentials found.',
`Provide one of:
  BEHANCE_API_KEY=...   (classic api_key query parameter)
  BEHANCE_TOKEN=...     (OAuth bearer token)`);
}

/* ----------  http  ---------- */
async function api(endpoint, params = {}) {
  const url = new URL(API_BASE + endpoint);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });
  if (API_KEY) url.searchParams.set('api_key', API_KEY);

  const headers = { Accept: 'application/json' };
  if (TOKEN) headers.Authorization = 'Bearer ' + TOKEN;

  const res = await fetch(url, { headers });

  if (res.status === 401 || res.status === 403) {
    die(`Behance rejected the credentials (HTTP ${res.status}).`,
`This usually means the API key/token is invalid, expired, or the
Behance API is not enabled for your Adobe developer account.
Adobe closed public API-key registration, so a legacy key or an
approved OAuth client is required. See README.md.`);
  }
  if (res.status === 404) {
    die(`Behance user "${USER}" was not found (HTTP 404).`,
        'Double-check the handle — it is the segment after behance.net/.');
  }
  if (res.status === 429) {
    die('Rate limited by Behance (HTTP 429).', 'The API allows ~150 requests/hour per IP. Wait and retry.');
  }
  if (!res.ok) {
    die(`Behance request failed: HTTP ${res.status} ${res.statusText}`, 'Endpoint: ' + endpoint);
  }
  return res.json();
}

/* ----------  helpers  ---------- */
const slugify = (s) =>
  String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'project';

function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Behance cover objects are keyed by pixel width — take the largest.
function bestImage(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const keys = Object.keys(obj)
    .filter((k) => /^\d+$/.test(k) || k === 'original')
    .sort((a, b) => (a === 'original' ? 1 : b === 'original' ? -1 : Number(a) - Number(b)));
  if (!keys.length) return null;
  return obj[keys[keys.length - 1]] || null;
}

const PLACEHOLDERS = ['01', '02', '03', '04', '05'];

/* ----------  fetch  ---------- */
async function fetchProjects() {
  const collected = [];
  for (let page = 1; page <= 10; page++) {
    const data = await api(`/users/${encodeURIComponent(USER)}/projects`, { page });
    const batch = Array.isArray(data.projects) ? data.projects : [];
    collected.push(...batch);
    if (!batch.length || (LIMIT && collected.length >= LIMIT)) break;
  }
  return LIMIT ? collected.slice(0, LIMIT) : collected;
}

async function fetchDetail(id) {
  try {
    const data = await api(`/projects/${id}`);
    return data.project || null;
  } catch (e) {
    console.warn(`  ! could not fetch modules for project ${id}`);
    return null;
  }
}

/* ----------  normalise  ---------- */
function normalise(raw, detail, index, previous) {
  const id = slugify(raw.slug || raw.name || String(raw.id));
  const prev = previous.get(id) || previous.get(String(raw.id)) || null;

  const year = raw.published_on
    ? String(new Date(raw.published_on * 1000).getUTCFullYear())
    : (prev && prev.year) || '';

  const cover = bestImage(raw.covers) || bestImage(raw.cover) || null;

  // Prose + gallery from modules when --detail was requested
  let body = [];
  let gallery = [];
  if (detail && Array.isArray(detail.modules)) {
    detail.modules.forEach((m) => {
      if (m.type === 'text' && m.text) {
        const clean = stripHtml(m.text);
        if (clean) body.push(...clean.split(/\n{2,}/).filter(Boolean));
      } else if (m.type === 'image') {
        const src = bestImage(m.sizes) || m.src || null;
        if (src) gallery.push({ src, alt: '' });
      }
    });
  }
  if (!body.length) {
    const desc = stripHtml(raw.description || (detail && detail.description) || '');
    if (desc) body = desc.split(/\n{2,}/).filter(Boolean);
  }

  const fields = Array.isArray(raw.fields) ? raw.fields : [];
  const category = fields.length ? fields.slice(0, 2).join(' · ') : '';

  // Behance copy is single-language. Populate the source locale from the API
  // and preserve any hand-written translations already in projects.json.
  const i18n = {};
  if (prev && prev.i18n) {
    for (const [loc, table] of Object.entries(prev.i18n)) {
      if (loc !== SRC_LOCALE) i18n[loc] = table;
    }
  }
  i18n[SRC_LOCALE] = {
    title: raw.name || (prev && prev.i18n && prev.i18n[SRC_LOCALE] && prev.i18n[SRC_LOCALE].title) || 'Untitled',
    category: category || (prev && prev.i18n && prev.i18n[SRC_LOCALE] && prev.i18n[SRC_LOCALE].category) || '',
    summary: body[0] ? body[0].slice(0, 180) : '',
    body: body.length ? body : (prev && prev.i18n && prev.i18n[SRC_LOCALE] && prev.i18n[SRC_LOCALE].body) || []
  };

  return {
    id,
    behanceId: raw.id || null,
    url: raw.url || '',
    year,
    // keep an existing editorial choice about which cards go full-width
    featured: prev ? !!prev.featured : index === 0,
    placeholder: (prev && prev.placeholder) || PLACEHOLDERS[index % PLACEHOLDERS.length],
    cover: cover ? { src: cover } : (prev && prev.cover) || null,
    gallery: gallery.length ? gallery : (prev && prev.gallery) || [],
    meta: {
      client: (prev && prev.meta && prev.meta.client) || raw.name || '',
      role: (prev && prev.meta && prev.meta.role) || category,
      services: (prev && prev.meta && prev.meta.services && prev.meta.services.length)
        ? prev.meta.services
        : fields
    },
    i18n
  };
}

/* ----------  main  ---------- */
async function main() {
  console.log(`\n→ Syncing Behance projects for "${USER}"…`);

  // preserve hand-written content from the current file
  const previous = new Map();
  let existing = null;
  if (existsSync(JSON_PATH)) {
    try {
      existing = JSON.parse(await readFile(JSON_PATH, 'utf8'));
      (existing.projects || []).forEach((p) => {
        previous.set(p.id, p);
        if (p.behanceId) previous.set(String(p.behanceId), p);
      });
      console.log(`  · found ${previous.size ? (existing.projects || []).length : 0} existing project(s) to merge`);
    } catch (e) {
      console.warn('  ! existing projects.json is not valid JSON — it will be replaced');
    }
  }

  const rawList = await fetchProjects();
  if (!rawList.length) {
    die(`Behance returned no projects for "${USER}".`,
        'The account may have no published projects, or they may not be public.');
  }
  console.log(`  · fetched ${rawList.length} project(s)`);

  const projects = [];
  for (let i = 0; i < rawList.length; i++) {
    const raw = rawList[i];
    const detail = WANT_DETAIL ? await fetchDetail(raw.id) : null;
    if (WANT_DETAIL) console.log(`  · modules for "${raw.name}"`);
    projects.push(normalise(raw, detail, i, previous));
  }

  const out = {
    $schema: './projects.schema.md',
    source: 'behance',
    syncedAt: new Date().toISOString(),
    profile: { user: USER, url: `https://www.behance.net/${USER}` },
    projects
  };

  console.log('\n  Projects:');
  projects.forEach((p) => {
    const locs = Object.keys(p.i18n).join(', ');
    console.log(`   – ${p.id}  (${p.year || '—'})  cover:${p.cover ? 'yes' : 'placeholder'}  locales:${locs}`);
  });

  if (DRY) {
    console.log('\n✓ Dry run — nothing written.\n');
    return;
  }

  await writeFile(JSON_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`\n✓ Wrote ${path.relative(ROOT, JSON_PATH)}`);

  // regenerate the browser wrapper so file:// keeps working
  const { buildData } = await import('./build-data.mjs');
  await buildData();

  const missing = projects.filter((p) => Object.keys(p.i18n).length < 3);
  if (missing.length) {
    console.log(
`\nNote: Behance stores one language per project, so ${missing.length} project(s)
now have copy in ${SRC_LOCALE} only. Add pt-BR / es-ES blocks under each
project's "i18n" key in projects.json to translate them — sync preserves
anything you write there.`);
  }
  console.log('');
}

main().catch((err) => die('Sync failed: ' + err.message, err.stack));
