"""Draws public/assets/og/cosmos-og.png, the card social platforms show for a link.

Kept as a script rather than a checked-in export because the colours below are the
same ink and blue as src/config/brand.ts, and a link preview that has drifted from
the site it points at is the first thing a prospect sees.

    python3 scripts/generate-og-image.py

1200x630 is the size Twitter, LinkedIn, Slack and WhatsApp all crop from.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "assets" / "og" / "cosmos-og.png"

W, H = 1200, 630
INK = (15, 23, 42)        # neutral.900
INK_700 = (30, 41, 59)    # rule colour, one step off the background
BLUE = (89, 140, 255)     # brand.400, legible on ink
MUTED = (148, 163, 184)   # neutral.400
WHITE = (255, 255, 255)


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    for path in (f"/System/Library/Fonts/{name}", f"/Library/Fonts/{name}"):
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size)


img = Image.new("RGB", (W, H), INK)
d = ImageDraw.Draw(img)

# Ledger rules, the same texture the site uses behind the hero.
for x in range(0, W, 60):
    d.line([(x, 0), (x, H)], fill=INK_700, width=1)
for y in range(0, H, 60):
    d.line([(0, y), (W, y)], fill=INK_700, width=1)

bold = font("Helvetica.ttc", 34)
title = font("Helvetica.ttc", 74)
body = font("Helvetica.ttc", 30)
mono = font("Menlo.ttc", 22)

# Mark
d.rounded_rectangle([80, 74, 140, 134], radius=17, fill=WHITE)
d.text((110, 105), "C", font=font("Helvetica.ttc", 38), fill=INK, anchor="mm")
d.text((160, 104), "CosmOS", font=bold, fill=WHITE, anchor="lm")
ai_x = 160 + d.textlength("CosmOS ", font=bold)
d.text((ai_x, 104), "AI", font=bold, fill=BLUE, anchor="lm")

d.text((80, 250), "The finance team", font=title, fill=WHITE, anchor="ls")
d.text((80, 340), "that ", font=title, fill=WHITE, anchor="ls")
runs_x = 80 + d.textlength("that ", font=title)
d.text((runs_x, 340), "runs itself.", font=title, fill=BLUE, anchor="ls")

d.text(
    (80, 420),
    "Reconciliation, recovery and a real ledger for Indian",
    font=body,
    fill=MUTED,
    anchor="ls",
)
d.text((80, 462), "marketplace sellers.", font=body, fill=MUTED, anchor="ls")

d.line([(80, 520), (1120, 520)], fill=INK_700, width=2)
d.text(
    (80, 566),
    "GST-native  ·  immutable ledger  ·  money never floats",
    font=mono,
    fill=MUTED,
    anchor="ls",
)

OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, "PNG", optimize=True)
print(f"{OUT.relative_to(ROOT)} — {W}x{H}, {OUT.stat().st_size // 1024} KB")
