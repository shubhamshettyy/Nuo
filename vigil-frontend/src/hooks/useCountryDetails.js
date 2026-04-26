import { useState, useCallback } from 'react';
import { mockCountryDetails } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export function useCountryDetails() {
  const [details, setDetails] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetails = useCallback(async (iso3) => {
    if (!iso3) return;

    setLoading(true);
    setError(null);

    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const countryDetails = mockCountryDetails[iso3];
      
      if (countryDetails) {
        setDetails(countryDetails);
        // Sort articles by impact_score descending
        const sortedArticles = (countryDetails.news_articles || []).sort((a, b) => 
          b.impact_score - a.impact_score
        );
        setArticles(sortedArticles);
      } else {
        // Generate default details for countries without specific data
        const basicCountry = {
          iso3,
          name: iso3,
          index_value: Math.random() * 100,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          change_24h: (Math.random() - 0.5) * 10,
          last_updated: new Date().toISOString(),
          metrics: {
            misinformation_score: Math.floor(Math.random() * 100),
            bot_activity: Math.floor(Math.random() * 100),
            fact_check_ratio: Math.floor(Math.random() * 100),
            source_diversity: Math.floor(Math.random() * 100)
          },
          trending_topics: [],
          news_articles: []
        };
        setDetails(basicCountry);
        setArticles([]);
      }
      
      setLoading(false);
      return;
    }

    // Fetch from real backend API
    try {
      // Fetch both details and articles in parallel
      const [detailsResponse, articlesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/country/${iso3}/details`),
        fetch(`${API_BASE_URL}/api/country/${iso3}/articles`)
      ]);

      if (!detailsResponse.ok) {
        throw new Error(`Failed to fetch details: ${detailsResponse.status}`);
      }

      if (!articlesResponse.ok) {
        throw new Error(`Failed to fetch articles: ${articlesResponse.status}`);
      }

      const detailsData = await detailsResponse.json();
      const articlesData = await articlesResponse.json();

      console.log(`[useCountryDetails] Loaded ${iso3}:`, {
        index: detailsData.index_value,
        total_articles: articlesData.total_articles,
        categories: articlesData.categories_with_articles?.length || 0
      });

      setDetails(detailsData);
      
      // Sort articles by impact_score descending (highest impact first)
      const sortedArticles = (articlesData.articles || []).sort((a, b) => 
        b.impact_score - a.impact_score
      );
      
      setArticles(sortedArticles);

    } catch (err) {
      console.error(`[useCountryDetails] Error for ${iso3}:`, err);
      setError(err.message);
      setDetails(null);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearDetails = useCallback(() => {
    setDetails(null);
    setArticles([]);
    setError(null);
  }, []);

  return { details, articles, loading, error, fetchDetails, clearDetails };
}