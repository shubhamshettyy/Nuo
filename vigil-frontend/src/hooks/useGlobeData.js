import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export function useGlobeData() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCountries() {
      if (USE_MOCK_DATA) {
        // Use mock data
        try {
          const { mockCountries } = await import('../data/mockData');
          setCountries(mockCountries);
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
        return;
      }
      try {
        const res  = await fetch(`${API_BASE_URL}/api/globe`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (isMounted) {
          // Find max index_value to normalise to 0-100
          const raw = data.countries || [];
          const maxVal = Math.max(...raw.map(c => c.index_value || 0), 1);

          const normalised = raw.map(c => ({
            ...c,
            iso3:          c.iso3,
            index_value:   Math.min(Math.round((c.index_value / maxVal) * 100), 100),
            raw_index:     c.index_value,
            article_count: c.article_count_filtered,
          }));
          setCountries(normalised);
          setLoading(false);
        }
      } catch {
        if (isMounted) { setCountries(mockCountries); setLoading(false); setError(null); }
      }
    };

    fetchData();
    const interval = USE_MOCK_DATA ? null : setInterval(fetchData, 30000);
    return () => { isMounted = false; if (interval) clearInterval(interval); };
  }, []);

  return { countries, loading, error };
}