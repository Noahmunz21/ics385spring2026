/**
 * dashboard.js - Main Dashboard Controller
 * =========================================
 * Orchestrates all dashboard widgets and ties together:
 *  - CourseCatalog (local JSON data + CRUD)
 *  - UnifiedApiClient (weather + jokes)
 *  - SecureConfig (API key management)
 *
 * Responsibilities:
 *  - Initialize all components on DOMContentLoaded
 *  - Render weather, humor, course, and stats widgets
 *  - Handle auto-refresh timers (weather every 10 min)
 *  - Manage API key setup modal
 *  - Provide CRUD UI for the course catalog
 *  - Export combined dashboard data as JSON
 *  - Toast notification system for user feedback
 */

class CampusDashboard {
  constructor() {
    this.config       = appConfig;           // SecureConfig singleton
    this.apiClient    = new UnifiedApiClient(this.config);
    this.catalog      = new CourseCatalog();
    this.lastUpdated  = new Map();           // Tracks last successful update per widget
    this.refreshTimers = new Map();          // setInterval handles for cleanup
    this.editingCourseId = null;            // Tracks which course is in edit mode
  }

  // ─── Initialization ───────────────────────────────────────────────────────

  /**
   * Entry point called on DOMContentLoaded.
   * Sequentially sets up event listeners, loads data, starts auto-refresh.
   */
  async initialize() {
    console.log('[Dashboard] Initializing...');
    this._setupEventListeners();
    this._loadPreferences(); // Apply saved theme and settings immediately

    // Show API key modal if keys are missing
    if (!this.config.hasRequiredKeys()) {
      this._showApiKeyModal();
    }

    this._showLoadingState();

    try {
      // Load course catalog first (fast, local JSON)
      await this.catalog.load();
      this._renderCourseWidget();
      this._renderDepartmentFilter();
      this._updateStats();

      // Fetch weather + jokes concurrently, using saved city preference
      const savedCity = localStorage.getItem('pref_defaultCity') || this.config.getAppConfig().defaultCity;
      const { weather, jokes } = await this.apiClient.getInitialApiData(savedCity);
      this._renderWeatherWidget(weather);
      this._renderHumorWidget(jokes);
      // Update stats again now that API status is known
      this._updateStats();

    } catch (error) {
      console.error('[Dashboard] Initialization error:', error);
      this._showToast('Some dashboard data failed to load. Check console for details.', 'warning');
    } finally {
      this._hideLoadingState();
    }

    this._startAutoRefresh();
    console.log('[Dashboard] Ready.');
  }

  // ─── Event Listeners ─────────────────────────────────────────────────────

