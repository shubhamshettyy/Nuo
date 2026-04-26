import { useState, useCallback, useRef } from 'react';

// Cache so switching back to a language is instant
const cache = new Map();

async function translateViaClaude(text, targetLangName) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Translate the following text to ${targetLangName}. Return ONLY the translated text, no explanations, no quotes.\n\n${text}`,
      }],
    }),
  });
  if (!res.ok) throw new Error('Translation failed');
  const data = await res.json();
  return data.content[0].text.trim();
}

export function useTranslateSummary() {
  const [translating, setTranslating] = useState(false);

  const translate = useCallback(async (text, langCode, langName) => {
    if (!text || langCode === 'en') return text;

    const key = `${langCode}:${text.slice(0, 80)}`;
    if (cache.has(key)) return cache.get(key);

    try {
      setTranslating(true);
      const result = await translateViaClaude(text, langName);
      cache.set(key, result);
      return result;
    } catch {
      return text; // graceful fallback — show English
    } finally {
      setTranslating(false);
    }
  }, []);

  return { translate, translating };
}
