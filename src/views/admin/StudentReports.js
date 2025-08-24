import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import analyticsService from '../../services/analyticsService';

export default function StudentReports() {
  const history = useHistory();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reportModal, setReportModal] = useState(false);

  useEffect(() => {
    loadStudentsReports();
  }, []);

  useEffect(() => {
    // Filter students based on search term
    if (!searchTerm) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => 
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.school && student.school.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const loadStudentsReports = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Loading students reports...');

      const response = await analyticsService.getAllStudentsReports();
      setStudents(response.data);
      setFilteredStudents(response.data);

      console.log('✅ Students reports loaded:', response.data.length, 'students');
    } catch (error) {
      console.error('❌ Error loading students reports:', error);
      setError('Không thể tải danh sách báo cáo học viên. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (studentId) => {
    try {
      console.log(`🔄 Loading detailed report for student ${studentId}`);
      const response = await analyticsService.getStudentReport(studentId);
      setSelectedStudent(response.data);
      setReportModal(true);
    } catch (error) {
      console.error(`❌ Error loading student ${studentId} report:`, error);
      alert('Không thể tải báo cáo chi tiết. Vui lòng thử lại.');
    }
  };

  const handleExportPdf = async (studentId) => {
    try {
      console.log(`🔄 Exporting PDF for student ${studentId}`);
      await analyticsService.exportStudentPdf(studentId);
    } catch (error) {
      console.error(`❌ Error exporting PDF for student ${studentId}:`, error);
      alert('Không thể xuất file PDF. Tính năng đang được phát triển.');
    }
  };

  const handleExportAllExcel = async () => {
    try {
      console.log('🔄 Exporting all students to Excel');
      await analyticsService.exportStudentsExcel();
    } catch (error) {
      console.error('❌ Error exporting Excel:', error);
      alert('Không thể xuất file Excel. Tính năng đang được phát triển.');
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600">Đang tải báo cáo học viên...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
        <div className="flex">
          <i className="fas fa-exclamation-triangle text-red-500 text-xl mr-3"></i>
          <div>
            <h3 className="text-red-800 font-semibold">Lỗi tải dữ liệu</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button 
              onClick={loadStudentsReports}
              className="mt-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              <i className="fas fa-redo mr-2"></i>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-reports">
      <div className="relative bg-blueGray-100 min-h-screen">
        <div className="relative bg-lightBlue-600 md:pt-32 pb-32 pt-12">
          <div className="px-4 md:px-10 mx-auto w-full">
            {/* Header */}
            <div className="mb-12 xl:mb-0 px-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-white text-3xl font-semibold">
                    Báo cáo học viên 👨‍🎓
                  </h1>
                  <p className="text-lightBlue-200 text-lg mt-2">
                    Theo dõi tiến độ và thành tích của {students.length} học viên
                  </p>
                </div>
                <button
                  onClick={handleExportAllExcel}
                  className="bg-green-500 text-white active:bg-green-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                >
                  <i className="fas fa-file-excel mr-2"></i>
                  Export Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          <div className="flex flex-wrap">
            <div className="w-full px-4">
              <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-white">
                {/* Search and Filter */}
                <div className="rounded-t mb-0 px-4 py-3 border-0">
                  <div className="flex flex-wrap items-center">
                    <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                      <h3 className="font-semibold text-base text-blueGray-700">
                        Danh sách học viên ({filteredStudents.length})
                      </h3>
                    </div>
                    <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Tìm kiếm học viên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm border border-blueGray-300 outline-none focus:outline-none focus:ring"
                          />
                          <i className="fas fa-search absolute right-3 top-3 text-blueGray-300"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Students Table */}
                <div className="block w-full overflow-x-auto">
                  <table className="items-center w-full bg-transparent border-collapse">
                    <thead>
                      <tr>
                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                          Học viên
                        </th>
                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                          Bài học hoàn thành
                        </th>
                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                          Điểm TB
                        </th>
                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                          Thời gian học
                        </th>
                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                          Từ vựng
                        </th>
                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                          Hoạt động gần nhất
                        </th>
                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.studentId}>
                          <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                            <div>
                              <span className="font-semibold text-blueGray-600">
                                {student.studentName}
                              </span>
                              <br />
                              <span className="text-xs text-blueGray-500">
                                {student.studentEmail}
                              </span>
                              {student.school && (
                                <>
                                  <br />
                                  <span className="text-xs text-blueGray-400">
                                    {student.school} • {student.major} • {student.academicYear}
                                  </span>
                                </>
                              )}
                            </div>
                          </th>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-blueGray-600 text-sm">
                                {student.totalLessonsCompleted || 0}
                              </span>
                              <div className="text-xs text-blueGray-500">
                                <span className="mr-2">Nghe: {student.listeningLessonsCompleted || 0}</span>
                                <span>Đọc: {student.readingLessonsCompleted || 0}</span>
                              </div>
                            </div>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <div className="flex items-center">
                              <span className={`font-bold text-sm ${
                                (student.averageScore || 0) >= 8 ? 'text-green-600' :
                                (student.averageScore || 0) >= 6 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {analyticsService.formatScore(student.averageScore)}
                              </span>
                            </div>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <span className="font-semibold text-blueGray-600">
                              {analyticsService.formatTime(student.totalTimeStudiedSeconds)}
                            </span>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <span className="font-semibold text-blueGray-600">
                              {student.vocabularyLearned || 0} từ
                            </span>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <span className="text-blueGray-600">
                              {student.lastActivity ? 
                                new Date(student.lastActivity).toLocaleDateString('vi-VN') : 
                                'Chưa có hoạt động'
                              }
                            </span>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewReport(student.studentId)}
                                className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none ease-linear transition-all duration-150"
                                title="Xem báo cáo chi tiết"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                onClick={() => handleExportPdf(student.studentId)}
                                className="bg-red-500 text-white active:bg-red-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none ease-linear transition-all duration-150"
                                title="Xuất PDF"
                              >
                                <i className="fas fa-file-pdf"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8">
                      <i className="fas fa-user-graduate text-4xl text-blueGray-300 mb-4"></i>
                      <p className="text-blueGray-500">
                        {searchTerm ? 'Không tìm thấy học viên nào phù hợp' : 'Chưa có học viên nào'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Report Modal */}
      {reportModal && selectedStudent && (
        <StudentReportModal
          student={selectedStudent}
          onClose={() => {
            setReportModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
}

// Student Report Modal Component
function StudentReportModal({ student, onClose }) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Modal Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Báo cáo chi tiết - {student.studentName}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Student Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Email:</p>
                  <p className="font-semibold">{student.studentEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trường:</p>
                  <p className="font-semibold">{student.school || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Chuyên ngành:</p>
                  <p className="font-semibold">{student.major || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Năm học:</p>
                  <p className="font-semibold">{student.academicYear || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {student.totalLessonsCompleted || 0}
                </div>
                <div className="text-sm text-blue-600">Bài hoàn thành</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analyticsService.formatScore(student.averageScore)}
                </div>
                <div className="text-sm text-green-600">Điểm trung bình</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {analyticsService.formatTime(student.totalTimeStudiedSeconds)}
                </div>
                <div className="text-sm text-purple-600">Thời gian học</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {student.vocabularyLearned || 0}
                </div>
                <div className="text-sm text-orange-600">Từ vựng</div>
              </div>
            </div>

            {/* Lesson Details */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Chi tiết bài học</h4>
              <div className="max-h-96 overflow-y-auto">
                {student.lessonDetails && student.lessonDetails.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bài học
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Loại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Điểm
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {student.lessonDetails.map((lesson, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {lesson.lessonTitle}
                            </div>
                            <div className="text-sm text-gray-500">
                              {analyticsService.getLevelDisplayName(lesson.level)} • {lesson.categoryName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {analyticsService.getLessonTypeDisplayName(lesson.lessonType)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lesson.score ? analyticsService.formatScore(lesson.score) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              lesson.isCompleted 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {lesson.isCompleted ? 'Hoàn thành' : 'Đang học'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-book-open text-4xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500">Học viên chưa có hoạt động học tập</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
