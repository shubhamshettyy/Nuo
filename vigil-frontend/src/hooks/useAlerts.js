import { useState, useEffect } from 'react';
import { mockAlerts } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAlerts = async () => {
      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        if (isMounted) {
          setAlerts(mockAlerts);
          setLoading(false);
          setError(null);
        }
        return;
      }

      // Otherwise fetch from API
      try {
        const response = await fetch(`${API_BASE_URL}/api/alerts/latest`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (isMounted) {
          setAlerts(data.alerts || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchAlerts();

    // Poll every 15 seconds for new alerts (skip if using mock data)
    const interval = USE_MOCK_DATA ? null : setInterval(fetchAlerts, 15000);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, []);

  return { alerts, loading, error };
}
