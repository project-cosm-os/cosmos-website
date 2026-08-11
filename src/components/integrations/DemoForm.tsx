import React, { useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';

import { INTEGRATIONS } from '../../config/integrations';
import { formProvider, type DemoRequest } from '../../integrations/forms';
import { useAnalytics } from '../../providers/AnalyticsProvider';
import Button from '../shared/Button';

/**
 * The demo request form.
 *
 * ── IT DOES NOT KNOW WHO RECEIVES IT ──────────────────────────────────────
 *
 * No provider name, no endpoint, no recipient address. It collects four fields
 * and hands them to whatever `formProvider()` returns. The previous version
 * fell back to a `mailto:` built from the contact address, which compiled that
 * address into the bundle for any scraper to read; that fallback is gone.
 *
 * ── THE MARKUP IS ALSO THE NETLIFY CONTRACT ───────────────────────────────
 *
 * `data-netlify`, the `form-name` hidden input and the `name` attribute on
 * every field are not decoration. Netlify's build step parses the deployed
 * HTML for exactly these, and it never runs JavaScript, so they have to be in
 * the prerendered file rather than added at runtime. `check:netlify-form`
 * asserts they survive into `dist/`.
 *
 * They cost nothing under a different provider, which is why they stay put
 * rather than being rendered conditionally: a form that only becomes
 * submittable after someone remembers to flip a flag is worse than four inert
 * attributes.
 */
const DemoForm: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics();
  const provider = useMemo(() => formProvider(), []);

  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [fields, setFields] = useState<DemoRequest>({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [honeypot, setHoneypot] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Anything in the decoy means a bot. Report success and drop it: telling a
    // bot it failed only teaches it to try again differently.
    if (honeypot) {
      setState('success');
      return;
    }

    setState('submitting');
    const result = await provider.submit(fields);

    if (result.ok) {
      trackEvent('form_submitted', { form: 'demo-request', provider: provider.id });
      setState('success');
    } else {
      // The reason goes to the console, not the visitor: it names the provider
      // and the status, which is useful to us and meaningless to them.
      console.error('[form] submission failed:', result.reason);
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <div className={`flex flex-col items-center gap-3 py-10 text-center ${className}`}>
        <CheckCircle size={32} className="text-[var(--status-success)]" />
        <p className="text-[15px] text-[var(--text-primary)]">{t('bookDemo.formSuccess')}</p>
      </div>
    );
  }

  const inputClass =
    'w-full px-4 py-3 rounded-[var(--radius-md)] bg-[var(--bg-input)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-glow)] transition-all';
  const labelClass = 'mb-1.5 block text-[13px] font-medium text-[var(--text-primary)]';

  return (
    <form
      name={INTEGRATIONS.forms.netlifyFormName}
      method="POST"
      data-netlify="true"
      netlify-honeypot="website"
      onSubmit={handleSubmit}
      className={`flex flex-col gap-4 ${className}`}
    >
      <input type="hidden" name="form-name" value={INTEGRATIONS.forms.netlifyFormName} />

      {/*
        Honeypot. A bot fills every field it can see in the DOM; a human never
        sees this one, so anything in it means the submission is automated.
        The name matches `netlify-honeypot` above so Netlify drops it too.
      */}
      <div aria-hidden="true" className="absolute -z-10 h-0 w-0 overflow-hidden opacity-0" tabIndex={-1}>
        {/* i18n-exempt: bait, not copy. No human reads it, and the word is
            chosen because it is what bots look for. */}
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          name="website"
          autoComplete="off"
          tabIndex={-1}
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="name">
          {t('bookDemo.formName')}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={inputClass}
          placeholder={t('bookDemo.formNamePlaceholder')}
          value={fields.name}
          onChange={(e) => setFields({ ...fields, name: e.target.value })}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="email">
          {t('bookDemo.formEmail')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
          placeholder={t('bookDemo.formEmailPlaceholder')}
          value={fields.email}
          onChange={(e) => setFields({ ...fields, email: e.target.value })}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="company">
          {t('bookDemo.formCompany')}
        </label>
        <input
          id="company"
          name="company"
          type="text"
          required
          autoComplete="organization"
          className={inputClass}
          placeholder={t('bookDemo.formCompanyPlaceholder')}
          value={fields.company}
          onChange={(e) => setFields({ ...fields, company: e.target.value })}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="message">
          {t('bookDemo.formMessage')}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className={inputClass}
          placeholder={t('bookDemo.formMessagePlaceholder')}
          value={fields.message}
          onChange={(e) => setFields({ ...fields, message: e.target.value })}
        />
      </div>

      {state === 'error' && (
        <p className="text-[13px]" style={{ color: 'var(--status-error)' }}>
          {t('bookDemo.formError')}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={state === 'submitting'}>
        {state === 'submitting' ? t('bookDemo.formSubmitting') : t('bookDemo.formSubmit')}
      </Button>
    </form>
  );
};

export default DemoForm;
