import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * The sources CosmOS reads.
 *
 * Wordmarks rather than logos: third-party marks carry usage terms, and a strip
 * of slightly-wrong logos is worse than none. All set in one weight so no single
 * marketplace looks like an endorsement.
 *
 * `live` separates what is connected today from what is on the roadmap. A strip
 * implying seven live integrations when one exists is a claim the prospect
 * discovers on the demo call, which is the worst possible moment.
 */
const SOURCES = [
  { key: 'amazon', live: true },
  { key: 'flipkart', live: false },
  { key: 'meesho', live: false },
  { key: 'shopify', live: false },
  { key: 'ondc', live: false },
  { key: 'gstn', live: false },
  { key: 'banks', live: false },
] as const;

const Connects: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="border-y py-10" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="section-container" data-reveal="fade">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
          {t('sources.label')}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-9 gap-y-4">
          {SOURCES.map((source) => (
            <span key={source.key} className="flex items-center gap-2">
              <span
                className="text-lg font-semibold tracking-tight"
                style={{ color: source.live ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                {t(`sources.${source.key}`)}
              </span>
              {!source.live && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  {t('sources.soon')}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Connects;
