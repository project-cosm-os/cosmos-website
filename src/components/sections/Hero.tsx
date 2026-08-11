import React from 'react';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../config/navigation';
import Button from '../shared/Button';
import ConsoleMockup from '../shared/ConsoleMockup';

/**
 * The first screen.
 *
 * The headline splits into two dictionary keys because one phrase carries the
 * accent colour. Keeping the accent as its own key means a rewrite cannot
 * accidentally leave the emphasis on the wrong words.
 */
const Hero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="grid-bg relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="section-container">
        <div className="mx-auto max-w-3xl text-center animate-in">
          <span className="section-label">{t('hero.eyebrow')}</span>

          <h1 className="mt-5 text-[2.5rem] font-bold leading-[1.05] md:text-[3.75rem]">
            {t('hero.titleLead')}{' '}
            <span className="gradient-text-bold">{t('hero.titleAccent')}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl">{t('hero.subtitle')}</p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button href={ROUTES.bookDemo} size="lg">
              {t('hero.ctaPrimary')}
            </Button>
            <Button href={ROUTES.features} size="lg" variant="secondary">
              {t('hero.ctaSecondary')}
            </Button>
          </div>

          {/* Set in mono: it reads as a specification rather than a slogan, which
              is the register this audience trusts. */}
          <p className="mono mt-7 text-xs tracking-wide text-[var(--text-tertiary)]">
            {t('hero.note')}
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl animate-in" style={{ animationDelay: '120ms' }}>
          <ConsoleMockup />
        </div>
      </div>
    </section>
  );
};

export default Hero;
