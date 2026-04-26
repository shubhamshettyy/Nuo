import { useState, useEffect } from 'react';
import { mockAlerts } from '../data/mockData';

const API_BASE_URL  = import.meta.env.VITE_API_BASE_URL  || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export function useAlerts() {
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetch_ = async () => {
      if (USE_MOCK_DATA) {
        if (isMounted) { setAlerts(mockAlerts); setLoading(false); }
        return;
      }
      try {
        const res  = await fetch(`${API_BASE_URL}/api/alerts/latest`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (isMounted) { setAlerts(data.alerts || []); setLoading(false); }
      } catch {
        if (isMounted) { setAlerts(mockAlerts); setLoading(false); }
      }
    };
    fetch_();
    const id = USE_MOCK_DATA ? null : setInterval(fetch_, 15000);
    return () => { isMounted = false; if (id) clearInterval(id); };
  }, []);

  return { alerts, loading, error };
}
