import { useEffect, useRef } from 'react';
import { useAnalytics } from '../providers/AnalyticsProvider';

export function useTimeOnPage(contentId: string, properties?: Record<string, unknown>) {
  const { trackEvent } = useAnalytics();
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();

    return () => {
      const seconds = Math.round((Date.now() - startRef.current) / 1000);
      if (seconds >= 3) {
        trackEvent('time_on_page', {
          content_id: contentId,
          duration_seconds: seconds,
          ...properties,
        });
      }
    };
  }, [contentId, properties, trackEvent]);
}
