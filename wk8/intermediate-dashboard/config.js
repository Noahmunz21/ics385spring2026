/**
 * config.js - Secure Configuration Management
 * ============================================
 * Handles API key storage, validation, and retrieval.
 * In production, keys come from server-side environment variables.
 * In this browser-based demo, we use localStorage with user consent,
 * as browser JS cannot access .env files directly at runtime.
 *
 * Security measures implemented:
 * - Keys are never hardcoded in source code
 * - Keys stored only in localStorage (client-side, per-user)
 * - Validation checks for missing or empty keys on startup
 * - Fallback/error handling if keys are missing or invalid
 * - .env.example provided for environment-based deployment
 * - .gitignore excludes .env from version control
 */

class SecureConfig {
  constructor() {
    // Configuration is loaded lazily so missing keys don't crash on startup
    this._config = null;
  }

  /**
   * Lazily loads and returns the full configuration object.
   * Separates API structure from key retrieval so the app can
   * start even when keys haven't been entered yet.
   */
  get config() {
    if (!this._config) {
      this._config = this._buildConfig();
    }
    return this._config;
  }

  /**
   * Builds the configuration object.
   * Keys are retrieved from localStorage (set by the user via the settings modal).
   * baseUrl and structural properties are safe to hardcode here; only secrets use storage.
   */
  _buildConfig() {
    return {
      apis: {
        openWeather: {
          // Key retrieved from secure localStorage - never hardcoded
          key: this.getStoredKey('openweather_api_key'),
          baseUrl: 'https://api.openweathermap.org/data/2.5',
          endpoints: {
            current: '/weather',
            forecast: '/forecast'
          },
          rateLimit: {
            requests: 60,
            period: 60000 // 1 minute
          },
          timeout: 5000
        },
        rapidApi: {
          // Key retrieved from secure localStorage - never hardcoded
          key: this.getStoredKey('rapidapi_api_key'),
          host: 'matchilling-chuck-norris-jokes-v1.p.rapidapi.com',
          baseUrl: 'https://matchilling-chuck-norris-jokes-v1.p.rapidapi.com',
          endpoints: {
            random: '/jokes/random',
            categories: '/jokes/categories'
          },
          rateLimit: {
            requests: 100,
            period: 60000
          },
          timeout: 3000
        },
        jokeApi: {
          // JokeAPI requires no authentication
          baseUrl: 'https://v2.jokeapi.dev',
          endpoints: {
            joke: '/joke/Programming',
            categories: '/categories'
          },
          rateLimit: {
            requests: 120,
            period: 60000
          },
          timeout: 3000
        }
      },
      app: {
        name: 'UH Maui Campus Dashboard',
        version: '1.0.0',
        defaultCity: 'Kahului',
        refreshInterval: 10 * 60 * 1000, // 10 minutes
        cacheExpiry: 10 * 60 * 1000,     // 10 minutes
        maxRetries: 3,
        retryDelay: 1000
      },
      ui: {
        animationDuration: 300,
        toastDuration: 4000,
        modalTimeout: 10000,
        loadingDelay: 500
      }
    };
  }

  /**
   * Retrieves a stored API key from localStorage.
   * Returns null if not found (rather than throwing) so the app
   * can gracefully show the key setup modal instead of crashing.
   * @param {string} keyName - The localStorage key name
   * @returns {string|null}
   */
  getStoredKey(keyName) {
    try {
      const val = localStorage.getItem(keyName);
      return val && val.trim() !== '' ? val.trim() : null;
    } catch (e) {
      console.warn('SecureConfig: Unable to read from localStorage.', e);
      return null;
    }
  }

  /**
   * Checks which required API keys are missing.
   * JokeAPI is excluded since it needs no key.
   * @returns {string[]} Array of missing key names
   */
  getMissingKeys() {
    const required = {
      openweather_api_key: 'OpenWeatherMap',
      rapidapi_api_key: 'RapidAPI (Chuck Norris)'
    };
    return Object.entries(required)
      .filter(([key]) => !this.getStoredKey(key))
      .map(([, label]) => label);
  }

  /**
   * Returns true if all required API keys are present.
   * @returns {boolean}
   */
  hasRequiredKeys() {
    return this.getMissingKeys().length === 0;
  }

  /**
   * Saves an API key to localStorage.
   * Keys are only written via this method (never hardcoded).
   * @param {string} keyName
   * @param {string} value
   */
  saveKey(keyName, value) {
    if (!value || value.trim() === '') {
      console.warn(`SecureConfig: Attempted to save empty key for ${keyName}`);
      return;
    }
    try {
      localStorage.setItem(keyName, value.trim());
      // Invalidate cached config so it reloads with new keys
      this._config = null;
    } catch (e) {
      console.error('SecureConfig: Unable to save to localStorage.', e);
    }
  }

  /**
   * Clears all stored API keys (used by settings reset).
   */
  clearAllKeys() {
    localStorage.removeItem('openweather_api_key');
    localStorage.removeItem('rapidapi_api_key');
    this._config = null;
  }

  getApiConfig(service) {
    const cfg = this.config.apis[service];
    if (!cfg) throw new Error(`Unknown API service: ${service}`);
    return cfg;
  }

  getAppConfig() {
    return this.config.app;
  }

  getUiConfig() {
    return this.config.ui;
  }
}

// Singleton instance shared across all modules
const appConfig = new SecureConfig();
