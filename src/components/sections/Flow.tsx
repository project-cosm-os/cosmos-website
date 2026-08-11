import React from 'react';
import { useTranslation } from 'react-i18next';

import { useList } from '../../i18n/useList';

/**
 * How the pieces fit: sources → the loop → outputs.
 *
 * ── WHY THE LOOP IS FOUR NAMED STEPS ──────────────────────────────────────
 *
 * Detect, investigate, recover, book. Naming them makes the competitive point
 * structurally instead of asserting it: a reconciliation tool produces a finding
 * and hands a summary to somebody else's ledger, so its loop ends at step three.
 * Step four is where this product lives, which is why it carries the accent.
 *
 * The caption once read "Everyone else stops at step three." It was cut. A naked
 * swipe at unnamed competitors is discounted on sight, and it made a claim about
 * other people's products nobody here had measured.
 */

interface Node {
  name: string;
  detail: string;
}

interface Step {
  step: string;
  detail: string;
}

const Column: React.FC<{ label: string; items: Node[] }> = ({ label, items }) => (
  <div>
    <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
      {label}
    </p>
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.name} className="card px-4 py-3">
          <p className="text-[13px] font-medium text-[var(--text-primary)]">{item.name}</p>
          <p className="text-[11px] text-[var(--text-tertiary)]">{item.detail}</p>
        </div>
      ))}
    </div>
  </div>
);

const Flow: React.FC = () => {
  const { t } = useTranslation();
  const sources = useList<Node>('flow.sources');
  const outputs = useList<Node>('flow.outputs');
  const loop = useList<Step>('flow.loop');

  return (
    <section id="platform" className="section scroll-mt-20" style={{ background: 'var(--surface-sunken)' }}>
      <div className="section-container">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <span className="section-label">{t('flow.label')}</span>
          <h2 className="mt-4 text-3xl font-bold md:text-[2.5rem]">{t('flow.heading')}</h2>
          <p className="mt-5 text-base md:text-lg">{t('flow.lead')}</p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.1fr_1fr] lg:gap-6" data-reveal style={{ ["--reveal-delay" as string]: '120ms' }}>
          <Column label={t('flow.sourcesLabel')} items={sources} />

          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              {t('flow.loopLabel')}
            </p>
            <div
              className="rounded-xl border p-4"
              style={{ borderColor: 'var(--border-default)', background: 'var(--surface-raised)' }}
            >
              <div className="flex flex-col gap-2">
                {loop.map((item, i) => {
                  const accent = i === loop.length - 1;
                  return (
                    <div
                      key={item.step}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                      style={{
                        background: accent ? 'var(--primary-subtle)' : 'var(--surface-sunken)',
                        border: `1px solid ${accent ? 'var(--primary)' : 'transparent'}`,
                      }}
                    >
                      <span
                        className="tnum grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold"
                        style={{
                          background: accent ? 'var(--primary)' : 'var(--ink-200)',
                          color: accent ? '#fff' : 'var(--text-secondary)',
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold text-[var(--text-primary)]">
                          {item.step}
                        </span>
                        <span className="block text-[11px] text-[var(--text-tertiary)]">
                          {item.detail}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 text-center text-[11px] text-[var(--text-tertiary)]">
                {t('flow.note')}
              </p>
            </div>
          </div>

          <Column label={t('flow.outputsLabel')} items={outputs} />
        </div>
      </div>
    </section>
  );
};

export default Flow;
