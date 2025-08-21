import httpClient from './httpClient';

/**
 * User Management Service cho Admin
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
      console.error('Error getting users:', error);
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
      console.error('Error getting user by ID:', error);
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
      console.error('Error getting students:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin user
   */
  async updateUser(id, userData) {
    try {
      const response = await httpClient.put(`/users/${id}`, userData);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update user');
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Cập nhật profile hiện tại
   */
  async updateProfile(profileData) {
    try {
      const response = await httpClient.put('/users/profile', profileData);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Toggle trạng thái active/inactive của user
   */
  async toggleUserStatus(id) {
    try {
      const response = await httpClient.put(`/users/${id}/toggle-active`);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to toggle user status');
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }

  /**
   * Reset password của user
   */
  async resetPassword(id) {
    try {
      const response = await httpClient.post(`/users/${id}/reset-password`);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to reset password');
    } catch (error) {
      console.error('Error resetting password:', error);
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
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Tạo user mới (cho admin)
   */
  async createUser(userData) {
    try {
      const response = await httpClient.post('/users', userData);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to create user');
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê user cho dashboard
   */
  async getUserStats() {
    try {
      const response = await httpClient.get('/users/stats');
      
      if (response.success) {
        return response.data;
      }
      
      return {
        totalUsers: 0,
        activeUsers: 0,
        studentsCount: 0,
        teachersCount: 0,
        adminsCount: 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
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
      console.error('Error searching users:', error);
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
      console.error('Error bulk updating status:', error);
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
      console.error('Error bulk deleting users:', error);
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
      console.error('Error exporting users:', error);
      throw error;
    }
  }
}

// Create singleton instance
const userService = new UserService();

export default userService;
