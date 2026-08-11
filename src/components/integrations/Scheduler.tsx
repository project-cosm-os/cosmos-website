import React from 'react';
import { useTranslation } from 'react-i18next';

import { schedulingProvider } from '../../integrations/scheduling';

/**
 * The booking embed, whoever is hosting the calendar.
 *
 * Knows nothing about Google or Calendly: it asks for the provider and renders
 * whatever URL comes back. Swapping is a variable in the Netlify dashboard.
 */
const Scheduler: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useTranslation();
  const provider = schedulingProvider();

  if (!provider.isConfigured) {
    return (
      <div
        className={`flex min-h-[400px] items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] text-[var(--text-muted)] ${className}`}
      >
        {t('bookDemo.schedulerPlaceholder')}
      </div>
    );
  }

  return (
    <iframe
      src={provider.embedUrl}
      title={t('bookDemo.schedulerTitle')}
      className={`w-full rounded-[var(--radius-lg)] ${className}`}
      style={{ minHeight: 620, border: 0 }}
      /*
        ── ON THIS SANDBOX, HONESTLY ─────────────────────────────────────

        `allow-scripts` with `allow-same-origin` is the combination usually
        called out as an escape, and the warning is real but conditional: a
        framed document with both can drop its own sandbox *when it is
        same-origin with the parent*. Here it is not. `/api/schedule` redirects
        straight to calendar.google.com, so the document that ends up in this
        frame carries Google's origin, and `allow-same-origin` grants it its own
        origin rather than ours.

        Both are required: Google Calendar will not render without scripts, and
        without same-origin it cannot reach its own storage, so the booking UI
        breaks.

        The one same-origin case is the function's fallback page, served from
        our origin when SCHEDULING_URL is unset. It is a fixed string with no
        interpolation and no script, so there is nothing to execute, and the
        function sends a restrictive CSP with it as a second line.

        What the sandbox still buys: no top-level navigation, no downloads, no
        pointer lock, no modals. Worth keeping, but it is a reduction of blast
        radius rather than isolation, and calling it isolation would be wrong.
      */
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="no-referrer"
      loading="lazy"
    />
  );
};

export default Scheduler;
