import React from 'react';
import { useHistory } from 'react-router-dom';

export default function LessonCard({ lesson, progress = null }) {
  const history = useHistory();

  const handleStartLesson = () => {
    if (lesson.type === 'LISTENING') {
      history.push(`/student/listening/${lesson.id}`);
    } else {
      history.push(`/student/reading/${lesson.id}`);
    }
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
    return type === 'LISTENING'
      ? 'bg-orange-100 text-orange-800'
      : 'bg-indigo-100 text-indigo-800';
  };

  const renderStars = (difficulty) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < difficulty ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Thumbnail */}
      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
        <div className="text-white text-4xl">
          {lesson.type === 'LISTENING' ? '🎧' : '📖'}
        </div>
      </div>

      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
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
            {lesson.type === 'LISTENING' ? 'Nghe' : 'Đọc'}
          </span>
          {lesson.categoryName && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {lesson.categoryName}
            </span>
          )}
        </div>

        {/* Rating and Duration */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {renderStars(lesson.difficulty || 3)}
          </div>
          <span className="text-sm text-gray-500">
            {lesson.durationMinutes || lesson.durationSeconds
              ? `${Math.ceil((lesson.durationMinutes || lesson.durationSeconds / 60))} phút`
              : '15 phút'
            }
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

        {/* Action Button */}
        <button
          onClick={handleStartLesson}
          className="w-full bg-blue-600 hover:bg-blue-700 
             text-black font-bold text-lg 
             py-3 px-6 
             rounded-lg shadow-md 
             transition duration-200"
        >
          {progress && progress.completionPercentage > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
        </button>

      </div>
    </div>
  );
}
