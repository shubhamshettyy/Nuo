import React, { useState, useEffect, useMemo } from 'react';
import { useGlobeData } from './hooks/useGlobeData';
import { useCountryDetails } from './hooks/useCountryDetails';
import { useAlerts } from './hooks/useAlerts';
import { useBackendHealth } from './hooks/useBackendHealth';
import WorldMap from './components/WorldMap';
import CountryPanel from './components/CountryPanel';
import { t } from './data/ui-strings';
import './App.css';

const LANGUAGES = [
  { code:'en',label:'English' },{ code:'ar',label:'العربية' },
  { code:'zh',label:'中文' },{ code:'hi',label:'हिन्दी' },
  { code:'es',label:'Español' },{ code:'fr',label:'Français' },
  { code:'pt',label:'Português' },{ code:'ru',label:'Русский' },
  { code:'de',label:'Deutsch' },{ code:'ja',label:'日本語' },
  { code:'ko',label:'한국어' },{ code:'tr',label:'Türkçe' },
  { code:'sw',label:'Kiswahili' },{ code:'bn',label:'বাংলা' },
  { code:'id',label:'Bahasa' },{ code:'uk',label:'Українська' },
];

const RTL = ['ar','fa','ur','he'];

function AlertBanner({ alerts, lang }) {
  const [gone, setGone] = useState(false);
  if (!alerts?.length || gone) return null;
  const ticker = alerts.map(a => a.message).join('   ·   ');
  return (
    <div className="alert-banner">
      <span className="alert-tag">{t(lang,'alert')}</span>
      <div style={{flex:1,overflow:'hidden',maskImage:'linear-gradient(to right,transparent,#000 4%,#000 96%,transparent)'}}>
        <div style={{display:'flex',width:'max-content',gap:60,animation:'ticker 35s linear infinite',fontSize:11,color:'#c0392b',whiteSpace:'nowrap'}}>
          <span>{ticker}</span><span>{ticker}</span>
        </div>
      </div>
      <button onClick={()=>setGone(true)} style={{background:'none',border:'none',color:'#ccc',fontSize:16,cursor:'pointer'}}>×</button>
    </div>
  );
}

export default function App() {
  const { countries, loading, error } = useGlobeData();
  const { details, articles, loading: detailsLoading, fetchDetails, clearDetails } = useCountryDetails();
  const { alerts } = useAlerts();
  useBackendHealth();

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [category, setCategory]               = useState('all');
  const [theme, setTheme]                     = useState('light');
  const [lang, setLang]                       = useState(() => {
    const detected = navigator.language?.slice(0,2) || 'en';
    return LANGUAGES.find(l => l.code === detected) ? detected : 'en';
  });
  const [langOpen, setLangOpen] = useState(false);
  const [boot, setBoot]         = useState(0);

  const isRTL = RTL.includes(lang);

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  useEffect(() => { document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr'); }, [isRTL]);

  useEffect(() => {
    if (!loading) { setBoot(100); return; }
    let v = 0;
    const id = setInterval(() => { v = Math.min(v+5,75); setBoot(v); if(v>=75) clearInterval(id); }, 70);
    return () => clearInterval(id);
  }, [loading]);

  const CATEGORIES = [
    { id:'all',                       label: t(lang,'allStories') },
    { id:'Armed Conflict & Violence', label: t(lang,'armedConflict') },
    { id:'Public Health Crises',      label: t(lang,'publicHealth') },
    { id:'Human Rights Violations',   label: t(lang,'humanRights') },
    { id:'Environmental Restoration', label: t(lang,'environment') },
    { id:'Social Progress',           label: t(lang,'socialProgress') },
    { id:'Scientific Breakthroughs',  label: t(lang,'science') },
  ];

  const mapped = useMemo(() => {
    if (category === 'all') return countries;
    return countries.map(c => ({ ...c, index_value: c.category_scores?.[category] ?? c.index_value }));
  }, [countries, category]);

  const handleCountryClick = async (country) => { setSelectedCountry(country); await fetchDetails(country.iso3); };
  const handleClose = () => { setSelectedCountry(null); clearDetails(); };
  const switchCat = (id) => { setCategory(id); setSelectedCountry(null); clearDetails(); };

  const currentLang   = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const criticalCount = countries.filter(c => c.index_value >= 65).length;

  return (
    <div className="app">
      {alerts?.length > 0 && <AlertBanner alerts={alerts} lang={lang} />}

      <header className="header">
        <div className="header-brand">
          <div className="brand-name">{t(lang,'brand')}</div>
          <div className="brand-tagline">{t(lang,'tagline')}</div>
        </div>
        <div className="header-center">
          <div className="live-pill">
            <div className="live-dot" />
            {t(lang,'updatesEvery')}
          </div>
        </div>
        <div className="header-right">
          {!loading && !error && (
            <>
              <div className="h-stat">
                <div className="h-stat-val">{countries.length}</div>
                <div className="h-stat-lbl">{t(lang,'countries')}</div>
              </div>
              <div className="h-stat">
                <div className="h-stat-val" style={{color:criticalCount>0?'#c0392b':undefined}}>{criticalCount}</div>
                <div className="h-stat-lbl">{t(lang,'critical')}</div>
              </div>
            </>
          )}
          <button className="ctrl-btn" onClick={() => setTheme(th => th==='light'?'dark':'light')}>
            {theme==='light' ? t(lang,'dark') : t(lang,'light')}
          </button>
          <div style={{position:'relative'}}>
            <button className="ctrl-btn" onClick={() => setLangOpen(o=>!o)}>
              {currentLang.label} <span style={{fontSize:8,color:'#bbb',marginLeft:3}}>▼</span>
            </button>
            {langOpen && (
              <div className="lang-drop">
                {LANGUAGES.map(l => (
                  <button key={l.code} className={`lang-item${lang===l.code?' on':''}`}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {!loading && !error && (
        <nav className="category-nav">
          {CATEGORIES.map((cat,i) => (
            <React.Fragment key={cat.id}>
              {i===1 && <div className="cat-sep" />}
              <button className={`cat-btn${category===cat.id?' active':''}`} onClick={() => switchCat(cat.id)}>
                {cat.label}
              </button>
            </React.Fragment>
          ))}
        </nav>
      )}

      <main className="main">
        {loading && (
          <div className="boot">
            <div className="boot-title">{t(lang,'brand')}</div>
            <div className="boot-sub">{t(lang,'loading')}</div>
            <div className="boot-bar"><div className="boot-fill" style={{transform:`scaleX(${boot/100})`}} /></div>
          </div>
        )}
        {error && <div className="boot"><div className="boot-title">Error</div><div className="boot-sub">{error}</div></div>}
        {!loading && !error && (
          <>
            <WorldMap countries={mapped} onCountryClick={handleCountryClick} selectedCountry={selectedCountry} activeCategory={category} />
            {selectedCountry && (
              <CountryPanel country={selectedCountry} details={details} articles={articles}
                loading={detailsLoading} onClose={handleClose} lang={lang} />
            )}
            <div className="legend">
              <div className="legend-title">{t(lang,'coverageGap')}</div>
              <div className="legend-bar" />
              <div className="legend-labels"><span>{t(lang,'low')}</span><span>{t(lang,'critical')}</span></div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
