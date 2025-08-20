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
      const response = await lessonService.getLessonById(id, 'listening');
      setLesson(response.data);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      setError('Không thể tải bài học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleWordClick = (word) => {
    console.log('Word clicked:', word);
    setSelectedWord(word);
    setShowVocabularyModal(true);
  };

  const handleSaveVocabulary = async (vocabularyData) => {
    try {
      // TODO: Implement actual save to user vocabulary
      console.log('Saving vocabulary:', vocabularyData);
      // Show success message
    } catch (error) {
      console.error('Error saving vocabulary:', error);
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
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Listening
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Player */}
        {lesson?.audioUrl ? (
          <AudioPlayer 
            audioUrl={lesson.audioUrl}
            transcript={lesson.transcript}
            onWordClick={handleWordClick}
            className="mb-8"
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="text-center text-gray-500">
              <i className="fas fa-volume-up text-4xl mb-4"></i>
              <p>Chưa có file audio cho bài học này</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">

          {/* Description */}
          {lesson?.description && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Mô tả</h2>
              <p className="text-gray-700">{lesson.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button 
              onClick={() => history.push(`/student/quiz/${lesson.id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              <i className="fas fa-question-circle mr-2"></i>
              Làm bài tập
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
              <i className="fas fa-bookmark mr-2"></i>
              Lưu từ vựng
            </button>
          </div>
        </div>
      </div>
      
      {/* Vocabulary Lookup Modal */}
      <VocabularyLookupModal
        word={selectedWord}
        isOpen={showVocabularyModal}
        onClose={() => setShowVocabularyModal(false)}
        onSave={handleSaveVocabulary}
      />
    </div>
  );
}
