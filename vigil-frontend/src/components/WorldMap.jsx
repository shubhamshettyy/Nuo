import React, { memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import { getCountryColor } from '../utils/colorScale';
import './WorldMap.css';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

function WorldMap({ countries, onCountryClick, selectedCountry }) {
  // Create a map of ISO3 codes to index values
  const countryDataMap = countries.reduce((acc, country) => {
    acc[country.iso3] = country.index_value;
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
                const iso3 = geo.id;
                const indexValue = countryDataMap[iso3];
                const isSelected = selectedCountry?.iso3 === iso3;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      const country = countries.find(c => c.iso3 === iso3);
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
                        cursor: 'pointer',
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
