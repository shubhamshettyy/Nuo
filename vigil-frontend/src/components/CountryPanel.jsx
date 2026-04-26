import React, { useState } from 'react';
import { t } from '../data/ui-strings';
import './CountryPanel.css';

const CATEGORIES = [
  'Scientific Breakthroughs',
  'Environmental Restoration',
  'Social Progress',
  'Public Health Crises',
  'Armed Conflict & Violence',
  'Human Rights Violations',
];

const CAT_LABEL_KEY = {
  'Scientific Breakthroughs':  'scientificBreakthroughs',
  'Environmental Restoration':  'environmentalRestoration',
  'Social Progress':            'socialProgressFull',
  'Public Health Crises':       'publicHealthCrises',
  'Armed Conflict & Violence':  'armedConflictFull',
  'Human Rights Violations':    'humanRightsFull',
};

export default function CountryPanel({ country, details, articles, loading, onClose, lang = 'en' }) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

  if (!country) return null;

  const articlesByCategory = {};
  CATEGORIES.forEach(cat => {
    articlesByCategory[cat] = articles?.filter(a => a.category === cat) || [];
  });

  const activeArticles = articlesByCategory[activeCategory] || [];

  return (
    <div className="country-panel">
      <div className="panel-header">
        <div>
          <h2>{country.name}</h2>
          <p className="country-code">{country.iso3}</p>
        </div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="category-tabs">
        {CATEGORIES.map(cat => {
          const count = articlesByCategory[cat]?.length || 0;
          return (
            <button key={cat} className={`cat-tab${activeCategory===cat?' active':''}`}
              onClick={() => setActiveCategory(cat)}>
              <div className="cat-tab-label">{t(lang, CAT_LABEL_KEY[cat])}</div>
              <div className="cat-tab-meta">
                <span className="cat-tab-count">{count}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="panel-content">
        {loading ? (
          <div className="panel-loading">
            <div className="spinner" />
            <p>{t(lang,'loadingDetails')}</p>
          </div>
        ) : activeArticles.length > 0 ? (
          <div className="articles-section">
            <h3>{t(lang,'articles')}</h3>
            <div className="articles-list">
              {activeArticles.map((article, idx) => (
                <div key={article.id||idx} className="article-card">
                  <div className="article-header">
                    <h4 className="article-title">{article.title}</h4>
                  </div>
                  {article.content && (
                    <p className="article-summary">{article.content.substring(0,180)}...</p>
                  )}
                  <div className="article-footer">
                    <span className="article-date">
                      {new Date(article.published).toLocaleDateString('en-GB',{month:'short',day:'numeric',year:'numeric'})}
                    </span>
                    {article.url && (
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="article-link">
                        {t(lang,'readFull')} →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {lang !== 'en' && (
              <p style={{marginTop:16,fontSize:10,color:'#bbb',fontFamily:'Inter,sans-serif',lineHeight:1.5}}>
                {t(lang,'translateTip')}
              </p>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-title">{t(lang,'noArticles')}</div>
            <div className="empty-text">{t(lang,'noArticlesText')} — {country.name}</div>
          </div>
        )}
      </div>
    </div>
  );
}
