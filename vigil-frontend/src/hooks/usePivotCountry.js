import { useCallback, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function usePivotCountry() {
  const [summary, setSummary] = useState(null);
  const [news, setNews] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async (countryCode) => {
    if (!countryCode) return null;
    setLoadingSummary(true);
    setError(null);
    try {
      console.log('[Pivot][Frontend][Summary][Request]', { countryCode });
      const response = await fetch(`${API_BASE_URL}/api/pivot/country/${countryCode}/summary`);
      if (!response.ok) throw new Error(`Summary request failed (${response.status})`);
      const data = await response.json();
      console.log('[Pivot][Frontend][Summary][Response]', data);
      setSummary(data);
      return data;
    } catch (err) {
      console.error('[Pivot][Frontend][Summary][Error]', err);
      setError(err.message || 'Failed to load summary');
      setSummary(null);
      return null;
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const fetchNews = useCallback(async (countryCode, category) => {
    if (!countryCode || !category) return [];
    setLoadingNews(true);
    setError(null);
    try {
      const params = new URLSearchParams({ category: String(category).toLowerCase() });
      console.log('[Pivot][Frontend][News][Request]', { countryCode, category: String(category).toLowerCase() });
      const response = await fetch(
        `${API_BASE_URL}/api/pivot/country/${countryCode}/news?${params.toString()}`
      );
      if (!response.ok) throw new Error(`News request failed (${response.status})`);
      const data = await response.json();
      console.log('[Pivot][Frontend][News][Response]', data);
      const items = data.articles || [];
      setNews(items);
      return items;
    } catch (err) {
      console.error('[Pivot][Frontend][News][Error]', err);
      setError(err.message || 'Failed to load news');
      setNews([]);
      return [];
    } finally {
      setLoadingNews(false);
    }
  }, []);

  return {
    summary,
    news,
    loadingSummary,
    loadingNews,
    error,
    fetchSummary,
    fetchNews,
  };
}
