import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import authService from "../../services/authService";

export default function StudentSidebar() {
  const [collapseShow, setCollapseShow] = useState("hidden");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeUser = () => {
      try {
        // Validate và clean tokens trước
        const isValidToken = authService.validateAndCleanTokens();
        
        if (!isValidToken) {
          console.log('Invalid token detected, redirecting to login - StudentSidebar.js:18');
          setError('Phiên đăng nhập không hợp lệ');
          setLoading(false);
          // Redirect sau một chút để hiển thị thông báo
          setTimeout(() => {
            authService.logout();
          }, 2000);
          return;
        }

        // Lấy thông tin user
        const currentUser = authService.getCurrentUserFromToken();
        
        if (currentUser) {
          setUser(currentUser);
          setError(null);
        } else {
          console.log('No user found, redirecting to login - StudentSidebar.js:35');
          setError('Không tìm thấy thông tin người dùng');
          setTimeout(() => {
            authService.logout();
          }, 2000);
        }
      } catch (error) {
        console.error('Error initializing user - StudentSidebar.js:42', error);
        setError('Lỗi khi tải thông tin người dùng');
        
        // Debug thông tin token
        authService.debugTokenIssue();
        
        setTimeout(() => {
          authService.logout();
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Loading state
  if (loading) {
    return (
      <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-2xl text-blueGray-400 mb-2"></i>
            <p className="text-blueGray-500 text-sm">Đang tải...</p>
          </div>
        </div>
      </nav>
    );
  }

  // Error state
  if (error) {
    return (
      <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-red-50 flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-2xl text-red-500 mb-2"></i>
            <p className="text-red-600 text-sm font-medium mb-2">{error}</p>
            <p className="text-red-500 text-xs">Đang chuyển về trang đăng nhập...</p>
          </div>
        </div>
      </nav>
    );
  }

  // Normal state
  return (
    <>
      <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
        <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
          {/* Brand */}
          <Link
            className="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
            to="/student/dashboard"
          >
            SkillBridge Student
          </Link>

          {/* User info with error handling */}
          <div className="md:block text-left text-blueGray-500 mr-0 inline-block whitespace-nowrap text-xs p-4 px-0">
            Xin chào, {user?.fullName || user?.email || 'Student'}! 👋
          </div>

          {/* Toggle button */}
          <button
            className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
            type="button"
            onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
          >
            <i className="fas fa-bars"></i>
          </button>

          {/* Navigation */}
          <div
            className={
              "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
              collapseShow
            }
          >
            {/* Collapse header */}
            <div className="md:min-w-full md:hidden block pb-4 mb-4 border-b border-solid border-blueGray-200">
              <div className="flex flex-wrap">
                <div className="w-6/12">
                  <Link
                    className="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
                    to="/student/dashboard"
                  >
                    SkillBridge
                  </Link>
                </div>
                <div className="w-6/12 flex justify-end">
                  <button
                    type="button"
                    className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
                    onClick={() => setCollapseShow("hidden")}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <ul className="md:flex-col md:min-w-full flex flex-col list-none">
              <li className="items-center">
                <Link
                  className="text-xs uppercase py-3 font-bold block text-lightBlue-500 hover:text-lightBlue-600"
                  to="/student/dashboard"
                >
                  <i className="fas fa-tv mr-2 text-sm opacity-75"></i>
                  Dashboard
                </Link>
              </li>

              <li className="items-center">
                <Link
                  className="text-xs uppercase py-3 font-bold block text-blueGray-700 hover:text-blueGray-500"
                  to="/student/lessons"
                >
                  <i className="fas fa-book mr-2 text-sm text-blueGray-300"></i>
                  Bài học
                </Link>
              </li>

              <li className="items-center">
                <Link
                  className="text-xs uppercase py-3 font-bold block text-blueGray-700 hover:text-blueGray-500"
                  to="/student/vocabulary"
                >
                  <i className="fas fa-language mr-2 text-sm text-blueGray-300"></i>
                  Từ vựng
                </Link>
              </li>

              <li className="items-center">
                <Link
                  className="text-xs uppercase py-3 font-bold block text-blueGray-700 hover:text-blueGray-500"
                  to="/student/progress"
                >
                  <i className="fas fa-chart-line mr-2 text-sm text-blueGray-300"></i>
                  Tiến độ
                </Link>
              </li>
            </ul>

            {/* Divider */}
            <hr className="my-4 md:min-w-full" />

            {/* User Profile & Logout */}
            <ul className="md:flex-col md:min-w-full flex flex-col list-none md:mb-4">
              <li className="items-center">
                <Link
                  className="text-xs uppercase py-3 font-bold block text-blueGray-700 hover:text-blueGray-500"
                  to="/student/profile"
                >
                  <i className="fas fa-user mr-2 text-sm text-blueGray-300"></i>
                  Hồ sơ
                </Link>
              </li>
              <li className="items-center">
                <button
                  className="text-xs uppercase py-3 font-bold block text-red-500 hover:text-red-600 w-full text-left"
                  onClick={() => {
                    try {
                      authService.logout();
                    } catch (error) {
                      console.error('Logout error - StudentSidebar.js:209', error);
                      // Force redirect even if logout fails
                      window.location.href = '/auth/login';
                    }
                  }}
                >
                  <i className="fas fa-sign-out-alt mr-2 text-sm"></i>
                  Đăng xuất
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}