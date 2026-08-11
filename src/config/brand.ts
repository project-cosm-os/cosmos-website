/**
 * Brand colour configuration.
 *
 * Single source of truth for colour. Change the ramps here, then run
 * `pnpm generate:brand-css`.
 *
 * ── WHY TWO RAMPS AND NOT ONE ─────────────────────────────────────────────
 *
 * The boilerplate this came from carried a single named palette, where the
 * brand colour was also the button colour. CosmOS does not work that way, and
 * copying that shape would have made the site look like a different product to
 * anyone who then opened the console.
 *
 * The console's primary action is SLATE — near-black, the colour of a filled
 * button — and blue is reserved as an accent for links, focus, active nav and
 * the one figure on a screen that matters. Neutral carries the weight; blue is
 * spent sparingly. That restraint is what makes it read as finance
 * infrastructure rather than as a generic SaaS landing page.
 *
 * These hex values are lifted verbatim from `cosmos-console/src/tokens/
 * primitive.css` (`--p-slate-*` and `--p-blue-*`), so the marketing site and
 * the product are the same colour, not merely similar. If the console reskins,
 * copy the ramp again rather than eyeballing a match.
 */

export const BRAND_PALETTE = 'cosmos-slate' as const;

/**
 * The neutral ramp. Backgrounds, text, borders — and the primary button.
 * Mirrors `--p-slate-*`.
 */
export const neutral = {
  0: '#ffffff',
  25: '#fcfcfd',
  50: '#f8fafc',
  100: '#f1f5f9',
  150: '#e9eef4',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  850: '#172033',
  900: '#0f172a',
  950: '#0a1020',
  1000: '#060a14',
} as const;

/**
 * The accent ramp. Links, focus rings, the active nav item, one figure per
 * screen. Mirrors `--p-blue-*`.
 *
 * Note this is NOT Tailwind's blue — it is a slightly deeper, less saturated
 * blue chosen to sit against slate without vibrating.
 */
export const brand = {
  50: '#eef4ff',
  100: '#dbe7ff',
  200: '#bcd3ff',
  300: '#8eb5ff',
  400: '#598cff',
  500: '#2f66f5',
  600: '#1a4ee0',
  700: '#163cb5',
  800: '#17358f',
  900: '#182f71',
} as const;

/** The filled-button colour. Slate, not blue — see the note above. */
export const ACTION = {
  bg: neutral[900],
  bgHover: neutral[800],
  bgActive: neutral[700],
  fg: neutral[0],
} as const;

export const BRAND_PRIMARY = brand[500];
export const BRAND_PRIMARY_HOVER = brand[400];
export const BRAND_PRIMARY_DARK = brand[600];
export const BRAND_PRIMARY_DARKER = brand[700];
export const BRAND_PRIMARY_LIGHT = brand[300];
export const BRAND_PRIMARY_LIGHTER = brand[100];

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

export const BRAND_RGB = {
  400: hexToRgb(brand[400]),
  500: hexToRgb(brand[500]),
  600: hexToRgb(brand[600]),
};

export const NEUTRAL_RGB = {
  900: hexToRgb(neutral[900]),
  950: hexToRgb(neutral[950]),
};

/**
 * Status colour.
 *
 * ── DIRECTION IS NOT SENTIMENT ────────────────────────────────────────────
 *
 * Carried over from the console's semantic tier, and the reasoning travels with
 * it: in a finance product, red does not mean "bad" and green does not mean
 * "good". A fee going out is an outflow, not a failure; returns falling is a
 * number going DOWN that the seller wants. So these are used for STATE —
 * settled, under review, failed — and never to editorialise a figure.
 */
export const semantic = {
  success: { 50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981', 600: '#059669' },
  warning: { 50: '#fffbeb', 100: '#fef3c7', 500: '#f59e0b', 600: '#d97706' },
  error: { 50: '#fef2f2', 100: '#fee2e2', 500: '#ef4444', 600: '#dc2626' },
  info: { 50: '#eef4ff', 100: '#dbe7ff', 500: '#2f66f5', 600: '#1a4ee0' },
} as const;

export function generateBrandCssVariables(): string {
  const rgb500 = BRAND_RGB[500];

  return `
  --brand-50: ${brand[50]};
  --brand-500: ${brand[500]};
  --brand-600: ${brand[600]};
  --primary: ${brand[500]};
  --brand-rgb-500: ${rgb500};
  `.trim();
}

/**
 * Gradients, used sparingly.
 *
 * The hero wash is a neutral one — slate to near-black. A saturated brand
 * gradient across a hero is the single most dated thing a 2020s SaaS site can
 * do, and it is exactly what a CFO's eye reads as marketing rather than
 * infrastructure.
 */
export const gradients = {
  surface: `linear-gradient(180deg, ${neutral[50]} 0%, ${neutral[0]} 100%)`,
  ink: `linear-gradient(160deg, ${neutral[900]} 0%, ${neutral[1000]} 100%)`,
  accentText: `linear-gradient(135deg, ${brand[600]} 0%, ${brand[400]} 100%)`,
} as const;

export default {
  brand,
  neutral,
  semantic,
  gradients,
  ACTION,
  BRAND_PRIMARY,
  BRAND_PRIMARY_HOVER,
  BRAND_PRIMARY_DARK,
  BRAND_PRIMARY_DARKER,
  BRAND_RGB,
};
