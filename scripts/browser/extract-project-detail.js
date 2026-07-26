/* ============================================================
   Behance PROJECT PAGE extractor — run in the BROWSER CONSOLE
   ------------------------------------------------------------
   Optional second step: run this on an individual project's
   page (e.g. https://www.behance.net/gallery/1234567/name) to
   pull its full images and body paragraphs — the equivalent of
   the API's "modules". Same idea as extract-profile.js: it just
   reads the page you're already looking at.

   Usage:
     1. Open one of Sofia's project pages.
     2. Paste this into the console, press Enter.
     3. Copy the printed JSON into a file named after the
        project, e.g. detail/maison-lera.json
     4. Run: npm run import:behance -- behance-export.json --detail-dir=detail
   ============================================================ */
(function () {
  const images = Array.from(document.querySelectorAll('img'))
    .map((img) => img.currentSrc || img.src)
    .filter((src) => src && /^https?:\/\//.test(src))
    .filter((src, i, arr) => arr.indexOf(src) === i);

  const paragraphs = Array.from(document.querySelectorAll('p'))
    .map((p) => p.textContent.replace(/\s+/g, ' ').trim())
    .filter((t) => t.length > 40);

  const out = JSON.stringify({ images, paragraphs }, null, 2);
  console.log('Found ' + images.length + ' image(s), ' + paragraphs.length + ' paragraph(s):\n');
  console.log(out);

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(out)
      .then(() => console.log('\n✓ Copied to clipboard.'))
      .catch(() => console.log('\n(Could not auto-copy — select the JSON above manually.)'));
  }
})();
