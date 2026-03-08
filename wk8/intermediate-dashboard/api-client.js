/**
 * api-client.js - Unified API Client
 * ====================================
 * Provides a single interface for all external API calls.
 * Features:
 *  - In-memory caching with configurable TTL to minimize redundant requests
 *  - Rate limiting to respect each API's request caps
 *  - AbortController-based timeouts so slow APIs don't hang the UI
 *  - Per-service fallback data so the dashboard degrades gracefully
 *  - Promise.allSettled for concurrent requests (no single failure kills all)
 */

class UnifiedApiClient {
  /**
   * @param {SecureConfig} config - The app-wide SecureConfig singleton
   */
  constructor(config) {
    this.config = config;

    // Cache stores { data, timestamp } keyed by "service:endpoint:params"
    this.cache = new Map();

    // Rate limiter stores arrays of recent request timestamps per service
    this.rateLimiters = new Map();

    this._initRateLimiters();
  }

  /**
   * Initialises rate limiter buckets for each configured API.
   * Each bucket tracks the timestamps of recent requests so we can
   * enforce the per-service requests/period limits from config.
   */
  _initRateLimiters() {
    const apis = this.config.config.apis;
    Object.keys(apis).forEach(service => {
      this.rateLimiters.set(service, {
        requests: [],
        limit: apis[service].rateLimit.requests,
        period: apis[service].rateLimit.period
      });
    });
  }

  // ─── Core Request Method ─────────────────────────────────────────────────

