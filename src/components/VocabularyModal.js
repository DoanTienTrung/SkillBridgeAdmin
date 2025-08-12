import React, { useState } from 'react';

export default function VocabularyModal({ 
  isOpen, 
  onClose, 
  selectedText, 
  textPosition, 
  onSave 
}) {
  const [vocabularyData, setVocabularyData] = useState({
    word: selectedText || '',
    phonetic: '',
    meaning: '',
    exampleSentence: '',
    highlightColor: '#ffeb3b'
  });
  const [saving, setSaving] = useState(false);

  const colors = [
    { name: 'Vàng', value: '#ffeb3b' },
    { name: 'Xanh lá', value: '#4caf50' },
    { name: 'Xanh dương', value: '#2196f3' },
    { name: 'Tím', value: '#9c27b0' },
    { name: 'Cam', value: '#ff9800' },
    { name: 'Đỏ', value: '#f44336' }
  ];

  const handleSave = async () => {
    if (!vocabularyData.word.trim() || !vocabularyData.meaning.trim()) {
      alert('Vui lòng nhập từ vựng và nghĩa');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...vocabularyData,
        startPosition: textPosition.start,
        endPosition: textPosition.end
      };

      await onSave(dataToSave);
      onClose();
    } catch (error) {
      alert('Lỗi khi thêm từ vựng: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            ✨ Thêm từ vựng quan trọng
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="space-y-4">
          {/* Selected text display */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-gray-600 mb-1">Văn bản đã chọn:</p>
            <p className="font-medium text-gray-800">"{selectedText}"</p>
          </div>

          {/* Word input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ vựng *
            </label>
            <input
              type="text"
              value={vocabularyData.word}
              onChange={(e) => setVocabularyData({...vocabularyData, word: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập từ vựng..."
            />
          </div>

          {/* Phonetic input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phiên âm
            </label>
            <input
              type="text"
              value={vocabularyData.phonetic}
              onChange={(e) => setVocabularyData({...vocabularyData, phonetic: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/ˈeksəmpəl/"
            />
          </div>

          {/* Meaning input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nghĩa *
            </label>
            <textarea
              value={vocabularyData.meaning}
              onChange={(e) => setVocabularyData({...vocabularyData, meaning: e.target.value})}
              rows="3"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập nghĩa của từ..."
            />
          </div>

          {/* Example sentence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Câu ví dụ
            </label>
            <textarea
              value={vocabularyData.exampleSentence}
              onChange={(e) => setVocabularyData({...vocabularyData, exampleSentence: e.target.value})}
              rows="2"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập câu ví dụ..."
            />
          </div>

          {/* Color selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Màu highlight
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setVocabularyData({...vocabularyData, highlightColor: color.value})}
                  className={`w-8 h-8 rounded-full border-2 ${
                    vocabularyData.highlightColor === color.value 
                      ? 'border-gray-800' 
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu từ vựng'}
          </button>
        </div>
      </div>
    </div>
  );
}