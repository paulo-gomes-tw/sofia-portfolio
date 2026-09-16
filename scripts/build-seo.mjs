/* ============================================================
   Sofia Ferraz — static prerender + crawler files
   ------------------------------------------------------------
   The site renders its projects in the browser, from
   assets/data/projects.json. Google will run that JavaScript;
   the crawlers behind AI answers (GPTBot, ClaudeBot,
   PerplexityBot, Applebot-Extended…) generally will not. To
   them every project page reads "Loading projects…".

   This script runs the site's own renderers in Node — the very
   same assets/js/projects.js the browser uses, so the markup
   can never drift — and writes the result to disk:

     index.html           brand grid + project ItemList baked
                          between markers
     sitemap.xml
     robots.txt
     llms.txt             plain-language summary for answer engines

   The case studies themselves live on Behance, so the homepage is the
   single page this site puts forward — which is why everything a crawler
   needs about the work has to be *on it*, not one click away.

   Run it after every data sync:  npm run build:seo
   ============================================================ */

import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://sofiaferrazdesign.com';
const LOCALE = 'pt-BR';          // the language we publish for indexing
const LEGACY_PAGES = join(ROOT, 'projetos');

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const write = (p, s) => { writeFileSync(join(ROOT, p), s, 'utf8'); return s.length; };

/* ────────────────────────────────────────────────────────────
   1. Run the browser bundles in a DOM-shaped sandbox
   ──────────────────────────────────────────────────────────── */

async function loadSite() {
  // Just enough DOM for i18n.js and projects.js. Neither touches layout —
  // they read the dictionary and return strings — so the stubs can be inert.
  const noop = () => {};
  const emptyEl = { setAttribute: noop, getAttribute: () => null, classList: { add: noop, remove: noop } };
  const document = {
    title: '',
    documentElement: emptyEl,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ ...emptyEl }),
  };
  const sandbox = {
    document,
    location: { href: SITE + '/', search: '', hash: '', pathname: '/' },
    localStorage: { getItem: () => null, setItem: noop },
    navigator: { languages: [LOCALE], language: LOCALE },
    console,
    URL,
    URLSearchParams,
    fetch: undefined,
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  for (const f of ['assets/data/projects.js', 'assets/js/i18n.js', 'assets/js/projects.js']) {
    vm.runInContext(read(f), sandbox, { filename: f });
  }

  sandbox.I18N.set(LOCALE);
  // load() resolves from the generated window.__SF_PROJECTS wrapper, so this
  // goes through the site's own sorting and normalisation rather than reading
  // projects.json a second way and risking a different order.
  const data = await sandbox.SFProjects.load();
  return { sandbox, data };
}

/* ────────────────────────────────────────────────────────────
   2. Localise the static markup to the indexed language
   ──────────────────────────────────────────────────────────── */

/* Crawlers read the HTML as served, before any language switch runs. Whatever
   sits between the tags *is* the indexed copy, so it has to be the canonical
   locale — not a mix of the three. */
function localiseStatic(file, I18N) {
  let html = read(file);
  let changed = 0;
  const skipped = [];
  const missing = [];

  html = html.replace(
    /(<([a-z0-9]+)\b[^>]*\bdata-i18n(-html)?="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/gi,
    (match, open, tag, isHtml, key, inner, close) => {
      // Never rewrite a wrapper that contains its own translated children —
      // the inner elements are handled by their own passes.
      if (/data-i18n/.test(inner)) { skipped.push(key); return match; }
      const value = I18N.t(key, LOCALE);
      // t() echoes the key back when no locale has the string. Baking that in
      // would publish "footer.madeIn" as body copy — leave the markup alone and
      // say so instead.
      if (typeof value !== 'string' || value === key) {
        if (value === key) missing.push(key);
        return match;
      }
      const next = isHtml ? value : value.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      if (next.trim() === inner.trim()) return match;
      changed++;
      return open + next + close;
    }
  );

  // Attributes carry indexable text too (alt, aria-label).
  html = html.replace(/data-i18n-attr="([^"]+)"([^>]*)>/gi, (match, spec, rest) => {
    let out = rest;
    for (const pair of spec.split(',')) {
      const i = pair.indexOf(':');
      if (i < 0) continue;
      const attr = pair.slice(0, i).trim();
      const value = I18N.t(pair.slice(i + 1).trim(), LOCALE);
      if (typeof value !== 'string') continue;
      const re = new RegExp(`\\b${attr}="[^"]*"`);
      const next = `${attr}="${value.replace(/"/g, '&quot;')}"`;
      if (re.test(out) && out.match(re)[0] !== next) { out = out.replace(re, next); changed++; }
    }
    return `data-i18n-attr="${spec}"${out}>`;
  });

  write(file, html);
  return { changed, skipped, missing };
}

