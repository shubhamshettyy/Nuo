export const CATEGORIES = [
  { id: 'all',          label: 'All Stories' },
  { id: 'Armed Conflict & Violence',    label: 'Armed Conflict' },
  { id: 'Public Health Crises',         label: 'Public Health' },
  { id: 'Human Rights Violations',      label: 'Human Rights' },
  { id: 'Environmental Restoration',    label: 'Environment' },
  { id: 'Social Progress',              label: 'Social Progress' },
  { id: 'Scientific Breakthroughs',     label: 'Science' },
];

export const CATEGORY_COLORS = {
  'Armed Conflict & Violence':  '#c0392b',
  'Public Health Crises':       '#8e44ad',
  'Human Rights Violations':    '#e67e22',
  'Environmental Restoration':  '#27ae60',
  'Social Progress':            '#2980b9',
  'Scientific Breakthroughs':   '#16a085',
  'all':                        '#555555',
};

export const mockCountries = [
  { iso3:'SDN', name:'Sudan',                    latitude:12.86,  longitude:30.21,  index_value:98, category_scores:{'Armed Conflict & Violence':99,'Public Health Crises':85,'Human Rights Violations':95,'Environmental Restoration':20,'Social Progress':10,'Scientific Breakthroughs':5} },
  { iso3:'AGO', name:'Angola',                   latitude:-11.2,  longitude:17.87,  index_value:92, category_scores:{'Armed Conflict & Violence':85,'Public Health Crises':78,'Human Rights Violations':80,'Environmental Restoration':25,'Social Progress':15,'Scientific Breakthroughs':8} },
  { iso3:'TCD', name:'Chad',                     latitude:15.45,  longitude:18.73,  index_value:88, category_scores:{'Armed Conflict & Violence':80,'Public Health Crises':88,'Human Rights Violations':82,'Environmental Restoration':30,'Social Progress':12,'Scientific Breakthroughs':6} },
  { iso3:'CAF', name:'Central African Republic', latitude:6.61,   longitude:20.94,  index_value:84, category_scores:{'Armed Conflict & Violence':90,'Public Health Crises':72,'Human Rights Violations':88,'Environmental Restoration':22,'Social Progress':10,'Scientific Breakthroughs':5} },
  { iso3:'COD', name:'DR Congo',                 latitude:-4.0,   longitude:21.76,  index_value:79, category_scores:{'Armed Conflict & Violence':88,'Public Health Crises':82,'Human Rights Violations':80,'Environmental Restoration':35,'Social Progress':20,'Scientific Breakthroughs':10} },
  { iso3:'SOM', name:'Somalia',                  latitude:5.15,   longitude:46.2,   index_value:74, category_scores:{'Armed Conflict & Violence':78,'Public Health Crises':70,'Human Rights Violations':75,'Environmental Restoration':20,'Social Progress':12,'Scientific Breakthroughs':5} },
  { iso3:'ETH', name:'Ethiopia',                 latitude:9.14,   longitude:40.49,  index_value:70, category_scores:{'Armed Conflict & Violence':72,'Public Health Crises':75,'Human Rights Violations':70,'Environmental Restoration':40,'Social Progress':25,'Scientific Breakthroughs':12} },
  { iso3:'MMR', name:'Myanmar',                  latitude:19.16,  longitude:96.63,  index_value:65, category_scores:{'Armed Conflict & Violence':82,'Public Health Crises':60,'Human Rights Violations':85,'Environmental Restoration':30,'Social Progress':18,'Scientific Breakthroughs':10} },
  { iso3:'SSD', name:'South Sudan',              latitude:6.88,   longitude:31.31,  index_value:62, category_scores:{'Armed Conflict & Violence':75,'Public Health Crises':68,'Human Rights Violations':70,'Environmental Restoration':25,'Social Progress':12,'Scientific Breakthroughs':5} },
  { iso3:'YEM', name:'Yemen',                    latitude:15.55,  longitude:48.52,  index_value:58, category_scores:{'Armed Conflict & Violence':55,'Public Health Crises':65,'Human Rights Violations':60,'Environmental Restoration':20,'Social Progress':10,'Scientific Breakthroughs':8} },
  { iso3:'AFG', name:'Afghanistan',              latitude:33.94,  longitude:67.71,  index_value:52, category_scores:{'Armed Conflict & Violence':60,'Public Health Crises':55,'Human Rights Violations':72,'Environmental Restoration':28,'Social Progress':15,'Scientific Breakthroughs':8} },
  { iso3:'HTI', name:'Haiti',                    latitude:18.97,  longitude:-72.29, index_value:49, category_scores:{'Armed Conflict & Violence':55,'Public Health Crises':65,'Human Rights Violations':58,'Environmental Restoration':45,'Social Progress':22,'Scientific Breakthroughs':10} },
  { iso3:'NGA', name:'Nigeria',                  latitude:9.08,   longitude:8.68,   index_value:45, category_scores:{'Armed Conflict & Violence':55,'Public Health Crises':60,'Human Rights Violations':52,'Environmental Restoration':40,'Social Progress':30,'Scientific Breakthroughs':18} },
  { iso3:'PAK', name:'Pakistan',                 latitude:30.38,  longitude:69.35,  index_value:42, category_scores:{'Armed Conflict & Violence':45,'Public Health Crises':50,'Human Rights Violations':55,'Environmental Restoration':38,'Social Progress':28,'Scientific Breakthroughs':22} },
  { iso3:'BGD', name:'Bangladesh',               latitude:23.68,  longitude:90.36,  index_value:40, category_scores:{'Armed Conflict & Violence':25,'Public Health Crises':45,'Human Rights Violations':42,'Environmental Restoration':72,'Social Progress':35,'Scientific Breakthroughs':20} },
  { iso3:'EGY', name:'Egypt',                    latitude:26.82,  longitude:30.80,  index_value:35, category_scores:{'Armed Conflict & Violence':25,'Public Health Crises':35,'Human Rights Violations':55,'Environmental Restoration':50,'Social Progress':30,'Scientific Breakthroughs':28} },
  { iso3:'SYR', name:'Syria',                    latitude:34.8,   longitude:38.99,  index_value:32, category_scores:{'Armed Conflict & Violence':30,'Public Health Crises':45,'Human Rights Violations':55,'Environmental Restoration':20,'Social Progress':12,'Scientific Breakthroughs':8} },
  { iso3:'IRQ', name:'Iraq',                     latitude:33.22,  longitude:43.68,  index_value:28, category_scores:{'Armed Conflict & Violence':28,'Public Health Crises':35,'Human Rights Violations':45,'Environmental Restoration':25,'Social Progress':18,'Scientific Breakthroughs':15} },
  { iso3:'IND', name:'India',                    latitude:20.59,  longitude:78.96,  index_value:22, category_scores:{'Armed Conflict & Violence':15,'Public Health Crises':30,'Human Rights Violations':35,'Environmental Restoration':55,'Social Progress':45,'Scientific Breakthroughs':52} },
  { iso3:'BRA', name:'Brazil',                   latitude:-14.24, longitude:-51.93, index_value:20, category_scores:{'Armed Conflict & Violence':22,'Public Health Crises':28,'Human Rights Violations':30,'Environmental Restoration':65,'Social Progress':40,'Scientific Breakthroughs':38} },
  { iso3:'MEX', name:'Mexico',                   latitude:23.63,  longitude:-102.55,index_value:22, category_scores:{'Armed Conflict & Violence':30,'Public Health Crises':25,'Human Rights Violations':35,'Environmental Restoration':42,'Social Progress':32,'Scientific Breakthroughs':28} },
  { iso3:'TUR', name:'Turkey',                   latitude:38.96,  longitude:35.24,  index_value:18, category_scores:{'Armed Conflict & Violence':20,'Public Health Crises':18,'Human Rights Violations':40,'Environmental Restoration':35,'Social Progress':28,'Scientific Breakthroughs':32} },
  { iso3:'ZAF', name:'South Africa',             latitude:-30.56, longitude:22.94,  index_value:16, category_scores:{'Armed Conflict & Violence':18,'Public Health Crises':35,'Human Rights Violations':30,'Environmental Restoration':45,'Social Progress':42,'Scientific Breakthroughs':30} },
  { iso3:'IDN', name:'Indonesia',                latitude:-0.79,  longitude:113.92, index_value:18, category_scores:{'Armed Conflict & Violence':14,'Public Health Crises':22,'Human Rights Violations':28,'Environmental Restoration':62,'Social Progress':38,'Scientific Breakthroughs':25} },
  { iso3:'PHL', name:'Philippines',              latitude:12.88,  longitude:121.77, index_value:20, category_scores:{'Armed Conflict & Violence':22,'Public Health Crises':25,'Human Rights Violations':32,'Environmental Restoration':68,'Social Progress':35,'Scientific Breakthroughs':22} },
  { iso3:'UKR', name:'Ukraine',                  latitude:48.38,  longitude:31.17,  index_value:5,  category_scores:{'Armed Conflict & Violence':4,'Public Health Crises':8,'Human Rights Violations':12,'Environmental Restoration':15,'Social Progress':18,'Scientific Breakthroughs':20} },
  { iso3:'RUS', name:'Russia',                   latitude:61.52,  longitude:105.32, index_value:8,  category_scores:{'Armed Conflict & Violence':6,'Public Health Crises':10,'Human Rights Violations':30,'Environmental Restoration':18,'Social Progress':12,'Scientific Breakthroughs':22} },
  { iso3:'CHN', name:'China',                    latitude:35.86,  longitude:104.19, index_value:10, category_scores:{'Armed Conflict & Violence':8,'Public Health Crises':12,'Human Rights Violations':38,'Environmental Restoration':30,'Social Progress':20,'Scientific Breakthroughs':15} },
  { iso3:'USA', name:'United States',            latitude:37.09,  longitude:-95.71, index_value:4,  category_scores:{'Armed Conflict & Violence':3,'Public Health Crises':6,'Human Rights Violations':8,'Environmental Restoration':12,'Social Progress':10,'Scientific Breakthroughs':5} },
  { iso3:'GBR', name:'United Kingdom',           latitude:55.38,  longitude:-3.44,  index_value:3,  category_scores:{'Armed Conflict & Violence':2,'Public Health Crises':4,'Human Rights Violations':6,'Environmental Restoration':10,'Social Progress':8,'Scientific Breakthroughs':4} },
  { iso3:'DEU', name:'Germany',                  latitude:51.17,  longitude:10.45,  index_value:3,  category_scores:{'Armed Conflict & Violence':2,'Public Health Crises':4,'Human Rights Violations':5,'Environmental Restoration':8,'Social Progress':7,'Scientific Breakthroughs':4} },
  { iso3:'FRA', name:'France',                   latitude:46.23,  longitude:2.21,   index_value:3,  category_scores:{'Armed Conflict & Violence':2,'Public Health Crises':4,'Human Rights Violations':5,'Environmental Restoration':10,'Social Progress':8,'Scientific Breakthroughs':5} },
  { iso3:'JPN', name:'Japan',                    latitude:36.20,  longitude:138.25, index_value:3,  category_scores:{'Armed Conflict & Violence':2,'Public Health Crises':5,'Human Rights Violations':4,'Environmental Restoration':8,'Social Progress':6,'Scientific Breakthroughs':3} },
  { iso3:'KOR', name:'South Korea',              latitude:35.91,  longitude:127.77, index_value:3,  category_scores:{'Armed Conflict & Violence':2,'Public Health Crises':4,'Human Rights Violations':5,'Environmental Restoration':9,'Social Progress':7,'Scientific Breakthroughs':4} },
  { iso3:'AUS', name:'Australia',                latitude:-25.27, longitude:133.78, index_value:3,  category_scores:{'Armed Conflict & Violence':2,'Public Health Crises':4,'Human Rights Violations':4,'Environmental Restoration':12,'Social Progress':6,'Scientific Breakthroughs':5} },
  { iso3:'CAN', name:'Canada',                   latitude:56.13,  longitude:-106.35,index_value:3,  category_scores:{'Armed Conflict & Violence':2,'Public Health Crises':4,'Human Rights Violations':5,'Environmental Restoration':10,'Social Progress':7,'Scientific Breakthroughs':4} },
  { iso3:'ISR', name:'Israel',                   latitude:31.05,  longitude:34.85,  index_value:6,  category_scores:{'Armed Conflict & Violence':4,'Public Health Crises':6,'Human Rights Violations':18,'Environmental Restoration':10,'Social Progress':8,'Scientific Breakthroughs':8} },
  { iso3:'IRN', name:'Iran',                     latitude:32.43,  longitude:53.69,  index_value:25, category_scores:{'Armed Conflict & Violence':28,'Public Health Crises':22,'Human Rights Violations':55,'Environmental Restoration':30,'Social Progress':15,'Scientific Breakthroughs':18} },
  { iso3:'VEN', name:'Venezuela',                latitude:6.42,   longitude:-66.59, index_value:30, category_scores:{'Armed Conflict & Violence':25,'Public Health Crises':40,'Human Rights Violations':48,'Environmental Restoration':28,'Social Progress':18,'Scientific Breakthroughs':12} },
  { iso3:'COL', name:'Colombia',                 latitude:-4.57,  longitude:-74.30, index_value:20, category_scores:{'Armed Conflict & Violence':32,'Public Health Crises':20,'Human Rights Violations':30,'Environmental Restoration':45,'Social Progress':35,'Scientific Breakthroughs':18} },
  { iso3:'POL', name:'Poland',                   latitude:51.92,  longitude:19.15,  index_value:4,  category_scores:{'Armed Conflict & Violence':3,'Public Health Crises':5,'Human Rights Violations':8,'Environmental Restoration':12,'Social Progress':10,'Scientific Breakthroughs':6} },
  { iso3:'ARG', name:'Argentina',                latitude:-38.42, longitude:-63.62, index_value:8,  category_scores:{'Armed Conflict & Violence':5,'Public Health Crises':10,'Human Rights Violations':12,'Environmental Restoration':20,'Social Progress':18,'Scientific Breakthroughs':14} },
  { iso3:'ESP', name:'Spain',                    latitude:40.46,  longitude:-3.75,  index_value:4,  category_scores:{'Armed Conflict & Violence':3,'Public Health Crises':5,'Human Rights Violations':6,'Environmental Restoration':12,'Social Progress':9,'Scientific Breakthroughs':5} },
  { iso3:'KEN', name:'Kenya',                    latitude:-0.02,  longitude:37.91,  index_value:22, category_scores:{'Armed Conflict & Violence':20,'Public Health Crises':30,'Human Rights Violations':28,'Environmental Restoration':48,'Social Progress':38,'Scientific Breakthroughs':20} },
  { iso3:'TZA', name:'Tanzania',                 latitude:-6.37,  longitude:34.89,  index_value:18, category_scores:{'Armed Conflict & Violence':12,'Public Health Crises':28,'Human Rights Violations':22,'Environmental Restoration':50,'Social Progress':35,'Scientific Breakthroughs':15} },
  { iso3:'MOZ', name:'Mozambique',               latitude:-18.67, longitude:35.53,  index_value:35, category_scores:{'Armed Conflict & Violence':40,'Public Health Crises':38,'Human Rights Violations':30,'Environmental Restoration':55,'Social Progress':22,'Scientific Breakthroughs':10} },
  { iso3:'ZWE', name:'Zimbabwe',                 latitude:-19.02, longitude:29.15,  index_value:28, category_scores:{'Armed Conflict & Violence':18,'Public Health Crises':35,'Human Rights Violations':45,'Environmental Restoration':38,'Social Progress':20,'Scientific Breakthroughs':10} },
  { iso3:'CMR', name:'Cameroon',                 latitude:7.37,   longitude:12.35,  index_value:30, category_scores:{'Armed Conflict & Violence':42,'Public Health Crises':32,'Human Rights Violations':35,'Environmental Restoration':40,'Social Progress':18,'Scientific Breakthroughs':8} },
  { iso3:'GHA', name:'Ghana',                    latitude:7.96,   longitude:-1.02,  index_value:12, category_scores:{'Armed Conflict & Violence':8,'Public Health Crises':18,'Human Rights Violations':15,'Environmental Restoration':42,'Social Progress':45,'Scientific Breakthroughs':22} },
  { iso3:'SEN', name:'Senegal',                  latitude:14.50,  longitude:-14.45, index_value:14, category_scores:{'Armed Conflict & Violence':10,'Public Health Crises':22,'Human Rights Violations':18,'Environmental Restoration':40,'Social Progress':42,'Scientific Breakthroughs':18} },
  { iso3:'MLI', name:'Mali',                     latitude:17.57,  longitude:-3.99,  index_value:52, category_scores:{'Armed Conflict & Violence':65,'Public Health Crises':48,'Human Rights Violations':55,'Environmental Restoration':28,'Social Progress':15,'Scientific Breakthroughs':6} },
  { iso3:'NER', name:'Niger',                    latitude:17.61,  longitude:8.08,   index_value:48, category_scores:{'Armed Conflict & Violence':55,'Public Health Crises':52,'Human Rights Violations':48,'Environmental Restoration':35,'Social Progress':12,'Scientific Breakthroughs':5} },
  { iso3:'BFA', name:'Burkina Faso',             latitude:12.36,  longitude:-1.53,  index_value:45, category_scores:{'Armed Conflict & Violence':65,'Public Health Crises':42,'Human Rights Violations':50,'Environmental Restoration':30,'Social Progress':14,'Scientific Breakthroughs':6} },
  { iso3:'LBY', name:'Libya',                    latitude:26.34,  longitude:17.23,  index_value:32, category_scores:{'Armed Conflict & Violence':40,'Public Health Crises':28,'Human Rights Violations':45,'Environmental Restoration':18,'Social Progress':12,'Scientific Breakthroughs':8} },
  { iso3:'SAU', name:'Saudi Arabia',             latitude:23.89,  longitude:45.08,  index_value:15, category_scores:{'Armed Conflict & Violence':12,'Public Health Crises':14,'Human Rights Violations':48,'Environmental Restoration':20,'Social Progress':15,'Scientific Breakthroughs':18} },
  { iso3:'PSE', name:'Palestine',                latitude:31.95,  longitude:35.23,  index_value:8,  category_scores:{'Armed Conflict & Violence':6,'Public Health Crises':12,'Human Rights Violations':20,'Environmental Restoration':10,'Social Progress':8,'Scientific Breakthroughs':5} },
  { iso3:'LBN', name:'Lebanon',                  latitude:33.85,  longitude:35.86,  index_value:30, category_scores:{'Armed Conflict & Violence':28,'Public Health Crises':38,'Human Rights Violations':35,'Environmental Restoration':22,'Social Progress':20,'Scientific Breakthroughs':12} },
  { iso3:'SWE', name:'Sweden',                   latitude:60.13,  longitude:18.64,  index_value:3,  category_scores:{'Armed Conflict & Violence':2,'Public Health Crises':3,'Human Rights Violations':4,'Environmental Restoration':8,'Social Progress':5,'Scientific Breakthroughs':4} },
  { iso3:'NOR', name:'Norway',                   latitude:60.47,  longitude:8.47,   index_value:3,  category_scores:{'Armed Conflict & Violence':2,'Public Health Crises':3,'Human Rights Violations':4,'Environmental Restoration':7,'Social Progress':5,'Scientific Breakthroughs':4} },
  { iso3:'NLD', name:'Netherlands',              latitude:52.13,  longitude:5.29,   index_value:3,  category_scores:{'Armed Conflict & Violence':2,'Public Health Crises':3,'Human Rights Violations':4,'Environmental Restoration':8,'Social Progress':6,'Scientific Breakthroughs':4} },
];

