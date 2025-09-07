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
  return localStorage.getItem('token');
}

  /**
   * Set auth token to localStorage
   */
  setAuthToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
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
      console.log(`[HTTP] ${config.method || 'GET'} ${url} - httpClient.js:80`);
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`[HTTP Error] ${config.method || 'GET'} ${url}: - httpClient.js:84`, error);
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
   * Upload file với progress tracking
   * Sử dụng XMLHttpRequest thay vì fetch để có progress events
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - FormData object chứa file
   * @param {Function} onProgress - Callback cho progress (0-100)
   * @param {Object} customHeaders - Custom headers
   * @returns {Promise} Upload result
   */
  async uploadFile(endpoint, formData, onProgress = null, customHeaders = {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `${this.baseURL}${endpoint}`;

      // Setup progress tracking
      if (onProgress && typeof onProgress === 'function') {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }

      // Handle response
      xhr.addEventListener('load', async () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || `HTTP ${xhr.status}`));
          }
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'));
      });

      // Setup request
      xhr.open('POST', url);
      
      // Set headers (don't set Content-Type for FormData)
      const token = this.getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      // Apply custom headers
      Object.keys(customHeaders).forEach(key => {
        if (key !== 'Content-Type') { // Let browser set Content-Type for FormData
          xhr.setRequestHeader(key, customHeaders[key]);
        }
      });

      // Set timeout (30 seconds)
      xhr.timeout = 30000;

      // Send request
      console.log(`[HTTP Upload] POST ${url} - httpClient.js:198`);
      xhr.send(formData);
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
   * POST request với multipart/form-data (cho file uploads)
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - FormData object
   * @param {Object} options - Additional options
   * @returns {Promise} Response data
   */
  async postMultipart(endpoint, formData, options = {}) {
    const customHeaders = { ...options.headers };
    // Don't set Content-Type, let browser handle it for FormData
    delete customHeaders['Content-Type'];
    
    return this.request(endpoint, {
      method: 'POST',
      headers: customHeaders,
      body: formData
    });
  }

  /**
   * Get current user info from token
   */
  getCurrentUser() {
    const token = this.getAuthToken();
    if (!token) {
      console.log('No token found  getCurrentUser - httpClient.js:238');
      return null;
    }
    
    try {
      // Kiểm tra định dạng JWT (phải có 3 phần ngăn cách bởi '.')
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid JWT format  getCurrentUser - httpClient.js:246');
        this.setAuthToken(null); // Xóa token lỗi
        return null;
      }

      // Decode payload (phần thứ 2 của JWT)
      let payload;
      try {
        // Chuẩn hóa base64 string
        let base64 = tokenParts[1];
        // Thêm padding nếu cần
        while (base64.length % 4) {
          base64 += '=';
        }
        
        payload = JSON.parse(atob(base64));
      } catch (decodeError) {
        console.error('Base64 decode error  getCurrentUser: - httpClient.js:263', decodeError);
        this.setAuthToken(null); // Xóa token lỗi
        return null;
      }

      // Kiểm tra token có hết hạn không
      const currentTime = Date.now() / 1000;
      if (payload.exp && payload.exp < currentTime) {
        console.log('Token expired  getCurrentUser - httpClient.js:271');
        this.setAuthToken(null); // Xóa token hết hạn
        return null;
      }

      return {
        id: payload.userId,
        email: payload.sub,
        role: payload.role,
        fullName: payload.fullName,
        isActive: payload.isActive
      };
    } catch (error) {
      console.error('Error decoding token  getCurrentUser: - httpClient.js:284', error);
      // Xóa token lỗi và chuyển về login
      this.setAuthToken(null);
      
      // Chỉ redirect nếu không phải đang ở trang login
      if (!window.location.hash.includes('/auth/login')) {
        window.location.hash = '/auth/login';
      }
      
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getAuthToken();
    if (!token) return false;
    
    try {
      // Kiểm tra định dạng JWT
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid JWT format  isAuthenticated - httpClient.js:308');
        this.setAuthToken(null);
        return false;
      }

      // Decode và kiểm tra expiry
      let base64 = tokenParts[1];
      while (base64.length % 4) {
        base64 += '=';
      }
      
      const payload = JSON.parse(atob(base64));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('Token expired  isAuthenticated - httpClient.js:323');
        this.setAuthToken(null);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation error  isAuthenticated: - httpClient.js:330', error);
      this.setAuthToken(null);
      return false;
    }
  }
}

// Create singleton instance
const httpClient = new HttpClient();

export default httpClient;
