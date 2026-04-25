// Enhanced mock data with news articles, trending topics, and detailed metrics

export const mockCountries = [
  // North America
  { iso3: 'USA', name: 'United States', index_value: 45.2, latitude: 37.0902, longitude: -95.7129 },
  { iso3: 'CAN', name: 'Canada', index_value: 28.5, latitude: 56.1304, longitude: -106.3468 },
  { iso3: 'MEX', name: 'Mexico', index_value: 52.8, latitude: 23.6345, longitude: -102.5528 },
  
  // South America
  { iso3: 'BRA', name: 'Brazil', index_value: 58.3, latitude: -14.2350, longitude: -51.9253 },
  { iso3: 'ARG', name: 'Argentina', index_value: 43.7, latitude: -38.4161, longitude: -63.6167 },
  { iso3: 'CHL', name: 'Chile', index_value: 35.2, latitude: -35.6751, longitude: -71.5430 },
  { iso3: 'COL', name: 'Colombia', index_value: 61.4, latitude: 4.5709, longitude: -74.2973 },
  { iso3: 'VEN', name: 'Venezuela', index_value: 78.9, latitude: 6.4238, longitude: -66.5897 },
  { iso3: 'PER', name: 'Peru', index_value: 48.6, latitude: -9.1900, longitude: -75.0152 },
  
  // Europe
  { iso3: 'GBR', name: 'United Kingdom', index_value: 32.1, latitude: 55.3781, longitude: -3.4360 },
  { iso3: 'FRA', name: 'France', index_value: 38.9, latitude: 46.2276, longitude: 2.2137 },
  { iso3: 'DEU', name: 'Germany', index_value: 29.7, latitude: 51.1657, longitude: 10.4515 },
  { iso3: 'ITA', name: 'Italy', index_value: 42.3, latitude: 41.8719, longitude: 12.5674 },
  { iso3: 'ESP', name: 'Spain', index_value: 40.5, latitude: 40.4637, longitude: -3.7492 },
  { iso3: 'POL', name: 'Poland', index_value: 44.8, latitude: 51.9194, longitude: 19.1451 },
  { iso3: 'UKR', name: 'Ukraine', index_value: 82.4, latitude: 48.3794, longitude: 31.1656 },
  { iso3: 'ROU', name: 'Romania', index_value: 47.2, latitude: 45.9432, longitude: 24.9668 },
  { iso3: 'NLD', name: 'Netherlands', index_value: 26.3, latitude: 52.1326, longitude: 5.2913 },
  { iso3: 'BEL', name: 'Belgium', index_value: 31.7, latitude: 50.5039, longitude: 4.4699 },
  { iso3: 'SWE', name: 'Sweden', index_value: 24.1, latitude: 60.1282, longitude: 18.6435 },
  { iso3: 'NOR', name: 'Norway', index_value: 22.8, latitude: 60.4720, longitude: 8.4689 },
  { iso3: 'DNK', name: 'Denmark', index_value: 23.5, latitude: 56.2639, longitude: 9.5018 },
  { iso3: 'FIN', name: 'Finland', index_value: 25.9, latitude: 61.9241, longitude: 25.7482 },
  
  // Asia
  { iso3: 'CHN', name: 'China', index_value: 71.6, latitude: 35.8617, longitude: 104.1954 },
  { iso3: 'JPN', name: 'Japan', index_value: 33.2, latitude: 36.2048, longitude: 138.2529 },
  { iso3: 'IND', name: 'India', index_value: 56.8, latitude: 20.5937, longitude: 78.9629 },
  { iso3: 'IDN', name: 'Indonesia', index_value: 54.3, latitude: -0.7893, longitude: 113.9213 },
  { iso3: 'PAK', name: 'Pakistan', index_value: 68.7, latitude: 30.3753, longitude: 69.3451 },
  { iso3: 'BGD', name: 'Bangladesh', index_value: 62.4, latitude: 23.6850, longitude: 90.3563 },
  { iso3: 'KOR', name: 'South Korea', index_value: 36.5, latitude: 35.9078, longitude: 127.7669 },
  { iso3: 'THA', name: 'Thailand', index_value: 49.2, latitude: 15.8700, longitude: 100.9925 },
  { iso3: 'VNM', name: 'Vietnam', index_value: 58.9, latitude: 14.0583, longitude: 108.2772 },
  { iso3: 'PHL', name: 'Philippines', index_value: 55.6, latitude: 12.8797, longitude: 121.7740 },
  { iso3: 'MYS', name: 'Malaysia', index_value: 46.3, latitude: 4.2105, longitude: 101.9758 },
  { iso3: 'SGP', name: 'Singapore', index_value: 27.4, latitude: 1.3521, longitude: 103.8198 },
  
  // Middle East
  { iso3: 'TUR', name: 'Turkey', index_value: 64.2, latitude: 38.9637, longitude: 35.2433 },
  { iso3: 'IRN', name: 'Iran', index_value: 75.8, latitude: 32.4279, longitude: 53.6880 },
  { iso3: 'IRQ', name: 'Iraq', index_value: 79.3, latitude: 33.2232, longitude: 43.6793 },
  { iso3: 'SAU', name: 'Saudi Arabia', index_value: 51.7, latitude: 23.8859, longitude: 45.0792 },
  { iso3: 'ARE', name: 'United Arab Emirates', index_value: 39.8, latitude: 23.4241, longitude: 53.8478 },
  { iso3: 'ISR', name: 'Israel', index_value: 47.9, latitude: 31.0461, longitude: 34.8516 },
  { iso3: 'SYR', name: 'Syria', index_value: 88.6, latitude: 34.8021, longitude: 38.9968 },
  { iso3: 'YEM', name: 'Yemen', index_value: 85.2, latitude: 15.5527, longitude: 48.5164 },
  
  // Africa
  { iso3: 'NGA', name: 'Nigeria', index_value: 72.5, latitude: 9.0820, longitude: 8.6753 },
  { iso3: 'ZAF', name: 'South Africa', index_value: 53.8, latitude: -30.5595, longitude: 22.9375 },
  { iso3: 'EGY', name: 'Egypt', index_value: 66.4, latitude: 26.8206, longitude: 30.8025 },
  { iso3: 'ETH', name: 'Ethiopia', index_value: 69.7, latitude: 9.1450, longitude: 40.4897 },
  { iso3: 'KEN', name: 'Kenya', index_value: 58.2, latitude: -0.0236, longitude: 37.9062 },
  { iso3: 'GHA', name: 'Ghana', index_value: 48.9, latitude: 7.9465, longitude: -1.0232 },
  { iso3: 'AGO', name: 'Angola', index_value: 65.3, latitude: -11.2027, longitude: 17.8739 },
  { iso3: 'SDN', name: 'Sudan', index_value: 81.7, latitude: 12.8628, longitude: 30.2176 },
  { iso3: 'DZA', name: 'Algeria', index_value: 57.6, latitude: 28.0339, longitude: 1.6596 },
  { iso3: 'MAR', name: 'Morocco', index_value: 50.4, latitude: 31.7917, longitude: -7.0926 },
  
  // Oceania
  { iso3: 'AUS', name: 'Australia', index_value: 29.3, latitude: -25.2744, longitude: 133.7751 },
  { iso3: 'NZL', name: 'New Zealand', index_value: 21.6, latitude: -40.9006, longitude: 174.8860 },
  { iso3: 'PNG', name: 'Papua New Guinea', index_value: 63.4, latitude: -6.3150, longitude: 143.9555 },
  
  // Russia
  { iso3: 'RUS', name: 'Russia', index_value: 73.2, latitude: 61.5240, longitude: 105.3188 },
];

