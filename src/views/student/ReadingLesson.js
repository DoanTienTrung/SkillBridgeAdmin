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
  const [readingStats, setReadingStats] = useState({
    wordsPerMinute: 250,
    estimatedTime: 0,
    totalWords: 0
  });

  useEffect(() => {
    fetchLesson();
  }, [id]);

  useEffect(() => {
    if (lesson && lesson.content) {
      calculateReadingStats(lesson.content);
    }
  }, [lesson]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sử dụng API endpoint đúng cho student
      const response = await lessonService.getStudentLessonById(id, 'reading');
      
      if (response.success && response.data) {
        setLesson(response.data);
      } else {
        // Fallback về API thường nếu student API fail
        const fallbackResponse = await lessonService.getLessonById(id, 'reading');
        if (fallbackResponse.success && fallbackResponse.data) {
          setLesson(fallbackResponse.data);
        } else {
          throw new Error('Không thể tải bài học');
        }
      }
    } catch (error) {
      console.error('Error fetching lesson: - ReadingLesson.js:48', error);
      setError('Không thể tải bài học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const calculateReadingStats = (content) => {
    if (!content) return;
    
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    const totalWords = words.length;
    const wordsPerMinute = 250; // Average reading speed
    const estimatedTime = Math.ceil(totalWords / wordsPerMinute);
    
    setReadingStats({
      wordsPerMinute,
      estimatedTime,
      totalWords
    });
  };

  const handleFontSizeChange = (direction) => {
    setFontSize(prev => {
      if (direction === 'increase' && prev < 24) return prev + 2;
      if (direction === 'decrease' && prev > 12) return prev - 2;
      return prev;
    });
  };

  // ==================== NAVIGATION HANDLERS ====================
  
  const handleBackToLessons = () => {
    // Navigate trực tiếp đến trang danh sách bài học
    history.push('/student/lessons');
  };

  const handleGoToDashboard = () => {
    // Navigate đến dashboard
    history.push('/student/dashboard');
  };

  const handleBrowserBack = () => {
    // Sử dụng browser back nếu user muốn
    history.goBack();
  };

  // ==================== LESSON ACTIONS ====================

  const handleStartQuiz = () => {
    // Truyền lesson type thông qua state
    history.push(`/student/quiz/${lesson.id}`, {
      lessonType: 'READING',
      lessonTitle: lesson.title,
      lessonData: lesson
    });
  };

  const handleSaveVocabulary = () => {
    // TODO: Implement vocabulary saving functionality
    alert('Chức năng lưu từ vựng sẽ được phát triển sau');
  };

  const handleHighlightText = () => {
    // TODO: Implement text highlighting functionality
    alert('Chức năng highlight text sẽ được phát triển sau');
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
          <div className="space-x-4">
            <button
              onClick={() => fetchLesson()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Thử lại
            </button>
            <button
              onClick={handleBackToLessons}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Về danh sách bài học
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex-1 bg-blueGray-50 p-4">
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">Không tìm thấy bài học</div>
          <button
            onClick={handleBackToLessons}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Về danh sách bài học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-blueGray-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* ==================== BREADCRUMB NAVIGATION ==================== */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <button
              onClick={handleGoToDashboard}
              className="hover:text-blue-600 transition-colors"
            >
              <i className="fas fa-home mr-1"></i>
              Dashboard
            </button>
            <i className="fas fa-chevron-right mx-2 text-gray-400"></i>
            <button
              onClick={handleBackToLessons}
              className="hover:text-blue-600 transition-colors"
            >
              Bài học
            </button>
            <i className="fas fa-chevron-right mx-2 text-gray-400"></i>
            <span className="text-gray-900 font-medium">Bài đọc</span>
          </div>
        </div>

        {/* ==================== HEADER ==================== */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            {/* Multiple Back Options */}
            <div className="flex items-center mr-4 space-x-2">
              {/* Primary: Back to Lessons List */}
              <button
                onClick={handleBackToLessons}
                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors group"
                title="Về danh sách bài học"
              >
                <i className="fas fa-list text-blue-600 group-hover:text-blue-700"></i>
              </button>
              
              {/* Secondary: Browser Back */}
              <button
                onClick={handleBrowserBack}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors group"
                title="Quay lại trang trước"
              >
                <i className="fas fa-arrow-left text-gray-600 group-hover:text-gray-700"></i>
              </button>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
              <div className="flex items-center mt-1">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">
                  {lesson.level || 'N/A'}
                </span>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">
                  <i className="fas fa-book mr-1"></i>
                  Reading
                </span>
                {lesson.category && (
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {lesson.category.name || lesson.categoryName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Font Controls */}
          <div className="flex items-center space-x-2 bg-white rounded-lg p-2 shadow-sm">
            <span className="text-sm text-gray-600">Cỡ chữ:</span>
            <button
              onClick={() => handleFontSizeChange('decrease')}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              disabled={fontSize <= 12}
              title="Giảm cỡ chữ"
            >
              <span className="font-bold text-lg">A-</span>
            </button>
            <span className="px-2 text-sm text-gray-600 font-medium">{fontSize}px</span>
            <button
              onClick={() => handleFontSizeChange('increase')}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              disabled={fontSize >= 24}
              title="Tăng cỡ chữ"
            >
              <span className="font-bold text-lg">A+</span>
            </button>
          </div>
        </div>

        {/* ==================== CONTENT ==================== */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Description */}
          {lesson.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Mô tả</h2>
              <p className="text-gray-700 leading-relaxed">{lesson.description}</p>
            </div>
          )}

          {/* Reading Content */}
          {lesson.content && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Nội dung bài đọc</h2>
              <div className="bg-gray-50 p-6 rounded-lg border">
                <div
                  className="text-gray-800 leading-relaxed whitespace-pre-wrap select-text"
                  style={{ 
                    fontSize: `${fontSize}px`, 
                    lineHeight: fontSize <= 16 ? 1.6 : 1.5 
                  }}
                >
                  {lesson.content}
                </div>
              </div>
            </div>
          )}

          {/* Reading Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {readingStats.wordsPerMinute}
              </div>
              <div className="text-sm text-gray-600">WPM (từ/phút)</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {readingStats.estimatedTime}m
              </div>
              <div className="text-sm text-gray-600">Thời gian đọc</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {readingStats.totalWords.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Tổng từ</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Làm bài tập */}
            <button
              onClick={handleStartQuiz}
              className="bg-blue-500 hover:bg-blue-600 text-black font-semibold py-3 px-6 rounded-lg shadow-md flex items-center transition-all transform hover:scale-105"
            >
              <i className="fas fa-question-circle mr-2"></i>
              Làm bài tập
            </button>

            {/* Lưu từ vựng */}
            <button
              onClick={handleSaveVocabulary}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-6 rounded-lg shadow-md flex items-center transition-all transform hover:scale-105"
            >
              <i className="fas fa-bookmark mr-2"></i>
              Lưu từ vựng
            </button>

            {/* Highlight */}
            <button
              onClick={handleHighlightText}
              className="bg-yellow-400 hover:bg-yellow-500 text-black shadow-md font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
            >
              <i className="fas fa-highlighter mr-2"></i>
              Highlight text
            </button>

            {/* Print */}
            <button
              onClick={() => window.print()}
              className="bg-gray-500 hover:bg-gray-600 text-black font-semibold py-3 px-6 rounded-lg shadow-md flex items-center transition-all transform hover:scale-105"
            >
              <i className="fas fa-print mr-2"></i>
              In bài
            </button>
          </div>

          {/* Quick Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={handleBackToLessons}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Về danh sách bài học
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoToDashboard}
                className="text-gray-600 hover:text-gray-700"
              >
                <i className="fas fa-home mr-1"></i>
                Dashboard
              </button>
              <button
                onClick={handleStartQuiz}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Làm bài tập
              </button>
            </div>
          </div>

          {/* Additional Info */}
          {lesson.createdAt && (
            <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
              <p>Bài học được tạo: {new Date(lesson.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}