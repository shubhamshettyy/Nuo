import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export function useBackendHealth() {
  const [status, setStatus] = useState(USE_MOCK_DATA ? 'mock' : 'checking'); // mock | checking | ok | down
  const [latencyMs, setLatencyMs] = useState(null);

  useEffect(() => {
    if (USE_MOCK_DATA) return;

    let isMounted = true;

    const check = async () => {
      const started = performance.now();
      try {
        const res = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await res.json().catch(() => null);
        if (!isMounted) return;
        setLatencyMs(Math.round(performance.now() - started));
        setStatus('ok');
      } catch {
        if (!isMounted) return;
        setLatencyMs(null);
        setStatus('down');
      }
    };

    check();
    const id = setInterval(check, 30000);
    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, []);

  return { status, latencyMs, apiBaseUrl: API_BASE_URL };
}

