import httpClient from './httpClient';
import { API_ENDPOINTS } from './config';

class LessonService {
  // ================= ADMIN LESSON MANAGEMENT =================
  
  /**
   * Tạo bài học listening mới
   */
  async createListeningLesson(lessonData) {
    try {
      console.log('📤 Creating listening lesson: - lessonService.js:12', lessonData);
      const response = await httpClient.post(API_ENDPOINTS.LISTENING_LESSONS, lessonData);
      console.log('✅ Listening lesson created successfully: - lessonService.js:14', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create listening lesson: - lessonService.js:17', error);
      throw error;
    }
  }

  /**
   * Tạo bài học reading mới
   */
  async createReadingLesson(lessonData) {
    try {
      console.log('📤 Creating reading lesson: - lessonService.js:27', lessonData);
      const response = await httpClient.post(API_ENDPOINTS.READING_LESSONS, lessonData);
      console.log('✅ Reading lesson created successfully: - lessonService.js:29', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create reading lesson: - lessonService.js:32', error);
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
      console.log("📤 Fetching lessons for admin from: - lessonService.js:44", endpoint);
      const response = await httpClient.get(endpoint);
      console.log('✅ Admin lessons fetched successfully: - lessonService.js:46', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch admin lessons: - lessonService.js:49', error);
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
      
      console.log(`📤 Fetching ${type} lesson by ID: - lessonService.js:68`, id);
      const response = await httpClient.get(endpoint);
      console.log('✅ Lesson fetched successfully: - lessonService.js:70', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to get lesson: - lessonService.js:73', error);
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

      console.log(`📤 Updating ${type} lesson: - lessonService.js:93`, id, lessonData);
      const response = await httpClient.put(endpoint, lessonData);
      console.log('✅ Lesson updated successfully: - lessonService.js:95', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update lesson: - lessonService.js:98', error);
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

      console.log(`📤 Deleting ${activeTab} lesson: - lessonService.js:117`, id);
      const response = await httpClient.delete(endpoint);
      console.log(`✅ ${activeTab} lesson deleted successfully: - lessonService.js:119`, response);
      return response;
    } catch (error) {
      console.error('❌ Failed to delete lesson: - lessonService.js:122', error);
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

      console.log(`📤 Updating ${type} lesson status: - lessonService.js:142`, id, status);
      const response = await httpClient.put(endpoint);
      console.log('✅ Lesson status updated successfully: - lessonService.js:144', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update lesson status: - lessonService.js:147', error);
      throw error;
    }
  }

  // ================= CATEGORIES =================

  /**
   * Lấy danh sách categories
   */
  async getCategories() {
    try {
      console.log('📤 Fetching categories... - lessonService.js:159');
      const response = await httpClient.get(API_ENDPOINTS.CATEGORIES);
      console.log('✅ Categories fetched successfully: - lessonService.js:161', response);

      // Handle different response formats from backend
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response?.success && Array.isArray(response.categories)) {
        return response.categories;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        console.warn('⚠️ Unexpected categories response format: - lessonService.js:171', response);
        return [];
      }
    } catch (error) {
      console.error('❌ Failed to load categories: - lessonService.js:175', error);
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
      console.log(`📝 Creating ${questions.length} questions for lesson ${lessonId} - lessonService.js:190`);
      
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
      console.log('✅ All questions created successfully: - lessonService.js:211', results);
      return results;
    } catch (error) {
      console.error('❌ Failed to create questions: - lessonService.js:214', error);
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
      console.log(`📝 Adding questions to existing lesson ${lessonId} - lessonService.js:227`);
      
      // Kiểm tra lesson tồn tại
      const lesson = await this.getLessonById(lessonId);
      if (!lesson) {
        throw new Error('Lesson not found');
      }
      
      // Tạo câu hỏi
      return await this.createQuestionsForLesson(lessonId, questions, lessonType);
    } catch (error) {
      console.error('❌ Failed to add questions to lesson: - lessonService.js:238', error);
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

      console.log(`📤 Loading ${type} lesson preview: - lessonService.js:259`, lessonId);
      const response = await httpClient.get(endpoint);
      console.log('✅ Preview data loaded successfully: - lessonService.js:261', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to load preview: - lessonService.js:264', error);
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

      console.log(`📤 Publishing ${type} lesson: - lessonService.js:283`, lessonId);
      const response = await httpClient.put(endpoint);
      console.log('✅ Lesson published successfully: - lessonService.js:285', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to publish lesson: - lessonService.js:288', error);
      throw error;
    }
  }

  // ================= STUDENT METHODS =================

  /**
   * Lấy thống kê học viên
   */
  async getStudentStats() {
    try {
      console.log('📤 Fetching student stats... - lessonService.js:300');
      const response = await httpClient.get(API_ENDPOINTS.STUDENT_STATS);
      console.log('✅ Student stats fetched successfully: - lessonService.js:302', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch student stats: - lessonService.js:305', error);
      throw error;
    }
  }

  /**
   * Lấy bài học gần đây của học viên
   * @param {number} limit - Số lượng bài học
   */
  async getRecentLessons(limit = 5) {
    try {
      console.log(`📤 Fetching ${limit} recent lessons... - lessonService.js:316`);
      const response = await httpClient.get(`${API_ENDPOINTS.STUDENT_RECENT_LESSONS}?limit=${limit}`);
      console.log('✅ Recent lessons fetched successfully: - lessonService.js:318', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch recent lessons: - lessonService.js:321', error);
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
      console.log('📤 Fetching published lessons with filters: - lessonService.js:339', filters);
      const response = await httpClient.get(endpoint);
      console.log('✅ Published lessons fetched successfully: - lessonService.js:341', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch published lessons: - lessonService.js:344', error);
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
      console.log(`📤 Fetching ${type} lesson for student: - lessonService.js:356`, id);
      const response = await httpClient.get(API_ENDPOINTS.STUDENT_LESSON_BY_TYPE_ID(type, id));
      console.log('✅ Student lesson fetched successfully: - lessonService.js:358', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch student lesson: - lessonService.js:361', error);
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
      console.log(`📤 Fetching questions for lesson ${lessonId}, type: ${lessonType} - lessonService.js:373`);
      const response = await httpClient.get(`${API_ENDPOINTS.QUESTIONS}/lesson/${lessonId}?lessonType=${lessonType}`);
      console.log('✅ Lesson questions fetched successfully: - lessonService.js:375', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch lesson questions: - lessonService.js:378', error);
      throw error;
    }
  }

  /**
   * Nộp bài làm của học viên
   * @param {Object} submissionData - Dữ liệu bài làm
   */
  async submitAnswers(submissionData) {
    try {
      console.log('📤 Submitting student answers: - lessonService.js:389', submissionData);
      const response = await httpClient.post(API_ENDPOINTS.STUDENT_SUBMIT_ANSWERS, submissionData);
      console.log('✅ Answers submitted successfully: - lessonService.js:391', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to submit answers: - lessonService.js:394', error);
      throw error;
    }
  }

  /**
   * Lấy tiến độ học viên
   */
  async getStudentProgress() {
    try {
      console.log('📤 Fetching student progress... - lessonService.js:404');
      const response = await httpClient.get(API_ENDPOINTS.STUDENT_PROGRESS);
      console.log('✅ Student progress fetched successfully: - lessonService.js:406', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch student progress: - lessonService.js:409', error);
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
      
      console.log('📤 Uploading text file: - lessonService.js:425', file.name);
      const response = await httpClient.postMultipart(API_ENDPOINTS.UPLOAD_TEXT_FILE, formData);
      console.log('✅ Text file uploaded successfully: - lessonService.js:427', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to upload text file: - lessonService.js:430', error);
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
      
      // Thêm filters vào query params
      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type.toUpperCase());
      }
      if (filters.level && filters.level !== 'all') {
        params.append('level', filters.level);
      }
      if (filters.category && filters.category !== 'all') {
        params.append('categoryId', filters.category);
      }
      if (filters.search && filters.search.trim()) {
        params.append('search', filters.search.trim());
      }
      
      const endpoint = `${API_ENDPOINTS.STUDENT_LESSONS}${params.toString() ? '?' + params.toString() : ''}`;
      
      console.log('📤 Fetching published lessons from: - lessonService.js:460', endpoint);
      console.log('🎛️ Filters applied: - lessonService.js:461', filters);
      
      const response = await httpClient.get(endpoint);
      
      console.log('✅ Published lessons API response: - lessonService.js:465', response);
      
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch published lessons: - lessonService.js:469', error);
      console.error('Error details: - lessonService.js:470', {
        message: error.message,
        status: error.status,
        endpoint: API_ENDPOINTS.STUDENT_LESSONS
      });
      throw error;
    }
  }
}

// Tạo singleton instance
const lessonService = new LessonService();
export default lessonService;