import React, { useState, useEffect } from 'react';

export default function ProgressTracker() {
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    totalTimeStudied: 0,
    averageScore: 0,
    vocabularyCount: 0,
    currentStreak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      // TODO: Implement progress API call
      // const response = await progressService.getUserProgress();
      // setStats(response.data);
      
      // Temporary mock data
      setStats({
        totalLessons: 50,
        completedLessons: 23,
        totalTimeStudied: 1247, // minutes
        averageScore: 87,
        vocabularyCount: 156,
        currentStreak: 7
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-blueGray-50 p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-blueGray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tiến độ học tập</h1>
          <p className="text-gray-600">Theo dõi quá trình học tập của bạn</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Lessons Progress */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Bài học</h3>
              <div className="p-3 bg-blue-100 rounded-full">
                <i className="fas fa-book text-blue-600"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.completedLessons}/{stats.totalLessons}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(stats.completedLessons / stats.totalLessons) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {Math.round((stats.completedLessons / stats.totalLessons) * 100)}% hoàn thành
            </div>
          </div>

          {/* Study Time */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Thời gian học</h3>
              <div className="p-3 bg-green-100 rounded-full">
                <i className="fas fa-clock text-green-600"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatTime(stats.totalTimeStudied)}
            </div>
            <div className="text-sm text-gray-600">Tổng thời gian học tập</div>
          </div>

          {/* Average Score */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Điểm trung bình</h3>
              <div className="p-3 bg-yellow-100 rounded-full">
                <i className="fas fa-star text-yellow-600"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.averageScore}%</div>
            <div className="text-sm text-gray-600">Điểm số bài tập</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Vocabulary */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Từ vựng</h3>
              <div className="p-3 bg-purple-100 rounded-full">
                <i className="fas fa-language text-purple-600"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.vocabularyCount}</div>
            <div className="text-sm text-gray-600">Từ đã học</div>
          </div>

          {/* Learning Streak */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chuỗi học tập</h3>
              <div className="p-3 bg-orange-100 rounded-full">
                <i className="fas fa-fire text-orange-600"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.currentStreak}</div>
            <div className="text-sm text-gray-600">Ngày liên tiếp</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Progress Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiến độ tuần này</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <i className="fas fa-chart-line text-4xl mb-4"></i>
                <p>Biểu đồ tiến độ sẽ được hiển thị ở đây</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Hoàn thành bài "Daily Conversation" - 92%</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Thêm 5 từ vựng mới</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Học bài "Business English" - 88%</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Ôn tập từ vựng - 15 từ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mục tiêu cá nhân</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Hoàn thành 30 bài học trong tháng</span>
                <span className="text-sm text-gray-600">23/30</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '77%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Học 20 giờ trong tháng</span>
                <span className="text-sm text-gray-600">20h 47m/20h</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
