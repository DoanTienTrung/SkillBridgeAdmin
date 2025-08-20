import React, { useState, useEffect } from 'react';
import vocabularyService from '../../services/vocabularyService';

export default function VocabularyManager() {
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVocabulary();
  }, []);

  const fetchVocabulary = async () => {
    try {
      setLoading(true);
      // TODO: Implement vocabulary API call
      // const response = await vocabularyService.getUserVocabulary();
      // setVocabulary(response.data);
      
      // Temporary mock data
      setVocabulary([
        { id: 1, word: 'Amazing', meaning: 'Tuyệt vời', level: 'B1', status: 'learning' },
        { id: 2, word: 'Beautiful', meaning: 'Xinh đẹp', level: 'A2', status: 'mastered' },
        { id: 3, word: 'Complicated', meaning: 'Phức tạp', level: 'B2', status: 'difficult' }
      ]);
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
    } finally {
      setLoading(false);
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{vocabulary.length}</div>
            <div className="text-sm text-gray-600">Tổng từ vựng</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {vocabulary.filter(v => v.status === 'mastered').length}
            </div>
            <div className="text-sm text-gray-600">Đã thuộc</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">
              {vocabulary.filter(v => v.status === 'learning').length}
            </div>
            <div className="text-sm text-gray-600">Đang học</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-red-600">
              {vocabulary.filter(v => v.status === 'difficult').length}
            </div>
            <div className="text-sm text-gray-600">Khó nhớ</div>
          </div>
        </div>

        {/* Vocabulary List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Danh sách từ vựng</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Thêm từ mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vocabulary.map(vocab => (
              <div key={vocab.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{vocab.word}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    vocab.status === 'mastered' ? 'bg-green-100 text-green-800' :
                    vocab.status === 'learning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {vocab.status === 'mastered' ? 'Đã thuộc' :
                     vocab.status === 'learning' ? 'Đang học' : 'Khó nhớ'}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{vocab.meaning}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Level: {vocab.level}</span>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
