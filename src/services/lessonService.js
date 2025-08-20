import httpClient from './httpClient';
import { API_ENDPOINTS } from './config';

class LessonService {
  // ================= ADMIN LESSON MANAGEMENT =================
  
  /**
   * Tạo bài học listening mới
   */
  async createListeningLesson(lessonData) {
    try {
      console.log('📤 Creating listening lesson:', lessonData);
      const response = await httpClient.post(API_ENDPOINTS.LISTENING_LESSONS, lessonData);
      console.log('✅ Listening lesson created successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create listening lesson:', error);
      throw error;
    }
  }

  /**
   * Tạo bài học reading mới
   */
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

  /**
   * Lấy danh sách bài học cho admin
   * @param {string} type - 'reading' hoặc 'listening'
   */
  async getLessonsAdmin(type) {
    try {
      const endpoint = `/${type}-lessons/admin`;
      console.log("📤 Fetching lessons for admin from:", endpoint);
      const response = await httpClient.get(endpoint);
      console.log('✅ Admin lessons fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch admin lessons:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin bài học theo ID
   * @param {number} id - ID của bài học
   * @param {string} type - 'reading' hoặc 'listening'
   */
  async getLessonById(id, type = 'listening') {
    try {
      let endpoint;
      if (type === 'reading') {
        endpoint = API_ENDPOINTS.READING_LESSON_BY_ID(id);
      } else {
        endpoint = API_ENDPOINTS.LISTENING_LESSON_BY_ID(id);
      }
      
      console.log(`📤 Fetching ${type} lesson by ID:`, id);
      const response = await httpClient.get(endpoint);
      console.log('✅ Lesson fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to get lesson:', error);
      throw error;
    }
  }

  /**
   * Cập nhật bài học
   * @param {number} id - ID của bài học
   * @param {Object} lessonData - Dữ liệu cập nhật
   * @param {string} type - 'reading' hoặc 'listening'
   */
  async updateLesson(id, lessonData, type = 'listening') {
    try {
      let endpoint;
      if (type === 'reading') {
        endpoint = API_ENDPOINTS.READING_LESSON_BY_ID(id);
      } else {
        endpoint = API_ENDPOINTS.LISTENING_LESSON_BY_ID(id);
      }

      console.log(`📤 Updating ${type} lesson:`, id, lessonData);
      const response = await httpClient.put(endpoint, lessonData);
      console.log('✅ Lesson updated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update lesson:', error);
      throw error;
    }
  }

  /**
   * Xóa bài học
   * @param {number} id - ID của bài học
   * @param {string} activeTab - 'reading' hoặc 'listening'
   */
  async deleteLesson(id, activeTab) {
    try {
      let endpoint;
      if (activeTab === 'reading') {
        endpoint = API_ENDPOINTS.READING_LESSON_BY_ID(id);
      } else {
        endpoint = API_ENDPOINTS.LISTENING_LESSON_BY_ID(id);
      }

      console.log(`📤 Deleting ${activeTab} lesson:`, id);
      const response = await httpClient.delete(endpoint);
      console.log(`✅ ${activeTab} lesson deleted successfully:`, response);
      return response;
    } catch (error) {
      console.error('❌ Failed to delete lesson:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái bài học
   * @param {number} id - ID của bài học
   * @param {string} status - DRAFT hoặc PUBLISHED
   * @param {string} type - 'reading' hoặc 'listening'
   */
  async updateLessonStatus(id, status, type = 'listening') {
    try {
      let endpoint;
      if (type === 'reading') {
        endpoint = `${API_ENDPOINTS.READING_LESSON_BY_ID(id)}/status?status=${status}`;
      } else {
        endpoint = `${API_ENDPOINTS.LISTENING_LESSON_BY_ID(id)}/status?status=${status}`;
      }

      console.log(`📤 Updating ${type} lesson status:`, id, status);
      const response = await httpClient.put(endpoint);
      console.log('✅ Lesson status updated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update lesson status:', error);
      throw error;
    }
  }

  // ================= CATEGORIES =================

  /**
   * Lấy danh sách categories
   */
  async getCategories() {
    try {
      console.log('📤 Fetching categories...');
      const response = await httpClient.get(API_ENDPOINTS.CATEGORIES);
      console.log('✅ Categories fetched successfully:', response);

      // Handle different response formats from backend
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response?.success && Array.isArray(response.categories)) {
        return response.categories;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        console.warn('⚠️ Unexpected categories response format:', response);
        return [];
      }
    } catch (error) {
      console.error('❌ Failed to load categories:', error);
      throw error;
    }
  }

  // ================= QUESTIONS MANAGEMENT =================

  /**
   * Tạo nhiều câu hỏi cho bài học
   * @param {number} lessonId - ID của bài học
   * @param {Array} questions - Mảng câu hỏi
   * @param {string} lessonType - 'LISTENING' hoặc 'READING'
   */
  async createQuestionsForLesson(lessonId, questions, lessonType) {
    try {
      console.log(`📝 Creating ${questions.length} questions for lesson ${lessonId}`);
      
      const questionPromises = questions.map(async (question) => {
        const questionCreateDto = {
          questionText: question.question,
          questionType: 'MULTIPLE_CHOICE',
          optionA: question.options[0],
          optionB: question.options[1], 
          optionC: question.options[2],
          optionD: question.options[3],
          correctAnswer: String.fromCharCode(65 + question.correctAnswer), // 0->A, 1->B, etc
          explanation: question.explanation || '',
          points: 1,
          lessonId: lessonId,
          lessonType: lessonType
        };
        
        return httpClient.post(API_ENDPOINTS.QUESTIONS, questionCreateDto);
      });
      
      const results = await Promise.all(questionPromises);
      console.log('✅ All questions created successfully:', results);
      return results;
    } catch (error) {
      console.error('❌ Failed to create questions:', error);
      throw error;
    }
  }

  /**
   * Thêm câu hỏi vào bài học đã tồn tại
   * @param {number} lessonId - ID của bài học
   * @param {Array} questions - Mảng câu hỏi
   * @param {string} lessonType - 'LISTENING' hoặc 'READING'
   */
  async addQuestionsToExistingLesson(lessonId, questions, lessonType) {
    try {
      console.log(`📝 Adding questions to existing lesson ${lessonId}`);
      
      // Kiểm tra lesson tồn tại
      const lesson = await this.getLessonById(lessonId);
      if (!lesson) {
        throw new Error('Lesson not found');
      }
      
      // Tạo câu hỏi
      return await this.createQuestionsForLesson(lessonId, questions, lessonType);
    } catch (error) {
      console.error('❌ Failed to add questions to lesson:', error);
      throw error;
    }
  }

  // ================= PREVIEW & PUBLISH =================

  /**
   * Lấy dữ liệu preview bài học
   * @param {number} lessonId - ID của bài học
   * @param {string} type - 'reading' hoặc 'listening'
   */
  async getPreviewData(lessonId, type = 'listening') {
    try {
      let endpoint;
      if (type === 'reading') {
        endpoint = `${API_ENDPOINTS.READING_LESSON_BY_ID(lessonId)}/preview`;
      } else {
        endpoint = `${API_ENDPOINTS.LISTENING_LESSON_BY_ID(lessonId)}/preview`;
      }

      console.log(`📤 Loading ${type} lesson preview:`, lessonId);
      const response = await httpClient.get(endpoint);
      console.log('✅ Preview data loaded successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to load preview:', error);
      throw error;
    }
  }

  /**
   * Xuất bản bài học
   * @param {number} lessonId - ID của bài học
   * @param {string} type - 'reading' hoặc 'listening'
   */
  async publishLesson(lessonId, type = 'listening') {
    try {
      let endpoint;
      if (type === 'reading') {
        endpoint = `${API_ENDPOINTS.READING_LESSON_BY_ID(lessonId)}/publish`;
      } else {
        endpoint = `${API_ENDPOINTS.LISTENING_LESSON_BY_ID(lessonId)}/publish`;
      }

      console.log(`📤 Publishing ${type} lesson:`, lessonId);
      const response = await httpClient.put(endpoint);
      console.log('✅ Lesson published successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to publish lesson:', error);
      throw error;
    }
  }

  // ================= STUDENT METHODS =================

  /**
   * Lấy thống kê học viên
   */
  async getStudentStats() {
    try {
      console.log('📤 Fetching student stats...');
      const response = await httpClient.get(API_ENDPOINTS.STUDENT_STATS);
      console.log('✅ Student stats fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch student stats:', error);
      throw error;
    }
  }

  /**
   * Lấy bài học gần đây của học viên
   * @param {number} limit - Số lượng bài học
   */
  async getRecentLessons(limit = 5) {
    try {
      console.log(`📤 Fetching ${limit} recent lessons...`);
      const response = await httpClient.get(`${API_ENDPOINTS.STUDENT_RECENT_LESSONS}?limit=${limit}`);
      console.log('✅ Recent lessons fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch recent lessons:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách bài học đã xuất bản cho học viên
   * @param {Object} filters - Bộ lọc
   */
  async getPublishedLessons(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.level && filters.level !== 'all') params.append('level', filters.level);
      if (filters.category && filters.category !== 'all') params.append('categoryId', filters.category);
      if (filters.search) params.append('search', filters.search);
      
      const endpoint = `${API_ENDPOINTS.STUDENT_LESSONS}?${params}`;
      console.log('📤 Fetching published lessons with filters:', filters);
      const response = await httpClient.get(endpoint);
      console.log('✅ Published lessons fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch published lessons:', error);
      throw error;
    }
  }

  /**
   * Lấy bài học theo ID cho học viên
   * @param {number} id - ID của bài học
   * @param {string} type - 'reading' hoặc 'listening'
   */
  async getStudentLessonById(id, type) {
    try {
      console.log(`📤 Fetching ${type} lesson for student:`, id);
      const response = await httpClient.get(API_ENDPOINTS.STUDENT_LESSON_BY_TYPE_ID(type, id));
      console.log('✅ Student lesson fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch student lesson:', error);
      throw error;
    }
  }

  /**
   * Lấy câu hỏi của bài học
   * @param {number} lessonId - ID của bài học
   * @param {string} lessonType - 'LISTENING' hoặc 'READING'
   */
  async getLessonQuestions(lessonId, lessonType) {
    try {
      console.log(`📤 Fetching questions for lesson ${lessonId}, type: ${lessonType}`);
      const response = await httpClient.get(`${API_ENDPOINTS.QUESTIONS}/lesson/${lessonId}?lessonType=${lessonType}`);
      console.log('✅ Lesson questions fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch lesson questions:', error);
      throw error;
    }
  }

  /**
   * Nộp bài làm của học viên
   * @param {Object} submissionData - Dữ liệu bài làm
   */
  async submitAnswers(submissionData) {
    try {
      console.log('📤 Submitting student answers:', submissionData);
      const response = await httpClient.post(API_ENDPOINTS.STUDENT_SUBMIT_ANSWERS, submissionData);
      console.log('✅ Answers submitted successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to submit answers:', error);
      throw error;
    }
  }

  /**
   * Lấy tiến độ học viên
   */
  async getStudentProgress() {
    try {
      console.log('📤 Fetching student progress...');
      const response = await httpClient.get(API_ENDPOINTS.STUDENT_PROGRESS);
      console.log('✅ Student progress fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch student progress:', error);
      throw error;
    }
  }

  // ================= FILE UPLOAD =================

  /**
   * Upload file text cho bài đọc
   * @param {File} file - File text
   */
  async uploadTextFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('📤 Uploading text file:', file.name);
      const response = await httpClient.postMultipart(API_ENDPOINTS.UPLOAD_TEXT_FILE, formData);
      console.log('✅ Text file uploaded successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to upload text file:', error);
      throw error;
    }
  }
}

// Tạo singleton instance
const lessonService = new LessonService();
export default lessonService;