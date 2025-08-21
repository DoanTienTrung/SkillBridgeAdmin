import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import authService from "../../services/authService";


export default function Login() {
  const history = useHistory();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    if (authService.isAuthenticated()) {
      redirectBasedOnRole();
    }

    // Load remembered email if exists
    const rememberedEmail = localStorage.getItem('skillbridge_remember_email');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const redirectBasedOnRole = () => {
    const user = authService.getCurrentUserFromToken();
    if (user) {
      if (user.role === 'ADMIN') {
        history.push('/admin/dashboard');
      } else if (user.role === 'STUDENT') {
        history.push('/student/dashboard'); // Redirect students to student dashboard
      } else {
        history.push('/teacher/dashboard'); // Default fallback
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call real API
      const result = await authService.login({
        email: formData.email.trim(),
        password: formData.password
      });

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('skillbridge_remember_email', formData.email);
      } else {
        localStorage.removeItem('skillbridge_remember_email');
      }

      // Show success and redirect
      console.log('Login successful:', result);
      redirectBasedOnRole();

    } catch (error) {
      console.error('Login error:', error);
      
      // Extract error message from different error formats
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Email hoặc mật khẩu không đúng';
        } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoData = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <>
      <div className="container mx-auto px-4 h-full">
        <div className="flex content-center items-center justify-center h-full">
          <div className="w-full lg:w-4/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
              <div className="rounded-t mb-0 px-6 py-6">
                <div className="text-center mb-3">
                  <h6 className="text-blueGray-500 text-sm font-bold">
                    Đăng nhập SkillBridge
                  </h6>
                  <p className="text-blueGray-400 text-xs mt-2">
                    Hệ thống quản lý học tập tiếng Anh
                  </p>
                </div>

                {/* Quick Fill Demo Data (for development) */}
                <div className="text-center mb-4">
                  <h6 className="text-blueGray-600 text-xs font-bold mb-2">
                    Demo nhanh (development)
                  </h6>
                  <div className="flex flex-wrap justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => fillDemoData('admin@skillbridge.com', 'admin123')}
                      disabled={loading}
                      className="text-xs px-2 py-1 rounded font-medium transition-all duration-150 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemoData('teacher@skillbridge.com', 'teacher123')}
                      disabled={loading}
                      className="text-xs px-2 py-1 rounded font-medium transition-all duration-150 bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                    >
                      Teacher
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemoData('student@skillbridge.com', 'student123')}
                      disabled={loading}
                      className="text-xs px-2 py-1 rounded font-medium transition-all duration-150 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
                    >
                      Student
                    </button>
                  </div>
                </div>

                <hr className="mt-6 border-b-1 border-blueGray-300" />
              </div>
              
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <div className="text-blueGray-400 text-center mb-3 font-bold">
                  <small>Đăng nhập bằng tài khoản</small>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <div className="flex items-center">
                      <i className="fas fa-exclamation-circle mr-2"></i>
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Nhập email của bạn"
                      required
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>

                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Nhập mật khẩu"
                      required
                      disabled={loading}
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="form-checkbox border-0 rounded text-blueGray-700 ml-1 w-5 h-5 ease-linear transition-all duration-150"
                        disabled={loading}
                      />
                      <span className="ml-2 text-sm font-semibold text-blueGray-600">
                        Ghi nhớ email
                      </span>
                    </label>
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={loading || !formData.email.trim() || !formData.password}
                      className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Đang đăng nhập...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sign-in-alt mr-2"></i>
                          Đăng nhập
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* API Status Indicator */}
                {/* <div className="mt-4 text-center">
                  <div className="inline-flex items-center text-xs text-blueGray-500">
                    <span className="mr-2">API Status:</span>
                    <ApiStatus />
                  </div>
                </div> */}
              </div>
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap mt-6 relative">
              <div className="w-1/2">
                <a
                  href="#pablo"
                  onClick={(e) => e.preventDefault()}
                  className="text-blueGray-200 hover:text-blueGray-300 transition-colors"
                >
                  <small>
                    <i className="fas fa-question-circle mr-1"></i>
                    Quên mật khẩu?
                  </small>
                </a>
              </div>
              <div className="w-1/2 text-right">
                <Link to="/auth/register" className="text-blueGray-200 hover:text-blueGray-300 transition-colors">
                  <small>
                    <i className="fas fa-user-plus mr-1"></i>
                    Tạo tài khoản mới
                  </small>
                </Link>
              </div>
            </div>

            {/* Role Access Information */}
            <div className="mt-8 bg-blueGray-100 rounded-lg p-4">
              <h6 className="text-blueGray-700 text-sm font-bold mb-2 text-center">
                Phân quyền hệ thống
              </h6>
              <div className="text-xs text-blueGray-600 space-y-1">
                <div className="flex items-center">
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium mr-2">Admin</span>
                  <span>Quản trị toàn hệ thống, tạo tài khoản</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium mr-2">Teacher</span>
                  <span>Quản lý bài học và học viên</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium mr-2">Student</span>
                  <span>Học tập và luyện tập</span>
                </div>
              </div>
            </div>

            {/* Backend Status */}
            <div className="mt-4 text-center">
              <p className="text-xs text-blueGray-400">
                📡 Backend: Spring Boot API
              </p>
              <p className="text-xs text-blueGray-400">
                🔐 Authentication: JWT Token
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}