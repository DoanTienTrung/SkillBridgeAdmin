import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import lessonService from '../../services/lessonService';

export default function QuizInterface() {
  const { lessonId } = useParams();
  const history = useHistory();
  
  // Quiz data
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Quiz state
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    fetchQuestions();
    setQuizStartTime(new Date());
  }, [lessonId]);

  // Update time spent
  useEffect(() => {
    if (quizStartTime && !quizCompleted) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((new Date() - quizStartTime) / 1000));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [quizStartTime, quizCompleted]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      // Determine lesson type from current URL or fetch lesson details
      const lessonType = window.location.pathname.includes('listening') ? 'listening' : 'reading';
      const response = await lessonService.getLessonQuestions(lessonId, lessonType);
      setQuestions(response.data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Không thể tải câu hỏi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, selectedAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedAnswer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(answers).length < questions.length) {
      const confirmed = window.confirm(
        `Bạn chưa trả lời ${questions.length - Object.keys(answers).length} câu hỏi. Bạn có chắc muốn nộp bài?`
      );
      if (!confirmed) return;
    }

    try {
      const submissionData = {
        lessonId: parseInt(lessonId),
        answers,
        timeSpent: Math.floor((new Date() - quizStartTime) / 1000)
      };

      const response = await lessonService.submitAnswers(submissionData);
      setResults(response.data);
      setQuizCompleted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const currentQuestion = questions[currentQuestionIndex];

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

  if (questions.length === 0) {
    return (
      <div className="flex-1 bg-blueGray-50 p-4">
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">Chưa có câu hỏi cho bài học này</div>
          <button 
            onClick={() => history.goBack()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Quay lại bài học
          </button>
        </div>
      </div>
    );
  }

  // Results Screen
  if (quizCompleted && results) {
    return (
      <div className="flex-1 bg-blueGray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-trophy text-6xl text-yellow-500 mb-4"></i>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hoàn thành bài tập!</h1>
              <p className="text-gray-600">Bạn đã hoàn thành bài tập thành công</p>
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">{results.score}/10</div>
                <div className="text-sm text-gray-600">Điểm số</div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {results.correctAnswers}/{results.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">Câu đúng</div>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">{formatTime(timeSpent)}</div>
                <div className="text-sm text-gray-600">Thời gian</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Làm lại
              </button>
              <button
                onClick={() => history.goBack()}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Quay lại bài học
              </button>
              <button
                onClick={() => history.push('/student/lessons')}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Bài học khác
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Interface
  return (
    <div className="flex-1 bg-blueGray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => history.goBack()}
                className="mr-4 p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <i className="fas fa-arrow-left text-gray-600"></i>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bài tập</h1>
                <p className="text-sm text-gray-600">
                  Câu {currentQuestionIndex + 1} / {questions.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <i className="fas fa-clock mr-1"></i>
                {formatTime(timeSpent)}
              </div>
              <div className="text-sm text-gray-600">
                Đã trả lời: {getAnsweredCount()}/{questions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {currentQuestion.questionText}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.questionType === 'MULTIPLE_CHOICE' ? (
                // Multiple Choice Options
                ['A', 'B', 'C', 'D'].map(option => {
                  const optionText = currentQuestion[`option${option}`];
                  if (!optionText) return null;
                  
                  const isSelected = answers[currentQuestion.id] === option;
                  
                  return (
                    <label
                      key={option}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(currentQuestion.id, option)}
                        className="mr-3"
                      />
                      <span className="font-medium mr-2">{option})</span>
                      <span>{optionText}</span>
                    </label>
                  );
                })
              ) : (
                // True/False Options
                ['TRUE', 'FALSE'].map(option => {
                  const isSelected = answers[currentQuestion.id] === option;
                  
                  return (
                    <label
                      key={option}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(currentQuestion.id, option)}
                        className="mr-3"
                      />
                      <span>{option === 'TRUE' ? 'Đúng' : 'Sai'}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fas fa-chevron-left mr-2"></i>
              Câu trước
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                className="flex items-center px-6 py-2 bg-green-600 text-black rounded-lg hover:bg-green-700 transition-colors"
              >
                <i className="fas fa-check mr-2"></i>
                Nộp bài
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition-colors"
              >
                Câu tiếp
                <i className="fas fa-chevron-right ml-2"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
