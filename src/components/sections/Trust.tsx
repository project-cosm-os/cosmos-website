import React from 'react';
import { useTranslation } from 'react-i18next';

import { useList } from '../../i18n/useList';

/**
 * Why the numbers can be trusted.
 *
 * ── THE MOST IMPORTANT SECTION ON THE SITE ────────────────────────────────
 *
 * Every competitor claims AI. The argument that separates this product is the
 * opposite one: the AI is fenced. It reads and classifies; a deterministic
 * kernel decides what a number is, and refuses anything that does not balance.
 *
 * A CA reading this page is asking one question: can I sign off on figures a
 * model touched? Each card is a specific engineering decision rather than an
 * adjective, because that is the only kind of answer that question accepts.
 */

interface Guarantee {
  title: string;
  body: string;
}

const Trust: React.FC = () => {
  const { t } = useTranslation();
  const items = useList<Guarantee>('trust.items');

  return (
    <section
      id="trust"
      className="section scroll-mt-20"
      style={{ background: 'var(--surface-ink)', color: 'var(--text-on-ink)' }}
    >
      <div className="section-container">
        <div className="mx-auto max-w-3xl text-center" data-reveal>
          <span className="section-label" style={{ color: 'var(--brand-300)' }}>
            {t('trust.label')}
          </span>
          <h2
            className="mt-4 text-3xl font-bold md:text-[2.5rem]"
            style={{ color: 'var(--text-on-ink)' }}
          >
            {t('trust.heading')}
          </h2>
          <p className="mt-5 text-base md:text-lg" style={{ color: 'var(--ink-400)' }}>
            {t('trust.lead')}
          </p>
        </div>

        <div
          className="mt-14 grid gap-px overflow-hidden rounded-xl md:grid-cols-2 lg:grid-cols-3"
          style={{ background: 'var(--ink-800)' }}
        >
          {items.map((item) => (
            <div key={item.title} className="p-6" style={{ background: 'var(--surface-ink)' }}>
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-on-ink)' }}>
                {item.title}
              </h3>
              <p className="mt-2.5 text-[13px] leading-relaxed" style={{ color: 'var(--ink-400)' }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Trust;
