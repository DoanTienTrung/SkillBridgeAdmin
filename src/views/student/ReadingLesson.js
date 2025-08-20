import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import lessonService from '../../services/lessonService';

export default function ReadingLesson() {
  const { id } = useParams();
  const history = useHistory();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await lessonService.getLessonById(id, 'reading');
      setLesson(response.data);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      setError('Không thể tải bài học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleFontSizeChange = (direction) => {
    setFontSize(prev => {
      if (direction === 'increase' && prev < 24) return prev + 2;
      if (direction === 'decrease' && prev > 12) return prev - 2;
      return prev;
    });
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

  if (error) {
    return (
      <div className="flex-1 bg-blueGray-50 p-4">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button
            onClick={() => history.goBack()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-blueGray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => history.goBack()}
              className="mr-4 p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-arrow-left text-gray-600"></i>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{lesson?.title}</h1>
              <div className="flex items-center mt-1">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">
                  {lesson?.level}
                </span>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Reading
                </span>
              </div>
            </div>
          </div>

          {/* Font Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Cỡ chữ:</span>
            <button
              onClick={() => handleFontSizeChange('decrease')}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              disabled={fontSize <= 12}
            >
              <span className="font-bold text-lg">A-</span>
            </button>
            <span className="px-2 text-sm text-gray-600">{fontSize}px</span>
            <button
              onClick={() => handleFontSizeChange('increase')}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              disabled={fontSize >= 24}
            >
              <span className="font-bold text-lg">A+</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Description */}
          {lesson?.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Mô tả</h2>
              <p className="text-gray-700">{lesson.description}</p>
            </div>
          )}

          {/* Reading Content */}
          {lesson?.content && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Nội dung bài đọc</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div
                  className="text-gray-800 leading-relaxed whitespace-pre-wrap select-text"
                  style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                >
                  {lesson.content}
                </div>
              </div>
            </div>
          )}

          {/* Reading Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">250</div>
              <div className="text-sm text-gray-600">WPM (từ/phút)</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">5:30</div>
              <div className="text-sm text-gray-600">Thời gian đọc</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">1,250</div>
              <div className="text-sm text-gray-600">Tổng từ</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {/* Làm bài tập */}
            <button
              onClick={() => history.push(`/student/quiz/${lesson.id}`)}
              className="bg-blue-500 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded-lg shadow-md flex items-center transition-transform transform hover:scale-105"
            >
              <i className="fas fa-question-circle mr-2"></i>
              Làm bài tập
            </button>

            {/* Lưu từ vựng */}
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded-lg shadow-md flex items-center transition-transform transform hover:scale-105"
            >
              <i className="fas fa-highlighter mr-2"></i>
              Lưu từ vựng
            </button>

            {/* Highlight */}
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-black shadow-md font-semibold py-2 px-6 rounded-xl transition-transform transform hover:scale-105"
            >
              <i className="fas fa-highlighter mr-2"></i>
              Highlight text
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
