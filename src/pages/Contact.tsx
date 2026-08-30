import React from 'react';
import { useTranslation } from 'react-i18next';

import SEO, { breadcrumbSchema } from '../components/shared/SEO';
import DemoForm from '../components/integrations/DemoForm';
import GridBackground from '../components/shared/GridBackground';

/**
 * Contact.
 *
 * ── A FORM, AND DELIBERATELY NO ADDRESS ───────────────────────────────────
 *
 * No email address, no phone number, no postal address. Not an omission: an
 * address published on a page is an address scraped within the week, and the
 * form reaches the same people.
 *
 * `DemoForm` already refuses to know who receives it, and an earlier version of
 * it fell back to a `mailto:` built from a contact address, which compiled that
 * address into the bundle for anyone to read. That fallback was removed for
 * this reason. Reusing the component here keeps that property rather than
 * rebuilding it and rediscovering the same mistake.
 *
 * ── WHY IT IS SEPARATE FROM /book-demo ────────────────────────────────────
 *
 * Book a demo is a funnel: it opens on a scheduler and asks for a slot. That is
 * the wrong shape for somebody who wants to ask about data handling, request
 * deletion, or report a problem, and it is the wrong shape for a reviewer
 * checking that the company behind an application can be reached at all.
 *
 * The privacy policy points here for data requests, so this page has to answer
 * that need without a calendar in the way.
 */
const Contact: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden">
      <SEO
        title={t('contact.title')}
        description={t('contact.subtitle')}
        path="/contact"
        jsonLd={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: t('contact.title'), path: '/contact' },
        ])}
      />
      <GridBackground />

      <div className="relative py-24 md:py-32" style={{ zIndex: 1 }}>
        <div className="max-w-2xl mx-auto px-6">
          <header className="text-center mb-10 animate-in">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
              {t('contact.title')}
            </h1>
            <p className="mt-4 text-lg text-[var(--text-secondary)]">{t('contact.subtitle')}</p>
          </header>

          <div className="rounded-[var(--radius-lg)] bg-[var(--bg-card)] border border-[var(--border-default)] p-6 md:p-8">
            <DemoForm source="contact" messageLabelKey="contact.formMessage" />
          </div>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            {t('contact.privacyNote')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
