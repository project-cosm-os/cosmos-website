import React from 'react';
import { useTranslation } from 'react-i18next';

import { useList } from '../../i18n/useList';

/**
 * Objection handling, in the buyer's own words.
 *
 * ── WHY THESE SIX ─────────────────────────────────────────────────────────
 *
 * Each one is a question that would otherwise be asked on the call, and each
 * answer is one a prospect can verify. Two of them ("where does GST stand",
 * "which marketplaces work today") are places the product is incomplete, and
 * they are answered plainly rather than skipped. A prospect who finds the gap
 * themselves stops believing the rest of the page.
 *
 * Written as plain blocks rather than an accordion. Answers that are three
 * lines long do not need to be hidden behind a click, and text that is in the
 * DOM but collapsed is worth less to a search engine.
 */

interface Item {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const { t } = useTranslation();
  const items = useList<Item>('faq.items');

  return (
    <section className="section">
      <div className="section-container">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <span className="section-label">{t('faq.label')}</span>
          <h2 className="mt-4 text-3xl font-bold md:text-[2.5rem]">{t('faq.heading')}</h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-3 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.question} className="card p-5">
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                {item.question}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
