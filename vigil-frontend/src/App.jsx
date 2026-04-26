import React, { useState } from 'react';
import { useGlobeData } from './hooks/useGlobeData';
import WorldMap from './components/WorldMap';
import CountryPanel from './components/CountryPanel';
import './App.css';

function App() {
  const { countries, loading, error } = useGlobeData();
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
  };

  const handleClosePanel = () => {
    setSelectedCountry(null);
  };

  return (
    <div className="app">
      {/* <AlertBanner /> */}
      
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">👁️</div>
          <div className="logo-text">
            <h1>VIGIL</h1>
            <p>Global Information Integrity Monitor</p>
          </div>
        </div>
        
        {!loading && !error && (
          <div className="stats">
            <div className="stat-item">
              <div className="stat-value">{countries.length}</div>
              <div className="stat-label">Countries</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {countries.filter(c => c.index_value !== null).length}
              </div>
              <div className="stat-label">Monitored</div>
            </div>
          </div>
        )}
      </header>

      <main className="app-main">
        {loading && (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading global data...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>⚠️ Failed to load data</p>
            <p className="error-message">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <WorldMap
              countries={countries}
              onCountryClick={handleCountryClick}
              selectedCountry={selectedCountry}
            />
            
            {selectedCountry && (
              <CountryPanel
                country={selectedCountry}
                onClose={handleClosePanel}
              />
            )}
          </>
        )}
      </main>

      <div className="legend">
        <div className="legend-title">Risk Level</div>
        <div className="legend-scale">
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#10b981' }}></div>
            <span>Low</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#84cc16' }}></div>
            <span>Moderate</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#fbbf24' }}></div>
            <span>Elevated</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#ef4444' }}></div>
            <span>Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;