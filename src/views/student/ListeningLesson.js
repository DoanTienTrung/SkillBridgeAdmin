import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import lessonService from '../../services/lessonService';
import AudioPlayer from '../../components/Student/AudioPlayer/AudioPlayer';
import VocabularyLookupModal from '../../components/Student/VocabularyLookupModal';

export default function ListeningLesson() {
  const { id } = useParams();
  const history = useHistory();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vocabulary modal state
  const [selectedWord, setSelectedWord] = useState('');
  const [showVocabularyModal, setShowVocabularyModal] = useState(false);

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError(null);

      // Thử dùng student API trước
      let response;
      try {
        response = await lessonService.getStudentLessonById(id, 'listening');
      } catch (studentApiError) {
        // Fallback về API thường
        response = await lessonService.getLessonById(id, 'listening');
      }

      if (response.success && response.data) {
        setLesson(response.data);
      } else {
        throw new Error('Không thể tải bài học');
      }
    } catch (error) {
      console.error('Error fetching lesson: - ListeningLesson.js:42', error);
      setError('Không thể tải bài học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
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
      lessonType: 'LISTENING',
      lessonTitle: lesson.title,
      lessonData: lesson
    });
  };

  const handleWordClick = (word) => {
    console.log('Word clicked: - ListeningLesson.js:78', word);
    setSelectedWord(word);
    setShowVocabularyModal(true);
  };

  const handleSaveVocabulary = async (vocabularyData) => {
    try {
      // TODO: Implement actual save to user vocabulary
      console.log('Saving vocabulary: - ListeningLesson.js:86', vocabularyData);
      // Show success message
      alert('Từ vựng đã được lưu!');
    } catch (error) {
      console.error('Error saving vocabulary: - ListeningLesson.js:90', error);
      alert('Có lỗi khi lưu từ vựng. Vui lòng thử lại.');
      throw error;
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

        

        {/* ==================== HEADER ==================== */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            {/* Multiple Back Options */}
            <div className="flex items-center mr-4 space-x-2">
              {/* Primary: Back to Lessons List */}
              <button
                onClick={handleBackToLessons}
                className="p-2 rounded-lg bg-orange-100 hover:bg-orange-200 transition-colors group"
                title="Về danh sách bài học"
              >
                <i className="fas fa-list text-orange-600 group-hover:text-orange-700"></i>
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
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">
                  <i className="fas fa-headphones mr-1"></i>
                  Listening
                </span>
                {lesson.category && (
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {lesson.category.name || lesson.categoryName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Duration Display */}
          {lesson.durationSeconds && (
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {Math.floor(lesson.durationSeconds / 60)}:{(lesson.durationSeconds % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-600">Thời lượng</div>
              </div>
            </div>
          )}
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

          {/* Audio Player */}
          {lesson.audioUrl && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                <i className="fas fa-play-circle mr-2 text-orange-600"></i>
                Audio bài nghe
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg border">
                <AudioPlayer audioUrl={lesson.audioUrl} />
              </div>
            </div>
          )}

          {/* Transcript */}
          {lesson.transcript && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                <i className="fas fa-file-text mr-2 text-gray-600"></i>
                Transcript
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg border">
                <div
                  className="text-gray-800 leading-relaxed whitespace-pre-wrap select-text cursor-text"
                  onClick={(e) => {
                    if (e.target.tagName === 'SPAN') {
                      handleWordClick(e.target.textContent);
                    }
                  }}
                >
                  {lesson.transcript.split(' ').map((word, index) => (
                    <span
                      key={index}
                      className="hover:bg-yellow-200 hover:cursor-pointer rounded px-1 transition-colors"
                      onClick={() => handleWordClick(word)}
                    >
                      {word}{' '}
                    </span>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  💡 <strong>Gợi ý:</strong> Click vào từ bất kỳ để tra cứu nghĩa và lưu vào từ vựng cá nhân
                </div>
              </div>
            </div>
          )}

          {/* Listening Stats */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {lesson.durationSeconds ? Math.ceil(lesson.durationSeconds / 60) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Phút</div>
            </div>

            <div className="flex-1 bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {lesson.transcript ? lesson.transcript.split(' ').length : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Từ</div>
            </div>

            <div className="flex-1 bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {lesson.level || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Cấp độ</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Làm bài tập */}
            <button
              onClick={handleStartQuiz}
              className="bg-orange-500 hover:bg-orange-600 text-white  py-3 px-6 rounded-lg shadow-md flex items-center transition-all transform hover:scale-105"
            >
              <i className="fas fa-question-circle mr-2"></i>
              Làm bài tập
            </button>

            {/* Phát lại audio */}
            <button
              onClick={() => {
                const audioPlayer = document.querySelector('audio');
                if (audioPlayer) {
                  audioPlayer.currentTime = 0;
                  audioPlayer.play();
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-black  py-3 px-6 rounded-lg shadow-md flex items-center transition-all transform hover:scale-105"
            >
              <i className="fas fa-redo mr-2"></i>
              Phát lại
            </button>

            {/* Download audio */}
            {lesson.audioUrl && (
              <a
                href={lesson.audioUrl}
                download
                className="bg-green-500 hover:bg-green-600 text-black  py-3 px-6 rounded-lg shadow-md flex items-center transition-all transform hover:scale-105"
              >
                <i className="fas fa-download mr-2"></i>
                Tải audio
              </a>
            )}
          </div>

          {/* Quick Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={handleBackToLessons}
              className="flex items-center text-orange-600 hover:text-orange-700 font-medium"
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
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
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

      {/* Vocabulary Modal */}
      {showVocabularyModal && (
        <VocabularyLookupModal
          word={selectedWord}
          onClose={() => setShowVocabularyModal(false)}
          onSave={handleSaveVocabulary}
        />
      )}
    </div>
  );
}