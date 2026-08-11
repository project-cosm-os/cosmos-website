import { INTEGRATIONS } from '../../config/integrations';
import { netlifyForms } from './netlify';
import { hubspotForms } from './hubspot';
import type { FormProvider } from './types';

export type { DemoRequest, FormProvider, SubmitResult } from './types';

/** Selected but unusable, and honest about it rather than silently dropping posts. */
const noProvider: FormProvider = {
  id: 'none',
  isConfigured: false,
  async submit() {
    return { ok: false, reason: 'No form provider is configured' };
  },
};

export function formProvider(): FormProvider {
  switch (INTEGRATIONS.forms.provider) {
    case 'netlify':
      return netlifyForms();
    case 'hubspot':
      return hubspotForms();
    default:
      return noProvider;
  }
}
