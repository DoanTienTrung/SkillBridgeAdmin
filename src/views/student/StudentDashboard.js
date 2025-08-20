import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import authService from '../../services/authService';
import lessonService from '../../services/lessonService';

// Import cards components
import CardStats from "components/Cards/CardStats.js";
import CardLineChart from "components/Cards/CardLineChart.js";
import CardBarChart from "components/Cards/CardBarChart.js";

export default function StudentDashboard() {
  const history = useHistory();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    completedLessons: 0,
    totalLessons: 0,
    averageScore: 0,
    totalTimeStudied: 0,
    vocabularyCount: 0,
    weeklyProgress: []
  });
  const [recentLessons, setRecentLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentUser = authService.getCurrentUserFromToken();
      setUser(currentUser);
      
      // Load student statistics
      const [statsRes, lessonsRes] = await Promise.all([
        lessonService.getStudentStats(),
        lessonService.getRecentLessons(5)
      ]);
      
      setStats(statsRes.data);
      setRecentLessons(lessonsRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getCompletionPercentage = () => {
    return stats.totalLessons > 0 ? Math.round((stats.completedLessons / stats.totalLessons) * 100) : 0;
  };

  const handleViewAllLessons = () => {
    history.push('/student/lessons');
  };

  const handleViewProgress = () => {
    history.push('/student/progress');
  };

  const handleViewVocabulary = () => {
    history.push('/student/vocabulary');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="relative bg-blueGray-100 min-h-screen">
      <div className="relative bg-lightBlue-600 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          {/* Header */}
          <div className="mb-12 xl:mb-0 px-4">
            <h1 className="text-white text-3xl font-semibold">
              Xin chào, {user?.fullName}! 👋
            </h1>
            <p className="text-lightBlue-200 text-lg mt-2">
              Hãy tiếp tục hành trình học tiếng Anh của bạn
            </p>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-wrap">
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="Bài học hoàn thành"
                statTitle={`${stats.completedLessons}/${stats.totalLessons}`}
                statArrow="up"
                statPercent={Math.round((stats.completedLessons / stats.totalLessons) * 100) || 0}
                statPercentColor="text-emerald-500"
                statDescription="Tiến độ tổng"
                statIconName="fas fa-check-circle"
                statIconColor="bg-red-500"
              />
            </div>
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="Điểm trung bình"
                statTitle={`${stats.averageScore.toFixed(1)}/10`}
                statArrow="up"
                statPercent="12"
                statPercentColor="text-emerald-500"
                statDescription="So với tuần trước"
                statIconName="fas fa-star"
                statIconColor="bg-orange-500"
              />
            </div>
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="Thời gian học"
                statTitle={`${Math.floor(stats.totalTimeStudied / 3600)}h ${Math.floor((stats.totalTimeStudied % 3600) / 60)}m`}
                statArrow="up"
                statPercent="5"
                statPercentColor="text-emerald-500"
                statDescription="Tuần này"
                statIconName="fas fa-clock"
                statIconColor="bg-pink-500"
              />
            </div>
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="Từ vựng đã học"
                statTitle={stats.vocabularyCount.toString()}
                statArrow="up"
                statPercent="18"
                statPercentColor="text-emerald-500"
                statDescription="Từ mới tuần này"
                statIconName="fas fa-book"
                statIconColor="bg-lightBlue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-10 mx-auto w-full -m-24">
        <div className="flex flex-wrap">
          {/* Progress Chart */}
          <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
            <CardLineChart
              title="Tiến độ học tập 7 ngày"
              subtitle="Điểm số theo ngày"
              data={stats.weeklyProgress}
            />
          </div>

          {/* Recent Lessons */}
          <div className="w-full xl:w-4/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
              <div className="rounded-t mb-0 px-4 py-3 border-0">
                <div className="flex flex-wrap items-center">
                  <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                    <h3 className="font-semibold text-base text-blueGray-700">
                      Bài học gần đây
                    </h3>
                  </div>
                </div>
              </div>
              <div className="block w-full overflow-x-auto">
                <table className="items-center w-full bg-transparent border-collapse">
                  <tbody>
                    {recentLessons.map((lesson, index) => (
                      <tr key={lesson.id}>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <span className="font-bold text-blueGray-600">
                            {lesson.title}
                          </span>
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            lesson.isCompleted 
                              ? 'bg-emerald-200 text-emerald-600' 
                              : 'bg-orange-200 text-orange-600'
                          }`}>
                            {lesson.isCompleted ? 'Hoàn thành' : 'Đang học'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap mt-4">
          <div className="w-full mb-12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
              <div className="rounded-t bg-white mb-0 px-6 py-6">
                <div className="text-center flex justify-between">
                  <h6 className="text-blueGray-700 text-xl font-bold">
                    Hành động nhanh
                  </h6>
                </div>
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-4/12 px-4">
                    <button 
                      onClick={handleViewAllLessons}
                      className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150"
                    >
                      <i className="fas fa-book mr-2"></i>
                      Tất cả bài học
                    </button>
                  </div>
                  <div className="w-full lg:w-4/12 px-4">
                    <button 
                      onClick={handleViewProgress}
                      className="bg-emerald-500 text-white active:bg-emerald-600 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150"
                    >
                      <i className="fas fa-chart-line mr-2"></i>
                      Tiến độ
                    </button>
                  </div>
                  <div className="w-full lg:w-4/12 px-4">
                    <button 
                      onClick={handleViewVocabulary}
                      className="bg-purple-500 text-white active:bg-purple-600 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150"
                    >
                      <i className="fas fa-language mr-2"></i>
                      Từ vựng
                    </button>
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