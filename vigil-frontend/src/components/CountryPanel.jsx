import React, { useEffect, useMemo, useState } from 'react';
import { getSeverityLabel, getIndexTextColor } from '../utils/colorScale';
import { usePivotCountry } from '../hooks/usePivotCountry';
import './CountryPanel.css';

function buildIntelBrief(country, summary, selectedCategory) {
  if (!summary) return '';
  const overall = Math.round(summary.overall_score || 0);
  const topCategory = summary.category_scores?.[0];
  const selected = selectedCategory || topCategory?.category || 'general';
  const pressure = overall >= 75 ? 'critical' : overall >= 55 ? 'elevated' : 'moderate';
  return `Information ecosystem assessment for ${country.name}: ${pressure.toUpperCase()} risk posture detected with composite score ${overall}. Current monitoring prioritizes ${selected.replaceAll(
    '_',
    ' '
  )} channels. ${summary.article_count_total} articles were analyzed in the active window, with pattern concentration highest in ${
    topCategory?.category?.replaceAll('_', ' ') || 'core media'
  }. Recommend sustained watch for narrative amplification and cross-platform propagation vectors.`;
}

function sentimentFromScore(score) {
  if (score >= 75) return 'negative';
  if (score >= 50) return 'mixed';
  if (score > 0) return 'positive';
  return 'neutral';
}

function credibilityForArticle(article) {
  if (typeof article.credibility_score === 'number') return article.credibility_score;
  if (article.credibility === 'verified') return 86;
  if (article.source_name?.toLowerCase().includes('reuters')) return 88;
  return 62;
}

