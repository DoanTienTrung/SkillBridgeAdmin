import React, { useState, useEffect } from 'react';
import vocabularyService from '../../services/vocabularyService';

export default function VocabularyLookupModal({ word, isOpen, onClose, onSave }) {
  const [vocabularyData, setVocabularyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen && word) {
      lookupWord();
    }
  }, [isOpen, word]);

  const lookupWord = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const response = await vocabularyService.lookupWord(word);
      // setVocabularyData(response.data);
      
      // Mock data for now
      const mockData = {
        word: word,
        pronunciation: `/${word.toLowerCase()}/`,
        partOfSpeech: 'noun',
        definitions: [
          {
            meaning: 'Từ này có nghĩa là...',
            example: `Example: "${word}" in a sentence.`
          }
        ],
        level: 'B2',
        frequency: 'Common'
      };
      
      // Simulate API delay
      setTimeout(() => {
        setVocabularyData(mockData);
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error looking up word:', error);
      setError('Không thể tra từ. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const handleSaveWord = async () => {
    try {
      if (onSave) {
        await onSave(vocabularyData);
      }
      
      // TODO: Save to user vocabulary
      // await vocabularyService.saveUserVocabulary(vocabularyData);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving word:', error);
      alert('Có lỗi khi lưu từ vựng');
    }
  };

  const handleClose = () => {
    setVocabularyData(null);
    setError(null);
    setSaved(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Tra từ điển</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Đang tra từ...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">
                <i className="fas fa-exclamation-triangle text-2xl"></i>
              </div>
              <p className="text-red-500">{error}</p>
              <button
                onClick={lookupWord}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          )}

          {vocabularyData && (
            <div>
              {/* Word Info */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-bold text-gray-900">{vocabularyData.word}</h4>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                    {vocabularyData.level}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <span className="mr-4">
                    <i className="fas fa-volume-up mr-1"></i>
                    {vocabularyData.pronunciation}
                  </span>
                  <span className="italic">{vocabularyData.partOfSpeech}</span>
                </div>
              </div>

              {/* Definitions */}
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Nghĩa:</h5>
                {vocabularyData.definitions.map((def, index) => (
                  <div key={index} className="mb-3">
                    <p className="text-gray-700 mb-1">{def.meaning}</p>
                    {def.example && (
                      <p className="text-sm text-gray-500 italic">
                        Ví dụ: {def.example}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Frequency */}
              {vocabularyData.frequency && (
                <div className="mb-4">
                  <span className="text-sm text-gray-600">
                    <i className="fas fa-chart-bar mr-1"></i>
                    Tần suất: {vocabularyData.frequency}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveWord}
                  disabled={saved}
                  className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors ${
                    saved 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {saved ? (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Đã lưu
                    </>
                  ) : (
                    <>
                      <i className="fas fa-bookmark mr-2"></i>
                      Lưu từ vựng
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
