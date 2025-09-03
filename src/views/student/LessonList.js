import React, { useState, useEffect } from 'react';
import LessonCard from '../../components/Student/Cards/LessonCard';
import lessonService from '../../services/lessonService';

export default function LessonList() {
  // Data state
  const [lessons, setLessons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    level: 'all',
    type: 'all',
    category: 'all',
    search: ''
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  // Load lessons on mount and filter change
  useEffect(() => {
    fetchLessons();
  }, [filters, pagination.page]);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching lessons with filters: - LessonList.js:43', filters);
      
      // Gọi API đúng endpoint - /users/student/lessons
      const response = await lessonService.getPublishedLessons(filters);
      
      console.log('📡 API Response: - LessonList.js:48', response);
      
      if (response && response.success) {
        const allLessons = response.data || [];
        console.log(`✅ Loaded ${allLessons.length} lessons successfully - LessonList.js:52`);
        
        setLessons(allLessons);
        setPagination(prev => ({
          ...prev,
          total: allLessons.length,
          totalPages: Math.ceil(allLessons.length / prev.limit)
        }));
      } else {
        console.warn('⚠️ API Response not successful: - LessonList.js:61', response);
        setLessons([]);
        setError('Không có bài học nào được tìm thấy.');
      }

    } catch (error) {
      console.error('❌ Error fetching lessons: - LessonList.js:67', error);
      setError('Không thể tải danh sách bài học. Vui lòng kiểm tra kết nối và thử lại.');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('📂 Fetching categories... - LessonList.js:77');
      const categories = await lessonService.getCategories();
      console.log('✅ Categories loaded: - LessonList.js:79', categories);
      setCategories(categories || []);
    } catch (error) {
      console.error('❌ Error fetching categories: - LessonList.js:82', error);
      // Don't show error for categories, just use empty array
      setCategories([]);
    }
  };

  const handleFilterChange = (filterType, value) => {
    console.log(`🎛️ Filter changed: ${filterType} = ${value} - LessonList.js:89`);
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    console.log('🔍 Search changed: - LessonList.js:99', value);
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0); // Scroll to top
  };

  const handleRetry = () => {
    console.log('🔄 Retrying to fetch lessons... - LessonList.js:110');
    fetchLessons();
  };

  const handleClearFilters = () => {
    console.log('🧹 Clearing all filters... - LessonList.js:115');
    setFilters({ level: 'all', type: 'all', category: 'all', search: '' });
  };

  // Paginate lessons for current page
  const paginatedLessons = lessons.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  if (error) {
    return (
      <div className="flex-1 bg-blueGray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="mb-4">
              <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h2>
              <p className="text-red-500 text-lg mb-4">{error}</p>
            </div>
            <div className="space-x-4">
              <button 
                onClick={handleRetry}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-redo mr-2"></i>
                Thử lại
              </button>
              <button 
                onClick={handleClearFilters}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <i className="fas fa-eraser mr-2"></i>
                Xóa bộ lọc
              </button>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              <p>💡 <strong>Gợi ý khắc phục:</strong></p>
              <ul className="mt-2 list-disc list-inside text-left max-w-md mx-auto">
                <li>Kiểm tra kết nối internet</li>
                <li>Đăng nhập lại tài khoản</li>
                <li>Liên hệ admin nếu lỗi vẫn tiếp diễn</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-blueGray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bài học</h1>
          <p className="text-gray-600">Chọn bài học phù hợp với trình độ của bạn</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm bài học..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              {filters.search && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i className="fas fa-times text-gray-400 hover:text-gray-600"></i>
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cấp độ</label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả cấp độ</option>
                <option value="A2">A2 - Sơ cấp</option>
                <option value="B1">B1 - Trung cấp thấp</option>
                <option value="B2">B2 - Trung cấp cao</option>
                <option value="C1">C1 - Cao cấp</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại bài học</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả loại</option>
                <option value="reading">Đọc</option>
                <option value="listening">Nghe</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chủ đề</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả chủ đề</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.level !== 'all' || filters.type !== 'all' || filters.category !== 'all' || filters.search) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Bộ lọc đang áp dụng:</span>
              
              {filters.level !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Cấp độ: {filters.level}
                  <button onClick={() => handleFilterChange('level', 'all')} className="ml-2 text-blue-600">
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )}
              
              {filters.type !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Loại: {filters.type === 'reading' ? 'Đọc' : 'Nghe'}
                  <button onClick={() => handleFilterChange('type', 'all')} className="ml-2 text-green-600">
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )}
              
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  Tìm kiếm: "{filters.search}"
                  <button onClick={() => handleFilterChange('search', '')} className="ml-2 text-purple-600">
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )}
              
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Xóa tất cả
              </button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            {loading ? (
              <span>Đang tải...</span>
            ) : (
              <span>Tìm thấy <strong>{lessons.length}</strong> bài học</span>
            )}
          </div>
          {pagination.totalPages > 1 && (
            <div className="text-gray-600">
              Trang {pagination.page} / {pagination.totalPages}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Đang tải bài học...</span>
          </div>
        )}

        {/* No Results */}
        {!loading && lessons.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="mb-4">
              <i className="fas fa-search text-gray-400 text-4xl mb-4"></i>
              <div className="text-gray-500 text-lg mb-4">Không tìm thấy bài học nào</div>
              <p className="text-gray-400 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
            <button
              onClick={handleClearFilters}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-eraser mr-2"></i>
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Lesson Grid */}
        {!loading && paginatedLessons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedLessons.map(lesson => (
              <LessonCard 
                key={`${lesson.type || 'unknown'}-${lesson.id}`} 
                lesson={lesson} 
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            {[...Array(pagination.totalPages)].map((_, index) => {
              const page = index + 1;
              const isActive = page === pagination.page;
              
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}