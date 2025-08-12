
import { Link, useHistory } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
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

    // Questions state (similar to listening lessons)
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
            console.error('Failed to load categories:', error);
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
            console.error('Upload failed:', error);
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

            // Create lesson
            const response = await readingService.createReadingLesson(submitData);

            alert('Tạo bài đọc thành công!');

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
            console.error('Failed to create reading lesson:', error);
            setError('Không thể tạo bài đọc. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    // Tab configuration
    const tabs = [
        { key: 'basic', label: 'Thông tin cơ bản', icon: 'fa-info-circle' },
        { key: 'content', label: 'Nội dung bài đọc', icon: 'fa-file-text' },
        { key: 'questions', label: 'Câu hỏi', icon: 'fa-question-circle' },
        { key: 'vocabulary', label: 'Từ vựng', icon: 'fa-book' },
        { key: 'preview', label: 'Xem trước', icon: 'fa-eye' }
    ];

    return (
        <div className="flex flex-wrap mt-4">
            <div className="w-full mb-12 px-4">
                <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">

                    {/* Header */}
                    <div className="rounded-t mb-0 px-4 py-3 border-0">
                        <div className="flex flex-wrap items-center">
                            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                                <h3 className="font-semibold text-base text-blueGray-700">
                                    <i className="fas fa-file-text mr-2 text-lightBlue-500"></i>
                                    Tạo bài đọc mới
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 py-2 bg-blueGray-50 border-b border-blueGray-200">
                        <nav className="text-sm">
                            <Link to="/admin/create-lesson" className="text-lightBlue-500 hover:text-lightBlue-700">
                                Tạo bài học
                            </Link>
                            <span className="mx-2 text-blueGray-400">/</span>
                            <span className="text-blueGray-600">Bài đọc</span>
                        </nav>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            {error}
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className="px-4">
                        <div className="flex flex-wrap border-b border-blueGray-200">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 mr-4 transition-colors duration-200 ${activeTab === tab.key
                                        ? 'border-lightBlue-500 text-lightBlue-600'
                                        : 'border-transparent text-blueGray-600 hover:text-blueGray-800'
                                        }`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    <i className={`fas ${tab.icon} mr-2`}></i>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit}>
                        <div className="px-4 py-6">

                            {/* Basic Information Tab */}
                            {activeTab === 'basic' && (
                                <div className="space-y-6">
                                    <h4 className="text-lg font-medium text-blueGray-700 mb-4">
                                        Thông tin cơ bản
                                    </h4>

                                    {/* Title */}
                                    <div>
                                        <label className="block text-blueGray-600 text-sm font-bold mb-2">
                                            Tiêu đề bài đọc *
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={lessonData.title}
                                            onChange={handleInputChange}
                                            className="border border-blueGray-300 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
                                            placeholder="Nhập tiêu đề bài đọc"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-blueGray-600 text-sm font-bold mb-2">
                                            Mô tả
                                        </label>
                                        <textarea
                                            name="description"
                                            value={lessonData.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="border border-blueGray-300 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
                                            placeholder="Mô tả ngắn về bài đọc"
                                        />
                                    </div>

                                    {/* Level and Category */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-blueGray-600 text-sm font-bold mb-2">
                                                Cấp độ *
                                            </label>
                                            <select
                                                name="level"
                                                value={lessonData.level}
                                                onChange={handleInputChange}
                                                className="border border-blueGray-300 px-3 py-2 text-blueGray-600 bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
                                                required
                                            >
                                                <option value="A2">A2 - Cơ bản</option>
                                                <option value="B1">B1 - Trung cấp thấp</option>
                                                <option value="B2">B2 - Trung cấp cao</option>
                                                <option value="C1">C1 - Nâng cao</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-blueGray-600 text-sm font-bold mb-2">
                                                Thể loại *
                                            </label>
                                            <select
                                                name="categoryId"
                                                value={lessonData.categoryId || ''}
                                                onChange={handleInputChange}
                                                className="border border-blueGray-300 px-3 py-2 text-blueGray-600 bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
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

                                    {/* Instructions */}
                                    <div>
                                        <label className="block text-blueGray-600 text-sm font-bold mb-2">
                                            Hướng dẫn cho học viên
                                        </label>
                                        <input
                                            type="text"
                                            name="instructions"
                                            value={lessonData.instructions}
                                            onChange={handleInputChange}
                                            className="border border-blueGray-300 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
                                            placeholder="Hướng dẫn cách làm bài"
                                        />
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-blueGray-600 text-sm font-bold mb-2">
                                            Tags (từ khóa)
                                        </label>
                                        <input
                                            type="text"
                                            name="tags"
                                            value={lessonData.tags}
                                            onChange={handleInputChange}
                                            className="border border-blueGray-300 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
                                            placeholder="Nhập các từ khóa, cách nhau bằng dấu phẩy"
                                        />
                                        <p className="text-xs text-blueGray-500 mt-1">
                                            Ví dụ: business, office, communication
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Content Tab */}
                            {activeTab === 'content' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-lg font-medium text-blueGray-700">
                                            Nội dung bài đọc
                                        </h4>
                                        <div className="text-sm text-blueGray-600">
                                            <i className="fas fa-file-word mr-1"></i>
                                            Số từ: <span className="font-semibold">{wordCount}</span>
                                        </div>
                                    </div>

                                    {/* Content Input Mode Selection */}
                                    <div className="bg-blueGray-50 p-4 rounded-lg">
                                        <h5 className="text-sm font-semibold text-blueGray-700 mb-3">
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
                                        <div>
                                            <label className="block text-blueGray-600 text-sm font-bold mb-2">
                                                Nội dung bài đọc *
                                            </label>
                                            <div className="border border-blueGray-300 rounded">
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
                                        <div>
                                            <label className="block text-blueGray-600 text-sm font-bold mb-2">
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
                                                            className="bg-lightBlue-500 text-white px-4 py-2 rounded hover:bg-lightBlue-600"
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
                                        <div>
                                            <label className="block text-blueGray-600 text-sm font-bold mb-2">
                                                Dán nội dung văn bản
                                            </label>
                                            <textarea
                                                value={lessonData.content}
                                                onChange={handlePasteContent}
                                                rows={15}
                                                className="border border-blueGray-300 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
                                                placeholder="Dán nội dung văn bản tại đây..."
                                            />
                                        </div>
                                    )}

                                    {/* Content Preview */}
                                    {lessonData.content && (
                                        <div className="mt-6">
                                            <h5 className="text-sm font-semibold text-blueGray-700 mb-3">
                                                Xem trước nội dung:
                                            </h5>
                                            <div
                                                className="border border-blueGray-200 rounded p-4 bg-gray-50 max-h-64 overflow-y-auto"
                                                dangerouslySetInnerHTML={{ __html: lessonData.content }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Questions Tab */}
                            {activeTab === 'questions' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-lg font-medium text-blueGray-700">
                                            Câu hỏi
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={addQuestion}
                                            className="bg-lightBlue-500 text-white px-4 py-2 rounded hover:bg-lightBlue-600"
                                        >
                                            <i className="fas fa-plus mr-2"></i>
                                            Thêm câu hỏi
                                        </button>
                                    </div>

                                    {/* Questions List */}
                                    {questions.map((question, index) => (
                                        <div key={question.id} className="border border-blueGray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h5 className="font-medium text-blueGray-700">
                                                    Câu hỏi {index + 1}
                                                </h5>
                                                {questions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestion(question.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Question Text */}
                                            <div className="mb-4">
                                                <label className="block text-blueGray-600 text-sm font-bold mb-2">
                                                    Nội dung câu hỏi *
                                                </label>
                                                <textarea
                                                    value={question.question}
                                                    onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                                                    rows={2}
                                                    className="border border-blueGray-300 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
                                                    placeholder="Nhập nội dung câu hỏi"
                                                />
                                            </div>

                                            {/* Question Type */}
                                            <div className="mb-4">
                                                <label className="block text-blueGray-600 text-sm font-bold mb-2">
                                                    Loại câu hỏi
                                                </label>
                                                <select
                                                    value={question.type}
                                                    onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                                                    className="border border-blueGray-300 px-3 py-2 text-blueGray-600 bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
                                                >
                                                    <option value="multiple-choice">Trắc nghiệm</option>
                                                    <option value="true-false">Đúng/Sai</option>
                                                </select>
                                            </div>

                                            {/* Options for Multiple Choice */}
                                            {question.type === 'multiple-choice' && (
                                                <div className="mb-4">
                                                    <label className="block text-blueGray-600 text-sm font-bold mb-2">
                                                        Các lựa chọn
                                                    </label>
                                                    {question.options.map((option, optIndex) => (
                                                        <div key={optIndex} className="flex items-center mb-2">
                                                            <span className="w-8 h-8 bg-blueGray-100 rounded-full flex items-center justify-center mr-3 text-sm font-medium">
                                                                {String.fromCharCode(65 + optIndex)}
                                                            </span>
                                                            <input
                                                                type="text"
                                                                value={option}
                                                                onChange={(e) => updateQuestionOption(question.id, optIndex, e.target.value)}
                                                                className="flex-1 border border-blueGray-300 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring"
                                                                placeholder={`Lựa chọn ${String.fromCharCode(65 + optIndex)}`}
                                                            />
                                                            <input
                                                                type="radio"
                                                                name={`correct-${question.id}`}
                                                                checked={question.correctAnswer === optIndex}
                                                                onChange={() => updateQuestion(question.id, 'correctAnswer', optIndex)}
                                                                className="ml-3"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Explanation */}
                                            <div>
                                                <label className="block text-blueGray-600 text-sm font-bold mb-2">
                                                    Giải thích (tùy chọn)
                                                </label>
                                                <textarea
                                                    value={question.explanation}
                                                    onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                                                    rows={2}
                                                    className="border border-blueGray-300 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
                                                    placeholder="Giải thích đáp án đúng"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Vocabulary Tab */}
                            {activeTab === 'vocabulary' && (
                                <div className="space-y-6">
                                    <h4 className="text-lg font-medium text-blueGray-700">
                                        Từ vựng quan trọng
                                    </h4>

                                    <div className="bg-lightBlue-50 p-4 rounded-lg">
                                        <p className="text-sm text-blueGray-700">
                                            <i className="fas fa-info-circle mr-2 text-lightBlue-500"></i>
                                            Bôi đen từ/cụm từ trong nội dung bài đọc để thêm vào danh sách từ vựng.
                                            Tính năng này sẽ được kích hoạt sau khi tạo bài học.
                                        </p>
                                    </div>

                                    {vocabularies.length > 0 && (
                                        <div>
                                            <h5 className="font-medium text-blueGray-700 mb-3">
                                                Từ vựng đã thêm ({vocabularies.length})
                                            </h5>
                                            <div className="space-y-2">
                                                {vocabularies.map((vocab, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                                                        <div>
                                                            <span className="font-medium">{vocab.word}</span>
                                                            <span className="text-blueGray-600 ml-2">- {vocab.meaning}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="text-red-500 hover:text-red-700"
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

                            {/* Preview Tab */}
                            {activeTab === 'preview' && (
                                <div className="space-y-6">
                                    <h4 className="text-lg font-medium text-blueGray-700">
                                        Xem trước bài đọc
                                    </h4>

                                    {/* Lesson Info */}
                                    <div className="bg-blueGray-50 p-4 rounded-lg">
                                        <h5 className="font-semibold text-blueGray-700 mb-2">{lessonData.title || 'Chưa có tiêu đề'}</h5>
                                        <p className="text-blueGray-600 text-sm mb-2">{lessonData.description || 'Chưa có mô tả'}</p>
                                        <div className="flex items-center space-x-4 text-sm">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
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
                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                            <p className="text-sm">
                                                <i className="fas fa-lightbulb mr-2 text-yellow-600"></i>
                                                {lessonData.instructions}
                                            </p>
                                        </div>
                                    )}

                                    {/* Content */}
                                    {lessonData.content && (
                                        <div>
                                            <h5 className="font-medium text-blueGray-700 mb-3">Nội dung bài đọc:</h5>
                                            <div
                                                className="prose max-w-none bg-white p-6 rounded border"
                                                dangerouslySetInnerHTML={{ __html: lessonData.content }}
                                            />
                                        </div>
                                    )}

                                    {/* Questions Preview */}
                                    <div>
                                        <h5 className="font-medium text-blueGray-700 mb-3">
                                            Câu hỏi ({questions.filter(q => q.question.trim()).length})
                                        </h5>
                                        {questions.filter(q => q.question.trim()).map((question, index) => (
                                            <div key={question.id} className="bg-white p-4 rounded border mb-4">
                                                <p className="font-medium mb-2">
                                                    {index + 1}. {question.question}
                                                </p>
                                                {question.type === 'multiple-choice' && (
                                                    <div className="ml-4 space-y-1">
                                                        {question.options.filter(opt => opt.trim()).map((option, optIndex) => (
                                                            <div key={optIndex} className={`text-sm ${question.correctAnswer === optIndex ? 'text-green-600 font-medium' : 'text-blueGray-600'}`}>
                                                                {String.fromCharCode(65 + optIndex)}. {option}
                                                                {question.correctAnswer === optIndex && (
                                                                    <i className="fas fa-check ml-2 text-green-500"></i>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {question.explanation && (
                                                    <div className="mt-2 text-sm text-blueGray-600 italic">
                                                        <i className="fas fa-info-circle mr-1"></i>
                                                        {question.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Submit Buttons */}
                        <div className="px-4 py-4 border-t border-blueGray-200 flex justify-between">
                            <div className="text-sm text-blueGray-600">
                                {activeTab !== 'preview' && (
                                    <span>
                                        <i className="fas fa-info-circle mr-1"></i>
                                        Chuyển sang tab "Xem trước" để kiểm tra bài học trước khi lưu
                                    </span>
                                )}
                            </div>

                            <div className="space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (window.confirm('Bạn có chắc chắn muốn hủy? Dữ liệu chưa lưu sẽ mất.')) {
                                            window.location.reload();
                                        }
                                    }}
                                    className="bg-blueGray-500 text-white px-6 py-2 rounded hover:bg-blueGray-600"
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-lightBlue-500 text-white px-6 py-2 rounded hover:bg-lightBlue-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="bg-blueGray-500 text-white px-4 py-2 rounded hover:bg-blueGray-600 mr-3"
                                >
                                    <i className="fas fa-arrow-left mr-2"></i>
                                    Quay lại
                                </button>

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