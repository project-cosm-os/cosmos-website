import React from 'react';
import { useTranslation } from 'react-i18next';

import { useList } from '../../i18n/useList';

/**
 * One settlement line, followed from the marketplace file to a posted entry.
 *
 * ── WHY THIS IS THREE PANELS AND NOT A CANVAS ─────────────────────────────
 *
 * The obvious competitive move here is a workflow builder: a canvas where a
 * visitor drags reconciliation steps around. That is the wrong artefact. A
 * builder is what you ship when the customer has to do the domain modelling
 * themselves, and it demos as "look how configurable" rather than "look how
 * this is correct".
 *
 * The thing worth showing is provenance. The platform's rules speak in stable
 * keys (`fee.commission`) and never name an account; the tenant's posting map
 * resolves the key, and that map is DATA, a projection of
 * `ledger.posting_map_updated`. So a CA remaps an account with no deploy. Two
 * of the three selects below are that map, live: change one and the entry
 * re-posts somewhere else and still balances.
 *
 * That is a claim no reconciliation tool can make, because their entries land
 * in somebody else's ledger.
 *
 * ── WHY IT IS NOT LAZY LOADED ─────────────────────────────────────────────
 *
 * It carries no library, just three panels and a `useState`, so a separate
 * chunk would trade a few hundred bytes for a request. More importantly the
 * prerenderer cannot suspend: a lazy route writes its Suspense fallback into
 * the static HTML, and this section is the densest, most specific text on the
 * home page. It should be in the file a crawler reads.
 *
 * ── THE NUMBERS ARE CHECKED ───────────────────────────────────────────────
 *
 * Every figure lives in the dictionary and `check:figures` re-derives it:
 * 8.5% of ₹12,000 is the fee on the line, 7% is the fee at the rate card, the
 * difference is the claim, and the three entry lines balance. The audience for
 * this section is the one person who will add the column.
 */

interface Field {
  label: string;
  value: string;
}

interface AccountOption {
  code: string;
  name: string;
}

interface EntryLine {
  key: string;
  side: string;
  amount: string;
  options: AccountOption[];
}

const Panel: React.FC<{ label: string; caption: string; children: React.ReactNode }> = ({
  label,
  caption,
  children,
}) => (
  <div className="flex flex-col">
    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
      {label}
    </p>
    <div className="card flex-1 overflow-hidden">
      <div
        className="border-b px-4 py-2.5 text-[11px] font-medium text-[var(--text-secondary)]"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-sunken)' }}
      >
        {caption}
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  </div>
);

const Row: React.FC<{ label: string; value: string; strong?: boolean }> = ({
  label,
  value,
  strong,
}) => (
  <div className="flex items-baseline justify-between gap-4 py-[5px]">
    <span className="text-[12px] text-[var(--text-secondary)]">{label}</span>
    <span
      className="tnum text-[12px] font-medium"
      style={{ color: strong ? 'var(--text-primary)' : 'var(--text-secondary)' }}
    >
      {value}
    </span>
  </div>
);

