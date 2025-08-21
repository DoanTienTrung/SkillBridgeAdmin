import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import EditUserModal from '../../components/EditUserModal';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // CRUD operations
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers('STUDENT');
      setStudents(response || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      alert('Không thể tải danh sách học viên. Vui lòng kiểm tra kết nối API.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Bạn có chắc muốn xóa học viên này?')) {
      try {
        await userService.deleteUser(studentId);
        fetchStudents(); // Refresh list
        alert('Đã xóa học viên thành công');
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Có lỗi xảy ra khi xóa học viên');
      }
    }
  };

  const handleToggleActive = async (studentId) => {
    try {
      await userService.toggleUserStatus(studentId);
      fetchStudents(); // Refresh list
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Có lỗi xảy ra khi thay đổi trạng thái');
    }
  };

  const handleResetPassword = async (studentId) => {
    if (window.confirm('Reset mật khẩu cho học viên này?')) {
      try {
        const result = await userService.resetPassword(studentId);
        alert(`Mật khẩu mới: ${result.newPassword || 'Đã gửi qua email'}`);
      } catch (error) {
        console.error('Error resetting password:', error);
        alert('Có lỗi xảy ra khi reset mật khẩu');
      }
    }
  };

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.school?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditSuccess = () => {
    fetchStudents();
    setShowEditModal(false);
    setSelectedStudent(null);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setSelectedStudent(null);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap">
      <div className="w-full px-4">
        {/* Statistics Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Tổng học viên</div>
            <div className="text-2xl font-bold text-blue-600">{students.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Đang hoạt động</div>
            <div className="text-2xl font-bold text-green-600">{students.filter(s => s.isActive).length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Vô hiệu hóa</div>
            <div className="text-2xl font-bold text-red-600">{students.filter(s => !s.isActive).length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Hôm nay</div>
            <div className="text-2xl font-bold text-purple-600">0</div>
          </div>
        </div>

        {/* Header */}
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
          <div className="rounded-t mb-0 px-4 py-3 border-0">
            <div className="flex flex-wrap items-center">
              <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                <h3 className="font-semibold text-base text-blueGray-700">
                  Quản lý Học viên ({filteredStudents.length})
                </h3>
              </div>
              <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                <button
                  className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  onClick={() => alert('Chức năng thêm học viên - sử dụng Admin User Management để tạo user với role STUDENT')}
                >
                  <i className="fas fa-plus mr-1"></i>
                  Thêm học viên mới
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 pb-4">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc trường..."
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Học viên
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Email
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Trạng thái
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Trường học
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
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      <div className="flex items-center">
                        <img
                          src={student.avatarUrl || "/img/team-2-800x800.jpg"}
                          className="h-12 w-12 bg-white rounded-full border"
                          alt="..."
                        />
                        <div className="ml-3">
                          <span className="font-bold">{student.fullName}</span>
                          <br />
                          <span className="text-xs text-blueGray-500">
                            {student.major || 'Chưa cập nhật'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {student.email}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        student.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {student.school || 'Chưa cập nhật'}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowEditModal(true);
                          }}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className={`${student.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`}
                          onClick={() => handleToggleActive(student.id)}
                          title={student.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        >
                          <i className={`fas ${student.isActive ? 'fa-ban' : 'fa-check'}`}></i>
                        </button>
                        <button
                          className="text-yellow-500 hover:text-yellow-700"
                          onClick={() => handleResetPassword(student.id)}
                          title="Reset mật khẩu"
                        >
                          <i className="fas fa-key"></i>
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteStudent(student.id)}
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Không tìm thấy học viên nào' : 'Chưa có học viên nào'}
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && selectedStudent && (
          <EditUserModal
            user={selectedStudent}
            onClose={handleEditClose}
            onSuccess={handleEditSuccess}
          />
        )}
      </div>
    </div>
  );
}
