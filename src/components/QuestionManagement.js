import React, { useState, useEffect, useCallback } from 'react';
import questionService from '../services/questionService';
import QuestionForm from './QuestionForm'; // Thêm import QuestionForm

export default function QuestionManagement({ lessonId, lessonType, onQuestionsChange }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);

  const loadQuestions = useCallback(async () => {
    if (!lessonId) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await questionService.getQuestionsByLesson(lessonId, lessonType);
      setQuestions(response.data || []);
    } catch (error) {
      console.error('Failed to load questions: - QuestionManagement.js:20', error);
      setError('Không thể tải danh sách câu hỏi');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [lessonId, lessonType]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleCreateQuestion = async (questionData) => {
    try {
      const questionCreateDto = {
        ...questionData,
        lessonId,
        lessonType
      };
      
      await questionService.createQuestion(questionCreateDto);
      await loadQuestions();
      onQuestionsChange && onQuestionsChange();
    } catch (error) {
      setError('Không thể tạo câu hỏi');
    }
  };

  const handleUpdateQuestion = async (id, questionData) => {
    try {
      await questionService.updateQuestion(id, questionData);
      await loadQuestions();
      setEditingQuestion(null);
      onQuestionsChange && onQuestionsChange();
    } catch (error) {
      setError('Không thể cập nhật câu hỏi');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      try {
        await questionService.deleteQuestion(id);
        await loadQuestions();
        onQuestionsChange && onQuestionsChange();
      } catch (error) {
        setError('Không thể xóa câu hỏi');
      }
    }
  };

  if (!lessonId) {
    return <div className="text-gray-500">Vui lòng chọn bài học để quản lý câu hỏi</div>;
  }
  
  if (loading) return <div>Đang tải câu hỏi...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Quản lý câu hỏi ({questions.length})</h3>
        <button
          onClick={() => setEditingQuestion({})}
          className="bg-blue-500 text-black px-4 py-2 rounded hover:bg-blue-600"
        >
          <i className="fas fa-plus mr-2"></i>
          Thêm câu hỏi
        </button>
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium">Câu {index + 1}: {question.questionText}</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingQuestion(question)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Loại:</strong> {question.questionType}</p>
              <p><strong>Điểm:</strong> {question.points}</p>
              <p><strong>Đáp án đúng:</strong> {question.correctAnswer}</p>
              {question.explanation && (
                <p><strong>Giải thích:</strong> {question.explanation}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Question Form Modal */}
      {editingQuestion !== null && (
        <QuestionForm
          question={editingQuestion}
          onSave={editingQuestion.id ? handleUpdateQuestion : handleCreateQuestion}
          onCancel={() => setEditingQuestion(null)}
        />
      )}
    </div>
  );
}