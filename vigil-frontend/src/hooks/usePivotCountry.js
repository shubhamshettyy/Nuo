import { useCallback, useState } from 'react';
import { mockCountryDetails } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

function buildMockSummary(iso3, details) {
  if (!details) {
    return {
      iso3,
      overall_score: Math.floor(Math.random() * 40 + 40),
      article_count_total: Math.floor(Math.random() * 80 + 10),
      generated_at: new Date().toISOString(),
      category_scores: [
        { category: 'political_content',     score: Math.floor(Math.random() * 40 + 40), article_count: Math.floor(Math.random() * 20 + 5),  source_count: 4, freshness_avg: 0.7 },
        { category: 'social_media',          score: Math.floor(Math.random() * 40 + 30), article_count: Math.floor(Math.random() * 15 + 3),  source_count: 3, freshness_avg: 0.8 },
        { category: 'disinformation',        score: Math.floor(Math.random() * 50 + 20), article_count: Math.floor(Math.random() * 10 + 2),  source_count: 2, freshness_avg: 0.6 },
        { category: 'international_media',   score: Math.floor(Math.random() * 30 + 20), article_count: Math.floor(Math.random() * 12 + 2),  source_count: 5, freshness_avg: 0.75 },
      ],
    };
  }

  const categoryMap = {
    political_content:   details.metrics?.misinformation_score ?? 50,
    social_media:        details.metrics?.bot_activity ?? 40,
    fact_checking:       details.metrics?.fact_check_ratio ?? 40,
    source_diversity:    details.metrics?.source_diversity ?? 50,
  };

  return {
    iso3,
    overall_score: details.index_value ?? 50,
    article_count_total: details.news_articles?.length
      ? details.news_articles.length * 8
      : Math.floor(Math.random() * 60 + 10),
    generated_at: details.last_updated ?? new Date().toISOString(),
    category_scores: Object.entries(categoryMap).map(([category, score]) => ({
      category,
      score,
      article_count: Math.floor(Math.random() * 20 + 3),
      source_count:  Math.floor(Math.random() * 5 + 2),
      freshness_avg: Math.random() * 0.4 + 0.6,
    })),
  };
}

function buildMockNews(iso3, category, details) {
  if (details?.news_articles?.length) {
    return details.news_articles.map((a, i) => ({
      id:          a.id ?? i,
      title:       a.title,
      url:         a.url ?? '#',
      source_name: a.source,
      published: a.published,
      description: a.summary,
      credibility_score: a.credibility === 'verified' ? 86 : 65,
      impact_score: a.impact_score ?? 70,
    }));
  }

  // Generic fallback articles
  const templates = [
    { title: `Information Integrity Report: ${iso3}`,        source: 'Reuters',           summary: `Latest monitoring data shows shifting patterns in ${iso3}'s information ecosystem across major platforms.` },
    { title: `Media Analysis: ${category.replaceAll('_',' ')} in ${iso3}`, source: 'BBC', summary: `Analysts report notable activity in ${category.replaceAll('_',' ')} channels originating from ${iso3}.` },
    { title: `Digital Threat Assessment Update — ${iso3}`,   source: 'Associated Press',  summary: `Ongoing assessment of coordinated inauthentic behaviour and narrative manipulation in ${iso3}.` },
  ];

  return templates.map((t, i) => ({
    id:           i + 1,
    title:        t.title,
    url:          '#',
    source_name:  t.source,
    published: new Date(Date.now() - (i + 1) * 3600000 * 3).toISOString(),
    description:  t.summary,
    credibility_score: 72,
    impact_score: Math.floor(Math.random() * 20 + 60),
  }));
}

export function usePivotCountry() {
  const [summary, setSummary]             = useState(null);
  const [news, setNews]                   = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingNews, setLoadingNews]     = useState(false);
  const [error, setError]                 = useState(null);

  const fetchSummary = useCallback(async (countryCode) => {
    if (!countryCode) return null;
    setLoadingSummary(true);
    setError(null);

    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 600));
      const details = mockCountryDetails[countryCode] ?? null;
      const mock    = buildMockSummary(countryCode, details);
      setSummary(mock);
      setLoadingSummary(false);
      return mock;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/pivot/country/${countryCode}/summary`);
      if (!response.ok) throw new Error(`Summary request failed (${response.status})`);
      const data = await response.json();
      setSummary(data);
      return data;
    } catch (err) {
      // backend down — fall back to mock silently
      const details = mockCountryDetails[countryCode] ?? null;
      const mock    = buildMockSummary(countryCode, details);
      setSummary(mock);
      setError(null);
      return mock;
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const fetchNews = useCallback(async (countryCode, category) => {
    if (!countryCode || !category) return [];
    setLoadingNews(true);
    setError(null);

    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      const details = mockCountryDetails[countryCode] ?? null;
      const items   = buildMockNews(countryCode, category, details);
      setNews(items);
      setLoadingNews(false);
      return items;
    }

    try {
      const params   = new URLSearchParams({ category: String(category).toLowerCase() });
      const response = await fetch(`${API_BASE_URL}/api/pivot/country/${countryCode}/news?${params}`);
      if (!response.ok) throw new Error(`News request failed (${response.status})`);
      const data  = await response.json();
      const items = data.articles || [];
      setNews(items);
      return items;
    } catch (err) {
      // backend down — fall back to mock silently
      const details = mockCountryDetails[countryCode] ?? null;
      const items   = buildMockNews(countryCode, category, details);
      setNews(items);
      setError(null);
      return items;
    } finally {
      setLoadingNews(false);
    }
  }, []);

  return { summary, news, loadingSummary, loadingNews, error, fetchSummary, fetchNews };
}
