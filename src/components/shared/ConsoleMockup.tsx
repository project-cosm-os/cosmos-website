import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * A rendering of the CosmOS console overview.
 *
 * ── WHY THIS IS MARKUP AND NOT A SCREENSHOT ───────────────────────────────
 *
 * A PNG goes stale the first time the console changes, ships at 300KB, and is
 * unreadable on a phone. This is built from the same tokens the product uses,
 * so it scales and weighs nothing.
 *
 * Every number is tabular. A column of money that jitters between rows is the
 * fastest way to look like a mock-up of a finance product rather than one.
 *
 * ── THE FIGURES ARE ILLUSTRATIVE, AND THEY RECONCILE ──────────────────────
 *
 * They are not from a real tenant. They do have to add up, and the first draft
 * did not: three fee lines totalling ₹8,65,139 sat under a tile reading
 * ₹6,31,004. On a site whose argument is that the numbers are computed rather
 * than guessed, a reader who adds the column and finds it short has been handed
 * the counter-argument for free.
 *
 * The figures live in the dictionary with the rest of the copy, and
 * `pnpm check:figures` reads them from there and verifies:
 *
 *   fee components        2,78,140 + 2,18,732 + 94,132 + 40,000 = 6,31,004
 *   fees as % of gross    6,31,004 / 42,58,120                  = 14.8%
 *   TCS at 0.5% of gross  42,58,120 × 0.005 = 21,290.6, rounded =   21,291
 *   TDS at 0.1% of gross  42,58,120 × 0.001                     =    4,258
 *   gross to net          42,58,120 − 6,31,004 − 8,94,320
 *                                   − 25,549 + 52,253           = 27,59,500
 */

/**
 * Widths are each line as a percentage of gross, so the bars are to scale. The
 * first version claimed that in a comment while using 42/38/22 for lines worth
 * 9%, 8% and 3%, which is a chart that lies quietly.
 *
 * The two sub-1% lines are floored at 2 so they render as a small bar rather
 * than a 5px dot that reads as a glitch. That is the only departure from scale,
 * and it errs larger than truth, which is the safe direction for a line the
 * reader is meant to notice is small.
 */
const WATERFALL = [
  { key: 'gross', width: 100, kind: 'total' as const },
  { key: 'fees', width: 14.8, kind: 'out' as const },
  { key: 'returns', width: 21, kind: 'out' as const },
  { key: 'withheld', width: 2, kind: 'out' as const },
  { key: 'reimbursements', width: 2, kind: 'in' as const },
  { key: 'net', width: 64.8, kind: 'total' as const },
];

const TILES = [
  { key: 'gross' },
  { key: 'fees' },
  { key: 'leakage', accent: true },
  { key: 'net' },
] as const;

const NAV = [
  'overview', 'accounting', 'settlements', 'reconciliation',
  'tax', 'inventory', 'channels', 'assistant',
] as const;

const ConsoleMockup: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="browser-mockup">
      <div className="browser-mockup-bar">
        <span className="browser-mockup-dot" />
        <span className="browser-mockup-dot" />
        <span className="browser-mockup-dot" />
        <span className="browser-mockup-url">{t('mockup.url')}</span>
      </div>

      <div className="browser-mockup-content flex">
        {/* Hidden on narrow screens, where it would eat half the frame and show
            nothing the visitor needs. */}
        <aside
          className="hidden w-44 shrink-0 flex-col gap-0.5 border-r p-3 md:flex"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-raised)' }}
        >
          <div className="mb-3 flex items-center gap-2 px-2">
            <span
              className="grid size-6 place-items-center rounded-md text-[11px] font-bold"
              style={{ background: 'var(--action-bg)', color: 'var(--action-fg)' }}
            >
              C
            </span>
            {/* Split so "AI" carries the accent, matching the site's own
                lockup. Two keys rather than one string with markup in it. */}
            <span className="text-sm font-semibold">
              {t('mockup.brand')}
              <span style={{ color: 'var(--primary)' }}> {t('mockup.brandAccent')}</span>
            </span>
          </div>
          {NAV.map((item, i) => (
            <span
              key={item}
              className="rounded-md px-2 py-1.5 text-[13px]"
              style={
                i === 0
                  ? { background: 'var(--surface-sunken)', color: 'var(--text-primary)', fontWeight: 500 }
                  : { color: 'var(--text-tertiary)' }
              }
            >
              {t(`mockup.nav.${item}`)}
            </span>
          ))}
        </aside>

        <div className="min-w-0 flex-1 p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold md:text-lg">{t('mockup.title')}</h3>
              <p className="text-xs">{t('mockup.subtitle')}</p>
            </div>
            <span
              className="hidden rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline"
              style={{ background: 'var(--status-success-bg)', color: 'var(--status-success)' }}
            >
              {t('mockup.status')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {TILES.map((tile) => (
              <div
                key={tile.key}
                className="rounded-lg border p-3"
                style={{
                  borderColor: 'accent' in tile && tile.accent ? 'var(--primary)' : 'var(--border-subtle)',
                  background: 'var(--surface-raised)',
                }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  {t(`mockup.tiles.${tile.key}Label`)}
                </p>
                <p className="tnum mt-1 text-base font-semibold text-[var(--text-primary)] md:text-lg">
                  {t(`mockup.tiles.${tile.key}Value`)}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--text-tertiary)]">
                  {t(`mockup.tiles.${tile.key}Note`)}
                </p>
              </div>
            ))}
          </div>

          <div
            className="mt-3 rounded-lg border p-3.5"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-raised)' }}
          >
            <p className="mb-2.5 text-xs font-semibold text-[var(--text-primary)]">
              {t('mockup.waterfallTitle')}
            </p>
            <div className="flex flex-col gap-1.5">
              {WATERFALL.map((row) => (
                <div key={row.key} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-[11px] text-[var(--text-secondary)] md:w-32">
                    {t(`mockup.waterfall.${row.key}`)}
                  </span>
                  <span className="relative h-2.5 min-w-0 flex-1">
                    <span
                      className="absolute inset-y-0 left-0 rounded-[3px]"
                      style={{
                        width: `${row.width}%`,
                        background:
                          row.kind === 'total'
                            ? 'var(--ink-800)'
                            : row.kind === 'out'
                              ? 'var(--status-error)'
                              : 'var(--status-success)',
                        opacity: row.kind === 'total' ? 1 : 0.72,
                      }}
                    />
                  </span>
                  <span
                    className="tnum w-24 shrink-0 text-right text-[11px] md:w-28"
                    style={{
                      color: 'var(--text-secondary)',
                      fontWeight: row.kind === 'total' ? 600 : 400,
                    }}
                  >
                    {t(`mockup.amounts.${row.key}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsoleMockup;
