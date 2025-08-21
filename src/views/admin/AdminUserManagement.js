import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import EditUserModal from '../../components/EditUserModal';
import CreateUserModal from '../../components/CreateUserModal';
import UserDetailsModal from '../../components/UserDetailsModal';

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Stats
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    studentsCount: 0,
    teachersCount: 0,
    adminsCount: 0
  });

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [selectedRole]);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers(selectedRole || null);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      alert('Không thể tải danh sách người dùng. Vui lòng kiểm tra kết nối API.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const stats = await userService.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Calculate stats from current users data
      setUserStats({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        studentsCount: users.filter(u => u.role === 'STUDENT').length,
        teachersCount: users.filter(u => u.role === 'TEACHER').length,
        adminsCount: users.filter(u => u.role === 'ADMIN').length
      });
    }
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.school?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Handle user actions
  const handleToggleActive = async (userId) => {
    try {
      await userService.toggleUserStatus(userId);
      fetchUsers(); // Refresh list
      fetchUserStats(); // Refresh stats
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Có lỗi xảy ra khi thay đổi trạng thái người dùng');
    }
  };

  const handleResetPassword = async (userId) => {
    if (window.confirm('Bạn có chắc muốn reset mật khẩu cho người dùng này?')) {
      try {
        const result = await userService.resetPassword(userId);
        alert(`Mật khẩu mới: ${result.newPassword || 'Đã gửi qua email'}`);
      } catch (error) {
        console.error('Error resetting password:', error);
        alert('Có lỗi xảy ra khi reset mật khẩu');
      }
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Bạn có chắc muốn xóa người dùng "${userName}"?`)) {
      try {
        await userService.deleteUser(userId);
        fetchUsers(); // Refresh list
        fetchUserStats(); // Refresh stats
        alert('Đã xóa người dùng thành công');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Có lỗi xảy ra khi xóa người dùng');
      }
    }
  };

  // Handle bulk actions
  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map(user => user.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      alert('Vui lòng chọn ít nhất một người dùng');
      return;
    }

    const confirmMessage = action === 'delete' 
      ? `Bạn có chắc muốn xóa ${selectedUsers.length} người dùng đã chọn?`
      : `Bạn có chắc muốn ${action === 'activate' ? 'kích hoạt' : 'vô hiệu hóa'} ${selectedUsers.length} người dùng đã chọn?`;

    if (window.confirm(confirmMessage)) {
      try {
        if (action === 'delete') {
          await userService.bulkDelete(selectedUsers);
        } else {
          await userService.bulkUpdateStatus(selectedUsers, action === 'activate');
        }
        
        setSelectedUsers([]);
        fetchUsers();
        fetchUserStats();
        alert('Thao tác thành công');
      } catch (error) {
        console.error('Error performing bulk action:', error);
        alert('Có lỗi xảy ra khi thực hiện thao tác');
      }
    }
  };

  // Handle modal operations
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleModalSuccess = () => {
    fetchUsers();
    fetchUserStats();
    setShowEditModal(false);
    setShowCreateModal(false);
    setSelectedUser(null);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setShowCreateModal(false);
    setShowDetailsModal(false);
    setSelectedUser(null);
  };

  // Get role badge styling
  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: 'bg-red-100 text-red-800',
      TEACHER: 'bg-blue-100 text-blue-800',
      STUDENT: 'bg-green-100 text-green-800'
    };
    return badges[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleDisplayName = (role) => {
    const names = {
      ADMIN: 'Quản trị viên',
      TEACHER: 'Giáo viên',
      STUDENT: 'Học viên'
    };
    return names[role] || role;
  };

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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Tổng số</div>
            <div className="text-2xl font-bold text-gray-800">{users.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Hoạt động</div>
            <div className="text-2xl font-bold text-green-600">{users.filter(u => u.isActive).length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Học viên</div>
            <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'STUDENT').length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Giáo viên</div>
            <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'TEACHER').length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Quản trị</div>
            <div className="text-2xl font-bold text-red-600">{users.filter(u => u.role === 'ADMIN').length}</div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white w-full mb-6 shadow-lg rounded">
          {/* Header */}
          <div className="rounded-t mb-0 px-4 py-3 border-0">
            <div className="flex flex-wrap items-center justify-between">
              <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                <h3 className="font-semibold text-lg text-blueGray-700">
                  Quản lý Người dùng ({filteredUsers.length})
                </h3>
              </div>
              <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                <button
                  className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  onClick={handleCreateUser}
                >
                  <i className="fas fa-plus mr-1"></i>
                  Thêm người dùng
                </button>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="px-4 pb-4">
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, trường..."
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Role Filter */}
              <div className="min-w-48">
                <select
                  className="border-0 px-3 py-3 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="">Tất cả vai trò</option>
                  <option value="STUDENT">Học viên</option>
                  <option value="TEACHER">Giáo viên</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>

              {/* Bulk Actions */}
              {selectedUsers.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                  >
                    Kích hoạt ({selectedUsers.length})
                  </button>
                  <button
                    onClick={() => handleBulkAction('deactivate')}
                    className="bg-yellow-500 text-white px-3 py-2 rounded text-sm hover:bg-yellow-600"
                  >
                    Vô hiệu hóa ({selectedUsers.length})
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                  >
                    Xóa ({selectedUsers.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                      onChange={handleSelectAll}
                      className="mr-2"
                    />
                    Người dùng
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Vai trò
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Trạng thái
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Thông tin
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
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="mr-3"
                        />
                        <img
                          src={user.avatarUrl || "/img/team-2-800x800.jpg"}
                          className="h-12 w-12 bg-white rounded-full border"
                          alt="Avatar"
                        />
                        <div className="ml-3">
                          <span className="font-bold text-blueGray-600">
                            {user.fullName}
                          </span>
                          <br />
                          <span className="text-xs text-blueGray-500">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div>
                        {user.school && (
                          <div className="text-blueGray-600">{user.school}</div>
                        )}
                        {user.major && (
                          <div className="text-blueGray-500">{user.major}</div>
                        )}
                        {user.academicYear && (
                          <div className="text-blueGray-400">{user.academicYear}</div>
                        )}
                      </div>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-indigo-500 hover:text-indigo-700"
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleToggleActive(user.id)}
                          className={`${
                            user.isActive 
                              ? 'text-red-500 hover:text-red-700' 
                              : 'text-green-500 hover:text-green-700'
                          }`}
                          title={user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        >
                          <i className={`fas ${user.isActive ? 'fa-ban' : 'fa-check'}`}></i>
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="text-yellow-500 hover:text-yellow-700"
                          title="Reset mật khẩu"
                        >
                          <i className="fas fa-key"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.fullName)}
                          className="text-red-500 hover:text-red-700"
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
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} trong {filteredUsers.length} kết quả
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Trước
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 text-sm border rounded ${
                      currentPage === i + 1 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
          />
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <CreateUserModal
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
          />
        )}

        {/* User Details Modal */}
        {showDetailsModal && selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={handleModalClose}
          />
        )}
      </div>
    </div>
  );
}
