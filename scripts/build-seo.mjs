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

     projetos/<id>.html   one real page per project
     index.html           brand grid baked between markers
     sitemap.xml
     robots.txt
     llms.txt             plain-language summary for answer engines

   Run it after every data sync:  npm run build:seo
   ============================================================ */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://sofiaferrazdesign.com';
const LOCALE = 'pt-BR';          // the language we publish for indexing
const OUT_DIR = join(ROOT, 'projetos');

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

/* The generated pages live one directory down, so every document-relative
   link in the shared chrome needs a hop up. Absolute URLs, anchors, mailto:
   and the like are left alone. */
const upOneLevel = (html) => relative(html, '../');

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

function chromeFrom(projectHtml) {
  const headerStart = projectHtml.indexOf('</head>') + '</head>'.length;
  const mainStart = projectHtml.indexOf('<main');
  const mainEnd = projectHtml.indexOf('</main>') + '</main>'.length;
  return {
    header: upOneLevel(projectHtml.slice(headerStart, mainStart)),
    footer: upOneLevel(projectHtml.slice(mainEnd)),
  };
}

function headFor({ title, description, canonical, image, id, jsonLd }) {
  const fonts = read('project.html').match(/<link href="https:\/\/fonts\.googleapis[^>]+>/)[0];
  return `<!doctype html>
<html lang="${LOCALE}" class="no-js">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="author" content="Sofia Ferraz" />
  <meta name="theme-color" content="#F8F7F4" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="${canonical}" />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Sofia Ferraz" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:locale" content="${LOCALE.replace('-', '_')}" />
  <meta property="og:image" content="${image}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${image}" />

  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg" />
  <link rel="icon" href="../assets/img/logo-s.png" type="image/png" />
  <link rel="apple-touch-icon" href="../assets/img/logo-s.png" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  ${fonts}

  <link rel="stylesheet" href="../assets/css/styles.css" />

  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>

  <script>
    document.documentElement.classList.remove('no-js');
    document.documentElement.classList.add('js');
    window.addEventListener('load', function () {
      window.setTimeout(function () {
        if (!window.__sfReady) {
          document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
        }
      }, 800);
    });
  </script>
</head>
<body class="is-project" data-project="${esc(id)}">
  <a class="skip-link" href="#main">Saltar para o conteúdo</a>
  <div class="grain" aria-hidden="true"></div>
`;
}

function buildProjectPages({ sandbox, data }) {
  const { SFProjects, I18N } = sandbox;
  const chrome = chromeFrom(read('project.html'));

  // Rebuild the folder so a project removed upstream leaves no stale page
  // behind for a crawler to keep visiting.
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const pages = [];

  for (const project of data.projects) {
    // Capture what the real renderer produces, then relocate its links.
    let body = '';
    const mount = { set innerHTML(v) { body = v; }, get innerHTML() { return body; } };
    SFProjects.renderDetail(mount, data, project.id);
    if (!body) continue;

    // Sibling project pages sit next to this one, so the hop up that
    // upOneLevel added to every relative link is one hop too many here.
    body = upOneLevel(body).replace(/href="\.\.\/projetos\//g, 'href="');

    const title = SFProjects.field(project, 'title', LOCALE);
    const category = SFProjects.field(project, 'category', LOCALE);
    const summary = SFProjects.field(project, 'summary', LOCALE);
    const bodyText = SFProjects.field(project, 'body', LOCALE);
    const paragraphs = Array.isArray(bodyText) ? bodyText : (bodyText ? [bodyText] : []);
    const cover = project.cover && (project.cover.src || project.cover);
    const image = cover
      ? (/^https?:/.test(cover) ? cover : `${SITE}/${cover}`)
      : `${SITE}/assets/img/hero.webp`;
    const canonical = `${SITE}/projetos/${project.id}.html`;

    const description = (summary || paragraphs[0] ||
      `${title} — projeto de ${category || 'identidade visual'} por Sofia Ferraz, ` +
      'designer de branding e identidade visual no Porto.').slice(0, 300);

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CreativeWork',
          '@id': `${canonical}#projeto`,
          name: title,
          headline: title,
          url: canonical,
          image,
          inLanguage: LOCALE,
          description,
          genre: category || undefined,
          creator: { '@type': 'Person', '@id': `${SITE}/#sofia-ferraz`, name: 'Sofia Ferraz' },
          about: project.meta?.client
            ? { '@type': 'Organization', name: project.meta.client }
            : undefined,
          keywords: (project.meta?.services || []).join(', ') || undefined,
          dateCreated: project.year || undefined,
          sameAs: project.url || undefined,
          isPartOf: { '@id': `${SITE}/#website` },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Projetos', item: `${SITE}/#work` },
            { '@type': 'ListItem', position: 3, name: title, item: canonical },
          ],
        },
      ],
    };

    const head = headFor({ title: `${title} — ${category || 'Projeto'} | Sofia Ferraz`, description, canonical, image, id: project.id, jsonLd });

    // data-project-id lets the browser renderer re-hydrate (and re-translate)
    // this page without a ?p= query string.
    const main = `  <main id="main" data-project-mount data-project-id="${esc(project.id)}">\n${body}\n  </main>\n`;

    writeFileSync(join(OUT_DIR, `${project.id}.html`), head + chrome.header + main + chrome.footer, 'utf8');
    pages.push({ id: project.id, title, canonical, description, url: project.url, category, paragraphs });
  }

  return pages;
}

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

function buildCrawlerFiles(pages) {
  const today = new Date().toISOString().slice(0, 10);

  const urls = [
    { loc: `${SITE}/`, priority: '1.0', changefreq: 'monthly' },
    ...pages.map((p) => ({ loc: p.canonical, priority: '0.8', changefreq: 'yearly' })),
  ];

  write('sitemap.xml',
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    ).join('\n') +
    '\n</urlset>\n');

  write('robots.txt',
`# https://sofiaferrazdesign.com
# Everything here is public portfolio work — search crawlers and the crawlers
# behind AI answers are both welcome. Being quotable in an answer is how this
# studio gets found now.

User-agent: *
Allow: /

# The query-string renderer is kept only so older links keep working; the
# indexable copy of every project lives at /projetos/<id>.html.
Disallow: /project.html

Sitemap: ${SITE}/sitemap.xml
`);

  // llms.txt — an emerging convention: a plain-text brief an answer engine can
  // read end to end, with no markup to wade through.
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

${pages.map((p) => `- [${p.title}](${p.canonical})${p.category ? ` — ${p.category}` : ''}`).join('\n')}

## Páginas

- [Início](${SITE}/) — serviços, sobre, projetos, depoimentos e contacto
- [Sitemap](${SITE}/sitemap.xml)
`);

  return urls.length;
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

const pages = buildProjectPages(site);
console.log(`  prerendered   projetos/ — ${pages.length} pages`);
console.log(`  brand grid    ${injectBrandGrid(site)} bytes baked into index.html`);
console.log(`  crawler files robots.txt · sitemap.xml (${buildCrawlerFiles(pages)} urls) · llms.txt\n`);
