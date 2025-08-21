/*eslint-disable*/
import React from "react";
import { Link } from "react-router-dom";
import authService from "../../services/authService";

import NotificationDropdown from "components/Dropdowns/NotificationDropdown.js";
import UserDropdown from "components/Dropdowns/UserDropdown.js";

export default function TeacherSidebar() {
  const [collapseShow, setCollapseShow] = React.useState("hidden");
  const currentUser = authService.getCurrentUserFromToken();

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

  // Check if current path matches
  const isActive = (path) => window.location.href.indexOf(path) !== -1;

  return (
    <>
      <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
        <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
          {/* Toggler */}
          <button
            className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
            type="button"
            onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
          >
            <i className="fas fa-bars"></i>
          </button>

          {/* Brand */}
          <Link
            className="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
            to="/admin/dashboard"
          >
            <i className="fas fa-graduation-cap mr-2 text-lightBlue-500"></i>
            SkillBridge
          </Link>

          {/* User */}
          <ul className="md:hidden items-center flex flex-wrap list-none">
            <li className="inline-block relative">
              <NotificationDropdown />
            </li>
            <li className="inline-block relative">
              <UserDropdown />
            </li>
          </ul>

          {/* Collapse */}
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
                    to="/teacher/dashboard"
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

            {/* User Info Section */}
            <div className="bg-blueGray-50 rounded-lg p-3 mb-4 md:block hidden">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blueGray-200 rounded-full flex items-center justify-center mr-3">
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <i className={`fas fa-user text-blueGray-400 ${currentUser?.avatarUrl ? 'hidden' : ''}`}></i>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-blueGray-700 truncate">
                    {currentUser?.fullName || 'User'}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className={`${getRoleBadgeColor(currentUser?.role)} text-white px-2 py-1 rounded text-xs font-medium`}>
                      {getRoleDisplayName(currentUser?.role)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-4 md:min-w-full" />

            {/* Main Navigation */}
            <h6 className="md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
              Bảng điều khiển
            </h6>

            <ul className="md:flex-col md:min-w-full flex flex-col list-none">
              <li className="items-center">
                <Link
                  className={
                    "text-xs uppercase py-3 font-bold block " +
                    (isActive("/teacher/dashboard")
                      ? "text-lightBlue-500 hover:text-lightBlue-600"
                      : "text-blueGray-700 hover:text-blueGray-500")
                  }
                  to="/teacher/dashboard"
                >
                  <i
                    className={
                      "fas fa-tv mr-2 text-sm " +
                      (isActive("/teacher/dashboard")
                        ? "opacity-75"
                        : "text-blueGray-300")
                    }
                  ></i>{" "}
                  Tổng quan
                </Link>
              </li>

              <li className="items-center">
                <Link
                  className={
                    "text-xs uppercase py-3 font-bold block " +
                    (isActive("/teacher/profile")
                      ? "text-lightBlue-500 hover:text-lightBlue-600"
                      : "text-blueGray-700 hover:text-blueGray-500")
                  }
                  to="/teacher/profile"
                >
                  <i
                    className={
                      "fas fa-user-circle mr-2 text-sm " +
                      (isActive("/teacher/profile")
                        ? "opacity-75"
                        : "text-blueGray-300")
                    }
                  ></i>{" "}
                  Hồ sơ cá nhân
                </Link>
              </li>
            </ul>

            {/* Divider */}
            <hr className="my-4 md:min-w-full" />

            {/* Content Management */}
            <li className="items-center">
              <Link
                className={
                  "text-xs uppercase py-3 font-bold block " +
                  (isActive("/teacher/create-lesson")
                    ? "text-lightBlue-500 hover:text-lightBlue-600"
                    : "text-blueGray-700 hover:text-blueGray-500")
                }
                to="/teacher/create-lesson"
              >
                <i
                  className={
                    "fas fa-plus-circle mr-2 text-sm " +
                    (isActive("/teacher/create-lesson")
                      ? "opacity-75"
                      : "text-blueGray-300")
                  }
                ></i>{" "}
                Tạo bài học
              </Link>
            </li>

            <ul className="md:flex-col md:min-w-full flex flex-col list-none">
              



              <li className="items-center">
                <Link
                  className={
                    "text-xs uppercase py-3 font-bold block " +
                    (isActive("/teacher/lessons")
                      ? "text-lightBlue-500 hover:text-lightBlue-600"
                      : "text-blueGray-700 hover:text-blueGray-500")
                  }
                  to="/teacher/lessons"
                >
                  <i
                    className={
                      "fas fa-book-open mr-2 text-sm " +
                      (isActive("/teacher/lessons")
                        ? "opacity-75"
                        : "text-blueGray-300")
                    }
                  ></i>{" "}
                  Bài học
                </Link>
              </li>

              <li className="items-center">
                <Link
                  className={
                    "text-xs uppercase py-3 font-bold block " +
                    (isActive("/teacher/students")
                      ? "text-lightBlue-500 hover:text-lightBlue-600"
                      : "text-blueGray-700 hover:text-blueGray-500")
                  }
                  to="/teacher/students"
                >
                  <i
                    className={
                      "fas fa-users mr-2 text-sm " +
                      (isActive("/teacher/students")
                        ? "opacity-75"
                        : "text-blueGray-300")
                    }
                  ></i>{" "}
                  Học viên
                </Link>
              </li>

              <li className="items-center">
                <Link
                  className={
                    "text-xs uppercase py-3 font-bold block " +
                    (isActive("/teacher/reports")
                      ? "text-lightBlue-500 hover:text-lightBlue-600"
                      : "text-blueGray-700 hover:text-blueGray-500")
                  }
                  to="/teacher/reports"
                >
                  <i
                    className={
                      "fas fa-chart-line mr-2 text-sm " +
                      (isActive("/teacher/reports")
                        ? "opacity-75"
                        : "text-blueGray-300")
                    }
                  ></i>{" "}
                  Báo cáo
                </Link>
              </li>
            </ul>

            {/* Admin Only Section */}
            {currentUser?.role === 'TEACHER' && (
              <>
                <hr className="my-4 md:min-w-full" />
                <h6 className="md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
                  Quản trị hệ thống
                </h6>

                <ul className="md:flex-col md:min-w-full flex flex-col list-none">
                  <li className="items-center">
                    <Link
                      className={
                        "text-xs uppercase py-3 font-bold block " +
                        (isActive("/teacher/settings")
                          ? "text-lightBlue-500 hover:text-lightBlue-600"
                          : "text-blueGray-700 hover:text-blueGray-500")
                      }
                      to="/teacher/settings"
                    >
                      <i
                        className={
                          "fas fa-cogs mr-2 text-sm " +
                          (isActive("/teacher/settings")
                            ? "opacity-75"
                            : "text-blueGray-300")
                        }
                      ></i>{" "}
                      Cài đặt
                    </Link>
                  </li>
                </ul>
              </>
            )}

            {/* Divider */}
            <hr className="my-4 md:min-w-full" />

            {/* Quick Actions */}
            <h6 className="md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
              Thao tác nhanh
            </h6>

            <ul className="md:flex-col md:min-w-full flex flex-col list-none md:mb-4">
              <Link to="/teacher/create-lesson">
                <i className="fas fa-plus text-blueGray-400 mr-2 text-sm"></i>
                Tạo bài học
              </Link>

              <li className="items-center">
                <button
                  className="w-full text-left text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
                  onClick={() => {
                    // TODO: Implement backup functionality
                    alert('Tính năng sao lưu dữ liệu sẽ được phát triển');
                  }}
                >
                  <i className="fas fa-download text-blueGray-400 mr-2 text-sm"></i>{" "}
                  Sao lưu dữ liệu
                </button>
              </li>

              <li className="items-center">
                <button
                  className="w-full text-left text-red-500 hover:text-red-600 text-xs uppercase py-3 font-bold block"
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                      authService.logout();
                    }
                  }}
                >
                  <i className="fas fa-sign-out-alt text-red-400 mr-2 text-sm"></i>{" "}
                  Đăng xuất
                </button>
              </li>
            </ul>

            {/* Version Info */}
            <div className="mt-auto pt-4 border-t border-blueGray-200">
              <div className="text-center">
                <p className="text-xs text-blueGray-400">
                  SkillBridge v1.0.0
                </p>
                <p className="text-xs text-blueGray-400">
                  © 2025 SkillBridge Team
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}