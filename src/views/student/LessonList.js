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
    try {
      const params = {
        page: pagination.page - 1, // Backend dùng 0-based indexing
        size: pagination.limit,
        ...(filters.level !== 'all' && { level: filters.level }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.category !== 'all' && { categoryId: filters.category }),
        ...(filters.search && { search: filters.search })
      };

      // Gọi API để lấy tất cả lessons đã publish
      const response = await lessonService.getPublishedLessons({
        type: filters.type,
        level: filters.level,
        category: filters.category,
        search: filters.search
      });

      let allLessons = response.data || [];

      // Filter by type if specified
      if (filters.type !== 'all') {
        allLessons = allLessons.filter(lesson => lesson.type === filters.type);
      }

      // Filter by level if specified
      if (filters.level !== 'all') {
        allLessons = allLessons.filter(lesson => lesson.level === filters.level);
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        allLessons = allLessons.filter(lesson => 
          lesson.title.toLowerCase().includes(searchTerm) ||
          lesson.description.toLowerCase().includes(searchTerm)
        );
      }

      setLessons(allLessons);
      setPagination(prev => ({
        ...prev,
        total: allLessons.length,
        totalPages: Math.ceil(allLessons.length / pagination.limit)
      }));

    } catch (error) {
      console.error('Error fetching lessons:', error);
      setError('Không thể tải danh sách bài học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = await lessonService.getCategories();
      setCategories(categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0); // Scroll to top
  };

  // Paginate lessons for current page
  const paginatedLessons = lessons.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  if (error) {
    return (
      <div className="flex-1 bg-blueGray-50 p-4">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
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
                <option value="LISTENING">Nghe</option>
                <option value="READING">Đọc</option>
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
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            Tìm thấy {lessons.length} bài học
          </div>
          <div className="text-gray-600">
            Trang {pagination.page} / {pagination.totalPages}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* No Results */}
        {!loading && lessons.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">Không tìm thấy bài học nào</div>
            <button
              onClick={() => setFilters({ level: 'all', type: 'all', category: 'all', search: '' })}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Lesson Grid */}
        {!loading && paginatedLessons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedLessons.map(lesson => (
              <LessonCard key={`${lesson.type}-${lesson.id}`} lesson={lesson} />
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
