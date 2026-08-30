import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import SEO, { breadcrumbSchema } from '../components/shared/SEO';
import BlogRenderer from '../components/blog/BlogRenderer';
import GridBackground from '../components/shared/GridBackground';
import { getLegalPage } from '../content/legalPages';

/**
 * The privacy policy.
 *
 * ── WHY IT IS ONE OF THE FIRST PAGES THIS SITE NEEDED ─────────────────────
 *
 * Amazon's SP-API developer review reads the website behind an application, and
 * a product that asks for a seller's financial data with no policy on the site
 * is the cheap reason to be sent back. Beyond that, this is a page a finance
 * team reads before they connect anything.
 *
 * The prose is in `content/legal/privacy.md`, and it was written from what the
 * platform actually does rather than from a template: the permissions it
 * requests, the ones it deliberately does not, where the marketplace token is
 * encrypted, and which analytics on this site are gated on consent. A policy
 * that describes a different product is worse than none, because it is the
 * document somebody quotes back.
 */
const Privacy: React.FC = () => {
  const { t } = useTranslation();
  const page = getLegalPage('privacy');

  if (!page) return null;

  return (
    <div className="relative overflow-hidden">
      <SEO
        title={page.title}
        description={page.description}
        path="/privacy"
        jsonLd={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: page.title, path: '/privacy' },
        ])}
      />
      <GridBackground />

      <div className="relative py-24 md:py-32" style={{ zIndex: 1 }}>
        <div className="max-w-3xl mx-auto px-6">
          <header className="mb-10 animate-in">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
              {page.title}
            </h1>
            {page.updated && (
              <p className="mt-4 text-sm text-[var(--text-secondary)]">
                {t('legal.updated', { date: format(new Date(page.updated), 'd MMMM yyyy') })}
              </p>
            )}
          </header>

          <BlogRenderer content={page.content} />
        </div>
      </div>
    </div>
  );
};

export default Privacy;
