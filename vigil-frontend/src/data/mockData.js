// ─── CATEGORY DEFINITIONS ────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: 'all',      label: 'All Crises',  icon: '🌐' },
  { id: 'war',      label: 'War',         icon: '⚔️'  },
  { id: 'water',    label: 'Water',       icon: '💧' },
  { id: 'famine',   label: 'Famine',      icon: '🌾' },
  { id: 'disease',  label: 'Disease',     icon: '🦠' },
  { id: 'climate',  label: 'Climate',     icon: '🌡️'  },
  { id: 'tech',     label: 'Tech',        icon: '📡' },
];

// ─── COUNTRIES ───────────────────────────────────────────────────────────────
// Each country has index_value per category — higher = more ignored in that category
export const mockCountries = [
  // index_value is the DEFAULT (all) category score
  // category_scores override per category
  {
    iso3: 'SDN', name: 'Sudan',
    index_value: 98, latitude: 12.86, longitude: 30.21,
    invisible_index: 18910, displaced_persons: 10800000, conflict_events: 31, article_count: 5,
    category_scores: { war: 99, water: 88, famine: 95, disease: 72, climate: 60, tech: 20 },
  },
  {
    iso3: 'AGO', name: 'Angola',
    index_value: 92, latitude: -11.2, longitude: 17.87,
    invisible_index: 15847, displaced_persons: 7300000, conflict_events: 14, article_count: 2,
    category_scores: { war: 85, water: 90, famine: 92, disease: 78, climate: 55, tech: 18 },
  },
  {
    iso3: 'TCD', name: 'Chad',
    index_value: 88, latitude: 15.45, longitude: 18.73,
    invisible_index: 13240, displaced_persons: 1100000, conflict_events: 9, article_count: 1,
    category_scores: { war: 80, water: 95, famine: 90, disease: 85, climate: 70, tech: 15 },
  },
  {
    iso3: 'CAF', name: 'Central African Republic',
    index_value: 84, latitude: 6.61, longitude: 20.94,
    invisible_index: 11430, displaced_persons: 750000, conflict_events: 7, article_count: 1,
    category_scores: { war: 90, water: 82, famine: 88, disease: 75, climate: 50, tech: 12 },
  },
  {
    iso3: 'COD', name: 'DR Congo',
    index_value: 79, latitude: -4.0, longitude: 21.76,
    invisible_index: 9102, displaced_persons: 6900000, conflict_events: 22, article_count: 3,
    category_scores: { war: 88, water: 78, famine: 82, disease: 88, climate: 60, tech: 22 },
  },
  {
    iso3: 'SOM', name: 'Somalia',
    index_value: 74, latitude: 5.15, longitude: 46.2,
    invisible_index: 7880, displaced_persons: 3100000, conflict_events: 12, article_count: 4,
    category_scores: { war: 78, water: 85, famine: 88, disease: 70, climate: 65, tech: 14 },
  },
  {
    iso3: 'ETH', name: 'Ethiopia',
    index_value: 70, latitude: 9.14, longitude: 40.49,
    invisible_index: 6540, displaced_persons: 4200000, conflict_events: 8, article_count: 6,
    category_scores: { war: 72, water: 80, famine: 85, disease: 75, climate: 68, tech: 25 },
  },
  {
    iso3: 'MMR', name: 'Myanmar',
    index_value: 65, latitude: 19.16, longitude: 96.63,
    invisible_index: 5200, displaced_persons: 2000000, conflict_events: 20, article_count: 4,
    category_scores: { war: 82, water: 60, famine: 70, disease: 62, climate: 55, tech: 30 },
  },
  {
    iso3: 'SSD', name: 'South Sudan',
    index_value: 62, latitude: 6.88, longitude: 31.31,
    invisible_index: 4820, displaced_persons: 2200000, conflict_events: 11, article_count: 3,
    category_scores: { war: 75, water: 88, famine: 80, disease: 70, climate: 58, tech: 10 },
  },
  {
    iso3: 'YEM', name: 'Yemen',
    index_value: 58, latitude: 15.55, longitude: 48.52,
    invisible_index: 4210, displaced_persons: 4500000, conflict_events: 18, article_count: 12,
    category_scores: { war: 55, water: 82, famine: 78, disease: 65, climate: 50, tech: 20 },
  },
  {
    iso3: 'AFG', name: 'Afghanistan',
    index_value: 52, latitude: 33.94, longitude: 67.71,
    invisible_index: 3100, displaced_persons: 3500000, conflict_events: 16, article_count: 7,
    category_scores: { war: 60, water: 75, famine: 72, disease: 60, climate: 55, tech: 18 },
  },
  {
    iso3: 'HTI', name: 'Haiti',
    index_value: 49, latitude: 18.97, longitude: -72.29,
    invisible_index: 2900, displaced_persons: 600000, conflict_events: 9, article_count: 3,
    category_scores: { war: 55, water: 78, famine: 70, disease: 72, climate: 80, tech: 15 },
  },
  {
    iso3: 'MLI', name: 'Mali',
    index_value: 46, latitude: 17.57, longitude: -3.99,
    invisible_index: 2600, displaced_persons: 400000, conflict_events: 8, article_count: 2,
    category_scores: { war: 65, water: 85, famine: 75, disease: 60, climate: 72, tech: 12 },
  },
  {
    iso3: 'NER', name: 'Niger',
    index_value: 44, latitude: 17.61, longitude: 8.08,
    invisible_index: 2300, displaced_persons: 350000, conflict_events: 6, article_count: 2,
    category_scores: { war: 55, water: 92, famine: 80, disease: 65, climate: 78, tech: 10 },
  },
  {
    iso3: 'BFA', name: 'Burkina Faso',
    index_value: 42, latitude: 12.36, longitude: -1.53,
    invisible_index: 2100, displaced_persons: 1900000, conflict_events: 11, article_count: 3,
    category_scores: { war: 68, water: 80, famine: 72, disease: 62, climate: 70, tech: 14 },
  },
  {
    iso3: 'EGY', name: 'Egypt',
    index_value: 25, latitude: 26.82, longitude: 30.80,
    invisible_index: 900, displaced_persons: 200000, conflict_events: 3, article_count: 28,
    category_scores: { war: 20, water: 88, famine: 35, disease: 30, climate: 55, tech: 40 },
  },
  {
    iso3: 'PAK', name: 'Pakistan',
    index_value: 42, latitude: 30.38, longitude: 69.35,
    invisible_index: 2050, displaced_persons: 800000, conflict_events: 12, article_count: 14,
    category_scores: { war: 45, water: 82, famine: 55, disease: 58, climate: 75, tech: 65 },
  },
  {
    iso3: 'IND', name: 'India',
    index_value: 16, latitude: 20.59, longitude: 78.96,
    invisible_index: 420, displaced_persons: 500000, conflict_events: 6, article_count: 75,
    category_scores: { war: 12, water: 70, famine: 30, disease: 35, climate: 60, tech: 8 },
  },
  {
    iso3: 'BGD', name: 'Bangladesh',
    index_value: 45, latitude: 23.68, longitude: 90.36,
    invisible_index: 2200, displaced_persons: 700000, conflict_events: 4, article_count: 8,
    category_scores: { war: 30, water: 78, famine: 60, disease: 55, climate: 92, tech: 35 },
  },
  {
    iso3: 'PHL', name: 'Philippines',
    index_value: 35, latitude: 12.88, longitude: 121.77,
    invisible_index: 1500, displaced_persons: 300000, conflict_events: 5, article_count: 12,
    category_scores: { war: 28, water: 55, famine: 40, disease: 45, climate: 88, tech: 30 },
  },
  {
    iso3: 'MOZ', name: 'Mozambique',
    index_value: 38, latitude: -18.67, longitude: 35.53,
    invisible_index: 1900, displaced_persons: 800000, conflict_events: 5, article_count: 3,
    category_scores: { war: 45, water: 75, famine: 65, disease: 60, climate: 85, tech: 15 },
  },
  {
    iso3: 'SYR', name: 'Syria',
    index_value: 35, latitude: 34.8, longitude: 38.99,
    invisible_index: 1840, displaced_persons: 6600000, conflict_events: 11, article_count: 9,
    category_scores: { war: 30, water: 65, famine: 55, disease: 40, climate: 35, tech: 22 },
  },
  {
    iso3: 'IRQ', name: 'Iraq',
    index_value: 30, latitude: 33.22, longitude: 43.68,
    invisible_index: 950, displaced_persons: 1200000, conflict_events: 9, article_count: 12,
    category_scores: { war: 28, water: 70, famine: 40, disease: 35, climate: 50, tech: 28 },
  },
  {
    iso3: 'LBN', name: 'Lebanon',
    index_value: 34, latitude: 33.85, longitude: 35.86,
    invisible_index: 1600, displaced_persons: 1500000, conflict_events: 5, article_count: 14,
    category_scores: { war: 30, water: 72, famine: 55, disease: 40, climate: 45, tech: 30 },
  },
  {
    iso3: 'NGA', name: 'Nigeria',
    index_value: 22, latitude: 9.08, longitude: 8.68,
    invisible_index: 800, displaced_persons: 2100000, conflict_events: 14, article_count: 14,
    category_scores: { war: 35, water: 65, famine: 55, disease: 70, climate: 60, tech: 35 },
  },
  {
    iso3: 'ZWE', name: 'Zimbabwe',
    index_value: 32, latitude: -19.02, longitude: 29.15,
    invisible_index: 1600, displaced_persons: 200000, conflict_events: 2, article_count: 3,
    category_scores: { war: 20, water: 72, famine: 65, disease: 55, climate: 60, tech: 20 },
  },
  {
    iso3: 'CMR', name: 'Cameroon',
    index_value: 30, latitude: 7.37, longitude: 12.35,
    invisible_index: 1400, displaced_persons: 500000, conflict_events: 6, article_count: 3,
    category_scores: { war: 45, water: 60, famine: 55, disease: 60, climate: 55, tech: 15 },
  },
  {
    iso3: 'VEN', name: 'Venezuela',
    index_value: 26, latitude: 6.42, longitude: -66.59,
    invisible_index: 1100, displaced_persons: 5000000, conflict_events: 3, article_count: 8,
    category_scores: { war: 22, water: 55, famine: 60, disease: 50, climate: 40, tech: 38 },
  },
  {
    iso3: 'UKR', name: 'Ukraine',
    index_value: 2, latitude: 48.38, longitude: 31.17,
    invisible_index: 0.3, displaced_persons: 6000000, conflict_events: 40, article_count: 280,
    category_scores: { war: 2, water: 15, famine: 8, disease: 5, climate: 10, tech: 12 },
  },
  {
    iso3: 'RUS', name: 'Russia',
    index_value: 8, latitude: 61.52, longitude: 105.32,
    invisible_index: 180, displaced_persons: 0, conflict_events: 5, article_count: 120,
    category_scores: { war: 5, water: 20, famine: 10, disease: 8, climate: 15, tech: 10 },
  },
  {
    iso3: 'CHN', name: 'China',
    index_value: 15, latitude: 35.86, longitude: 104.19,
    invisible_index: 380, displaced_persons: 0, conflict_events: 2, article_count: 90,
    category_scores: { war: 12, water: 35, famine: 18, disease: 20, climate: 30, tech: 5 },
  },
  {
    iso3: 'USA', name: 'United States',
    index_value: 5, latitude: 37.09, longitude: -95.71,
    invisible_index: 80, displaced_persons: 0, conflict_events: 0, article_count: 200,
    category_scores: { war: 3, water: 10, famine: 5, disease: 4, climate: 8, tech: 2 },
  },
  {
    iso3: 'GBR', name: 'United Kingdom',
    index_value: 4, latitude: 55.38, longitude: -3.44,
    invisible_index: 60, displaced_persons: 0, conflict_events: 0, article_count: 180,
    category_scores: { war: 3, water: 8, famine: 4, disease: 3, climate: 6, tech: 3 },
  },
  {
    iso3: 'DEU', name: 'Germany',
    index_value: 3, latitude: 51.17, longitude: 10.45,
    invisible_index: 40, displaced_persons: 0, conflict_events: 0, article_count: 160,
    category_scores: { war: 2, water: 7, famine: 3, disease: 3, climate: 5, tech: 3 },
  },
  {
    iso3: 'FRA', name: 'France',
    index_value: 4, latitude: 46.23, longitude: 2.21,
    invisible_index: 55, displaced_persons: 0, conflict_events: 0, article_count: 150,
    category_scores: { war: 3, water: 8, famine: 4, disease: 3, climate: 6, tech: 4 },
  },
  {
    iso3: 'ISR', name: 'Israel',
    index_value: 6, latitude: 31.05, longitude: 34.85,
    invisible_index: 100, displaced_persons: 200000, conflict_events: 18, article_count: 160,
    category_scores: { war: 4, water: 25, famine: 10, disease: 6, climate: 15, tech: 5 },
  },
  {
    iso3: 'PSE', name: 'Palestine',
    index_value: 10, latitude: 31.95, longitude: 35.23,
    invisible_index: 2, displaced_persons: 1900000, conflict_events: 55, article_count: 190,
    category_scores: { war: 8, water: 40, famine: 35, disease: 20, climate: 25, tech: 18 },
  },
  {
    iso3: 'TUR', name: 'Turkey',
    index_value: 20, latitude: 38.96, longitude: 35.24,
    invisible_index: 650, displaced_persons: 3600000, conflict_events: 4, article_count: 18,
    category_scores: { war: 18, water: 45, famine: 25, disease: 20, climate: 40, tech: 22 },
  },
  {
    iso3: 'IRN', name: 'Iran',
    index_value: 38, latitude: 32.43, longitude: 53.69,
    invisible_index: 1750, displaced_persons: 0, conflict_events: 4, article_count: 14,
    category_scores: { war: 35, water: 70, famine: 40, disease: 35, climate: 55, tech: 30 },
  },
  {
    iso3: 'SAU', name: 'Saudi Arabia',
    index_value: 20, latitude: 23.89, longitude: 45.08,
    invisible_index: 650, displaced_persons: 0, conflict_events: 2, article_count: 42,
    category_scores: { war: 15, water: 60, famine: 18, disease: 15, climate: 45, tech: 15 },
  },
  {
    iso3: 'BRA', name: 'Brazil',
    index_value: 18, latitude: -14.24, longitude: -51.93,
    invisible_index: 520, displaced_persons: 100000, conflict_events: 2, article_count: 60,
    category_scores: { war: 10, water: 30, famine: 22, disease: 28, climate: 55, tech: 18 },
  },
  {
    iso3: 'MEX', name: 'Mexico',
    index_value: 22, latitude: 23.63, longitude: -102.55,
    invisible_index: 720, displaced_persons: 350000, conflict_events: 8, article_count: 55,
    category_scores: { war: 28, water: 50, famine: 30, disease: 25, climate: 45, tech: 20 },
  },
  {
    iso3: 'ZAF', name: 'South Africa',
    index_value: 14, latitude: -30.56, longitude: 22.94,
    invisible_index: 340, displaced_persons: 50000, conflict_events: 1, article_count: 32,
    category_scores: { war: 10, water: 55, famine: 30, disease: 35, climate: 50, tech: 22 },
  },
  {
    iso3: 'KEN', name: 'Kenya',
    index_value: 22, latitude: -0.02, longitude: 37.91,
    invisible_index: 700, displaced_persons: 200000, conflict_events: 3, article_count: 9,
    category_scores: { war: 18, water: 68, famine: 50, disease: 55, climate: 65, tech: 28 },
  },
  {
    iso3: 'AUS', name: 'Australia',
    index_value: 2, latitude: -25.27, longitude: 133.78,
    invisible_index: 30, displaced_persons: 0, conflict_events: 0, article_count: 110,
    category_scores: { war: 2, water: 12, famine: 3, disease: 3, climate: 8, tech: 4 },
  },
  {
    iso3: 'JPN', name: 'Japan',
    index_value: 3, latitude: 36.20, longitude: 138.25,
    invisible_index: 42, displaced_persons: 0, conflict_events: 0, article_count: 120,
    category_scores: { war: 2, water: 8, famine: 3, disease: 5, climate: 10, tech: 3 },
  },
  {
    iso3: 'KOR', name: 'South Korea',
    index_value: 4, latitude: 35.91, longitude: 127.77,
    invisible_index: 55, displaced_persons: 0, conflict_events: 0, article_count: 90,
    category_scores: { war: 3, water: 10, famine: 4, disease: 4, climate: 8, tech: 4 },
  },
  {
    iso3: 'IDN', name: 'Indonesia',
    index_value: 30, latitude: -0.79, longitude: 113.92,
    invisible_index: 1200, displaced_persons: 200000, conflict_events: 3, article_count: 18,
    category_scores: { war: 18, water: 55, famine: 35, disease: 45, climate: 75, tech: 30 },
  },
  {
    iso3: 'POL', name: 'Poland',
    index_value: 5, latitude: 51.92, longitude: 19.15,
    invisible_index: 72, displaced_persons: 1000000, conflict_events: 0, article_count: 80,
    category_scores: { war: 4, water: 12, famine: 5, disease: 4, climate: 10, tech: 5 },
  },
];

