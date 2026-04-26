import React, { useEffect, useMemo, useState } from 'react';
import { useGlobeData } from './hooks/useGlobeData';
import WorldMap from './components/WorldMap';
import CountryPanel from './components/CountryPanel';
import AlertBanner from './components/AlertBanner';
import LanguageSwitcher from './components/LanguageSwitcher';
import { CATEGORIES } from './data/mockData';
import './App.css';

function Boot({ pct }) {
  return (
    <div className="boot">
      <div className="boot-title">Vigil</div>
      <div className="boot-sub">Global Crisis Monitor</div>
      <div className="boot-bar">
        <div className="boot-fill" style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
    </div>
  );
}

export default function App() {
  const { countries, loading, error } = useGlobeData();
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState('all');
  const [theme, setTheme]       = useState('light');
  const [boot, setBoot]         = useState(0);
  const [stats, setStats]       = useState({ m: 0, c: 0 });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!loading) { setBoot(100); return; }
    let v = 0;
    const id = setInterval(() => { v = Math.min(v + 5, 75); setBoot(v); if (v >= 75) clearInterval(id); }, 70);
    return () => clearInterval(id);
  }, [loading]);

  const mapped = useMemo(() => {
    if (category === 'all') return countries;
    return countries.map(c => ({
      ...c,
      index_value: c.category_scores?.[category] ?? c.index_value,
    }));
  }, [countries, category]);

  useEffect(() => {
    if (loading || !mapped.length) return;
    const w = mapped.filter(c => c.index_value != null);
    const t = { m: w.length, c: w.filter(c => c.index_value >= 65).length };
    let step = 0;
    const id = setInterval(() => {
      step++;
      const p = Math.min(step / 18, 1);
      setStats({ m: Math.round(t.m * p), c: Math.round(t.c * p) });
      if (p >= 1) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, [loading, mapped]);

  function switchCat(id) { setCategory(id); setSelected(null); }

  return (
    <div className="app">
      {!loading && !error && <AlertBanner />}

      <header className="header">
        <div className="header-brand">
          <span className="brand-name">Vigil</span>
          <span className="brand-tagline">Global Crisis Monitor</span>
        </div>

        <div className="header-center">
          <div className="live-pill">
            <span className="live-dot" />
            Live · Updates every 15 minutes
          </div>
        </div>

        <div className="header-right">
          {!loading && !error && (
            <>
              <div className="h-stat">
                <div className="h-stat-val">{stats.m}</div>
                <div className="h-stat-lbl">Monitored</div>
              </div>
              <div className="h-stat">
                <div className="h-stat-val red">{stats.c}</div>
                <div className="h-stat-lbl">Critical gap</div>
              </div>
            </>
          )}
          <button
            className="theme-btn"
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          <LanguageSwitcher />
        </div>
      </header>

      {!loading && !error && (
        <nav className="category-nav">
          {CATEGORIES.map((cat, i) => (
            <React.Fragment key={cat.id}>
              {i === 1 && <div className="cat-sep" />}
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
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text3)', fontSize:13 }}>
            Unable to load data
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
                activeCategory={category}
                onClose={() => setSelected(null)}
              />
            )}
          </>
        )}
      </main>

      {!loading && !error && (
        <div className="legend">
          <div className="legend-title">Coverage gap index</div>
          <div className="legend-bar" />
          <div className="legend-labels">
            <span>Well covered</span>
            <span>Critical gap</span>
          </div>
        </div>
      )}
    </div>
  );
}
