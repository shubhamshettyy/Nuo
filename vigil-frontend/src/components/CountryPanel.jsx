import React, { useEffect, useMemo, useState } from 'react';
import { getSeverityLabel, getIndexTextColor } from '../utils/colorScale';
import { usePivotCountry } from '../hooks/usePivotCountry';
import './CountryPanel.css';

function buildBrief(country, summary, selCat) {
  if (!summary) return '';
  const score = Math.round(summary.overall_score || 0);
  const top   = summary.category_scores?.[0];
  const cat   = (selCat || top?.category || 'general').replaceAll('_', ' ');
  const level = score >= 75 ? 'Critical' : score >= 55 ? 'Elevated' : 'Moderate';
  return (
    `${country.name} assessment: ${level} risk posture, composite score ${score}. ` +
    `Active monitoring across ${cat} channels. ` +
    `${summary.article_count_total} articles analyzed — ` +
    `highest concentration in ${top?.category?.replaceAll('_', ' ') || 'general media'}. ` +
    `Recommend sustained watch for narrative amplification and cross-platform propagation.`
  );
}

function credScore(a) {
  if (typeof a.credibility_score === 'number') return a.credibility_score;
  if (a.credibility === 'verified') return 86;
  if ((a.source_name || '').toLowerCase().includes('reuters')) return 88;
  return 64;
}

