import httpClient from './httpClient';
import { API_ENDPOINTS } from './config';
import userService from './userService';


/**
 * Authentication Service với Real API Integration
 */
class AuthService {
  


  // File size limits
MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Allowed formats
ALLOWED_EXTENSIONS = ['mp3', 'wav', 'm4a', 'aac', 'ogg'];

// Allowed MIME types
ALLOWED_MIME_TYPES = [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 
    'audio/wave', 'audio/x-wav', 'audio/mp4', 
    'audio/aac', 'audio/ogg'
];

ERROR_MESSAGES = {
    FILE_TOO_LARGE: 'File quá lớn. Kích thước tối đa là 50MB',
    INVALID_FORMAT: 'Format không hỗ trợ. Chỉ chấp nhận MP3, WAV, M4A, AAC, OGG',
    UPLOAD_FAILED: 'Upload thất bại. Vui lòng thử lại',
    DELETE_FAILED: 'Xóa file thất bại'
};
  /**
   * Login user với API thật
   */
  async login(credentials) {
    try {
      console.log('🔐 Attempting login with API: - authService.js:37', credentials.email);
      
      const response = await httpClient.post(API_ENDPOINTS.LOGIN, credentials);
      
      if (response.success && response.data?.token) {
        // Store token
        httpClient.setAuthToken(response.data.token);
        
        // Store user data
        if (response.data.user) {
          localStorage.setItem('skillbridge_user', JSON.stringify(response.data.user));
        }
        
        console.log('✅ Login successful: - authService.js:50', response.data.user);
        
        // Return user data
        return {
          user: response.data.user,
          token: response.data.token,
          message: response.message
        };
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      console.error('❌ Login error: - authService.js:62', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      console.log('📝 Attempting registration: - authService.js:72', userData.email);
      
      const response = await httpClient.post(API_ENDPOINTS.REGISTER, userData);
      
      if (response.success) {
        console.log('✅ Registration successful: - authService.js:77', response.data);
        return {
          user: response.data,
          message: response.message
        };
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      console.error('❌ Registration error: - authService.js:86', error);
      throw error;
    }
  }

  /**
   * Get current user from token (without API call)
   */
  getCurrentUserFromToken() {
    try {
      // Try to get from httpClient first (JWT decode)
      const userFromToken = httpClient.getCurrentUser();
      if (userFromToken) {
        return userFromToken;
      }

      // Fallback to localStorage
      const userData = localStorage.getItem('skillbridge_user');
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch (parseError) {
          console.error('Error parsing user data from localStorage  getCurrentUserFromToken: - authService.js:108', parseError);
          // Xóa dữ liệu lỗi
          localStorage.removeItem('skillbridge_user');
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting user from token  getCurrentUserFromToken: - authService.js:116', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated với error handling
   */
  isAuthenticated() {
    try {
      return httpClient.isAuthenticated();
    } catch (error) {
      console.error('Error checking authentication  isAuthenticated: - authService.js:128', error);
      return false;
    }
  }

  /**
   * Safe logout method
   */
  async logout() {
    try {
      console.log('🚪 Logging out...  logout - authService.js:138');
      
      // Call logout endpoint if needed
      try {
        await httpClient.post(API_ENDPOINTS.LOGOUT);
      } catch (error) {
        console.log('⚠️ Logout API call failed, continuing with local logout  logout - authService.js:144');
      }
    } catch (error) {
      console.error('❌ Logout API error  logout: - authService.js:147', error);
      // Continue with local logout even if API fails
    } finally {
      // Always clear all storage
      this.clearAllTokens();
      
      console.log('✅ Logout completed  logout - authService.js:153');
      
      // Redirect to login
      window.location.hash = '/auth/login';
    }
  }

  /**
   * Clear all tokens and user data
   */
  clearAllTokens() {
    try {
      // Clear httpClient token
      httpClient.setAuthToken(null);
      
      // Clear all possible token keys
      const tokenKeys = [
        'token',
        'skillbridge_token', 
        'skillbridge_user',
        'skillbridge_remember_email'
      ];
      
      tokenKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      console.log('🧹 All tokens cleared  clearAllTokens - authService.js:181');
    } catch (error) {
      console.error('Error clearing tokens  clearAllTokens: - authService.js:183', error);
    }
  }

  /**
   * Debug method để kiểm tra token issues
   */
  debugTokenIssue() {
    console.log('🔍 Token Debug Info  debugTokenIssue: - authService.js:191');
    
    const debugInfo = {
      'localStorage.token': localStorage.getItem('token'),
      'localStorage.skillbridge_token': localStorage.getItem('skillbridge_token'),
      'localStorage.skillbridge_user': localStorage.getItem('skillbridge_user'),
      'httpClient.getAuthToken()': httpClient.getAuthToken(),
      'httpClient.isAuthenticated()': httpClient.isAuthenticated(),
      'getCurrentUserFromToken()': this.getCurrentUserFromToken(),
      'canAccessAdmin()': this.canAccessAdmin()
    };
    
    console.table(debugInfo);
    return debugInfo;
  }

  /**
   * Validate and clean token storage
   */
  validateAndCleanTokens() {
    try {
      const token = httpClient.getAuthToken();
      
      if (!token) {
        console.log('No token found, clearing all storage  validateAndCleanTokens - authService.js:215');
        this.clearAllTokens();
        return false;
      }

      // Kiểm tra định dạng JWT
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid JWT format detected, clearing tokens  validateAndCleanTokens - authService.js:223');
        this.clearAllTokens();
        return false;
      }

      // Kiểm tra có decode được không
      try {
        let base64 = tokenParts[1];
        while (base64.length % 4) {
          base64 += '=';
        }
        const payload = JSON.parse(atob(base64));
        
        // Kiểm tra expiration
        const currentTime = Date.now() / 1000;
        if (payload.exp && payload.exp < currentTime) {
          console.log('Token expired, clearing tokens  validateAndCleanTokens - authService.js:239');
          this.clearAllTokens();
          return false;
        }
        
        return true;
      } catch (decodeError) {
        console.error('Token decode failed, clearing tokens  validateAndCleanTokens: - authService.js:246', decodeError);
        this.clearAllTokens();
        return false;
      }
    } catch (error) {
      console.error('Error validating tokens  validateAndCleanTokens: - authService.js:251', error);
      this.clearAllTokens();
      return false;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      console.log('👤 Updating profile: - authService.js:262', profileData);
      
      // TODO: Implement backend endpoint PUT /api/users/profile
      const response = await httpClient.put(API_ENDPOINTS.PROFILE, profileData);
      
      if (response.success) {
        // Update local storage
        localStorage.setItem('skillbridge_user', JSON.stringify(response.data));
        console.log('✅ Profile updated successfully - authService.js:270');
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update profile');
    } catch (error) {
      console.error('❌ Update profile error: - authService.js:276', error);
      // For now, simulate success if endpoint doesn't exist yet
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        console.log('⚠️ Profile update endpoint not implemented yet, simulating success - authService.js:279');
        const currentUser = this.getCurrentUserFromToken();
        const updatedUser = { ...currentUser, ...profileData };
        localStorage.setItem('skillbridge_user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(passwordData) {
    try {
      console.log("Password Data: - authService.js:294", passwordData)
      const response = await httpClient.put(API_ENDPOINTS.CHANGE_PASSWORD, passwordData);

      console.log("response - authService.js:297", response)
      
      if (response.success) {
        console.log('✅ Password changed successfully - authService.js:300');
        return response.message;
      }
      
      throw new Error(response.message || 'Failed to change password');
    } catch (error) {
      console.error('❌ Change password error: - authService.js:306', error);
      throw error;
    }
  }
  
  /**
   * Upload avatar image
   */
  async uploadAvatar(file, onProgress) {
    try {
      console.log('📷 Uploading avatar - authService.js:316');
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await httpClient.uploadFile(
        API_ENDPOINTS.UPLOAD_AVATAR,
        formData,
        onProgress
      );
      
      if (response.success) {
        // Update local user data
        const updatedUser = response.data;
        localStorage.setItem('skillbridge_user', JSON.stringify(updatedUser));
        console.log('✅ Avatar uploaded successfully - authService.js:331');
        return updatedUser;
      }
      
      throw new Error(response.message || 'Failed to upload avatar');
    } catch (error) {
      console.error('❌ Upload avatar error: - authService.js:337', error);
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
      console.error('❌ Get token info error: - authService.js:355', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
  try {
    console.log('🚪 Logging out... - authService.js:365');
    
    // Call logout endpoint if needed
    try {
      await httpClient.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.log('⚠️ Logout API call failed, continuing with local logout - authService.js:371');
    }
  } catch (error) {
    console.error('❌ Logout API error: - authService.js:374', error);
    // Continue with local logout even if API fails
  } finally {
    // Always clear local storage - CẬP NHẬT ĐỂ NHẤT QUÁN
    httpClient.setAuthToken(null);
    localStorage.removeItem('skillbridge_user');
    localStorage.removeItem('skillbridge_remember_email');
    
    // THÊM: Clear cả token key cũ để đảm bảo
    localStorage.removeItem('token');
    localStorage.removeItem('skillbridge_token');
    
    console.log('✅ Logout completed - authService.js:386');
    
    // Redirect to login
    window.location.hash = '/auth/login';
  }
}

// THÊM method để debug token issues:
debugTokenIssue() {
  console.log('🔍 Token Debug Info: - authService.js:395');
  console.log('skillbridge_token: - authService.js:396', localStorage.getItem('skillbridge_token'));
  console.log('token: - authService.js:397', localStorage.getItem('token'));
  console.log('httpClient.getAuthToken(): - authService.js:398', httpClient.getAuthToken());
  console.log('getCurrentUserFromToken(): - authService.js:399', this.getCurrentUserFromToken());
  console.log('isAuthenticated(): - authService.js:400', this.isAuthenticated());
  console.log('canAccessAdmin(): - authService.js:401', this.canAccessAdmin());
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
    // Try to get from httpClient first (JWT decode)
    const userFromToken = httpClient.getCurrentUser();
    if (userFromToken) {
      return userFromToken;
    }

    // Fallback to localStorage
    try {
      const userData = localStorage.getItem('skillbridge_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage: - authService.js:426', error);
      return null;
    }
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
      return userData;
    } catch (error) {
      console.error('Failed to refresh user data: - authService.js:482', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics (for admin/teacher)
   */
  async getDashboardStats() {
    try {
      // TODO: Implement backend endpoint GET /api/admin/stats
      const response = await httpClient.get('/admin/stats');
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to get dashboard stats');
    } catch (error) {
      console.error('❌ Get dashboard stats error: - authService.js:501', error);
      // For now, return mock data if endpoint doesn't exist
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        console.log('⚠️ Dashboard stats endpoint not implemented yet, returning mock data - authService.js:504');
        return {
          totalLessons: 25,
          totalStudents: 128,
          completedLessons: 18,
          totalQuestions: 450,
          recentActivity: [],
          userGrowth: []
        };
      }
      throw error;
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const response = await httpClient.get('/auth/test');
      console.log('📡 API Connection Test: - authService.js:524', response);
      return response;
    } catch (error) {
      console.error('❌ API Connection Test Failed: - authService.js:527', error);
      throw error;
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
export { userService };