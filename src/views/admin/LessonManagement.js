import React, { useState, useEffect, useMemo, useCallback } from 'react';
import lessonService from '../../services/lessonService';
import EditLessonModal from '../../components/EditLessonModal';
import QuestionManagement from '../../components/QuestionManagement'; 

export default function LessonManagement() {
  // --- STATE MANAGEMENT ---
  const [lessons, setLessons] = useState([]);
  const [activeTab, setActiveTab] = useState('listening');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [editModal, setEditModal] = useState({ isOpen: false, lesson: null });
  
  // --- NEW STATE FOR QUESTIONS MANAGEMENT ---
  const [selectedLessonForQuestions, setSelectedLessonForQuestions] = useState(null);
  const [questionsTab, setQuestionsTab] = useState('lessons'); // 'lessons' hoặc 'questions'

  // --- DATA FETCHING ---
  const loadLessons = useCallback(async (lessonType) => {
    try {
      setLoading(true);
      setError('');
      const response = await lessonService.getLessonsAdmin(lessonType);
      console.log(`✅ ${lessonType} lessons fetched successfully:`, response.data);
      setLessons(response.data || []); // Dữ liệu nằm trong response.data
      console.log("Lesson in loadLessons below setLessons:", response.data)
    } catch (error) {
      console.error(`Failed to load ${lessonType} lessons:`, error);
      setError('Không thể tải danh sách bài học. Vui lòng thử lại.');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải dữ liệu khi component được mount hoặc khi chuyển tab
  useEffect(() => {
    if (questionsTab === 'lessons') {
      loadLessons(activeTab);
    }
  }, [activeTab, questionsTab, loadLessons]);

  // --- FILTERING LOGIC ---
  // Lọc danh sách bài học dựa trên các bộ lọc
  const filteredLessons = useMemo(() => {
    console.log("Lession in filter logic: " + lessons)
    return lessons.filter(lesson => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            lesson.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || lesson.status === statusFilter;
      const matchesLevel = levelFilter === 'ALL' || lesson.level === levelFilter;
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [lessons, searchTerm, statusFilter, levelFilter]);

  // --- EVENT HANDLERS ---
  const handleEdit = (lesson) => {
    setEditModal({
      isOpen: true,
      lesson: lesson
    });
  };

  const handleDelete = async (lessonId, lessonTitle) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa bài học "${lessonTitle}"?\nHành động này không thể hoàn tác.`
    );
    if (!confirmed) return;

    try {
      console.log(lessonId)
      console.log(activeTab)
      await lessonService.deleteLesson(lessonId, activeTab); // Truyền `activeTab` để service biết endpoint
      setLessons(prevLessons => prevLessons.filter(lesson => lesson.id !== lessonId));
      alert('Xóa bài học thành công!');
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      alert('Không thể xóa bài học. Vui lòng thử lại.');
    }
  };

  const handleStatusChange = async (lessonId, currentStatus) => {
    const newStatus = currentStatus === 'DRAFT' ? 'PUBLISHED' : 'DRAFT';
    try {
      await lessonService.updateLessonStatus(lessonId, newStatus, activeTab); // Truyền `activeTab`
      setLessons(prevLessons => prevLessons.map(lesson =>
        lesson.id === lessonId ? { ...lesson, status: newStatus } : lesson
      ));
      alert(`Chuyển trạng thái thành công!`);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Không thể thay đổi trạng thái. Vui lòng thử lại.');
    }
  };

  const handleEditComplete = useCallback(() => {
    setEditModal({ isOpen: false, lesson: null });
    loadLessons(activeTab); // Tải lại danh sách cho tab hiện tại
  }, [activeTab, loadLessons]);

  // --- NEW HANDLERS FOR QUESTIONS MANAGEMENT ---
  const handleQuestionsTabChange = useCallback((tab) => {
    setQuestionsTab(tab);
    if (tab === 'questions') {
      setLoading(false); // Không cần loading khi chuyển sang tab questions
    }
  }, []);

  const handleLessonSelectForQuestions = useCallback((lessonId) => {
    setSelectedLessonForQuestions(lessonId);
  }, []);

  const handleQuestionsChange = useCallback(() => {
    // Refresh data if needed
    console.log('Questions changed, refreshing data...');
  }, []);
  
  // --- UI HELPER FUNCTIONS ---
  const getTabClassName = useCallback((tabName) => {
    return `px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors duration-200 ${
      activeTab === tabName
        ? 'bg-blue-600 text-white shadow'
        : 'text-gray-600 hover:bg-gray-200'
    }`;
  }, [activeTab]);

  const getQuestionsTabClassName = useCallback((tabName) => {
    return `px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors duration-200 ${
      questionsTab === tabName
        ? 'bg-green-600 text-white shadow'
        : 'text-gray-600 hover:bg-gray-200'
    }`;
  }, [questionsTab]);

  const getStatusBadge = useCallback((status) => {
    return status === 'PUBLISHED' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  }, []);

  const getLevelBadge = useCallback((level) => {
    const colors = {
      'A2': 'bg-blue-100 text-blue-800', 
      'B1': 'bg-indigo-100 text-indigo-800',
      'B2': 'bg-purple-100 text-purple-800', 
      'C1': 'bg-pink-100 text-pink-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  }, []);

  // --- RENDER LOGIC ---
  if (loading && questionsTab === 'lessons') {
    return <div className="flex justify-center items-center h-screen text-lg">Đang tải...</div>;
  }

  const pageTitle = activeTab === 'reading' ? 'bài đọc' : 'bài nghe';

  return (
    <div className="flex flex-wrap mt-4">
      <div className="w-full mb-12 px-4">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
          
          {/* Header & Main Tabs */}
          <div className="rounded-t mb-0 px-4 py-3 border-b">
            <h3 className="font-semibold text-lg text-blueGray-700 mb-4">
              Quản lý bài học
            </h3>
            
            {/* Main Navigation Tabs */}
            <div className="flex space-x-2 mb-4">
              <button 
                onClick={() => handleQuestionsTabChange('lessons')} 
                className={getQuestionsTabClassName('lessons')}
              >
                📚 Quản lý bài học
              </button>
              <button 
                onClick={() => handleQuestionsTabChange('questions')} 
                className={getQuestionsTabClassName('questions')}
              >
                ❓ Quản lý câu hỏi
              </button>
            </div>

            {/* Lesson Type Tabs (chỉ hiển thị khi ở tab bài học) */}
            {questionsTab === 'lessons' && (
              <div className="flex space-x-2">
                <button onClick={() => setActiveTab('reading')} className={getTabClassName('reading')}>
                  📖 Quản lý bài đọc
                </button>
                <button onClick={() => setActiveTab('listening')} className={getTabClassName('listening')}>
                  🎧 Quản lý bài nghe
                </button>
              </div>
            )}
          </div>

          {/* Content based on selected tab */}
          {questionsTab === 'lessons' ? (
            // --- LESSONS MANAGEMENT CONTENT ---
            <>
              {/* Filters */}
              <div className="px-4 py-3 border-b border-blueGray-200">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-64">
                    <input
                      type="text"
                      placeholder={`Tìm kiếm ${pageTitle}...`}
                      className="border border-blueGray-300 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-blueGray-300 px-3 py-2 text-blueGray-600 bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring">
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="DRAFT">Bản nháp</option>
                    <option value="PUBLISHED">Đã xuất bản</option>
                  </select>
                  <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="border border-blueGray-300 px-3 py-2 text-blueGray-600 bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring">
                    <option value="ALL">Tất cả cấp độ</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {error && <div className="px-4 py-3 bg-red-50 border-l-4 border-red-400 text-red-700">{error}</div>}

              {/* Table */}
              <div className="block w-full overflow-x-auto">
                <table className="items-center w-full bg-transparent border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">Tiêu đề</th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">Cấp độ</th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">Trạng thái</th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">Ngày tạo</th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLessons.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-8 text-blueGray-500">Không có {pageTitle} nào.</td></tr>
                    ) : (
                      filteredLessons.map((lesson) => (
                        <tr key={lesson.id}>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-4 whitespace-normal">
                            <div className="font-semibold text-blueGray-600">{lesson.title}</div>
                            <div className="text-blueGray-500 text-xs">{lesson.description?.substring(0, 100)}...</div>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadge(lesson.level)}`}>{lesson.level}</span></td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(lesson.status)}`}>{lesson.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}</span></td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">{new Date(lesson.createdAt).toLocaleDateString('vi-VN')}</td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <div className="flex gap-2">
                              <button onClick={() => handleEdit(lesson)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"><i className="fas fa-edit mr-1"></i>Sửa</button>
                              <button onClick={() => handleStatusChange(lesson.id, lesson.status)} className={`px-2 py-1 rounded text-xs text-white ${lesson.status === 'DRAFT' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}><i className={`fas ${lesson.status === 'DRAFT' ? 'fa-eye' : 'fa-eye-slash'} mr-1`}></i>{lesson.status === 'DRAFT' ? 'Xuất bản' : 'Ẩn'}</button>
                              <button onClick={() => handleDelete(lesson.id, lesson.title)} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"><i className="fas fa-trash mr-1"></i>Xóa</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            // --- QUESTIONS MANAGEMENT CONTENT ---
            <div className="px-6 py-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-blueGray-700">
                    🎯 Quản lý câu hỏi
                  </h3>
                  <p className="text-sm text-blueGray-500">
                    Chọn bài học để quản lý câu hỏi kiểm tra
                  </p>
                </div>
                
                {/* Lesson Selector */}
                <div className="bg-blueGray-50 p-6 rounded-lg border border-blueGray-200">
                  <label className="block text-blueGray-600 text-sm font-bold mb-3">
                    📚 Chọn bài học để quản lý câu hỏi:
                  </label>
                  <select
                    value={selectedLessonForQuestions || ''}
                    onChange={(e) => handleLessonSelectForQuestions(e.target.value)}
                    className="w-full border border-blueGray-300 px-4 py-3 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring"
                  >
                    <option value="">-- Chọn bài học --</option>
                    {lessons.map(lesson => (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.title} - {lesson.level} ({activeTab === 'reading' ? 'Bài đọc' : 'Bài nghe'})
                      </option>
                    ))}
                  </select>
                  
                  {lessons.length === 0 && (
                    <p className="text-sm text-blueGray-500 mt-2">
                      💡 Vui lòng chuyển sang tab "Quản lý bài học" để tải danh sách bài học trước
                    </p>
                  )}
                </div>

                {/* Question Management Component */}
                {selectedLessonForQuestions && (
                  <div className="bg-white p-6 rounded-lg border border-blueGray-200">
                    <QuestionManagement
                      lessonId={selectedLessonForQuestions}
                      lessonType={activeTab === 'reading' ? 'READING' : 'LISTENING'}
                      onQuestionsChange={handleQuestionsChange}
                    />
                  </div>
                )}

                {!selectedLessonForQuestions && lessons.length > 0 && (
                  <div className="text-center py-8 text-blueGray-500">
                    <i className="fas fa-question-circle text-4xl mb-4 text-blueGray-300"></i>
                    <p>Chọn một bài học từ danh sách trên để bắt đầu quản lý câu hỏi</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <EditLessonModal
          lesson={editModal.lesson}
          onClose={() => setEditModal({ isOpen: false, lesson: null })}
          onSuccess={handleEditComplete}
        />
      )}
    </div>
  );
}