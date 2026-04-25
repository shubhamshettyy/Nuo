import { useState, useCallback } from 'react';
import { mockCountryDetails } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export function useCountryDetails() {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetails = useCallback(async (iso3) => {
    if (!iso3) return;

    setLoading(true);
    setError(null);

    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const countryDetails = mockCountryDetails[iso3];
      
      if (countryDetails) {
        setDetails(countryDetails);
      } else {
        // Generate default details for countries without specific data
        const basicCountry = {
          iso3,
          name: iso3, // Will be overridden by actual name from country list
          index_value: Math.random() * 100,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          change_24h: (Math.random() - 0.5) * 10,
          last_updated: new Date().toISOString(),
          metrics: {
            misinformation_score: Math.floor(Math.random() * 100),
            bot_activity: Math.floor(Math.random() * 100),
            fact_check_ratio: Math.floor(Math.random() * 100),
            source_diversity: Math.floor(Math.random() * 100)
          },
          trending_topics: [],
          news_articles: []
        };
        setDetails(basicCountry);
      }
      
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    try {
      const response = await fetch(`${API_BASE_URL}/api/country/${iso3}/details`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDetails(data);
    } catch (err) {
      setError(err.message);
      setDetails(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearDetails = useCallback(() => {
    setDetails(null);
    setError(null);
  }, []);

  return { details, loading, error, fetchDetails, clearDetails };
}