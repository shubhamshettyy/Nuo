import { useState, useEffect } from 'react';
import { mockCountries } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export function useGlobeData() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        if (isMounted) {
          setCountries(mockCountries);
          setLoading(false);
          setError(null);
        }
        return;
      }

      // Otherwise fetch from API
      try {
        const response = await fetch(`${API_BASE_URL}/api/globe`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (isMounted) {
          setCountries(data.countries || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchData();

    // Poll every 30 seconds for updates (skip if using mock data)
    const interval = USE_MOCK_DATA ? null : setInterval(fetchData, 30000);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, []);

  return { countries, loading, error };
}
