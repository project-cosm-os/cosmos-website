import React from 'react';
import { useTranslation } from 'react-i18next';

import { useList } from '../../i18n/useList';

/**
 * How a customer actually gets the product working.
 *
 * ── WHY THIS IS NOT A SEPARATE "SERVICES" PAGE ────────────────────────────
 *
 * A services page turns deployment into a second business with its own
 * pitch, and a second business is the thing that quietly stops feeding the
 * first. The engagement exists because it is how the product reaches a
 * customer and how the product learns what the next customer will need, so
 * it belongs in the same scroll as everything else it supports.
 *
 * It sits directly after the four pillars because that is where the objection
 * lands. Somebody who has just read what the product does is thinking "and how
 * would I ever get my own fee structures into it", not "tell me more features".
 *
 * ── WHY THERE IS NO PRICING HERE ──────────────────────────────────────────
 *
 * Deliberate. Published numbers anchor a negotiation before a single
 * engagement has been delivered, and the right size for one seller is not the
 * right size for a brand with four warehouses. The deck carries the tiers; the
 * site says what the work is and leaves the number to the call.
 *
 * ── THE LAST LINE IS THE ARGUMENT ─────────────────────────────────────────
 *
 * "What we learn setting you up becomes part of the product." Without it this
 * section reads as an implementation fee, which is what every consultancy
 * sells. With it, the engagement is the mechanism that makes the software
 * better, which is the only version of this worth buying or funding.
 */

interface DeploymentItem {
  title: string;
  body: string;
}

const Deployment: React.FC = () => {
  const { t } = useTranslation();
  const items = useList<DeploymentItem>('deployment.items');

  return (
    <section id="deployment" className="section scroll-mt-20">
      <div className="section-container">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <span className="section-label">{t('deployment.label')}</span>
          <h2 className="mt-4 text-3xl font-bold md:text-[2.5rem]">{t('deployment.heading')}</h2>
          <p className="mt-5 text-base md:text-lg">{t('deployment.lead')}</p>
        </div>

        <div
          className="mx-auto mt-12 grid max-w-4xl gap-3 md:grid-cols-2"
          data-reveal
          style={{ ['--reveal-delay' as string]: '90ms' }}
        >
          {items.map((item, i) => (
            <div key={item.title} className="card card-hover p-6">
              <span
                className="tnum grid size-7 place-items-center rounded-full text-[12px] font-semibold"
                style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}
              >
                {i + 1}
              </span>
              <h3 className="mt-4 text-[15px] font-semibold text-[var(--text-primary)]">
                {item.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        <p
          className="mx-auto mt-10 max-w-2xl text-center text-[15px] text-[var(--text-secondary)]"
          data-reveal
          style={{ ['--reveal-delay' as string]: '150ms' }}
        >
          {t('deployment.note')}
        </p>
      </div>
    </section>
  );
};

export default Deployment;
