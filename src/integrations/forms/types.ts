/**
 * The seam between the demo form and whatever collects its submissions.
 *
 * One function, one shape of data, one result. A provider is a file that
 * implements `submit`; adding Formspree, Basin, a Netlify Function of our own
 * or a CRM webhook means adding a file and a name to the union, and nothing in
 * the form component changes.
 *
 * The fields are the fields the form actually asks for. Deliberately not a
 * generic `Record<string, string>`: a provider that needs to map names onto a
 * CRM's schema should fail to compile when a field is renamed, rather than
 * quietly posting an empty column.
 */
export interface DemoRequest {
  name: string;
  email: string;
  company: string;
  message: string;
}

export type SubmitResult = { ok: true } | { ok: false; reason: string };

export interface FormProvider {
  /** Shown in dev tooling and in the check that a provider is configured. */
  readonly id: string;

  /**
   * False when the provider is selected but not usable yet, for example
   * HubSpot without a portal id. The form renders a plain notice instead of
   * pretending to accept a submission it is going to drop.
   */
  readonly isConfigured: boolean;

  submit(request: DemoRequest): Promise<SubmitResult>;
}
