import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import authService from "../../services/authService";
import userService from "../../services/userService";
import analyticsService from "../../services/analyticsService";

// Components
import CardStats from "components/Cards/CardStats.js";

export default function TeacherDashboard() {
  const history = useHistory();
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalLessons: 0,
    completedLessons: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user info
    const user = authService.getCurrentUserFromToken();
    setCurrentUser(user);

    // Load dashboard data
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load students statistics
      const studentsResponse = await userService.getAllUsers('STUDENT');
      const students = studentsResponse || [];
      
      // Load system analytics for lessons count
      const analyticsResponse = await analyticsService.getSystemAnalytics();
      
      setDashboardStats({
        totalStudents: students.length,
        activeStudents: students.filter(s => s.isActive).length,
        totalLessons: analyticsResponse.data?.totalLessons || 0,
        completedLessons: analyticsResponse.data?.completedLessons || 0
      });

      // Mock recent activities (replace with real data later)
      setRecentActivities([
        {
          id: 1,
          student: 'Nguyễn Văn A',
          action: 'Hoàn thành bài listening về Travel',
          time: '2 phút trước',
          score: 8.5
        },
        {
          id: 2,
          student: 'Trần Thị B',
          action: 'Bắt đầu bài reading về Technology',
          time: '15 phút trước',
          score: null
        },
        {
          id: 3,
          student: 'Lê Văn C',
          action: 'Hoàn thành bài vocabulary về Business',
          time: '1 giờ trước',
          score: 9.2
        }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data: - Dashboard.js:75', error);
      // Keep some fallback data
      setDashboardStats({
        totalStudents: 0,
        activeStudents: 0,
        totalLessons: 0,
        completedLessons: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const navigateToStudents = () => {
    history.push('/teacher/students');
  };

  const navigateToReports = () => {
    history.push('/admin/student-reports');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600">Đang tải dashboard...</span>
      </div>
    );
  }

  return (
    <>
      {/* Welcome Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div className="flex flex-wrap items-center">
            <div className="w-full lg:w-8/12 px-4">
              <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white">
                <div className="flex-auto p-5 lg:p-10">
                  <h1 className="text-3xl font-semibold text-blueGray-700">
                    {getGreeting()}, {currentUser?.fullName}! 👨‍🏫
                  </h1>
                  <p className="text-lg text-blueGray-500 mt-3">
                    Chào mừng bạn đến với bảng điều khiển giáo viên. Hãy theo dõi tiến độ học tập của các học viên và hỗ trợ họ đạt được kết quả tốt nhất.
                  </p>
                  <p className="text-sm text-blueGray-400 mt-2">
                    Hôm nay là {new Date().toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  
                  {/* Quick Actions */}
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={navigateToStudents}
                      className="bg-blue-500 text-black active:bg-blue-600 text-sm font-bold uppercase px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                    >
                      <i className="fas fa-users mr-2"></i>
                      Quản lý học viên
                    </button>
                    <button
                      onClick={navigateToReports}
                      className="bg-green-500 text-black active:bg-green-600 text-sm font-bold uppercase px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                    >
                      <i className="fas fa-chart-bar mr-2"></i>
                      Báo cáo chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-4/12 px-4">
              <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white">
                <div className="flex-auto p-5 lg:p-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                    <i className="fas fa-chalkboard-teacher text-xl"></i>
                  </div>
                  <h4 className="text-xl font-semibold text-blueGray-700">
                    Giáo viên
                  </h4>
                  <p className="text-sm text-blueGray-500 mt-2">
                    {currentUser?.email}
                  </p>
                  <p className="text-sm text-blueGray-400 mt-1">
                    {currentUser?.school || 'SkillBridge Platform'}
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
                statSubtitle="Tổng học viên"
                statTitle={dashboardStats.totalStudents}
                statArrow="up"
                statPercent="12"
                statPercentColor="text-emerald-500"
                statDescripiron="Từ tháng trước"
                statIconName="fas fa-users"
                statIconColor="bg-red-500"
              />
            </div>
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="Học viên hoạt động"
                statTitle={dashboardStats.activeStudents}
                statArrow="up"
                statPercent="8"
                statPercentColor="text-emerald-500"
                statDescripiron="Từ tuần trước"
                statIconName="fas fa-user-check"
                statIconColor="bg-orange-500"
              />
            </div>
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="Bài học khả dụng"
                statTitle={dashboardStats.totalLessons}
                statArrow="up"
                statPercent="5"
                statPercentColor="text-emerald-500"
                statDescripiron="Từ tuần trước"
                statIconName="fas fa-book-open"
                statIconColor="bg-pink-500"
              />
            </div>
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="Bài đã hoàn thành"
                statTitle={dashboardStats.completedLessons}
                statArrow="up"
                statPercent="15"
                statPercentColor="text-emerald-500"
                statDescripiron="Từ hôm qua"
                statIconName="fas fa-check-circle"
                statIconColor="bg-lightBlue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 md:px-10 mx-auto w-full">
        <div className="flex flex-wrap mt-4">
          {/* Recent Activities */}
          <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
              <div className="rounded-t mb-0 px-4 py-3 border-0">
                <div className="flex flex-wrap items-center">
                  <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                    <h3 className="font-semibold text-base text-blueGray-700">
                      Hoạt động gần đây
                    </h3>
                  </div>
                  <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                    <button
                      className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      onClick={() => alert('Xem tất cả hoạt động')}
                    >
                      Xem tất cả
                    </button>
                  </div>
                </div>
              </div>

              <div className="block w-full overflow-x-auto">
                <table className="items-center w-full bg-transparent border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Học viên
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Hoạt động
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Thời gian
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Điểm số
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentActivities.map((activity) => (
                      <tr key={activity.id}>
                        <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                          <span className="ml-3 font-bold text-blueGray-600">
                            {activity.student}
                          </span>
                        </th>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          {activity.action}
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <i className="fas fa-clock text-orange-500 mr-2"></i>
                          {activity.time}
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          {activity.score ? (
                            <span className="text-emerald-500 font-bold">
                              {activity.score}/10
                            </span>
                          ) : (
                            <span className="text-blueGray-400">Đang học</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="w-full xl:w-4/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
              <div className="rounded-t mb-0 px-4 py-3 border-0">
                <div className="flex flex-wrap items-center">
                  <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                    <h3 className="font-semibold text-base text-blueGray-700">
                      Thao tác nhanh
                    </h3>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <button
                  onClick={navigateToStudents}
                  className="w-full text-left bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  <i className="fas fa-users mr-3"></i>
                  Xem danh sách học viên
                </button>
                
                <button
                  onClick={navigateToReports}
                  className="w-full text-left bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  <i className="fas fa-chart-bar mr-3"></i>
                  Xem báo cáo chi tiết
                </button>
                
                <button
                  onClick={() => alert('Tính năng tạo thông báo đang được phát triển')}
                  className="w-full text-left bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  <i className="fas fa-bullhorn mr-3"></i>
                  Tạo thông báo
                </button>
                
                <button
                  onClick={() => alert('Tính năng xuất báo cáo đang được phát triển')}
                  className="w-full text-left bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  <i className="fas fa-file-export mr-3"></i>
                  Xuất báo cáo
                </button>
              </div>
            </div>

            {/* Tips Panel */}
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
              <div className="rounded-t mb-0 px-4 py-3 border-0">
                <div className="flex flex-wrap items-center">
                  <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                    <h3 className="font-semibold text-base text-blueGray-700">
                      Mẹo giảng dạy
                    </h3>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="text-sm text-blueGray-600 space-y-3">
                  <div className="flex items-start">
                    <i className="fas fa-lightbulb text-yellow-500 mr-2 mt-1"></i>
                    <p>Theo dõi thường xuyên tiến độ học tập của học viên để hỗ trợ kịp thời.</p>
                  </div>
                  <div className="flex items-start">
                    <i className="fas fa-lightbulb text-yellow-500 mr-2 mt-1"></i>
                    <p>Khuyến khích học viên thực hành đều đặn mỗi ngày.</p>
                  </div>
                  <div className="flex items-start">
                    <i className="fas fa-lightbulb text-yellow-500 mr-2 mt-1"></i>
                    <p>Cung cấp feedback chi tiết để học viên cải thiện kỹ năng.</p>
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