import httpClient from './httpClient';
import { API_ENDPOINTS } from './config';

class LessonService {
  // Tạo bài học listening
  async createListeningLesson(lessonData) {
    try {
      console.log('📤 Creating lesson:', lessonData);

      const response = await httpClient.post(API_ENDPOINTS.LISTENING_LESSONS, lessonData);

      console.log('✅ Lesson created successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create lesson:', error);
      throw error;
    }
  }

  async getCategories() {
    try {
      const response = await httpClient.get(API_ENDPOINTS.CATEGORIES);

      // ✅ FIX: Handle both formats
      if (response.data) {
        // API trả về {success: true, data: [...]}
        return response.data;
      } else if (Array.isArray(response)) {
        // API trả về [...] trực tiếp
        return response;
      } else {
        // Fallback
        return [];
      }
    } catch (error) {
      console.error('❌ Failed to load categories:', error);
      throw error;
    }
  }

  // Tạo questions cho lesson (nếu backend hỗ trợ)
  async createQuestions(lessonId, questions) {
    try {
      const questionsData = questions.map(q => ({
        lessonId: lessonId,
        lessonType: 'LISTENING',
        questionText: q.question,
        questionType: 'MULTIPLE_CHOICE',
        optionA: q.options[0],
        optionB: q.options[1],
        optionC: q.options[2],
        optionD: q.options[3],
        correctAnswer: String.fromCharCode(65 + q.correctAnswer), // 0->A, 1->B, etc
        explanation: q.explanation,
        points: 1
      }));

      // TODO: Backend cần implement POST /api/questions endpoint
      // const response = await httpClient.post('/questions', questionsData);
      console.log('📝 Questions to create:', questionsData);
      return questionsData;
    } catch (error) {
      console.error('❌ Failed to create questions:', error);
      throw error;
    }
  }

  // Preview functionality methods
  async getPreviewData(lessonId) {
    try {
      const response = await httpClient.get(`/listening-lessons/${lessonId}/preview`);
      return response;
    } catch (error) {
      console.error('❌ Failed to get preview data:', error);
      throw error;
    }
  }

  async publishLesson(lessonId) {
    try {
      const response = await httpClient.put(`/listening-lessons/${lessonId}/publish`);
      return response;
    } catch (error) {
      console.error('❌ Failed to publish lesson:', error);
      throw error;
    }
  }

  async validateLessonForPublish(lessonId) {
    try {
      const response = await httpClient.get(`/listening-lessons/${lessonId}/validation`);
      return response;
    } catch (error) {
      console.error('❌ Failed to validate lesson:', error);
      throw error;
    }
  }


  // Thêm vào services/lessonService.js

  // Lấy tất cả bài học cho admin/teacher
  async getAllLessons() {
    try {
      console.log('📤 Fetching all lessons for admin...');

      const response = await httpClient.get('/listening-lessons/admin');

      console.log('✅ Lessons fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch lessons:', error);
      throw error;
    }
  }

  // Cập nhật bài học
  async updateLesson(id, lessonData) {
    try {
      console.log('📤 Updating lesson:', id, lessonData);

      const response = await httpClient.put(`/listening-lessons/${id}`, lessonData);

      console.log('✅ Lesson updated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update lesson:', error);
      throw error;
    }
  }

  // Xóa bài học
  async deleteLesson(id) {
    try {
      console.log('📤 Deleting lesson:', id);

      const response = await httpClient.delete(`/listening-lessons/${id}`);

      console.log('✅ Lesson deleted successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to delete lesson:', error);
      throw error;
    }
  }

  // Thay đổi trạng thái bài học
  async updateLessonStatus(id, status) {
    try {
      console.log('📤 Updating lesson status:', id, status);

      const response = await httpClient.put(`/listening-lessons/${id}/status?status=${status}`);

      console.log('✅ Lesson status updated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update lesson status:', error);
      throw error;
    }
  }

  // Lấy chi tiết bài học để edit
  async getLessonForEdit(id) {
    try {
      console.log('📤 Fetching lesson for edit:', id);

      const response = await httpClient.get(`/listening-lessons/${id}`);

      console.log('✅ Lesson data fetched for edit:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch lesson for edit:', error);
      throw error;
    }
  }


}

const lessonService = new LessonService();
export default lessonService;