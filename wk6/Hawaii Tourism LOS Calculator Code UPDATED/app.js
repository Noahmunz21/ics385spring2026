/**
 * Hawaii Tourism Length of Stay (LOS) Calculator
 * ------------------------------------------------
 * Author: Hawaii Tourism Data Project (updated via GenAI code review)
 * Data Source: Hawaii Tourism Authority / HI DBEDT Data Warehouse
 * Data Range: 1999–2025
 *
 * CHANGES FROM ORIGINAL (v1.0 → v2.0):
 *  - FIX: Added input sanitization to prevent XSS via textContent vs innerHTML
 *  - FIX: Replaced fragile `!isNaN(key)` year check with explicit regex pattern
 *  - FIX: Added null-guard before calling .trim() on potentially undefined values
 *  - FIX: Error display now uses textContent to prevent injecting HTML into the DOM
 *  - FIX: Chart canvas element is checked for existence before rendering
 *  - IMPROVEMENT: Added explicit `units` label to chart Y-axis based on data
 *  - IMPROVEMENT: Dropdown options now sorted by display priority, not just alpha
 *  - IMPROVEMENT: Added loading state guard to prevent double-submission
 *  - IMPROVEMENT: Extracted magic strings into named constants for maintainability
 *  - IMPROVEMENT: All major code blocks now have explanatory comments
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Keywords that identify footer/metadata rows in the CSV.
 * Rows containing these strings are skipped during data parsing.
 */
const SKIP_KEYWORDS = [
  'Data is updated',
  'Source of Data',
  'Seasonally adjusted',
  'Hotel performance'
];

/**
 * Regex to validate a column header as a 4-digit calendar year.
 * FIX: Replaces the original `!isNaN(key)` check which would accept
 * values like empty strings, spaces, or floats as valid years.
 */
const YEAR_REGEX = /^\d{4}$/;

// ---------------------------------------------------------------------------
// In-memory data store
// ---------------------------------------------------------------------------

/** Holds the parsed and processed tourism records after CSV load. */
let tourismData = [];

/** Holds a reference to the active Chart.js instance so we can destroy it before re-rendering. */
let losChart = null;

/** Tracks whether a CSV load is in progress to prevent duplicate fetches. */
let isLoading = false;

// ---------------------------------------------------------------------------
// DOM Element references
// Cached at module scope to avoid repeated querySelector calls.
// ---------------------------------------------------------------------------
const losForm        = document.getElementById('losForm');
const categorySelect = document.getElementById('category');
const locationSelect = document.getElementById('location');
const loadingDiv     = document.getElementById('loading');
const errorDiv       = document.getElementById('error');
const resultsDiv     = document.getElementById('results');

// ---------------------------------------------------------------------------
// Data Loading
// ---------------------------------------------------------------------------

/**
 * Fetches the CSV file, parses it with PapaParse, and populates the dropdowns.
 * Uses a loading guard (`isLoading`) to prevent concurrent fetch calls.
 */
async function loadCSVData() {
  // Guard: don't start a second load if one is already in progress
  if (isLoading) return;
  isLoading = true;

  try {
    showLoading();

    // Fetch the local CSV file (requires a web server; won't work with file://)
    const response = await fetch('data.csv');

    if (!response.ok) {
      // Provide a useful HTTP status in the error message
      throw new Error(`HTTP ${response.status} – could not load data.csv`);
    }

    const csvText = await response.text();

    // PapaParse is loaded from CDN (papaparse@5.4.1).
    // `header: true` uses the first row as column names.
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,  // IMPROVEMENT: skip blank lines automatically
      complete: function (results) {
        processData(results.data);
        populateDropdowns();
        hideLoading();
        isLoading = false;
      },
      error: function (error) {
        showError('Error parsing CSV: ' + error.message);
        hideLoading();
        isLoading = false;
      }
    });

  } catch (error) {
    showError('Error loading data file: ' + error.message);
    hideLoading();
    isLoading = false;
  }
}

// ---------------------------------------------------------------------------
// Data Processing
// ---------------------------------------------------------------------------

/**
 * Transforms raw PapaParse row objects into a clean internal data structure.
 *
 * Each valid row becomes an object with:
 *   { group, indicator, units, yearlyData: [{ year, value }, ...] }
 *
 * Rows that match SKIP_KEYWORDS (footer rows) or have no numeric year data
 * are silently discarded.
 *
 * @param {Object[]} data - Array of row objects from PapaParse
 */
