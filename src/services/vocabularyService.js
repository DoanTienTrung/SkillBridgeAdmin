import httpClient from './httpClient';

class VocabularyService {
  async addVocabularyToLesson(lessonId, vocabularyData) {
    try {
      console.log('📤 Adding vocabulary to lesson:', lessonId, vocabularyData);
      
      const response = await httpClient.post(
        `/listening-lessons/${lessonId}/vocabularies`, 
        vocabularyData
      );
      
      console.log('✅ Vocabulary added successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to add vocabulary:', error);
      throw error;
    }
  }

  async getLessonVocabularies(lessonId) {
    try {
      const response = await httpClient.get(`/listening-lessons/${lessonId}/vocabularies`);
      return response;
    } catch (error) {
      console.error('❌ Failed to get vocabularies:', error);
      throw error;
    }
  }

  async removeVocabularyFromLesson(lessonId, vocabularyId) {
    try {
      const response = await httpClient.delete(
        `/listening-lessons/${lessonId}/vocabularies/${vocabularyId}`
      );
      return response;
    } catch (error) {
      console.error('❌ Failed to remove vocabulary:', error);
      throw error;
    }
  }
}

const vocabularyService = new VocabularyService();
export default vocabularyService;
