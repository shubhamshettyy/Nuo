# Vigil MVP Frontend-Backend Integration Contract

This document is the source of truth for frontend and backend integration in the current Vigil MVP implementation.

## Base URLs

- Local backend: `http://localhost:8000`
- Production backend: `<your deployed backend URL>`

---

## API Endpoints

## `GET /health`

Health check endpoint.

### Response `200`

```json
{
  "status": "ok"
}
```

---

## `GET /api/globe`

Returns all countries for globe/list rendering.

### Response `200`

```json
{
  "updated_at": "2026-04-25T20:20:00.000000+00:00",
  "countries": [
    {
      "_id": "AGO",
      "name": "Angola",
      "lat": -11.2,
      "lng": 17.87,
      "invisible_index": 15847.3,
      "suffering_score": 7230.1,
      "attention_score": 0.456,
      "displaced_persons": 7300000,
      "conflict_events": 14,
      "article_count_filtered": 2,
      "last_updated": "2026-04-25T03:15:00Z"
    }
  ]
}
```

### Notes

- `_id` is ISO3 country code.
- `countries` can be an empty array.
- Recommended polling interval: 60 seconds.
- If MongoDB Data API is not configured, backend serves fallback mock data.

---

## `GET /api/country/{iso3}`

Returns one country profile.

### Path params

- `iso3`: string, 3-letter ISO country code, case-insensitive.

### Response `200` (found)

```json
{
  "_id": "AGO",
  "name": "Angola",
  "lat": -11.2,
  "lng": 17.87,
  "invisible_index": 15847.3,
  "suffering_score": 7230.1,
  "attention_score": 0.456,
  "displaced_persons": 7300000,
  "conflict_events": 14,
  "article_count_filtered": 2,
  "last_updated": "2026-04-25T03:15:00Z"
}
```

### Response `200` (not found in current implementation)

```json
{}
```

### Notes

- Current implementation returns `{}` instead of `404` when country is missing.

---

## `POST /api/country/{iso3}/brief`

Generates a crisis brief for a country.

### Path params

- `iso3`: string, 3-letter ISO country code.

### Request body

- None.

### Response `200`

```json
{
  "iso3": "AGO",
  "name": "Angola",
  "invisible_index": 15847.3,
  "brief_text": "Angola currently has an Invisible Index of 15847.3. ...",
  "audio_url": null
}
```

### Response `404`

```json
{
  "detail": "Country AGO not found"
}
```

### Notes

- `audio_url` is always `null` in this MVP (ElevenLabs removed).
- If `ANTHROPIC_API_KEY` is missing, backend returns fallback brief text.
- Frontend should support text-only brief rendering.

---

## `GET /api/alerts/latest`

Returns latest alert events.

### Response `200`

```json
{
  "alerts": [
    {
      "country_code": "SDN",
      "previous_score": 8200,
      "new_score": 18910,
      "delta": 10710,
      "fired_at": "2026-04-25T03:15:10Z"
    }
  ]
}
```

### Notes

- May return `{ "alerts": [] }`.
- Recommended polling interval: 30 seconds.

---

## `POST /internal/alert` (Agent/Internal only)

Used by AlertAgent webhook. Not intended for frontend use.

### Headers

- `Content-Type: application/json`
- `X-Webhook-Secret: <INTERNAL_WEBHOOK_SECRET>`

### Request body

```json
{
  "country_code": "SDN",
  "previous_score": 8000,
  "new_score": 21500,
  "delta": 13500,
  "cycle_id": "20260425-0315"
}
```

### Response `200`

```json
{
  "ok": true
}
```

### Response `401`

```json
{
  "detail": "Invalid secret"
}
```

---

## Data Types for Frontend

Use these as canonical wire contracts for coding agents and FE implementation.

```ts
type Country = {
  _id: string; // ISO3
  name?: string;
  lat?: number;
  lng?: number;
  invisible_index?: number;
  suffering_score?: number;
  attention_score?: number;
  displaced_persons?: number;
  conflict_events?: number;
  article_count_filtered?: number;
  last_updated?: string;
};

type GlobeResponse = {
  updated_at: string;
  countries: Country[];
};

type BriefResponse = {
  iso3: string;
  name: string;
  invisible_index: number;
  brief_text: string;
  audio_url: string | null; // always null in current MVP
};

type Alert = {
  country_code: string;
  previous_score: number;
  new_score: number;
  delta: number;
  fired_at: string;
};

type AlertsResponse = {
  alerts: Alert[];
};
```

---

## Frontend Behavior Contract

- Globe/list data source: `GET /api/globe`
- Country details source: selected object from `/api/globe`
- Brief trigger: call `POST /api/country/{iso3}/brief` when panel opens
- Alert banner source: `GET /api/alerts/latest`

### Error handling requirements

- If brief fetch fails: render country stats without brief text.
- If globe fetch fails: show retry/error UI state.
- If alerts fetch fails: hide banner without blocking rest of UI.

---

## Current MVP Constraints

- No ElevenLabs integration in this build (`audio_url: null`).
- No auth on public read endpoints.
- Country ISO field in payload is `_id` (not `iso3`).
- Backend may return mock data when Mongo env vars are unset.