export default function CountryPanel({ country, onClose }) {
  const { summary, news, loadingSummary, loadingNews, error, fetchSummary, fetchNews } = usePivotCountry();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [typedBrief, setTypedBrief] = useState('');

  useEffect(() => {
    if (country) {
      fetchSummary(country.iso3);
    }
  }, [country, fetchSummary]);

  const categories = useMemo(() => {
    if (!summary?.category_scores) return [];
    return summary.category_scores.map((item) => item.category);
  }, [summary]);

  useEffect(() => {
    if (!categories.length || !country?.iso3) return;
    const nextCategory = selectedCategory && categories.includes(selectedCategory) ? selectedCategory : categories[0];
    setSelectedCategory(nextCategory);
    fetchNews(country.iso3, nextCategory);
  }, [categories, selectedCategory, country, fetchNews]);

  useEffect(() => {
    if (!country?.index_value) {
      setDisplayIndex(0);
      return undefined;
    }
    const target = Math.round(country.index_value);
    const step = Math.max(1, Math.ceil(target / 26));
    const interval = setInterval(() => {
      setDisplayIndex((prev) => {
        const next = Math.min(target, prev + step);
        if (next >= target) clearInterval(interval);
        return next;
      });
    }, 32);
    return () => clearInterval(interval);
  }, [country]);

  const metricCards = useMemo(() => {
    if (!summary) return [];
    const sourceAvg =
      summary.category_scores?.length > 0
        ? summary.category_scores.reduce((acc, item) => acc + (item.source_count || 0), 0) / summary.category_scores.length
        : 0;
    const freshnessAvg =
      summary.category_scores?.length > 0
        ? summary.category_scores.reduce((acc, item) => acc + (item.freshness_avg || 0), 0) / summary.category_scores.length
        : 0;
    const articleScore = Math.min(100, Math.round((summary.article_count_total / 60) * 100));
    return [
      {
        key: 'overall',
        label: 'Overall Score',
        value: Math.round(summary.overall_score),
        progress: Math.round(summary.overall_score),
        accent: 'risk',
      },
      {
        key: 'volume',
        label: 'Article Volume',
        value: summary.article_count_total,
        progress: articleScore,
        accent: articleScore > 60 ? 'risk' : 'safe',
      },
      {
        key: 'sources',
        label: 'Source Diversity',
        value: Math.round(sourceAvg * 10),
        progress: Math.min(100, Math.round(sourceAvg * 10)),
        accent: 'safe',
      },
      {
        key: 'freshness',
        label: 'Freshness Signal',
        value: Math.round(freshnessAvg * 100),
        progress: Math.round(freshnessAvg * 100),
        accent: 'safe',
      },
    ];
  }, [summary]);

  const trendingTopics = useMemo(() => {
    if (!summary?.category_scores?.length) return [];
    return summary.category_scores.map((item) => ({
      topic: item.category.replaceAll('_', ' '),
      sentiment: sentimentFromScore(item.score),
      volume: item.article_count,
    }));
  }, [summary]);

  const briefText = useMemo(
    () => buildIntelBrief(country, summary, selectedCategory),
    [country, summary, selectedCategory]
  );

  useEffect(() => {
    if (!briefText) {
      setTypedBrief('');
      return undefined;
    }
    setTypedBrief('');
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setTypedBrief(briefText.slice(0, index));
      if (index >= briefText.length) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [briefText]);

  const trendUp = (summary?.overall_score || 0) >= (country.index_value || 0);

  if (!country) return null;

  return (
    <div className="country-panel">
      <div className="panel-header">
        <div>
          <h2>{country.name}</h2>
          <p className="country-code">{country.iso3}</p>
        </div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="panel-content">
        <div className="index-display">
          <div className="index-row">
            <div className="index-value" style={{ color: getIndexTextColor(country.index_value) }}>
              {displayIndex}
            </div>
            <span className={`trend-arrow ${trendUp ? 'up' : 'down'}`} />
          </div>
          <div className="index-label">Integrity Index</div>
          <div
            className="severity-badge"
            style={{
            backgroundColor: getIndexTextColor(country.index_value) + '20',
            color: getIndexTextColor(country.index_value),
            boxShadow: `0 0 14px ${getIndexTextColor(country.index_value)}55`,
          }}
          >
            {getSeverityLabel(country.index_value)}
          </div>
          {summary?.generated_at && (
            <div className="last-updated">Updated: {new Date(summary.generated_at).toLocaleTimeString()}</div>
          )}
          <div className="index-divider" />
        </div>

        {loadingSummary && (
          <div className="brief-loading">
            <div className="spinner"></div>
            <p>[ ANALYZING INFORMATION ECOSYSTEM... ]</p>
          </div>
        )}

        {!loadingSummary && summary && (
          <div className="metrics-section">
            <h3>Signal Metrics</h3>
            <div className="metrics-grid">
              {metricCards.map((item, index) => (
                <div
                  key={item.key}
                  className={`metric-card ${item.accent === 'risk' ? 'metric-risk' : 'metric-safe'}`}
                  style={{
                    '--metric-progress': `${item.progress}%`,
                    animationDelay: `${index * 80}ms`,
                  }}
                >
                  <div className="metric-label">{item.label}</div>
                  <div className="metric-value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loadingSummary && !!trendingTopics.length && (
          <div className="topics-section">
            <h3>Trending Topics</h3>
            <div className="topic-list">
              {trendingTopics.map((topic) => (
                <button
                  key={topic.topic}
                  className={`topic-pill ${selectedCategory === topic.topic.replaceAll(' ', '_') ? 'active' : ''}`}
                  onClick={() => {
                    const normalized = topic.topic.replaceAll(' ', '_');
                    setSelectedCategory(normalized);
                    fetchNews(country.iso3, normalized);
                  }}
                >
                  <span className={`topic-sentiment ${topic.sentiment}`} />
                  <span>{topic.topic}</span>
                  <span className="topic-count">{topic.volume}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="news-section">
          <h3>Recent News ({(selectedCategory || 'category').replaceAll('_', ' ')})</h3>
          {loadingNews ? (
            <div className="brief-loading">
              <div className="spinner"></div>
              <p>Loading articles...</p>
            </div>
          ) : news.length === 0 ? (
            <div className="empty-state">No articles found for this category in the selected window.</div>
          ) : (
            <div className="news-list">
              {news.map((article, index) => {
                const credibility = credibilityForArticle(article);
                const impact = article.impact_score || Math.min(99, Math.round((country.index_value || 0) + index * 3));
                const edgeColor =
                  credibility >= 80 ? 'var(--safe)' : credibility >= 65 ? 'var(--amber)' : 'var(--red-threat)';
                return (
                <a
                  key={article.id || article.url}
                  className="news-article"
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ borderLeftColor: edgeColor }}
                >
                  <div className="article-header">
                    <h4 className="article-title">{article.title}</h4>
                    <div className="article-meta">
                      <span className="article-source">{article.source_name || 'unknown source'}</span>
                      <span className="article-time">
                        {article.published ? new Date(article.published).toLocaleDateString() : 'unknown date'}
                      </span>
                    </div>
                  </div>
                  <div className="article-signal-row">
                    <span className="credibility-indicator">{credibility}</span>
                    <div className="impact-bar">
                      <div className="impact-fill" style={{ width: `${impact}%` }} />
                    </div>
                  </div>
                  <p className="article-summary">{article.description || 'No description available.'}</p>
                </a>
                );
              })}
            </div>
          )}
        </div>

        <div className="brief-section">
          <h3 className="brief-title">INTEL BRIEF<span className="scan-cursor">_</span></h3>
          {loadingSummary ? (
            <div className="brief-loading">
              <div className="spinner"></div>
              <p>[ ANALYZING INFORMATION ECOSYSTEM... ]</p>
            </div>
          ) : (
            <p className="brief-text">{typedBrief}</p>
          )}
        </div>
        {error && <div className="brief-error"><p>⚠️ {error}</p></div>}
      </div>
    </div>
  );
}