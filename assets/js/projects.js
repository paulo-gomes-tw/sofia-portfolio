/* ============================================================
   Sofia Ferraz — project data layer & renderers
   ------------------------------------------------------------
   Data source: assets/data/projects.json  (canonical)
                assets/data/projects.js    (generated wrapper so the
                                            site also works over file://)
   Populated by: npm run sync:behance
   ============================================================ */
(function (global) {
  'use strict';

  const DATA_URL = 'assets/data/projects.json';

  /* ----------  Loading  ---------- */
  let cache = null;

  async function load() {
    if (cache) return cache;

    // 1. Preferred: the generated wrapper already on the page (works on file://)
    if (global.__SF_PROJECTS) {
      cache = normalise(global.__SF_PROJECTS);
      return cache;
    }

    // 2. Otherwise fetch the canonical JSON (requires http(s))
    try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      cache = normalise(await res.json());
      return cache;
    } catch (err) {
      console.warn('[projects] could not load data:', err.message);
      cache = { source: 'none', syncedAt: null, profile: {}, projects: [] };
      return cache;
    }
  }

  function normalise(raw) {
    const out = {
      source: raw.source || 'unknown',
      syncedAt: raw.syncedAt || null,
      profile: raw.profile || {},
      projects: Array.isArray(raw.projects) ? raw.projects : []
    };
    // stable ordering: newest year first, then original order
    out.projects = out.projects.slice().sort((a, b) => {
      const ay = parseInt(a.year, 10) || 0;
      const by = parseInt(b.year, 10) || 0;
      return by - ay;
    });
    return out;
  }

  /* ----------  Localised field access  ---------- */
  function field(project, key, locale) {
    const loc = locale || (global.I18N ? global.I18N.current : 'en-US');
    const i18n = project.i18n || {};
    const table = i18n[loc] || i18n[(global.I18N && global.I18N.fallback) || 'en-US'] || {};
    if (table[key] !== undefined) return table[key];
    // fall back to any available locale so Behance-sourced single-language
    // content still renders when a translation has not been supplied
    for (const k of Object.keys(i18n)) {
      if (i18n[k] && i18n[k][key] !== undefined) return i18n[k][key];
    }
    return '';
  }

  /* ----------  Helpers  ---------- */
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Only allow http(s) URLs through to href/src attributes.
  function safeUrl(url) {
    if (!url) return '';
    try {
      const u = new URL(url, global.location.href);
      return (u.protocol === 'http:' || u.protocol === 'https:') ? u.href : '';
    } catch (e) { return ''; }
  }

  // Real covers are hotlinked from Behance's CDN, which this site doesn't
  // control — a URL can 404, expire, or be blocked by hotlink protection at
  // any time. If an <img> fails to load, drop back to the art-directed CSS
  // placeholder instead of showing a broken-image icon.
  global.__sfImgFallback = function (img) {
    const wrap = img.closest('.media');
    if (!wrap) return;
    wrap.classList.remove('media--photo');
    img.remove();
    if (!wrap.querySelector('.media__glow')) {
      const glow = document.createElement('span');
      glow.className = 'media__glow';
      wrap.insertBefore(glow, wrap.firstChild);
    }
  };

  function mediaMarkup(project, opts) {
    const o = opts || {};
    const cover = project.cover && safeUrl(project.cover.src || project.cover);
    const alt = esc(o.alt || field(project, 'title'));
    const cls = 'media media--' + esc(project.placeholder || '01');
    if (cover) {
      return '<span class="' + cls + ' media--photo">' +
             '<img src="' + esc(cover) + '" alt="' + alt + '" loading="lazy" decoding="async" ' +
             'onerror="window.__sfImgFallback(this)" />' +
             '</span>';
    }
    // art-directed placeholder (no broken image, ever)
    return '<span class="' + cls + '" role="img" aria-label="' + alt + '">' +
           '<span class="media__glow"></span></span>';
  }

  /* ----------  Gallery (index page)  ---------- */
  function renderGallery(mount, data) {
    const t = global.I18N ? global.I18N.t : (k) => k;
    const projects = data.projects;

    if (!projects.length) {
      const archive = safeUrl(data.profile && data.profile.url);
      mount.innerHTML =
        '<p class="work-empty">' + esc(t('work.empty')) + '</p>' +
        (archive ? '<a class="btn btn--ghost" href="' + esc(archive) + '" target="_blank" rel="noopener noreferrer">' +
                   '<span>' + esc(t('work.viewAll')) + '</span></a>' : '');
      return;
    }

    mount.innerHTML = projects.map((p) => {
      const title = field(p, 'title');
      const cat = field(p, 'category');
      const wide = p.featured ? ' work-card--wide' : '';
      const href = 'project.html?p=' + encodeURIComponent(p.id);
      return '' +
        '<article class="work-card' + wide + '" data-reveal>' +
          '<a class="work-card__link" href="' + esc(href) + '" aria-label="' + esc(title + ' — ' + cat) + '">' +
            '<span class="work-card__media">' +
              mediaMarkup(p) +
              '<span class="work-card__reveal">' + esc(t('work.viewProject')) +
                '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
              '</span>' +
            '</span>' +
            '<span class="work-card__meta">' +
              '<span class="work-card__title">' + esc(title) + '</span>' +
              '<span class="work-card__cat">' + esc(cat) + '</span>' +
              '<span class="work-card__year">' + esc(p.year || '') + '</span>' +
            '</span>' +
          '</a>' +
        '</article>';
    }).join('');
  }

  /* ----------  Detail (project page)  ---------- */
  function renderDetail(mount, data, id) {
    const t = global.I18N ? global.I18N.t : (k) => k;
    const list = data.projects;
    const idx = list.findIndex((p) => p.id === id);

    if (idx < 0) {
      mount.innerHTML =
        '<div class="shell project-missing">' +
          '<h1 class="project-missing__title">' + esc(t('project.notFound')) + '</h1>' +
          '<a class="btn btn--solid" href="index.html#work"><span>' + esc(t('project.notFoundCta')) + '</span></a>' +
        '</div>';
      return null;
    }

    const p = list[idx];
    const next = list[(idx + 1) % list.length];
    const title = field(p, 'title');
    const cat = field(p, 'category');
    const summary = field(p, 'summary');
    const body = field(p, 'body');
    const bodyArr = Array.isArray(body) ? body : (body ? [body] : []);
    const behance = safeUrl(p.url);
    const meta = p.meta || {};

    document.title = title + ' — Sofia Ferraz';

    const metaRow = [
      meta.client ? { label: t('project.client'), value: meta.client } : null,
      p.year ? { label: t('project.year'), value: p.year } : null,
      meta.role ? { label: t('project.role'), value: meta.role } : null
    ].filter(Boolean);

    const gallery = (p.gallery || [])
      .map((g) => safeUrl(g.src || g))
      .filter(Boolean);

    mount.innerHTML = '' +
      '<article class="project">' +
        '<header class="project__head shell">' +
          '<a class="project__back" href="index.html#work">' +
            '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8H3M3 8L7 4M3 8L7 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            esc(t('project.back')) +
          '</a>' +
          '<p class="eyebrow" data-reveal><span class="eyebrow__line"></span>' + esc(cat) + '</p>' +
          '<h1 class="project__title" data-reveal>' + esc(title) + '</h1>' +
          (summary ? '<p class="project__summary" data-reveal>' + esc(summary) + '</p>' : '') +
        '</header>' +

        '<div class="project__cover shell" data-reveal>' + mediaMarkup(p, { alt: title }) + '</div>' +

        '<div class="shell project__body">' +
          '<aside class="project__meta" data-reveal>' +
            metaRow.map((m) =>
              '<div class="project__meta-row">' +
                '<span class="project__meta-label">' + esc(m.label) + '</span>' +
                '<span class="project__meta-value">' + esc(m.value) + '</span>' +
              '</div>'
            ).join('') +
            (Array.isArray(meta.services) && meta.services.length
              ? '<div class="project__meta-row">' +
                  '<span class="project__meta-label">' + esc(t('project.services')) + '</span>' +
                  '<ul class="project__services">' +
                    meta.services.map((s) => '<li>' + esc(s) + '</li>').join('') +
                  '</ul>' +
                '</div>'
              : '') +
            (behance
              ? '<a class="btn btn--ghost project__behance" href="' + esc(behance) + '" target="_blank" rel="noopener noreferrer">' +
                  '<span>' + esc(t('project.viewOnBehance')) + '</span>' +
                '</a>'
              : '') +
          '</aside>' +
          '<div class="project__prose">' +
            bodyArr.map((para) => '<p data-reveal>' + esc(para) + '</p>').join('') +
          '</div>' +
        '</div>' +

        (gallery.length
          ? '<section class="project__gallery shell" aria-label="' + esc(t('project.gallery')) + '">' +
              gallery.map((src, i) =>
                '<figure class="project__shot" data-reveal>' +
                  '<img src="' + esc(src) + '" alt="' + esc(title + ' — ' + (i + 1)) + '" loading="lazy" decoding="async" ' +
                  'onerror="this.closest(\'figure\').style.display=\'none\'" />' +
                '</figure>'
              ).join('') +
            '</section>'
          : '') +

        '<nav class="project__next shell" aria-label="' + esc(t('project.next')) + '">' +
          '<a class="project__next-link" href="project.html?p=' + esc(encodeURIComponent(next.id)) + '">' +
            '<span class="project__next-label">' + esc(t('project.next')) + '</span>' +
            '<span class="project__next-title">' + esc(field(next, 'title')) + '</span>' +
          '</a>' +
        '</nav>' +

        '<section class="project__cta shell">' +
          '<p class="project__cta-text">' + esc(t('project.cta')) + '</p>' +
          '<a class="btn btn--solid" href="index.html#contact" data-magnetic><span>' + esc(t('project.ctaLink')) + '</span></a>' +
        '</section>' +
      '</article>';

    return p;
  }

  global.SFProjects = {
    load: load,
    field: field,
    renderGallery: renderGallery,
    renderDetail: renderDetail
  };
})(window);
