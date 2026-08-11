import React from 'react';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../config/navigation';
import { useList } from '../i18n/useList';
import SEO, { breadcrumbSchema } from '../components/shared/SEO';
import Button from '../components/shared/Button';
import CTASection from '../components/sections/CTASection';

/**
 * What the product does, module by module.
 *
 * ── WRITTEN AS CAPABILITY, NOT AS BENEFIT ─────────────────────────────────
 *
 * The home page makes the argument; this page is for the person sent to check
 * it, usually the CA or the finance lead, who is scanning for whether specific
 * things exist. So each entry names the capability in their vocabulary, and the
 * ones that are not built yet say so.
 *
 * That last part is deliberate. A prospect who finds one overstated capability
 * stops believing every other one, and this audience is professionally
 * suspicious for a living.
 *
 * ── EVERY NUMBER HERE WAS COUNTED, NOT ESTIMATED ──────────────────────────
 *
 * 103 accounts, 39 posting rules, nine integrity checks, four leakage types,
 * twelve question types, five refusals. Each was read out of cosmos-platform
 * rather than recalled. A wrong count is worse than no count, because the
 * reader who checks one is the reader deciding whether to buy.
 */

interface Feature {
  name: string;
  detail: string;
  status?: 'soon';
}

interface Group {
  label: string;
  heading: string;
  lead: string;
  features: Feature[];
}

const Features: React.FC = () => {
  const { t } = useTranslation();
  const groups = useList<Group>('features.groups');

  return (
    <>
      <SEO
        path="/features"
        title={t('features.seoTitle')}
        description={t('features.seoDescription')}
        jsonLd={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: t('features.seoTitle'), path: '/features' },
        ])}
      />

      <section className="grid-bg pt-28 pb-14 md:pt-36">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-label">{t('features.label')}</span>
            <h1 className="mt-5 text-[2.25rem] font-bold leading-[1.08] md:text-[3.25rem]">
              {t('features.heading')}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg">{t('features.lead')}</p>
          </div>
        </div>
      </section>

      {groups.map((group, index) => (
        <section
          key={group.label}
          className="section"
          style={{ background: index % 2 === 1 ? 'var(--surface-sunken)' : 'transparent' }}
        >
          <div className="section-container">
            <div className="max-w-2xl" data-reveal>
              <span className="section-label">{group.label}</span>
              <h2 className="mt-4 text-3xl font-bold md:text-[2.25rem]">{group.heading}</h2>
              <p className="mt-4 text-base md:text-lg">{group.lead}</p>
            </div>

            <div
              className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3"
              data-reveal
              style={{ ["--reveal-delay" as string]: '90ms' }}
            >
              {group.features.map((feature) => (
                <div key={feature.name} className="card card-hover p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                      {feature.name}
                    </h3>
                    {feature.status === 'soon' && (
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                        style={{ background: 'var(--surface-sunken)', color: 'var(--text-muted)' }}
                      >
                        {t('features.soon')}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed">{feature.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="section-container text-center">
          <Button href={ROUTES.bookDemo} size="lg">
            {t('features.cta')}
          </Button>
        </div>
      </section>

      <CTASection />
    </>
  );
};

export default Features;
