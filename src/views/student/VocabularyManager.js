import React, { useState, useEffect } from 'react';
import personalVocabularyService from '../../services/personalVocabularyService';

export default function VocabularyManager() {
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    learning: 0,
    mastered: 0,
    difficult: 0
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWord, setNewWord] = useState({
    word: '',
    meaning: '',
    phonetic: '',
    exampleSentence: ''
  });

  useEffect(() => {
    fetchVocabulary();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const fetchVocabulary = async () => {
    try {
      setLoading(true);
      const [vocabularyData, statsData] = await Promise.all([
        personalVocabularyService.getUserVocabulary(),
        personalVocabularyService.getVocabularyStats()
      ]);
      
      // Format vocabulary data for display
      const formattedVocabulary = vocabularyData.map(personalVocabularyService.formatVocabularyForDisplay);
      setVocabulary(formattedVocabulary);
      setStats(statsData);
      
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      showMessage('error', 'Không thể tải danh sách từ vựng');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddWord = async (e) => {
    e.preventDefault();
    
    if (!newWord.word.trim()) {
      showMessage('error', 'Vui lòng nhập từ vựng');
      return;
    }
    
    try {
      setLoading(true);
      await personalVocabularyService.saveWord(newWord);
      
      // Reset form
      setNewWord({
        word: '',
        meaning: '',
        phonetic: '',
        exampleSentence: ''
      });
      setShowAddForm(false);
      
      // Refresh vocabulary list
      await fetchVocabulary();
      showMessage('success', 'Thêm từ vựng thành công!');
    } catch (error) {
      console.error('Error adding word:', error);
      showMessage('error', error.message || 'Thêm từ vựng thất bại');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (vocabularyId, newStatus) => {
    try {
      await personalVocabularyService.updateVocabularyStatus(vocabularyId, newStatus);
      await fetchVocabulary(); // Refresh list
      showMessage('success', 'Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating status:', error);
      showMessage('error', error.message || 'Cập nhật trạng thái thất bại');
    }
  };
  
  const handleRemoveWord = async (vocabularyId) => {
    if (!window.confirm('Bạn có chắc muốn xóa từ vựng này?')) {
      return;
    }
    
    try {
      await personalVocabularyService.removeWord(vocabularyId);
      await fetchVocabulary(); // Refresh list
      showMessage('success', 'Xóa từ vựng thành công!');
    } catch (error) {
      console.error('Error removing word:', error);
      showMessage('error', error.message || 'Xóa từ vựng thất bại');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-blueGray-50 p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-blueGray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Từ vựng của tôi</h1>
          <p className="text-gray-600">Quản lý và ôn tập từ vựng đã học</p>
        </div>
        
        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            <div className="flex items-center">
              <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
              {message.text}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Tổng từ vựng</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.mastered}</div>
            <div className="text-sm text-gray-600">Đã thuộc</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{stats.learning}</div>
            <div className="text-sm text-gray-600">Đang học</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-red-600">{stats.difficult}</div>
            <div className="text-sm text-gray-600">Khó nhớ</div>
          </div>
        </div>

        {/* Vocabulary List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Danh sách từ vựng</h2>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              {showAddForm ? 'Hủy' : 'Thêm từ mới'}
            </button>
          </div>
          
          {/* Add Word Form */}
          {showAddForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <form onSubmit={handleAddWord}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Từ vựng *
                    </label>
                    <input
                      type="text"
                      value={newWord.word}
                      onChange={(e) => setNewWord({...newWord, word: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập từ vựng..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phân âm
                    </label>
                    <input
                      type="text"
                      value={newWord.phonetic}
                      onChange={(e) => setNewWord({...newWord, phonetic: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="/fəˈnetɪk/"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nghĩa
                    </label>
                    <input
                      type="text"
                      value={newWord.meaning}
                      onChange={(e) => setNewWord({...newWord, meaning: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nghĩa của từ..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ví dụ
                    </label>
                    <input
                      type="text"
                      value={newWord.exampleSentence}
                      onChange={(e) => setNewWord({...newWord, exampleSentence: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ví dụ về cách sử dụng..."
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <i className="fas fa-save mr-2"></i>
                    {loading ? 'Đang lưu...' : 'Lưu từ vựng'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vocabulary.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                <i className="fas fa-book text-4xl mb-4"></i>
                <p>Chưa có từ vựng nào. Hãy thêm từ đầu tiên!</p>
              </div>
            ) : (
              vocabulary.map(vocab => (
                <div key={vocab.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{vocab.word}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${vocab.statusInfo.bgClass}`}>
                      <i className={`${vocab.statusInfo.iconClass} mr-1`}></i>
                      {vocab.statusInfo.label}
                    </span>
                  </div>
                  
                  {/* Phonetic */}
                  {vocab.phonetic && (
                    <p className="text-sm text-blue-600 mb-1 italic">{vocab.phonetic}</p>
                  )}
                  
                  {/* Meaning */}
                  {vocab.meaning && (
                    <p className="text-gray-700 mb-2">{vocab.meaning}</p>
                  )}
                  
                  {/* Example */}
                  {vocab.exampleSentence && (
                    <p className="text-sm text-gray-600 italic mb-3">
                      " {vocab.exampleSentence} "
                    </p>
                  )}
                  
                  {/* Metadata */}
                  <div className="text-xs text-gray-500 mb-3">
                    <div>Thêm: {vocab.createdAtFormatted}</div>
                    {vocab.reviewCount > 0 && (
                      <div>Ôn tập: {vocab.reviewCount} lần</div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-between items-center">
                    {/* Status Change Dropdown */}
                    <select
                      value={vocab.status}
                      onChange={(e) => handleStatusChange(vocab.id, e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="LEARNING">Đang học</option>
                      <option value="MASTERED">Đã thuộc</option>
                      <option value="DIFFICULT">Khó nhớ</option>
                    </select>
                    
                    {/* Delete Button */}
                    <button 
                      onClick={() => handleRemoveWord(vocab.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Xóa từ vựng"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
