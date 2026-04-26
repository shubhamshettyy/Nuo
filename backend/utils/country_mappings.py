# Complete ISO3 to country name mapping for all countries in your system

ISO3_TO_NAME = {
    # North America
    "USA": "United States",
    "CAN": "Canada",
    "MEX": "Mexico",
    
    # Central America & Caribbean
    "GTM": "Guatemala",
    "HND": "Honduras",
    "NIC": "Nicaragua",
    "CRI": "Costa Rica",
    "PAN": "Panama",
    "CUB": "Cuba",
    "JAM": "Jamaica",
    "HTI": "Haiti",
    "DOM": "Dominican Republic",
    "TTO": "Trinidad and Tobago",
    
    # South America
    "COL": "Colombia",
    "VEN": "Venezuela",
    "GUY": "Guyana",
    "SUR": "Suriname",
    "ECU": "Ecuador",
    "PER": "Peru",
    "BOL": "Bolivia",
    "BRA": "Brazil",
    "PRY": "Paraguay",
    "URY": "Uruguay",
    "ARG": "Argentina",
    "CHL": "Chile",
    
    # Western Europe
    "GBR": "United Kingdom",
    "IRL": "Ireland",
    "FRA": "France",
    "ESP": "Spain",
    "PRT": "Portugal",
    "DEU": "Germany",
    "NLD": "Netherlands",
    "BEL": "Belgium",
    "CHE": "Switzerland",
    "AUT": "Austria",
    "ITA": "Italy",
    
    # Eastern Europe
    "POL": "Poland",
    "CZE": "Czech Republic",
    "HUN": "Hungary",
    "ROU": "Romania",
    "BGR": "Bulgaria",
    "SRB": "Serbia",
    "HRV": "Croatia",
    "UKR": "Ukraine",
    "BLR": "Belarus",
    "LTU": "Lithuania",
    "LVA": "Latvia",
    
    # Northern Europe
    "SWE": "Sweden",
    "NOR": "Norway",
    "DNK": "Denmark",
    "FIN": "Finland",
    
    # Southern Europe
    "GRC": "Greece",
    
    # Russia & Former Soviet
    "RUS": "Russia",
    "KAZ": "Kazakhstan",
    "UZB": "Uzbekistan",
    "AZE": "Azerbaijan",
    "GEO": "Georgia",
    "ARM": "Armenia",
    
    # Middle East
    "TUR": "Turkey",
    "SYR": "Syria",
    "IRQ": "Iraq",
    "IRN": "Iran",
    "ISR": "Israel",
    "JOR": "Jordan",
    "LBN": "Lebanon",
    "SAU": "Saudi Arabia",
    "ARE": "United Arab Emirates",
    "QAT": "Qatar",
    "YEM": "Yemen",
    "PSE": "Palestine",
    
    # South Asia
    "AFG": "Afghanistan",
    "PAK": "Pakistan",
    "IND": "India",
    "NPL": "Nepal",
    "BGD": "Bangladesh",
    
    # Southeast Asia
    "MMR": "Myanmar",
    "THA": "Thailand",
    "VNM": "Vietnam",
    "KHM": "Cambodia",
    "MYS": "Malaysia",
    "IDN": "Indonesia",
    "PHL": "Philippines",
    
    # East Asia
    "CHN": "China",
    "JPN": "Japan",
    "KOR": "South Korea",
    "MNG": "Mongolia",
    
    # Africa - North
    "EGY": "Egypt",
    "LBY": "Libya",
    "TUN": "Tunisia",
    "DZA": "Algeria",
    "MAR": "Morocco",
    
    # Africa - West
    "NGA": "Nigeria",
    "GHA": "Ghana",
    "CIV": "Ivory Coast",
    "SEN": "Senegal",
    "MLI": "Mali",
    "NER": "Niger",
    "CMR": "Cameroon",
    "BFA": "Burkina Faso",
    
    # Africa - Central
    "COD": "Democratic Republic of the Congo",
    "AGO": "Angola",
    "SSD": "South Sudan",
    "CAF": "Central African Republic",
    "TCD": "Chad",
    
    # Africa - East
    "SDN": "Sudan",
    "ETH": "Ethiopia",
    "SOM": "Somalia",
    "KEN": "Kenya",
    "TZA": "Tanzania",
    
    # Africa - Southern
    "MOZ": "Mozambique",
    "ZWE": "Zimbabwe",
    "ZMB": "Zambia",
    "ZAF": "South Africa",
    
    # Oceania
    "AUS": "Australia",
    "NZL": "New Zealand",
}

# Reverse mapping: country name → ISO3
NAME_TO_ISO3 = {v: k for k, v in ISO3_TO_NAME.items()}