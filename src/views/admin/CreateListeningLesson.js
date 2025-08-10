import React, { useState, useRef } from 'react';
import audioService, { AudioUploadError } from '../../services/audioService';

export default function CreateListeningLesson() {
  // Lesson Information State
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    category: 'conversation',
    tags: '',
    transcript: '',
    instructions: 'Listen to the audio and answer the questions below.'
  });

  // Audio Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [validation, setValidation] = useState(null);
  const [audioDuration, setAudioDuration] = useState('');

  // Questions State
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    }
  ]);

  // UI State
  const [activeTab, setActiveTab] = useState('basic');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // Handle lesson data change
  const handleLessonDataChange = (field, value) => {
    setLessonData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;

    console.log('🎵 Selected audio file:', file.name);
    
    setError('');
    setUploadResult(null);
    setUploadProgress(0);
    setAudioDuration('');

    const validationResult = audioService.validateAudioFile(file);
    setValidation(validationResult);

    if (validationResult.isValid) {
      setSelectedFile(file);
      
      audioService.getAudioDuration(file)
        .then(duration => {
          setAudioDuration(duration);
          console.log('🎧 Audio duration:', duration);
        })
        .catch(err => {
          console.warn('Could not get audio duration:', err.message);
          setAudioDuration('Unknown');
        });
    } else {
      setError(validationResult.error);
      setSelectedFile(null);
    }
  };

  // Handle file input change
  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    handleFileSelect(file);
  };

  // Handle drag and drop
  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle audio upload
  const handleUploadAudio = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      console.log('🚀 Starting audio upload:', selectedFile.name);
      
      const result = await audioService.uploadAudio(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      setUploadResult(result);
      console.log('✅ Audio uploaded successfully:', result);

    } catch (error) {
      console.error('❌ Audio upload failed:', error);
      
      if (error instanceof AudioUploadError) {
        setError(`${error.message} (Code: ${error.code})`);
      } else {
        setError(error.message || 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  };

  // Handle question changes
  const handleQuestionChange = (questionId, field, value) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, [field]: value }
        : q
    ));
  };

  const handleOptionChange = (questionId, optionIndex, value) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.map((opt, idx) => 
              idx === optionIndex ? value : opt
            )
          }
        : q
    ));
  };

  const addQuestion = () => {
    const newId = Math.max(...questions.map(q => q.id)) + 1;
    setQuestions(prev => [...prev, {
      id: newId,
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    }]);
  };

  const removeQuestion = (questionId) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    }
  };

  // Handle save lesson
  const handleSaveLesson = async () => {
    // Validation
    if (!lessonData.title.trim()) {
      setError('Vui lòng nhập tiêu đề bài học');
      return;
    }

    if (!uploadResult) {
      setError('Vui lòng upload file audio trước khi lưu');
      return;
    }

    // Check if questions are valid
    const invalidQuestions = questions.filter(q => 
      !q.question.trim() || 
      q.options.some(opt => !opt.trim())
    );

    if (invalidQuestions.length > 0) {
      setError('Vui lòng điền đầy đủ câu hỏi và các lựa chọn');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Prepare lesson data
      const completeLessonData = {
        ...lessonData,
        audioFile: uploadResult,
        questions: questions,
        audioDuration: audioDuration,
        createdAt: new Date().toISOString(),
        status: 'draft'
      };

      console.log('💾 Saving lesson:', completeLessonData);

      // TODO: Call API to save lesson
      // const response = await lessonService.createListeningLesson(completeLessonData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert('✅ Bài học đã được lưu thành công!');
      
      // Reset form
      setLessonData({
        title: '',
        description: '',
        difficulty: 'beginner',
        category: 'conversation',
        tags: '',
        transcript: '',
        instructions: 'Listen to the audio and answer the questions below.'
      });
      setSelectedFile(null);
      setUploadResult(null);
      setValidation(null);
      setQuestions([{
        id: 1,
        question: '',
        type: 'multiple-choice',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }]);
      setActiveTab('basic');

    } catch (error) {
      console.error('❌ Save lesson failed:', error);
      setError('Lưu bài học thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  // Render validation status
  const renderValidationStatus = () => {
    if (!validation) return null;

    return (
      <div className={`p-4 rounded-lg mb-4 ${
        validation.isValid ? 'bg-emerald-100 border border-emerald-400 text-emerald-700' : 'bg-red-100 border border-red-400 text-red-700'
      }`}>
        <div className="flex items-center">
          <i className={`fas ${validation.isValid ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
          <span className="font-medium">
            {validation.isValid ? 'File hợp lệ' : 'File không hợp lệ'}
          </span>
        </div>
        {validation.error && (
          <p className="mt-2 text-sm">{validation.error}</p>
        )}
        {validation.fileInfo && (
          <div className="mt-2 text-sm">
            <p><strong>Tên:</strong> {validation.fileInfo.name}</p>
            <p><strong>Kích thước:</strong> {validation.fileInfo.formattedSize}</p>
            <p><strong>Định dạng:</strong> {validation.fileInfo.extension?.toUpperCase()}</p>
            {audioDuration && <p><strong>Thời lượng:</strong> {audioDuration}</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full px-4">
          {/* Header */}
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white border-0">
            <div className="rounded-t bg-lightBlue-600 mb-0 px-6 py-6">
              <div className="text-center">
                <h6 className="text-white text-xl font-bold">
                  🎧 Tạo Bài Nghe Mới
                </h6>
                <p className="text-lightBlue-100 text-sm mt-2">
                  Tạo bài học nghe hoàn chỉnh với audio, câu hỏi và transcript
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 py-4 border-b border-blueGray-200">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'basic', name: 'Thông tin cơ bản', icon: 'fa-info-circle' },
                  { id: 'audio', name: 'File âm thanh', icon: 'fa-volume-up' },
                  { id: 'questions', name: 'Câu hỏi', icon: 'fa-question-circle' },
                  { id: 'transcript', name: 'Transcript', icon: 'fa-file-text' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-lightBlue-500 text-white'
                        : 'bg-blueGray-100 text-blueGray-600 hover:bg-blueGray-200'
                    }`}
                  >
                    <i className={`fas ${tab.icon} mr-2`}></i>
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-auto px-6 py-6">
              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-blueGray-600 text-sm font-bold mb-2">
                        Tiêu đề bài học *
                      </label>
                      <input
                        type="text"
                        value={lessonData.title}
                        onChange={(e) => handleLessonDataChange('title', e.target.value)}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        placeholder="Nhập tiêu đề bài học..."
                      />
                    </div>

                    <div>
                      <label className="block text-blueGray-600 text-sm font-bold mb-2">
                        Mức độ khó
                      </label>
                      <select
                        value={lessonData.difficulty}
                        onChange={(e) => handleLessonDataChange('difficulty', e.target.value)}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      >
                        <option value="beginner">Beginner (Cơ bản)</option>
                        <option value="intermediate">Intermediate (Trung cấp)</option>
                        <option value="advanced">Advanced (Nâng cao)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-blueGray-600 text-sm font-bold mb-2">
                        Thể loại
                      </label>
                      <select
                        value={lessonData.category}
                        onChange={(e) => handleLessonDataChange('category', e.target.value)}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      >
                        <option value="conversation">Conversation (Hội thoại)</option>
                        <option value="news">News (Tin tức)</option>
                        <option value="story">Story (Câu chuyện)</option>
                        <option value="interview">Interview (Phỏng vấn)</option>
                        <option value="lecture">Lecture (Bài giảng)</option>
                        <option value="podcast">Podcast</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-blueGray-600 text-sm font-bold mb-2">
                        Tags (phân cách bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        value={lessonData.tags}
                        onChange={(e) => handleLessonDataChange('tags', e.target.value)}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        placeholder="english, listening, business..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-blueGray-600 text-sm font-bold mb-2">
                      Mô tả bài học
                    </label>
                    <textarea
                      value={lessonData.description}
                      onChange={(e) => handleLessonDataChange('description', e.target.value)}
                      rows="4"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Mô tả nội dung và mục tiêu của bài học..."
                    />
                  </div>

                  <div>
                    <label className="block text-blueGray-600 text-sm font-bold mb-2">
                      Hướng dẫn làm bài
                    </label>
                    <textarea
                      value={lessonData.instructions}
                      onChange={(e) => handleLessonDataChange('instructions', e.target.value)}
                      rows="3"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Hướng dẫn cách làm bài cho học viên..."
                    />
                  </div>
                </div>
              )}

              {/* Audio Upload Tab */}
              {activeTab === 'audio' && (
                <div className="space-y-6">
                  {/* Drag and Drop Area */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragOver 
                        ? 'border-lightBlue-500 bg-lightBlue-50' 
                        : 'border-blueGray-300 bg-blueGray-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="text-6xl text-blueGray-400 mb-4">
                      <i className="fas fa-cloud-upload-alt"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-blueGray-700 mb-2">
                      Kéo thả file audio vào đây
                    </h3>
                    <p className="text-blueGray-500 mb-4">
                      hoặc click để chọn file
                    </p>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".mp3,.wav,.m4a,.aac,.ogg,audio/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                      disabled={uploading}
                    />
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-lightBlue-500 text-white px-6 py-3 rounded-lg hover:bg-lightBlue-600 transition-colors disabled:opacity-50"
                    >
                      <i className="fas fa-folder-open mr-2"></i>
                      Chọn file audio
                    </button>
                    
                    <p className="text-xs text-blueGray-400 mt-4">
                      Hỗ trợ: MP3, WAV, M4A, AAC, OGG • Tối đa 50MB
                    </p>
                  </div>

                  {/* Validation Status */}
                  {renderValidationStatus()}

                  {/* Upload Controls */}
                  {selectedFile && validation?.isValid && (
                    <div className="bg-blueGray-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-blueGray-700 mb-4">
                        File đã chọn: {selectedFile.name}
                      </h4>
                      
                      <div className="flex flex-wrap gap-3 mb-4">
                        <button
                          onClick={handleUploadAudio}
                          disabled={uploading || uploadResult}
                          className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                          <i className="fas fa-upload mr-2"></i>
                          {uploading ? 'Đang upload...' : uploadResult ? 'Đã upload' : 'Upload Audio'}
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setValidation(null);
                            setUploadResult(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          disabled={uploading}
                          className="bg-blueGray-500 text-white px-4 py-2 rounded hover:bg-blueGray-600 transition-colors disabled:opacity-50"
                        >
                          <i className="fas fa-times mr-2"></i>
                          Hủy
                        </button>
                      </div>

                      {/* Progress Bar */}
                      {uploading && (
                        <div className="mb-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-blueGray-600">Tiến trình upload</span>
                            <span className="text-sm text-blueGray-600">{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-blueGray-200 rounded-full h-3">
                            <div 
                              className="bg-lightBlue-500 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Upload Result */}
                      {uploadResult && (
                        <div className="bg-emerald-100 border border-emerald-400 text-emerald-700 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <i className="fas fa-check-circle mr-2"></i>
                            <span className="font-medium">Upload thành công!</span>
                          </div>
                          
                          <div className="text-sm space-y-1">
                            <p><strong>File gốc:</strong> {uploadResult.originalFileName}</p>
                            <p><strong>Kích thước:</strong> {uploadResult.formattedFileSize}</p>
                            <p><strong>Định dạng:</strong> {uploadResult.fileFormat?.toUpperCase()}</p>
                            <p><strong>URL:</strong> <code className="bg-emerald-200 px-1 rounded">{uploadResult.audioUrl}</code></p>
                            {audioDuration && <p><strong>Thời lượng:</strong> {audioDuration}</p>}
                          </div>

                          {/* Audio Player */}
                          <div className="mt-4">
                            <audio 
                              ref={audioPlayerRef}
                              controls 
                              className="w-full"
                              src={`http://localhost:8080${uploadResult.audioUrl}`}
                            >
                              Trình duyệt không hỗ trợ audio player.
                            </audio>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Questions Tab */}
              {activeTab === 'questions' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-blueGray-700">
                      Câu hỏi kiểm tra ({questions.length} câu)
                    </h3>
                    <button
                      onClick={addQuestion}
                      className="bg-lightBlue-500 text-white px-4 py-2 rounded hover:bg-lightBlue-600 transition-colors"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Thêm câu hỏi
                    </button>
                  </div>

                  {questions.map((question, index) => (
                    <div key={question.id} className="bg-blueGray-50 p-6 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-md font-semibold text-blueGray-700">
                          Câu hỏi {index + 1}
                        </h4>
                        {questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(question.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-blueGray-600 text-sm font-bold mb-2">
                            Nội dung câu hỏi *
                          </label>
                          <textarea
                            value={question.question}
                            onChange={(e) => handleQuestionChange(question.id, 'question', e.target.value)}
                            rows="2"
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            placeholder="Nhập nội dung câu hỏi..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex}>
                              <label className="block text-blueGray-600 text-sm font-bold mb-2">
                                Lựa chọn {String.fromCharCode(65 + optionIndex)} *
                                {question.correctAnswer === optionIndex && (
                                  <span className="ml-2 text-emerald-500">
                                    <i className="fas fa-check-circle"></i> Đáp án đúng
                                  </span>
                                )}
                              </label>
                              <div className="flex">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => handleOptionChange(question.id, optionIndex, e.target.value)}
                                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded-l text-sm shadow focus:outline-none focus:ring flex-1 ease-linear transition-all duration-150"
                                  placeholder={`Nhập lựa chọn ${String.fromCharCode(65 + optionIndex)}...`}
                                />
                                <button
                                  onClick={() => handleQuestionChange(question.id, 'correctAnswer', optionIndex)}
                                  className={`px-3 py-3 rounded-r text-sm font-medium transition-colors ${
                                    question.correctAnswer === optionIndex
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-blueGray-200 text-blueGray-600 hover:bg-emerald-200'
                                  }`}
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div>
                          <label className="block text-blueGray-600 text-sm font-bold mb-2">
                            Giải thích (tùy chọn)
                          </label>
                          <textarea
                            value={question.explanation}
                            onChange={(e) => handleQuestionChange(question.id, 'explanation', e.target.value)}
                            rows="2"
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            placeholder="Giải thích tại sao đáp án này đúng..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Transcript Tab */}
              {activeTab === 'transcript' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-blueGray-700 mb-4">
                      Transcript (Bản ghi âm thanh)
                    </h3>
                    <p className="text-sm text-blueGray-500 mb-4">
                      Nhập nội dung chi tiết của file audio để học viên có thể tham khảo sau khi hoàn thành bài nghe.
                    </p>
                    
                    <textarea
                      value={lessonData.transcript}
                      onChange={(e) => handleLessonDataChange('transcript', e.target.value)}
                      rows="12"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Nhập nội dung transcript ở đây..."
                    />
                    
                    <div className="flex justify-between items-center mt-2 text-xs text-blueGray-400">
                      <span>Ký tự: {lessonData.transcript.length}</span>
                      <span>Từ: {lessonData.transcript.split(/\s+/).filter(word => word.length > 0).length}</span>
                    </div>
                  </div>

                  <div className="bg-lightBlue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-lightBlue-700 mb-2">
                      <i className="fas fa-lightbulb mr-2"></i>
                      Mẹo viết transcript tốt:
                    </h4>
                    <ul className="text-sm text-lightBlue-600 space-y-1">
                      <li>• Ghi chép chính xác những gì được nói trong audio</li>
                      <li>• Sử dụng dấu chấm câu phù hợp để dễ đọc</li>
                      <li>• Đánh dấu người nói (Speaker A, Speaker B) nếu có nhiều người</li>
                      <li>• Ghi chú [pause], [music] cho các âm thanh đặc biệt</li>
                      <li>• Kiểm tra lại chính tả và ngữ pháp</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    <span className="font-medium">Lỗi:</span>
                  </div>
                  <p className="mt-2">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-6 border-t border-blueGray-200">
                <button
                  onClick={handleSaveLesson}
                  disabled={saving}
                  className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 font-medium"
                >
                  <i className="fas fa-save mr-2"></i>
                  {saving ? 'Đang lưu...' : 'Lưu bài học'}
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn hủy? Tất cả dữ liệu sẽ bị mất.')) {
                      // Reset all form data
                      setLessonData({
                        title: '',
                        description: '',
                        difficulty: 'beginner',
                        category: 'conversation',
                        tags: '',
                        transcript: '',
                        instructions: 'Listen to the audio and answer the questions below.'
                      });
                      setSelectedFile(null);
                      setUploadResult(null);
                      setValidation(null);
                      setQuestions([{
                        id: 1,
                        question: '',
                        type: 'multiple-choice',
                        options: ['', '', '', ''],
                        correctAnswer: 0,
                        explanation: ''
                      }]);
                      setActiveTab('basic');
                      setError('');
                    }
                  }}
                  disabled={saving}
                  className="bg-blueGray-500 text-white px-6 py-3 rounded-lg hover:bg-blueGray-600 transition-colors disabled:opacity-50 font-medium"
                >
                  <i className="fas fa-times mr-2"></i>
                  Hủy
                </button>

                <button
                  onClick={() => {
                    const preview = {
                      ...lessonData,
                      audioFile: uploadResult,
                      questions: questions,
                      audioDuration: audioDuration
                    };
                    console.log('📋 Lesson Preview:', preview);
                    alert('Xem chi tiết preview trong Console (F12)');
                  }}
                  className="bg-lightBlue-500 text-white px-6 py-3 rounded-lg hover:bg-lightBlue-600 transition-colors font-medium"
                >
                  <i className="fas fa-eye mr-2"></i>
                  Xem trước
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}