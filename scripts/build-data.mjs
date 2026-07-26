#!/usr/bin/env node
/* ============================================================
   Generate assets/data/projects.js from assets/data/projects.json

   The site prefers a plain <script> wrapper for its data so that the
   page also works when opened directly from disk (file://), where
   fetch() is blocked by the browser. projects.json stays the canonical,
   human-editable source; this file is generated — do not edit it.
   ============================================================ */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets', 'data', 'projects.json');
const OUT = path.join(ROOT, 'assets', 'data', 'projects.js');

export async function buildData() {
  const raw = await readFile(SRC, 'utf8');

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error('\n✖ assets/data/projects.json is not valid JSON:\n  ' + err.message + '\n');
    process.exit(1);
  }

  // `</script>` inside data would end the tag early; escape defensively.
  const safe = JSON.stringify(parsed, null, 2).replace(/<\//g, '<\\/');

  const out =
`/* AUTO-GENERATED from projects.json — do not edit.
   Regenerate with: npm run build:data */
window.__SF_PROJECTS = ${safe};
`;

  await writeFile(OUT, out, 'utf8');
  console.log(`✓ Wrote ${path.relative(ROOT, OUT)} (${parsed.projects?.length ?? 0} projects)`);
}

// run directly (not when imported by sync-behance.mjs)
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildData().catch((err) => {
    console.error('✖ ' + err.message);
    process.exit(1);
  });
}
