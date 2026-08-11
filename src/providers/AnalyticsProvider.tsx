import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { INTEGRATIONS } from '../config/integrations';
import { type CookiePreferences } from '../hooks/useCookieConsent';

interface AnalyticsContextType {
  trackEvent: (name: string, properties?: Record<string, unknown>) => void;
  trackPageView: (path: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

const STORAGE_KEY = 'cosmos-cookie-consent';

function getConsent(): CookiePreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { necessary: true, analytics: false, marketing: false };
    return JSON.parse(stored) as CookiePreferences;
  } catch {
    return { necessary: true, analytics: false, marketing: false };
  }
}

function initGA4(measurementId: string) {
  if (document.querySelector(`script[src*="${measurementId}"]`)) return;
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) { window.dataLayer.push(args); }
  gtag('js', new Date());
  gtag('config', measurementId);
  window.gtag = gtag;
}

function initPostHog(apiKey: string, host: string) {
  if (window.__posthog) return;
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init(apiKey, {
      api_host: host,
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      capture_performance: true,
      /*
        ── EVERY INPUT IS MASKED ─────────────────────────────────────────

        This was `maskAllInputs: false` with a mask function that only covered
        `type="password"`. There is no password field on this site, so the
        exception covered nothing and the default did the work: session replays
        would have captured every character typed into the demo form, including
        the work email and the free-text "what are you trying to solve"
        message, where a prospect describes their business.

        Dormant, because no PostHog key is configured. That is what makes it
        worth fixing now rather than later: whoever adds the key will not know
        this setting is here, and the first evidence would be a replay of
        somebody's contact details.

        Recording what a form looks like is useful. Recording what people type
        into it is a different thing, and not one this site needs.
      */
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '[data-private]',
      },
      scroll_root_selector: ['#root'],
    });
    window.__posthog = posthog;
  });
}

function loadAnalytics(consent: CookiePreferences) {
  if (!INTEGRATIONS.analytics.enabled) return;

  if (consent.analytics) {
    if (INTEGRATIONS.analytics.ga4MeasurementId) {
      initGA4(INTEGRATIONS.analytics.ga4MeasurementId);
    }
    if (INTEGRATIONS.analytics.posthogApiKey) {
      initPostHog(INTEGRATIONS.analytics.posthogApiKey, INTEGRATIONS.analytics.posthogHost);
    }
  }

  /*
    Marketing consent currently gates nothing. The HubSpot page-tracking script
    that used to sit here went with the CRM: forms now post to whatever provider
    is selected, and none of them need a tracker on every page.

    The branch stays because the consent category is still offered in the
    banner, and a category that is collected but wired to nothing should be
    visible in the code rather than implied by its absence.
  */
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const [consent, setConsent] = useState<CookiePreferences>(getConsent);

  useEffect(() => {
    loadAnalytics(consent);
  }, [consent]);

  useEffect(() => {
    const handler = (e: Event) => {
      const prefs = (e as CustomEvent<CookiePreferences>).detail;
      setConsent(prefs);
    };
    window.addEventListener('cookie-consent-changed', handler);
    return () => window.removeEventListener('cookie-consent-changed', handler);
  }, []);

  const trackEvent = useCallback((name: string, properties?: Record<string, unknown>) => {
    if (!INTEGRATIONS.analytics.enabled) return;

    if (window.gtag) {
      window.gtag('event', name, properties);
    }
    if (window.__posthog) {
      window.__posthog.capture(name, properties);
    }
    if (window._hsq) {
      window._hsq.push(['trackCustomBehavioralEvent', { name, properties }]);
    }
  }, []);

  const trackPageView = useCallback((path: string) => {
    if (!INTEGRATIONS.analytics.enabled) return;

    if (window.gtag) {
      window.gtag('event', 'page_view', { page_path: path });
    }
    if (window.__posthog) {
      window.__posthog.capture('$pageview', { $current_url: path });
    }
    if (window._hsq) {
      window._hsq.push(['setPath', path]);
      window._hsq.push(['trackPageView']);
    }
  }, []);

  return (
    <AnalyticsContext.Provider value={{ trackEvent, trackPageView }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) throw new Error('useAnalytics must be used within an AnalyticsProvider');
  return context;
};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    __posthog: { capture: (event: string, properties?: Record<string, unknown>) => void } | undefined;
    _hsq: unknown[];
  }
}