// Detailed country data with news articles and trending topics
export const mockCountryDetails = {
  'USA': {
    iso3: 'USA',
    name: 'United States',
    index_value: 45.2,
    trend: 'up', // up, down, stable
    change_24h: +2.3,
    last_updated: new Date().toISOString(),
    metrics: {
      misinformation_score: 48,
      bot_activity: 42,
      fact_check_ratio: 65,
      source_diversity: 78
    },
    trending_topics: [
      { topic: 'Election Integrity', volume: 8500, sentiment: 'negative' },
      { topic: 'AI Deepfakes', volume: 6200, sentiment: 'neutral' },
      { topic: 'Climate Policy', volume: 4800, sentiment: 'mixed' }
    ],
    news_articles: [
      {
        id: 1,
        title: 'Coordinated Disinformation Campaign Targets Swing States',
        source: 'Reuters',
        url: 'https://example.com/article1',
        published: new Date(Date.now() - 3600000 * 2).toISOString(),
        summary: 'Security researchers have identified a coordinated campaign spreading false election information across social media platforms in key battleground states.',
        credibility: 'verified',
        impact_score: 82
      },
      {
        id: 2,
        title: 'Social Media Platforms Struggle with AI-Generated Content',
        source: 'The New York Times',
        url: 'https://example.com/article2',
        published: new Date(Date.now() - 3600000 * 5).toISOString(),
        summary: 'Major platforms report difficulty detecting and moderating sophisticated AI-generated political content as elections approach.',
        credibility: 'verified',
        impact_score: 76
      },
      {
        id: 3,
        title: 'Fact-Checkers Report Record Volume of False Claims',
        source: 'Associated Press',
        url: 'https://example.com/article3',
        published: new Date(Date.now() - 3600000 * 8).toISOString(),
        summary: 'Independent fact-checking organizations see 300% increase in political misinformation compared to same period last year.',
        credibility: 'verified',
        impact_score: 71
      }
    ]
  },
  
  'CHN': {
    iso3: 'CHN',
    name: 'China',
    index_value: 71.6,
    trend: 'stable',
    change_24h: -0.5,
    last_updated: new Date().toISOString(),
    metrics: {
      misinformation_score: 76,
      bot_activity: 68,
      fact_check_ratio: 22,
      source_diversity: 31
    },
    trending_topics: [
      { topic: 'Economic Policy', volume: 12000, sentiment: 'positive' },
      { topic: 'International Relations', volume: 9500, sentiment: 'neutral' },
      { topic: 'Technology Regulation', volume: 7200, sentiment: 'mixed' }
    ],
    news_articles: [
      {
        id: 1,
        title: 'State Media Amplifies Official Narrative on Trade Policy',
        source: 'BBC',
        url: 'https://example.com/article1',
        published: new Date(Date.now() - 3600000 * 4).toISOString(),
        summary: 'Analysis shows coordinated messaging across state-controlled media platforms regarding recent economic announcements.',
        credibility: 'verified',
        impact_score: 88
      },
      {
        id: 2,
        title: 'Content Filtering Expands to New Platforms',
        source: 'Financial Times',
        url: 'https://example.com/article2',
        published: new Date(Date.now() - 3600000 * 12).toISOString(),
        summary: 'New regulations extend content moderation requirements to previously exempt platforms and services.',
        credibility: 'verified',
        impact_score: 79
      }
    ]
  },
  
  'UKR': {
    iso3: 'UKR',
    name: 'Ukraine',
    index_value: 82.4,
    trend: 'up',
    change_24h: +15.2,
    last_updated: new Date().toISOString(),
    metrics: {
      misinformation_score: 89,
      bot_activity: 91,
      fact_check_ratio: 45,
      source_diversity: 58
    },
    trending_topics: [
      { topic: 'Security Updates', volume: 25000, sentiment: 'negative' },
      { topic: 'Disinformation Campaigns', volume: 18500, sentiment: 'negative' },
      { topic: 'International Support', volume: 15200, sentiment: 'positive' }
    ],
    news_articles: [
      {
        id: 1,
        title: 'CRITICAL: Massive Spike in Coordinated Disinformation',
        source: 'The Guardian',
        url: 'https://example.com/article1',
        published: new Date(Date.now() - 3600000).toISOString(),
        summary: 'Security analysts detect unprecedented volume of false narratives targeting Ukrainian information space across multiple platforms.',
        credibility: 'verified',
        impact_score: 95
      },
      {
        id: 2,
        title: 'Bot Networks Amplify False Claims About Aid',
        source: 'Reuters',
        url: 'https://example.com/article2',
        published: new Date(Date.now() - 3600000 * 3).toISOString(),
        summary: 'Researchers identify bot-driven campaigns spreading misinformation about international humanitarian assistance.',
        credibility: 'verified',
        impact_score: 91
      },
      {
        id: 3,
        title: 'Deepfake Videos Target Government Officials',
        source: 'Associated Press',
        url: 'https://example.com/article3',
        published: new Date(Date.now() - 3600000 * 6).toISOString(),
        summary: 'AI-generated videos impersonating officials circulate on social media, prompting emergency response from authorities.',
        credibility: 'verified',
        impact_score: 87
      }
    ]
  },
  
  'GBR': {
    iso3: 'GBR',
    name: 'United Kingdom',
    index_value: 32.1,
    trend: 'stable',
    change_24h: +0.8,
    last_updated: new Date().toISOString(),
    metrics: {
      misinformation_score: 35,
      bot_activity: 28,
      fact_check_ratio: 72,
      source_diversity: 85
    },
    trending_topics: [
      { topic: 'Political Debates', volume: 7800, sentiment: 'mixed' },
      { topic: 'Media Regulation', volume: 5400, sentiment: 'neutral' },
      { topic: 'Public Health', volume: 4200, sentiment: 'positive' }
    ],
    news_articles: [
      {
        id: 1,
        title: 'Ofcom Reports Decline in Trust for Online News',
        source: 'BBC',
        url: 'https://example.com/article1',
        published: new Date(Date.now() - 3600000 * 4).toISOString(),
        summary: 'Latest survey shows growing skepticism toward social media news sources among UK adults.',
        credibility: 'verified',
        impact_score: 68
      },
      {
        id: 2,
        title: 'Fact-Checking Initiatives Gain Government Support',
        source: 'The Times',
        url: 'https://example.com/article2',
        published: new Date(Date.now() - 3600000 * 10).toISOString(),
        summary: 'New funding announced for independent media literacy and fact-checking programs.',
        credibility: 'verified',
        impact_score: 62
      }
    ]
  },
  
  'RUS': {
    iso3: 'RUS',
    name: 'Russia',
    index_value: 73.2,
    trend: 'stable',
    change_24h: +1.2,
    last_updated: new Date().toISOString(),
    metrics: {
      misinformation_score: 78,
      bot_activity: 71,
      fact_check_ratio: 18,
      source_diversity: 28
    },
    trending_topics: [
      { topic: 'State Media Coverage', volume: 15000, sentiment: 'positive' },
      { topic: 'Foreign Policy', volume: 11200, sentiment: 'neutral' },
      { topic: 'Economic News', volume: 8900, sentiment: 'mixed' }
    ],
    news_articles: [
      {
        id: 1,
        title: 'Independent Media Outlets Face New Restrictions',
        source: 'Financial Times',
        url: 'https://example.com/article1',
        published: new Date(Date.now() - 3600000 * 6).toISOString(),
        summary: 'Additional regulations imposed on remaining independent news organizations operating in the country.',
        credibility: 'verified',
        impact_score: 84
      },
      {
        id: 2,
        title: 'VPN Usage Surges as Content Blocks Expand',
        source: 'The Guardian',
        url: 'https://example.com/article2',
        published: new Date(Date.now() - 3600000 * 15).toISOString(),
        summary: 'Citizens increasingly turn to encrypted services to access blocked international news sources.',
        credibility: 'verified',
        impact_score: 77
      }
    ]
  }
};

