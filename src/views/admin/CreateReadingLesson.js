import { Link, useHistory } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// ✅ IMPORT CSS FILE
import '../../assets/styles/form-components.css';

import readingService from '../../services/readingService';
import VocabularyModal from '../../components/VocabularyModal';
import TextHighlighter from '../../components/TextHighlighter';

export default function CreateReadingLesson() {
    // Form data state
    const [lessonData, setLessonData] = useState({
        title: '',
        description: '',
        level: 'A2',
        categoryId: null,
        content: '',
        instructions: 'Đọc đoạn văn sau và trả lời các câu hỏi bên dưới.',
        tags: ''
    });

    // Content editing states
    const [wordCount, setWordCount] = useState(0);
    const [contentMode, setContentMode] = useState('editor'); // 'editor' | 'upload' | 'paste'

    // UI states
    const [activeTab, setActiveTab] = useState('basic');
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // File upload states
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Questions state
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

    // Vocabulary states
    const [vocabularies, setVocabularies] = useState([]);
    const [vocabularyModal, setVocabularyModal] = useState({
        isOpen: false,
        selectedText: '',
        textPosition: null
    });

    // Load categories on mount
    useEffect(() => {
        loadCategories();
    }, []);

    // Update word count when content changes
    useEffect(() => {
        const count = readingService.calculateWordCount(lessonData.content);
        setWordCount(count);
    }, [lessonData.content]);

    const loadCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await readingService.getCategories();
            setCategories(response || []);
        } catch (error) {
            console.error('Failed to load categories: - CreateReadingLesson.js:78', error);
            setError('Không thể tải danh sách thể loại. Vui lòng reload trang.');
        } finally {
            setLoadingCategories(false);
        }
    };

    // Quill editor configuration
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote'],
            [{ 'align': [] }],
            ['link'],
            ['clean']
        ],
    };

    const quillFormats = [
        'header', 'bold', 'italic', 'underline',
        'list', 'bullet', 'blockquote', 'align', 'link'
    ];

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLessonData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle content change from editor
    const handleContentChange = (value) => {
        setLessonData(prev => ({
            ...prev,
            content: value
        }));
    };

    // Handle file upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.includes('text/plain')) {
            setError('Chỉ chấp nhận file .txt');
            return;
        }

        // Validate file size (max 1MB)
        if (file.size > 1024 * 1024) {
            setError('File quá lớn. Tối đa 1MB.');
            return;
        }

        try {
            setUploading(true);
            setError('');

            const response = await readingService.uploadTextFile(file);

            setLessonData(prev => ({
                ...prev,
                content: response.data
            }));

            setSelectedFile(file);
            setContentMode('upload');

        } catch (error) {
            console.error('Upload failed: - CreateReadingLesson.js:152', error);
            setError('Upload thất bại. Vui lòng thử lại.');
        } finally {
            setUploading(false);
        }
    };

    // Handle paste content
    const handlePasteContent = (e) => {
        const pastedText = e.target.value;
        setLessonData(prev => ({
            ...prev,
            content: pastedText
        }));
        setContentMode('paste');
    };

    // Add question
    const addQuestion = () => {
        const newQuestion = {
            id: Date.now(),
            question: '',
            type: 'multiple-choice',
            options: ['', '', '', ''],
            correctAnswer: 0,
            explanation: ''
        };
        setQuestions([...questions, newQuestion]);
    };

    // Remove question
    const removeQuestion = (id) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    // Update question
    const updateQuestion = (id, field, value) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ));
    };

    // Update question option
    const updateQuestionOption = (id, optionIndex, value) => {
        setQuestions(questions.map(q =>
            q.id === id
                ? {
                    ...q,
                    options: q.options.map((opt, idx) => idx === optionIndex ? value : opt)
                }
                : q
        ));
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setError('');

            // Prepare lesson data
            const submitData = {
                ...lessonData,
                wordCount: wordCount
            };

            console.log('📤 Submitting lesson data: - CreateReadingLesson.js:224', submitData);

            // Create lesson
            const lessonResponse = await readingService.createReadingLesson(submitData);
            console.log('✅ Lesson created: - CreateReadingLesson.js:228', lessonResponse);

            const lessonId = lessonResponse.data?.id || lessonResponse.id;

            if (!lessonId) {
                throw new Error('Không nhận được ID bài học từ server');
            }

            // Create questions for the lesson
            const validQuestions = questions.filter(q => q.question.trim() !== '');
            if (validQuestions.length > 0) {
                console.log('📤 Creating questions for lesson: - CreateReadingLesson.js:239', lessonId);

                for (const question of validQuestions) {
                    const questionData = {
                        questionText: question.question,
                        questionType: question.type === 'multiple-choice' ? 'MULTIPLE_CHOICE' : 'TRUE_FALSE',
                        optionA: question.options[0] || '',
                        optionB: question.options[1] || '',
                        optionC: question.options[2] || '',
                        optionD: question.options[3] || '',
                        correctAnswer: question.type === 'multiple-choice' 
                            ? String.fromCharCode(65 + question.correctAnswer) 
                            : (question.correctAnswer === 0 ? 'A' : 'B'),
                        explanation: question.explanation || '',
                        points: 1,
                        lessonId: lessonId,
                        lessonType: 'READING'
                    };

                    try {
                        await readingService.createQuestion(questionData);
                        console.log('✅ Question created: - CreateReadingLesson.js:260', questionData.questionText);
                    } catch (questionError) {
                        console.error('❌ Failed to create question: - CreateReadingLesson.js:262', questionError);
                        // Continue with other questions
                    }
                }
            }

            alert('Tạo bài đọc và câu hỏi thành công!');

            // Reset form
            setLessonData({
                title: '',
                description: '',
                level: 'A2',
                categoryId: null,
                content: '',
                instructions: 'Đọc đoạn văn sau và trả lời các câu hỏi bên dưới.',
                tags: ''
            });
            setQuestions([
                {
                    id: 1,
                    question: '',
                    type: 'multiple-choice',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                    explanation: ''
                }
            ]);
            setActiveTab('basic');

        } catch (error) {
            console.error('❌ Failed to create reading lesson: - CreateReadingLesson.js:293', error);

            // Better error handling
            let errorMessage = 'Không thể tạo bài đọc.';

            if (error.message) {
                errorMessage += ' Chi tiết: ' + error.message;
            }

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    // Validate form
    const validateForm = () => {
        if (!lessonData.title.trim()) {
            setError('Tiêu đề không được để trống');
            return false;
        }

        if (!lessonData.categoryId) {
            setError('Vui lòng chọn thể loại');
            return false;
        }

        if (!lessonData.content.trim()) {
            setError('Nội dung không được để trống');
            return false;
        }

        if (wordCount < 50) {
            setError('Nội dung quá ngắn. Cần ít nhất 50 từ.');
            return false;
        }

        // Validate questions
        const validQuestions = questions.filter(q => q.question.trim() !== '');
        if (validQuestions.length === 0) {
            setError('Cần có ít nhất 1 câu hỏi');
            return false;
        }

        for (let q of validQuestions) {
            if (q.type === 'multiple-choice') {
                const filledOptions = q.options.filter(opt => opt.trim() !== '');
                if (filledOptions.length < 2) {
                    setError('Mỗi câu hỏi trắc nghiệm cần ít nhất 2 lựa chọn');
                    return false;
                }
            }
        }

        return true;
    };

    return (
        <div className="lesson-form-container">
            <div className="lesson-form-content">

                {/* Header */}
                <div className="lesson-header">
                    <div className="lesson-header-content">
                        <div className="lesson-header-title">
                            <div className="flex items-center space-x-3">
                                <div className="lesson-icon-box">
                                    <i className="fas fa-book-open"></i>
                                </div>
                                <div>
                                    <h1 className="lesson-title">Tạo Bài Đọc Mới</h1>
                                    <p className="lesson-subtitle">Tạo và quản lý bài đọc cho học viên</p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => window.history.back()}
                                className="back-button"
                            >
                                <i className="fas fa-arrow-left mr-2"></i>
                                Quay lại
                            </button>
                        </div>
                    </div>

                    {/* Breadcrumb */}
                    <div className="breadcrumb-container">
                        <nav className="breadcrumb-nav">
                            <i className="fas fa-home"></i>
                            <span>Trang chủ</span>
                            <i className="fas fa-chevron-right text-xs"></i>
                            <span>Quản lý bài học</span>
                            <i className="fas fa-chevron-right text-xs"></i>
                            <span className="breadcrumb-active">Tạo bài đọc</span>
                        </nav>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert-error">
                        <div className="alert-content">
                            <div className="alert-icon">
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <div className="alert-text">
                                <h3 className="alert-title">Có lỗi xảy ra</h3>
                                <p className="alert-message">{error}</p>
                            </div>
                            <div className="alert-close">
                                <button onClick={() => setError('')}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="tab-container">
                    <div className="tab-navigation">
                        <nav className="tab-list">
                            {[
                                { key: 'basic', label: 'Thông tin cơ bản', icon: 'fa-info-circle' },
                                { key: 'content', label: 'Nội dung bài đọc', icon: 'fa-file-text' },
                                { key: 'questions', label: 'Câu hỏi', icon: 'fa-question-circle' },
                                { key: 'preview', label: 'Xem trước', icon: 'fa-eye' }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    className={`tab-button ${activeTab === tab.key ? 'active' : 'inactive'}`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    <div className="tab-button-content">
                                        <i className={`fas ${tab.icon} ${activeTab === tab.key ? 'active' : 'inactive'}`}></i>
                                        <span>{tab.label}</span>
                                    </div>
                                    {activeTab === tab.key && <div className="tab-indicator"></div>}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Form Content */}
                <div className="form-container">
                    <form onSubmit={handleSubmit} className="form-content">

                        {/* Basic Information Tab */}
                        {activeTab === 'basic' && (
                            <div className="space-y-6">
                                <div className="form-grid">
                                    <div className="form-main-column">
                                        <div className="form-section">
                                            <div className="section-header">
                                                <i className="fas fa-edit"></i>
                                                <h3 className="section-title">Thông tin bài đọc</h3>
                                            </div>
                                            
                                            <div className="form-group">
                                                <label className="form-label">
                                                    <i className="fas fa-heading"></i>
                                                    Tiêu đề bài đọc *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    value={lessonData.title}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                    placeholder="Nhập tiêu đề hấp dẫn cho bài đọc"
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">
                                                    <i className="fas fa-align-left"></i>
                                                    Mô tả ngắn
                                                </label>
                                                <textarea
                                                    name="description"
                                                    value={lessonData.description}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    className="form-textarea"
                                                    placeholder="Mô tả ngắn gọn về nội dung và mục tiêu của bài đọc"
                                                />
                                            </div>

                                            <div className="form-grid-2">
                                                <div className="form-group">
                                                    <label className="form-label">
                                                        <i className="fas fa-layer-group"></i>
                                                        Cấp độ *
                                                    </label>
                                                    <select
                                                        name="level"
                                                        value={lessonData.level}
                                                        onChange={handleInputChange}
                                                        className="form-select"
                                                        required
                                                    >
                                                        <option value="A2">A2 - Cơ bản</option>
                                                        <option value="B1">B1 - Trung cấp thấp</option>
                                                        <option value="B2">B2 - Trung cấp cao</option>
                                                        <option value="C1">C1 - Nâng cao</option>
                                                    </select>
                                                </div>

                                                <div className="form-group">
                                                    <label className="form-label">
                                                        <i className="fas fa-tags"></i>
                                                        Thể loại *
                                                    </label>
                                                    <select
                                                        name="categoryId"
                                                        value={lessonData.categoryId || ''}
                                                        onChange={handleInputChange}
                                                        className="form-select"
                                                        required
                                                        disabled={loadingCategories}
                                                    >
                                                        <option value="">Chọn thể loại</option>
                                                        {categories.map(category => (
                                                            <option key={category.id} value={category.id}>
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">
                                                    <i className="fas fa-compass"></i>
                                                    Hướng dẫn cho học viên
                                                </label>
                                                <input
                                                    type="text"
                                                    name="instructions"
                                                    value={lessonData.instructions}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                    placeholder="Hướng dẫn cách làm bài"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">
                                                    <i className="fas fa-hashtag"></i>
                                                    Tags (từ khóa)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="tags"
                                                    value={lessonData.tags}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                    placeholder="Nhập các từ khóa, cách nhau bằng dấu phẩy"
                                                />
                                                <p className="text-xs text-blueGray-500 mt-1">
                                                    Ví dụ: business, office, communication
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tips Sidebar */}
                                    <div>
                                        <div className="tips-sidebar">
                                            <div className="tips-header">
                                                <i className="fas fa-lightbulb"></i>
                                                <h3 className="tips-title">Mẹo tạo bài đọc hay</h3>
                                            </div>
                                            <ul className="tips-list">
                                                <li className="tips-item">
                                                    <i className="fas fa-check-circle"></i>
                                                    <span>Tiêu đề ngắn gọn, súc tích (10-15 từ)</span>
                                                </li>
                                                <li className="tips-item">
                                                    <i className="fas fa-check-circle"></i>
                                                    <span>Nội dung phù hợp với cấp độ học viên</span>
                                                </li>
                                                <li className="tips-item">
                                                    <i className="fas fa-check-circle"></i>
                                                    <span>Ít nhất 50 từ cho bài đọc ngắn</span>
                                                </li>
                                                <li className="tips-item">
                                                    <i className="fas fa-check-circle"></i>
                                                    <span>Thêm 3-5 câu hỏi để kiểm tra hiểu bài</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Content Tab */}
                        {activeTab === 'content' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="section-title flex items-center">
                                            <i className="fas fa-file-text mr-2"></i>
                                            Nội dung bài đọc
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">Tạo nội dung chất lượng cho học viên</p>
                                    </div>
                                    <div className="text-sm text-blueGray-600 bg-gray-100 px-3 py-2 rounded-lg">
                                        <i className="fas fa-file-word mr-1"></i>
                                        Số từ: <span className="font-semibold text-lightBlue-600">{wordCount}</span>
                                    </div>
                                </div>

                                {/* Content Input Mode Selection */}
                                <div className="bg-blueGray-50 p-4 rounded-lg">
                                    <h5 className="text-sm font-semibold text-blueGray-700 mb-3">
                                        <i className="fas fa-tools mr-2"></i>
                                        Chọn cách nhập nội dung:
                                    </h5>
                                    <div className="grid grid-cols-3 gap-3">
                                        {/* Editor Mode */}
                                        <button
                                            type="button"
                                            onClick={() => setContentMode('editor')}
                                            className={`p-3 rounded-lg border-2 transition-colors ${contentMode === 'editor'
                                                ? 'border-lightBlue-500 bg-lightBlue-50'
                                                : 'border-blueGray-200 hover:border-blueGray-300'
                                                }`}
                                        >
                                            <i className="fas fa-edit text-lg mb-2 block"></i>
                                            <div className="text-sm font-medium">Soạn thảo</div>
                                        </button>

                                        {/* Upload Mode */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setContentMode('upload');
                                                fileInputRef.current?.click();
                                            }}
                                            className={`p-3 rounded-lg border-2 transition-colors ${contentMode === 'upload'
                                                ? 'border-lightBlue-500 bg-lightBlue-50'
                                                : 'border-blueGray-200 hover:border-blueGray-300'
                                                }`}
                                        >
                                            <i className="fas fa-upload text-lg mb-2 block"></i>
                                            <div className="text-sm font-medium">Upload File</div>
                                        </button>

                                        {/* Paste Mode */}
                                        <button
                                            type="button"
                                            onClick={() => setContentMode('paste')}
                                            className={`p-3 rounded-lg border-2 transition-colors ${contentMode === 'paste'
                                                ? 'border-lightBlue-500 bg-lightBlue-50'
                                                : 'border-blueGray-200 hover:border-blueGray-300'
                                                }`}
                                        >
                                            <i className="fas fa-paste text-lg mb-2 block"></i>
                                            <div className="text-sm font-medium">Dán văn bản</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Hidden File Input */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".txt"
                                    className="hidden"
                                />

                                {/* Content Editor */}
                                {contentMode === 'editor' && (
                                    <div className="form-group">
                                        <label className="form-label">
                                            <i className="fas fa-pen"></i>
                                            Nội dung bài đọc *
                                        </label>
                                        <div className="border border-blueGray-300 rounded-lg">
                                            <ReactQuill
                                                theme="snow"
                                                value={lessonData.content}
                                                onChange={handleContentChange}
                                                modules={quillModules}
                                                formats={quillFormats}
                                                placeholder="Nhập nội dung bài đọc tại đây..."
                                                style={{ minHeight: '300px' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Upload Status */}
                                {contentMode === 'upload' && (
                                    <div className="form-group">
                                        <label className="form-label">
                                            <i className="fas fa-cloud-upload-alt"></i>
                                            Upload file văn bản (.txt)
                                        </label>
                                        <div className="border-2 border-dashed border-blueGray-300 rounded-lg p-6 text-center">
                                            {uploading ? (
                                                <div>
                                                    <i className="fas fa-spinner fa-spin text-2xl text-lightBlue-500 mb-2"></i>
                                                    <p>Đang xử lý file...</p>
                                                </div>
                                            ) : selectedFile ? (
                                                <div>
                                                    <i className="fas fa-file-text text-2xl text-green-500 mb-2"></i>
                                                    <p className="font-medium">{selectedFile.name}</p>
                                                    <p className="text-sm text-blueGray-600">
                                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="mt-2 text-lightBlue-500 hover:text-lightBlue-700"
                                                    >
                                                        Chọn file khác
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <i className="fas fa-cloud-upload-alt text-2xl text-blueGray-400 mb-2"></i>
                                                    <p className="mb-2">Chọn file .txt để upload</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="btn-base btn-primary btn-sm"
                                                    >
                                                        Chọn file
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Paste Mode */}
                                {contentMode === 'paste' && (
                                    <div className="form-group">
                                        <label className="form-label">
                                            <i className="fas fa-clipboard"></i>
                                            Dán nội dung văn bản
                                        </label>
                                        <textarea
                                            value={lessonData.content}
                                            onChange={handlePasteContent}
                                            rows={15}
                                            className="form-textarea"
                                            placeholder="Dán nội dung văn bản tại đây..."
                                        />
                                    </div>
                                )}

                                {/* Content Preview */}
                                {lessonData.content && (
                                    <div className="mt-6">
                                        <h5 className="form-label">
                                            <i className="fas fa-eye"></i>
                                            Xem trước nội dung:
                                        </h5>
                                        <div
                                            className="border border-blueGray-200 rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto"
                                            dangerouslySetInnerHTML={{ __html: lessonData.content }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Questions Tab */}
                        {activeTab === 'questions' && (
                            <div className="space-y-6">
                                <div className="questions-header">
                                    <div>
                                        <h3 className="questions-title">
                                            <i className="fas fa-question-circle"></i>
                                            Câu hỏi kiểm tra ({questions.filter(q => q.question.trim()).length})
                                        </h3>
                                        <p className="questions-subtitle">Tạo câu hỏi để kiểm tra hiểu bài của học viên</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addQuestion}
                                        className="btn-base btn-success btn-sm"
                                    >
                                        <i className="fas fa-plus mr-2"></i>
                                        Thêm câu hỏi
                                    </button>
                                </div>

                                {/* Questions List */}
                                <div className="space-y-4">
                                    {questions.map((question, index) => (
                                        <div key={question.id} className="question-card">
                                            <div className="question-header">
                                                <div className="question-number">
                                                    <div className="question-badge">{index + 1}</div>
                                                    <h4 className="question-title">Câu hỏi {index + 1}</h4>
                                                </div>
                                                {questions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestion(question.id)}
                                                        className="question-delete"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                )}
                                            </div>

                                            <div className="question-grid">
                                                <div>
                                                    <div className="form-group">
                                                        <label className="form-label">
                                                            <i className="fas fa-edit"></i>
                                                            Nội dung câu hỏi *
                                                        </label>
                                                        <textarea
                                                            value={question.question}
                                                            onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                                                            rows={3}
                                                            className="form-textarea"
                                                            placeholder="Nhập câu hỏi rõ ràng, dễ hiểu"
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label className="form-label">
                                                            <i className="fas fa-list"></i>
                                                            Loại câu hỏi
                                                        </label>
                                                        <select
                                                            value={question.type}
                                                            onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                                                            className="form-select"
                                                        >
                                                            <option value="multiple-choice">Trắc nghiệm (A, B, C, D)</option>
                                                            <option value="true-false">Đúng/Sai</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div>
                                                    {/* Multiple Choice Options */}
                                                    {question.type === 'multiple-choice' && (
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                <i className="fas fa-list-ol"></i>
                                                                Các lựa chọn (chọn đáp án đúng)
                                                            </label>
                                                            <div className="space-y-3">
                                                                {question.options.map((option, optIndex) => (
                                                                    <div key={optIndex} className="option-row">
                                                                        <div className={`option-label ${question.correctAnswer === optIndex ? 'correct' : 'normal'}`}>
                                                                            {String.fromCharCode(65 + optIndex)}
                                                                        </div>
                                                                        <input
                                                                            type="text"
                                                                            value={option}
                                                                            onChange={(e) => updateQuestionOption(question.id, optIndex, e.target.value)}
                                                                            className="option-input"
                                                                            placeholder={`Lựa chọn ${String.fromCharCode(65 + optIndex)}`}
                                                                        />
                                                                        <input
                                                                            type="radio"
                                                                            name={`correct-${question.id}`}
                                                                            checked={question.correctAnswer === optIndex}
                                                                            onChange={() => updateQuestion(question.id, 'correctAnswer', optIndex)}
                                                                            className="option-radio"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* True/False Options */}
                                                    {question.type === 'true-false' && (
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                <i className="fas fa-toggle-on"></i>
                                                                Chọn đáp án đúng
                                                            </label>
                                                            <div className="tf-container">
                                                                <div className="tf-option true">
                                                                    <input
                                                                        type="radio"
                                                                        name={`correct-${question.id}`}
                                                                        checked={question.correctAnswer === 0}
                                                                        onChange={() => updateQuestion(question.id, 'correctAnswer', 0)}
                                                                        className="tf-radio true"
                                                                    />
                                                                    <div className="tf-icon true">
                                                                        <i className="fas fa-check"></i>
                                                                    </div>
                                                                    <span className="tf-label true">Đúng (True)</span>
                                                                </div>
                                                                <div className="tf-option false">
                                                                    <input
                                                                        type="radio"
                                                                        name={`correct-${question.id}`}
                                                                        checked={question.correctAnswer === 1}
                                                                        onChange={() => updateQuestion(question.id, 'correctAnswer', 1)}
                                                                        className="tf-radio false"
                                                                    />
                                                                    <div className="tf-icon false">
                                                                        <i className="fas fa-times"></i>
                                                                    </div>
                                                                    <span className="tf-label false">Sai (False)</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Explanation */}
                                                    <div className="form-group">
                                                        <label className="form-label">
                                                            <i className="fas fa-info-circle"></i>
                                                            Giải thích đáp án (tùy chọn)
                                                        </label>
                                                        <textarea
                                                            value={question.explanation}
                                                            onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                                                            rows={2}
                                                            className="form-textarea"
                                                            placeholder="Giải thích tại sao đây là đáp án đúng"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Preview Tab */}
                        {activeTab === 'preview' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="section-title flex items-center">
                                        <i className="fas fa-eye mr-2"></i>
                                        Xem trước bài đọc
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">Kiểm tra lại thông tin trước khi lưu</p>
                                </div>

                                {/* Lesson Info */}
                                <div className="bg-blueGray-50 p-6 rounded-lg">
                                    <h5 className="font-semibold text-blueGray-700 mb-2 flex items-center">
                                        <i className="fas fa-book mr-2"></i>
                                        {lessonData.title || 'Chưa có tiêu đề'}
                                    </h5>
                                    <p className="text-blueGray-600 text-sm mb-3">{lessonData.description || 'Chưa có mô tả'}</p>
                                    <div className="flex items-center space-x-4 text-sm">
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                                            <i className="fas fa-layer-group mr-1"></i>
                                            {lessonData.level}
                                        </span>
                                        <span className="text-blueGray-600">
                                            <i className="fas fa-file-word mr-1"></i>
                                            {wordCount} từ
                                        </span>
                                    </div>
                                </div>

                                {/* Instructions */}
                                {lessonData.instructions && (
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                                        <p className="text-sm flex items-center">
                                            <i className="fas fa-lightbulb mr-2 text-yellow-600"></i>
                                            <strong className="mr-2">Hướng dẫn:</strong>
                                            {lessonData.instructions}
                                        </p>
                                    </div>
                                )}

                                {/* Content */}
                                {lessonData.content && (
                                    <div>
                                        <h5 className="form-label">
                                            <i className="fas fa-file-text"></i>
                                            Nội dung bài đọc:
                                        </h5>
                                        <div
                                            className="prose max-w-none bg-white p-6 rounded-lg border shadow-sm"
                                            dangerouslySetInnerHTML={{ __html: lessonData.content }}
                                        />
                                    </div>
                                )}

                                {/* Questions Preview */}
                                <div>
                                    <h5 className="form-label">
                                        <i className="fas fa-question-circle"></i>
                                        Câu hỏi ({questions.filter(q => q.question.trim()).length})
                                    </h5>
                                    {questions.filter(q => q.question.trim()).map((question, index) => (
                                        <div key={question.id} className="bg-white p-6 rounded-lg border shadow-sm mb-4">
                                            <p className="font-medium mb-3 flex items-center">
                                                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                                    {index + 1}
                                                </span>
                                                {question.question}
                                            </p>
                                            {question.type === 'multiple-choice' && (
                                                <div className="ml-9 space-y-2">
                                                    {question.options.filter(opt => opt.trim()).map((option, optIndex) => (
                                                        <div key={optIndex} className={`text-sm flex items-center ${question.correctAnswer === optIndex ? 'text-green-600 font-medium bg-green-50 p-2 rounded' : 'text-blueGray-600'}`}>
                                                            <span className="font-bold mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                                                            {option}
                                                            {question.correctAnswer === optIndex && (
                                                                <i className="fas fa-check ml-2 text-green-500"></i>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {question.type === 'true-false' && (
                                                <div className="ml-9">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                        question.correctAnswer === 0 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        <i className={`fas ${question.correctAnswer === 0 ? 'fa-check' : 'fa-times'} mr-1`}></i>
                                                        {question.correctAnswer === 0 ? 'Đúng' : 'Sai'}
                                                    </span>
                                                </div>
                                            )}
                                            {question.explanation && (
                                                <div className="mt-3 ml-9 text-sm text-blueGray-600 bg-blue-50 p-3 rounded italic">
                                                    <i className="fas fa-info-circle mr-1"></i>
                                                    <strong>Giải thích:</strong> {question.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Submit Section */}
                        <div className="submit-section">
                            <div className="submit-container">
                                <div className="submit-info">
                                    <i className="fas fa-save"></i>
                                    Bài đọc sẽ được lưu ở trạng thái nháp và có thể chỉnh sửa sau
                                </div>

                                <div className="submit-buttons">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (window.confirm('Bạn có chắc chắn muốn hủy? Dữ liệu chưa lưu sẽ mất.')) {
                                                window.location.reload();
                                            }
                                        }}
                                        className="btn-base btn-secondary btn-md"
                                    >
                                        <i className="fas fa-times mr-2"></i>
                                        Hủy bỏ
                                    </button>
                                    
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn-base btn-primary btn-lg"
                                    >
                                        {saving ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                                Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save mr-2"></i>
                                                Tạo bài đọc
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Vocabulary Modal */}
            {vocabularyModal.isOpen && (
                <VocabularyModal
                    selectedText={vocabularyModal.selectedText}
                    onClose={() => setVocabularyModal({ isOpen: false, selectedText: '', textPosition: null })}
                    onSave={(vocabularyData) => {
                        setVocabularies([...vocabularies, vocabularyData]);
                        setVocabularyModal({ isOpen: false, selectedText: '', textPosition: null });
                    }}
                />
            )}
        </div>
    );
}