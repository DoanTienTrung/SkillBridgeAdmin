import { Link, useHistory } from 'react-router-dom';
import React, { useState, useRef, useEffect } from 'react';
import audioService, { AudioUploadError } from '../../services/audioService';
import lessonService from '../../services/lessonService';
import VocabularyModal from '../../components/VocabularyModal';
import TextHighlighter from '../../components/TextHighlighter';
import vocabularyService from '../../services/vocabularyService';
import LessonPreview from '../../components/LessonPreview';

export default function CreateListeningLesson() {
  // Lesson Information State
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    level: 'A2',
    categoryId: null,
    audioUrl: '',
    transcript: '',
    durationSeconds: 0,
    tags: '',
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

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [vocabularies, setVocabularies] = useState([]);
  const [vocabularyModal, setVocabularyModal] = useState({
    isOpen: false,
    selectedText: '',
    textPosition: null
  });

  // Preview States
  const [previewModal, setPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [currentLessonId, setCurrentLessonId] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        console.log('🔄 Loading categories...');

        const response = await lessonService.getCategories();

        console.log('📡 API Response:', response);
        console.log('📂 Categories data:', response.data);

        setCategories(response || []);

        if (response.data && response.data.length > 0) {
          console.log('✅ Successfully loaded', response.data.length, 'categories');
        } else {
          console.warn('⚠️ No categories returned from API');
        }

      } catch (error) {
        console.error('❌ Failed to load categories:', error);
        setError('Không thể tải danh sách thể loại. Vui lòng reload trang.');
      } finally {
        setLoadingCategories(false);
        console.log('🏁 Finished loading categories');
      }
    };

    loadCategories();
  }, []);

  const tabs = [
    { id: 'basic', name: 'Thông tin cơ bản', icon: 'fa-info-circle' },
    { id: 'audio', name: 'File âm thanh', icon: 'fa-volume-up' },
    { id: 'vocabulary', name: 'Từ vựng', icon: 'fa-book' }, // THÊM TAB MỚI
    { id: 'questions', name: 'Câu hỏi', icon: 'fa-question-circle' },
    { id: 'transcript', name: 'Transcript', icon: 'fa-file-text' }
  ];
  const handleTextSelect = (selection) => {
    setVocabularyModal({
      isOpen: true,
      selectedText: selection.text,
      textPosition: { start: selection.start, end: selection.end }
    });
  };

  const handleSaveVocabulary = async (vocabularyData) => {
    if (!currentLessonId) {
      alert('Vui lòng lưu bài học trước khi thêm từ vựng');
      return;
    }

    try {
      const response = await vocabularyService.addVocabularyToLesson(currentLessonId, vocabularyData);

      // Thêm vào danh sách vocabulary local
      setVocabularies(prev => [...prev, response.data]);

      console.log('✅ Vocabulary added successfully');
    } catch (error) {
      console.error('❌ Failed to add vocabulary:', error);
      throw error;
    }
  };

  const handleDeleteVocabulary = async (vocabularyId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa từ vựng này?')) return;

    try {
      await vocabularyService.removeVocabularyFromLesson(currentLessonId, vocabularyId);

      // Xóa khỏi danh sách local
      setVocabularies(prev => prev.filter(v => v.id !== vocabularyId));

      console.log('✅ Vocabulary deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete vocabulary:', error);
      alert('Lỗi khi xóa từ vựng: ' + error.message);
    }
  };

  // Preview handling functions
  const handlePreview = async () => {
    if (!currentLessonId) {
      alert('Vui lòng lưu bài học trước khi xem preview');
      return;
    }

    try {
      setPreviewModal(true);
      const response = await lessonService.getPreviewData(currentLessonId);
      setPreviewData(response.data);
    } catch (error) {
      console.error('❌ Failed to load preview:', error);
      alert('Lỗi khi tải preview: ' + error.message);
      setPreviewModal(false);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xuất bản bài học này? Sau khi xuất bản, học viên sẽ có thể truy cập bài học.')) {
      return;
    }

    try {
      await lessonService.publishLesson(currentLessonId);

      alert('✅ Bài học đã được xuất bản thành công!');
      setPreviewModal(false);

      // Refresh preview data
      const response = await lessonService.getPreviewData(currentLessonId);
      setPreviewData(response.data);
    } catch (error) {
      console.error('❌ Failed to publish lesson:', error);
      alert('Lỗi khi xuất bản bài học: ' + error.message);
    }
  };


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

      // ✅ THÊM: Sync audioUrl vào lessonData
      setLessonData(prev => ({
        ...prev,
        audioUrl: result.audioUrl
      }));

      // ✅ THÊM: Sync duration nếu có
      if (audioDuration && audioDuration !== 'Unknown') {
        const durationInSeconds = parseDuration(audioDuration);
        setLessonData(prev => ({
          ...prev,
          durationSeconds: durationInSeconds
        }));
      }

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

  // ✅ THÊM: Helper function để parse duration
  const parseDuration = (durationString) => {
    const parts = durationString.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else if (parts.length === 3) {
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
    return 0;
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
    // ✅ Enhanced validation
    if (!lessonData.title.trim()) {
      setError('Vui lòng nhập tiêu đề bài học');
      return;
    }

    if (!lessonData.audioUrl) {
      setError('Vui lòng upload file audio trước khi lưu');
      return;
    }

    if (!lessonData.categoryId) {
      setError('Vui lòng chọn thể loại bài học');
      return;
    }

    // Check questions validation with detailed errors
    const questionErrors = validateQuestions();
    if (questionErrors.length > 0) {
      setError('Lỗi câu hỏi:\n' + questionErrors.join('\n'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Bước 1: Tạo lesson
      const lessonCreateDto = {
        title: lessonData.title.trim(),
        description: lessonData.description.trim(),
        level: lessonData.level,
        categoryId: lessonData.categoryId,
        audioUrl: lessonData.audioUrl,
        transcript: lessonData.transcript.trim(),
        durationSeconds: lessonData.durationSeconds || 0
      };

      console.log('💾 Creating lesson with data:', lessonCreateDto);
      const lessonResponse = await lessonService.createListeningLesson(lessonCreateDto);

      const createdLessonId = lessonResponse.data.id;
      console.log('✅ Lesson created successfully with ID:', createdLessonId);

      // Bước 2: Tạo câu hỏi (THÊM LOGIC NÀY)
      const validQuestions = questions.filter(q =>
        q.question.trim() &&
        q.options.every(opt => opt.trim())
      );

      if (validQuestions.length > 0) {
        console.log(`📝 Creating ${validQuestions.length} questions...`);
        await lessonService.createQuestionsForLesson(
          createdLessonId,
          validQuestions,
          'LISTENING'
        );
        console.log('✅ Questions created successfully');
      }

      // Bước 3: Update state và thông báo
      setCurrentLessonId(createdLessonId);

      alert(`✅ Bài học "${lessonData.title}" đã được tạo thành công!\n\n` +
        `ID: ${createdLessonId}\n` +
        `Status: ${lessonResponse.data?.status}\n` +
        `Câu hỏi: ${validQuestions.length} câu`);

      // Load vocabularies nếu có
      if (createdLessonId) {
        try {
          const vocabResponse = await vocabularyService.getLessonVocabularies(createdLessonId);
          setVocabularies(vocabResponse.data || []);
        } catch (error) {
          console.log('No vocabularies found for this lesson');
        }
      }

    } catch (error) {
      console.error('❌ Save lesson failed:', error);

      // Enhanced error handling
      let errorMessage = 'Lưu bài học thất bại';
      if (error.message.includes('questions')) {
        errorMessage = 'Lưu bài học thành công nhưng tạo câu hỏi thất bại. Vui lòng vào "Quản lý câu hỏi" để thêm câu hỏi.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.message.includes('403')) {
        errorMessage = 'Bạn không có quyền tạo bài học. Cần role TEACHER hoặc ADMIN.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      } else {
        errorMessage = `Lưu bài học thất bại: ${error.message}`;
      }

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Thêm validation function này
  const validateQuestions = () => {
    const errors = [];

    questions.forEach((question, index) => {
      if (!question.question.trim()) {
        errors.push(`Câu hỏi ${index + 1}: Thiếu nội dung câu hỏi`);
      }

      const emptyOptions = question.options.filter(opt => !opt.trim());
      if (emptyOptions.length > 0) {
        errors.push(`Câu hỏi ${index + 1}: Có ${emptyOptions.length} lựa chọn trống`);
      }

      if (question.correctAnswer < 0 || question.correctAnswer > 3) {
        errors.push(`Câu hỏi ${index + 1}: Chưa chọn đáp án đúng`);
      }
    });

    return errors;
  };

  // ✅ THÊM: Helper function để reset form
  const resetForm = () => {
    setLessonData({
      title: '',
      description: '',
      level: 'A2',
      categoryId: null,
      audioUrl: '',
      transcript: '',
      durationSeconds: 0
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
    setAudioDuration('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Render validation status
  const renderValidationStatus = () => {
    if (!validation) return null;

    return (
      <div className={`p-4 rounded-lg mb-4 ${validation.isValid ? 'bg-emerald-100 border border-emerald-400 text-emerald-700' : 'bg-red-100 border border-red-400 text-red-700'
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

            <div className="px-4 py-2 bg-blueGray-50 border-b border-blueGray-200">
              <nav className="text-sm">
                <Link to="/admin/create-lesson" className="text-lightBlue-500 hover:text-lightBlue-700">
                  Tạo bài học
                </Link>
                <span className="mx-2 text-blueGray-400">/</span>
                <span className="text-blueGray-600">Bài nghe</span>
              </nav>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 py-4 border-b border-blueGray-200">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'basic', name: 'Thông tin cơ bản', icon: 'fa-info-circle' },
                  { id: 'audio', name: 'File âm thanh', icon: 'fa-volume-up' },
                  { id: 'vocabulary', name: 'Từ vựng', icon: 'fa-book' },
                  { id: 'questions', name: 'Câu hỏi', icon: 'fa-question-circle' },
                  { id: 'transcript', name: 'Transcript', icon: 'fa-file-text' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === tab.id
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
                        value={lessonData.level}
                        onChange={(e) => handleLessonDataChange('level', e.target.value)}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      >
                        <option value="A2">A2 (Cơ bản)</option>
                        <option value="B1">B1 (Trung cấp thấp)</option>
                        <option value="B2">B2 (Trung cấp cao)</option>
                        <option value="C1">C1 (Nâng cao)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-blueGray-600 text-sm font-bold mb-2">
                        Thể loại
                      </label>
                      <select
                        value={lessonData.categoryId || ''}
                        onChange={(e) => handleLessonDataChange('categoryId', parseInt(e.target.value))}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        disabled={loadingCategories}
                      >
                        <option value="">
                          {loadingCategories ? 'Đang tải...' : 'Chọn thể loại...'}
                        </option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name} - {category.description}
                          </option>
                        ))}
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

              {/* Vocabulary Tab */}
              {activeTab === 'vocabulary' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-blueGray-700">
                      📚 Quản lý từ vựng ({vocabularies.length} từ)
                    </h3>
                    <div className="text-sm text-blueGray-500">
                      {currentLessonId ? 'Select text trong transcript để thêm từ vựng' : 'Vui lòng lưu bài học trước'}
                    </div>
                  </div>

                  {!currentLessonId && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800">
                        ⚠️ Vui lòng lưu bài học trong tab "Thông tin cơ bản" trước khi thêm từ vựng
                      </p>
                    </div>
                  )}

                  {/* Transcript với highlight */}
                  <div className="bg-blueGray-50 p-6 rounded-lg">
                    <h4 className="text-md font-semibold text-blueGray-700 mb-4">
                      Transcript (Click để chọn từ vựng)
                    </h4>
                    <div className="bg-white p-4 rounded border min-h-48 max-h-96 overflow-y-auto">
                      {lessonData.transcript ? (
                        <TextHighlighter
                          text={lessonData.transcript}
                          vocabularies={vocabularies}
                          onTextSelect={currentLessonId ? handleTextSelect : null}
                          readOnly={!currentLessonId}
                        />
                      ) : (
                        <p className="text-gray-500 italic">
                          Vui lòng nhập transcript trong tab "Transcript" trước khi thêm từ vựng
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Vocabulary List */}
                  {vocabularies.length > 0 && (
                    <div className="bg-white border rounded-lg">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h4 className="text-md font-semibold text-gray-700">
                          Danh sách từ vựng đã thêm
                        </h4>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {vocabularies.map((vocab) => (
                          <div key={vocab.id} className="px-6 py-4 flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span
                                  className="inline-block w-4 h-4 rounded"
                                  style={{ backgroundColor: vocab.highlightColor }}
                                ></span>
                                <span className="font-semibold text-gray-800">
                                  {vocab.word}
                                </span>
                                {vocab.phonetic && (
                                  <span className="text-sm text-gray-500">
                                    {vocab.phonetic}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-2">
                                {vocab.meaning}
                              </p>
                              {vocab.selectedText && (
                                <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  "{vocab.selectedText}"
                                </p>
                              )}
                              {vocab.exampleSentence && (
                                <p className="text-xs text-gray-500 italic mt-2">
                                  Ví dụ: {vocab.exampleSentence}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteVocabulary(vocab.id)}
                              className="text-red-500 hover:text-red-700 p-2"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Audio Upload Tab */}
              {activeTab === 'audio' && (
                <div className="space-y-6">
                  {/* Drag and Drop Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver
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
                                  className={`px-3 py-3 rounded-r text-sm font-medium transition-colors ${question.correctAnswer === optionIndex
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
                  type="button"
                  onClick={() => window.history.back()}
                  className="bg-blueGray-500 text-white px-4 py-2 rounded hover:bg-blueGray-600 mr-3"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Quay lại
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn hủy? Tất cả dữ liệu sẽ bị mất.')) {
                      // Reset all form data
                      setLessonData({
                        title: '',
                        description: '',
                        level: 'A2',
                        categoryId: null,
                        audioUrl: '',
                        transcript: '',
                        durationSeconds: 0,
                        tags: '',
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
                  onClick={handlePreview}
                  disabled={!currentLessonId}
                  className="bg-lightBlue-500 text-white px-6 py-3 rounded-lg hover:bg-lightBlue-600 transition-colors font-medium disabled:opacity-50"
                >
                  <i className="fas fa-eye mr-2"></i>
                  {!currentLessonId ? 'Lưu bài học để preview' : 'Xem trước'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vocabulary Modal */}
      <VocabularyModal
        isOpen={vocabularyModal.isOpen}
        onClose={() => setVocabularyModal({ isOpen: false, selectedText: '', textPosition: null })}
        selectedText={vocabularyModal.selectedText}
        textPosition={vocabularyModal.textPosition}
        onSave={handleSaveVocabulary}
      />

      {/* Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <LessonPreview
              previewData={previewData}
              onClose={() => setPreviewModal(false)}
              onPublish={handlePublish}
              onBackToEdit={() => setPreviewModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}