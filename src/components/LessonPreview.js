import React, { useState, useRef } from 'react';
import TextHighlighter from './TextHighlighter';

export default function LessonPreview({ 
  previewData, 
  onClose, 
  onPublish, 
  onBackToEdit 
}) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const audioRef = useRef();

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  if (!previewData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-500">Đang tải preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">{previewData.title}</h1>
            <div className="flex items-center gap-4 text-blue-100 text-sm">
              <span>🎯 {previewData.level}</span>
              <span>📂 {previewData.categoryName}</span>
              <span>⏱️ {Math.floor(previewData.durationSeconds / 60)}:{String(previewData.durationSeconds % 60).padStart(2, '0')}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                previewData.status === 'Bản nháp' ? 'bg-yellow-500' : 'bg-green-500'
              }`}>
                {previewData.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        {previewData.description && (
          <p className="mt-4 text-blue-100">{previewData.description}</p>
        )}
      </div>

      <div className="p-6 space-y-8">
        {/* Audio Player */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            🎧 Audio Lesson
          </h2>
          <audio
            ref={audioRef}
            controls
            className="w-full"
            src={`http://localhost:8080${previewData.audioUrl}`}
          >
            Trình duyệt không hỗ trợ audio player.
          </audio>
        </div>

        {/* Questions */}
        {previewData.questions && previewData.questions.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">
              ❓ Questions ({previewData.questions.length})
            </h2>
            
            {previewData.questions.map((question, index) => (
              <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-800 mb-4">
                  {index + 1}. {question.questionText}
                </h3>
                
                <div className="space-y-3">
                  {[question.optionA, question.optionB, question.optionC, question.optionD]
                    .filter(option => option)
                    .map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={optionIndex}
                          checked={selectedAnswers[question.id] === optionIndex}
                          onChange={() => handleAnswerSelect(question.id, optionIndex)}
                          className="text-blue-600"
                        />
                        <span className="text-gray-700">
                          {String.fromCharCode(65 + optionIndex)}. {option}
                        </span>
                      </label>
                    ))}
                </div>
                
                {question.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Giải thích:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Transcript with Vocabulary */}
        {previewData.transcript && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              📝 Transcript
              {previewData.vocabularies && previewData.vocabularies.length > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({previewData.vocabularies.length} từ vựng được đánh dấu)
                </span>
              )}
            </h2>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <TextHighlighter
                text={previewData.transcript}
                vocabularies={previewData.vocabularies}
                readOnly={true}
              />
            </div>
          </div>
        )}

        {/* Vocabulary List */}
        {previewData.vocabularies && previewData.vocabularies.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              📚 Key Vocabulary ({previewData.vocabularies.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previewData.vocabularies.map((vocab) => (
                <div key={vocab.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: vocab.highlightColor }}
                    ></span>
                    <span className="font-semibold text-gray-800">{vocab.word}</span>
                    {vocab.phonetic && (
                      <span className="text-sm text-gray-500">{vocab.phonetic}</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{vocab.meaning}</p>
                  {vocab.exampleSentence && (
                    <p className="text-xs text-gray-500 italic">
                      "{vocab.exampleSentence}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-between">
        <button
          onClick={onBackToEdit}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          <i className="fas fa-arrow-left"></i>
          Quay lại chỉnh sửa
        </button>
        
        <div className="flex gap-3">
          {previewData.status === 'Bản nháp' && (
            <button
              onClick={onPublish}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <i className="fas fa-check"></i>
              Xuất bản bài học
            </button>
          )}
          
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            <i className="fas fa-times"></i>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
