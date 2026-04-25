import { useState, useCallback } from 'react';
import { mockBriefs } from '../data/mockData';
import { getSeverityLabel } from '../utils/colorScale';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export function useBrief() {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBrief = useCallback(async (iso3, countryData = null) => {
    if (!iso3) return;

    setLoading(true);
    setError(null);

    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const briefText = mockBriefs[iso3] || 
        mockBriefs.default.replace('{severity}', 
          countryData ? getSeverityLabel(countryData.index_value).toLowerCase() : 'moderate'
        );

      setBrief({
        iso3,
        brief_text: briefText,
        audio_url: null,
        timestamp: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    try {
      const response = await fetch(`${API_BASE_URL}/api/country/${iso3}/brief`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setBrief(data);
    } catch (err) {
      setError(err.message);
      setBrief(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearBrief = useCallback(() => {
    setBrief(null);
    setError(null);
  }, []);

  return { brief, loading, error, fetchBrief, clearBrief };
}
