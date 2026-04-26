import React, { memo, useState, useRef, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from 'react-simple-maps';
import { getCountryColor } from '../utils/colorScale';
import { numericToAlpha3 } from '../utils/isoMapping';
import './WorldMap.css';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// [longitude, latitude] centroids for countries that may have index data
const COUNTRY_CENTROIDS = {
  USA: [-97, 38],   CAN: [-96, 56],   MEX: [-102, 24],  GTM: [-90, 15],
  BLZ: [-88, 17],   HND: [-87, 15],   SLV: [-89, 14],   NIC: [-85, 13],
  CRI: [-84, 10],   PAN: [-80, 9],    CUB: [-80, 22],   JAM: [-77, 18],
  HTI: [-73, 19],   DOM: [-70, 19],   TTO: [-61, 11],
  COL: [-74, 4],    VEN: [-66, 8],    GUY: [-59, 5],    SUR: [-56, 4],
  ECU: [-77, -2],   PER: [-76, -10],  BOL: [-64, -17],  BRA: [-51, -14],
  PRY: [-58, -23],  URY: [-56, -33],  ARG: [-64, -34],  CHL: [-71, -30],
  GBR: [-2, 54],    IRL: [-8, 53],    FRA: [2, 46],     ESP: [-3, 40],
  PRT: [-8, 39],    DEU: [10, 51],    NLD: [5, 52],     BEL: [4, 51],
  CHE: [8, 47],     AUT: [14, 47],    ITA: [12, 42],    GRC: [22, 39],
  POL: [20, 52],    CZE: [15, 50],    SVK: [19, 49],    HUN: [19, 47],
  ROU: [25, 46],    BGR: [25, 43],    SRB: [21, 44],    HRV: [16, 45],
  SWE: [18, 60],    NOR: [10, 62],    DNK: [10, 56],    FIN: [26, 62],
  RUS: [95, 60],    UKR: [32, 49],    BLR: [28, 53],    MDA: [29, 47],
  LTU: [24, 56],    LVA: [25, 57],    EST: [25, 59],
  TUR: [35, 39],    SYR: [38, 35],    IRQ: [44, 33],    IRN: [53, 32],
  ISR: [35, 31],    JOR: [37, 31],    LBN: [35, 34],    SAU: [45, 24],
  ARE: [54, 24],    QAT: [51, 25],    KWT: [47, 29],    YEM: [48, 16],
  OMN: [57, 21],    AFG: [67, 33],    PAK: [70, 30],    IND: [77, 20],
  NPL: [84, 28],    BGD: [90, 24],    LKA: [81, 7],     MMR: [96, 21],
  THA: [100, 15],   VNM: [108, 14],   LAO: [103, 18],   KHM: [105, 12],
  MYS: [110, 3],    IDN: [118, -5],   PHL: [122, 12],
  CHN: [105, 35],   TWN: [121, 24],   JPN: [138, 36],   KOR: [128, 36],
  PRK: [127, 40],   MNG: [103, 46],
  KAZ: [67, 48],    UZB: [63, 41],    TJK: [71, 39],    KGZ: [75, 41],
  TKM: [59, 39],    AZE: [47, 40],    GEO: [43, 42],    ARM: [45, 40],
  EGY: [30, 26],    LBY: [17, 27],    TUN: [9, 34],     DZA: [3, 28],
  MAR: [-5, 32],    SDN: [30, 16],    ETH: [40, 8],     SOM: [46, 6],
  KEN: [37, -1],    TZA: [35, -6],    MOZ: [35, -18],   ZWE: [30, -20],
  ZMB: [28, -14],   ZAF: [25, -29],   NGA: [8, 10],     GHA: [-1, 8],
  CIV: [-5, 8],     SEN: [-14, 14],   MLI: [-2, 17],    NER: [8, 17],
  CMR: [12, 4],     COD: [24, -4],    AGO: [18, -12],   MDG: [47, -20],
  AUS: [133, -27],  NZL: [174, -41],
};

function PulseMarker({ coords, severity }) {
  const color = severity === 'critical' ? '#ff1a45' : '#ffaa00';

  return (
    <Marker coordinates={coords}>
      <g style={{ pointerEvents: 'none' }} className={`pulse-marker pulse-${severity}`}>
        <circle className="pulse-ring ring-one" r={16} fill="none" stroke={color} strokeWidth={1.5} />
        <circle className="pulse-ring ring-two" r={16} fill="none" stroke={color} strokeWidth={1.1} />
        <circle r={4.2} fill={color} opacity={0.14} />
        <circle r={2.2} fill={color} opacity={0.5} />
        <circle r={1.2} fill={color} />
      </g>
    </Marker>
  );
}

function WorldMap({ countries, onCountryClick, selectedCountry }) {
  const [tooltip, setTooltip] = useState({
    visible: false,
    svgX: 0,
    svgY: 0,
    name: '',
    value: null,
  });
  const [hintDismissed, setHintDismissed] = useState(false);
  const containerRef = useRef(null);

  const countryDataMap = countries.reduce((acc, c) => {
    acc[c.iso3] = c;
    return acc;
  }, {});

  const handleMouseMove = useCallback((e) => {
    const svg = e.currentTarget.ownerSVGElement || e.currentTarget;
    if (!svg || !svg.createSVGPoint) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const transformed = point.matrixTransform(svg.getScreenCTM().inverse());
    setTooltip((prev) => ({ ...prev, svgX: transformed.x, svgY: transformed.y }));
  }, []);

  const handleClick = useCallback((country) => {
    if (country) {
      setHintDismissed(true);
      onCountryClick(country);
    }
  }, [onCountryClick]);

  // Countries with elevated/critical risk that have known centroids.
  const pulseCountries = countries.filter(
    (country) => country.index_value != null && country.index_value > 75 && COUNTRY_CENTROIDS[country.iso3]
  );

  return (
    <div className="world-map-container" ref={containerRef} onMouseMove={handleMouseMove}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 147, center: [0, 20] }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const iso3 = numericToAlpha3[geo.id];
                const country = countryDataMap[iso3];
                const indexValue = country?.index_value;
                const hasData = indexValue != null;
                const isSelected = selectedCountry?.iso3 === iso3;
                const fillColor = hasData ? getCountryColor(indexValue) : '#0c1528';

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleClick(country)}
                    onMouseEnter={() => {
                      if (hasData) {
                        setTooltip((prev) => ({
                          ...prev,
                          visible: true,
                          name: country.name,
                          value: indexValue,
                        }));
                      }
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setTooltip((prev) => ({ ...prev, visible: false }))}
                    style={{
                      default: {
                        fill: fillColor,
                        stroke: isSelected ? '#ffffff' : '#070e1e',
                        strokeWidth: isSelected ? 1.4 : 0.4,
                        outline: 'none',
                        filter: isSelected
                          ? 'drop-shadow(0 0 4px rgba(0,212,255,0.6))'
                          : 'none',
                      },
                      hover: {
                        fill: hasData ? fillColor : '#0c1528',
                        stroke: hasData ? '#ffffff' : '#070e1e',
                        strokeWidth: hasData ? 1.2 : 0.4,
                        outline: 'none',
                        filter: hasData
                          ? 'brightness(1.45) drop-shadow(0 0 4px rgba(255,255,255,0.35))'
                          : 'none',
                        cursor: hasData ? 'pointer' : 'default',
                      },
                      pressed: {
                        fill: fillColor,
                        stroke: '#00d4ff',
                        strokeWidth: 2,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Radar-ping markers on elevated / critical countries */}
          {pulseCountries.map((country) => (
            <PulseMarker
              key={country.iso3}
              coords={COUNTRY_CENTROIDS[country.iso3]}
              severity={country.index_value > 85 ? 'critical' : 'elevated'}
            />
          ))}
        </ZoomableGroup>

        {tooltip.visible && (
          <g className="map-tooltip-g" transform={`translate(${tooltip.svgX + 14} ${tooltip.svgY - 16})`}>
            <rect width="152" height="44" rx="7" />
            <text className="tooltip-country" x="10" y="17">
              {tooltip.name}
            </text>
            <text className="tooltip-index" x="10" y="34">
              INDEX {Math.round(tooltip.value)}
            </text>
          </g>
        )}
      </ComposableMap>

      {/* Click-to-explore hint — auto-fades via CSS after 8s, also dismissed on first click */}
      {!hintDismissed && !selectedCountry && (
        <div className="map-click-hint">
          <div className="hint-rings">
            <div className="hint-ring hint-ring-1" />
            <div className="hint-ring hint-ring-2" />
            <div className="hint-dot" />
          </div>
          <span>CLICK ANY COUNTRY TO EXPLORE</span>
        </div>
      )}
    </div>
  );
}

export default memo(WorldMap);
