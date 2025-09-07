import httpClient from './httpClient';
import { API_ENDPOINTS } from './config';

/**
 * Personal Vocabulary Service - Updated để sử dụng đúng API endpoints
 */
class PersonalVocabularyService {

  /**
   * Save word to personal vocabulary
   */
  async saveWord(wordData) {
    try {
      console.log('📚 Saving word to personal vocabulary: - personalVocabularyService.js:14', wordData.word);
      
      const response = await httpClient.post(API_ENDPOINTS.SAVE_VOCABULARY, wordData);
      
      if (response.success) {
        console.log('✅ Word saved successfully - personalVocabularyService.js:19');
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to save word');
    } catch (error) {
      console.error('❌ Save word error: - personalVocabularyService.js:25', error);
      throw error;
    }
  }

  /**
   * Get user's personal vocabulary
   */
  async getUserVocabulary() {
    try {
      console.log('📖 Fetching personal vocabulary - personalVocabularyService.js:35');
      
      const response = await httpClient.get(API_ENDPOINTS.MY_VOCABULARY);
      
      if (response.success) {
        console.log('✅ Vocabulary fetched successfully, count: - personalVocabularyService.js:40', response.data?.length || 0);
        return response.data || [];
      }
      
      throw new Error(response.message || 'Failed to fetch vocabulary');
    } catch (error) {
      console.error('❌ Fetch vocabulary error: - personalVocabularyService.js:46', error);
      
      // Debug thông tin lỗi
      if (error.message.includes('404')) {
        console.error('🔍 API endpoint not found. Check if backend is running and endpoints are correct. - personalVocabularyService.js:50');
        console.error('Expected endpoint: GET - personalVocabularyService.js:51', API_ENDPOINTS.MY_VOCABULARY);
      } else if (error.message.includes('401') || error.message.includes('403')) {
        console.error('🔐 Authentication/Authorization error. Check token and user role. - personalVocabularyService.js:53');
      }
      
      throw error;
    }
  }

  /**
   * Update vocabulary status
   */
  async updateVocabularyStatus(vocabularyId, status) {
    try {
      console.log('🔄 Updating vocabulary status: - personalVocabularyService.js:65', vocabularyId, status);
      
      const endpoint = API_ENDPOINTS.UPDATE_VOCABULARY_STATUS(vocabularyId);
      const response = await httpClient.put(`${endpoint}?status=${status}`);
      
      if (response.success) {
        console.log('✅ Vocabulary status updated successfully - personalVocabularyService.js:71');
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update vocabulary status');
    } catch (error) {
      console.error('❌ Update vocabulary status error: - personalVocabularyService.js:77', error);
      throw error;
    }
  }

  /**
   * Remove word from personal vocabulary
   */
  async removeWord(vocabularyId) {
    try {
      console.log('🗑️ Removing word from personal vocabulary: - personalVocabularyService.js:87', vocabularyId);
      
      const endpoint = API_ENDPOINTS.REMOVE_VOCABULARY(vocabularyId);
      const response = await httpClient.delete(endpoint);
      
      if (response.success) {
        console.log('✅ Word removed successfully - personalVocabularyService.js:93');
        return true;
      }
      
      throw new Error(response.message || 'Failed to remove word');
    } catch (error) {
      console.error('❌ Remove word error: - personalVocabularyService.js:99', error);
      throw error;
    }
  }

  /**
   * Look up word meaning
   */
  async lookupWord(word) {
    try {
      console.log('🔍 Looking up word: - personalVocabularyService.js:109', word);
      
      const endpoint = API_ENDPOINTS.LOOKUP_WORD(word);
      const response = await httpClient.get(endpoint);
      
      if (response.success) {
        console.log('✅ Word lookup successful - personalVocabularyService.js:115');
        return response.data;
      }
      
      // If word not found in system, return null - frontend will handle external dictionary
      return null;
    } catch (error) {
      console.error('❌ Word lookup error: - personalVocabularyService.js:122', error);
      // Don't throw error for lookup - just return null
      return null;
    }
  }

  /**
   * Get vocabulary statistics
   */
  async getVocabularyStats() {
    try {
      console.log('📊 Fetching vocabulary statistics - personalVocabularyService.js:133');
      
      const response = await httpClient.get(API_ENDPOINTS.VOCABULARY_STATS);
      
      if (response.success) {
        console.log('✅ Vocabulary stats fetched successfully - personalVocabularyService.js:138');
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch vocabulary stats');
    } catch (error) {
      console.error('❌ Fetch vocabulary stats error: - personalVocabularyService.js:144', error);
      
      // Return default stats if API fails
      console.log('⚠️ Returning default stats due to API error - personalVocabularyService.js:147');
      return {
        total: 0,
        learning: 0,
        mastered: 0,
        difficult: 0
      };
    }
  }

  /**
   * External dictionary lookup (fallback when word not in system)
   */
  async lookupWordExternal(word) {
    try {
      console.log('🌐 Looking up word in external dictionary: - personalVocabularyService.js:162', word);
      
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
      console.error('❌ External dictionary lookup error: - personalVocabularyService.js:179', error);
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

  /**
   * Test API connection cho vocabulary endpoints
   */
  async testVocabularyAPI() {
    console.log('🧪 Testing Vocabulary API connections... - personalVocabularyService.js:230');
    
    const tests = [
      {
        name: 'Get My Vocabulary',
        method: () => this.getUserVocabulary()
      },
      {
        name: 'Get Vocabulary Stats', 
        method: () => this.getVocabularyStats()
      }
    ];
    
    const results = {};
    
    for (const test of tests) {
      try {
        console.log(`Testing: ${test.name} - personalVocabularyService.js:247`);
        await test.method();
        results[test.name] = '✅ SUCCESS';
      } catch (error) {
        results[test.name] = `❌ FAILED: ${error.message}`;
      }
    }
    
    console.table(results);
    return results;
  }

  /**
   * Debug authentication for vocabulary endpoints
   */
  debugVocabularyAuth() {
    console.log('🔐 Debug Vocabulary Authentication: - personalVocabularyService.js:263');
    
    const token = httpClient.getAuthToken();
    const user = httpClient.getCurrentUser();
    
    const authInfo = {
      'Has Token': token ? '✅ YES' : '❌ NO',
      'User Role': user?.role || '❌ NOT FOUND',
      'Is Student': user?.role === 'STUDENT' ? '✅ YES' : '❌ NO',
      'User ID': user?.id || '❌ NOT FOUND',
      'Token Valid': httpClient.isAuthenticated() ? '✅ YES' : '❌ NO'
    };
    
    console.table(authInfo);
    
    if (user?.role !== 'STUDENT') {
      console.error('❌ CRITICAL: User role is not STUDENT. Vocabulary endpoints require STUDENT role. - personalVocabularyService.js:279');
      console.log('💡 TIP: Make sure you are logged in as a student user. - personalVocabularyService.js:280');
    }
    
    return authInfo;
  }
}

// Create singleton instance
const personalVocabularyService = new PersonalVocabularyService();

export default personalVocabularyService;