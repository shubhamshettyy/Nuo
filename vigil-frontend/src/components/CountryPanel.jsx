import React, { useEffect, useState, useCallback } from 'react';
import { getIndexLabel, getIndexColor } from '../utils/colorScale';
import { CATEGORIES, CATEGORY_COLORS, mockSummaries } from '../data/mockData';
import { useLang } from '../i18n/LanguageContext';
import { useTranslateSummary } from '../hooks/useTranslateSummary';
import './CountryPanel.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

async function fetchCategoryData(iso3, category) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 500));
    const cd = mockSummaries[iso3];
    if (cd && category !== 'all' && cd[category]) return cd[category];
    if (category === 'all' && cd) return Object.values(cd)[0] || mockSummaries.default;
    return mockSummaries.default;
  }
  try {
    const params = category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
    const res = await fetch(`${API_BASE}/api/pivot/country/${iso3}/summary${params}`);
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    return {
      summary:  data.summary  || '',
      links:    data.links    || [],
      articles: data.articles || [],
      category: data.category || category,
    };
  } catch {
    return { summary: '', links: [], articles: [], category };
  }
}

const ALL_CATS = CATEGORIES.filter(c => c.id !== 'all');

export default function CountryPanel({ country, activeCategory, onClose }) {
  const { lang, current } = useLang();
  const { translate, translating } = useTranslateSummary();

  const [selCat, setSelCat]           = useState(activeCategory !== 'all' ? activeCategory : ALL_CATS[0]?.id);
  const [rawData, setRawData]         = useState(null);
  const [displaySummary, setDisplaySummary] = useState('');
  const [loading, setLoading]         = useState(false);

  // Load data from API
  const load = useCallback(async (cat) => {
    setLoading(true);
    setRawData(null);
    setDisplaySummary('');
    const result = await fetchCategoryData(country.iso3, cat);
    setRawData(result);
    setLoading(false);
  }, [country.iso3]);

  useEffect(() => {
    const cat = activeCategory !== 'all' ? activeCategory : ALL_CATS[0]?.id || 'all';
    setSelCat(cat);
    load(cat);
  }, [country.iso3, activeCategory, load]);

  // Translate summary whenever rawData or language changes
  useEffect(() => {
    if (!rawData?.summary) { setDisplaySummary(''); return; }
    if (lang === 'en') { setDisplaySummary(rawData.summary); return; }

    setDisplaySummary(''); // clear while translating
    translate(rawData.summary, lang, current.name).then(setDisplaySummary);
  }, [rawData, lang, current.name, translate]);

  function switchCat(cat) {
    setSelCat(cat);
    load(cat);
  }

  const catColor = CATEGORY_COLORS[selCat] || '#555';
  const catLabel = CATEGORIES.find(c => c.id === selCat)?.label || selCat;
  const gapLabel = getIndexLabel(country.index_value);
  const gapColor = getIndexColor(country.index_value);

  const articles = (rawData?.articles || []).filter(a => a.title || a.headline);
  const links    = [
    ...(rawData?.links || []),
    ...(rawData?.articles || []).map(a => a.url || a.link).filter(Boolean),
  ].filter(Boolean).slice(0, 8);

  const isTranslating = translating && lang !== 'en';

  return (
    <div className="panel">
      <div className="p-head">
        <div className="p-head-top">
          <div className="p-country">{country.name}</div>
          <button className="p-close" onClick={onClose}>×</button>
        </div>
        <div className="p-meta">
          <span
            className="p-cat-tag"
            style={{ background: catColor + '18', color: catColor, border: `1px solid ${catColor}30` }}
          >
            {catLabel}
          </span>
          <span className="p-gap-label" style={{ color: gapColor }}>{gapLabel}</span>
        </div>
      </div>

      <div className="p-body">
        {/* Category tabs */}
        <div className="p-cat-tabs">
          {ALL_CATS.map(cat => (
            <button
              key={cat.id}
              className={`p-cat-tab${selCat === cat.id ? ' on' : ''}`}
              onClick={() => switchCat(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="sec-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Coverage Summary</span>
            {lang !== 'en' && (
              <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 400, letterSpacing: 0 }}>
                {isTranslating ? '↻ Translating...' : `Translated · ${current.nativeName}`}
              </span>
            )}
          </div>
          {loading || isTranslating ? (
            <div className="p-summary-loading">
              <div className="spinner" />
              {loading ? 'Loading report...' : `Translating to ${current.name}...`}
            </div>
          ) : (
            <p className="p-summary" dir={current.rtl ? 'rtl' : 'ltr'}>
              {displaySummary || 'No summary available for this category.'}
            </p>
          )}
        </div>

        {/* Article links */}
        {!loading && (articles.length > 0 || links.length > 0) && (
          <div>
            <div className="sec-label">Source Articles</div>
            <div className="articles-list">
              {articles.length > 0
                ? articles.map((a, i) => (
                    <a key={i} className="article-link"
                      href={a.url || a.link || '#'} target="_blank" rel="noreferrer">
                      <div className="article-headline">{a.title || a.headline}</div>
                      <div className="article-meta-row">
                        {a.source && <span className="article-source">{a.source}</span>}
                        <span className="article-arrow">↗</span>
                      </div>
                    </a>
                  ))
                : links.map((url, i) => (
                    <a key={i} className="article-link"
                      href={url} target="_blank" rel="noreferrer">
                      <div className="article-headline">
                        {url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                      </div>
                      <div className="article-meta-row">
                        <span className="article-arrow">↗</span>
                      </div>
                    </a>
                  ))
              }
            </div>
          </div>
        )}

        {/* Translation tip for articles */}
        {lang !== 'en' && (
          <div className="translate-tip">
            <strong>Articles open in English.</strong> Your browser can translate them — in Chrome, right-click and select "Translate to {current.name}".
          </div>
        )}
      </div>
    </div>
  );
}