/* ────────────────────────────────────────────────────────────
   3. Project pages
   ──────────────────────────────────────────────────────────── */

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* The renderers resolve every asset against location.href, which in this
   sandbox is the production origin — so they hand back absolute URLs. Those
   work, but they hardcode the domain into the markup and break local preview.
   Point them back at the file tree; only our own origin is rewritten, so
   Behance links are untouched. */
const relative = (html, prefix) =>
  html
    .replace(new RegExp(`\\b(href|src)="${SITE}/`, 'gi'), `$1="${prefix}`)
    .replace(/\b(href|src)="(?!https?:|mailto:|tel:|data:|#|\/|\.\.\/)([^"]+)"/gi,
             (m, attr, path) => `${attr}="${prefix}${path}"`);

/* ────────────────────────────────────────────────────────────
   4. Bake the homepage brand grid
   ──────────────────────────────────────────────────────────── */

function injectBrandGrid({ sandbox, data }) {
  let body = '';
  const mount = { set innerHTML(v) { body = v; }, get innerHTML() { return body; } };
  sandbox.SFProjects.renderBrandGrid(mount, data);
  body = relative(body, '');

  const START = '<!-- SEO:BRAND-GRID:START — generated by npm run build:seo -->';
  const END = '<!-- SEO:BRAND-GRID:END -->';
  let html = read('index.html');

  const block = `${START}\n${body}\n          ${END}`;
  const existing = new RegExp(`${START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${END}`);

  if (existing.test(html)) {
    html = html.replace(existing, block);
  } else {
    const placeholder = /<p class="work-loading"[^>]*>[\s\S]*?<\/p>/;
    if (!placeholder.test(html)) throw new Error('brand grid placeholder not found in index.html');
    html = html.replace(placeholder, block);
  }
  write('index.html', html);
  return body.length;
}

/* ────────────────────────────────────────────────────────────
   5. robots.txt · sitemap.xml · llms.txt
   ──────────────────────────────────────────────────────────── */

function projectList({ sandbox, data }) {
  const { SFProjects } = sandbox;
  return data.projects.map((project) => {
    const title = SFProjects.field(project, 'title', LOCALE);
    const category = SFProjects.field(project, 'category', LOCALE);
    const summary = SFProjects.realSummary(project, LOCALE);
    const cover = project.cover && (project.cover.src || project.cover);
    return {
      id: project.id,
      title,
      category,
      summary,
      url: project.url || '',
      client: project.meta?.client || '',
      services: project.meta?.services || [],
      year: project.year || '',
      image: cover ? (/^https?:/.test(cover) ? cover : `${SITE}/${cover}`) : '',
    };
  });
}

/* The work is the reason anyone is here, and every case study is one hop away
   on Behance. Structured data is what keeps the work legible to a machine that
   will not take that hop: names, categories and destinations, on the homepage
   itself. */
function injectProjectSchema(pages) {
  const graph = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${SITE}/#projetos`,
    name: 'Projetos de Sofia Ferraz',
    numberOfItems: pages.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: pages.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'CreativeWork',
        name: p.title,
        genre: p.category || undefined,
        description: p.summary || undefined,
        url: p.url || undefined,
        image: p.image || undefined,
        dateCreated: p.year || undefined,
        keywords: p.services.join(', ') || undefined,
        about: p.client ? { '@type': 'Organization', name: p.client } : undefined,
        creator: { '@id': `${SITE}/#sofia-ferraz` },
        isPartOf: { '@id': `${SITE}/#website` },
      },
    })),
  };

  const START = '<!-- SEO:PROJECT-SCHEMA:START — generated by npm run build:seo -->';
  const END = '<!-- SEO:PROJECT-SCHEMA:END -->';
  const block = `${START}\n  <script type="application/ld+json">\n` +
                `${JSON.stringify(graph, null, 2)}\n  </script>\n  ${END}`;

  let html = read('index.html');
  const existing = new RegExp(`${START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${END}`);
  if (existing.test(html)) {
    html = html.replace(existing, block);
  } else {
    const anchor = '  <link rel="stylesheet" href="assets/css/styles.css" />\n';
    if (!html.includes(anchor)) throw new Error('stylesheet anchor not found in index.html');
    html = html.replace(anchor, anchor + '\n  ' + block + '\n', 1);
  }
  write('index.html', html);
  return pages.length;
}

