/**
 * Brand identity — names, URLs, and the copy that appears in metadata.
 *
 * Single source of truth for everything except colour, which lives in
 * `brand.ts`. Nothing in `components/` or `pages/` should hardcode a product
 * name, a URL or an email address: it goes here, so a rename is one file.
 *
 * ── PLACEHOLDERS ──────────────────────────────────────────────────────────
 *
 * Values marked TODO are not yet decided. They are deliberately obvious rather
 * than plausible-looking guesses, because a wrong-but-believable canonical URL
 * silently poisons the sitemap, the OG tags and every share preview, and
 * nobody notices until a link renders bare in someone's Slack.
 */

export const BRAND = {
  /**
   * Two names on purpose.
   *
   * `brandName` is the lockup: what the logo reads, what a share card is
   * attributed to, and what somebody types into a search box. `productName` is
   * what the prose calls the thing, and prose that says "CosmOS AI reconciles
   * every settlement line" reads like a press release rather than a product.
   *
   * So: the mark and the metadata carry the full brand, the sentences do not.
   */
  brandName: 'CosmOS AI',
  productName: 'CosmOS',
  companyName: 'CosmOS AI',
  productTagline: 'Autonomous finance for Indian commerce.',
  productCategory: 'Autonomous Finance Platform',

  /*
   * Everything canonical derives from this: sitemap, robots, canonical tags,
   * og:url, JSON-LD. Getting it wrong does not break the site, it quietly
   * points every share preview and every indexed URL at a host that does not
   * exist, and nobody notices until a link renders bare in someone's Slack.
   *
   * Temporary by agreement. "cosmos.ai" is taken, so this ships under the
   * Arivlabs domain while the name is settled. Changing it is one line here
   * plus the Netlify domain setting; `pnpm generate:seo` rewrites the sitemap
   * and robots.txt from it automatically.
   */
  websiteUrl: 'https://cosmos-ai.arivlabs.com',
  consoleUrl: 'https://console.cosmos-ai.arivlabs.com',
  docsUrl: 'https://docs.cosmos-ai.arivlabs.com',

  logos: {
    light: '/assets/logos/cosmos-logo-black.svg',
    dark: '/assets/logos/cosmos-logo-white.svg',
    icon: '/assets/branding/cosmos-mark.svg',
  },

  website: {
    title: 'CosmOS',
    heroTitle: 'The finance team that runs itself.',
    heroSubtitle:
      'CosmOS connects your marketplaces, catches every leaked rupee, files the claims, and books the entries, so your books are always closed, always audit-ready, and always yours.',
    footerText: '© 2026 CosmOS AI. All rights reserved.',
    /*
      No addresses here.

      There were two, and one of them was being compiled into the JSON-LD on
      every page. Whoever should receive a message is configured in the form
      provider (Netlify's dashboard), so the site never names them and there is
      nothing here for a scraper to find.
    */
  },

  seo: {
    defaultTitle: 'CosmOS AI | Autonomous Finance for Indian Commerce',
    titleTemplate: '%s | CosmOS AI',
    description:
      'CosmOS turns marketplace settlements into real double-entry accounting. Reconcile every settlement line, recover what the marketplace got wrong, and close your books continuously on a deterministic ledger built for Indian GST.',
    ogImage: '/assets/og/cosmos-og.png',
  },

  social: {
    twitter: '@cosmosfinance',
    linkedin: 'https://linkedin.com/company/cosmos-finance',
    github: 'https://github.com/project-cosm-os',
  },

  storageKeys: {
    cookieConsent: 'cosmos-cookie-consent',
  },
} as const;

export type Brand = typeof BRAND;
