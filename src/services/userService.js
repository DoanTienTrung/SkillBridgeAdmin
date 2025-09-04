import httpClient from './httpClient';
import { API_ENDPOINTS } from './config';

/**
 * User Management Service cho Admin & Student
 */
class UserService {
  
  /**
   * Lấy tất cả users với filter theo role
   */
  async getAllUsers(role = null) {
  try {
    console.log('🔄 userService.getAllUsers  Role: - userService.js:14', role);
    
    // Nếu role là STUDENT, dùng endpoint chuyên dụng
    if (role === 'STUDENT') {
      console.log('🔄 Using dedicated students endpoint /users/students - userService.js:18');
      return await this.getAllStudents();
    }
    
    // Cho các role khác, dùng endpoint general
    const params = role ? { role } : {};
    const response = await httpClient.get('/users', params);
    
    console.log('✅ userService.getAllUsers  Raw response: - userService.js:26', response);
    
    // Xử lý response
    if (response && Array.isArray(response)) {
      console.log('✅ userService.getAllUsers  Success, count: - userService.js:30', response.length);
      return response;
    }
    
    // Nếu response có format legacy
    if (response && response.success && Array.isArray(response.data)) {
      console.log('✅ userService.getAllUsers  Legacy format, count: - userService.js:36', response.data.length);
      return response.data;
    }
    
    console.warn('⚠️ userService.getAllUsers  Unexpected response format: - userService.js:40', response);
    return [];
    
  } catch (error) {
    console.error('❌ userService.getAllUsers  Error: - userService.js:44', error);
    
    // Nếu là STUDENT role và lỗi, thử fallback
    if (role === 'STUDENT') {
      console.log('🔄 Fallback: trying general endpoint for students - userService.js:48');
      try {
        const params = { role: 'STUDENT' };
        const fallbackResponse = await httpClient.get('/users', params);
        
        if (fallbackResponse && Array.isArray(fallbackResponse)) {
          return fallbackResponse;
        }
        if (fallbackResponse && fallbackResponse.success && Array.isArray(fallbackResponse.data)) {
          return fallbackResponse.data;
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed: - userService.js:60', fallbackError);
      }
    }
    
    throw error;
  }
}

// Cũng cập nhật method getAllStudents:
async getAllStudents() {
  try {
    console.log('🔄 userService.getAllStudents  Using /users/students endpoint - userService.js:71');
    
    const response = await httpClient.get('/users/students');
    
    console.log('✅ userService.getAllStudents  Raw response: - userService.js:75', response);
    
    // Xử lý response theo format của backend
    if (response && response.success && Array.isArray(response.data)) {
      console.log('✅ userService.getAllStudents  Success, count: - userService.js:79', response.data.length);
      return response.data;
    }
    
    // Nếu response trả về trực tiếp array (không wrap)
    if (response && Array.isArray(response)) {
      console.log('✅ userService.getAllStudents  Direct array, count: - userService.js:85', response.length);
      return response;
    }
    
    console.warn('⚠️ userService.getAllStudents  Unexpected response: - userService.js:89', response);
    return [];
    
  } catch (error) {
    console.error('❌ userService.getAllStudents  Error: - userService.js:93', error);
    console.error('❌ Error details: - userService.js:94', {
      message: error.message,
      response: error.response,
      status: error.response?.status
    });
    
    // Không fallback ở đây, để caller xử lý
    throw error;
  }
}

  /**
   * Lấy user theo ID
   */
  async getUserById(id) {
    try {
      const response = await httpClient.get(`/users/${id}`);
      
      // Handle both direct data and wrapped response
      if (response && response.id) {
        return response;
      }
      
      if (response && response.success && response.data) {
        return response.data;
      }
      
      throw new Error('User not found or invalid response');
    } catch (error) {
      console.error('Error getting user by ID: - userService.js:123', error);
      throw error;
    }
  }

  

  /**
   * Tạo user mới
   */
  async createUser(userData) {
    try {
      const response = await httpClient.post('/users', userData);
      
      if (response && response.id) {
        return response;
      }
      
      if (response && response.success) {
        return response.data || response;
      }
      
      throw new Error('Failed to create user');
    } catch (error) {
      console.error('Error creating user: - userService.js:147', error);
      throw error;
    }
  }

  /**
   * Cập nhật user
   */
  async updateUser(id, userData) {
    try {
      const response = await httpClient.put(`/users/${id}`, userData);
      
      if (response && response.id) {
        return response;
      }
      
      if (response && response.success) {
        return response.data || response;
      }
      
      throw new Error('Failed to update user');
    } catch (error) {
      console.error('Error updating user: - userService.js:169', error);
      throw error;
    }
  }

  /**
   * Xóa user
   */
  async deleteUser(id) {
    try {
      const response = await httpClient.delete(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting user: - userService.js:182', error);
      throw error;
    }
  }

  /**
   * Toggle user active status - Fixed for both endpoints
   */
  async toggleUserStatus(id) {
    try {
      // Try the correct backend endpoint first
      let response;
      try {
        response = await httpClient.put(`/users/${id}/toggle-active`);
      } catch (error) {
        // Fallback to alternative endpoint
        console.log('Trying alternative endpoint... - userService.js:198');
        response = await httpClient.put(`/users/users/${id}/toggle-status`);
      }
      
      return response;
    } catch (error) {
      console.error('Error toggling user status: - userService.js:204', error);
      throw error;
    }
  }

  /**
   * Reset user password - Fixed for both endpoints  
   */
  async resetPassword(id) {
    try {
      let response;
      try {
        response = await httpClient.post(`/users/${id}/reset-password`);
      } catch (error) {
        // Try alternative endpoint
        response = await httpClient.post(`/users/users/${id}/reset-password`);
      }
      
      return response;
    } catch (error) {
      console.error('Error resetting password: - userService.js:224', error);
      throw error;
    }
  }

  /**
   * Lấy user stats cho dashboard
   */
  async getUserStats() {
    try {
      const response = await httpClient.get('/users/stats');
      
      // Handle direct response or wrapped response
      const data = response.data || response;
      
      return {
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0,
        studentsCount: data.studentsCount || 0,
        teachersCount: data.teachersCount || 0,
        adminsCount: data.adminsCount || 0
      };
    } catch (error) {
      console.error('Error getting user stats: - userService.js:247', error);
      // Return default stats if API fails
      return {
        totalUsers: 0,
        activeUsers: 0,
        studentsCount: 0,
        teachersCount: 0,
        adminsCount: 0
      };
    }
  }

  // ================= STUDENT-SPECIFIC METHODS =================

  /**
   * Lấy thống kê học tập của student (Student only)
   */
  async getStudentStats() {
    try {
      console.log('📤 Fetching student stats... - userService.js:266');
      const response = await httpClient.get(API_ENDPOINTS.STUDENT_STATS);
      
      console.log('✅ Student stats fetched successfully: - userService.js:269', response);
      return response;
    } catch (error) {
      console.error('❌ Error getting student stats: - userService.js:272', error);
      throw error;
    }
  }

  /**
   * Lấy tiến độ học tập chi tiết của student (Student only)
   */
  async getStudentProgress(timeRange = 'week') {
    try {
      console.log('📤 Fetching student progress... - userService.js:282');
      const response = await httpClient.get(`${API_ENDPOINTS.STUDENT_PROGRESS}?timeRange=${timeRange}`);
      
      console.log('✅ Student progress fetched successfully: - userService.js:285', response);
      return response;
    } catch (error) {
      console.error('❌ Error getting student progress: - userService.js:288', error);
      throw error;
    }
  }

  /**
   * Lấy bài học gần đây của student (Student only)
   */
  async getRecentLessons(limit = 5) {
    try {
      console.log('📤 Fetching recent lessons... - userService.js:298');
      const response = await httpClient.get(`${API_ENDPOINTS.STUDENT_RECENT_LESSONS}?limit=${limit}`);
      
      console.log('✅ Recent lessons fetched successfully: - userService.js:301', response);
      return response;
    } catch (error) {
      console.error('❌ Error getting recent lessons: - userService.js:304', error);
      throw error;
    }
  }

  /**
   * Lấy profile user hiện tại
   */
  async getProfile() {
    try {
      const response = await httpClient.get(API_ENDPOINTS.PROFILE);
      return response.data || response;
    } catch (error) {
      console.error('Error getting profile: - userService.js:317', error);
      throw error;
    }
  }

  /**
   * Cập nhật profile
   */
  async updateProfile(profileData) {
    try {
      const response = await httpClient.put(API_ENDPOINTS.PROFILE, profileData);
      return response.data || response;
    } catch (error) {
      console.error('Error updating profile: - userService.js:330', error);
      throw error;
    }
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(passwordData) {
    try {
      const response = await httpClient.put(API_ENDPOINTS.CHANGE_PASSWORD, passwordData);
      return response.data || response;
    } catch (error) {
      console.error('Error changing password: - userService.js:343', error);
      throw error;
    }
  }

  /**
   * Cập nhật avatar
   */
  async updateAvatar(avatarUrl) {
    try {
      const response = await httpClient.put(`${API_ENDPOINTS.UPDATE_AVATAR}?avatarUrl=${encodeURIComponent(avatarUrl)}`);
      return response.data || response;
    } catch (error) {
      console.error('Error updating avatar: - userService.js:356', error);
      throw error;
    }
  }

  // ================= SEARCH AND UTILITY METHODS =================

  /**
   * Tìm kiếm user
   */
  async searchUsers(query, role = null) {
    try {
      const params = { search: query };
      if (role) params.role = role;
      
      const response = await httpClient.get('/users/search', params);
      return response.data || response;
    } catch (error) {
      console.error('Error searching users: - userService.js:374', error);
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdateStatus(userIds, status) {
    try {
      const response = await httpClient.post('/users/bulk-status', {
        userIds,
        status
      });
      return response.data || response;
    } catch (error) {
      console.error('Error bulk updating status: - userService.js:390', error);
      throw error;
    }
  }

  async bulkDelete(userIds) {
    try {
      const response = await httpClient.post('/users/bulk-delete', {
        userIds
      });
      return response.data || response;
    } catch (error) {
      console.error('Error bulk deleting users: - userService.js:402', error);
      throw error;
    }
  }

  /**
   * Export users data
   */
  async exportUsers(role = null, format = 'csv') {
    try {
      const params = { format };
      if (role) params.role = role;
      
      const response = await httpClient.get('/users/export', params);
      return response.data || response;
    } catch (error) {
      console.error('Error exporting users: - userService.js:418', error);
      throw error;
    }
  }

  /**
   * Debug method to test API endpoints
   */
  async testApiEndpoints() {
    const results = {
      endpoints: {},
      auth: {},
      errors: []
    };

    try {
      // Test authentication
      const token = localStorage.getItem('token');
      results.auth.hasToken = !!token;
      results.auth.tokenLength = token ? token.length : 0;

      // Test /users endpoint
      try {
        console.log('🧪 Testing /users endpoint... - userService.js:441');
        const usersResponse = await httpClient.get('/users');
        results.endpoints['/users'] = {
          success: true,
          dataType: Array.isArray(usersResponse) ? 'array' : typeof usersResponse,
          count: Array.isArray(usersResponse) ? usersResponse.length : 0
        };
      } catch (error) {
        results.endpoints['/users'] = {
          success: false,
          error: error.message,
          status: error.response?.status
        };
        results.errors.push(`/users: ${error.message}`);
      }

      // Test /users/students endpoint
      try {
        console.log('🧪 Testing /users/students endpoint... - userService.js:459');
        const studentsResponse = await httpClient.get('/users/students');
        results.endpoints['/users/students'] = {
          success: true,
          dataType: Array.isArray(studentsResponse) ? 'array' : typeof studentsResponse,
          count: Array.isArray(studentsResponse) ? studentsResponse.length : 0
        };
      } catch (error) {
        results.endpoints['/users/students'] = {
          success: false,
          error: error.message,
          status: error.response?.status
        };
        results.errors.push(`/users/students: ${error.message}`);
      }

      // Test /users?role=STUDENT endpoint
      try {
        console.log('🧪 Testing /users?role=STUDENT endpoint... - userService.js:477');
        const roleResponse = await httpClient.get('/users', { role: 'STUDENT' });
        results.endpoints['/users?role=STUDENT'] = {
          success: true,
          dataType: Array.isArray(roleResponse) ? 'array' : typeof roleResponse,
          count: Array.isArray(roleResponse) ? roleResponse.length : 0
        };
      } catch (error) {
        results.endpoints['/users?role=STUDENT'] = {
          success: false,
          error: error.message,
          status: error.response?.status
        };
        results.errors.push(`/users?role=STUDENT: ${error.message}`);
      }

    } catch (error) {
      results.errors.push(`General error: ${error.message}`);
    }

    console.log('🧪 API Test Results: - userService.js:497', results);
    return results;
  }
}

// Create singleton instance
const userService = new UserService();

export default userService;