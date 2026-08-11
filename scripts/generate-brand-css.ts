#!/usr/bin/env tsx
/**
 * Generate CSS custom properties from `src/config/brand.ts`.
 *
 * Usage: pnpm generate:brand-css
 *
 * The generated file is committed and is what the stylesheets actually read.
 * Editing it by hand works until the next person runs this script, at which
 * point the edit disappears without a trace — so the header says so loudly.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import {
  brand,
  neutral,
  semantic,
  gradients,
  ACTION,
  BRAND_RGB,
  NEUTRAL_RGB,
  BRAND_PALETTE,
} from '../src/config/brand';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_FILE = path.join(__dirname, '../src/styles/brand-variables.css');

const ramp = (prefix: string, scale: Record<string | number, string>) =>
  Object.entries(scale)
    .map(([step, value]) => `  --${prefix}-${step}: ${value};`)
    .join('\n');

function generateCss(): string {
  return `/**
 * AUTO-GENERATED — DO NOT EDIT.
 *
 * Source: src/config/brand.ts
 * Regenerate: pnpm generate:brand-css
 *
 * Palette: ${BRAND_PALETTE}
 *
 * The ramps below are copied from cosmos-console's primitive tier, so the site
 * and the product are the same colour rather than a close match. If the console
 * reskins, copy the ramp across again — do not eyeball it.
 */

:root {
  /* ── neutral: backgrounds, text, borders, and the primary button ────── */
${ramp('ink', neutral)}

  /* ── accent: links, focus, active nav, one figure per screen ───────── */
${ramp('brand', brand)}

  --brand-rgb-400: ${BRAND_RGB[400]};
  --brand-rgb-500: ${BRAND_RGB[500]};
  --brand-rgb-600: ${BRAND_RGB[600]};
  --ink-rgb-900: ${NEUTRAL_RGB[900]};
  --ink-rgb-950: ${NEUTRAL_RGB[950]};

  /* ── the filled button. Slate, not blue — see brand.ts ─────────────── */
  --action-bg: ${ACTION.bg};
  --action-bg-hover: ${ACTION.bgHover};
  --action-bg-active: ${ACTION.bgActive};
  --action-fg: ${ACTION.fg};

  /* ── surfaces ──────────────────────────────────────────────────────── */
  --surface-canvas: ${neutral[50]};
  --surface-raised: ${neutral[0]};
  --surface-sunken: ${neutral[100]};
  --surface-ink: ${neutral[900]};

  /* ── text ─────────────────────────────────────────────────────────── */
  --text-primary: ${neutral[900]};
  --text-secondary: ${neutral[600]};
  --text-tertiary: ${neutral[500]};
  --text-muted: ${neutral[400]};
  --text-on-ink: ${neutral[0]};
  --text-on-ink-muted: ${neutral[400]};

  /* ── borders ──────────────────────────────────────────────────────── */
  --border-subtle: ${neutral[150]};
  --border-default: ${neutral[200]};
  --border-strong: ${neutral[300]};

  /* ── status. State, never a verdict on a figure — see brand.ts ────── */
  --status-success: ${semantic.success[600]};
  --status-success-bg: ${semantic.success[50]};
  --status-warning: ${semantic.warning[600]};
  --status-warning-bg: ${semantic.warning[50]};
  --status-error: ${semantic.error[600]};
  --status-error-bg: ${semantic.error[50]};
  --status-info: ${semantic.info[600]};
  --status-info-bg: ${semantic.info[50]};

  /* ── the primary link/accent colour ───────────────────────────────── */
  --primary: ${brand[600]};
  --primary-hover: ${brand[500]};
  --primary-subtle: ${brand[50]};

  /* ── depth. Shadows are tinted with ink, never with pure black, so
        they read as depth rather than as dirt on a light surface. ────── */
  --shadow-sm: 0 1px 2px rgba(var(--ink-rgb-950), 0.04);
  --shadow-md: 0 4px 12px rgba(var(--ink-rgb-950), 0.06);
  --shadow-lg: 0 12px 32px rgba(var(--ink-rgb-950), 0.08);
  --shadow-focus: 0 0 0 3px rgba(var(--brand-rgb-500), 0.28);

  /* ── gradients, used sparingly ────────────────────────────────────── */
  --gradient-surface: ${gradients.surface};
  --gradient-ink: ${gradients.ink};
  --gradient-accent-text: ${gradients.accentText};

  /* ── radii, matching the console's control and card geometry ──────── */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
}

/**
 * Dark.
 *
 * Not an inversion. The neutral ramp flips, but the accent moves UP the ramp
 * rather than staying put: #2f66f5 is legible on white and muddy on near-black,
 * so dark uses the 400 step. The console does the same thing, for the same
 * reason.
 */
[data-theme='dark'],
.dark {
  --surface-canvas: ${neutral[1000]};
  --surface-raised: ${neutral[950]};
  --surface-sunken: ${neutral[900]};
  --surface-ink: ${neutral[900]};

  --text-primary: ${neutral[50]};
  --text-secondary: ${neutral[300]};
  --text-tertiary: ${neutral[400]};
  --text-muted: ${neutral[500]};

  --border-subtle: ${neutral[850]};
  --border-default: ${neutral[800]};
  --border-strong: ${neutral[700]};

  --action-bg: ${neutral[100]};
  --action-bg-hover: ${neutral[0]};
  --action-bg-active: ${neutral[200]};
  --action-fg: ${neutral[900]};

  --primary: ${brand[400]};
  --primary-hover: ${brand[300]};
  --primary-subtle: ${neutral[850]};

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.45);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.5);
}
`;
}

fs.writeFileSync(OUTPUT_FILE, generateCss());

console.log('Brand CSS generated.');
console.log(`  output:  ${OUTPUT_FILE}`);
console.log(`  palette: ${BRAND_PALETTE}`);
