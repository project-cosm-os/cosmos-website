/**
 * Turns whatever Google URL someone pasted into one that can be embedded.
 *
 * ── THE TRAP ──────────────────────────────────────────────────────────────
 *
 * Google serves an appointment schedule from two different paths, and only one
 * of them can be put in an iframe. Measured with curl:
 *
 *   /appointments/schedules/<id>            x-frame-options: SAMEORIGIN
 *   /calendar/appointments/schedules/<id>   no such header
 *
 * The share button gives you the first one, and so does the `calendar.app.google`
 * short link, which 302s to it. Embed either and the browser refuses the frame:
 * the page shows an empty box, the console logs a message nobody is reading,
 * and nothing else looks wrong. That is a booking page that silently accepts no
 * bookings.
 *
 * So the URL is rewritten to the embeddable path here rather than trusted.
 *
 * Short links cannot be rewritten, because the schedule id is not in them; they
 * have to be resolved by following the redirect, which is why `scheduleUrl` in
 * the environment must be a full URL. `isEmbeddable` reports which is which so
 * the caller can say so out loud instead of rendering a blank frame.
 */

const NON_EMBED_PATH = '/appointments/schedules/';
const EMBED_PATH = '/calendar/appointments/schedules/';

export interface NormalisedSchedule {
  url: string;
  /** False for a short link, which cannot be framed and cannot be rewritten. */
  isEmbeddable: boolean;
  /** Set when it is not embeddable, for a log line worth reading. */
  problem?: string;
}

export function normaliseGoogleScheduleUrl(raw: string): NormalisedSchedule {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { url: '', isEmbeddable: false, problem: 'SCHEDULING_URL is empty' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { url: trimmed, isEmbeddable: false, problem: 'SCHEDULING_URL is not a valid URL' };
  }

  if (parsed.hostname === 'calendar.app.google') {
    return {
      url: trimmed,
      isEmbeddable: false,
      problem:
        'SCHEDULING_URL is a calendar.app.google short link. Those redirect to a page ' +
        'Google refuses to frame. Open it, then copy the full calendar.google.com URL.',
    };
  }

  if (parsed.hostname !== 'calendar.google.com') {
    // Some other provider's URL. Pass it through: this normaliser only knows
    // about Google, and guessing at anything else would be worse than nothing.
    return { url: trimmed, isEmbeddable: true };
  }

  if (parsed.pathname.startsWith(NON_EMBED_PATH)) {
    parsed.pathname = EMBED_PATH + parsed.pathname.slice(NON_EMBED_PATH.length);
  }

  // `gv=true` asks for the embedded chrome rather than the full Calendar UI.
  parsed.searchParams.set('gv', 'true');

  return { url: parsed.toString(), isEmbeddable: true };
}