export const mockAlerts = [
  { country_iso3:'SDN', country_name:'Sudan',  message:'Coverage gap critical: Sudan conflict receives 40x less coverage than comparable crises', timestamp: new Date(Date.now()-15*60000).toISOString() },
  { country_iso3:'CAF', country_name:'Central African Republic', message:'Human rights violations in CAR go unreported — Invisible Index surged this week', timestamp: new Date(Date.now()-60*60000).toISOString() },
];

// Used by hooks in mock mode. Keep these lightweight; the hooks
// already synthesize reasonable defaults for missing countries.
export const mockCountryDetails = {};

export const mockBriefs = {
  SDN: 'Sudan faces severe instability with limited sustained international coverage. Information gaps and access restrictions reduce visibility into fast-moving humanitarian impacts. Increased support for independent reporting and aid logistics would improve situational awareness.',
  AGO: 'Angola’s risk profile is shaped by regional pressures and uneven media attention to localized crises. Gaps in reporting can delay response to emerging issues. Strengthening early-warning monitoring and local partnerships would improve resilience.',
  default:
    'This country is currently assessed as {severity} risk for information integrity and coverage gaps. Monitoring suggests limited visibility into key developments relative to impact. Continued verification, local sourcing, and timely fact-checking would improve the response.',
};

