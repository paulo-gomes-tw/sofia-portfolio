/* ============================================================
   Behance PROJECT PAGE extractor — run in the BROWSER CONSOLE
   ------------------------------------------------------------
   Optional second step: run this on an individual project's
   page (e.g. https://www.behance.net/gallery/1234567/name) to
   pull its full images and body paragraphs — the equivalent of
   the API's "modules". Same idea as extract-profile.js: it just
   reads the page you're already looking at.

   IMPORTANT: scroll all the way down through the whole case study
   FIRST (Behance lazy-loads images/text as you scroll), then run
   this — otherwise you'll only capture what had loaded so far.

   Usage:
     1. Open one of Sofia's project pages, scroll to the bottom.
     2. Paste this into the console, press Enter.
     3. Copy the printed JSON into a file named after the
        project, e.g. detail/maison-lera.json
     4. Run: npm run import:behance -- behance-export.json --detail-dir=detail
   ============================================================ */
(function () {
  // The project's own numeric id, from the current URL
  // (…/gallery/252337527/Flor-de-Lorien → "252337527")
  const idMatch = location.pathname.match(/\/gallery\/(\d+)\//);
  const projectId = idMatch ? idMatch[1] : null;

  // Behance's own module images embed the project id in the filename,
  // e.g. a76abe252337527.6a5203e5d10cd.png — that's the reliable signal.
  // Everything else on the page (avatars, tool icons, "more by this
  // creator" thumbnails, Pro-upsell banners) does NOT contain it.
  function isProjectImage(src) {
    if (!src || !/^https?:\/\//.test(src)) return false;
    if (/\/project_modules\//.test(src) && projectId && src.includes(projectId)) return true;
    if (/\/projects\/original\//.test(src)) return true; // the cover, full quality
    return false;
  }

  const images = Array.from(document.querySelectorAll('img'))
    .map((img) => img.currentSrc || img.src)
    .filter(isProjectImage)
    .filter((src, i, arr) => arr.indexOf(src) === i);

  // Known boilerplate that shows up on every Behance page — never real
  // case-study copy, so it's safe to always drop.
  const JUNK = [
    'no use is allowed without explicit permission',
    'do not sell or share my personal information',
    'advanced analytics',
    'sign in',
    'sign up',
    'cookie',
    'privacy policy',
    'terms of use',
    'behance pro',
    'creative career'
  ];

  function isRealText(t) {
    if (t.length < 40) return false;
    const low = t.toLowerCase();
    return !JUNK.some((phrase) => low.includes(phrase));
  }

  // Real case-study text can sit in <p>, but Behance's editor also
  // renders paragraphs as plain <div>s in some project layouts, so
  // check both — de-duplicated, since a <div> often wraps a <p>.
  const seenText = new Set();
  const paragraphs = [];
  document.querySelectorAll('p, div').forEach((el) => {
    // skip containers that themselves hold other block elements —
    // we want leaf-ish text nodes, not "the whole page" as one blob
    if (el.querySelector('p, div, h1, h2, h3, ul, ol, img')) return;
    const t = el.textContent.replace(/\s+/g, ' ').trim();
    if (isRealText(t) && !seenText.has(t)) {
      seenText.add(t);
      paragraphs.push(t);
    }
  });

  const out = JSON.stringify({ projectId, images, paragraphs }, null, 2);
  console.log('Found ' + images.length + ' image(s), ' + paragraphs.length + ' paragraph(s):\n');
  console.log(out);
  if (!images.length) {
    console.warn('\n⚠ No project images matched. Did the page finish loading? Scroll down and re-run.');
  }
  if (!paragraphs.length) {
    console.warn('\n⚠ No body text found — this project page may be mostly images, or the text loaded after you ran this. Scroll through the whole case study, then re-run.');
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(out)
      .then(() => console.log('\n✓ Copied to clipboard.'))
      .catch(() => console.log('\n(Could not auto-copy — select the JSON above manually.)'));
  }
})();
