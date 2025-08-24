import React, { useState, useEffect } from 'react';
import analyticsService from '../../services/analyticsService';
import authService from '../../services/authService';

// Import components
import CardStats from "components/Cards/CardStats.js";
import CardLineChart from "components/Cards/CardLineChart.js";
import CardBarChart from "components/Cards/CardBarChart.js";

export default function AnalyticsDashboard() {
  const [systemStats, setSystemStats] = useState(null);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [lessonsAnalytics, setLessonsAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const currentUser = authService.getCurrentUserFromToken();

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔄 Loading analytics dashboard data...');

      // Load all analytics data in parallel
      const [systemRes, weeklyRes, lessonsRes] = await Promise.all([
        analyticsService.getSystemAnalytics(),
        analyticsService.getWeeklyActivity(), 
        analyticsService.getAllLessonsAnalytics()
      ]);

      setSystemStats(systemRes.data);
      setWeeklyActivity(weeklyRes.data);
      setLessonsAnalytics(lessonsRes.data);

      console.log('✅ Analytics data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading analytics data:', error);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportStudentsExcel = async () => {
    try {
      await analyticsService.exportStudentsExcel();
      // Success notification would be shown by the service
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Không thể xuất file Excel. Vui lòng thử lại.');
    }
  };

  // Prepare data for charts
  const prepareWeeklyActivityChartData = () => {
    if (!weeklyActivity || weeklyActivity.length === 0) return [];
    
    return weeklyActivity.map(day => ({
      name: day.dayName,
      'Người dùng hoạt động': day.activeUsers,
      'Bài học hoàn thành': day.completedLessons,
      'Đăng ký mới': day.newRegistrations
    }));
  };

  const prepareTopLessonsChartData = () => {
    if (!lessonsAnalytics || lessonsAnalytics.length === 0) return [];
    
    return lessonsAnalytics
      .slice(0, 5)
      .map(lesson => ({
        name: lesson.lessonTitle.length > 20 ? 
          lesson.lessonTitle.substring(0, 20) + '...' : lesson.lessonTitle,
        'Lượt xem': lesson.totalViews,
        'Hoàn thành': lesson.completedCount,
        'Tỷ lệ hoàn thành': lesson.completionRate
      }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600">Đang tải dữ liệu thống kê...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
        <div className="flex">
          <i className="fas fa-exclamation-triangle text-red-500 text-xl mr-3"></i>
          <div>
            <h3 className="text-red-800 font-semibold">Lỗi tải dữ liệu</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button 
              onClick={loadAnalyticsData}
              className="mt-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              <i className="fas fa-redo mr-2"></i>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="relative bg-blueGray-100 min-h-screen">
        <div className="relative bg-lightBlue-600 md:pt-32 pb-32 pt-12">
          <div className="px-4 md:px-10 mx-auto w-full">
            {/* Header */}
            <div className="mb-12 xl:mb-0 px-4">
              <h1 className="text-white text-3xl font-semibold">
                Dashboard Thống kê 📊
              </h1>
              <p className="text-lightBlue-200 text-lg mt-2">
                Tổng quan về hoạt động hệ thống SkillBridge
              </p>
            </div>

            {/* System Stats Cards */}
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="Tổng số học viên"
                  statTitle={analyticsService.formatNumber(systemStats?.totalStudents || 0)}
                  statArrow="up"
                  statPercent="12"
                  statPercentColor="text-emerald-500"
                  statDescription="Đăng ký tuần này"
                  statIconName="fas fa-users"
                  statIconColor="bg-red-500"
                />
              </div>
              
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="Tổng số bài học"
                  statTitle={analyticsService.formatNumber(
                    (systemStats?.totalListeningLessons || 0) + (systemStats?.totalReadingLessons || 0)
                  )}
                  statArrow="up"
                  statPercent="5"
                  statPercentColor="text-emerald-500"
                  statDescription="Bài mới tuần này"
                  statIconName="fas fa-book"
                  statIconColor="bg-orange-500"
                />
              </div>
              
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="Hoạt động hôm nay"
                  statTitle={analyticsService.formatNumber(systemStats?.activeUsersToday || 0)}
                  statArrow="up"
                  statPercent="18"
                  statPercentColor="text-emerald-500"
                  statDescription="Người dùng hoạt động"
                  statIconName="fas fa-chart-line"
                  statIconColor="bg-pink-500"
                />
              </div>
              
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="Từ vựng"
                  statTitle={analyticsService.formatNumber(systemStats?.totalVocabulary || 0)}
                  statArrow="up"
                  statPercent="8"
                  statPercentColor="text-emerald-500"
                  statDescription="Tổng từ vựng"
                  statIconName="fas fa-language"
                  statIconColor="bg-lightBlue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          <div className="flex flex-wrap">
            {/* Weekly Activity Chart */}
            <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
              <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-white">
                <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
                  <div className="flex flex-wrap items-center">
                    <div className="relative w-full max-w-full flex-grow flex-1">
                      <h6 className="uppercase text-blueGray-400 mb-1 text-xs font-semibold">
                        Hoạt động
                      </h6>
                      <h2 className="text-blueGray-700 text-xl font-semibold">
                        7 ngày qua
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex-auto">
                  <div className="relative h-350-px">
                    <CardLineChart
                      title=""
                      subtitle=""
                      data={prepareWeeklyActivityChartData()}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Lessons */}
            <div className="w-full xl:w-4/12 px-4">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
                <div className="rounded-t mb-0 px-4 py-3 border-0">
                  <div className="flex flex-wrap items-center">
                    <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                      <h3 className="font-semibold text-base text-blueGray-700">
                        Top bài học phổ biến
                      </h3>
                    </div>
                    <div className="relative w-auto px-4 max-w-full flex-grow flex-0">
                      <button
                        onClick={handleExportStudentsExcel}
                        className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      >
                        <i className="fas fa-file-excel mr-1"></i>
                        Export
                      </button>
                    </div>
                  </div>
                </div>
                <div className="block w-full overflow-x-auto">
                  <table className="items-center w-full bg-transparent border-collapse">
                    <thead>
                      <tr>
                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                          Bài học
                        </th>
                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                          Lượt xem
                        </th>
                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                          Tỷ lệ hoàn thành
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lessonsAnalytics.slice(0, 10).map((lesson, index) => (
                        <tr key={lesson.lessonId}>
                          <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                            <span className="font-semibold text-blueGray-600">
                              {lesson.lessonTitle.length > 30 ? 
                                lesson.lessonTitle.substring(0, 30) + '...' : lesson.lessonTitle}
                            </span>
                            <br />
                            <span className="text-xs text-blueGray-500">
                              {analyticsService.getLessonTypeDisplayName(lesson.lessonType)} • {analyticsService.getLevelDisplayName(lesson.level)}
                            </span>
                          </th>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <span className="font-bold text-blueGray-600">
                              {analyticsService.formatNumber(lesson.totalViews)}
                            </span>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <div className="flex items-center">
                              <span className="mr-2 font-bold">
                                {analyticsService.formatPercentage(lesson.completionRate)}
                              </span>
                              <div className="relative w-full">
                                <div className="overflow-hidden h-2 text-xs flex rounded bg-blueGray-200">
                                  <div
                                    style={{ width: `${Math.min(lesson.completionRate, 100)}%` }}
                                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                      lesson.completionRate >= 80 ? 'bg-emerald-500' :
                                      lesson.completionRate >= 60 ? 'bg-orange-500' :
                                      'bg-red-500'
                                    }`}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Analytics Section */}
          <div className="flex flex-wrap mt-4">
            <div className="w-full mb-12 px-4">
              <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
                <div className="rounded-t bg-white mb-0 px-6 py-6">
                  <div className="text-center flex justify-between">
                    <h6 className="text-blueGray-700 text-xl font-bold">
                      Thống kê chi tiết
                    </h6>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => window.location.href = '/admin/student-reports'}
                        className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                      >
                        <i className="fas fa-users mr-2"></i>
                        Báo cáo học viên
                      </button>
                      <button 
                        onClick={() => window.location.href = '/admin/lesson-analytics'}
                        className="bg-emerald-500 text-white active:bg-emerald-600 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                      >
                        <i className="fas fa-chart-bar mr-2"></i>
                        Chi tiết bài học
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blueGray-700">
                        {analyticsService.formatNumber(systemStats?.totalQuestions || 0)}
                      </div>
                      <div className="text-sm text-blueGray-400">Tổng số câu hỏi</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blueGray-700">
                        {analyticsService.formatNumber(systemStats?.totalTeachers || 0)}
                      </div>
                      <div className="text-sm text-blueGray-400">Giáo viên</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blueGray-700">
                        {analyticsService.formatNumber(systemStats?.completedLessonsToday || 0)}
                      </div>
                      <div className="text-sm text-blueGray-400">Bài hoàn thành hôm nay</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blueGray-700">
                        {analyticsService.formatNumber(systemStats?.newRegistrationsThisWeek || 0)}
                      </div>
                      <div className="text-sm text-blueGray-400">Đăng ký tuần này</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
