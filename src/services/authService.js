import httpClient from './httpClient';
import { API_ENDPOINTS } from './config';

/**
 * Authentication Service
 */
class AuthService {
  
  /**
   * Login user
   */
  async login(credentials) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.LOGIN, credentials);
      
      if (response.success && response.data?.token) {
        // Store token
        httpClient.setAuthToken(response.data.token);
        
        // Return user data
        return {
          user: response.data.user,
          token: response.data.token,
          message: response.message
        };
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.REGISTER, userData);
      
      if (response.success) {
        return {
          user: response.data,
          message: response.message
        };
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    try {
      const response = await httpClient.get(API_ENDPOINTS.ME);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to get user info');
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Get JWT token information
   */
  async getTokenInfo() {
    try {
      const response = await httpClient.get(API_ENDPOINTS.TOKEN_INFO);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to get token info');
    } catch (error) {
      console.error('Get token info error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Call logout endpoint if needed
      await httpClient.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      // Always clear local storage
      httpClient.setAuthToken(null);
      
      // Clear any other user data from localStorage
      localStorage.removeItem('skillbridge_user');
      
      // Redirect to login
      window.location.hash = '/auth/login';
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return httpClient.isAuthenticated();
  }

  /**
   * Get current user from token (without API call)
   */
  getCurrentUserFromToken() {
    return httpClient.getCurrentUser();
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role) {
    const user = this.getCurrentUserFromToken();
    return user?.role === role;
  }

  /**
   * Check if current user is admin
   */
  isAdmin() {
    return this.hasRole('ADMIN');
  }

  /**
   * Check if current user is teacher
   */
  isTeacher() {
    return this.hasRole('TEACHER');
  }

  /**
   * Check if current user is student
   */
  isStudent() {
    return this.hasRole('STUDENT');
  }

  /**
   * Check if user can access admin features
   */
  canAccessAdmin() {
    return this.isAdmin() || this.isTeacher();
  }

  /**
   * Get auth token
   */
  getToken() {
    return httpClient.getAuthToken();
  }

  /**
   * Refresh user data from server
   */
  async refreshUser() {
    try {
      const userData = await this.getCurrentUser();
      localStorage.setItem('skillbridge_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
