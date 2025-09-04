import React, { useState, useEffect } from "react";
import authService from "../../services/authService";
import AvatarUpload from "../../components/AvatarUpload";


export default function ProfileManagement() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    school: '',
    major: '',
    academicYear: '',
    avatarUrl: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
  try {
    setLoading(true);
    
    // Try API first, fallback to token if needed
    let userData;
    try {
      userData = await authService.getCurrentUser();
    } catch (apiError) {
      console.warn('API failed, using token data: - ProfileManagement.js:40', apiError.message);
      userData = authService.getCurrentUserFromToken();
      if (!userData) {
        throw new Error('Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
      }
    }
    
    setCurrentUser(userData);
    setProfileData({
      fullName: userData.fullName || '',
      email: userData.email || '',
      school: userData.school || '',
      major: userData.major || '',
      academicYear: userData.academicYear || '',
      avatarUrl: userData.avatarUrl || ''
    });
    
  } catch (error) {
    console.error('Error loading profile: - ProfileManagement.js:58', error);
    setMessage({ type: 'error', text: error.message || 'Không thể tải thông tin hồ sơ' });
  } finally {
    setLoading(false);
  }
};


  const handleProfileChange = (e) => {
    if (!profileData.fullName?.trim()) {
    setMessage({ type: 'error', text: 'Vui lòng nhập họ và tên' });
    return;
  }
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Call real API
      const updatedUser = await authService.updateProfile(profileData);

      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      setIsEditing(false);
      setCurrentUser(updatedUser);

    } catch (error) {
      console.error('Error updating profile: - ProfileManagement.js:99', error);
      setMessage({ type: 'error', text: error.message || 'Cập nhật thông tin thất bại' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    // console.log('hanale password - ProfileManagement.js:87')
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      console.log({ type: 'error - ProfileManagement.js:112', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      return;
    }

    try {
      setLoading(true);

      // Call real API
      const result = await authService.changePassword({
        "currentPassword": passwordData.currentPassword,
        "newPassword": passwordData.newPassword,
        "confirmPassword": passwordData.confirmPassword
      });

      setMessage({ type: 'success', text: result || 'Đổi mật khẩu thành công!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password: - ProfileManagement.js:138', error);
      setMessage({ type: 'error', text: error.message || 'Đổi mật khẩu thất bại' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'ADMIN': 'Quản trị viên',
      'TEACHER': 'Giáo viên',
      'STUDENT': 'Học viên'
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colorMap = {
      'ADMIN': 'bg-red-500',
      'TEACHER': 'bg-blue-500',
      'STUDENT': 'bg-green-500'
    };
    return colorMap[role] || 'bg-gray-500';
  };

  if (loading && !currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blueGray-900"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full lg:w-8/12 px-4">
          {/* Profile Information Card */}
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            <div className="rounded-t bg-white mb-0 px-6 py-6">
              <div className="text-center flex justify-between">
                <h6 className="text-blueGray-700 text-xl font-bold">
                  Thông tin cá nhân
                </h6>
                <div className="flex space-x-2">
                  {!isEditing ? (
                    <button
                      className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                      type="button"
                      onClick={() => setIsEditing(true)}
                    >
                      <i className="fas fa-edit mr-1"></i>
                      Chỉnh sửa
                    </button>
                  ) : (
                    <>
                      <button
                        className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        <i className="fas fa-save mr-1"></i>
                        {loading ? 'Đang lưu...' : 'Lưu'}
                      </button>
                      <button
                        className="bg-blueGray-500 text-white active:bg-blueGray-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          loadUserProfile(); // Reset form
                        }}
                      >
                        <i className="fas fa-times mr-1"></i>
                        Hủy
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              {/* Message Display */}
              {message.text && (
                <div className={`mb-4 p-4 rounded ${message.type === 'success'
                    ? 'bg-green-100 border border-green-400 text-green-700'
                    : 'bg-red-100 border border-red-400 text-red-700'
                  }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                  Thông tin tài khoản
                </h6>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-6/12 px-3">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        disabled={true} // Email usually cannot be changed
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-3">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Vai trò
                      </label>
                      <div className="flex items-center">
                        <span className={`${getRoleBadgeColor(currentUser?.role)} text-white px-3 py-2 rounded text-sm font-medium`}>
                          {getRoleDisplayName(currentUser?.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap">
                  <div className="w-full px-3">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleProfileChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        disabled={!isEditing}
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                  </div>
                </div>

                <hr className="mt-6 border-b-1 border-blueGray-300" />

                <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                  Thông tin công việc
                </h6>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-6/12 px-3">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Trường/Tổ chức
                      </label>
                      <input
                        type="text"
                        name="school"
                        value={profileData.school}
                        onChange={handleProfileChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        disabled={!isEditing}
                        placeholder="Nhập tên trường hoặc tổ chức"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-3">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Chuyên ngành
                      </label>
                      <input
                        type="text"
                        name="major"
                        value={profileData.major}
                        onChange={handleProfileChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        disabled={!isEditing}
                        placeholder="Nhập chuyên ngành"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap">
                  <div className="w-full lg:w-6/12 px-3">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Năm học/Kinh nghiệm
                      </label>
                      <input
                        type="text"
                        name="academicYear"
                        value={profileData.academicYear}
                        onChange={handleProfileChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        disabled={!isEditing}
                        placeholder="VD: 2024 hoặc 5 năm kinh nghiệm"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-3">
                    <div className="w-full lg:w-6/12 px-3">
                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                          Ảnh đại diện
                        </label>
                        {/* Import AvatarUpload component */}
                        <AvatarUpload
                          user={currentUser}
                          onAvatarUpdate={(updatedUser) => {
                            setCurrentUser(updatedUser);
                            setProfileData(prev => ({
                              ...prev,
                              avatarUrl: updatedUser.avatarUrl
                            }));
                          }}
                          className="text-left"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            <div className="rounded-t bg-white mb-0 px-6 py-6">
              <div className="text-center flex justify-between">
                <h6 className="text-blueGray-700 text-xl font-bold">
                  Đổi mật khẩu
                </h6>
              </div>
            </div>

            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              <form onSubmit={handleChangePassword}>
                <div className="flex flex-wrap">
                  <div className="w-full px-3">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap">
                  <div className="w-full lg:w-6/12 px-3">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-3">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-6 py-3 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                    type="submit"
                    disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  >
                    <i className="fas fa-key mr-2"></i>
                    {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Profile Preview Card */}
        <div className="w-full lg:w-4/12 px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg">
            <div className="px-6">
              <div className="flex flex-wrap justify-center">
                <div className="w-full px-4 flex justify-center">
                  <div className="relative">
                    {profileData.avatarUrl ? (
                      <img
                        alt="Profile"
                        src={profileData.avatarUrl}
                        className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`${profileData.avatarUrl ? 'hidden' : 'flex'} shadow-xl rounded-full h-32 w-32 bg-blueGray-200 absolute -m-16 -ml-20 lg:-ml-16 items-center justify-center`}
                    >
                      <i className="fas fa-user text-blueGray-400 text-4xl"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-20">
                <h3 className="text-xl font-semibold leading-normal mb-2 text-blueGray-700">
                  {profileData.fullName || 'Chưa cập nhật'}
                </h3>
                <div className="text-sm leading-normal mt-0 mb-2 text-blueGray-400 font-bold uppercase">
                  <i className="fas fa-envelope mr-2 text-lg text-blueGray-400"></i>
                  {profileData.email}
                </div>
                <div className="mb-2 text-blueGray-600 mt-2">
                  <span className={`${getRoleBadgeColor(currentUser?.role)} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                    {getRoleDisplayName(currentUser?.role)}
                  </span>
                </div>
                {profileData.school && (
                  <div className="mb-2 text-blueGray-600">
                    <i className="fas fa-university mr-2 text-lg text-blueGray-400"></i>
                    {profileData.school}
                  </div>
                )}
                {profileData.major && (
                  <div className="mb-2 text-blueGray-600">
                    <i className="fas fa-graduation-cap mr-2 text-lg text-blueGray-400"></i>
                    {profileData.major}
                  </div>
                )}
                {profileData.academicYear && (
                  <div className="mb-2 text-blueGray-600">
                    <i className="fas fa-calendar mr-2 text-lg text-blueGray-400"></i>
                    {profileData.academicYear}
                  </div>
                )}
              </div>
              <div className="mt-10 py-6 border-t border-blueGray-200 text-center">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full px-4">
                    <p className="mb-4 text-sm leading-relaxed text-blueGray-700">
                      Thông tin hồ sơ của bạn sẽ được hiển thị cho học viên và đồng nghiệp.
                      Hãy đảm bảo thông tin luôn được cập nhật và chính xác.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}