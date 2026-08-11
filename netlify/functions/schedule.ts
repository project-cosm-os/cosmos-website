/**
 * Redirects to the booking page, without the booking page's URL ever being in
 * the site.
 *
 * ── WHAT THIS DOES AND DOES NOT ACHIEVE ───────────────────────────────────
 *
 * `SCHEDULING_URL` has no VITE_ prefix, so Vite never inlines it and it is not
 * in the JavaScript, the HTML or this repository. It is read here, at request
 * time, from the Netlify environment. So:
 *
 *   Achieved   Nobody can scrape the calendar (or the account behind it) out
 *              of the built assets, the page source, or the git history. That
 *              is the realistic threat: bulk scraping, not targeted curiosity.
 *
 *   NOT        Somebody with devtools open on the running page will see the
 *   achieved   redirect target in the network panel. The browser has to reach
 *              Google to render the booking form, and a request that happens
 *              is a request that can be observed. No arrangement changes this.
 *
 * Stated plainly because the difference matters when deciding whose calendar
 * to point it at.
 *
 * ── WHY 302 AND NOT 301 ───────────────────────────────────────────────────
 *
 * 301 is cached by the browser, sometimes indefinitely. Changing whose
 * calendar this points at would then not take effect for anyone who had
 * already clicked once. 302 keeps the indirection useful.
 */
import type { Config, Context } from '@netlify/functions';

import { normaliseGoogleScheduleUrl } from '../../src/integrations/scheduling/normalise';

export default async (_request: Request, _context: Context): Promise<Response> => {
  const configured = process.env.SCHEDULING_URL ?? '';
  const { url: target, isEmbeddable, problem } = normaliseGoogleScheduleUrl(configured);

  // Logged, not swallowed. A short link here produces a blank frame with no
  // other symptom, so the deploy log is the only place anyone would find out.
  if (problem) console.warn(`[schedule] ${problem}`);

  if (!target || !isEmbeddable) {
    // A clear message beats a broken iframe. This is what shows before the
    // variable is set in the Netlify dashboard.
    return new Response(
      '<!doctype html><meta charset="utf-8">' +
        '<div style="font:16px/1.5 system-ui;padding:3rem;text-align:center;color:#475569">' +
        (problem ? 'The scheduler is not configured correctly.' : 'The scheduler is not connected yet.') +
        '</div>',
      {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          // This page is same-origin and lands inside a sandboxed iframe that
          // permits scripts. It contains none, and this makes sure it stays
          // that way even if the string above is ever edited carelessly.
          'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'",
        },
      },
    );
  }

  return new Response(null, {
    status: 302,
    headers: {
      location: target,
      // Never cache the hop itself, so the destination stays changeable.
      'cache-control': 'no-store',
    },
  });
};

export const config: Config = {
  path: '/api/schedule',
};
