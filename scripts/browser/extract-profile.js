/* ============================================================
   Behance profile extractor — run in the BROWSER CONSOLE
   ------------------------------------------------------------
   What this is:
     A DOM reader, not a scraper bot. It runs inside your own
     logged-in browser tab, on a page you're already allowed to
     view, and reads what's already rendered on your screen —
     the same thing you'd do by hand, just automated.

   How to use:
     1. Open Sofia's Behance profile in a normal browser tab:
          https://www.behance.net/<her-handle>
     2. Scroll down until every project she wants listed has
        loaded (Behance loads more as you scroll).
     3. Open DevTools → Console (F12, or Cmd+Opt+J on Mac).
     4. Paste this whole file in and press Enter.
     5. It prints the JSON and copies it to your clipboard.
     6. Paste that into a new file: behance-export.json
     7. Run:  npm run import:behance -- behance-export.json

   Note: Behance's markup can change. If this finds 0 projects,
   open one project card's HTML in DevTools and check it still
   links through a `/gallery/<id>/<slug>` URL — that's the only
   thing this script depends on.
   ============================================================ */
(function () {
  function text(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function attr(el, name) { return el ? el.getAttribute(name) : null; }

  const seen = new Set();
  const projects = [];

  Array.from(document.querySelectorAll('a[href*="/gallery/"]')).forEach((a) => {
    const m = a.href.match(/\/gallery\/(\d+)\/([^/?#]+)/);
    if (!m) return;
    const [, behanceId, slug] = m;
    if (seen.has(behanceId)) return;
    seen.add(behanceId);

    // walk up to the nearest card-like ancestor for title/image context
    const card = a.closest('li, article, [class*="Card" i]') || a;
    const img = card.querySelector('img');
    const titleEl = card.querySelector('h3, h4, [class*="title" i]');

    projects.push({
      behanceId,
      slug,
      url: a.href.split('?')[0],
      title: text(titleEl) || attr(img, 'alt') || slug.replace(/-/g, ' '),
      cover: (img && (img.currentSrc || img.src)) || null
    });
  });

  const out = JSON.stringify({ extractedAt: new Date().toISOString(), projects }, null, 2);
  console.log('Found ' + projects.length + ' project(s):\n');
  console.log(out);

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(out)
      .then(() => console.log('\n✓ Copied to clipboard — paste it into behance-export.json'))
      .catch(() => console.log('\n(Could not auto-copy — select the JSON above manually.)'));
  }
})();