// Alerts
export const mockAlerts = [
  {
    country_iso3: 'UKR',
    country_name: 'Ukraine',
    message: 'Critical spike detected: +15.2 points in 24h - Coordinated disinformation campaign',
    timestamp: new Date().toISOString(),
    severity: 'critical'
  },
  {
    country_iso3: 'SYR',
    country_name: 'Syria',
    message: 'Sustained high index: 85+ for 72 hours',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    severity: 'high'
  }
];

// Intelligence brief templates
export const mockBriefs = {
  'USA': 'Current integrity assessment shows moderate elevation in misinformation metrics across social media platforms. Primary vectors include political content amplification and coordinated inauthentic behavior. Recent spike of +2.3 points correlates with increased election-related content. Regional variations noted with higher concentrations in swing states. Bot activity at 42% of baseline, with particular focus on divisive political narratives. Fact-checking organizations report 3x normal volume. Recommend continued monitoring of emerging narratives around upcoming policy decisions and electoral processes.',
  
  'CHN': 'Elevated index reflects state-controlled information environment with extensive content filtering and narrative management. Score remains stable at 71.6 with minimal 24h variation (-0.5). Recent activity correlates with economic policy announcements and international relations developments. Limited independent verification channels make ground truth assessment challenging. Source diversity remains critically low at 31%. Coordinated state media messaging shows high synchronization across platforms. VPN and circumvention tool usage indicates citizen attempts to access alternative information sources.',
  
  'UKR': 'CRITICAL ALERT: Unprecedented spike of +15.2 points in 24 hours indicates major information warfare escalation. Multi-vector disinformation campaign detected across domestic and international channels. Attribution analysis suggests coordinated state-actor involvement with bot network amplification at 91% of traffic. Primary attack vectors include deepfake videos targeting officials, false aid narratives, and coordinated narrative manipulation. Independent fact-checkers overwhelmed by volume. Immediate escalation to priority monitoring recommended. International support messaging provides partial counter-narrative resilience.',
  
  'GBR': 'Moderate integrity metrics with stable trend (+0.8 points). Diverse media landscape provides resilience against coordinated campaigns with source diversity at 85%. Recent concerns include isolated deepfake incidents and synthetic media in political discourse, though overall ecosystem remains robust. Fact-check ratio of 72% indicates healthy information verification culture. Regulatory frameworks (Ofcom) provide oversight mechanism. Public trust surveys show declining confidence in social media news, potentially indicating increased media literacy. Overall information environment maintains moderate risk profile.',
  
  'RUS': 'Elevated index at 73.2 reflects state-controlled information architecture with extensive content moderation and source restrictions. Trend stable with minimal variation. Independent media space continues to contract under regulatory pressure. Source diversity critically low at 28%, indicating limited alternative viewpoints in mainstream discourse. VPN usage surge suggests population actively seeking external information sources. Bot activity elevated at 71% across monitored platforms. State media coordination shows high narrative synchronization. Limited independent fact-checking infrastructure operational.',
  
  'default': 'Intelligence brief generated based on latest integrity metrics. Current assessment indicates {severity} risk environment with index value of {index}. Monitoring continues across digital platforms, traditional media, and grassroots information networks. Trend analysis shows {trend} pattern over 24-hour period. Primary risk vectors include coordinated inauthentic behavior, narrative manipulation, and source credibility challenges. Recommend standard vigilance protocols with enhanced monitoring during high-risk events.'
};