export const mockSummaries = {
  SDN: {
    'Armed Conflict & Violence': { summary: 'Sudan is experiencing one of the world\'s most severe humanitarian crises, with over 10 million people displaced by ongoing civil war between the Sudanese Armed Forces and the Rapid Support Forces. The conflict, which began in April 2023, has created the world\'s largest displacement emergency, with mass atrocities reported in Darfur and supply routes to famine-stricken areas deliberately blocked.', links: ['https://www.theguardian.com/world/sudan','https://www.bbc.com/news/topics/c302m85q2xpt','https://apnews.com/hub/sudan'] },
    'Public Health Crises': { summary: 'Famine conditions have been declared in multiple regions of Sudan, with the UN warning that 25 million people face acute food insecurity. Cholera and other disease outbreaks compound the crisis as healthcare infrastructure collapses across conflict-affected areas.', links: ['https://www.who.int/emergencies/situations/Sudan','https://www.unicef.org/emergencies/sudan-emergency'] },
    'Human Rights Violations': { summary: 'The UN has documented widespread sexual violence, ethnic targeting, and deliberate attacks on civilians in Darfur and Khartoum state. Both warring parties have been accused of war crimes, with mass graves discovered in multiple locations.', links: ['https://www.hrw.org/world-report/2024/country-chapters/sudan','https://www.amnesty.org/en/location/africa/east-africa-the-horn-and-the-great-lakes/sudan/'] },
  },
  AGO: {
    'Armed Conflict & Violence': { summary: 'Angola\'s Cabinda province continues to see low-level separatist activity, while regional stability has improved following the end of decades of civil war. However, security forces continue to be accused of disproportionate responses to protests, particularly in oil-rich regions.', links: ['https://www.bbc.com/news/topics/cnx753je2q7t','https://reliefweb.int/country/ago'] },
    'Public Health Crises': { summary: 'Southern Angola faces severe food insecurity following consecutive drought years, with 7.3 million people requiring humanitarian assistance. Malnutrition rates in Cunene and Cuando Cubango provinces exceed emergency thresholds, yet international response has been severely underfunded.', links: ['https://www.wfp.org/countries/angola','https://www.msf.org/angola'] },
  },
  default: {
    summary: 'Limited coverage available for this country and category. The Invisible Index indicates this crisis is significantly underreported relative to its scale. Our data agents are continuously monitoring for new developments.',
    links: [],
  }
};
