/**
 * The seam between the booking UI and whoever hosts the calendar.
 *
 * A provider supplies the URL to embed and whether it is usable. Rendering is
 * the component's job, so a new provider is a few lines rather than a new
 * React tree.
 */
export interface SchedulingProvider {
  readonly id: string;

  /** False when selected but not yet wired, so the UI can say so. */
  readonly isConfigured: boolean;

  /** What to put in the iframe. Same-origin for providers that hide the target. */
  readonly embedUrl: string;
}
