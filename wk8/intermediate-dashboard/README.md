# UH Maui College – Integrated Campus Dashboard

**ICS 385 | Week 8 Intermediate Assignment**  
Multi-API Dashboard with Secure Credential Management

---

## Overview

A responsive campus dashboard that combines local JSON course data with three live external APIs:

| Feature | Source | Auth |
|---|---|---|
| Campus Weather | OpenWeatherMap API | API Key (query param) |
| Chuck Norris Facts | Chuck Norris API via RapidAPI | API Key + Host headers |
| Programming Jokes | JokeAPI (sv443.net) | None required |
| Course Catalog | Local `sample-data.json` | None |

---

## Quick Start

### 1. Clone / Download

```bash
git clone <your-repo-url>
cd week8/intermediate-dashboard
```

### 2. Get API Keys

**OpenWeatherMap** (free tier — 60 calls/min):
1. Sign up at https://openweathermap.org/api
2. Go to *API keys* in your account dashboard
3. Copy your default key (or create a new one)
4. Keys activate within 10 minutes of creation

**RapidAPI / Chuck Norris Jokes** (free tier — 100 calls/min):
1. Sign up at https://rapidapi.com
2. Search for "Chuck Norris Jokes" by matchilling
3. Subscribe on the free "Basic" plan
4. Copy your X-RapidAPI-Key from the API page

**JokeAPI** — No signup needed. Test endpoint:
```
https://v2.jokeapi.dev/joke/Programming?type=single
```

### 3. Configure Environment Variables (Server Deployment)

```bash
cp .env.example .env
# Edit .env and fill in your real keys
```

`.env` is listed in `.gitignore` and will never be committed.

### 4. Configure API Keys (Browser / Local Dev)

Since this is a client-side app, keys are entered via the in-app **Settings** modal and stored in `localStorage` (per-user, per-browser):

1. Open `index.html` in a browser (or run a local server: `python3 -m http.server 8080`)
2. The **API Configuration** modal opens automatically if keys are missing
3. Paste your OpenWeatherMap and RapidAPI keys
4. Click **Save & Reload**

---

## Project Structure

```
week8/intermediate-dashboard/
├── index.html           # Main dashboard layout and modals
├── styles.css           # Responsive CSS (mobile-first, CSS variables)
├── config.js            # SecureConfig class — key storage and validation
├── api-client.js        # UnifiedApiClient — caching, rate limiting, fallbacks
├── course-catalog.js    # CourseCatalog — CRUD operations on local JSON
├── dashboard.js         # CampusDashboard — main controller and rendering
├── sample-data.json     # Course catalog data (4 departments, 10+ courses)
├── .env.example         # Template for server-side environment variables
├── .gitignore           # Excludes .env and node_modules from Git
└── README.md            # This file
```

---

## Features

### Multi-API Integration
- **OpenWeatherMap**: Current conditions for Kahului (temperature, humidity, wind, weather icon)
- **Chuck Norris API** (RapidAPI): Random Chuck Norris facts with RapidAPI key + host headers
- **JokeAPI**: Single-line programming jokes, no authentication required

### Course Management (CRUD)
- View all courses across 4 departments
- Search by course ID, title, instructor, or description
- Filter by department
- Add new courses via a modal form
- Edit existing courses in-place
- Delete courses with confirmation
- Export full dashboard data as JSON

### Security Implementation
- API keys never hardcoded in source files
- Browser: keys stored in `localStorage` (user-specific, never transmitted)
- Server: keys stored in `.env` (excluded from version control via `.gitignore`)
- `.env.example` documents all required variables without exposing values
- Settings modal shows security notice explaining the client vs. server distinction

### Error Handling & Fallbacks
Every API has a fallback object returned on failure so the dashboard always renders:
- Weather fallback: last-known Kahului conditions with a ⚠ warning banner
- Chuck Norris fallback: a hardcoded fact with "⚠ offline" badge
- JokeAPI fallback: a hardcoded joke with "⚠ offline" badge

### Caching Strategy
- All API responses cached in-memory (`Map`) with a 10-minute TTL
- Cache key format: `service:endpoint:params`
- Cache is cleared on manual refresh or settings change
- Console logs indicate cache hits vs. live fetches

