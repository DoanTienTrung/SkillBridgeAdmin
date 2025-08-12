// Tạo file views/admin/LessonManagement.js
import React, { useState, useEffect } from 'react';
import lessonService from '../../services/lessonService';
import EditLessonModal from '../../components/EditLessonModal';

export default function LessonManagement() {
  // State management
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');

  // Modal states
  const [editModal, setEditModal] = useState({
    isOpen: false,
    lesson: null
  });

  // Load lessons on component mount
  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await lessonService.getAllLessons();
      setLessons(response.data || []);
      
    } catch (error) {
      console.error('Failed to load lessons:', error);
      setError('Không thể tải danh sách bài học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Filter lessons based on search and filters
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || lesson.status === statusFilter;
    const matchesLevel = levelFilter === 'ALL' || lesson.level === levelFilter;
    
    return matchesSearch && matchesStatus && matchesLevel;
  });

  // Handle edit lesson
  const handleEdit = (lesson) => {
    setEditModal({
      isOpen: true,
      lesson: lesson
    });
  };

  // Handle delete lesson
  const handleDelete = async (lessonId, lessonTitle) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa bài học "${lessonTitle}"?\nHành động này không thể hoàn tác.`
    );
    
    if (!confirmed) return;

    try {
      await lessonService.deleteLesson(lessonId);
      
      // Remove from UI
      setLessons(lessons.filter(lesson => lesson.id !== lessonId));
      
      alert('Xóa bài học thành công!');
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      alert('Không thể xóa bài học. Vui lòng thử lại.');
    }
  };

  // Handle status change
  const handleStatusChange = async (lessonId, currentStatus) => {
    const newStatus = currentStatus === 'DRAFT' ? 'PUBLISHED' : 'DRAFT';
    
    try {
      const response = await lessonService.updateLessonStatus(lessonId, newStatus);
      
      // Update in UI
      setLessons(lessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, status: newStatus }
          : lesson
      ));
      
      alert(`Chuyển trạng thái thành ${newStatus === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'} thành công!`);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Không thể thay đổi trạng thái. Vui lòng thử lại.');
    }
  };

  // Handle edit modal close and refresh
  const handleEditComplete = () => {
    setEditModal({ isOpen: false, lesson: null });
    loadLessons(); // Refresh list
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    if (status === 'PUBLISHED') {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  // Get level badge color
  const getLevelBadge = (level) => {
    const colors = {
      'A2': 'bg-blue-100 text-blue-800',
      'B1': 'bg-yellow-100 text-yellow-800',
      'B2': 'bg-orange-100 text-orange-800',
      'C1': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap mt-4">
      <div className="w-full mb-12 px-4">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
          
          {/* Header */}
          <div className="rounded-t mb-0 px-4 py-3 border-0">
            <div className="flex flex-wrap items-center">
              <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                <h3 className="font-semibold text-base text-blueGray-700">
                  Quản lý bài nghe
                </h3>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 py-3 border-b border-blueGray-200">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài học..."
                  className="border border-blueGray-300 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <select
                className="border border-blueGray-300 px-3 py-2 text-blueGray-600 bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="DRAFT">Bản nháp</option>
                <option value="PUBLISHED">Đã xuất bản</option>
              </select>

              {/* Level Filter */}
              <select
                className="border border-blueGray-300 px-3 py-2 text-blueGray-600 bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="ALL">Tất cả cấp độ</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border-l-4 border-red-400">
              <div className="text-red-700">{error}</div>
            </div>
          )}

          {/* Table */}
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Tiêu đề
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Cấp độ
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Trạng thái
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Ngày tạo
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-blueGray-500">
                      Không có bài học nào
                    </td>
                  </tr>
                ) : (
                  filteredLessons.map((lesson) => (
                    <tr key={lesson.id}>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <div className="font-semibold text-blueGray-600">
                          {lesson.title}
                        </div>
                        <div className="text-blueGray-500 text-xs">
                          {lesson.description?.substring(0, 100)}...
                        </div>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelBadge(lesson.level)}`}>
                          {lesson.level}
                        </span>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(lesson.status)}`}>
                          {lesson.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                        </span>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        {new Date(lesson.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <div className="flex gap-2">
                          {/* Edit Button */}
                          <button
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                            onClick={() => handleEdit(lesson)}
                          >
                            <i className="fas fa-edit mr-1"></i>
                            Sửa
                          </button>

                          {/* Status Toggle Button */}
                          <button
                            className={`px-2 py-1 rounded text-xs ${
                              lesson.status === 'DRAFT'
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-gray-500 hover:bg-gray-600 text-white'
                            }`}
                            onClick={() => handleStatusChange(lesson.id, lesson.status)}
                          >
                            <i className={`fas ${lesson.status === 'DRAFT' ? 'fa-eye' : 'fa-eye-slash'} mr-1`}></i>
                            {lesson.status === 'DRAFT' ? 'Xuất bản' : 'Ẩn'}
                          </button>

                          {/* Delete Button */}
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                            onClick={() => handleDelete(lesson.id, lesson.title)}
                          >
                            <i className="fas fa-trash mr-1"></i>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <EditLessonModal
          lesson={editModal.lesson}
          onClose={handleEditComplete}
          onSuccess={handleEditComplete}
        />
      )}
    </div>
  );
}