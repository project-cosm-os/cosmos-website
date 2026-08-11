import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MessageSquare } from 'lucide-react';

import { BRAND } from '../config/brand-identity';
import SEO, { breadcrumbSchema } from '../components/shared/SEO';
import Scheduler from '../components/integrations/Scheduler';
import DemoForm from '../components/integrations/DemoForm';
import GridBackground from '../components/shared/GridBackground';

type Tab = 'schedule' | 'message';

const BookDemo: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('schedule');

  return (
    <div className="relative overflow-hidden">
      <SEO
        title={t('bookDemo.title')}
        description="Book a thirty-minute walkthrough of CosmOS: the settlement reconciliation, the leakage findings and the journal entries behind them, end to end."
        path="/book-demo"
        jsonLd={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Book a demo', path: '/book-demo' },
        ])}
      />
      <GridBackground />

      <div className="relative py-24 md:py-32" style={{ zIndex: 1 }}>

        {/*
          ── Header ──

          CSS animation rather than framer-motion, deliberately. A motion
          `initial={{opacity:0}}` is serialised into the prerendered HTML as an
          inline style, so this h1 shipped invisible and only appeared once
          React hydrated. `.animate-in` is a keyframe on a class: it runs on the
          first paint and leaves nothing hidden in the markup.
        */}
        <div className="max-w-2xl mx-auto text-center px-6 mb-6 animate-in">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
            {t('bookDemo.title')}
          </h1>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            {t('bookDemo.subtitle', { productName: BRAND.productName })}
          </p>
        </div>

        {/* ── Tab Switcher ── */}
        <div className="flex justify-center px-6 mb-8">
          <div className="flex rounded-[var(--radius-lg)] bg-[var(--bg-card)] border border-[var(--border-default)] p-1">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center justify-center gap-2 py-2.5 px-5 rounded-[var(--radius-md)] text-sm font-medium transition-all cursor-pointer border-none ${
                activeTab === 'schedule'
                  ? 'bg-[var(--action-bg)] text-[var(--action-fg)] shadow-[var(--shadow-sm)]'
                  : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Calendar size={15} />
              {t('bookDemo.tabSchedule')}
            </button>
            <button
              onClick={() => setActiveTab('message')}
              className={`flex items-center justify-center gap-2 py-2.5 px-5 rounded-[var(--radius-md)] text-sm font-medium transition-all cursor-pointer border-none ${
                activeTab === 'message'
                  ? 'bg-[var(--action-bg)] text-[var(--action-fg)] shadow-[var(--shadow-sm)]'
                  : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <MessageSquare size={15} />
              {t('bookDemo.tabMessage')}
            </button>
          </div>
        </div>

        {/* ── Two-column content ── */}
        <div className="max-w-5xl mx-auto px-6">
            {activeTab === 'schedule' ? (
              <div key="schedule" className="tab-panel flex flex-col gap-8">
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
                    {t('bookDemo.calendlyTitle')}
                  </h2>
                  <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                    {t('bookDemo.calendlyDescription', { productName: BRAND.productName })}
                  </p>
                </div>
                <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-4 md:p-6">
                  <Scheduler />
                </div>
              </div>
            ) : (
              <div
                key="message"
                className="tab-panel grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start"
              >
                <div className="lg:col-span-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
                    {t('bookDemo.formTitle')}
                  </h2>
                  <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                    {t('bookDemo.formDescription')}
                  </p>
                </div>
                <div className="lg:col-span-3 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 md:p-8">
                  <DemoForm />
                </div>
              </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default BookDemo;
