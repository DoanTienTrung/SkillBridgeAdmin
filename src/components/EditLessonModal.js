// Tạo file components/EditLessonModal.js
import React, { useState, useEffect } from 'react';
import lessonService from '../services/lessonService';

export default function EditLessonModal({ lesson, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'A2',
    categoryId: null,
    transcript: '',
    durationSeconds: 0
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load data on mount
  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title || '',
        description: lesson.description || '',
        level: lesson.level || 'A2',
        categoryId: lesson.categoryId || null,
        transcript: lesson.transcript || '',
        durationSeconds: lesson.durationSeconds || 0
      });
    }
    
    loadCategories();
  }, [lesson]);

  const loadCategories = async () => {
    try {
      const response = await lessonService.getCategories();
      setCategories(response || []);
    } catch (error) {
      console.error('Failed to load categories: - EditLessonModal.js:40', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Tiêu đề không được để trống');
      return;
    }

    if (!formData.categoryId) {
      setError('Vui lòng chọn thể loại');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await lessonService.updateLesson(lesson.id, formData);
      
      alert('Cập nhật bài học thành công!');
      onSuccess();
      
    } catch (error) {
      console.error('Failed to update lesson: - EditLessonModal.js:75', error);
      setError('Không thể cập nhật bài học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blueGray-700">
            Chỉnh sửa bài học
          </h2>
          <button
            onClick={onClose}
            className="text-blueGray-500 hover:text-blueGray-700"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label className="block text-blueGray-600 text-sm font-bold mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="border border-blueGray-300 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
              placeholder="Nhập tiêu đề bài học"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-blueGray-600 text-sm font-bold mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="border border-blueGray-300 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
              placeholder="Mô tả ngắn về bài học"
            />
          </div>

          {/* Level and Category */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-blueGray-600 text-sm font-bold mb-2">
                Cấp độ *
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="border border-blueGray-300 px-3 py-2 text-blueGray-600 bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
                required
              >
                <option value="A2">A2 - Cơ bản</option>
                <option value="B1">B1 - Trung cấp thấp</option>
                <option value="B2">B2 - Trung cấp cao</option>
                <option value="C1">C1 - Nâng cao</option>
              </select>
            </div>

            <div>
              <label className="block text-blueGray-600 text-sm font-bold mb-2">
                Thể loại *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId || ''}
                onChange={handleInputChange}
                className="border border-blueGray-300 px-3 py-2 text-blueGray-600 bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
                required
              >
                <option value="">Chọn thể loại</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration */}
          <div className="mb-4">
            <label className="block text-blueGray-600 text-sm font-bold mb-2">
              Thời lượng (giây)
            </label>
            <input
              type="number"
              name="durationSeconds"
              value={formData.durationSeconds}
              onChange={handleInputChange}
              min="0"
              className="border border-blueGray-300 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
              placeholder="0"
            />
          </div>

          {/* Transcript */}
          <div className="mb-6">
            <label className="block text-blueGray-600 text-sm font-bold mb-2">
              Nội dung transcript
            </label>
            <textarea
              name="transcript"
              value={formData.transcript}
              onChange={handleInputChange}
              rows={6}
              className="border border-blueGray-300 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
              placeholder="Nhập nội dung transcript..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-blueGray-500 text-white px-4 py-2 rounded text-sm hover:bg-blueGray-600"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}