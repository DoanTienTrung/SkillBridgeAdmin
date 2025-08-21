import { Link } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import authService from "../../services/authService";

// components
import CardStats from "components/Cards/CardStats.js";
import CardLineChart from "components/Cards/CardLineChart.js";
import CardBarChart from "components/Cards/CardBarChart.js";
import CardPageVisits from "components/Cards/CardPageVisits.js";
import CardSocialTraffic from "components/Cards/CardSocialTraffic.js";

const quickActions = [
  {
    title: 'Tạo bài học mới',
    description: 'Tạo bài nghe hoặc bài đọc',
    icon: 'fas fa-plus-circle',
    color: 'bg-lightBlue-500',
    route: '/teacher/create-lesson'
  },
  {
    title: 'Quản lý bài học',
    description: 'Xem và chỉnh sửa bài học',
    icon: 'fas fa-book-open',
    color: 'bg-purple-500',
    route: '/teacher/lessons'
  },
  {
    title: 'Xem báo cáo',
    description: 'Thống kê và phân tích',
    icon: 'fas fa-chart-line',
    color: 'bg-orange-500',
    route: '/teacher/reports'
  },
  {
    title: 'Cài đặt hệ thống',
    description: 'Cài đặt hệ thống',
    icon: 'fas fa-cog',
    color: 'bg-orange-500',
    route: '/teacher/system'
  }
];

export default function TeacherDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalLessons: 0,
    totalStudents: 0,
    completedLessons: 0,
    totalQuestions: 0
  });

  useEffect(() => {
    // Get current user info
    const user = authService.getCurrentUserFromToken();
    setCurrentUser(user);

    // Load dashboard statistics
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Call real API
      const stats = await authService.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Keep mock data as fallback
      setDashboardStats({
        totalLessons: 25,
        totalStudents: 128,
        completedLessons: 18,
        totalQuestions: 450
      });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'ADMIN': 'Quản trị viên',
      'TEACHER': 'Giáo viên',
      'STUDENT': 'Học viên'
    };
    return roleMap[role] || role;
  };

  return (
    <>
      {/* Welcome Section */}
      <div className="relative bg-lightBlue-600 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div className="flex flex-wrap items-center">
            <div className="w-full lg:w-6/12 xl:w-8/12 px-4">
              <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white">
                <div className="flex-auto p-5 lg:p-10">
                  <h1 className="text-2xl font-semibold text-blueGray-700">
                    {getGreeting()}, {currentUser?.fullName}!
                  </h1>
                  <p className="text-lg text-blueGray-500 mt-2">
                    Chào mừng bạn đến với bảng điều khiển {getRoleDisplayName(currentUser?.role)}
                  </p>
                  <p className="text-sm text-blueGray-400 mt-1">
                    Hôm nay là {new Date().toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-6/12 xl:w-4/12 px-4">
              <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white">
                <div className="flex-auto p-5 lg:p-10 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 text-white bg-lightBlue-500 rounded-full mb-3">
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <h4 className="text-xl font-semibold text-blueGray-700">
                    {getRoleDisplayName(currentUser?.role)}
                  </h4>
                  <p className="text-sm text-blueGray-500">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="relative -mt-24">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div className="flex flex-wrap">
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="Tổng số bài học"
                statTitle={dashboardStats.totalLessons}
                statArrow="up"
                statPercent="12"
                statPercentColor="text-emerald-500"
                statDescripiron="Từ tháng trước"
                statIconName="fas fa-book-open"
                statIconColor="bg-red-500"
              />
            </div>
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="Học viên"
                statTitle={dashboardStats.totalStudents}
                statArrow="up"
                statPercent="8"
                statPercentColor="text-emerald-500"
                statDescripiron="Từ tuần trước"
                statIconName="fas fa-users"
                statIconColor="bg-orange-500"
              />
            </div>
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="Bài học hoàn thành"
                statTitle={dashboardStats.completedLessons}
                statArrow="down"
                statPercent="1"
                statPercentColor="text-red-500"
                statDescripiron="Từ hôm qua"
                statIconName="fas fa-check-circle"
                statIconColor="bg-pink-500"
              />
            </div>
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="Câu hỏi"
                statTitle={dashboardStats.totalQuestions}
                statArrow="up"
                statPercent="5"
                statPercentColor="text-emerald-500"
                statDescripiron="Từ tuần trước"
                statIconName="fas fa-question-circle"
                statIconColor="bg-lightBlue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="px-4 md:px-10 mx-auto w-full">
        <div className="flex flex-wrap mt-4">
          <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
            <CardLineChart />
          </div>
          <div className="w-full xl:w-4/12 px-4">
            <CardBarChart />
          </div>
        </div>
        <div className="flex flex-wrap mt-4">
          <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
            <CardPageVisits />
          </div>
          <div className="w-full xl:w-4/12 px-4">
            <CardSocialTraffic />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 md:px-10 mx-auto w-full mt-8">
        <div className="flex flex-wrap">
          <div className="w-full lg:w-12/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-white">
              <div className="rounded-t mb-0 px-4 py-3 border-0">
                <div className="flex flex-wrap items-center">
                  <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                    <h3 className="font-semibold text-lg text-blueGray-700">
                      Thao tác nhanh
                    </h3>
                    <p className="text-sm text-blueGray-500">
                      Các tính năng thường sử dụng
                    </p>
                  </div>
                </div>
              </div>
              <div className="block w-full overflow-x-auto">
                <div className="px-4 py-3">
                  <div className="flex flex-wrap">
                    {/* <div className="w-full sm:w-6/12 lg:w-3/12 px-2 mb-4">
                      <button className="w-full bg-lightBlue-500 text-white px-4 py-3 rounded-lg hover:bg-lightBlue-600 transition-colors flex items-center justify-center">
                        <i className="fas fa-plus mr-2"></i>
                        Tạo bài học mới
                      </button>
                    </div> */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {quickActions.map((action, index) => (
                        <Link
                          key={index}
                          to={action.route}
                          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-300 m-2"
                        >
                          <div className="flex items-center">
                            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mr-4`}>
                              <i className={`${action.icon} text-white text-xl`}></i>
                            </div>
                            <div>
                              <h4 className="font-semibold text-blueGray-700">{action.title}</h4>
                              <p className="text-sm text-blueGray-600">{action.description}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* <div className="w-full sm:w-6/12 lg:w-3/12 px-2 mb-4">
                      <button className="w-full bg-emerald-500 text-white px-4 py-3 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center">
                        <i className="fas fa-users mr-2"></i>
                        Quản lý học viên
                      </button>
                    </div> */}
                    {/* <div className="w-full sm:w-6/12 lg:w-3/12 px-2 mb-4">
                      <button className="w-full bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center">
                        <i className="fas fa-chart-bar mr-2"></i>
                        Báo cáo chi tiết
                      </button>
                    </div> */}
                    {/* <div className="w-full sm:w-6/12 lg:w-3/12 px-2 mb-4">
                      <button className="w-full bg-pink-500 text-white px-4 py-3 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center">
                        <i className="fas fa-cog mr-2"></i>
                        Cài đặt hệ thống
                      </button>
                    </div> */}
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