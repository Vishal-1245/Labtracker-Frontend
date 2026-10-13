import { useEffect, useRef } from 'react';

const useAutoRefresh = (refresh, intervalMs = 15000, refreshKey) => {
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    const runRefresh = () => {
      if (document.visibilityState === 'visible') {
        refreshRef.current();
      }
    };

    runRefresh();
    const intervalId = window.setInterval(runRefresh, intervalMs);
    window.addEventListener('focus', runRefresh);
    document.addEventListener('visibilitychange', runRefresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', runRefresh);
      document.removeEventListener('visibilitychange', runRefresh);
    };
  }, [intervalMs, refreshKey]);
};

export default useAutoRefresh;