const Trace: React.FC = () => {
  const { t } = useTranslation();
  const fields = useList<Field>('trace.source.fields');
  const ruleRows = useList<Field>('trace.rule.rows');
  const lines = useList<EntryLine>('trace.entry.lines');

  /*
    The map, as component state. Keyed by rule key rather than by index so a
    reordered dictionary cannot silently point a select at the wrong line.
  */
  const [accounts, setAccounts] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(lines.map((l) => [l.key, l.options[0]?.code ?? ''])),
  );

  const accountFor = (line: EntryLine) => accounts[line.key] ?? line.options[0]?.code ?? '';

  return (
    <section id="trace" className="section scroll-mt-20">
      <div className="section-container">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <span className="section-label">{t('trace.label')}</span>
          <h2 className="mt-4 text-3xl font-bold md:text-[2.5rem]">{t('trace.heading')}</h2>
          <p className="mt-5 text-base md:text-lg">{t('trace.lead')}</p>
        </div>

        <div
          className="mt-12 grid gap-5 lg:grid-cols-[0.9fr_0.9fr_1.2fr] lg:gap-4"
          data-reveal
          style={{ ['--reveal-delay' as string]: '90ms' }}
        >
          {/* 1 ── the line, exactly as the marketplace sent it */}
          <Panel label={t('trace.sourceLabel')} caption={t('trace.source.caption')}>
            {fields.map((field) => (
              <Row key={field.label} label={field.label} value={field.value} />
            ))}
          </Panel>

          {/* 2 ── the deterministic rule, and what it is owed */}
          <Panel label={t('trace.ruleLabel')} caption={t('trace.rule.caption')}>
            {ruleRows.map((row) => (
              <Row key={row.label} label={row.label} value={row.value} />
            ))}

            <div
              className="mt-3 rounded-lg px-3 py-2.5"
              style={{ background: 'var(--status-error-bg)' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-[var(--text-primary)]">
                  {t('trace.rule.findingName')}
                </span>
                <span
                  className="rounded-full px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide"
                  style={{ background: 'var(--status-error)', color: '#fff' }}
                >
                  {t('trace.rule.findingSeverity')}
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-[12px] text-[var(--text-secondary)]">
                  {t('trace.rule.claimLabel')}
                </span>
                <span className="tnum text-[15px] font-bold text-[var(--text-primary)]">
                  {t('trace.rule.claimValue')}
                </span>
              </div>
            </div>

            <p className="mt-2.5 text-[11px] text-[var(--text-tertiary)]">{t('trace.rule.note')}</p>
          </Panel>

          {/* 3 ── the entry, with the posting map live */}
          <Panel label={t('trace.entryLabel')} caption={t('trace.entry.caption')}>
            {/*
              One caption, not two column headings.

              Two headings in their own grid looked aligned and was not: a
              header row is a separate grid container from each entry row, so
              its `auto` first column sizes to the word "Rule key" (68px) while
              the rows size to `Dr` plus the widest key chip (122px). "Your
              account" landed 66px left of the column it claimed to label,
              pointing at blank space.

              Matching them needs either one grid over every cell (which fights
              the two-line wrap below md) or a hardcoded column width that
              breaks the day a longer rule key is added. A caption reads
              left to right across both columns and cannot drift.
            */}
            <p
              className="pb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)]"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              {t('trace.entry.columnsCaption')}
            </p>

            {lines.map((line) => {
              const fixed = line.options.length === 1;
              return (
                /*
                  Two rows below md, three columns from md up. The account name
                  is the widest thing here ("5110 Referral and Commission
                  Fees"), and squeezed into a third of 375px a native select
                  clips it mid-word with no ellipsis. Explicit row and column
                  placement rather than `order`, so the wrap is legible here
                  rather than inferred from three separate utilities.
                */
                <div
                  key={line.key}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 py-2 md:grid-cols-[auto_1fr_auto] md:gap-y-0"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <span className="col-start-1 row-start-1 flex items-center gap-1.5">
                    <span
                      className="tnum w-[18px] shrink-0 text-[10px] font-bold"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {line.side}
                    </span>
                    <code
                      className="rounded px-1 py-px text-[10px]"
                      style={{
                        background: 'var(--primary-subtle)',
                        color: 'var(--primary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {line.key}
                    </code>
                  </span>

                  {fixed ? (
                    <span className="col-span-2 row-start-2 text-[12px] text-[var(--text-primary)] md:col-span-1 md:col-start-2 md:row-start-1">
                      {line.options[0].code} {line.options[0].name}
                    </span>
                  ) : (
                    <select
                      aria-label={`${t('trace.entry.accountAria')} ${line.key}`}
                      value={accountFor(line)}
                      onChange={(e) =>
                        setAccounts((prev) => ({ ...prev, [line.key]: e.target.value }))
                      }
                      className="col-span-2 row-start-2 w-full cursor-pointer rounded border px-1.5 py-1 text-[12px] text-[var(--text-primary)] transition-colors md:col-span-1 md:col-start-2 md:row-start-1"
                      style={{
                        borderColor: 'var(--border-default)',
                        background: 'var(--surface-raised)',
                      }}
                    >
                      {line.options.map((opt) => (
                        <option key={opt.code} value={opt.code}>
                          {opt.code} {opt.name}
                        </option>
                      ))}
                    </select>
                  )}

                  <span className="tnum col-start-2 row-start-1 text-right text-[12px] font-medium text-[var(--text-primary)] md:col-start-3">
                    {line.amount}
                  </span>
                </div>
              );
            })}

            <div className="mt-2.5 flex items-center justify-between gap-3">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ background: 'var(--status-success-bg)', color: 'var(--status-success)' }}
              >
                {t('trace.entry.balancedLabel')}
              </span>
              <span className="tnum text-[11px] text-[var(--text-secondary)]">
                {t('trace.entry.debitTotalLabel')} {t('trace.entry.debitTotalValue')}
                {' · '}
                {t('trace.entry.creditTotalLabel')} {t('trace.entry.creditTotalValue')}
              </span>
            </div>

            <p className="mt-2.5 text-[11px] text-[var(--text-tertiary)]">{t('trace.mapNote')}</p>
          </Panel>
        </div>

        <p
          className="mx-auto mt-10 max-w-2xl text-center text-[15px] text-[var(--text-secondary)]"
          data-reveal
          style={{ ['--reveal-delay' as string]: '150ms' }}
        >
          {t('trace.note')}
        </p>
      </div>
    </section>
  );
};

export default Trace;
