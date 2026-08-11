import React from 'react';
import { useTranslation } from 'react-i18next';

import { useList } from '../../i18n/useList';

/**
 * The assistant.
 *
 * ── THE ARGUMENT IS THE BOUNDARY, NOT THE CHAT ────────────────────────────
 *
 * Every finance product has a chat box now, so the chat box is not the story.
 * The story is what the model is not allowed to do: it picks which question was
 * asked, and the platform computes every number.
 *
 * The five refusals are named rather than described. A CA can check a named
 * refusal; they cannot check an adjective.
 */

interface Refusal {
  reason: string;
  detail: string;
}

interface Fact {
  label: string;
  value: string;
}

const AskCosmo: React.FC = () => {
  const { t } = useTranslation();
  const refusals = useList<Refusal>('askCosmo.refusals');
  const facts = useList<Fact>('askCosmo.facts');

  return (
    <section id="cosmo" className="section scroll-mt-20">
      <div className="section-container">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div data-reveal="left">
            <span className="section-label">{t('askCosmo.label')}</span>
            <h2 className="mt-4 text-3xl font-bold md:text-[2.5rem]">{t('askCosmo.heading')}</h2>
            <p className="mt-5 text-base md:text-lg">{t('askCosmo.lead')}</p>

            <p className="mt-7 text-[13px] font-semibold text-[var(--text-primary)]">
              {t('askCosmo.refusalsTitle')}
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {refusals.map((item) => (
                <li key={item.reason} className="flex items-start gap-3 text-[14px]">
                  <span
                    className="mt-[7px] size-1.5 shrink-0 rounded-full"
                    style={{ background: 'var(--border-strong)' }}
                  />
                  <span>
                    <span className="font-medium text-[var(--text-primary)]">{item.reason}</span>
                    <span className="text-[var(--text-tertiary)]"> · {item.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] text-[var(--text-tertiary)]">
              {t('askCosmo.refusalNote')}
            </p>
          </div>

          <div className="glow-card overflow-hidden" data-reveal="right" style={{ ["--reveal-delay" as string]: '90ms' }}>
            <div
              className="border-b px-5 py-4"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-sunken)' }}
            >
              <p className="text-[14px] font-medium text-[var(--text-primary)]">
                {t('askCosmo.question')}
              </p>
            </div>

            <div className="px-5 py-4">
              <p className="text-[15px] text-[var(--text-primary)]">{t('askCosmo.answer')}</p>

              <ul className="mt-4 flex flex-col">
                {facts.map((fact, i) => (
                  <li
                    key={fact.label}
                    className="flex items-center justify-between py-2 text-[13px]"
                    style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}
                  >
                    <span className="text-[var(--text-secondary)]">{fact.label}</span>
                    <span className="tnum font-medium text-[var(--text-primary)]">{fact.value}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-[11px] text-[var(--text-tertiary)]">{t('askCosmo.source')}</p>
            </div>

            <div
              className="border-t px-5 py-3 text-[11px] text-[var(--text-tertiary)]"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-sunken)' }}
            >
              {t('askCosmo.permissionNote')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AskCosmo;
