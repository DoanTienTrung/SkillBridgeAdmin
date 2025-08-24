import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import { API_ENDPOINTS } from '../../services/config';
import AvatarUpload from '../../components/AvatarUpload';
import ChangePasswordForm from '../../components/ChangePasswordForm';

export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    school: '',
    major: '',
    academicYear: ''
  });
  
  // Messages
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setProfileForm({
        fullName: userData.fullName || '',
        school: userData.school || '',
        major: userData.major || '',
        academicYear: userData.academicYear || ''
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      showMessage('error', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Handle profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authService.updateProfile(profileForm);
      await loadUserData(); // Refresh user data
      showMessage('success', 'Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('error', error.message || 'Cập nhật thông tin thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-blueGray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cài đặt tài khoản</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân và cài đặt bảo mật</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'profile', label: 'Thông tin cá nhân', icon: 'fas fa-user' },
                { id: 'password', label: 'Đổi mật khẩu', icon: 'fas fa-lock' },
                { id: 'avatar', label: 'Ảnh đại diện', icon: 'fas fa-camera' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className={`${tab.icon} mr-2`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trường học
                    </label>
                    <input
                      type="text"
                      value={profileForm.school}
                      onChange={(e) => setProfileForm({...profileForm, school: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngành học
                    </label>
                    <input
                      type="text"
                      value={profileForm.major}
                      onChange={(e) => setProfileForm({...profileForm, major: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Năm học
                    </label>
                    <select
                      value={profileForm.academicYear}
                      onChange={(e) => setProfileForm({...profileForm, academicYear: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn năm học</option>
                      <option value="2021">2021</option>
                      <option value="2022">2022</option>
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                  </button>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <ChangePasswordForm />
            )}

            {/* Avatar Tab */}
            {activeTab === 'avatar' && (
              <AvatarUpload 
                user={user} 
                onAvatarUpdate={(updatedUser) => setUser(updatedUser)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
