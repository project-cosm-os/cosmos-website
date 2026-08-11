import { INTEGRATIONS } from '../../config/integrations';
import type { SchedulingProvider } from './types';

export type { SchedulingProvider } from './types';

/**
 * Google Calendar appointment schedules.
 *
 * The embed points at our own `/api/schedule`, which a Netlify Function
 * redirects to the real calendar. See netlify/functions/schedule.ts for what
 * that does and does not hide.
 *
 * Google's appointment pages set their frame headers to permit embedding,
 * which is why this can be an iframe at all. The site's own CSP has to allow
 * calendar.google.com in `frame-src`; that is in netlify.toml.
 */
function googleCalendar(): SchedulingProvider {
  return {
    id: 'google',
    // Always renderable: the function answers either way, with the real
    // calendar or with a plain "not connected yet" notice.
    isConfigured: true,
    embedUrl: INTEGRATIONS.scheduling.endpoint,
  };
}

/**
 * Calendly, kept working so switching back is one environment variable.
 * Its URL is public by nature, so it is a VITE_ var and is in the bundle.
 */
function calendly(): SchedulingProvider {
  const url = INTEGRATIONS.scheduling.calendlyUrl;
  return {
    id: 'calendly',
    isConfigured: Boolean(url),
    embedUrl: url ? `${url}?hide_gdpr_banner=1` : '',
  };
}

export function schedulingProvider(): SchedulingProvider {
  switch (INTEGRATIONS.scheduling.provider) {
    case 'google':
      return googleCalendar();
    case 'calendly':
      return calendly();
    default:
      return { id: 'none', isConfigured: false, embedUrl: '' };
  }
}
