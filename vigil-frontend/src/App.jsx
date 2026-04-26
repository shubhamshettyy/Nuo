import React, { useEffect, useMemo, useState } from 'react';
import { useGlobeData } from './hooks/useGlobeData';
import WorldMap from './components/WorldMap';
import CountryPanel from './components/CountryPanel';
import AlertBanner from './components/AlertBanner';
import './App.css';

function BootSequence({ progress }) {
  const paddedBar = `${'▓'.repeat(Math.round(progress / 5)).padEnd(20, '░')}`;

  return (
    <div className="boot-sequence">
      <div className="boot-vigil">VIGIL</div>
      <div className="boot-subtitle">GLOBAL THREAT INTELLIGENCE COMMAND CENTER</div>
      <div className="boot-lines">
        <p className="boot-line boot-l1">VIGIL SYSTEM INITIALIZING...</p>
        <p className="boot-line boot-l2">{`${paddedBar} ${progress}%`}</p>
        <p className="boot-line boot-l3">LOADING COUNTRY DATABASE [195 NODES]</p>
        <p className="boot-line boot-l4">ESTABLISHING FEED CONNECTIONS...</p>
      </div>
      <div className="boot-bar">
        <div className="boot-bar-fill" style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
    </div>
  );
}

function App() {
  const { countries, loading, error } = useGlobeData();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [bootProgress, setBootProgress] = useState(0);
  const [displayStats, setDisplayStats] = useState({
    monitored: 0,
    critical: 0,
    average: 0,
  });

  const stats = useMemo(() => {
    const withData = countries.filter((country) => country.index_value !== null && country.index_value !== undefined);
    const monitored = withData.length;
    const critical = withData.filter((country) => country.index_value >= 75).length;
    const average =
      monitored > 0
        ? Math.round(withData.reduce((acc, country) => acc + country.index_value, 0) / monitored)
        : 0;
    return { monitored, critical, average };
  }, [countries]);

  useEffect(() => {
    if (!loading) {
      setBootProgress(100);
      return undefined;
    }

    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(current + 3, 71);
      setBootProgress(current);
      if (current >= 71) clearInterval(interval);
    }, 85);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (loading || error) return undefined;

    const durationMs = 1200;
    const steps = 24;
    const stepMs = durationMs / steps;
    let step = 0;

    const interval = setInterval(() => {
      step += 1;
      const progress = Math.min(step / steps, 1);
      setDisplayStats({
        monitored: Math.round(stats.monitored * progress),
        critical: Math.round(stats.critical * progress),
        average: Math.round(stats.average * progress),
      });
      if (progress >= 1) clearInterval(interval);
    }, stepMs);

    return () => clearInterval(interval);
  }, [loading, error, stats]);

  return (
    <div className="app">
      {!loading && !error && <AlertBanner />}
      <header className="app-header">
        <div className="header-left">
          <h1 className="logo-title">VIGIL</h1>
          <div className="live-indicator">
            <span className="live-dot" />
            LIVE
          </div>
        </div>

        <div className="header-center">
          <div className="header-divider" />
          <div className="header-tagline">GLOBAL INFORMATION INTEGRITY MONITOR</div>
          <div className="header-divider" />
        </div>

        {!loading && !error && (
          <div className="stats" aria-live="polite">
            <div className="stat-item">
              <div className="stat-value">{displayStats.monitored}</div>
              <div className="stat-label">Countries</div>
            </div>
            <div className="stat-item">
              <div className="stat-value critical-count">{displayStats.critical}</div>
              <div className="stat-label">Critical Alerts</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{displayStats.average}</div>
              <div className="stat-label">Avg Index</div>
            </div>
          </div>
        )}
      </header>

      <main className="app-main">
        {loading && <BootSequence progress={bootProgress} />}

        {error && (
          <div className="error-state">
            <p>⚠ FEED ERROR</p>
            <p className="error-message">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <WorldMap
              countries={countries}
              onCountryClick={setSelectedCountry}
              selectedCountry={selectedCountry}
            />
            {selectedCountry && (
              <CountryPanel
                country={selectedCountry}
                onClose={() => setSelectedCountry(null)}
              />
            )}
          </>
        )}
      </main>

      {!loading && !error && (
        <div className="legend">
          <div className="legend-title">Integrity Risk Index</div>
          <div className="legend-gradient-bar"></div>
          <div className="legend-labels">
            <span>SAFE</span>
            <span>WATCH</span>
            <span>ELEVATED</span>
            <span>CRITICAL</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
