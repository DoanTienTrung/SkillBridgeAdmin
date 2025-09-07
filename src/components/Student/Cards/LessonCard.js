import React from 'react';
import { useHistory } from 'react-router-dom';

export default function LessonCard({ lesson, progress = null }) {
  const history = useHistory();

  const handleStartLesson = () => {
    // Determine lesson type và navigate với state
    if (lesson.type === 'LISTENING' || lesson.type === 'listening') {
      history.push(`/student/listening/${lesson.id}`, {
        lessonType: 'LISTENING',
        lessonData: lesson
      });
    } else {
      history.push(`/student/reading/${lesson.id}`, {
        lessonType: 'READING',
        lessonData: lesson
      });
    }
  };

  const handleStartQuiz = (e) => {
    e.stopPropagation(); // Prevent card click

    // Navigate directly to quiz với lesson type
    const lessonType = (lesson.type === 'LISTENING' || lesson.type === 'listening')
      ? 'LISTENING'
      : 'READING';

    history.push(`/student/quiz/${lesson.id}`, {
      lessonType,
      lessonTitle: lesson.title,
      lessonData: lesson
    });
  };

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case 'A2': return 'bg-green-100 text-green-800';
      case 'B1': return 'bg-blue-100 text-blue-800';
      case 'B2': return 'bg-purple-100 text-purple-800';
      case 'C1': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type) => {
    return (type === 'LISTENING' || type === 'listening')
      ? 'bg-orange-100 text-orange-800'
      : 'bg-indigo-100 text-indigo-800';
  };

  const renderStars = (difficulty) => {
    const diff = difficulty || 3; // Default difficulty
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < diff ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  const getLessonTypeIcon = (type) => {
    return (type === 'LISTENING' || type === 'listening') ? '🎧' : '📖';
  };

  const formatDuration = (lesson) => {
    if (lesson.durationMinutes) {
      return `${lesson.durationMinutes} phút`;
    }
    if (lesson.durationSeconds) {
      return `${Math.ceil(lesson.durationSeconds / 60)} phút`;
    }
    // Estimate duration based on content
    if (lesson.content && lesson.type !== 'LISTENING') {
      const words = lesson.content.trim().split(/\s+/).length;
      const estimatedMinutes = Math.ceil(words / 250); // 250 words per minute reading speed
      return `~${estimatedMinutes} phút`;
    }
    return '15 phút'; // Default
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Thumbnail */}
      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center relative overflow-hidden">
        <div className="text-white text-4xl z-10">
          {getLessonTypeIcon(lesson.type)}
        </div>
        {/* Overlay effect on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>

        {/* Quick Quiz Button (appears on hover) */}
        <button
          onClick={handleStartQuiz}
          className="absolute top-2 right-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
          title="Làm bài tập ngay"
        >
          <i className="fas fa-play text-sm"></i>
        </button>
      </div>

      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {lesson.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {lesson.description}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(lesson.level)}`}>
            {lesson.level}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(lesson.type)}`}>
            {(lesson.type === 'LISTENING' || lesson.type === 'listening') ? 'Nghe' : 'Đọc'}
          </span>
          {(lesson.categoryName || lesson.category?.name) && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {lesson.categoryName || lesson.category.name}
            </span>
          )}
        </div>

        {/* Rating and Duration */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center" title="Độ khó">
            {renderStars(lesson.difficulty)}
          </div>
          <span className="text-sm text-gray-500" title="Thời gian ước tính">
            <i className="fas fa-clock mr-1"></i>
            {formatDuration(lesson)}
          </span>
        </div>

        {/* Progress Bar (if exists) */}
        {progress && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Tiến độ</span>
              <span>{Math.round(progress.completionPercentage || 0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.completionPercentage || 0}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Performance indicator (if completed) */}
        {progress && progress.lastScore && (
          <div className="mb-4 p-2 bg-gray-50 rounded text-center">
            <span className="text-xs text-gray-600">Lần cuối: </span>
            <span className={`text-sm font-medium ${progress.lastScore >= 80 ? 'text-green-600' :
              progress.lastScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
              {Math.round(progress.lastScore)}%
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Main Action Button */}
          <div className="text-center">
            <button
              onClick={handleStartLesson}
              className="bg-blue-500 hover:bg-blue-600 text-black text-lg py-2 px-4 rounded-lg border border-black shadow-md transition-all duration-200 transform hover:scale-105 mx-auto"
            >
              {progress && progress.completionPercentage > 0 ? (
                <>Tiếp tục học</>
              ) : (
                <>Bắt đầu học</>
              )}
            </button>
          </div>




          {/* Quick Actions */}
          <div className="flex space-x-2">
            <button
              onClick={handleStartQuiz}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              <i className="fas fa-question-circle mr-1"></i>
              Quiz
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement bookmark functionality
                alert('Chức năng bookmark sẽ được phát triển sau');
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              <i className="fas fa-bookmark mr-1"></i>
              Lưu
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex justify-between items-center">
            <span>
              {lesson.createdAt
                ? `Tạo: ${new Date(lesson.createdAt).toLocaleDateString('vi-VN')}`
                : 'Bài học mới'
              }
            </span>
            {lesson.questionCount && (
              <span title="Số câu hỏi">
                <i className="fas fa-question mr-1"></i>
                {lesson.questionCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}