  /**
   * Makes an API request with caching, rate limiting, and timeout.
   * On failure, returns service-specific fallback data instead of throwing,
   * so the dashboard can always render something meaningful.
   *
   * @param {string} service   - Key in config.apis (e.g. 'openWeather')
   * @param {string} endpoint  - Path appended to the service's baseUrl
   * @param {Object} params    - Query params or body params
   * @param {Object} options   - Extra fetch options (headers, etc.)
   * @returns {Promise<Object>} API response data or fallback data
   */
  async makeRequest(service, endpoint, params = {}, options = {}) {
    // --- Rate limit check ---
    if (!this._checkRateLimit(service)) {
      console.warn(`[ApiClient] Rate limit reached for ${service}, using fallback.`);
      return this._getFallback(service);
    }

    // --- Cache check ---
    const cacheKey = this._cacheKey(service, endpoint, params);
    if (this._isCacheValid(cacheKey)) {
      console.log(`[ApiClient] Cache hit: ${cacheKey}`);
      return this.cache.get(cacheKey).data;
    }

    // --- Build and execute request ---
    try {
      const { url, fetchOptions } = this._buildRequest(service, endpoint, params, options);

      // Timeout via AbortController - prevents hung requests from blocking UI
      const controller = new AbortController();
      const timeoutMs = this.config.config.apis[service].timeout;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`${service} responded ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Store successful response in cache
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      // Record request for rate limiting
      this.rateLimiters.get(service).requests.push(Date.now());

      console.log(`[ApiClient] Success: ${service} ${endpoint}`);
      return data;

    } catch (error) {
      // Log full error context for debugging
      console.error('[ApiClient] Request failed:', {
        service,
        endpoint,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      return this._getFallback(service, error);
    }
  }

  // ─── Request Builder ─────────────────────────────────────────────────────

  /**
   * Constructs the fetch URL and headers for each supported service.
   * Each API uses a different authentication pattern:
   *  - openWeather: appid query param
   *  - rapidApi:    X-RapidAPI-Key + X-RapidAPI-Host headers
   *  - jokeApi:     No auth, params added as query string
   */
  _buildRequest(service, endpoint, params, options) {
    const apiConfig = this.config.config.apis[service];
    let url = apiConfig.baseUrl + endpoint;
    const headers = { 'Content-Type': 'application/json', ...options.headers };

    switch (service) {
      case 'openWeather': {
        // OpenWeatherMap: API key passed as query param 'appid'
        const qp = new URLSearchParams({
          ...params,
          appid: apiConfig.key,
          units: 'imperial' // °F for Hawaii
        });
        url += '?' + qp.toString();
        break;
      }

      case 'rapidApi': {
        // RapidAPI: credentials sent as request headers (not in URL)
        headers['X-RapidAPI-Key'] = apiConfig.key;
        headers['X-RapidAPI-Host'] = apiConfig.host;
        if (Object.keys(params).length > 0) {
          url += '?' + new URLSearchParams(params).toString();
        }
        break;
      }

      case 'jokeApi': {
        // JokeAPI: public API, params just added to query string
        if (Object.keys(params).length > 0) {
          url += '?' + new URLSearchParams(params).toString();
        }
        break;
      }

      default:
        throw new Error(`Unknown service: ${service}`);
    }

    return { url, fetchOptions: { method: 'GET', headers } };
  }

  // ─── Rate Limiting ────────────────────────────────────────────────────────

  /**
   * Slides the request window: removes requests older than `period`,
   * then checks if we're under the limit.
   */
  _checkRateLimit(service) {
    const limiter = this.rateLimiters.get(service);
    if (!limiter) return true;
    const now = Date.now();
    // Purge expired timestamps
    limiter.requests = limiter.requests.filter(t => now - t < limiter.period);
    return limiter.requests.length < limiter.limit;
  }

  // ─── Cache Helpers ────────────────────────────────────────────────────────

  cacheKey(service, endpoint, params) {
    return `${service}:${endpoint}:${JSON.stringify(params)}`;
  }

  // Keep private alias for internal use
  _cacheKey(service, endpoint, params) {
    return this.cacheKey(service, endpoint, params);
  }

  _isCacheValid(key) {
    if (!this.cache.has(key)) return false;
    const { timestamp } = this.cache.get(key);
    return Date.now() - timestamp < this.config.config.app.cacheExpiry;
  }

  /** Clears all cached responses (useful after settings change or manual refresh) */
  clearCache() {
    this.cache.clear();
    console.log('[ApiClient] Cache cleared.');
  }

  // ─── Fallback Data ────────────────────────────────────────────────────────

  /**
   * Returns graceful fallback objects when an API is unavailable.
   * The `error: true` flag lets the UI show a subtle warning without
   * breaking the dashboard layout.
   */
  _getFallback(service, error) {
    const reason = error ? error.message : 'Service temporarily unavailable';
    switch (service) {
      case 'openWeather':
        return {
          name: 'Kahului',
          main: { temp: 78, humidity: 65, feels_like: 80 },
          weather: [{ description: 'partly cloudy', icon: '02d', main: 'Clouds' }],
          wind: { speed: 12 },
          visibility: 10000,
          error: true,
          message: 'Weather data temporarily unavailable. Showing last known conditions.',
          errorDetail: reason
        };

      case 'rapidApi':
        return {
          value: "Chuck Norris can unit test entire applications with a single assert.",
          error: true,
          message: 'Chuck Norris API temporarily unavailable.',
          errorDetail: reason
        };

      case 'jokeApi':
        return {
          joke: "Why do Java developers wear glasses? Because they can't C#.",
          type: 'single',
          error: true,
          message: 'JokeAPI temporarily unavailable.',
          errorDetail: reason
        };

      default:
        return { error: true, message: reason };
    }
  }

  // ─── Convenience API Methods ──────────────────────────────────────────────

  /**
   * Fetches current weather for a city.
   * @param {string} city - City name (defaults to Kahului)
   */
  async getWeather(city = 'Kahului') {
    return this.makeRequest('openWeather', '/weather', { q: `${city},US` });
  }

  /**
   * Fetches a random Chuck Norris fact from RapidAPI.
   * Requires a valid rapidapi_api_key in config.
   */
  async getChuckNorrisJoke() {
    if (!this.config.config.apis.rapidApi.key) {
      console.warn('[ApiClient] RapidAPI key missing, using fallback.');
      return this._getFallback('rapidApi');
    }
    return this.makeRequest('rapidApi', '/jokes/random');
  }

  /**
   * Fetches a single programming joke from JokeAPI.
   * JokeAPI is public - no key required.
   */
  async getProgrammingJoke() {
    return this.makeRequest('jokeApi', '/joke/Programming', { type: 'single' });
  }

  /**
   * Fetches both joke types concurrently using Promise.allSettled.
   * allSettled (vs Promise.all) ensures one failure doesn't cancel the other.
   * @returns {{ chuck: Object|null, programming: Object|null }}
   */
  async getAllJokes() {
    const [chuck, programming] = await Promise.allSettled([
      this.getChuckNorrisJoke(),
      this.getProgrammingJoke()
    ]);

    return {
      chuck:       chuck.status === 'fulfilled'       ? chuck.value       : this._getFallback('rapidApi'),
      programming: programming.status === 'fulfilled' ? programming.value : this._getFallback('jokeApi')
    };
  }

  /**
   * Fetches weather and jokes concurrently - used on dashboard init
   * to minimise total load time.
   */
  async getInitialApiData(city = 'Kahului') {
    const [weather, jokes] = await Promise.allSettled([
      this.getWeather(city),
      this.getAllJokes()
    ]);

    return {
      weather: weather.status === 'fulfilled' ? weather.value : this._getFallback('openWeather'),
      jokes:   jokes.status === 'fulfilled'   ? jokes.value   : { chuck: null, programming: null }
    };
  }
}
