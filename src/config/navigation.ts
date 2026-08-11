/**
 * Navigation Configuration
 *
 * All routes and menu items defined here.
 * Change paths or labels without touching components.
 */

export const ROUTES = {
  home: '/',
  features: '/features',
  blog: '/blog',
  bookDemo: '/book-demo',
} as const;

/**
 * The capability nav: what the product does, in the header.
 *
 * ── WHY THE HEADER LISTS SECTIONS AND NOT PAGES ───────────────────────────
 *
 * A header reading Home / Product / Blog tells a visitor nothing about the
 * product. Six named capabilities tell them what it is before they scroll, and
 * that is the single highest-value piece of copy on the page because everyone
 * sees it.
 *
 * These are absolute (`/#recover`) rather than bare fragments so they work from
 * /features and /blog too. App.tsx scrolls to the target after the route
 * settles, since react-router does not honour a hash on its own.
 *
 * Every `hash` here must match a section `id` on the home page. `check:i18n`
 * catches a missing label; nothing catches a missing anchor, so if you rename a
 * section id, rename it here.
 */
export const SECTION_NAV = [
  { labelKey: 'sectionNav.recover', hash: 'recover' },
  { labelKey: 'sectionNav.automate', hash: 'automate' },
  { labelKey: 'sectionNav.comply', hash: 'comply' },
  { labelKey: 'sectionNav.cosmo', hash: 'cosmo' },
  { labelKey: 'sectionNav.platform', hash: 'platform' },
  { labelKey: 'sectionNav.trust', hash: 'trust' },
] as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
