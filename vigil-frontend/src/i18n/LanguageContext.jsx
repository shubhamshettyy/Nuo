import React, { createContext, useContext, useState } from 'react';
import { LANGUAGES } from './languages';

const Ctx = createContext(null);

export function LanguageProvider({ children }) {
  const detected = navigator.language?.slice(0, 2) || 'en';
  const initial  = LANGUAGES.find(l => l.code === detected)?.code || 'en';
  const [lang, setLang] = useState(initial);
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <Ctx.Provider value={{ lang, setLang, current, LANGUAGES }}>
      <div dir={current.rtl ? 'rtl' : 'ltr'} style={{ height: '100%' }}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

export const useLang = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLang outside LanguageProvider');
  return ctx;
};
