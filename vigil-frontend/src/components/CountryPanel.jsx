import React, { useEffect, useState } from 'react';
import './CountryPanel.css';

const CATEGORIES = [
  'Scientific Breakthroughs',
  'Environmental Restoration',
  'Social Progress',
  'Public Health Crises',
  'Armed Conflict & Violence',
  'Human Rights Violations'
];

export default function CountryPanel({ country, details, articles, loading, onClose }) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

  if (!country) return null;

  // Group articles by category
  const articlesByCategory = {};
  CATEGORIES.forEach(cat => {
    articlesByCategory[cat] = articles?.filter(a => a.category === cat) || [];
  });

  // Get score for active category (from details or calculate from articles)
  const getCategoryScore = (category) => {
    const categoryArticles = articlesByCategory[category];
    if (!categoryArticles.length) return 0;
    
    // Average impact score of all articles in this category
    const avgImpact = categoryArticles.reduce((sum, a) => sum + (a.impact_score || 0), 0) / categoryArticles.length;
    return Math.round(avgImpact);
  };

  const activeScore = getCategoryScore(activeCategory);
  const activeArticles = articlesByCategory[activeCategory] || [];

  return (
    <div className="country-panel">
      {/* Header */}
      <div className="panel-header">
        <div>
          <h2>{country.name}</h2>
          <p className="country-code">{country.iso3}</p>
        </div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {CATEGORIES.map(cat => {
          const count = articlesByCategory[cat]?.length || 0;
          const score = getCategoryScore(cat);
          return (
            <button
              key={cat}
              className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              <div className="cat-tab-label">{cat}</div>
              <div className="cat-tab-meta">
                <span className="cat-tab-count">{count}</span>
                {score > 0 && (
                  <span 
                    className="cat-tab-score"
                    style={{
                      color: score > 70 ? '#ef4444' : score > 40 ? '#fbbf24' : '#10b981'
                    }}
                  >
                    {score}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="panel-content">
        {loading ? (
          <div className="panel-loading">
            <div className="spinner"></div>
            <p>Loading details...</p>
          </div>
        ) : (
          <>
            {/* Category Score Display */}
            <div className="category-score-display">
              <div className="score-label">Category Score</div>
              <div 
                className="score-value"
                style={{
                  color: activeScore > 70 ? '#ef4444' : 
                         activeScore > 40 ? '#fbbf24' : 
                         activeScore > 0 ? '#10b981' : '#64748b'
                }}
              >
                {activeScore > 0 ? activeScore : 'N/A'}
              </div>
              <div className="score-sublabel">
                Based on {activeArticles.length} article{activeArticles.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Articles List */}
            {activeArticles.length > 0 ? (
              <div className="articles-section">
                <h3>Articles</h3>
                <div className="articles-list">
                  {activeArticles.map((article, idx) => (
                    <div key={article.id || idx} className="article-card">
                      <div className="article-header">
                        <h4 className="article-title">{article.title}</h4>
                        <div className="article-impact-badge">
                          {article.impact_score}
                        </div>
                      </div>
                      
                      {article.content && (
                        <p className="article-summary">
                          {article.content.substring(0, 180)}...
                        </p>
                      )}
                      
                      <div className="article-footer">
                        <span className="article-date">
                          {new Date(article.published).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        {article.url && (
                          <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="article-link"
                          >
                            Read full article →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <div className="empty-title">No articles found</div>
                <div className="empty-text">
                  No coverage available for {activeCategory} in {country.name}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}