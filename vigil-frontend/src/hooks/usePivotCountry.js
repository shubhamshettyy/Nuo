import { useCallback, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Builds a summary object from agent-stored category docs so CountryPanel
// gets the same shape it expects from the Currents /summary endpoint.
function buildSummaryFromAgentDocs(docs) {
  if (!docs.length) return null;
  const category_scores = docs.map((doc) => ({
    category: doc.category,
    score: doc.final_score || 0,
    article_count: doc.articles?.length || doc.links?.length || 0,
    source_count: new Set((doc.articles || []).map((a) => a.source_name).filter(Boolean)).size,
    freshness_avg: 1.0,
  }));
  const total = category_scores.reduce((s, c) => s + c.article_count, 0);
  const overall =
    total > 0
      ? category_scores.reduce((s, c) => s + c.score * c.article_count, 0) / total
      : category_scores.reduce((s, c) => s + c.score, 0) / category_scores.length;
  return {
    overall_score: Math.round(overall * 100) / 100,
    article_count_total: total,
    category_scores,
    generated_at: docs[0]?.updated_at || new Date().toISOString(),
    source: 'agent',
  };
}

// Converts an agent article doc into the shape CountryPanel's news list expects.
function normalizeAgentArticles(doc) {
  return (doc.articles || []).map((a) => ({
    id: a.url,
    title: a.title || '',
    url: a.url || '#',
    description: a.content ? a.content.slice(0, 200) : doc.summary || '',
    source_name: a.source_name || null,
    published: a.published || null,
  }));
}

export function usePivotCountry() {
  const [summary, setSummary] = useState(null);
  const [news, setNews] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [agentDocs, setAgentDocs] = useState([]);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async (countryCode) => {
    if (!countryCode) return null;
    setLoadingSummary(true);
    setError(null);

    // 1. Try agent-stored data first
    try {
      const agentRes = await fetch(`${API_BASE_URL}/api/country/${countryCode}/agent-news`);
      if (agentRes.ok) {
        const agentData = await agentRes.json();
        const docs = agentData.categories || [];
        if (docs.length > 0) {
          setAgentDocs(docs);
          const built = buildSummaryFromAgentDocs(docs);
          setSummary(built);
          setLoadingSummary(false);
          return built;
        }
      }
    } catch (_) {
      // fall through to Currents
    }

    // 2. Fall back to live Currents API
    try {
      const response = await fetch(`${API_BASE_URL}/api/pivot/country/${countryCode}/summary`);
      if (!response.ok) throw new Error(`Summary request failed (${response.status})`);
      const data = await response.json();
      setSummary(data);
      setAgentDocs([]);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load summary');
      setSummary(null);
      return null;
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const fetchNews = useCallback(
    async (countryCode, category) => {
      if (!countryCode || !category) return [];
      setLoadingNews(true);
      setError(null);

      // 1. If we already have agent docs for this country, serve from them
      if (agentDocs.length > 0) {
        const doc = agentDocs.find(
          (d) => d.category?.toLowerCase() === String(category).toLowerCase()
        );
        const articles = doc ? normalizeAgentArticles(doc) : [];
        setNews(articles);
        setLoadingNews(false);
        return articles;
      }

      // 2. Fall back to live Currents API
      try {
        const params = new URLSearchParams({ category: String(category).toLowerCase() });
        const response = await fetch(
          `${API_BASE_URL}/api/pivot/country/${countryCode}/news?${params.toString()}`
        );
        if (!response.ok) throw new Error(`News request failed (${response.status})`);
        const data = await response.json();
        const items = data.articles || [];
        setNews(items);
        return items;
      } catch (err) {
        setError(err.message || 'Failed to load news');
        setNews([]);
        return [];
      } finally {
        setLoadingNews(false);
      }
    },
    [agentDocs]
  );

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
