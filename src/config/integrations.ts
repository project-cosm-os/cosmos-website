/**
 * Which third-party tools this site talks to, and how to swap them.
 *
 * ── EVERY INTEGRATION IS BEHIND A PROVIDER NAME ───────────────────────────
 *
 * Nothing in the app imports Netlify, HubSpot, Google or Calendly directly.
 * Components ask for "the form provider" or "the scheduling provider" and get
 * back whatever is selected here, so replacing a tool is a config change and a
 * new adapter file rather than a hunt through components.
 *
 * ── WHAT IS PUBLIC AND WHAT IS NOT ────────────────────────────────────────
 *
 * Vite inlines every `VITE_`-prefixed variable into the JavaScript it ships.
 * That is not a leak, it is the documented behaviour, and it means the prefix
 * is the boundary:
 *
 *   VITE_*        compiled into the bundle. Anyone can read it. Fine for a
 *                 provider name or a HubSpot form id, which are public by
 *                 design and useless on their own.
 *
 *   no prefix     never reaches the browser. Read at request time by the
 *                 Netlify Function in netlify/functions/. This is where the
 *                 booking URL lives.
 *
 * The notification email is in neither. It is set in the Netlify dashboard
 * under Forms, so it exists in no file in this repository and in nothing the
 * CDN serves. See README for the exact steps.
 *
 * A caveat worth stating plainly, because it is the difference between a
 * reasonable precaution and a false promise: keeping the booking URL out of
 * the build stops it being scraped from the HTML, the JS or the repo. It does
 * not hide it from somebody with devtools open on the running page, because
 * the browser has to reach Google eventually and the request is visible when
 * it does. There is no arrangement in which that is not true.
 */

type FormProvider = 'netlify' | 'hubspot' | 'none';
type SchedulingProvider = 'google' | 'calendly' | 'none';

/** Reads a build-time variable, falling back when it is not set. */
function env(key: string, fallback = ''): string {
  return (import.meta.env[key] as string | undefined)?.trim() || fallback;
}

export const INTEGRATIONS = {
  /**
   * Booking.
   *
   * `google` renders an appointment schedule from Google Calendar. The URL is
   * NOT here: the embed points at `endpoint` below, a same-origin path that a
   * Netlify Function redirects to whatever `SCHEDULING_URL` is set to in the
   * Netlify dashboard. Change the calendar, or the person who owns it, without
   * touching this repository or rebuilding.
   */
  scheduling: {
    provider: env('VITE_SCHEDULING_PROVIDER', 'google') as SchedulingProvider,

    /** Same-origin. The real destination is server-side only. */
    endpoint: '/api/schedule',

    /**
     * Only used when provider is `calendly`, which is kept as a working
     * alternative rather than deleted: swapping back should be one variable.
     * Public by nature, so a VITE_ var is the right home for it.
     */
    calendlyUrl: env('VITE_CALENDLY_URL'),
  },

  /**
   * The contact form.
   *
   * `netlify` posts to Netlify Forms, which is why the form markup carries
   * `data-netlify`. Submissions land in the Netlify dashboard and the email
   * notification is configured there, so no address is compiled into the site.
   *
   * `hubspot` posts to HubSpot's public forms endpoint. Portal and form ids
   * are public identifiers, so they are safe as VITE_ vars.
   */
  forms: {
    provider: env('VITE_FORMS_PROVIDER', 'netlify') as FormProvider,

    /** Must match the `name` attribute on the form and the netlify.toml entry. */
    netlifyFormName: 'demo-request',

    hubspot: {
      portalId: env('VITE_HUBSPOT_PORTAL_ID'),
      formId: env('VITE_HUBSPOT_FORM_ID'),
    },
  },

  /**
   * Analytics.
   *
   * TODO: create a CosmOS PostHog project and paste its key. Do NOT reuse a key
   * from another product: that would send every visitor here into a different
   * product's funnel, and nobody notices until someone cannot explain a report.
   */
  analytics: {
    ga4MeasurementId: env('VITE_GA4_MEASUREMENT_ID'),
    posthogApiKey: env('VITE_POSTHOG_KEY'),
    posthogHost: env('VITE_POSTHOG_HOST', 'https://us.i.posthog.com'),
    enabled: Boolean(env('VITE_POSTHOG_KEY')),
  },

  cookieConsent: {
    enabled: true,
  },
} as const;

export type Integrations = typeof INTEGRATIONS;
