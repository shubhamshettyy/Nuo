import React, { useEffect, useMemo, useState } from 'react';
import { useGlobeData } from './hooks/useGlobeData';
import WorldMap from './components/WorldMap';
import CountryPanel from './components/CountryPanel';
import AlertBanner from './components/AlertBanner';
import { CATEGORIES } from './data/mockData';
import './App.css';

function Boot({ pct }) {
  return (
    <div className="boot">
      <div className="boot-name">VIGIL</div>
      <div className="boot-sub">Global Crisis Monitor — Initializing</div>
      <div className="boot-bar">
        <div className="boot-fill" style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
      <div className="boot-pct">{pct}%</div>
    </div>
  );
}

export default function App() {
  const { countries, loading, error } = useGlobeData();
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState('all');
  const [theme, setTheme]       = useState('dark');
  const [boot, setBoot]         = useState(0);
  const [stats, setStats]       = useState({ m: 0, c: 0, a: 0 });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!loading) { setBoot(100); return; }
    let v = 0;
    const id = setInterval(() => { v = Math.min(v + 4, 74); setBoot(v); if (v >= 74) clearInterval(id); }, 80);
    return () => clearInterval(id);
  }, [loading]);

  const mapped = useMemo(() => {
    if (category === 'all') return countries;
    return countries.map(c => ({ ...c, index_value: c.category_scores?.[category] ?? c.index_value }));
  }, [countries, category]);

  useEffect(() => {
    if (loading || !mapped.length) return;
    const w = mapped.filter(c => c.index_value != null);
    const t = {
      m: w.length,
      c: w.filter(c => c.index_value >= 75).length,
      a: w.length ? Math.round(w.reduce((s, c) => s + c.index_value, 0) / w.length) : 0,
    };
    let step = 0;
    const id = setInterval(() => {
      step++;
      const p = Math.min(step / 20, 1);
      setStats({ m: Math.round(t.m*p), c: Math.round(t.c*p), a: Math.round(t.a*p) });
      if (p >= 1) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, [loading, mapped]);

  const switchCat = (id) => { setCategory(id); setSelected(null); };

  const catLabel = CATEGORIES.find(c => c.id === category)?.label || 'All Crises';

  return (
    <div className="app">
      {!loading && !error && <AlertBanner />}

      <header className="header">
        <div className="header-brand">
          <span className="brand-wordmark">VIGIL</span>
          <span className="brand-live">
            <span className="live-dot" />
            LIVE
          </span>
        </div>
        <span className="header-tagline">Global Crisis Intelligence Monitor</span>

        {!loading && !error && (
          <div className="header-right">
            <div className="h-stat">
              <div className="h-stat-val">{stats.m}</div>
              <div className="h-stat-lbl">Countries</div>
            </div>
            <div className="h-stat">
              <div className="h-stat-val alert">{stats.c}</div>
              <div className="h-stat-lbl">Critical</div>
            </div>
            <div className="h-stat">
              <div className="h-stat-val">{stats.a}</div>
              <div className="h-stat-lbl">Avg Index</div>
            </div>
            <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? 'LIGHT' : 'DARK'}
            </button>
          </div>
        )}
      </header>

      {!loading && !error && (
        <nav className="category-bar">
          {CATEGORIES.map((cat, i) => (
            <React.Fragment key={cat.id}>
              {i === 1 && <div className="cat-divider" />}
              <button
                className={`cat-btn${category === cat.id ? ' active' : ''}`}
                onClick={() => switchCat(cat.id)}
              >
                {cat.label}
              </button>
            </React.Fragment>
          ))}
        </nav>
      )}

      <main className="main">
        {loading && <Boot pct={boot} />}
        {error && (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%',
            fontFamily:'var(--mono)',fontSize:11,color:'var(--text3)' }}>
            Feed error — {error}
          </div>
        )}
        {!loading && !error && (
          <>
            <WorldMap
              countries={mapped}
              onCountryClick={setSelected}
              selectedCountry={selected}
              activeCategory={category}
            />
            {selected && (
              <CountryPanel
                country={selected}
                onClose={() => setSelected(null)}
              />
            )}
          </>
        )}
      </main>

      {!loading && !error && (
        <div className="legend">
          <div className="legend-title">
            {catLabel} — Coverage Gap Index
          </div>
          <div className="legend-gradient" />
          <div className="legend-labels">
            <span>Low</span>
            <span>Moderate</span>
            <span>Critical</span>
          </div>
        </div>
      )}
    </div>
  );
}
