import { getCountryName } from '../data/country-names';
import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { getCountryColor, getIndexLabel } from '../utils/colorScale';
import { numericToAlpha3 } from '../utils/isoMapping';
import './WorldMap.css';

const GEO = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const CENTERS = {
  USA:[-97,38],CAN:[-96,56],MEX:[-102,24],GTM:[-90,15],HND:[-87,15],NIC:[-85,13],
  CRI:[-84,10],PAN:[-80,9],CUB:[-80,22],JAM:[-77,18],HTI:[-73,19],DOM:[-70,19],
  TTO:[-61,11],COL:[-74,4],VEN:[-66,8],GUY:[-59,5],SUR:[-56,4],ECU:[-77,-2],
  PER:[-76,-10],BOL:[-64,-17],BRA:[-51,-14],PRY:[-58,-23],URY:[-56,-33],
  ARG:[-64,-34],CHL:[-71,-30],GBR:[-2,54],IRL:[-8,53],FRA:[2,46],ESP:[-3,40],
  PRT:[-8,39],DEU:[10,51],NLD:[5,52],BEL:[4,51],CHE:[8,47],AUT:[14,47],
  ITA:[12,42],GRC:[22,39],POL:[20,52],CZE:[15,50],HUN:[19,47],ROU:[25,46],
  BGR:[25,43],SRB:[21,44],HRV:[16,45],SWE:[18,60],NOR:[10,62],DNK:[10,56],
  FIN:[26,62],RUS:[95,60],UKR:[32,49],BLR:[28,53],LTU:[24,56],LVA:[25,57],
  TUR:[35,39],SYR:[38,35],IRQ:[44,33],IRN:[53,32],ISR:[35,31],JOR:[37,31],
  LBN:[35,34],SAU:[45,24],ARE:[54,24],QAT:[51,25],YEM:[48,16],AFG:[67,33],
  PAK:[70,30],IND:[77,20],NPL:[84,28],BGD:[90,24],MMR:[96,21],THA:[100,15],
  VNM:[108,14],KHM:[105,12],MYS:[110,3],IDN:[118,-5],PHL:[122,12],
  CHN:[105,35],JPN:[138,36],KOR:[128,36],MNG:[103,46],KAZ:[67,48],
  UZB:[63,41],AZE:[47,40],GEO:[43,42],ARM:[45,40],EGY:[30,26],LBY:[17,27],
  TUN:[9,34],DZA:[3,28],MAR:[-5,32],SDN:[30,16],ETH:[40,8],SOM:[46,6],
  KEN:[37,-1],TZA:[35,-6],MOZ:[35,-18],ZWE:[30,-20],ZMB:[28,-14],
  ZAF:[25,-29],NGA:[8,10],GHA:[-1,8],CIV:[-5,8],SEN:[-14,14],MLI:[-2,17],
  NER:[8,17],CMR:[12,4],COD:[24,-4],DEM:[24,-4],AGO:[18,-12],SSD:[31,7],CAF:[20,7],
  TCD:[18,15],BFA:[-1,12],AUS:[133,-27],NZL:[174,-41],PSE:[35,31],
};

// Minimal — just a small pulsing dot
function Beacon({ coords, critical }) {
  const r = critical ? 3 : 2.2;
  const color = critical ? '#c0392b' : '#e74c3c';
  return (
    <Marker coordinates={coords}>
      <g className="beacon">
        <circle r={r * 2.5} fill={color} opacity={0.15} />
        <circle className="beacon-dot" r={r} fill={color} />
      </g>
    </Marker>
  );
}

function WorldMap({ countries, onCountryClick, selectedCountry, activeCategory, activeCatLabel, lang = "en" }) {
  const [tt, setTt]         = useState({ on: false, x: 0, y: 0, name: '', val: null });
  const [noHint, setNoHint] = useState(false);
  const [fading, setFading] = useState(false);
  const prevCat             = useRef(activeCategory);

  useEffect(() => {
    if (prevCat.current !== activeCategory) {
      setFading(true);
      setTimeout(() => setFading(false), 300);
      prevCat.current = activeCategory;
    }
  }, [activeCategory]);

  const dataMap = countries.reduce((a, c) => { a[c.iso3] = c; return a; }, {});

  const onMove = useCallback((e) => {
    const svg = e.currentTarget.ownerSVGElement || e.currentTarget;
    if (!svg?.createSVGPoint) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const t = pt.matrixTransform(svg.getScreenCTM().inverse());
    setTt(p => ({ ...p, x: t.x, y: t.y }));
  }, []);

  const beacons = countries
    .filter(c => c.index_value >= 70 && CENTERS[c.iso3])
    .sort((a, b) => b.index_value - a.index_value)
    .slice(0, 12);

  return (
    <div className="map-root">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 148, center: [10, 18] }}
        style={{ opacity: fading ? 0.6 : 1, transition: 'opacity 0.3s ease' }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO}>
            {({ geographies }) => geographies.map(geo => {
              const iso3 = numericToAlpha3[geo.id];
              const c    = dataMap[iso3];
              const val  = c?.index_value;
              const has  = val != null;
              const sel  = selectedCountry?.iso3 === iso3;
              const fill = has ? getCountryColor(val) : 'var(--map-no-data)';

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => c && (setNoHint(true), onCountryClick(c))}
                  onMouseEnter={() => has && setTt(p => ({ ...p, on: true, name: c.name, val }))}
                  onMouseMove={onMove}
                  onMouseLeave={() => setTt(p => ({ ...p, on: false }))}
                  style={{
                    default: {
                      fill,
                      stroke: '#ffffff',
                      strokeWidth: sel ? 1.5 : 0.4,
                      outline: 'none',
                      opacity: sel ? 1 : 0.9,
                      filter: sel ? 'brightness(0.85)' : 'none',
                      transition: 'fill 0.3s ease',
                    },
                    hover: {
                      fill: has ? fill : 'var(--map-no-data)',
                      stroke: '#ffffff',
                      strokeWidth: 0.8,
                      outline: 'none',
                      filter: has ? 'brightness(0.88)' : 'none',
                      cursor: has ? 'pointer' : 'default',
                      transition: 'fill 0.3s ease',
                    },
                    pressed: {
                      fill,
                      stroke: '#ffffff',
                      strokeWidth: 1.5,
                      outline: 'none',
                    },
                  }}
                />
              );
            })}
          </Geographies>

          {beacons.map(c => (
            <Beacon key={c.iso3} coords={CENTERS[c.iso3]} critical={c.index_value >= 85} />
          ))}
        </ZoomableGroup>

        {tt.on && (
          <g className="tt" transform={`translate(${tt.x + 12} ${tt.y - 16})`}>
            <rect width={140} height={42} rx="3" />
            <text className="tt-name" x="10" y="16">{tt.name}</text>
            <text className="tt-val"  x="10" y="31">{getIndexLabel(tt.val)}</text>
          </g>
        )}
      </ComposableMap>

      {!noHint && !selectedCountry && (
        <div className="map-hint">
          <div className="hint-dot-wrap">
            <div className="hint-ring-a" />
            <div className="hint-ring-b" />
            <div className="hint-core" />
          </div>
          Click any country to read the coverage report
        </div>
      )}
    </div>
  );
}

export default memo(WorldMap);
