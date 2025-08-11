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
}

const lessonService = new LessonService();
export default lessonService;