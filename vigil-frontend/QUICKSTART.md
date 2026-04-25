# Vigil Frontend - Quick Start Guide

Get up and running in **30 seconds** with mock data mode!

## Prerequisites
- Node.js 16+ installed
- ⚠️ **Backend NOT required** - mock data works out of the box!

## Instant Start (Mock Data Mode) ⚡

```bash
npm install
npm run dev
```

**That's it!** Open http://localhost:5173

You'll see:
- ✅ Interactive world map with 50+ countries
- ✅ Color-coded integrity index values
- ✅ 2 sample critical alerts
- ✅ AI-generated intelligence briefs
- ✅ Fully functional UI

## How It Works

The project comes with `.env` pre-configured:

```env
VITE_USE_MOCK_DATA=true
```

Mock data includes:
- 50+ countries across all continents
- Realistic index values (0-100 scale)
- Sample alerts for Ukraine and Syria
- Intelligence brief templates

## Switch to Real Backend Later

When ready, edit `.env`:

```env
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://localhost:8000
```

## Option 1: Automated Setup (Recommended)

```bash
# Make setup script executable (if needed)
chmod +x setup.sh

# Run setup
./setup.sh

# Edit .env with your backend URL
nano .env  # or use your preferred editor

# Start dev server
npm run dev
```

Open http://localhost:5173

## Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env

# 3. Edit .env and set your backend URL
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# 4. Start development server
npm run dev
```

## Verify It's Working

1. **Map loads**: You should see a world map with countries
2. **Click a country**: Side panel should open with country details
3. **Brief generates**: After clicking a country, a brief should appear (may take a few seconds)
4. **Alerts show**: If there are any critical alerts, a red banner appears at the top

## Common Issues

### "Failed to load data"
- **Cause**: Backend not running or wrong URL in `.env`
- **Fix**: Verify `VITE_API_BASE_URL` points to running backend
- **Test**: Visit `http://localhost:8000/health` in browser

### Map shows but countries are gray
- **Cause**: Backend `/api/globe` not returning index values
- **Fix**: Check backend logs, verify MongoDB connection

### Brief fails to load
- **Cause**: Backend brief endpoint error or missing API keys
- **Fix**: Check backend has `ANTHROPIC_API_KEY` or fallback is working

### CORS errors in browser console
- **Cause**: Backend CORS not configured
- **Fix**: Add your frontend URL to backend CORS allowed origins

## Production Deployment

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable in Vercel dashboard:
# VITE_API_BASE_URL = https://your-backend.com
```

### Quick Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Set environment variable in Netlify dashboard:
# VITE_API_BASE_URL = https://your-backend.com
```

## Development Tips

- **Live reload**: Changes auto-refresh in browser
- **Console**: Open DevTools (F12) to see API calls and errors
- **Port conflict**: If 5173 is taken, Vite will use next available port
- **API testing**: Use `/health`, `/api/globe` endpoints to verify backend

## Next Steps

1. Customize colors in `src/utils/colorScale.js`
2. Adjust polling intervals in hooks (default: 30s for data, 15s for alerts)
3. Add custom features in `src/components/`
4. Deploy to production when ready

## Need Help?

- Check browser console (F12) for errors
- Check backend logs for API issues
- Verify all environment variables are set
- Review full README.md for detailed documentation