  _setupEventListeners() {
    // Header buttons - Settings opens the full settings/preferences modal
    document.getElementById('settingsBtn').addEventListener('click', () => this._showSettingsModal());
    document.getElementById('refreshAllBtn').addEventListener('click', () => this.refreshAll());

    // Course search and filter
    const searchInput = document.getElementById('courseSearch');
    const deptFilter  = document.getElementById('departmentFilter');
    if (searchInput) searchInput.addEventListener('input',  () => this._filterCourses());
    if (deptFilter)  deptFilter.addEventListener('change', () => this._filterCourses());

    // Add course form
    const addBtn = document.getElementById('addCourseBtn');
    if (addBtn) addBtn.addEventListener('click', () => this._showAddCourseForm());

    // Modal close on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', e => {
        if (e.target === modal) modal.style.display = 'none';
      });
    });
  }

  // ─── Weather Widget ───────────────────────────────────────────────────────

  /**
   * Renders the weather widget from OpenWeatherMap data.
   * Handles both valid responses and fallback (error: true) objects.
   */
  _renderWeatherWidget(data) {
    const container = document.getElementById('weather-widget');
    if (!container) return;

    const isError = data.error === true;
    const iconUrl = data.weather && data.weather[0]
      ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
      : '';
    const description = data.weather && data.weather[0] ? data.weather[0].description : 'N/A';
    const temp = data.main ? Math.round(data.main.temp) : '--';
    const humidity = data.main ? data.main.humidity : '--';
    const feelsLike = data.main ? Math.round(data.main.feels_like) : '--';
    const windSpeed = data.wind ? data.wind.speed : '--';

    container.innerHTML = `
      <div class="widget-header">
        <h3>🌤 Campus Weather</h3>
        <div class="widget-meta">
          <span class="last-updated">${this._timeAgo('weather')}</span>
          <button class="icon-btn" onclick="dashboard.refreshWeather()" title="Refresh weather">↻</button>
        </div>
      </div>
      ${isError ? `<div class="api-warning">⚠ ${data.message}</div>` : ''}
      <div class="weather-body">
        <div class="weather-primary">
          ${iconUrl ? `<img src="${iconUrl}" alt="${description}" class="weather-icon">` : '<span class="weather-icon-fallback">🌤</span>'}
          <div class="weather-temp">${temp}°F</div>
        </div>
        <div class="weather-details">
          <div class="weather-location">${data.name || 'Kahului'}, HI</div>
          <div class="weather-desc">${description}</div>
          <div class="weather-extras">
            <span>💧 ${humidity}%</span>
            <span>🌡 Feels ${feelsLike}°F</span>
            <span>💨 ${windSpeed} mph</span>
          </div>
        </div>
      </div>
    `;

    this.lastUpdated.set('weather', Date.now());
  }

  async refreshWeather() {
    this.apiClient.clearCache();
    const data = await this.apiClient.getWeather();
    this._renderWeatherWidget(data);
    this._updateStats(); // Reflect updated API status
    this._showToast('Weather updated!', 'success');
  }

  // ─── Humor Widget ─────────────────────────────────────────────────────────

  /**
   * Renders the humor widget with both a Chuck Norris fact and a programming joke.
   * Handles twopart jokes (setup + delivery) vs single jokes.
   */
  _renderHumorWidget(jokes) {
    const container = document.getElementById('humor-widget');
    if (!container) return;

    const chuckText = jokes.chuck
      ? (jokes.chuck.value || jokes.chuck.joke || 'No fact available')
      : 'Chuck Norris fact unavailable';

    let progText = 'No joke available';
    if (jokes.programming) {
      if (jokes.programming.joke) {
        progText = jokes.programming.joke;
      } else if (jokes.programming.setup && jokes.programming.delivery) {
        progText = `${jokes.programming.setup}<br><em>${jokes.programming.delivery}</em>`;
      }
    }

    const chuckError = jokes.chuck && jokes.chuck.error;
    const progError  = jokes.programming && jokes.programming.error;

    container.innerHTML = `
      <div class="widget-header">
        <h3>😄 Campus Humor</h3>
        <button class="refresh-btn" id="humorRefreshBtn" onclick="dashboard.refreshHumor()">New Jokes</button>
      </div>
      <div class="humor-body">
        <div class="joke-card ${chuckError ? 'joke-fallback' : ''}">
          <div class="joke-label">Chuck Norris Fact</div>
          <p class="joke-text">${chuckText}</p>
          ${chuckError ? '<span class="api-badge">⚠ offline</span>' : '<span class="api-badge api-badge--live">● RapidAPI</span>'}
        </div>
        <div class="joke-card ${progError ? 'joke-fallback' : ''}">
          <div class="joke-label">Programming Joke</div>
          <p class="joke-text">${progText}</p>
          ${progError ? '<span class="api-badge">⚠ offline</span>' : '<span class="api-badge api-badge--live">● JokeAPI</span>'}
        </div>
      </div>
    `;

    this.lastUpdated.set('humor', Date.now());
  }

  async refreshHumor() {
    const btn = document.getElementById('humorRefreshBtn');
    if (btn) { btn.textContent = 'Loading…'; btn.disabled = true; }

    // Clear joke caches only so weather cache is preserved
    this.apiClient.cache.delete(this.apiClient.cacheKey('rapidApi', '/jokes/random', {}));
    this.apiClient.cache.delete(this.apiClient.cacheKey('jokeApi', '/joke/Programming', { type: 'single' }));

    try {
      const jokes = await this.apiClient.getAllJokes();
      this._renderHumorWidget(jokes);
    } finally {
      if (btn) { btn.textContent = 'New Jokes'; btn.disabled = false; }
    }
  }

  // ─── Course Widget ────────────────────────────────────────────────────────

  /**
   * Renders the full course list, optionally filtered.
   * @param {Object[]|null} courses - If null, renders all courses
   */
  _renderCourseWidget(courses = null) {
    const container = document.getElementById('coursesContainer');
    if (!container) return;

    const list = courses !== null ? courses : this.catalog.getAll();

    if (list.length === 0) {
      container.innerHTML = '<p class="empty-state">No courses found.</p>';
      return;
    }

    container.innerHTML = list.map(c => {
      const pct = c.capacity ? Math.round((c.enrolled / c.capacity) * 100) : 0;
      const statusClass = pct >= 100 ? 'full' : pct >= 80 ? 'near-full' : 'open';
      return `
        <div class="course-card" data-id="${c.id}">
          <div class="course-header">
            <span class="course-id">${c.id}</span>
            <span class="course-dept">${c.departmentId}</span>
          </div>
          <h4 class="course-title">${c.title}</h4>
          <p class="course-instructor">👤 ${c.instructor}</p>
          <p class="course-schedule">📅 ${c.schedule} | 📍 ${c.room}</p>
          <p class="course-desc">${c.description}</p>
          <div class="course-footer">
            <div class="enrollment-bar-wrap">
              <div class="enrollment-bar ${statusClass}" style="width:${Math.min(pct, 100)}%"></div>
            </div>
            <span class="enrollment-label ${statusClass}">${c.enrolled}/${c.capacity} (${pct}%)</span>
          </div>
          <div class="course-actions">
            <button class="btn-sm btn-edit" onclick="dashboard.editCourse('${c.id}')">Edit</button>
            <button class="btn-sm btn-delete" onclick="dashboard.deleteCourse('${c.id}')">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }

  _renderDepartmentFilter() {
    const select = document.getElementById('departmentFilter');
    if (!select) return;
    const depts = this.catalog.getDepartments();
    select.innerHTML = `<option value="all">All Departments</option>` +
      depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  }

  _filterCourses() {
    const query = document.getElementById('courseSearch')?.value || '';
    const dept  = document.getElementById('departmentFilter')?.value || 'all';
    const results = this.catalog.search(query, dept);
    this._renderCourseWidget(results);
  }

  // ─── Course CRUD ──────────────────────────────────────────────────────────

  /** Public alias for the Quick Actions button and any inline onclick callers */
  showAddCourseForm() {
    this._showAddCourseForm();
  }

  _showAddCourseForm() {
    this.editingCourseId = null;
    document.getElementById('courseFormTitle').textContent = 'Add New Course';
    document.getElementById('courseForm').reset();
    document.getElementById('courseModal').style.display = 'flex';
  }

  editCourse(id) {
    const course = this.catalog.getById(id);
    if (!course) return;
    this.editingCourseId = id;
    document.getElementById('courseFormTitle').textContent = 'Edit Course';

    // Populate form fields
    const fields = ['id', 'title', 'credits', 'instructor', 'enrolled', 'capacity', 'schedule', 'room', 'description', 'departmentId'];
    fields.forEach(f => {
      const el = document.getElementById(`field_${f}`);
      if (el) el.value = course[f] || '';
    });

    document.getElementById('courseModal').style.display = 'flex';
  }

  saveCourse() {
    const fields = ['id', 'title', 'credits', 'instructor', 'enrolled', 'capacity', 'schedule', 'room', 'description', 'departmentId'];
    const data = {};
    fields.forEach(f => {
      const el = document.getElementById(`field_${f}`);
      if (el) data[f] = el.value;
    });

    if (!data.title || !data.id) {
      this._showToast('Course ID and Title are required.', 'error');
      return;
    }

    if (this.editingCourseId) {
      this.catalog.updateCourse(this.editingCourseId, data);
      this._showToast(`Course ${this.editingCourseId} updated.`, 'success');
    } else {
      this.catalog.addCourse(data);
      this._showToast(`Course ${data.id} added.`, 'success');
    }

    document.getElementById('courseModal').style.display = 'none';
    this._renderCourseWidget();
    this._renderDepartmentFilter();
    this._updateStats();
  }

  deleteCourse(id) {
    if (!confirm(`Delete course ${id}? This cannot be undone.`)) return;
    const removed = this.catalog.deleteCourse(id);
    if (removed) {
      this._showToast(`Course ${id} deleted.`, 'success');
      this._renderCourseWidget();
      this._updateStats();
    }
  }

  // ─── Stats ────────────────────────────────────────────────────────────────

  _updateStats() {
    const stats = this.catalog.getStats();
    const apiStatus = this.lastUpdated.has('weather') ? '● Live' : '○ Offline';

    this._setStatEl('total-courses',  stats.totalCourses);
    this._setStatEl('total-students', stats.totalEnrolled);
    this._setStatEl('avg-capacity',   `${stats.avgCapacityPct}%`);
    this._setStatEl('api-status',     apiStatus);
  }

  _setStatEl(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // ─── Auto Refresh ─────────────────────────────────────────────────────────

  _startAutoRefresh() {
    // Weather refreshes every 10 minutes
    this.refreshTimers.set('weather', setInterval(() => {
      this.refreshWeather();
    }, this.config.getAppConfig().refreshInterval));

    // Stats refresh every 60 seconds
    this.refreshTimers.set('stats', setInterval(() => {
      this._updateStats();
    }, 60 * 1000));
  }

  /** Refreshes all widgets (bound to "Refresh All" header button) */
  async refreshAll() {
    this.apiClient.clearCache();
    this._showToast('Refreshing all data…', 'info');
    const { weather, jokes } = await this.apiClient.getInitialApiData();
    this._renderWeatherWidget(weather);
    this._renderHumorWidget(jokes);
    this._updateStats();
    this._showToast('Dashboard refreshed!', 'success');
  }

  // ─── Export ───────────────────────────────────────────────────────────────

  /**
   * Exports a combined JSON snapshot of course data + API status.
   * Triggers browser download.
   */
  exportData() {
    const exportObj = {
      exportedAt: new Date().toISOString(),
      institution: this.catalog.data?.institution,
      stats: this.catalog.getStats(),
      courses: this.catalog.getAll(),
      apiStatus: {
        weather: this.lastUpdated.has('weather') ? 'connected' : 'disconnected',
        humor:   this.lastUpdated.has('humor')   ? 'connected' : 'disconnected'
      }
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `uhmaui-dashboard-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this._showToast('Data exported successfully!', 'success');
  }

  // ─── Settings Modal ───────────────────────────────────────────────────────

  _showSettingsModal() {
    // Pre-populate fields with current saved values
    const interval = localStorage.getItem('pref_refreshInterval') || '600000';
    const city     = localStorage.getItem('pref_defaultCity')      || 'Kahului';
    const theme    = localStorage.getItem('pref_theme')            || 'ocean';

    const intervalEl = document.getElementById('pref_refreshInterval');
    const cityEl     = document.getElementById('pref_defaultCity');
    const themeEl    = document.getElementById('pref_theme');

    if (intervalEl) intervalEl.value = interval;
    if (cityEl)     cityEl.value     = city;
    if (themeEl)    themeEl.value    = theme;

    document.getElementById('settingsModal').style.display = 'flex';
  }

  /**
   * Saves all user preferences from the settings modal to localStorage.
   * Also updates any API keys if new ones were entered.
   * Restarts auto-refresh timers with new interval immediately.
   */
  saveSettings() {
    // Save preferences
    const interval = document.getElementById('pref_refreshInterval')?.value;
    const city     = document.getElementById('pref_defaultCity')?.value;
    const theme    = document.getElementById('pref_theme')?.value;

    if (interval) localStorage.setItem('pref_refreshInterval', interval);
    if (city)     localStorage.setItem('pref_defaultCity',     city.trim());
    if (theme)    localStorage.setItem('pref_theme',           theme);

    // Update API keys if new ones were entered
    const owKey = document.getElementById('settings_owKey')?.value;
    const raKey = document.getElementById('settings_raKey')?.value;
    if (owKey) this.config.saveKey('openweather_api_key', owKey);
    if (raKey) this.config.saveKey('rapidapi_api_key',    raKey);

    // Apply theme immediately
    this._applyTheme(theme);

    // Restart auto-refresh with new interval (clear old timers first)
    clearInterval(this.refreshTimers.get('weather'));
    const newInterval = parseInt(interval);
    if (newInterval > 0) {
      this.refreshTimers.set('weather', setInterval(() => {
        this.refreshWeather();
      }, newInterval));
    }

    document.getElementById('settingsModal').style.display = 'none';
    this._showToast('Settings saved!', 'success');

    // If API keys changed, reload to reinitialize with new credentials
    if (owKey || raKey) {
      setTimeout(() => window.location.reload(), 1200);
    }
  }

  /**
   * Loads saved preferences from localStorage on startup and applies them.
   */
  _loadPreferences() {
    const theme = localStorage.getItem('pref_theme') || 'ocean';
    this._applyTheme(theme);
  }

  /**
   * Applies a color theme by swapping CSS variable values on :root.
   * @param {string} theme - 'ocean' | 'sunset' | 'forest'
   */
  _applyTheme(theme) {
    const root = document.documentElement;
    const themes = {
      ocean:  { '--ocean': '#0d6e75', '--ocean-mid': '#1a9aa6', '--ocean-light': '#b8e8ed', '--ocean-pale': '#e8f7f9' },
      sunset: { '--ocean': '#b5451b', '--ocean-mid': '#e07040', '--ocean-light': '#f5cdb4', '--ocean-pale': '#fdf0e8' },
      forest: { '--ocean': '#2e6b3e', '--ocean-mid': '#3d9152', '--ocean-light': '#b8dfc4', '--ocean-pale': '#eaf4ed' }
    };
    const vars = themes[theme] || themes.ocean;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }

  // ─── API Key Modal (kept for first-run setup) ─────────────────────────────

  _showApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    if (modal) modal.style.display = 'flex';
  }

  saveApiKeys() {
    const owKey  = document.getElementById('openWeatherKey')?.value;
    const raKey  = document.getElementById('rapidApiKey')?.value;

    if (owKey)  this.config.saveKey('openweather_api_key', owKey);
    if (raKey)  this.config.saveKey('rapidapi_api_key',    raKey);

    document.getElementById('apiKeyModal').style.display = 'none';
    this._showToast('API keys saved. Refreshing data…', 'success');

    // Reload with fresh keys
    setTimeout(() => window.location.reload(), 1200);
  }

  clearApiKeys() {
    if (!confirm('Clear all stored API keys?')) return;
    this.config.clearAllKeys();
    this._showToast('API keys cleared. Reloading…', 'info');
    setTimeout(() => window.location.reload(), 1200);
  }

  // ─── UI Helpers ───────────────────────────────────────────────────────────

  _showLoadingState() {
    document.getElementById('loadingOverlay')?.classList.remove('hidden');
  }

  _hideLoadingState() {
    document.getElementById('loadingOverlay')?.classList.add('hidden');
  }

  /**
   * Shows a brief toast notification.
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} type
   */
  _showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => toast.classList.add('toast--visible'));

    // Safe fallback in case config isn't initialised yet
    const duration = this.config?.getUiConfig?.()?.toastDuration ?? 4000;

    // Auto-dismiss
    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  _timeAgo(service) {
    if (!this.lastUpdated.has(service)) return 'Not yet loaded';
    const mins = Math.floor((Date.now() - this.lastUpdated.get(service)) / 60000);
    return mins === 0 ? 'Just now' : `${mins} min ago`;
  }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new CampusDashboard();
  window.dashboard.initialize();
});