// ─── ALERTS ──────────────────────────────────────────────────────────────────
export const mockAlerts = [
  {
    country_iso3: 'SDN',
    country_name: 'Sudan',
    message: 'Critical spike detected: Invisible Index surged to 18,910 (+10,710 in last cycle)',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    severity: 'critical',
  },
  {
    country_iso3: 'AGO',
    country_name: 'Angola',
    message: 'Severe underreporting: 7.3M people in crisis, only 2 articles published this cycle',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    severity: 'high',
  },
];

// ─── BRIEFS ──────────────────────────────────────────────────────────────────
export const mockBriefs = {
  SDN: 'Sudan has over 10.8 million displaced people amid a brutal civil war between the Sudanese Armed Forces and the Rapid Support Forces, creating the world\'s largest displacement crisis with mass famine spreading across Darfur and Khartoum state. The conflict has received a fraction of the media coverage given to other wars of comparable scale, partly because journalists face extreme access restrictions and partly because the story began without a clear geopolitical villain recognizable to Western audiences. Sustained diplomatic pressure on both warring factions, emergency food corridor guarantees, and a dedicated international media presence in Port Sudan would be the most direct interventions.',
  AGO: 'Angola has 7.3 million people requiring humanitarian assistance, with protracted conflict in Cabinda and severe food insecurity affecting southern provinces following two consecutive years of drought. The crisis receives virtually no international coverage because Angola lacks the geopolitical salience of conflicts involving major powers, and because its government actively restricts independent journalism. Redirecting a fraction of the humanitarian funding currently flowing to higher-profile crises, combined with pressure on Luanda to allow international press access, would have an outsized impact.',
  TCD: 'Chad is experiencing simultaneous crises — hosting over 1.1 million refugees from Sudan and the Central African Republic while enduring its own internal displacement from Lake Chad Basin conflicts and recurring Sahel droughts. The country receives almost no sustained international media attention despite being one of the most complex humanitarian emergencies on Earth. Emergency food assistance, water infrastructure investment, and refugee camp expansion are the most urgent needs.',
  UKR: 'Ukraine continues to experience active conflict with Russia following the 2022 invasion, with millions displaced internally and internationally and ongoing infrastructure destruction. The conflict receives extensive international media coverage, placing it at the low end of the Invisible Index — attention is broadly proportional to the crisis. Continued international military and humanitarian support and reconstruction financing remain the primary interventions.',
  default: 'This country is experiencing a {severity} humanitarian situation that is receiving less international attention than the scale of suffering warrants. The gap between the level of crisis and the level of media coverage represents a systematic failure of the global information ecosystem to allocate attention proportionally to need. Increased international journalism, sustained diplomatic attention, and emergency humanitarian funding are the most direct interventions available.',
};