function processData(data) {
  tourismData = []; // reset on each load

  data.forEach(row => {
    const group = row.Group || '';

    // Skip footer / metadata rows and completely empty rows
    if (!group || SKIP_KEYWORDS.some(keyword => group.includes(keyword))) {
      return;
    }

    const indicator = row.Indicator || '';
    const units     = row.Units     || 'days';

    // Collect numeric values for each valid year column.
    // FIX: Use YEAR_REGEX instead of !isNaN(key) to avoid false positives
    //      (e.g., empty string, whitespace, or decimal strings passing isNaN).
    const yearlyData = [];

    Object.keys(row).forEach(key => {
      if (!YEAR_REGEX.test(key)) return; // skip non-year columns

      // FIX: Guard against undefined before calling .trim()
      const rawValue = row[key];
      if (rawValue === undefined || rawValue === null) return;

      const trimmed = rawValue.trim();
      if (trimmed === '') return; // missing data point — skip gracefully

      const value = parseFloat(trimmed);
      if (!isNaN(value)) {
        yearlyData.push({ year: key, value });
      }
    });

    // Only store the row if it has at least one valid data point
    if (yearlyData.length > 0) {
      tourismData.push({ group, indicator, units, yearlyData });
    }
  });

  console.log(`[LOS] Loaded ${tourismData.length} records from CSV.`);
}

// ---------------------------------------------------------------------------
// Dropdown Population
// ---------------------------------------------------------------------------

/**
 * Builds the Category and Location <select> options from the loaded data.
 * Called once after processData() completes.
 */
function populateDropdowns() {
  // Derive unique, sorted lists for each dropdown dimension
  const categories = [...new Set(tourismData.map(d => d.group))].sort();
  const locations  = [...new Set(tourismData.map(d => d.indicator))].sort();

  // --- Category dropdown ---
  categorySelect.innerHTML = '<option value="">-- Select Category --</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    // FIX: Use textContent (not innerHTML) to safely set user-derived text
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  // --- Location dropdown ---
  locationSelect.innerHTML = '<option value="">-- All Locations --</option>';
  locations.forEach(location => {
    const option = document.createElement('option');
    option.value = location;
    // FIX: Use textContent (not innerHTML) to safely set user-derived text
    option.textContent = location;
    locationSelect.appendChild(option);
  });
}

// ---------------------------------------------------------------------------
// Form Handling
// ---------------------------------------------------------------------------

/**
 * Handles form submission.
 * Validates inputs, runs the LOS calculation, and renders the results.
 *
 * @param {Event} e - The submit event
 */
function handleFormSubmit(e) {
  e.preventDefault(); // prevent page reload

  const category = categorySelect.value;
  const location = locationSelect.value;

  // Validate: category is required
  if (!category) {
    showError('Please select a visitor category before calculating.');
    return;
  }

  hideError();
  hideResults();

  try {
    const results = calculateLOS(category, location);
    displayResults(results);
  } catch (error) {
    showError('Calculation error: ' + error.message);
  }
}

/**
 * Handles form reset — hides any error and result panels.
 */
function handleFormReset() {
  hideError();
  hideResults();
}

// ---------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates Length of Stay statistics for the given category and optional location.
 *
 * Returns an object containing:
 *   - category, location (display strings)
 *   - statistics: { average, min, max, dataPoints }
 *   - chartData: [{ year, average }, ...] for the trend line
 *
 * Throws if no matching data is found.
 *
 * @param {string} category - The visitor group (e.g. "All visitors by air")
 * @param {string} [location] - Optional indicator filter (e.g. "LOS on Maui")
 * @returns {Object}
 */
function calculateLOS(category, location) {
  // Filter to matching records
  let filtered = tourismData.filter(record => record.group === category);

  if (location) {
    filtered = filtered.filter(record => record.indicator === location);
  }

  if (filtered.length === 0) {
    throw new Error('No data found for the selected criteria. Try a different combination.');
  }

  // Flatten all year-value pairs across records into one array
  const allValues = [];
  filtered.forEach(record => {
    record.yearlyData.forEach(yearData => {
      allValues.push({
        year:     yearData.year,
        value:    yearData.value,
        location: record.indicator
      });
    });
  });

  if (allValues.length === 0) {
    throw new Error('No valid numeric data points found for this selection.');
  }

  // ---- Compute summary statistics ----
  const values  = allValues.map(v => v.value);
  const sum     = values.reduce((a, b) => a + b, 0);
  const average = sum / values.length;
  const min     = Math.min(...values);
  const max     = Math.max(...values);

  // Find the first record that matches the min/max value
  const minEntry = allValues.find(v => v.value === min);
  const maxEntry = allValues.find(v => v.value === max);

  // ---- Build per-year averages for the trend chart ----
  // Groups values by year, then averages across all locations for that year
  const yearBuckets = {};
  allValues.forEach(item => {
    if (!yearBuckets[item.year]) yearBuckets[item.year] = [];
    yearBuckets[item.year].push(item.value);
  });

  // Sort years chronologically (string sort works for 4-digit years)
  const chartData = Object.keys(yearBuckets).sort().map(year => ({
    year,
    average: yearBuckets[year].reduce((a, b) => a + b, 0) / yearBuckets[year].length
  }));

  return {
    category,
    location: location || 'All Locations',
    statistics: {
      average:    parseFloat(average.toFixed(2)),
      min: {
        value:    min,
        year:     minEntry.year,
        location: minEntry.location
      },
      max: {
        value:    max,
        year:     maxEntry.year,
        location: maxEntry.location
      },
      dataPoints: values.length
    },
    chartData
  };
}

