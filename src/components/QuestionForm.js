import React, { useState, useEffect } from 'react';

export default function QuestionForm({ question, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'MULTIPLE_CHOICE',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explanation: '',
    points: 1
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Initialize form data when question prop changes
  useEffect(() => {
    if (question && question.id) {
      // Editing existing question
      setFormData({
        questionText: question.questionText || '',
        questionType: question.questionType || 'MULTIPLE_CHOICE',
        optionA: question.optionA || '',
        optionB: question.optionB || '',
        optionC: question.optionC || '',
        optionD: question.optionD || '',
        correctAnswer: question.correctAnswer || 'A',
        explanation: question.explanation || '',
        points: question.points || 1
      });
    } else {
      // Creating new question - reset form
      setFormData({
        questionText: '',
        questionType: 'MULTIPLE_CHOICE',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        explanation: '',
        points: 1
      });
    }
    setErrors({});
  }, [question]);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.questionText.trim()) {
      newErrors.questionText = 'Nội dung câu hỏi không được để trống';
    }

    if (formData.questionType === 'MULTIPLE_CHOICE') {
      const options = ['optionA', 'optionB', 'optionC', 'optionD'];
      options.forEach((option, index) => {
        if (!formData[option].trim()) {
          newErrors[option] = `Lựa chọn ${String.fromCharCode(65 + index)} không được để trống`;
        }
      });

      if (!['A', 'B', 'C', 'D'].includes(formData.correctAnswer)) {
        newErrors.correctAnswer = 'Vui lòng chọn đáp án đúng';
      }
    }

    if (formData.questionType === 'TRUE_FALSE') {
      if (!['TRUE', 'FALSE'].includes(formData.correctAnswer)) {
        newErrors.correctAnswer = 'Vui lòng chọn đáp án đúng cho câu hỏi Đúng/Sai';
      }
    }

    if (formData.points < 0 || formData.points > 10) {
      newErrors.points = 'Điểm số phải từ 0 đến 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      if (question && question.id) {
        // Update existing question
        await onSave(question.id, formData);
      } else {
        // Create new question
        await onSave(formData);
      }
      
      // onSave should handle closing the modal and refreshing data
    } catch (error) {
      console.error('Error saving question:', error);
      setErrors({ general: error.message || 'Lỗi khi lưu câu hỏi' });
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      questionText: '',
      questionType: 'MULTIPLE_CHOICE',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: '',
      points: 1
    });
    setErrors({});
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {question && question.id ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          {/* Question Text */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nội dung câu hỏi *
            </label>
            <textarea
              value={formData.questionText}
              onChange={(e) => handleChange('questionText', e.target.value)}
              rows="3"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.questionText ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập nội dung câu hỏi..."
            />
            {errors.questionText && (
              <p className="text-red-500 text-xs mt-1">{errors.questionText}</p>
            )}
          </div>

          {/* Question Type */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Loại câu hỏi
            </label>
            <select
              value={formData.questionType}
              onChange={(e) => handleChange('questionType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MULTIPLE_CHOICE">Trắc nghiệm (A, B, C, D)</option>
              <option value="TRUE_FALSE">Đúng/Sai</option>
            </select>
          </div>

          {/* Multiple Choice Options */}
          {formData.questionType === 'MULTIPLE_CHOICE' && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-4">
                Các lựa chọn *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D'].map((letter, index) => {
                  const fieldName = `option${letter}`;
                  return (
                    <div key={letter}>
                      <label className="block text-gray-600 text-sm mb-2">
                        Lựa chọn {letter}
                        {formData.correctAnswer === letter && (
                          <span className="ml-2 text-green-600 font-semibold">
                            ✓ Đáp án đúng
                          </span>
                        )}
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={formData[fieldName]}
                          onChange={(e) => handleChange(fieldName, e.target.value)}
                          className={`flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[fieldName] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder={`Nhập lựa chọn ${letter}...`}
                        />
                        <button
                          type="button"
                          onClick={() => handleChange('correctAnswer', letter)}
                          className={`px-3 py-2 border-t border-r border-b rounded-r-lg font-medium transition-colors ${
                            formData.correctAnswer === letter
                              ? 'bg-green-500 text-white border-green-500'
                              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-green-100'
                          }`}
                          title="Chọn làm đáp án đúng"
                        >
                          {letter}
                        </button>
                      </div>
                      {errors[fieldName] && (
                        <p className="text-red-500 text-xs mt-1">{errors[fieldName]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* True/False Options */}
          {formData.questionType === 'TRUE_FALSE' && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Đáp án đúng *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value="TRUE"
                    checked={formData.correctAnswer === 'TRUE'}
                    onChange={(e) => handleChange('correctAnswer', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Đúng</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value="FALSE"
                    checked={formData.correctAnswer === 'FALSE'}
                    onChange={(e) => handleChange('correctAnswer', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Sai</span>
                </label>
              </div>
              {errors.correctAnswer && (
                <p className="text-red-500 text-xs mt-1">{errors.correctAnswer}</p>
              )}
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Giải thích (tùy chọn)
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => handleChange('explanation', e.target.value)}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Giải thích tại sao đáp án này đúng..."
            />
          </div>

          {/* Points */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Điểm số
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={formData.points}
              onChange={(e) => handleChange('points', parseFloat(e.target.value) || 1)}
              className={`w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.points ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.points && (
              <p className="text-red-500 text-xs mt-1">{errors.points}</p>
            )}
          </div>
        </form>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
          >
            {saving && <i className="fas fa-spinner fa-spin mr-2"></i>}
            {saving ? 'Đang lưu...' : (question && question.id ? 'Cập nhật' : 'Tạo câu hỏi')}
          </button>
        </div>
      </div>
    </div>
  );
}