// ─── COUNTRY DETAILS ─────────────────────────────────────────────────────────
export const mockCountryDetails = {
  SDN: {
    iso3: 'SDN', trend: 'up', change_24h: 12.4,
    last_updated: new Date().toISOString(),
    metrics: { misinformation_score: 82, bot_activity: 45, fact_check_ratio: 8, source_diversity: 12 },
    trending_topics: [
      { topic: 'Darfur famine',        volume: 1240, sentiment: 'negative' },
      { topic: 'RSF conflict',         volume: 890,  sentiment: 'negative' },
      { topic: 'Khartoum displacement',volume: 650,  sentiment: 'negative' },
    ],
    news_articles: [
      { id: 1, title: "Sudan's hidden famine: millions starving as world looks away", source: 'Reuters',       url: '#', published: new Date(Date.now() - 2*3600000).toISOString(),  summary: 'Aid agencies warn of catastrophic food insecurity spreading from Darfur to Khartoum state as supply routes remain blocked.', credibility: 'verified', impact_score: 87 },
      { id: 2, title: 'UN: Sudan displacement now largest crisis in the world',        source: 'Al Jazeera',   url: '#', published: new Date(Date.now() - 6*3600000).toISOString(),  summary: 'UNHCR confirms 10.8 million internally displaced, surpassing Ukraine as the largest displacement emergency globally.', credibility: 'verified', impact_score: 92 },
    ],
  },
  AGO: {
    iso3: 'AGO', trend: 'up', change_24h: 8.2,
    last_updated: new Date().toISOString(),
    metrics: { misinformation_score: 55, bot_activity: 28, fact_check_ratio: 14, source_diversity: 18 },
    trending_topics: [
      { topic: 'Southern drought',          volume: 340, sentiment: 'negative' },
      { topic: 'Humanitarian aid access',   volume: 210, sentiment: 'negative' },
    ],
    news_articles: [
      { id: 1, title: 'Angola drought: 7 million need aid but media stays silent', source: 'MSF', url: '#', published: new Date(Date.now() - 8*3600000).toISOString(), summary: 'Médecins Sans Frontières reports acute malnutrition rates exceeding emergency thresholds in southern Angola provinces.', credibility: 'verified', impact_score: 78 },
    ],
  },
  UKR: {
    iso3: 'UKR', trend: 'down', change_24h: -1.2,
    last_updated: new Date().toISOString(),
    metrics: { misinformation_score: 72, bot_activity: 88, fact_check_ratio: 65, source_diversity: 78 },
    trending_topics: [
      { topic: 'Frontline advances',      volume: 45000, sentiment: 'negative' },
      { topic: 'Western military aid',    volume: 38000, sentiment: 'mixed'    },
      { topic: 'Ceasefire negotiations',  volume: 22000, sentiment: 'neutral'  },
    ],
    news_articles: [
      { id: 1, title: 'Ukraine front line shifts as Russia advances in Donetsk', source: 'BBC', url: '#', published: new Date(Date.now() - 3600000).toISOString(), summary: 'Russian forces have made incremental gains in eastern Ukraine while Ukrainian forces hold defensive positions.', credibility: 'verified', impact_score: 94 },
    ],
  },
};
