import React from 'react';
import { Helmet } from 'react-helmet-async';

import { BRAND } from '../../config/brand-identity';

/**
 * Everything a crawler and a share preview read.
 *
 * ── THIS ONLY WORKS BECAUSE THE SITE IS PRERENDERED ───────────────────────
 *
 * react-helmet-async writes into the document head at runtime, which is no use
 * to a crawler that does not execute JS and no use at all to a link unfurler
 * (Slack, WhatsApp, LinkedIn) which never runs any. `vite-prerender-plugin`
 * lifts what Helmet produced into the static HTML at build time, so every tag
 * below is in the file on disk. `check:prerender` asserts that for every route.
 *
 * ── WHY THE SCHEMA IS SPLIT ───────────────────────────────────────────────
 *
 * Organization and WebSite describe the publisher and belong on every page.
 * Anything describing the specific page (an FAQ, a product, an article, a
 * breadcrumb trail) is passed in by that page, because repeating a FAQPage on
 * /blog would be a claim that /blog answers those questions.
 */

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  type?: 'website' | 'article';
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Keeps a page out of the index. Used for the 404. */
  noIndex?: boolean;
}

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: BRAND.companyName,
  url: BRAND.websiteUrl,
  logo: `${BRAND.websiteUrl}${BRAND.logos.icon}`,
  description: BRAND.seo.description,
  sameAs: [BRAND.social.linkedin, `https://twitter.com/${BRAND.social.twitter.replace('@', '')}`],
  /*
    No `contactPoint.email`.

    It was here, and it put a live address into the JSON-LD on every page and
    into the JS bundle, which is precisely what the whole form and scheduling
    setup exists to avoid. Structured data is a favourite scraping target for
    exactly this: it is machine-readable by design.

    The demo form is the contact path, and it routes through a provider that
    knows the recipient without the site ever naming them.
  */
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    areaServed: 'IN',
    availableLanguage: 'English',
    url: `${BRAND.websiteUrl}/book-demo`,
  },
};

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: BRAND.brandName,
  url: BRAND.websiteUrl,
  description: BRAND.seo.description,
  inLanguage: 'en-IN',
  publisher: { '@type': 'Organization', name: BRAND.companyName },
};

/** Builds the crumb trail a search result shows above the title. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: `${BRAND.websiteUrl}${crumb.path}`,
    })),
  };
}

/** The FAQ block on the home page, offered for a rich result. */
export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/**
 * What the product is, for the knowledge panel and for any surface that wants
 * to categorise it. `offers` is deliberately absent: pricing is not set, and a
 * fabricated price is a schema violation as well as a lie.
 */
export const SOFTWARE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: BRAND.brandName,
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Accounting',
  operatingSystem: 'Web',
  url: BRAND.websiteUrl,
  description: BRAND.seo.description,
  featureList: [
    'Marketplace settlement reconciliation',
    'Double-entry accounting ledger',
    'GST, TCS and TDS tracking',
    'Inventory valuation and weighted-average costing',
    'Supplier payouts with maker-checker approval',
  ],
  publisher: { '@type': 'Organization', name: BRAND.companyName },
};

const SEO: React.FC<SEOProps> = ({
  title,
  description = BRAND.seo.description,
  path = '',
  type = 'website',
  jsonLd,
  noIndex = false,
}) => {
  const fullTitle = title ? BRAND.seo.titleTemplate.replace('%s', title) : BRAND.seo.defaultTitle;

  const canonicalUrl = `${BRAND.websiteUrl}${path}`;
  const ogImageUrl = `${BRAND.websiteUrl}${BRAND.seo.ogImage}`;

  const schemas = [
    ORGANIZATION_SCHEMA,
    WEBSITE_SCHEMA,
    ...(jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []),
  ];

  return (
    <Helmet>
      <html lang="en-IN" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* max-image-preview:large is what lets the OG card run full width in a
          result rather than as a thumbnail. */}
      <meta
        name="robots"
        content={noIndex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'}
      />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${BRAND.brandName}, ${BRAND.productTagline}`} />
      <meta property="og:site_name" content={BRAND.brandName} />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={BRAND.social.twitter} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:image:alt" content={`${BRAND.brandName}, ${BRAND.productTagline}`} />

      <script type="application/ld+json">{JSON.stringify(schemas)}</script>
    </Helmet>
  );
};

export default SEO;
