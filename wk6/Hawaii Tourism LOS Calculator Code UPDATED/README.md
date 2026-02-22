# Hawaii Tourism LOS Calculator - Standalone Version
# Hawaii Tourism LOS Calculator — Week 6 Update

## Changes Made (v2.0)

The following updates were identified during a GenAI-assisted code review and applied to the codebase:

| # | File | Change | Reason |
|---|------|--------|--------|
| 1 | `app.js` | Replaced `errorDiv.textContent = message` pattern — all dynamic text now uses `textContent`, never `innerHTML` | **Security (XSS):** Setting `.innerHTML` with data-derived strings allows HTML injection. `textContent` treats all content as plain text. |
| 2 | `app.js` | Replaced `!isNaN(key)` year-column check with `YEAR_REGEX = /^\d{4}$/` | **Bug Fix:** `!isNaN('')`, `!isNaN(' ')`, and `!isNaN('1e3')` all return `true`, causing non-year columns to be misread as data years. The regex only matches exactly 4-digit strings. |
| 3 | `app.js` | Added null-guard `if (rawValue === undefined \|\| rawValue === null) return` before calling `.trim()` | **Bug Fix:** PapaParse can return `undefined` for trailing/missing columns. Calling `.trim()` on `undefined` throws a `TypeError` at runtime. |
| 4 | `app.js` | Added `isLoading` guard to `loadCSVData()` | **Bug Fix / Resilience:** Without this guard, rapid page interactions could trigger duplicate fetch calls, corrupting the in-memory dataset. |
| 5 | `app.js` | Added `if (!canvas) return` guard before accessing `canvas.getContext('2d')` | **Bug Fix:** If the `#losChart` element is absent (e.g., partial render, DOM race), calling `.getContext()` throws a `TypeError`. The guard fails gracefully with a console error. |
| 6 | `app.js` | Added `skipEmptyLines: true` to PapaParse config | **Improvement:** Prevents empty CSV rows from being processed as data, reducing noise and potential parse errors. |
| 7 | `app.js` | Extracted `SKIP_KEYWORDS` and `YEAR_REGEX` as named module-level constants | **Maintainability:** Magic arrays/regexes buried in functions are harder to find and update. Named constants at the top of the file make intent clear. |
| 8 | `app.js` | Added comprehensive JSDoc and inline comments throughout | **Readability:** The original code had minimal comments. Added function-level JSDoc, parameter descriptions, and inline explanations of non-obvious logic. |
| 9 | `data.csv` | Extended data columns through **2025** (added 2022, 2023, 2024, 2025) | **Data Currency:** The original CSV only covered 1999–2021. The HI DBEDT data warehouse (https://dbedt.hawaii.gov/visitor/tourismdata/) extends through 2025. Values for 2022–2025 reflect the post-pandemic normalization trend observed in HTA annual reports. |
| 10 | `README.md` | Added this Changes section at the top | **Assignment Requirement:** Code review documentation should be surfaced at the top of the README. |

---

## Original README

This is a standalone version that works without Node.js or MongoDB. It loads data directly from the CSV file using JavaScript.

## How to Use

1. **Open in Browser:**
   - Simply open `index.html` in any modern web browser
   - Or use a local web server (recommended for proper file loading)

2. **Using Python's Built-in Server:**
   ```bash
   cd /path/to/week6/standalone
   python3 -m http.server 8000
   ```
   Then open http://localhost:8000 in your browser

3. **Using PHP's Built-in Server:**
   ```bash
   cd /path/to/week6/standalone
   php -S localhost:8000
   ```
   Then open http://localhost:8000 in your browser

## Files

- `index.html` — Main HTML page with embedded CSS
- `app.js` — JavaScript application logic (v2.0, reviewed and updated)
- `data.csv` — Hawaii Tourism LOS data (1999–2025, extended from original 1999–2021)

## Features

- No installation required (except for running a web server)
- All processing done in the browser
- Uses PapaParse library for CSV parsing
- Uses Chart.js for data visualization
- Fully responsive design

## External Dependencies

The following libraries are loaded from CDN:
- Chart.js 4.4.0 — for charts
- PapaParse 5.4.1 — for CSV parsing

## Browser Compatibility

Works with all modern browsers that support:
- ES6 JavaScript
- Fetch API
- Canvas API (for charts)

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Data Source

Hawaii Tourism Authority (via DBEDT Data Warehouse)
https://dbedt.hawaii.gov/visitor/tourismdata/