function buildCrawlerFiles(pages) {
  const today = new Date().toISOString().slice(0, 10);

  // One page, one URL. project.html renders from a query string and is not a
  // canonical address for anything, so it does not belong here.
  write('sitemap.xml',
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `  <url>\n    <loc>${SITE}/</loc>\n    <lastmod>${today}</lastmod>\n` +
    '    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n' +
    '</urlset>\n');

  write('robots.txt',
`# https://sofiaferrazdesign.com
# Everything here is public portfolio work — search crawlers and the crawlers
# behind AI answers are both welcome. Being quotable in an answer is how this
# studio gets found now.

User-agent: *
Allow: /

# Renders a project from a ?p= query string and is kept only so older links
# keep working. The case studies live on Behance; the homepage is the canonical
# page here.
Disallow: /project.html

Sitemap: ${SITE}/sitemap.xml
`);

  // llms.txt — an emerging convention: a plain-text brief an answer engine can
  // read end to end, with no markup to wade through. Projects point at Behance,
  // because that is where each case study actually is.
  write('llms.txt',
`# Sofia Ferraz

> Designer de branding e identidade visual, baseada no Porto, Portugal.
> Cria posicionamento estratégico e identidades visuais para marcas que querem
> ser percebidas como luxo no seu mercado. Trabalha em português, inglês e
> espanhol, com projetos no Brasil, Portugal, Estados Unidos e Suécia.

## Sobre

Sofia Ferraz é designer especialista em branding e identidade visual. O seu
processo reúne estratégia, criatividade e atenção ao detalhe para traduzir
histórias, valores e objetivos em sistemas visuais únicos — do símbolo e da
tipografia a cada elemento que constrói uma presença de marca consistente.

## Serviços

- **Branding e identidade visual** — processo estratégico completo: a marca
  comunica os seus valores com clareza, reforça o posicionamento e cria
  ligações duradouras com o seu público.
- **Design para redes sociais** — peças alinhadas com a identidade visual da
  marca, para comunicar a mensagem com clareza e gerar mais reconhecimento.

## Contacto

- Email: sofiaferraz20@gmail.com
- Localização: Porto, Portugal (trabalha remotamente a nível internacional)
- Agendar uma chamada: https://calendar.app.google/1YUhh7etTP8ZvSGv8
- Instagram: https://www.instagram.com/sofiaferrazdesign/
- LinkedIn: https://www.linkedin.com/in/sofia-ferraz2020
- Behance: https://www.behance.net/sofiaferraz1

## Projetos

Os estudos de caso completos estão no Behance.

${pages.map((p) => {
  const bits = [p.category, p.summary].filter(Boolean).join(' — ');
  return `- **${p.title}**${bits ? ` — ${bits}` : ''}${p.url ? `\n  ${p.url}` : ''}`;
}).join('\n')}

## Páginas

- [Início](${SITE}/) — serviços, sobre, projetos, depoimentos e contacto
- [Sitemap](${SITE}/sitemap.xml)
`);

  return 1;
}

/* ────────────────────────────────────────────────────────────
   Run
   ──────────────────────────────────────────────────────────── */

const site = await loadSite();
console.log(`\n  locale        ${LOCALE}`);
console.log(`  projects      ${site.data.projects.length}`);

for (const file of ['index.html', 'project.html']) {
  const { changed, skipped, missing } = localiseStatic(file, site.sandbox.I18N);
  console.log(`  localised     ${file} — ${changed} strings` +
    (skipped.length ? ` (${skipped.length} wrappers left to their children)` : ''));
  if (missing.length) {
    console.warn(`  ⚠ untranslated ${file} — no dictionary entry for: ${[...new Set(missing)].join(', ')}`);
  }
}

// An earlier build published a page per project. The case studies moved to
// Behance, so those pages would now be orphans — clear them out rather than
// leave crawlers revisiting URLs nothing links to.
if (existsSync(LEGACY_PAGES)) {
  rmSync(LEGACY_PAGES, { recursive: true });
  console.log('  removed       projetos/ — case studies live on Behance now');
}

const pages = projectList(site);
console.log(`  brand grid    ${injectBrandGrid(site)} bytes baked into index.html`);
console.log(`  project data  ${injectProjectSchema(pages)} projects described in JSON-LD`);
console.log(`  crawler files robots.txt · sitemap.xml (${buildCrawlerFiles(pages)} url) · llms.txt`);

const thin = pages.filter((p) => !p.summary);
if (thin.length) {
  console.warn(`\n  ⚠ ${thin.length}/${pages.length} projects have no summary in projects.json, so the` +
    `\n    homepage can only offer their category. A sentence each is the one thing` +
    `\n    an answer engine could actually quote: ${thin.map((p) => p.id).join(', ')}`);
}
console.log('');
