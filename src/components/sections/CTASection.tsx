import React from 'react';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../config/navigation';
import { useAnalytics } from '../../providers/AnalyticsProvider';
import Button from '../shared/Button';

/**
 * The closing ask.
 *
 * One action, not two. A page ending with a primary and a secondary of equal
 * weight has not decided what it wants, and a visitor who has read this far has
 * already been offered the "see how it works" route twice.
 */
const CTASection: React.FC = () => {
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics();

  return (
    <section className="section">
      <div className="section-container">
        <div
          data-reveal="scale"
          className="relative overflow-hidden rounded-2xl px-6 py-16 text-center md:px-16 md:py-20"
          style={{ background: 'var(--gradient-ink)' }}
        >
          <h2
            className="mx-auto max-w-2xl text-3xl font-bold md:text-[2.5rem]"
            style={{ color: 'var(--text-on-ink)' }}
          >
            {t('cta.heading')}
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl text-base md:text-lg"
            style={{ color: 'var(--ink-400)' }}
          >
            {t('cta.body')}
          </p>

          <div className="mt-9 flex justify-center">
            <Button
              href={ROUTES.bookDemo}
              size="lg"
              className="btn-cta-primary"
              onClick={() => trackEvent('cta_click', { section: 'bottom_cta' })}
            >
              {t('cta.button')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
