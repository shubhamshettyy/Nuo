# Vigil MVP

This repo contains a buildable Vigil MVP based on your implementation plan, with:
- FastAPI backend (`/api/globe`, `/api/country/{iso3}`, `/api/country/{iso3}/brief`, `/api/alerts/latest`, `/internal/alert`, `/health`)
- Four Agentverse-ready agents (`data_agent`, `fact_checker_agent`, `alert_agent`, `query_agent`)
- React frontend with globe-style UI, country selection, brief panel, and alert banner polling
- ElevenLabs intentionally removed from runtime flow (brief endpoint returns `audio_url: null`)

## What Was Implemented

### Backend
- `backend/main.py`: API app + CORS + route wiring
- `backend/routers/globe.py`: globe and country routes
- `backend/routers/brief.py`: brief generation route (Claude + fallback)
- `backend/routers/internal.py`: alert webhook + latest alerts
- `backend/services/mongo_service.py`: MongoDB Atlas Data API client with local mock fallback
- `backend/services/claude_service.py`: Anthropic brief generation wrapper with fallback text
- `backend/data/mock_countries.json`: demo data for no-key local testing

### Agents
- `agents/shared/models.py`: shared uAgent message models
- `agents/data_agent.py`: data pull + index compute + Mongo write + FactChecker handoff
- `agents/fact_checker_agent.py`: validation, quarantine logging, verified forwarding
- `agents/alert_agent.py`: spike detection + backend webhook
- `agents/query_agent.py`: ChatProtocol handler for top ignored queries

### Frontend
- `frontend/src/hooks/useGlobeData.js`: `/api/globe` polling
- `frontend/src/hooks/useBrief.js`: brief fetch + in-memory cache
- `frontend/src/components/Globe.jsx`: index heat list + globe visual
- `frontend/src/components/CountryPanel.jsx`: country details + generated brief
- `frontend/src/components/AlertBanner.jsx`: latest alert polling
- `frontend/src/App.jsx`: shell integration

## Manual Instructions You Need To Perform

## 1) Create `.env` files
- Copy `.env.example` to `.env` at repo root.
- Also create `backend/.env` and `agents/.env` if you run those from subfolders.
- Fill required variables:
  - `MONGO_DATA_API_URL`
  - `MONGO_DATA_API_KEY`
  - `MONGO_DATABASE`
  - `MONGO_DATASOURCE`
  - `INTERNAL_WEBHOOK_SECRET`
  - `BACKEND_URL`
  - `ANTHROPIC_API_KEY` (optional; fallback brief works without it)
  - `FACT_CHECKER_AGENT_ADDRESS`, `ALERT_AGENT_ADDRESS` (for full agent chain)
  - `VITE_API_BASE_URL` (frontend)

## 2) Backend local run
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Quick checks:
- `GET http://localhost:8000/health`
- `GET http://localhost:8000/api/globe`
- `POST http://localhost:8000/api/country/AGO/brief`

## 3) Frontend local run
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

## 4) MongoDB Atlas steps (manual)
- Create database `vigil`.
- Create collections:
  - `countries`
  - `index_snapshots`
  - `quarantine_log`
  - `alert_log`
- Enable Atlas Data API and generate key.
- Seed `countries` with lat/lng + base docs (you can start with a subset, then all 195).

## 5) Agentverse deployment steps (manual)
Deploy in order:
1. `agents/fact_checker_agent.py` -> copy address -> set `FACT_CHECKER_AGENT_ADDRESS`
2. `agents/alert_agent.py` -> copy address -> set `ALERT_AGENT_ADDRESS`
3. `agents/data_agent.py` (after addresses are configured)
4. `agents/query_agent.py`

For each agent:
- Paste script into Agentverse blank agent.
- Add required secrets/env vars in Agentverse.
- Run and check logs.

## 6) Production deployment steps (manual)
- Deploy backend (Railway/Render/Fly) and set backend env vars.
- Update `BACKEND_URL` in agent secrets to deployed HTTPS URL.
- Deploy frontend (Vercel/Netlify) and set `VITE_API_BASE_URL` to backend URL.

## 7) Smoke test checklist (manual)
- Backend `/api/globe` returns country list.
- Trigger/await a DataAgent cycle and confirm `countries` + `index_snapshots` writes.
- Confirm FactChecker quarantines anomalies into `quarantine_log`.
- Simulate alert webhook and confirm `alert_log` entry.
- Open frontend, click a country, verify brief appears.
- QueryAgent responds in ASI:One discovery flow.

## Notes
- ElevenLabs integration is intentionally skipped per your request.
- When Mongo API is not configured, backend uses `backend/data/mock_countries.json` for demo continuity.
