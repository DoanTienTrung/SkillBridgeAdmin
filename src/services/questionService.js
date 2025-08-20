import httpClient from './httpClient';
import { API_ENDPOINTS } from './config';

class QuestionService {
  /**
   * Lấy danh sách câu hỏi theo bài học
   * @param {number} lessonId - ID của bài học
   * @param {string} lessonType - Loại bài học: 'LISTENING' hoặc 'READING'
   */
  async getQuestionsByLesson(lessonId, lessonType) {
    try {
      console.log(`📤 Fetching questions for lesson ${lessonId}, type: ${lessonType}`);
      
      // Chuyển đổi lessonType từ frontend format sang backend format
      const backendLessonType = lessonType === 'READING' ? 'READING' : 'LISTENING';
      
      const response = await httpClient.get(
        `${API_ENDPOINTS.QUESTIONS}/lesson/${lessonId}?lessonType=${backendLessonType}`
      );
      
      console.log('✅ Questions fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch questions:', error);
      throw error;
    }
  }

  /**
   * Tạo câu hỏi mới
   * @param {Object} questionData - Dữ liệu câu hỏi
   */
  async createQuestion(questionData) {
    try {
      console.log('📤 Creating question:', questionData);
      
      // Chuẩn hóa dữ liệu theo format backend mong đợi
      const questionCreateDto = {
        questionText: questionData.questionText,
        questionType: questionData.questionType || 'MULTIPLE_CHOICE',
        optionA: questionData.optionA,
        optionB: questionData.optionB,
        optionC: questionData.optionC,
        optionD: questionData.optionD,
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation,
        points: questionData.points || 1,
        lessonId: questionData.lessonId,
        lessonType: questionData.lessonType
      };
      
      const response = await httpClient.post(API_ENDPOINTS.QUESTIONS, questionCreateDto);
      console.log('✅ Question created successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create question:', error);
      throw error;
    }
  }

  /**
   * Cập nhật câu hỏi
   * @param {number} id - ID của câu hỏi
   * @param {Object} questionData - Dữ liệu câu hỏi cần cập nhật
   */
  async updateQuestion(id, questionData) {
    try {
      console.log(`📤 Updating question ${id}:`, questionData);
      
      const questionUpdateDto = {
        questionText: questionData.questionText,
        questionType: questionData.questionType,
        optionA: questionData.optionA,
        optionB: questionData.optionB,
        optionC: questionData.optionC,
        optionD: questionData.optionD,
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation,
        points: questionData.points
      };
      
      const response = await httpClient.put(`${API_ENDPOINTS.QUESTIONS}/${id}`, questionUpdateDto);
      console.log('✅ Question updated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update question:', error);
      throw error;
    }
  }

  /**
   * Xóa câu hỏi
   * @param {number} id - ID của câu hỏi cần xóa
   */
  async deleteQuestion(id) {
    try {
      console.log(`📤 Deleting question ${id}`);
      const response = await httpClient.delete(`${API_ENDPOINTS.QUESTIONS}/${id}`);
      console.log('✅ Question deleted successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to delete question:', error);
      throw error;
    }
  }

  /**
   * Lấy câu hỏi theo ID
   * @param {number} id - ID của câu hỏi
   */
  async getQuestionById(id) {
    try {
      console.log(`📤 Fetching question ${id}`);
      const response = await httpClient.get(`${API_ENDPOINTS.QUESTIONS}/${id}`);
      console.log('✅ Question fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch question:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tất cả câu hỏi (cho admin)
   */
  async getAllQuestions() {
    try {
      console.log('📤 Fetching all questions for admin...');
      const response = await httpClient.get(API_ENDPOINTS.QUESTIONS);
      console.log('✅ All questions fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch all questions:', error);
      throw error;
    }
  }

  /**
   * Validation helper cho dữ liệu câu hỏi
   * @param {Object} questionData - Dữ liệu câu hỏi cần validate
   */
  validateQuestionData(questionData) {
    const errors = [];

    if (!questionData.questionText?.trim()) {
      errors.push('Nội dung câu hỏi không được để trống');
    }

    if (!questionData.correctAnswer?.trim()) {
      errors.push('Đáp án đúng không được để trống');
    }

    if (questionData.questionType === 'MULTIPLE_CHOICE') {
      const options = [questionData.optionA, questionData.optionB, 
                      questionData.optionC, questionData.optionD];
      const emptyOptions = options.filter(opt => !opt?.trim());
      
      if (emptyOptions.length > 0) {
        errors.push('Tất cả các lựa chọn phải được điền đầy đủ cho câu hỏi trắc nghiệm');
      }

      const validAnswers = ['A', 'B', 'C', 'D'];
      if (!validAnswers.includes(questionData.correctAnswer?.toUpperCase())) {
        errors.push('Đáp án đúng phải là A, B, C hoặc D');
      }
    }

    if (questionData.questionType === 'TRUE_FALSE') {
      const validAnswers = ['TRUE', 'FALSE', 'true', 'false'];
      if (!validAnswers.includes(questionData.correctAnswer)) {
        errors.push('Đáp án đúng phải là TRUE hoặc FALSE');
      }
    }

    if (questionData.points && (questionData.points < 0 || questionData.points > 10)) {
      errors.push('Điểm số phải từ 0 đến 10');
    }

    return errors;
  }

  /**
   * Helper để format dữ liệu câu hỏi hiển thị
   * @param {Object} question - Dữ liệu câu hỏi từ API
   */
  formatQuestionForDisplay(question) {
    return {
      ...question,
      questionTypeName: question.questionType === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Đúng/Sai',
      lessonTypeName: question.lessonType === 'LISTENING' ? 'Bài nghe' : 'Bài đọc',
      correctAnswerText: this.getCorrectAnswerText(question)
    };
  }

  /**
   * Helper để lấy text của đáp án đúng
   * @param {Object} question - Dữ liệu câu hỏi
   */
  getCorrectAnswerText(question) {
    if (question.questionType === 'MULTIPLE_CHOICE') {
      const answerMap = {
        'A': question.optionA,
        'B': question.optionB,
        'C': question.optionC,
        'D': question.optionD
      };
      return answerMap[question.correctAnswer] || question.correctAnswer;
    }
    return question.correctAnswer === 'TRUE' ? 'Đúng' : 'Sai';
  }
}

// Tạo singleton instance
const questionService = new QuestionService();
export default questionService;