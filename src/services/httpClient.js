import API_BASE_URL, { HTTP_STATUS } from './config';

/**
 * HTTP Client for API requests with JWT support
 */
class HttpClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Get auth token from localStorage
   */
  getAuthToken() {
    return localStorage.getItem('skillbridge_token');
  }

  /**
   * Set auth token to localStorage
   */
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('skillbridge_token', token);
    } else {
      localStorage.removeItem('skillbridge_token');
    }
  }

  /**
   * Get headers with auth token if available
   */
  getHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getAuthToken();
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      // Handle authentication errors
      if (response.status === HTTP_STATUS.UNAUTHORIZED) {
        this.setAuthToken(null); // Clear invalid token
        // Redirect to login if not already there
        if (!window.location.hash.includes('/auth/login')) {
          window.location.hash = '/auth/login';
        }
      }
      
      throw new Error(data.message || data.error || 'An error occurred');
    }
    
    return data;
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.headers),
      ...options
    };

    try {
      console.log(`[HTTP] ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`[HTTP Error] ${config.method || 'GET'} ${url}:`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data = null) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = null) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data = null) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getAuthToken();
    if (!token) return false;
    
    try {
      // Simple token expiry check (decode JWT payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Invalid token format:', error);
      this.setAuthToken(null);
      return false;
    }
  }

  /**
   * Get current user info from token
   */
  getCurrentUser() {
    const token = this.getAuthToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId,
        email: payload.sub,
        role: payload.role,
        fullName: payload.fullName,
        isActive: payload.isActive
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}

// Create singleton instance
const httpClient = new HttpClient();

export default httpClient;
