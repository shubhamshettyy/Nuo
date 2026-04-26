import React, { useEffect, useState } from 'react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
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
  const [activeCategory, setActiveCategory] = useState(null);
  const { speak, isSpeaking, currentAudioId } = useTextToSpeech();

  // Group articles by category
  const articlesByCategory = {};
  CATEGORIES.forEach(cat => {
    const categoryArticles = articles?.filter(a => a.category === cat) || [];
    if (categoryArticles.length > 0) {
      articlesByCategory[cat] = categoryArticles;
    }
  });

  // Only show categories that have articles
  const availableCategories = Object.keys(articlesByCategory);

  // Set initial active category when articles load
  useEffect(() => {
    if (availableCategories.length > 0 && !activeCategory) {
      setActiveCategory(availableCategories[0]);
    }
  }, [availableCategories.length, activeCategory]);

  // Early return AFTER hooks
  if (!country) return null;

  // Get score for active category
  const getCategoryScore = (category) => {
    const categoryArticles = articlesByCategory[category];
    if (!categoryArticles || !categoryArticles.length) return 0;
    
    const avgImpact = categoryArticles.reduce((sum, a) => sum + (a.impact_score || 0), 0) / categoryArticles.length;
    return Math.round(avgImpact);
  };

  const activeScore = getCategoryScore(activeCategory);
  const activeArticles = articlesByCategory[activeCategory] || [];

  const handleSpeakArticle = (article) => {
    const audioId = `article-${article.id}`;
    
    // Create a narration of the article
    const narration = `
      ${article.title}. 
      ${article.content || article.summary || 'No summary available.'}
    `.trim();
    
    speak(narration, audioId);
  };

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
        {availableCategories.map(cat => {
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
        ) : availableCategories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No articles available</div>
            <div className="empty-text">
              No news coverage found for {country.name} at this time.
            </div>
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
                  {activeArticles.map((article, idx) => {
                    const audioId = `article-${article.id}`;
                    const isPlaying = isSpeaking && currentAudioId === audioId;
                    
                    return (
                      <div key={article.id || idx} className="article-card">
                        <div className="article-header">
                          <h4 className="article-title">{article.title}</h4>
                          <div className="article-badges">
                            {/* Speaker Button */}
                            <button
                              className={`speaker-button ${isPlaying ? 'playing' : ''}`}
                              onClick={() => handleSpeakArticle(article)}
                              title={isPlaying ? 'Stop reading' : 'Read article summary'}
                            >
                              {isPlaying ? (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                  <rect x="4" y="3" width="3" height="10" rx="1"/>
                                  <rect x="9" y="3" width="3" height="10" rx="1"/>
                                </svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M8 3.5v9M11 6v4M5 6v4M8 1a7 7 0 110 14 7 7 0 010-14z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                                  <path d="M11 8c0 1.5-1 2.5-2 2.5M13 8c0 2.5-2 4-4 4"/>
                                </svg>
                              )}
                            </button>
                            
                            {/* Impact Badge */}
                            <div className="article-impact-badge">
                              {article.impact_score}
                            </div>
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
                    );
                  })}
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