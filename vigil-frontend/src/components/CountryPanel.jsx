import React, { useEffect, useMemo, useState } from 'react';
import { formatIndex, getSeverityLabel, getIndexTextColor } from '../utils/colorScale';
import { usePivotCountry } from '../hooks/usePivotCountry';
import './CountryPanel.css';

export default function CountryPanel({ country, onClose }) {
  const { summary, news, loadingSummary, loadingNews, error, fetchSummary, fetchNews } = usePivotCountry();
  const [selectedCategory, setSelectedCategory] = useState(null);

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
        {/* Index Display */}
        <div className="index-display">
          <div className="index-row">
            <div className="index-value" style={{ color: getIndexTextColor(country.index_value) }}>
              {formatIndex(country.index_value)}
            </div>
          </div>
          <div className="index-label">Integrity Index</div>
          <div className="severity-badge" style={{ 
            backgroundColor: getIndexTextColor(country.index_value) + '20',
            color: getIndexTextColor(country.index_value)
          }}>
            {getSeverityLabel(country.index_value)}
          </div>
          {summary?.generated_at && <div className="last-updated">Updated: {new Date(summary.generated_at).toLocaleTimeString()}</div>}
        </div>

        {loadingSummary && (
          <div className="brief-loading">
            <div className="spinner"></div>
            <p>Loading category scores...</p>
          </div>
        )}

        {!loadingSummary && summary && (
          <div className="metrics-section">
            <h3>News Visibility Score</h3>
            <div className="summary-score-row">
              <div className="summary-score-card">
                <div className="metric-label">Overall score</div>
                <div className="metric-value">{summary.overall_score}</div>
              </div>
              <div className="summary-score-card">
                <div className="metric-label">Articles (14d)</div>
                <div className="metric-value">{summary.article_count_total}</div>
              </div>
            </div>
            <div className="metrics-grid">
              {summary.category_scores.map((item) => (
                <button
                  key={item.category}
                  className={`metric-card category-card ${selectedCategory === item.category ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(item.category);
                    fetchNews(country.iso3, item.category);
                  }}
                >
                  <div className="metric-label">{item.category.replaceAll('_', ' ')}</div>
                  <div className="metric-value">{item.score}</div>
                  <div className="metric-subtext">{item.article_count} articles</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="news-section">
          <h3>Recent News ({selectedCategory || 'category'})</h3>
          {loadingNews ? (
            <div className="brief-loading">
              <div className="spinner"></div>
              <p>Loading articles...</p>
            </div>
          ) : news.length === 0 ? (
            <div className="empty-state">No articles found for this category in the selected window.</div>
          ) : (
            <div className="news-list">
              {news.map((article) => (
                <a key={article.id || article.url} className="news-article" href={article.url} target="_blank" rel="noreferrer">
                  <div className="article-header">
                    <h4 className="article-title">{article.title}</h4>
                    <div className="article-meta">
                      <span className="article-source">{article.source_name || 'unknown source'}</span>
                      <span className="article-time">
                        {article.published ? new Date(article.published).toLocaleDateString() : 'unknown date'}
                      </span>
                    </div>
                  </div>
                  <p className="article-summary">{article.description || 'No description available.'}</p>
                </a>
              ))}
            </div>
          )}
        </div>
        {error && <div className="brief-error"><p>⚠️ {error}</p></div>}
      </div>
    </div>
  );
}