import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import userService from '../../services/userService';
import analyticsService from '../../services/analyticsService';

export default function TeacherStudentManagement() {
  const history = useHistory();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'

  // Fetch students data
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers('STUDENT');
      setStudents(response || []);
    } catch (error) {
      console.error('Error fetching students: - StudentManagement.js:23', error);
      setStudents([]);
      alert('Không thể tải danh sách học viên. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // View student progress
  const handleViewProgress = async (studentId) => {
    try {
      setLoading(true);
      const response = await analyticsService.getStudentReport(studentId);
      setStudentProgress(response.data);
      setSelectedStudent(students.find(s => s.id === studentId));
      setShowProgressModal(true);
    } catch (error) {
      console.error('Error fetching student progress: - StudentManagement.js:40', error);
      alert('Không thể tải tiến độ học tập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to detailed reports
  const handleViewDetailedReports = () => {
    history.push('/admin/student-reports');
  };

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.major?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading && !showProgressModal) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600">Đang tải danh sách học viên...</span>
      </div>
    );
  }

  return (
    <div className="teacher-student-management">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 md:pt-32 pb-32 pt-12 mb-8">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">
              <i className="fas fa-chalkboard-teacher mr-3"></i>
              Học viên của tôi
            </h1>
            <p className="text-xl text-blue-200">
              Theo dõi tiến độ và hỗ trợ {filteredStudents.length} học viên trong lớp
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-4 md:px-10 mx-auto w-full -mt-24 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-blue-600 mb-2">{students.length}</div>
            <div className="text-gray-600 font-semibold">Tổng học viên</div>
            <i className="fas fa-users text-blue-500 text-2xl mt-2"></i>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-green-600 mb-2">{students.filter(s => s.isActive).length}</div>
            <div className="text-gray-600 font-semibold">Đang hoạt động</div>
            <i className="fas fa-user-check text-green-500 text-2xl mt-2"></i>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {Math.round(students.length * 0.7)}
            </div>
            <div className="text-gray-600 font-semibold">Học tích cực</div>
            <i className="fas fa-chart-line text-orange-500 text-2xl mt-2"></i>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.round(students.length * 0.15)}
            </div>
            <div className="text-gray-600 font-semibold">Cần hỗ trợ</div>
            <i className="fas fa-hands-helping text-purple-500 text-2xl mt-2"></i>
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="px-4 md:px-10 mx-auto w-full mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm kiếm học viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i className="fas fa-search absolute left-3 top-4 text-gray-400"></i>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  className={`px-3 py-2 rounded ${viewMode === 'cards' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-blue-500'}`}
                  onClick={() => setViewMode('cards')}
                >
                  <i className="fas fa-th-large"></i>
                </button>
                <button
                  className={`px-3 py-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-blue-500'}`}
                  onClick={() => setViewMode('list')}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>

              {/* Detailed Reports */}
              <button
                onClick={handleViewDetailedReports}
                className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <i className="fas fa-chart-bar mr-2"></i>
                Báo cáo chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Students Display */}
      <div className="px-4 md:px-10 mx-auto w-full">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <i className="fas fa-user-graduate text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl text-gray-600 mb-2">
              {searchTerm ? 'Không tìm thấy học viên nào' : 'Chưa có học viên nào'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Hãy thử từ khóa khác' : 'Danh sách học viên sẽ xuất hiện tại đây'}
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          // Cards View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Student Card Header */}
                <div className="relative p-6 text-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg">
                  <div className="relative inline-block">
                    <img
                      src={student.avatarUrl || "/img/team-2-800x800.jpg"}
                      className="w-20 h-20 rounded-full mx-auto border-4 border-white shadow-lg"
                      alt={student.fullName}
                    />
                    <span className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-3 border-white ${
                      student.isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mt-3 mb-1">
                    {student.fullName}
                  </h4>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>

                {/* Student Card Body */}
                <div className="p-6">
                  <div className="space-y-3 text-sm">
                    {student.school && (
                      <div className="flex items-center text-gray-600">
                        <i className="fas fa-university w-5 mr-2 text-blue-500"></i>
                        <span className="truncate">{student.school}</span>
                      </div>
                    )}
                    {student.major && (
                      <div className="flex items-center text-gray-600">
                        <i className="fas fa-graduation-cap w-5 mr-2 text-purple-500"></i>
                        <span className="truncate">{student.major}</span>
                      </div>
                    )}
                    {student.academicYear && (
                      <div className="flex items-center text-gray-600">
                        <i className="fas fa-calendar-alt w-5 mr-2 text-green-500"></i>
                        <span>{student.academicYear}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6 flex space-x-2">
                    <button
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-3 rounded transition-colors"
                      onClick={() => handleViewProgress(student.id)}
                    >
                      <i className="fas fa-chart-line mr-1"></i>
                      Xem tiến độ
                    </button>
                    <button
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold py-2 px-3 rounded transition-colors"
                      onClick={() => alert('Tính năng gửi tin nhắn đang được phát triển')}
                      title="Gửi tin nhắn"
                    >
                      <i className="fas fa-comment"></i>
                    </button>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="bg-gray-50 px-6 py-3 rounded-b-lg border-t">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>
                      <i className="fas fa-clock mr-1"></i>
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      student.isActive 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Danh sách học viên ({filteredStudents.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <div key={student.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={student.avatarUrl || "/img/team-2-800x800.jpg"}
                          className="w-14 h-14 rounded-full border-2 border-gray-200"
                          alt={student.fullName}
                        />
                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          student.isActive ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                          {student.fullName}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center">
                            <i className="fas fa-envelope w-4 mr-1"></i>
                            <span className="truncate">{student.email}</span>
                          </div>
                          {student.school && (
                            <div className="flex items-center">
                              <i className="fas fa-university w-4 mr-1"></i>
                              <span className="truncate">{student.school}</span>
                            </div>
                          )}
                          {student.major && (
                            <div className="flex items-center">
                              <i className="fas fa-graduation-cap w-4 mr-1"></i>
                              <span className="truncate">{student.major}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          student.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          Tham gia: {student.createdAt ? new Date(student.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          onClick={() => handleViewProgress(student.id)}
                          title="Xem tiến độ học tập"
                        >
                          <i className="fas fa-chart-line"></i>
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => alert('Tính năng gửi tin nhắn đang được phát triển')}
                          title="Gửi tin nhắn"
                        >
                          <i className="fas fa-comment"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Student Progress Modal */}
      {showProgressModal && selectedStudent && studentProgress && (
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

// Student Progress Modal Component
function StudentProgressModal({ student, progress, onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-white">
                <img
                  src={student.avatarUrl || "/img/team-2-800x800.jpg"}
                  className="w-12 h-12 rounded-full border-2 border-white mr-4"
                  alt={student.fullName}
                />
                <div>
                  <h3 className="text-xl font-semibold">{student.fullName}</h3>
                  <p className="text-blue-200">{student.email}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 transition-colors"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {/* Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {progress.totalLessonsCompleted || 0}
                </div>
                <div className="text-sm text-blue-600">Bài hoàn thành</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {progress.averageScore ? Math.round(progress.averageScore * 10) / 10 : 0}
                </div>
                <div className="text-sm text-green-600">Điểm trung bình</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((progress.totalTimeStudiedSeconds || 0) / 60)} phút
                </div>
                <div className="text-sm text-purple-600">Thời gian học</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {progress.vocabularyLearned || 0}
                </div>
                <div className="text-sm text-orange-600">Từ vựng học</div>
              </div>
            </div>

            {/* Student Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Thông tin học viên</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Trường:</span>
                  <span className="ml-2 font-medium">{progress.school || 'Chưa cập nhật'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Chuyên ngành:</span>
                  <span className="ml-2 font-medium">{progress.major || 'Chưa cập nhật'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Năm học:</span>
                  <span className="ml-2 font-medium">{progress.academicYear || 'Chưa cập nhật'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Hoạt động cuối:</span>
                  <span className="ml-2 font-medium">
                    {progress.lastActivity ? new Date(progress.lastActivity).toLocaleDateString('vi-VN') : 'Chưa có'}
                  </span>
                </div>
              </div>
            </div>

            {/* Lesson Details */}
            {progress.lessonDetails && progress.lessonDetails.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Chi tiết bài học gần nhất</h4>
                <div className="space-y-3">
                  {progress.lessonDetails.slice(0, 5).map((lesson, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{lesson.lessonTitle || `Bài ${index + 1}`}</div>
                        <div className="text-sm text-gray-500">
                          {lesson.lessonType === 'LISTENING' ? 'Bài nghe' : 'Bài đọc'} • 
                          {lesson.level || 'Cơ bản'}
                        </div>
                      </div>
                      <div className="text-right">
                        {lesson.score && (
                          <div className="font-semibold text-blue-600">
                            {Math.round(lesson.score * 10) / 10}/10
                          </div>
                        )}
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          lesson.isCompleted 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {lesson.isCompleted ? 'Hoàn thành' : 'Đang học'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <button
              onClick={() => alert('Tính năng gửi feedback đang được phát triển')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <i className="fas fa-comment mr-2"></i>
              Gửi feedback
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}