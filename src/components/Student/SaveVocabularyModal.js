import React, { useState, useEffect } from 'react';
import ModalWrapper from '../ModalWrapper';
import personalVocabularyService from '../../services/personalVocabularyService';

export default function SaveVocabularyModal({ 
  isOpen, 
  onClose, 
  selectedText = '', 
  onSaveSuccess 
}) {
  const [formData, setFormData] = useState({
    word: '',
    phonetic: '',
    meaning: '',
    exampleSentence: '',
    category: '',
    difficulty: '',
    partOfSpeech: '',
    synonyms: '',
    antonyms: '',
    notes: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    'Học tập', 'Công việc', 'Du lịch', 'Gia đình', 'Sức khỏe',
    'Thể thao', 'Công nghệ', 'Âm nhạc', 'Phim ảnh', 'Ẩm thực', 'Khác'
  ];

  const difficulties = [
    { value: 'EASY', label: 'Dễ' },
    { value: 'MEDIUM', label: 'Trung bình' },
    { value: 'HARD', label: 'Khó' }
  ];

  const partOfSpeechOptions = [
    { value: 'NOUN', label: 'Danh từ' },
    { value: 'VERB', label: 'Động từ' },
    { value: 'ADJECTIVE', label: 'Tính từ' },
    { value: 'ADVERB', label: 'Trạng từ' },
    { value: 'PRONOUN', label: 'Đại từ' },
    { value: 'PREPOSITION', label: 'Giới từ' },
    { value: 'CONJUNCTION', label: 'Liên từ' },
    { value: 'INTERJECTION', label: 'Thán từ' },
    { value: 'ARTICLE', label: 'Mạo từ' },
    { value: 'PHRASE', label: 'Cụm từ' }
  ];

  useEffect(() => {
    if (isOpen && selectedText) {
      setFormData(prev => ({
        ...prev,
        word: selectedText.trim()
      }));
    }
  }, [isOpen, selectedText]);
  
  // Close modal on Escape key and manage body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !saving) {
        handleClose();
      }
    };
    
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, saving]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.word.trim()) {
      newErrors.word = 'Từ vựng là bắt buộc';
    }
    
    if (!formData.meaning.trim()) {
      newErrors.meaning = 'Nghĩa là bắt buộc';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const vocabularyData = {
        ...formData,
        word: formData.word.trim(),
        meaning: formData.meaning.trim(),
        difficulty: formData.difficulty || null,
        partOfSpeech: formData.partOfSpeech || null
      };

      console.log('🚀 Saving vocabulary data:', vocabularyData);
      const result = await personalVocabularyService.saveWord(vocabularyData);
      console.log('✅ Save vocabulary result:', result);
      
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('❌ Error saving vocabulary:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi lưu từ vựng. Vui lòng thử lại.';
      
      if (error.response) {
        // Server responded with error status
        const serverError = error.response.data;
        if (serverError && serverError.message) {
          errorMessage = serverError.message;
        }
        
        if (error.response.status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (error.response.status === 403) {
          errorMessage = 'Bạn không có quyền thực hiện chức năng này.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (errorMessage.includes('đã có trong danh sách') || errorMessage.includes('already exists')) {
        setErrors({ word: 'Từ vựng đã có trong danh sách của bạn' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      word: '',
      phonetic: '',
      meaning: '',
      exampleSentence: '',
      category: '',
      difficulty: '',
      partOfSpeech: '',
      synonyms: '',
      antonyms: '',
      notes: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} preventClose={saving}>
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative mx-4"
        style={{
          maxWidth: '48rem',
          width: '100%',
          maxHeight: '90vh',
          margin: '0 1rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <i className="fas fa-book-open text-white" style={{ fontSize: '16px' }}></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Thông tin từ vựng</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            disabled={saving}
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Từ vựng */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ vựng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="word"
                value={formData.word}
                onChange={handleInputChange}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.word ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nhập từ vựng..."
              />
              {errors.word && <p className="text-red-500 text-xs mt-1">{errors.word}</p>}
            </div>

            {/* Phiên âm */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phiên âm
              </label>
              <input
                type="text"
                name="phonetic"
                value={formData.phonetic}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/prəˌnʌnsiˈeɪʃən/"
              />
            </div>

            {/* Nghĩa */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nghĩa <span className="text-red-500">*</span>
              </label>
              <textarea
                name="meaning"
                value={formData.meaning}
                onChange={handleInputChange}
                rows="3"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.meaning ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nhập nghĩa của từ..."
              />
              {errors.meaning && <p className="text-red-500 text-xs mt-1">{errors.meaning}</p>}
            </div>

            {/* Ví dụ */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ví dụ
              </label>
              <textarea
                name="exampleSentence"
                value={formData.exampleSentence}
                onChange={handleInputChange}
                rows="2"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập câu ví dụ sử dụng từ này..."
              />
            </div>

            {/* Danh mục */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn danh mục</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Độ khó */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Độ khó
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn độ khó</option>
                {difficulties.map(diff => (
                  <option key={diff.value} value={diff.value}>{diff.label}</option>
                ))}
              </select>
            </div>

            {/* Loại từ */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại từ
              </label>
              <select
                name="partOfSpeech"
                value={formData.partOfSpeech}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn loại từ</option>
                {partOfSpeechOptions.map(pos => (
                  <option key={pos.value} value={pos.value}>{pos.label}</option>
                ))}
              </select>
            </div>

            {/* Từ đồng nghĩa */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ đồng nghĩa
              </label>
              <input
                type="text"
                name="synonyms"
                value={formData.synonyms}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cách nhau bằng dấu phẩy"
              />
            </div>

            {/* Từ trái nghĩa */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ trái nghĩa
              </label>
              <input
                type="text"
                name="antonyms"
                value={formData.antonyms}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cách nhau bằng dấu phẩy"
              />
            </div>

            {/* Ghi chú */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Thêm ghi chú hoặc mẹo ghi nhớ..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleClose}
            disabled={saving}
            className="px-6 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-colors flex items-center font-medium"
            style={{
              borderWidth: '2px',
              borderColor: '#D1D5DB'
            }}
          >
            <i className="fas fa-times mr-2 text-gray-600" style={{ fontSize: '14px' }}></i>
            <span className="text-gray-700 font-medium">Hủy bỏ</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center shadow-lg font-medium"
            style={{
              backgroundColor: saving ? '#9CA3AF' : '#059669',
              color: 'white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span className="text-white font-medium">Đang lưu...</span>
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2 text-white" style={{ fontSize: '14px' }}></i>
                <span className="text-white font-medium">Lưu từ vựng</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
