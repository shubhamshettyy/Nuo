import { useState, useEffect } from 'react';
import { mockCountries } from '../data/mockData';

const API_BASE_URL  = import.meta.env.VITE_API_BASE_URL  || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export function useGlobeData() {
  const [countries, setCountries] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (USE_MOCK_DATA) {
        if (isMounted) { setCountries(mockCountries); setLoading(false); setError(null); }
        return;
      }
      try {
        const res  = await fetch(`${API_BASE_URL}/api/globe`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (isMounted) {
          const normalised = (data.countries || []).map(c => ({
            ...c,
            iso3:        c._id || c.iso3,
            latitude:    c.lat,
            longitude:   c.lng,
            index_value: Math.min(Math.round((c.invisible_index / 20000) * 100), 100),
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
