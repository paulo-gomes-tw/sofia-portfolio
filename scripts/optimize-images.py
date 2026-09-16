#!/usr/bin/env python3
"""Sofia Ferraz — image optimisation.

The studio's source art comes straight out of the design tools: 4000–8000 px
wide PNGs, ~79 MB for the folder. That weight is invisible in a design review
and fatal in the browser — Largest Contentful Paint is a ranking signal, and a
10 MB hero image is the single slowest thing on the page.

This script re-encodes each asset to the largest size it is ever *displayed*
at (times two, for retina) and writes WebP. Originals stay in git history, so
a re-run after replacing a source file is always safe.

    python3 scripts/optimize-images.py            # write optimised files
    python3 scripts/optimize-images.py --dry-run  # report only
"""

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"

# name -> (max width, output format)
#   webp  → photographic content, referenced from CSS/HTML we control
#   png   → icons that browsers fetch outside <picture> (favicon, apple-touch)
PLAN = {
    "hero.png":              (2200, "webp"),
    "about-foto.jpg":        (1600, "webp"),
    "servicos-1.png":        (1400, "webp"),
    "social-1.png":          (1200, "webp"),
    "social-2.png":          (1200, "webp"),
    "social-3.png":          (1200, "webp"),
    "social-4.png":          (1200, "webp"),
    "social-5.png":          (1200, "webp"),
    "social-6.png":          (1200, "webp"),
    "projeto-1.png":         (1800, "webp"),
    "projeto-2.jpg":         (1800, "webp"),
    "projeto-3.png":         (1800, "webp"),
    "depoimento-prime.png":  (128,  "png"),
    "depoimento-rr.png":     (128,  "png"),
    "depoimento-bruna.png":  (128,  "png"),
    "logo-s.png":            (256,  "png"),
}

QUALITY = 82


def human(n):
    return f"{n / 1024 / 1024:.2f} MB" if n >= 1024 * 1024 else f"{n / 1024:.0f} KB"


def main():
    dry = "--dry-run" in sys.argv
    before = after = 0
    missing = []

    for name, (max_w, fmt) in PLAN.items():
        src = IMG / name
        if not src.exists():
            missing.append(name)
            continue

        dst = src.with_suffix("." + fmt)
        src_size = src.stat().st_size
        before += src_size

        with Image.open(src) as im:
            if im.width > max_w:
                height = round(im.height * max_w / im.width)
                im = im.resize((max_w, height), Image.LANCZOS)

            if fmt == "webp":
                # WebP keeps alpha, so transparent marks survive the conversion.
                im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
                params = dict(format="WEBP", quality=QUALITY, method=6)
            else:
                im = im.convert("RGBA")
                params = dict(format="PNG", optimize=True)

            if not dry:
                im.save(dst, **params)

        dst_size = dst.stat().st_size if dst.exists() else src_size
        after += dst_size
        print(f"  {name:<24} {human(src_size):>9} → {dst.name:<22} {human(dst_size):>9}")

        # Drop the oversized original once a differently-named file replaced it.
        if not dry and dst != src and dst.exists():
            src.unlink()

    if missing:
        print("\n  skipped (not found): " + ", ".join(missing))

    print(f"\n  total {human(before)} → {human(after)} "
          f"({100 - after * 100 / before:.0f}% smaller)")
    if dry:
        print("  (dry run — nothing written)")


if __name__ == "__main__":
    main()
