import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '../i18n/LanguageContext';

const css = `
.lang-wrap { position: relative; flex-shrink: 0; }

.lang-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 16px;
  height: 50px;
  background: none;
  border: none;
  border-left: 1px solid var(--border);
  color: var(--text2);
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s;
}
.lang-btn:hover { color: var(--text); }

.lang-chevron {
  font-size: 9px;
  color: var(--text3);
  transition: transform 0.15s;
}
.lang-chevron.open { transform: rotate(180deg); }

.lang-drop {
  position: absolute;
  top: calc(100% + 2px);
  right: 0;
  width: 230px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 300;
  overflow: hidden;
  animation: fade-in 0.15s ease;
}

.lang-search {
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-bottom: 1px solid var(--border);
  background: var(--bg3);
  color: var(--text);
  font-family: var(--sans);
  font-size: 12px;
  outline: none;
}
.lang-search::placeholder { color: var(--text3); }

.lang-list { max-height: 260px; overflow-y: auto; }

.lang-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 9px 12px;
  background: none;
  border: none;
  color: var(--text2);
  font-family: var(--sans);
  font-size: 12px;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}
.lang-item:hover { background: var(--bg3); color: var(--text); }
.lang-item.active { color: var(--text); font-weight: 600; }

.lang-native { flex: 1; }
.lang-en { font-size: 10px; color: var(--text3); }
`;

export default function LanguageSwitcher() {
  const { lang, setLang, current, LANGUAGES } = useLang();
  const [open, setOpen]   = useState(false);
  const [q, setQ]         = useState('');
  const ref               = useRef(null);

  // Inject CSS once
  useEffect(() => {
    if (document.getElementById('lang-css')) return;
    const el = document.createElement('style');
    el.id = 'lang-css';
    el.textContent = css;
    document.head.appendChild(el);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQ(''); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(q.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="lang-wrap" ref={ref}>
      <button className="lang-btn" onClick={() => setOpen(o => !o)}>
        {current.nativeName}
        <span className={`lang-chevron${open ? ' open' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="lang-drop">
          <input
            className="lang-search"
            placeholder="Search language..."
            value={q}
            onChange={e => setQ(e.target.value)}
            autoFocus
          />
          <div className="lang-list">
            {filtered.map(l => (
              <button
                key={l.code}
                className={`lang-item${lang === l.code ? ' active' : ''}`}
                onClick={() => { setLang(l.code); setOpen(false); setQ(''); }}
              >
                <span className="lang-native">{l.nativeName}</span>
                <span className="lang-en">{l.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