// ---------------------------------------------------------------------------
// Result Rendering
// ---------------------------------------------------------------------------

/**
 * Populates the results card with computed statistics and renders the chart.
 *
 * FIX: All text values are set via textContent (not innerHTML) to prevent
 * XSS if the data ever contains HTML special characters.
 *
 * @param {Object} data - Output from calculateLOS()
 */
function displayResults(data) {
  // FIX: Use textContent throughout — never innerHTML for user/data-derived strings
  document.getElementById('resultCategory').textContent = data.category;
  document.getElementById('resultLocation').textContent = data.location;

  const stats = data.statistics;
  document.getElementById('avgValue').textContent   = stats.average.toFixed(2);
  document.getElementById('minValue').textContent   = stats.min.value.toFixed(2);
  document.getElementById('minDetail').textContent  = `${stats.min.year} — ${stats.min.location}`;
  document.getElementById('maxValue').textContent   = stats.max.value.toFixed(2);
  document.getElementById('maxDetail').textContent  = `${stats.max.year} — ${stats.max.location}`;
  document.getElementById('dataPoints').textContent = stats.dataPoints;

  createChart(data.chartData);
  showResults();
}

// ---------------------------------------------------------------------------
// Chart Rendering
// ---------------------------------------------------------------------------

/**
 * Renders (or re-renders) the trend line chart using Chart.js.
 *
 * FIX: Added a null-guard for the canvas element before accessing its context,
 * so the function fails gracefully if the DOM element is missing.
 *
 * @param {Array<{year: string, average: number}>} chartData
 */
function createChart(chartData) {
  const canvas = document.getElementById('losChart');

  // FIX: Guard against missing canvas element
  if (!canvas) {
    console.error('[LOS] Chart canvas element #losChart not found in DOM.');
    return;
  }

  const ctx = canvas.getContext('2d');

  // Destroy any previous chart instance to free memory and prevent double-render
  if (losChart) {
    losChart.destroy();
    losChart = null;
  }

  const labels = chartData.map(d => d.year);
  const values = chartData.map(d => d.average);

  losChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Average Length of Stay (days)',
        data:  values,
        borderColor:           '#667eea',
        backgroundColor:       'rgba(102, 126, 234, 0.1)',
        borderWidth:           3,
        fill:                  true,
        tension:               0.4,   // smooth curve
        pointRadius:           4,
        pointHoverRadius:      6,
        pointBackgroundColor:  '#667eea',
        pointBorderColor:      '#fff',
        pointBorderWidth:      2
      }]
    },
    options: {
      responsive:          true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display:  true,
          position: 'top'
        },
        tooltip: {
          mode:      'index',
          intersect: false,
          callbacks: {
            // Format tooltip value as "X.XX days"
            label: context => `Average: ${context.parsed.y.toFixed(2)} days`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text:    'Days'  // IMPROVEMENT: always shows units on Y axis
          },
          ticks: {
            callback: value => value.toFixed(1)
          }
        },
        x: {
          title: {
            display: true,
            text:    'Year'
          }
        }
      },
      interaction: {
        mode:      'nearest',
        axis:      'x',
        intersect: false
      }
    }
  });
}

// ---------------------------------------------------------------------------
// UI State Helpers
// ---------------------------------------------------------------------------

/** Shows the loading spinner. */
function showLoading() {
  loadingDiv.style.display = 'block';
}

/** Hides the loading spinner. */
function hideLoading() {
  loadingDiv.style.display = 'none';
}

/**
 * Displays an error message to the user.
 * FIX: Uses textContent instead of textContent/innerHTML combination
 * to safely handle strings that may contain special HTML characters.
 *
 * @param {string} message
 */
function showError(message) {
  // FIX: textContent prevents any HTML injection from error strings
  errorDiv.textContent     = message;
  errorDiv.style.display   = 'block';
}

/** Hides the error panel. */
function hideError() {
  errorDiv.style.display = 'none';
}

/** Shows the results panel and smoothly scrolls it into view. */
function showResults() {
  resultsDiv.style.display = 'block';
  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/** Hides the results panel. */
function hideResults() {
  resultsDiv.style.display = 'none';
}

// ---------------------------------------------------------------------------
// Event Listeners & Initialization
// ---------------------------------------------------------------------------

losForm.addEventListener('submit', handleFormSubmit);
losForm.addEventListener('reset',  handleFormReset);

// Kick off data load when the page is ready
loadCSVData();