### Rate Limiting
- Per-service sliding-window rate limiter
- OpenWeatherMap: 60 req/min, RapidAPI: 100 req/min, JokeAPI: 120 req/min
- Requests that would exceed the limit fall back to cached/fallback data

### Performance
- `Promise.allSettled()` fetches weather + jokes concurrently on load
- `AbortController` timeouts prevent hung requests (5s weather, 3s jokes)
- Weather auto-refreshes every 10 minutes via `setInterval`

### Responsive Design
- CSS Grid layout adapts: 4-column desktop → 2-column tablet → 1-column mobile
- Course cards reflow with `auto-fill` grid
- Tested at 1400px, 1024px, 640px breakpoints

---

## API Setup Details

### OpenWeatherMap Authentication
```javascript
// Key passed as query parameter
const url = `https://api.openweathermap.org/data/2.5/weather?q=Kahului,US&appid=${API_KEY}&units=imperial`;
```

### RapidAPI Authentication
```javascript
// Key and host sent as request headers
headers['X-RapidAPI-Key']  = RAPIDAPI_KEY;
headers['X-RapidAPI-Host'] = 'matchilling-chuck-norris-jokes-v1.p.rapidapi.com';
```

### JokeAPI (No Auth)
```javascript
// Public endpoint — no headers needed
const url = 'https://v2.jokeapi.dev/joke/Programming?type=single';
```

---

## Security Checklist

- [x] No API keys hardcoded in any `.js` or `.html` file
- [x] `.env` excluded from version control via `.gitignore`
- [x] `.env.example` checked in as a safe template
- [x] Browser keys stored in `localStorage` only (not cookies, not URL params)
- [x] In-app notice explains localStorage security tradeoffs
- [x] `SecureConfig.clearAllKeys()` available to wipe stored keys
- [x] Keys never logged to console or included in error messages
- [x] HTTPS endpoints used for all API calls

---

## Testing Documentation

### Manual Test Cases

| Test | How to Test | Expected Result |
|---|---|---|
| Valid weather | Enter valid OpenWeatherMap key, load dashboard | Kahului weather renders with icon |
| Invalid weather key | Enter wrong key | ⚠ fallback weather card shown |
| Missing weather key | Skip key setup | ⚠ fallback weather card shown |
| Valid Chuck Norris | Enter valid RapidAPI key | Live fact renders with "● RapidAPI" badge |
| Invalid RapidAPI key | Enter wrong key | Fallback fact with "⚠ offline" badge |
| JokeAPI (always on) | Load dashboard | Programming joke renders with "● JokeAPI" badge |
| Add course | Click "+ Add Course", fill form, save | New card appears in courses grid |
| Edit course | Click "Edit" on any card, change title, save | Card updates immediately |
| Delete course | Click "Delete", confirm | Card removed, stats update |
| Search | Type "ICS" in search box | Only ICS courses shown |
| Dept filter | Select "Mathematics" | Only MATH courses shown |
| Export | Click "📥 Export JSON" | JSON file downloads with all courses + API status |
| Responsive | Resize browser to 375px wide | Layout reflows to single column |
| Cache | Refresh weather, check console | "Cache hit" logged on second request within 10 min |
| Rate limit | See `_checkRateLimit()` in api-client.js | Sliding window enforced per service |

### Network Testing
Open DevTools → Network tab:
- Confirm API keys do NOT appear in request URLs (only as headers for RapidAPI)
- Confirm OpenWeatherMap key appears only in query string (expected for this API's auth model)
- Confirm no keys appear in response bodies or console logs

---

## Known Limitations

- This is a fully client-side app; `.env` files are for server deployments only
- `localStorage` is not encrypted; do not store production keys in a shared browser
- OpenWeatherMap free tier activates within 10 minutes of key creation
- JokeAPI may occasionally return two-part (setup/delivery) jokes; both formats are handled

---

## Credits

- Course: ICS 385 – Web Development and Administration, UH Maui College
- APIs: OpenWeatherMap, JokeAPI by sv443, Chuck Norris Jokes API via RapidAPI
- Fonts: DM Sans + DM Mono via Google Fonts
