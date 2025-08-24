import httpClient from './httpClient';
import { API_ENDPOINTS } from './config';

/**
 * Personal Vocabulary Service
 */
class PersonalVocabularyService {

  /**
   * Save word to personal vocabulary
   */
  async saveWord(wordData) {
    try {
      console.log('📚 Saving word to personal vocabulary:', wordData.word);
      
      const response = await httpClient.post('/vocabulary/save', wordData);
      
      if (response.success) {
        console.log('✅ Word saved successfully');
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to save word');
    } catch (error) {
      console.error('❌ Save word error:', error);
      throw error;
    }
  }

  /**
   * Get user's personal vocabulary
   */
  async getUserVocabulary() {
    try {
      console.log('📖 Fetching personal vocabulary');
      
      const response = await httpClient.get('/vocabulary/my-vocabulary');
      
      if (response.success) {
        console.log('✅ Vocabulary fetched successfully, count:', response.data?.length || 0);
        return response.data || [];
      }
      
      throw new Error(response.message || 'Failed to fetch vocabulary');
    } catch (error) {
      console.error('❌ Fetch vocabulary error:', error);
      throw error;
    }
  }

  /**
   * Update vocabulary status
   */
  async updateVocabularyStatus(vocabularyId, status) {
    try {
      console.log('🔄 Updating vocabulary status:', vocabularyId, status);
      
      const response = await httpClient.put(`/vocabulary/${vocabularyId}/status?status=${status}`);
      
      if (response.success) {
        console.log('✅ Vocabulary status updated successfully');
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update vocabulary status');
    } catch (error) {
      console.error('❌ Update vocabulary status error:', error);
      throw error;
    }
  }

  /**
   * Remove word from personal vocabulary
   */
  async removeWord(vocabularyId) {
    try {
      console.log('🗑️ Removing word from personal vocabulary:', vocabularyId);
      
      const response = await httpClient.delete(`/vocabulary/${vocabularyId}`);
      
      if (response.success) {
        console.log('✅ Word removed successfully');
        return true;
      }
      
      throw new Error(response.message || 'Failed to remove word');
    } catch (error) {
      console.error('❌ Remove word error:', error);
      throw error;
    }
  }

  /**
   * Look up word meaning
   */
  async lookupWord(word) {
    try {
      console.log('🔍 Looking up word:', word);
      
      const response = await httpClient.get(`/vocabulary/lookup/${encodeURIComponent(word)}`);
      
      if (response.success) {
        console.log('✅ Word lookup successful');
        return response.data;
      }
      
      // If word not found in system, return null - frontend will handle external dictionary
      return null;
    } catch (error) {
      console.error('❌ Word lookup error:', error);
      // Don't throw error for lookup - just return null
      return null;
    }
  }

  /**
   * Get vocabulary statistics
   */
  async getVocabularyStats() {
    try {
      console.log('📊 Fetching vocabulary statistics');
      
      const response = await httpClient.get('/vocabulary/stats');
      
      if (response.success) {
        console.log('✅ Vocabulary stats fetched successfully');
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch vocabulary stats');
    } catch (error) {
      console.error('❌ Fetch vocabulary stats error:', error);
      throw error;
    }
  }

  /**
   * External dictionary lookup (fallback when word not in system)
   */
  async lookupWordExternal(word) {
    try {
      console.log('🌐 Looking up word in external dictionary:', word);
      
      // This could integrate with external dictionary APIs like:
      // - Oxford Dictionary API
      // - Cambridge Dictionary API
      // - Free Dictionary API
      
      // For now, return a placeholder structure
      return {
        word: word,
        phonetic: '',
        meaning: '',
        exampleSentence: '',
        isExternal: true,
        source: 'external'
      };
    } catch (error) {
      console.error('❌ External dictionary lookup error:', error);
      throw error;
    }
  }

  /**
   * Helper: Get vocabulary status display info
   */
  getStatusInfo(status) {
    const statusMap = {
      'LEARNING': { 
        label: 'Đang học', 
        color: 'yellow',
        bgClass: 'bg-yellow-100 text-yellow-800',
        iconClass: 'fas fa-book-open'
      },
      'MASTERED': { 
        label: 'Đã thuộc', 
        color: 'green',
        bgClass: 'bg-green-100 text-green-800',
        iconClass: 'fas fa-check-circle'
      },
      'DIFFICULT': { 
        label: 'Khó nhớ', 
        color: 'red',
        bgClass: 'bg-red-100 text-red-800',
        iconClass: 'fas fa-exclamation-triangle'
      }
    };

    return statusMap[status] || statusMap['LEARNING'];
  }

  /**
   * Helper: Format vocabulary data for display
   */
  formatVocabularyForDisplay(vocabulary) {
    return {
      ...vocabulary,
      statusInfo: this.getStatusInfo(vocabulary.status),
      createdAtFormatted: vocabulary.createdAt ? 
        new Date(vocabulary.createdAt).toLocaleDateString('vi-VN') : '',
      lastReviewedFormatted: vocabulary.lastReviewed ? 
        new Date(vocabulary.lastReviewed).toLocaleDateString('vi-VN') : 'Chưa ôn tập'
    };
  }
}

// Create singleton instance
const personalVocabularyService = new PersonalVocabularyService();

export default personalVocabularyService;
