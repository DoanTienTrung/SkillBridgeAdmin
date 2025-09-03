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
      const params = role ? { role } : {};
      const response = await httpClient.get('/users', params);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to get users');
    } catch (error) {
      console.error('Error getting users: - userService.js:23', error);
      throw error;
    }
  }

  /**
   * Lấy user theo ID
   */
  async getUserById(id) {
    try {
      const response = await httpClient.get(`/users/${id}`);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to get user');
    } catch (error) {
      console.error('Error getting user by ID: - userService.js:41', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách students (cho teacher/admin)
   */
  async getAllStudents() {
    try {
      const response = await httpClient.get('/users/students');
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to get students');
    } catch (error) {
      console.error('Error getting students: - userService.js:59', error);
      throw error;
    }
  }

  /**
   * Tạo user mới
   */
  async createUser(userData) {
    try {
      const response = await httpClient.post('/users', userData);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to create user');
    } catch (error) {
      console.error('Error creating user: - userService.js:77', error);
      throw error;
    }
  }

  /**
   * Cập nhật user
   */
  async updateUser(id, userData) {
    try {
      const response = await httpClient.put(`/users/${id}`, userData);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update user');
    } catch (error) {
      console.error('Error updating user: - userService.js:95', error);
      throw error;
    }
  }

  /**
   * Xóa user
   */
  async deleteUser(id) {
    try {
      const response = await httpClient.delete(`/users/${id}`);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to delete user');
    } catch (error) {
      console.error('Error deleting user: - userService.js:113', error);
      throw error;
    }
  }

  /**
   * Toggle user active status
   */
  async toggleUserActive(id) {
    try {
      const response = await httpClient.put(`/users/${id}/toggle-active`);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to toggle user status');
    } catch (error) {
      console.error('Error toggling user status: - userService.js:131', error);
      throw error;
    }
  }

  /**
   * Reset user password
   */
  async resetPassword(id) {
    try {
      const response = await httpClient.post(`/users/${id}/reset-password`);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to reset password');
    } catch (error) {
      console.error('Error resetting password: - userService.js:149', error);
      throw error;
    }
  }

  /**
   * Lấy user stats cho dashboard
   */
  async getUserStats() {
    try {
      const response = await httpClient.get('/users/stats');
      
      if (response.success) {
        return {
          totalUsers: response.data.totalUsers || 0,
          activeUsers: response.data.activeUsers || 0,
          studentsCount: response.data.studentsCount || 0,
          teachersCount: response.data.teachersCount || 0,
          adminsCount: response.data.adminsCount || 0
        };
      }
      
      throw new Error(response.message || 'Failed to get user stats');
    } catch (error) {
      console.error('Error getting user stats: - userService.js:173', error);
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
      console.log('📤 Fetching student stats... - userService.js:192');
      const response = await httpClient.get(API_ENDPOINTS.STUDENT_STATS);
      
      if (response.success) {
        console.log('✅ Student stats fetched successfully: - userService.js:196', response);
        return response;
      }
      
      throw new Error(response.message || 'Failed to get student stats');
    } catch (error) {
      console.error('❌ Error getting student stats: - userService.js:202', error);
      throw error;
    }
  }

  /**
   * Lấy tiến độ học tập chi tiết của student (Student only)
   */
  async getStudentProgress(timeRange = 'week') {
    try {
      console.log('📤 Fetching student progress... - userService.js:212');
      const response = await httpClient.get(`${API_ENDPOINTS.STUDENT_PROGRESS}?timeRange=${timeRange}`);
      
      if (response.success) {
        console.log('✅ Student progress fetched successfully: - userService.js:216', response);
        return response;
      }
      
      throw new Error(response.message || 'Failed to get student progress');
    } catch (error) {
      console.error('❌ Error getting student progress: - userService.js:222', error);
      throw error;
    }
  }

  /**
   * Lấy bài học gần đây của student (Student only)
   */
  async getRecentLessons(limit = 5) {
    try {
      console.log('📤 Fetching recent lessons... - userService.js:232');
      const response = await httpClient.get(`${API_ENDPOINTS.STUDENT_RECENT_LESSONS}?limit=${limit}`);
      
      if (response.success) {
        console.log('✅ Recent lessons fetched successfully: - userService.js:236', response);
        return response;
      }
      
      throw new Error(response.message || 'Failed to get recent lessons');
    } catch (error) {
      console.error('❌ Error getting recent lessons: - userService.js:242', error);
      throw error;
    }
  }

  /**
   * Lấy profile user hiện tại
   */
  async getProfile() {
    try {
      const response = await httpClient.get(API_ENDPOINTS.PROFILE);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to get profile');
    } catch (error) {
      console.error('Error getting profile: - userService.js:260', error);
      throw error;
    }
  }

  /**
   * Cập nhật profile
   */
  async updateProfile(profileData) {
    try {
      const response = await httpClient.put(API_ENDPOINTS.PROFILE, profileData);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update profile');
    } catch (error) {
      console.error('Error updating profile: - userService.js:278', error);
      throw error;
    }
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(passwordData) {
    try {
      const response = await httpClient.put(API_ENDPOINTS.CHANGE_PASSWORD, passwordData);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to change password');
    } catch (error) {
      console.error('Error changing password: - userService.js:296', error);
      throw error;
    }
  }

  /**
   * Cập nhật avatar
   */
  async updateAvatar(avatarUrl) {
    try {
      const response = await httpClient.put(`${API_ENDPOINTS.UPDATE_AVATAR}?avatarUrl=${encodeURIComponent(avatarUrl)}`);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update avatar');
    } catch (error) {
      console.error('Error updating avatar: - userService.js:314', error);
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
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to search users');
    } catch (error) {
      console.error('Error searching users: - userService.js:337', error);
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
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to bulk update status');
    } catch (error) {
      console.error('Error bulk updating status: - userService.js:358', error);
      throw error;
    }
  }

  async bulkDelete(userIds) {
    try {
      const response = await httpClient.post('/users/bulk-delete', {
        userIds
      });
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to bulk delete users');
    } catch (error) {
      console.error('Error bulk deleting users: - userService.js:375', error);
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
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to export users');
    } catch (error) {
      console.error('Error exporting users: - userService.js:396', error);
      throw error;
    }
  }
}

// Create singleton instance
const userService = new UserService();

export default userService;