export default function CountryPanel({ country, onClose }) {
  const { summary, news, loadingSummary, loadingNews, error, fetchSummary, fetchNews } = usePivotCountry();
  const [selCat, setSelCat]   = useState(null);
  const [dispIdx, setDispIdx] = useState(0);
  const [typed, setTyped]     = useState('');

  useEffect(() => {
    if (country) { fetchSummary(country.iso3); setSelCat(null); }
  }, [country, fetchSummary]);

  const cats = useMemo(() => summary?.category_scores?.map(i => i.category) || [], [summary]);

  useEffect(() => {
    const cat = selCat || cats[0];
    if (country && cat) fetchNews(country.iso3, cat);
  }, [cats, selCat, country, fetchNews]);

  // Animate index count
  useEffect(() => {
    if (!country?.index_value) { setDispIdx(0); return; }
    const target = Math.round(country.index_value);
    const step   = Math.max(1, Math.ceil(target / 30));
    const id     = setInterval(() => {
      setDispIdx(p => { const n = Math.min(target, p + step); if (n >= target) clearInterval(id); return n; });
    }, 25);
    return () => clearInterval(id);
  }, [country]);

  const metrics = useMemo(() => {
    if (!summary) return [];
    const s   = summary.category_scores || [];
    const src = s.length ? s.reduce((a, i) => a + (i.source_count || 0), 0) / s.length : 0;
    const fsh = s.length ? s.reduce((a, i) => a + (i.freshness_avg || 0), 0) / s.length : 0;
    const art = Math.min(100, Math.round((summary.article_count_total / 60) * 100));
    return [
      { l: 'Overall',  v: Math.round(summary.overall_score),  p: Math.round(summary.overall_score), cls: 'r' },
      { l: 'Articles', v: summary.article_count_total,         p: art, cls: art > 60 ? 'r' : 'g' },
      { l: 'Sources',  v: Math.round(src * 10),               p: Math.min(100, Math.round(src * 10)), cls: 'g' },
      { l: 'Freshness',v: Math.round(fsh * 100),              p: Math.round(fsh * 100), cls: 'g' },
    ];
  }, [summary]);

  const topics = useMemo(() => {
    if (!summary?.category_scores?.length) return [];
    return summary.category_scores.map(i => ({
      key:       i.category,
      label:     i.category.replaceAll('_', ' '),
      sentiment: i.score >= 75 ? 'negative' : i.score >= 50 ? 'mixed' : 'positive',
      count:     i.article_count,
    }));
  }, [summary]);

  // Typewriter for brief
  const brief = useMemo(() => buildBrief(country, summary, selCat), [country, summary, selCat]);
  useEffect(() => {
    if (!brief) { setTyped(''); return; }
    setTyped('');
    let i = 0;
    const id = setInterval(() => { i++; setTyped(brief.slice(0, i)); if (i >= brief.length) clearInterval(id); }, 11);
    return () => clearInterval(id);
  }, [brief]);

  if (!country) return null;

  const color    = getIndexTextColor(country.index_value);
  const severity = getSeverityLabel(country.index_value);
  const trendUp  = (summary?.overall_score || 0) >= (country.index_value || 0);

  return (
    <div className="panel">
      <div className="p-head">
        <div className="p-head-row">
          <div className="p-country">{country.name}</div>
          <button className="p-close" onClick={onClose}>×</button>
        </div>
        <div className="p-iso">{country.iso3} — Crisis Monitor</div>
      </div>

      <div className="p-score-row">
        <div className="p-score-num" style={{ color }}>{dispIdx}</div>
        <div className="p-score-meta">
          <span className="p-score-label">Invisible Index</span>
          <span className="p-severity"
            style={{ background: color + '14', color, border: `1px solid ${color}30` }}>
            {severity}
          </span>
        </div>
        <div className="p-trend" style={{ color: trendUp ? 'var(--red)' : 'var(--green)' }}>
          {trendUp ? '↑' : '↓'}
        </div>
      </div>

      {summary?.generated_at && (
        <div className="p-updated">
          Updated {new Date(summary.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

      <div className="p-body">
        {/* Metrics */}
        {loadingSummary ? (
          <div className="p-loading"><div className="spinner" />Analyzing ecosystem...</div>
        ) : summary && (
          <div>
            <div className="sec-head">Signal Metrics</div>
            <div className="metrics-grid">
              {metrics.map((m, i) => (
                <div key={m.l} className={`metric ${m.cls}`}
                  style={{ '--p': `${m.p}%`, animationDelay: `${i * 60}ms` }}>
                  <div className="metric-lbl">{m.l}</div>
                  <div className="metric-val">{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topics */}
        {!loadingSummary && topics.length > 0 && (
          <div>
            <div className="sec-head">Topics</div>
            <div className="topic-row">
              {topics.map(t => (
                <button key={t.key}
                  className={`topic${selCat === t.key ? ' on' : ''}`}
                  onClick={() => { setSelCat(t.key); fetchNews(country.iso3, t.key); }}
                >
                  <span className={`t-dot ${t.sentiment}`} />
                  {t.label}
                  <span className="t-count">{t.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* News */}
        <div>
          <div className="sec-head">
            Recent Coverage — {(selCat || cats[0] || 'all').replaceAll('_', ' ')}
          </div>
          {loadingNews ? (
            <div className="p-loading"><div className="spinner" />Fetching feed...</div>
          ) : news.length === 0 ? (
            <div className="news-empty">No articles found for this category.</div>
          ) : (
            <div className="news-list">
              {news.map((a, i) => {
                const cred  = credScore(a);
                const imp   = a.impact_score || Math.min(99, Math.round((country.index_value || 0) + i * 3));
                const edge  = cred >= 80 ? 'var(--green)' : cred >= 65 ? 'var(--amber)' : 'var(--red)';
                const date  = a.published || a.published_at;
                return (
                  <a key={a.id || a.url || i} className="news-card"
                    href={a.url || '#'} target="_blank" rel="noreferrer"
                    style={{ borderLeftColor: edge }}>
                    <div className="news-title">{a.title}</div>
                    <div className="news-meta">
                      <span className="news-src">{a.source_name || a.source}</span>
                      <span className="news-date">
                        {date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Recent'}
                      </span>
                    </div>
                    <div className="news-bar">
                      <span className="cred">{cred}</span>
                      <div className="impact-bar">
                        <div className="impact-fill" style={{ width: `${imp}%` }} />
                      </div>
                    </div>
                    <p className="news-desc">{a.description || a.summary || ''}</p>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Brief */}
        <div>
          <div className="sec-head">
            Intel Brief<span className="brief-cursor">_</span>
          </div>
          {loadingSummary ? (
            <div className="p-loading"><div className="spinner" />Generating assessment...</div>
          ) : (
            <div className="brief-wrap">
              <p className="brief-text">{typed}</p>
            </div>
          )}
        </div>

        {error && <p className="p-err">{error}</p>}
      </div>
    </div>
  );
}
