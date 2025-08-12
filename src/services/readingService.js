// Tạo file services/readingService.js
import httpClient from './httpClient';
import { API_ENDPOINTS } from './config';

class ReadingService {
  // Tạo bài đọc mới
  async createReadingLesson(lessonData) {
    try {
      console.log('📤 Creating reading lesson:', lessonData);
      
      const response = await httpClient.post(API_ENDPOINTS.READING_LESSONS, lessonData);
      
      console.log('✅ Reading lesson created successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create reading lesson:', error);
      throw error;
    }
  }

  // Lấy tất cả bài đọc cho admin/teacher
  async getAllReadingLessons() {
    try {
      console.log('📤 Fetching all reading lessons for admin...');
      
      const response = await httpClient.get(API_ENDPOINTS.READING_LESSONS_ADMIN);
      
      console.log('✅ Reading lessons fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch reading lessons:', error);
      throw error;
    }
  }

  // Lấy bài published
  async getPublishedReadingLessons() {
    try {
      const response = await httpClient.get(API_ENDPOINTS.READING_LESSONS);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch published reading lessons:', error);
      throw error;
    }
  }

  // Lấy chi tiết bài đọc
  async getReadingLessonById(id) {
    try {
      const response = await httpClient.get(API_ENDPOINTS.READING_LESSON_BY_ID(id));
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch reading lesson:', error);
      throw error;
    }
  }

  // Cập nhật bài đọc
  async updateReadingLesson(id, lessonData) {
    try {
      console.log('📤 Updating reading lesson:', id, lessonData);
      
      const response = await httpClient.put(API_ENDPOINTS.READING_LESSON_BY_ID(id), lessonData);
      
      console.log('✅ Reading lesson updated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update reading lesson:', error);
      throw error;
    }
  }

  // Xóa bài đọc
  async deleteReadingLesson(id) {
    try {
      console.log('📤 Deleting reading lesson:', id);
      
      const response = await httpClient.delete(API_ENDPOINTS.READING_LESSON_BY_ID(id));
      
      console.log('✅ Reading lesson deleted successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to delete reading lesson:', error);
      throw error;
    }
  }

  // Thay đổi trạng thái
  async updateReadingLessonStatus(id, status) {
    try {
      console.log('📤 Updating reading lesson status:', id, status);
      
      const response = await httpClient.put(`${API_ENDPOINTS.READING_LESSON_STATUS(id)}?status=${status}`);
      
      console.log('✅ Reading lesson status updated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update reading lesson status:', error);
      throw error;
    }
  }

  // Upload text file
  async uploadTextFile(file) {
    try {
      console.log('📤 Uploading text file:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await httpClient.post(API_ENDPOINTS.UPLOAD_TEXT_FILE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ Text file uploaded successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to upload text file:', error);
      throw error;
    }
  }

  // Tính số từ (client-side utility)
  calculateWordCount(text) {
    if (!text || text.trim() === '') return 0;
    
    // Remove HTML tags
    const plainText = text.replace(/<[^>]+>/g, '');
    
    // Split by whitespace and count words
    const words = plainText.trim().split(/\s+/);
    return words.filter(word => word.length > 0).length;
  }

  // Get categories (reuse from lessonService)
  async getCategories() {
    try {
      const response = await httpClient.get(API_ENDPOINTS.CATEGORIES);
      
      if (response.data) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        return [];
      }
    } catch (error) {
      console.error('❌ Failed to load categories:', error);
      throw error;
    }
  }
}

const readingService = new ReadingService();
export default readingService;