import { useEffect, useRef } from 'react';
import { useAnalytics } from '../providers/AnalyticsProvider';

const DEPTH_THRESHOLDS = [25, 50, 75, 100] as const;

export function useScrollDepth(contentId: string, properties?: Record<string, unknown>) {
  const { trackEvent } = useAnalytics();
  const firedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    firedRef.current = new Set();
  }, [contentId]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const percent = Math.round((scrollTop / docHeight) * 100);

      for (const threshold of DEPTH_THRESHOLDS) {
        if (percent >= threshold && !firedRef.current.has(threshold)) {
          firedRef.current.add(threshold);
          trackEvent('scroll_depth', {
            depth: threshold,
            content_id: contentId,
            ...properties,
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [contentId, properties, trackEvent]);
}
