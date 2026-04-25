# Vigil Frontend

React + Vite frontend for the Vigil global information integrity monitoring system. Features an interactive 2D world map with country-level risk visualization, real-time alerts, and AI-generated intelligence briefs.

## Features

- **Interactive World Map**: Click any country to view detailed information
- **Real-time Monitoring**: Live updates of integrity index scores across 195 countries
- **Risk Visualization**: Color-coded map showing risk levels (green = low, red = critical)
- **Intelligence Briefs**: AI-generated country-specific analysis
- **Alert System**: Live banner notifications for critical integrity spikes
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **react-simple-maps** - Interactive SVG map rendering
- **d3-scale** - Color scale calculations

## Prerequisites

- Node.js 16+ and npm
- Backend API running (optional - mock data mode available!)

## Quick Start

### Option A: Mock Data Mode (No Backend Required) ⭐

Perfect for development, demos, or frontend-only work!

```bash
npm install
npm run dev
```

That's it! The `.env` file is pre-configured with `VITE_USE_MOCK_DATA=true`.

Open `http://localhost:5173` and you'll see:
- 50+ countries with realistic index values
- 2 sample alerts (Ukraine, Syria)
- AI-generated briefs for major countries
- Fully interactive map

### Option B: Connect to Real Backend

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_DATA=false
```

Then run:
```bash
npm run dev
```

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### 5. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
vigil-frontend/
├── src/
│   ├── components/
│   │   ├── AlertBanner.jsx       # Top alert notification banner
│   │   ├── AlertBanner.css
│   │   ├── WorldMap.jsx          # Interactive 2D map component
│   │   ├── WorldMap.css
│   │   ├── CountryPanel.jsx      # Side panel with country details
│   │   └── CountryPanel.css
│   ├── hooks/
│   │   ├── useGlobeData.js       # Fetch countries + index data
│   │   ├── useBrief.js           # Fetch AI-generated briefs
│   │   └── useAlerts.js          # Poll for latest alerts
│   ├── utils/
│   │   └── colorScale.js         # Index-to-color mapping functions
│   ├── App.jsx                   # Main app component
│   ├── App.css
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles
├── index.html
├── vite.config.js
├── package.json
└── .env
```

## API Integration

The frontend consumes these backend endpoints:

### GET `/api/globe`
Returns list of countries with current integrity index values.

**Response:**
```json
{
  "countries": [
    {
      "iso3": "USA",
      "name": "United States",
      "index_value": 45.2,
      "latitude": 37.0902,
      "longitude": -95.7129
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### POST `/api/country/{iso3}/brief`
Generates an AI brief for the specified country.

**Response:**
```json
{
  "iso3": "USA",
  "brief_text": "Current integrity assessment shows...",
  "audio_url": null,
  "timestamp": "2024-01-15T10:30:05Z"
}
```

### GET `/api/alerts/latest`
Returns recent critical alerts.

**Response:**
```json
{
  "alerts": [
    {
      "country_iso3": "XXX",
      "country_name": "Country Name",
      "message": "Critical spike detected: +15 points in 24h",
      "timestamp": "2024-01-15T09:00:00Z"
    }
  ]
}
```

## Customization

### Mock Data Mode

Toggle between mock and real data in `.env`:

```env
# Use mock data (no backend needed)
VITE_USE_MOCK_DATA=true

# Use real backend
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://localhost:8000
```

Edit mock data in `src/data/mockData.js`:
- `mockCountries` - Add/modify countries and their index values
- `mockAlerts` - Change sample alerts
- `mockBriefs` - Update intelligence brief templates

### Adjusting Polling Intervals

Edit the intervals in the hooks:

```javascript
// src/hooks/useGlobeData.js
const interval = setInterval(fetchData, 30000); // 30 seconds

// src/hooks/useAlerts.js
const interval = setInterval(fetchAlerts, 15000); // 15 seconds
```

### Changing Color Scheme

Modify `src/utils/colorScale.js`:

```javascript
const colorScale = scaleLinear()
  .domain([0, 25, 50, 75, 100])
  .range(['#10b981', '#84cc16', '#fbbf24', '#f97316', '#ef4444']);
```

### Map Projection

Edit `src/components/WorldMap.jsx`:

```javascript
<ComposableMap
  projection="geoMercator"  // Try: geoEqualEarth, geoNaturalEarth1
  projectionConfig={{
    scale: 147,
    center: [0, 20]
  }}
>
```

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variable in Vercel dashboard:
- `VITE_API_BASE_URL` = your backend URL

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

Or connect your GitHub repo in the Netlify dashboard.

### Railway / Render

1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_API_BASE_URL`

## Troubleshooting

### Map Not Rendering

- Check browser console for errors
- Verify TopoJSON URL is accessible: https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json
- Ensure `react-simple-maps` is installed: `npm install react-simple-maps`

### API Connection Issues

- Verify `VITE_API_BASE_URL` in `.env`
- Check CORS is enabled on backend
- Open browser DevTools → Network tab to inspect requests
- Ensure backend is running and accessible

### Countries Not Showing Data

- Verify backend `/api/globe` endpoint returns data
- Check that country ISO3 codes match between frontend map and backend data
- Inspect `countryDataMap` in WorldMap component

### Brief Not Loading

- Check backend `/api/country/{iso3}/brief` endpoint
- Verify `ANTHROPIC_API_KEY` is set in backend (or fallback brief is working)
- Check browser console for fetch errors

## Development Tips

### Hot Module Replacement

Vite supports HMR out of the box. Changes to React components will update instantly without page refresh.

### React DevTools

Install React DevTools browser extension for component inspection and debugging.

### API Mocking

For frontend-only development without backend, you can modify hooks to return mock data:

```javascript
// src/hooks/useGlobeData.js (development only)
const mockCountries = [
  { iso3: 'USA', name: 'United States', index_value: 45.2, ... }
];
setCountries(mockCountries);
```

## Contributing

1. Follow the existing component structure
2. Use functional components with hooks
3. Keep components focused and modular
4. Add CSS modules alongside components
5. Update this README for any new features

## License

MIT
