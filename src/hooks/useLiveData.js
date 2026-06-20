import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Re-fetch store data when user navigates back to a page or returns to the tab.
 * Ensures admin edits/deletes show on the UI without a hard refresh.
 */
export function useLiveData(fetchFn, deps = []) {
  const location = useLocation();

  useEffect(() => {
    fetchFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, ...deps]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchFn();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}