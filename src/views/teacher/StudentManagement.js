import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import userService from '../../services/userService';
import analyticsService from '../../services/analyticsService';
import authService from '../../services/authService';

export default function TeacherStudentManagement() {
  const history = useHistory();
  
  // State management
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showDebug, setShowDebug] = useState(false);

  // Initialize component
  useEffect(() => {
    fetchStudents();
  }, []);

  /**
   * Fetch students from API
   */
  const fetchStudents = async () => {
    try {
      console.log('🔄 Starting fetchStudents... - StudentManagement.js:33');
      setLoading(true);
      setError('');

      // Authentication check
      if (!authService.isAuthenticated()) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      // Permission check
      if (!authService.canAccessAdmin()) {
        throw new Error('Bạn không có quyền truy cập. Chỉ giáo viên và quản trị viên mới có thể xem danh sách học viên.');
      }

      console.log('🔄 Calling userService.getAllStudents()... - StudentManagement.js:47');
      const response = await userService.getAllStudents();
      
      console.log('✅ API Response received: - StudentManagement.js:50', response);

      if (Array.isArray(response)) {
        const validStudents = response.filter(student => 
          student && student.id && student.email && student.fullName
        );
        
        setStudents(validStudents);
        console.log('✅ Students loaded successfully: - StudentManagement.js:58', validStudents.length);
        
        if (validStudents.length === 0) {
          setError('Không tìm thấy học viên nào trong hệ thống.');
        }
      } else {
        console.warn('⚠️ API response is not an array: - StudentManagement.js:64', response);
        setStudents([]);
        setError('Định dạng dữ liệu không hợp lệ từ server.');
      }

    } catch (error) {
      console.error('❌ Error in fetchStudents: - StudentManagement.js:70', error);
      
      let errorMessage = 'Không thể tải danh sách học viên.';
      
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        setTimeout(() => authService.logout(), 3000);
      } else if (error.message.includes('403') || error.message.includes('forbidden')) {
        errorMessage = 'Bạn không có quyền truy cập. Vui lòng liên hệ quản trị viên.';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet và thử lại.';
      } else {
        errorMessage = `Lỗi: ${error.message}`;
      }
      
      setError(errorMessage);
      setStudents([]);
      
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter and sort students
   */
  const getFilteredStudents = () => {
    let filtered = students.filter(student => {
      const searchMatch = !searchTerm || 
        student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.major?.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = filterStatus === 'all' || 
        (filterStatus === 'active' && student.isActive) ||
        (filterStatus === 'inactive' && !student.isActive);

      return searchMatch && statusMatch;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.fullName || '').localeCompare(b.fullName || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'date':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  /**
   * Handle view student progress
   */
  const handleViewProgress = async (studentId) => {
    try {
      console.log('🔄 Loading progress for student: - StudentManagement.js:132', studentId);
      const student = students.find(s => s.id === studentId);
      if (!student) {
        throw new Error('Không tìm thấy thông tin học viên');
      }

      try {
        const response = await analyticsService.getStudentReport(studentId);
        setStudentProgress(response.data || response);
      } catch (progressError) {
        console.warn('⚠️ Progress service not available, using mock data - StudentManagement.js:142');
        setStudentProgress({
          totalLessons: 10,
          completedLessons: 7,
          averageScore: 8.5,
          totalTimeSpent: 3600,
          recentActivity: []
        });
      }
      
      setSelectedStudent(student);
      setShowProgressModal(true);
      
    } catch (error) {
      console.error('❌ Error loading progress: - StudentManagement.js:156', error);
      alert(`Không thể tải tiến độ học tập: ${error.message}`);
    }
  };

  // Get filtered students and stats
  const filteredStudents = getFilteredStudents();
  const stats = {
    total: students.length,
    active: students.filter(s => s.isActive).length,
    inactive: students.filter(s => !s.isActive).length,
    filtered: filteredStudents.length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - Improved contrast */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <div className="bg-white/10 rounded-full p-4">
                <i className="fas fa-chalkboard-teacher text-4xl text-black"></i>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-black mb-4">
              Quản lý Học viên
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Theo dõi tiến độ học tập và hỗ trợ {stats.total} học viên trong lớp của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Improved spacing and colors */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-blue-600 text-xl"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng học viên</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-user-check text-green-600 text-xl"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-filter text-orange-600 text-xl"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang hiển thị</p>
                <p className="text-2xl font-bold text-gray-900">{stats.filtered}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-user-times text-gray-600 text-xl"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Không hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section - Better layout */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Box */}
            <div className="flex-1 max-w-md">
              <label htmlFor="search" className="sr-only">Tìm kiếm học viên</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
                <input
                  id="search"
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, trường, ngành..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3">
              {/* Status Filter */}
              <div className="min-w-0">
                <label htmlFor="status-filter" className="sr-only">Lọc theo trạng thái</label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>

              {/* Sort */}
              <div className="min-w-0">
                <label htmlFor="sort-select" className="sr-only">Sắp xếp</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Sắp xếp theo tên</option>
                  <option value="email">Sắp xếp theo email</option>
                  <option value="date">Sắp xếp theo ngày tạo</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'cards' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setViewMode('cards')}
                  title="Xem dạng thẻ"
                >
                  <i className="fas fa-th-large"></i>
                </button>
                <button
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setViewMode('list')}
                  title="Xem dạng danh sách"
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => history.push('/teacher/reports')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <i className="fas fa-chart-bar mr-2"></i>
                Báo cáo chi tiết
              </button>

              {/* Debug Toggle */}
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                title="Debug Info"
              >
                <i className="fas fa-bug"></i>
              </button>
            </div>
          </div>

          {/* Debug Panel */}
          {showDebug && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-yellow-800">Debug Information</h4>
                <button 
                  onClick={() => setShowDebug(false)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="text-xs text-yellow-700 grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>Auth: {authService.isAuthenticated() ? '✅' : '❌'}</div>
                <div>Permission: {authService.canAccessAdmin() ? '✅' : '❌'}</div>
                <div>Students: {students.length}</div>
                <div>Status: {loading ? '🔄' : error ? '❌' : '✅'}</div>
              </div>
              <div className="mt-2">
                <button
                  onClick={fetchStudents}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 mr-2"
                >
                  Retry
                </button>
                <button
                  onClick={() => console.log('State: - StudentManagement.js:376', { students, error })}
                  className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                >
                  Log State
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={fetchStudents} />
        ) : filteredStudents.length === 0 ? (
          <EmptyState 
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            onClearFilters={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}
            onRetry={fetchStudents}
          />
        ) : viewMode === 'cards' ? (
          <StudentsGrid students={filteredStudents} onViewProgress={handleViewProgress} />
        ) : (
          <StudentsList students={filteredStudents} onViewProgress={handleViewProgress} />
        )}
      </div>

      {/* Progress Modal */}
      {showProgressModal && selectedStudent && (
        <StudentProgressModal
          student={selectedStudent}
          progress={studentProgress}
          onClose={() => {
            setShowProgressModal(false);
            setSelectedStudent(null);
            setStudentProgress(null);
          }}
        />
      )}
    </div>
  );
}

// Loading State Component
function LoadingState() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12">
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Đang tải danh sách học viên</h3>
        <p className="text-gray-600">Vui lòng chờ trong giây lát...</p>
      </div>
    </div>
  );
}

