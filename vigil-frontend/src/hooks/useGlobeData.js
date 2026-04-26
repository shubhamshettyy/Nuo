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

      // Fetch real data from backend
      try {
        const response = await fetch(`${API_BASE_URL}/api/globe`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch countries: ${response.status}`);
        }

        const data = await response.json();
        
        // Transform backend data to frontend format
        const transformedCountries = (data.countries || []).map(country => ({
          iso3: country.iso3,
          name: country.name,
          index_value: country.index_value,
          latitude: country.latitude,
          longitude: country.longitude,
        }));

        console.log(`[useGlobeData] Loaded ${transformedCountries.length} countries from backend`);
        setCountries(transformedCountries);
        setLoading(false);
      } catch (err) {
        console.error('[useGlobeData] Error fetching countries:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchCountries();
  }, []);

  return { countries, loading, error };
}