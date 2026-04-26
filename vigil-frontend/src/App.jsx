import React, { useState } from 'react';
import { useGlobeData } from './hooks/useGlobeData';
import { useCountryDetails } from './hooks/useCountryDetails';
import { useAlerts } from './hooks/useAlerts';
import { useBackendHealth } from './hooks/useBackendHealth';
import WorldMap from './components/WorldMap';
import CountryPanel from './components/CountryPanel';
import AlertBanner from './components/AlertBanner';
import './App.css';

function App() {
  const { countries, loading, error } = useGlobeData();
  const { details, articles, loading: detailsLoading, fetchDetails, clearDetails } = useCountryDetails();
  const { alerts } = useAlerts();
  const { status: backendStatus, latencyMs } = useBackendHealth();
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleCountryClick = async (country) => {
    console.log('[App] Country clicked:', country.name);
    setSelectedCountry(country);
    await fetchDetails(country.iso3);
  };

  const handleClosePanel = () => {
    setSelectedCountry(null);
    clearDetails();
  };

  return (
    <div className="app">
      {alerts.length > 0 && <AlertBanner alerts={alerts} />}
      
      <header className="header">
        <div className="header-brand">
          <div className="brand-name">NUO</div>
          <div className="brand-tagline">Global Information Integrity Monitor</div>
        </div>
        
        <div className="header-center">
          <div className="live-pill">
            <div className="live-dot"></div>
            LIVE
          </div>
        </div>
        
        {!loading && !error && (
          <div className="header-right">
            <div className="h-stat">
              <div className="h-stat-val">{countries.length}</div>
              <div className="h-stat-lbl">Countries</div>
            </div>
            <div className="h-stat">
              <div className="h-stat-val">
                {countries.filter(c => c.index_value !== null).length}
              </div>
              <div className="h-stat-lbl">Monitored</div>
            </div>
            <div className="h-stat">
              <div className="h-stat-val">
                {backendStatus === 'mock' ? 'MOCK' : backendStatus === 'ok' ? 'OK' : backendStatus === 'down' ? 'OFF' : '...'}
              </div>
              <div className="h-stat-lbl">
                Backend{backendStatus === 'ok' && latencyMs != null ? ` (${latencyMs}ms)` : ''}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="main">
        {loading && (
          <div className="boot">
            <div className="boot-title">NUO</div>
            <div className="boot-sub">Loading global data...</div>
            <div className="boot-bar">
              <div className="boot-fill" style={{ transform: 'scaleX(0.7)' }}></div>
            </div>
          </div>
        )}

        {error && (
          <div className="boot">
            <div className="boot-title">⚠️ Error</div>
            <div className="boot-sub">{error}</div>
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
                details={details}
                articles={articles}
                loading={detailsLoading}
                onClose={handleClosePanel}
              />
            )}

            <div className="legend">
              <div className="legend-title">Risk Level</div>
              <div className="legend-bar"></div>
              <div className="legend-labels">
                <span>LOW</span>
                <span>HIGH</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;