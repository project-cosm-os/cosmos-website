import React from 'react';
import { useTranslation } from 'react-i18next';

import { useList } from '../../i18n/useList';

/**
 * The four moves: Recover, Automate, Comply, Own.
 *
 * ── ONE COMPONENT, FOUR SECTIONS ──────────────────────────────────────────
 *
 * These share a shape (label, heading, prose, a checklist, and a panel showing
 * the thing happening) so they are one component driven by the dictionary,
 * rather than four near-identical files that drift the first time someone edits
 * only one of them.
 *
 * The panels alternate side on desktop so the page has a rhythm, and stack in
 * reading order on mobile.
 *
 * Comply was missing from the first draft. For a seller on Amazon or Flipkart,
 * GST and TCS are not a feature they shop for, they are the deadline that
 * arrives every month whether or not the books are ready. It sits third because
 * it is the reason they stay past the first recovery cheque, not the reason
 * they take the call.
 */

type RowState = 'filed' | 'recovered' | 'investigating' | 'posted' | 'review';

interface PanelRow {
  title: string;
  meta: string;
  amount: string;
  state: RowState;
}

/** Order is the argument. See the note above. */
const PILLAR_KEYS = ['recover', 'automate', 'comply', 'own'] as const;

const STATE_STYLE: Record<RowState, { key: string; bg: string; fg: string }> = {
  filed: { key: 'filed', bg: 'var(--status-info-bg)', fg: 'var(--status-info)' },
  recovered: { key: 'recovered', bg: 'var(--status-success-bg)', fg: 'var(--status-success)' },
  investigating: { key: 'investigating', bg: 'var(--status-warning-bg)', fg: 'var(--status-warning)' },
  posted: { key: 'posted', bg: 'var(--status-success-bg)', fg: 'var(--status-success)' },
  review: { key: 'review', bg: 'var(--status-warning-bg)', fg: 'var(--status-warning)' },
};

const Panel: React.FC<{ pillarKey: string }> = ({ pillarKey }) => {
  const { t } = useTranslation();
  const rows = useList<PanelRow>(`pillars.${pillarKey}.rows`);

  return (
    <div className="glow-card overflow-hidden">
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-sunken)' }}
      >
        <span className="text-[13px] font-semibold text-[var(--text-primary)]">
          {t(`pillars.${pillarKey}.panelTitle`)}
        </span>
        <span className="tnum text-[11px] text-[var(--text-tertiary)]">
          {t(`pillars.${pillarKey}.panelMeta`)}
        </span>
      </div>

      <ul className="flex flex-col">
        {rows.map((row, i) => {
          const state = STATE_STYLE[row.state];
          return (
            <li
              key={row.title}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-[var(--text-primary)]">
                  {row.title}
                </span>
                <span className="block truncate text-[11px] text-[var(--text-tertiary)]">
                  {row.meta}
                </span>
              </span>
              <span className="tnum shrink-0 text-[13px] font-semibold text-[var(--text-primary)]">
                {row.amount}
              </span>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ background: state.bg, color: state.fg }}
              >
                {t(`rowState.${state.key}`)}
              </span>
            </li>
          );
        })}
      </ul>

      <div
        className="border-t px-4 py-2.5 text-[11px] text-[var(--text-tertiary)]"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-sunken)' }}
      >
        {t(`pillars.${pillarKey}.footer`)}
      </div>
    </div>
  );
};

const Pillar: React.FC<{ pillarKey: string; index: number }> = ({ pillarKey, index }) => {
  const { t } = useTranslation();
  const points = useList<string>(`pillars.${pillarKey}.points`);

  return (
    <section
      id={pillarKey}
      className="section scroll-mt-20"
      style={{ background: index % 2 === 1 ? 'var(--surface-sunken)' : 'transparent' }}
    >
      <div className="section-container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div
            data-reveal={index % 2 === 1 ? 'right' : 'left'}
            className={index % 2 === 1 ? 'lg:order-2' : undefined}
          >
            <span className="section-label">{t(`pillars.${pillarKey}.label`)}</span>
            <h2 className="mt-4 text-3xl font-bold md:text-[2.5rem]">
              {t(`pillars.${pillarKey}.heading`)}
            </h2>
            <p className="mt-5 text-base md:text-lg">{t(`pillars.${pillarKey}.lead`)}</p>

            <ul className="mt-7 flex flex-col gap-3">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span
                    className="mt-[7px] size-1.5 shrink-0 rounded-full"
                    style={{ background: 'var(--primary)' }}
                  />
                  <span className="text-[15px] text-[var(--text-secondary)]">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            data-reveal={index % 2 === 1 ? 'left' : 'right'}
            style={{ ["--reveal-delay" as string]: '90ms' }}
            className={index % 2 === 1 ? 'lg:order-1' : undefined}
          >
            <Panel pillarKey={pillarKey} />
          </div>
        </div>
      </div>
    </section>
  );
};

const Pillars: React.FC = () => (
  <div>
    {PILLAR_KEYS.map((key, index) => (
      <Pillar key={key} pillarKey={key} index={index} />
    ))}
  </div>
);

export default Pillars;
