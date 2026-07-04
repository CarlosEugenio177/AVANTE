import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export const trackEvent = (event: string, metadata?: any) => {
  // Fire and forget
  apiFetch('/analytics', {
    method: 'POST',
    body: JSON.stringify({ event, metadata })
  }).catch(console.error); // Ignore analytics errors silently
};

export function useAnalytics() {
  const location = useLocation();
  const startTimeRef = useRef(Date.now());

  // Rastrear tempo gasto por tela
  useEffect(() => {
    startTimeRef.current = Date.now();
    trackEvent('page_view', { page: location.pathname });

    return () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 2) {
        trackEvent('page_leave', { page: location.pathname, timeSpentSeconds: timeSpent });
      }
    };
  }, [location.pathname]);

  return { trackEvent };
}
