import { INTEGRATIONS } from '../../config/integrations';
import type { DemoRequest, FormProvider, SubmitResult } from './types';

/**
 * Netlify Forms.
 *
 * ── HOW NETLIFY ACTUALLY DETECTS A FORM ───────────────────────────────────
 *
 * Netlify's build step parses the deployed HTML for a form carrying
 * `data-netlify="true"`. It never runs your JavaScript, so a form that only
 * exists once React has mounted is invisible to it and every submission 404s.
 *
 * This site prerenders every route to static HTML, so the form is in the file
 * on disk and detection works. That is not luck, it is the one hard
 * requirement, and `check:netlify-form` asserts it on every build so a change
 * to the prerender setup cannot silently break submissions.
 *
 * ── WHY THE POST LOOKS LIKE A 1998 FORM POST ──────────────────────────────
 *
 * Netlify's endpoint accepts url-encoded bodies with a `form-name` field
 * naming which form this is. Not JSON. Posting JSON returns a 404 that reads
 * like a routing problem and is not one.
 *
 * ── WHERE THE EMAIL IS ────────────────────────────────────────────────────
 *
 * Nowhere near this file. Submissions go to Netlify; the notification address
 * is set in the Netlify dashboard. Nothing in the repository or the built
 * bundle names the recipient, which is the point.
 */
export function netlifyForms(): FormProvider {
  const formName = INTEGRATIONS.forms.netlifyFormName;

  return {
    id: 'netlify',
    isConfigured: true,

    async submit(request: DemoRequest): Promise<SubmitResult> {
      const body = new URLSearchParams({
        'form-name': formName,
        name: request.name,
        email: request.email,
        company: request.company,
        message: request.message,
      });

      try {
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        });

        if (!response.ok) {
          return { ok: false, reason: `Netlify returned ${response.status}` };
        }
        return { ok: true };
      } catch (error) {
        return { ok: false, reason: (error as Error).message };
      }
    },
  };
}
