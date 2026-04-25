import React, { useEffect } from 'react';
import { useBrief } from '../hooks/useBrief';
import { useCountryDetails } from '../hooks/useCountryDetails';
import { formatIndex, getSeverityLabel, getIndexTextColor } from '../utils/colorScale';
import './CountryPanel.css';

export default function CountryPanel({ country, onClose }) {
  const { brief, loading: briefLoading, error: briefError, fetchBrief } = useBrief();
  const { details, loading: detailsLoading, fetchDetails } = useCountryDetails();

  useEffect(() => {
    if (country) {
      console.log('🔍 Panel opened for country:', country);
      fetchBrief(country.iso3, country);
      fetchDetails(country.iso3);
    }
  }, [country, fetchBrief, fetchDetails]);

  useEffect(() => {
    if (details) {
      console.log('📊 Details loaded:', details);
    }
  }, [details]);

  if (!country) {
    console.log('❌ No country selected');
    return null;
  }

  console.log('✅ Rendering panel for:', country.name);

  const trendIcon = details?.trend === 'up' ? '↑' : details?.trend === 'down' ? '↓' : '→';
  const trendColor = details?.trend === 'up' ? '#ef4444' : details?.trend === 'down' ? '#10b981' : '#9ca3af';

  return (
    <div className="country-panel" style={{ border: '2px solid red' }}>
      <div className="panel-header">
        <div>
          <h2 style={{ color: 'white' }}>{country.name}</h2>
          <p className="country-code">{country.iso3}</p>
        </div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="panel-content">
        {/* Index Display */}
        <div className="index-display" style={{ border: '1px solid yellow' }}>
          <div className="index-row">
            <div className="index-value" style={{ color: getIndexTextColor(country.index_value) }}>
              {formatIndex(country.index_value)}
            </div>
            {details && (
              <div className="trend-indicator" style={{ color: trendColor }}>
                <span className="trend-icon">{trendIcon}</span>
                <span className="trend-value">
                  {details.change_24h > 0 ? '+' : ''}{details.change_24h?.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          <div className="index-label">Integrity Index</div>
          <div className="severity-badge" style={{ 
            backgroundColor: getIndexTextColor(country.index_value) + '20',
            color: getIndexTextColor(country.index_value)
          }}>
            {getSeverityLabel(country.index_value)}
          </div>
          {details && (
            <div className="last-updated">
              Updated: {new Date(details.last_updated).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div style={{ padding: '20px', background: '#333', margin: '10px 0', color: 'white' }}>
          <h4>🐛 Debug Info:</h4>
          <p>Details Loading: {detailsLoading ? 'Yes' : 'No'}</p>
          <p>Has Details: {details ? 'Yes' : 'No'}</p>
          <p>Has Metrics: {details?.metrics ? 'Yes' : 'No'}</p>
          <p>Has Articles: {details?.news_articles?.length || 0} articles</p>
          <p>Has Topics: {details?.trending_topics?.length || 0} topics</p>
        </div>

        {/* Metrics Grid */}
        {details && details.metrics && (
          <div className="metrics-section" style={{ border: '1px solid green' }}>
            <h3>Key Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Misinformation</div>
                <div className="metric-value" style={{ 
                  color: details.metrics.misinformation_score > 70 ? '#ef4444' : 
                         details.metrics.misinformation_score > 40 ? '#fbbf24' : '#10b981'
                }}>
                  {details.metrics.misinformation_score}%
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Bot Activity</div>
                <div className="metric-value" style={{ 
                  color: details.metrics.bot_activity > 70 ? '#ef4444' : 
                         details.metrics.bot_activity > 40 ? '#fbbf24' : '#10b981'
                }}>
                  {details.metrics.bot_activity}%
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Fact-Check Ratio</div>
                <div className="metric-value" style={{ 
                  color: details.metrics.fact_check_ratio < 30 ? '#ef4444' : 
                         details.metrics.fact_check_ratio < 60 ? '#fbbf24' : '#10b981'
                }}>
                  {details.metrics.fact_check_ratio}%
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Source Diversity</div>
                <div className="metric-value" style={{ 
                  color: details.metrics.source_diversity < 30 ? '#ef4444' : 
                         details.metrics.source_diversity < 60 ? '#fbbf24' : '#10b981'
                }}>
                  {details.metrics.source_diversity}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trending Topics */}
        {details && details.trending_topics && details.trending_topics.length > 0 && (
          <div className="trending-section" style={{ border: '1px solid blue' }}>
            <h3>Trending Topics</h3>
            <div className="trending-list">
              {details.trending_topics.map((topic, index) => (
                <div key={index} className="trending-item">
                  <div className="trending-topic">{topic.topic}</div>
                  <div className="trending-meta">
                    <span className="trending-volume">{topic.volume.toLocaleString()} mentions</span>
                    <span className={`trending-sentiment sentiment-${topic.sentiment}`}>
                      {topic.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* News Articles */}
        {details && details.news_articles && details.news_articles.length > 0 && (
          <div className="news-section" style={{ border: '1px solid purple' }}>
            <h3>Recent News</h3>
            <div className="news-list">
              {details.news_articles.map((article) => (
                <div key={article.id} className="news-article">
                  <div className="article-header">
                    <h4 className="article-title">{article.title}</h4>
                    <div className="article-meta">
                      <span className="article-source">{article.source}</span>
                      <span className="article-time">
                        {new Date(article.published).toLocaleDateString()} · {new Date(article.published).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <p className="article-summary">{article.summary}</p>
                  <div className="article-footer">
                    <span className="article-credibility">{article.credibility}</span>
                    <span className="article-impact">
                      Impact: {article.impact_score}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Intelligence Brief */}
        <div className="brief-section" style={{ border: '1px solid orange' }}>
          <h3>Intelligence Brief</h3>
          
          {briefLoading && (
            <div className="brief-loading">
              <div className="spinner"></div>
              <p>Generating brief...</p>
            </div>
          )}

          {briefError && (
            <div className="brief-error">
              <p>⚠️ Failed to load brief</p>
              <button onClick={() => fetchBrief(country.iso3, country)}>Retry</button>
            </div>
          )}

          {brief && !briefLoading && (
            <div className="brief-content">
              <p>{brief.brief_text}</p>
              {brief.timestamp && (
                <p className="brief-timestamp">
                  Generated: {new Date(brief.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}