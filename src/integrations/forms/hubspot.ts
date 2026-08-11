import { INTEGRATIONS } from '../../config/integrations';
import type { DemoRequest, FormProvider, SubmitResult } from './types';

/**
 * HubSpot forms.
 *
 * Kept as a working alternative rather than deleted, because the point of the
 * provider seam is that swapping back is a variable rather than a rewrite.
 *
 * The portal and form ids are public identifiers: they appear in HubSpot's own
 * embed snippet on every site that uses it, so shipping them in the bundle
 * gives nothing away. They are not credentials.
 */
export function hubspotForms(): FormProvider {
  const { portalId, formId } = INTEGRATIONS.forms.hubspot;

  return {
    id: 'hubspot',
    isConfigured: Boolean(portalId && formId),

    async submit(request: DemoRequest): Promise<SubmitResult> {
      if (!portalId || !formId) {
        return { ok: false, reason: 'HubSpot portal or form id is not set' };
      }

      const [firstname, ...rest] = request.name.trim().split(/\s+/);

      try {
        const response = await fetch(
          `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: [
                { name: 'firstname', value: firstname ?? '' },
                { name: 'lastname', value: rest.join(' ') },
                { name: 'email', value: request.email },
                { name: 'company', value: request.company },
                { name: 'message', value: request.message },
              ],
            }),
          },
        );

        if (!response.ok) {
          return { ok: false, reason: `HubSpot returned ${response.status}` };
        }
        return { ok: true };
      } catch (error) {
        return { ok: false, reason: (error as Error).message };
      }
    },
  };
}
