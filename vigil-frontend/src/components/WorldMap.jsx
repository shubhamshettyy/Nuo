import React, { memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import { getCountryColor } from '../utils/colorScale';
import { numericToAlpha3 } from '../utils/isoMapping';
import './WorldMap.css';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

function WorldMap({ countries, onCountryClick, selectedCountry }) {
  // Create a map of ISO3 codes to country data
  const countryDataMap = countries.reduce((acc, country) => {
    acc[country.iso3] = country;
    return acc;
  }, {});

  return (
    <div className="world-map-container">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 147,
          center: [0, 20]
        }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                // Convert numeric ISO code to alpha-3
                const numericCode = geo.id;
                const iso3 = numericToAlpha3[numericCode];
                const country = countryDataMap[iso3];
                const indexValue = country?.index_value;
                const isSelected = selectedCountry?.iso3 === iso3;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      if (country) {
                        onCountryClick(country);
                      }
                    }}
                    style={{
                      default: {
                        fill: getCountryColor(indexValue),
                        stroke: isSelected ? '#fff' : '#1a1f3a',
                        strokeWidth: isSelected ? 2 : 0.5,
                        outline: 'none',
                      },
                      hover: {
                        fill: getCountryColor(indexValue),
                        stroke: '#fff',
                        strokeWidth: 1.5,
                        outline: 'none',
                        filter: 'brightness(1.2)',
                        cursor: country ? 'pointer' : 'default',
                      },
                      pressed: {
                        fill: getCountryColor(indexValue),
                        stroke: '#fff',
                        strokeWidth: 2,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}

export default memo(WorldMap);