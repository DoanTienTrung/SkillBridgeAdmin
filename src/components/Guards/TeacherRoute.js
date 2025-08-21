import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import authService from '../../services/authService';

/**
 * Protected Route Component for Admin/Teacher access only
 * Checks if user is authenticated and has ADMIN or TEACHER role
 */
const TeacherRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          return <Redirect to="/auth/login" />;
        }

        // Check if user can access admin features (ADMIN or TEACHER)
        if (!authService.canAccessAdmin()) {
          return (
            <div className="min-h-screen bg-blueGray-100 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-red-500 text-6xl mb-4">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h1 className="text-2xl font-bold text-blueGray-700 mb-2">
                  Không có quyền truy cập
                </h1>
                <p className="text-blueGray-500 mb-4">
                  Bạn không có quyền truy cập vào khu vực này. 
                  Chỉ giáo viên và quản trị viên mới có thể truy cập.
                </p>
                <button
                  onClick={() => authService.logout()}
                  className="bg-blueGray-800 text-white px-6 py-2 rounded hover:bg-blueGray-700 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          );
        }

        // User is authenticated and has proper role, render component
        return <Component {...props} />;
      }}
    />
  );
};

export default TeacherRoute;