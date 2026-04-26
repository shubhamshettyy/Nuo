import { useState, useCallback, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Cache translations to avoid re-fetching
const cache = new Map();

function cacheKey(text, targetLang) {
  return `${targetLang}:${text.slice(0, 60)}`;
}

async function translateViaClaude(text, targetLangName) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Translate the following text to ${targetLangName}. Return ONLY the translated text, nothing else, no explanations, no quotes.\n\nText to translate:\n${text}`,
      }],
    }),
  });

  if (!response.ok) throw new Error('Translation API failed');
  const data = await response.json();
  return data.content[0].text.trim();
}

export function useTranslation() {
  const [translating, setTranslating] = useState(false);
  const abortRef = useRef(null);

  const translateText = useCallback(async (text, targetLangCode, targetLangName) => {
    if (!text || targetLangCode === 'en') return text;

    const key = cacheKey(text, targetLangCode);
    if (cache.has(key)) return cache.get(key);

    try {
      setTranslating(true);
      const result = await translateViaClaude(text, targetLangName);
      cache.set(key, result);
      return result;
    } catch (e) {
      console.warn('Translation failed, showing original:', e);
      return text; // graceful fallback — show original
    } finally {
      setTranslating(false);
    }
  }, []);

  // Translate multiple fields at once (batched for efficiency)
  const translateArticle = useCallback(async (article, targetLangCode, targetLangName) => {
    if (targetLangCode === 'en') return article;

    const fieldsToTranslate = ['title', 'description', 'summary'];
    const translated = { ...article };

    await Promise.all(fieldsToTranslate.map(async (field) => {
      if (article[field]) {
        translated[field] = await translateText(article[field], targetLangCode, targetLangName);
      }
    }));

    return translated;
  }, [translateText]);

  const translateBrief = useCallback(async (text, targetLangCode, targetLangName) => {
    if (!text || targetLangCode === 'en') return text;
    return translateText(text, targetLangCode, targetLangName);
  }, [translateText]);

  return { translateText, translateArticle, translateBrief, translating };
}