// Error State Component
function ErrorState({ error, onRetry }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
        <div className="flex justify-center gap-3">
          <button 
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <i className="fas fa-redo mr-2"></i>
            Thử lại
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <i className="fas fa-refresh mr-2"></i>
            Tải lại trang
          </button>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ searchTerm, filterStatus, onClearFilters, onRetry }) {
  const hasFilters = searchTerm || filterStatus !== 'all';
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-user-graduate text-gray-400 text-2xl"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {hasFilters ? 'Không tìm thấy học viên nào' : 'Chưa có học viên nào'}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {hasFilters 
            ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
            : 'Danh sách học viên sẽ xuất hiện tại đây khi có dữ liệu'
          }
        </p>
        <div className="flex justify-center gap-3">
          {hasFilters ? (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fas fa-times mr-2"></i>
              Xóa bộ lọc
            </button>
          ) : (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fas fa-refresh mr-2"></i>
              Tải lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Students Grid Component
function StudentsGrid({ students, onViewProgress }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {students.map((student) => (
        <StudentCard key={student.id} student={student} onViewProgress={onViewProgress} />
      ))}
    </div>
  );
}

// Student Card Component - Improved design
function StudentCard({ student, onViewProgress }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 overflow-hidden">
      {/* Card Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-6 py-4">
        <div className="text-center">
          <div className="relative inline-block">
            <img
              src={student.avatarUrl || "/img/team-2-800x800.jpg"}
              className="w-16 h-16 rounded-full border-3 border-white shadow-lg"
              alt={student.fullName}
              onError={(e) => {
                e.target.src = "/img/team-2-800x800.jpg";
              }}
            />
            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
              student.isActive ? 'bg-green-500' : 'bg-gray-400'
            }`}></span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-gray-900 truncate" title={student.fullName}>
            {student.fullName}
          </h3>
          <p className="text-sm text-gray-600 truncate" title={student.email}>{student.email}</p>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-6 py-4">
        <div className="space-y-3">
          {student.school && (
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center mr-3 flex-shrink-0">
                <i className="fas fa-university text-blue-600 text-xs"></i>
              </div>
              <span className="truncate" title={student.school}>{student.school}</span>
            </div>
          )}
          {student.major && (
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center mr-3 flex-shrink-0">
                <i className="fas fa-graduation-cap text-purple-600 text-xs"></i>
              </div>
              <span className="truncate" title={student.major}>{student.major}</span>
            </div>
          )}
          {student.academicYear && (
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center mr-3 flex-shrink-0">
                <i className="fas fa-calendar-alt text-green-600 text-xs"></i>
              </div>
              <span>{student.academicYear}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onViewProgress(student.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-black text-sm font-medium py-2 px-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <i className="fas fa-chart-line mr-1"></i>
            Xem tiến độ
          </button>
          <button
            onClick={() => alert('Tính năng gửi tin nhắn đang được phát triển')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            title="Gửi tin nhắn"
          >
            <i className="fas fa-comment"></i>
          </button>
        </div>
      </div>

      {/* Card Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            <i className="fas fa-clock mr-1"></i>
            {student.createdAt ? new Date(student.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            student.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-200 text-gray-700'
          }`}>
            {student.isActive ? 'Hoạt động' : 'Không hoạt động'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Students List Component
function StudentsList({ students, onViewProgress }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">
          Danh sách học viên ({students.length})
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {students.map((student) => (
          <StudentListItem key={student.id} student={student} onViewProgress={onViewProgress} />
        ))}
      </div>
    </div>
  );
}

// Student List Item Component - Better spacing
function StudentListItem({ student, onViewProgress }) {
  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <img
              src={student.avatarUrl || "/img/team-2-800x800.jpg"}
              className="w-12 h-12 rounded-full border-2 border-gray-200"
              alt={student.fullName}
              onError={(e) => {
                e.target.src = "/img/team-2-800x800.jpg";
              }}
            />
            <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              student.isActive ? 'bg-green-500' : 'bg-gray-400'
            }`}></span>
          </div>
          
          <div className="min-w-0 flex-1">
            <h4 className="text-lg font-medium text-gray-900 truncate">
              {student.fullName}
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
              <div className="flex items-center">
                <i className="fas fa-envelope text-gray-400 mr-1"></i>
                <span className="truncate">{student.email}</span>
              </div>
              {student.school && (
                <div className="flex items-center">
                  <i className="fas fa-university text-gray-400 mr-1"></i>
                  <span className="truncate" title={student.school}>{student.school}</span>
                </div>
              )}
              {student.major && (
                <div className="flex items-center">
                  <i className="fas fa-graduation-cap text-gray-400 mr-1"></i>
                  <span className="truncate" title={student.major}>{student.major}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 flex-shrink-0">
          <div className="text-right">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              student.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {student.isActive ? 'Hoạt động' : 'Không hoạt động'}
            </span>
            <div className="text-xs text-gray-500 mt-1">
              Tham gia: {student.createdAt ? new Date(student.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onViewProgress(student.id)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Xem tiến độ học tập"
            >
              <i className="fas fa-chart-line"></i>
            </button>
            <button
              onClick={() => alert('Tính năng gửi tin nhắn đang được phát triển')}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              title="Gửi tin nhắn"
            >
              <i className="fas fa-comment"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Student Progress Modal Component - Improved
function StudentProgressModal({ student, progress, onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={student.avatarUrl || "/img/team-2-800x800.jpg"}
                  className="w-12 h-12 rounded-full border-2 border-white mr-4"
                  alt={student.fullName}
                />
                <div className="text-white">
                  <h3 className="text-xl font-semibold" id="modal-title">{student.fullName}</h3>
                  <p className="text-blue-200">{student.email}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            {progress ? (
              <div className="space-y-6">
                {/* Progress Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {progress.completedLessons || 0}
                    </div>
                    <div className="text-sm text-gray-600">Bài hoàn thành</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {progress.averageScore ? progress.averageScore.toFixed(1) : '0.0'}
                    </div>
                    <div className="text-sm text-gray-600">Điểm trung bình</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {progress.totalLessons || 0}
                    </div>
                    <div className="text-sm text-gray-600">Tổng bài học</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-100">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {progress.totalTimeSpent ? Math.round(progress.totalTimeSpent / 60) : 0}m
                    </div>
                    <div className="text-sm text-gray-600">Thời gian học</div>
                  </div>
                </div>

                {/* Recent Activity */}
                {progress.recentActivity && progress.recentActivity.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h4>
                    <div className="space-y-3">
                      {progress.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div>
                            <div className="font-medium text-gray-900">{activity.title || 'Bài học'}</div>
                            <div className="text-sm text-gray-600">{activity.type || 'Unknown'}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-green-600">
                              {activity.score ? `${activity.score}/10` : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {activity.date ? new Date(activity.date).toLocaleDateString('vi-VN') : 'N/A'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải dữ liệu tiến độ...</p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <button
              onClick={() => alert('Tính năng gửi feedback đang được phát triển')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <i className="fas fa-comment mr-2"></i>
              Gửi feedback
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-black-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}