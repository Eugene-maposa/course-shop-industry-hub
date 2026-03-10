import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const getVisitorId = () => {
  let id = localStorage.getItem('visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('visitor_id', id);
  }
  return id;
};

export const useVisitTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('site_visits').insert({
          visitor_id: getVisitorId(),
          page_path: location.pathname,
          user_id: user?.id || null,
          user_agent: navigator.userAgent,
        });
      } catch (e) {
        // Silent fail - don't break app for tracking
      }
    };
    trackVisit();
  }, [location.pathname]);
};
