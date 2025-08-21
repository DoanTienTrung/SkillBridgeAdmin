import React from 'react';

export default function UserDetailsModal({ user, onClose }) {
  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleDisplayName = (role) => {
    const names = {
      ADMIN: 'Quản trị viên',
      TEACHER: 'Giáo viên',
      STUDENT: 'Học viên'
    };
    return names[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800',
      TEACHER: 'bg-blue-100 text-blue-800',
      STUDENT: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Chi tiết người dùng
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* User Info */}
        <div className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center space-x-6 p-4 bg-gray-50 rounded-lg">
            <img
              src={user.avatarUrl || "/img/team-2-800x800.jpg"}
              className="h-24 w-24 bg-white rounded-full border-4 border-white shadow"
              alt="Avatar"
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">{user.fullName}</h3>
              <p className="text-gray-600">{user.email}</p>
              <div className="mt-2 flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  user.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Thông tin cá nhân
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">ID</label>
                  <p className="text-gray-800">{user.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Họ tên</label>
                  <p className="text-gray-800">{user.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-800">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Vai trò</label>
                  <p className="text-gray-800">{getRoleDisplayName(user.role)}</p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Thông tin học tập
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Trường học</label>
                  <p className="text-gray-800">{user.school || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Ngành học</label>
                  <p className="text-gray-800">{user.major || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Năm học</label>
                  <p className="text-gray-800">{user.academicYear || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Thông tin tài khoản
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Trạng thái</label>
                  <p className="text-gray-800">
                    {user.isActive ? 'Đang hoạt động' : 'Bị vô hiệu hóa'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Ngày tạo</label>
                  <p className="text-gray-800">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Cập nhật lần cuối</label>
                  <p className="text-gray-800">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Statistics (for students) */}
            {user.role === 'STUDENT' && (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Thống kê học tập
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Bài đã hoàn thành</label>
                    <p className="text-gray-800">{user.completedLessons || 0} bài</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Điểm trung bình</label>
                    <p className="text-gray-800">{user.averageScore || 0}/10</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Thời gian học</label>
                    <p className="text-gray-800">{user.totalStudyTime || 0} phút</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes section */}
          {user.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Ghi chú</h4>
              <p className="text-gray-700">{user.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
