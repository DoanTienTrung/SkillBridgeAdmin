import httpClient from './httpClient';

/**
 * Analytics Service để gọi APIs thống kê và báo cáo
 */
class AnalyticsService {

  /**
   * Lấy thống kê tổng quan hệ thống
   */
  async getSystemAnalytics() {
    try {
      console.log('🔄 Getting system analytics...');
      const response = await httpClient.get('/analytics/system');
      console.log('📊 System analytics:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error getting system analytics:', error);
      throw error;
    }
  }

  /**
   * Lấy hoạt động 7 ngày qua
   */
  async getWeeklyActivity() {
    try {
      console.log('🔄 Getting weekly activity...');
      const response = await httpClient.get('/analytics/weekly-activity');
      console.log('📈 Weekly activity:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error getting weekly activity:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê tất cả bài học
   */
  async getAllLessonsAnalytics() {
    try {
      console.log('🔄 Getting lessons analytics...');
      const response = await httpClient.get('/analytics/lessons');
      console.log('📚 Lessons analytics:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error getting lessons analytics:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê một bài học cụ thể
   */
  async getLessonAnalytics(lessonId, lessonType) {
    try {
      console.log(`🔄 Getting lesson analytics for ${lessonId} (${lessonType})...`);
      const response = await httpClient.get(`/analytics/lessons/${lessonId}?lessonType=${lessonType}`);
      console.log('📖 Lesson analytics:', response.data);
      return response;
    } catch (error) {
      console.error(`❌ Error getting lesson analytics for ${lessonId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy báo cáo tiến độ một học viên
   */
  async getStudentReport(studentId) {
    try {
      console.log(`🔄 Getting student report for ${studentId}...`);
      const response = await httpClient.get(`/analytics/students/${studentId}/report`);
      console.log('👨‍🎓 Student report:', response.data);
      return response;
    } catch (error) {
      console.error(`❌ Error getting student report for ${studentId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy báo cáo tất cả học viên
   */
  async getAllStudentsReports() {
    try {
      console.log('🔄 Getting all students reports...');
      const response = await httpClient.get('/analytics/students/reports');
      console.log('👨‍🎓 All students reports:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error getting all students reports:', error);
      throw error;
    }
  }

  /**
   * Export danh sách học viên ra Excel
   */
  async exportStudentsExcel() {
    try {
      console.log('🔄 Exporting students to Excel...');
      const response = await httpClient.get('/analytics/export/students', { 
        responseType: 'blob' 
      });
      
      // Tạo link download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `students_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      console.log('📊 Excel export completed');
      return response;
    } catch (error) {
      console.error('❌ Error exporting students to Excel:', error);
      throw error;
    }
  }

  /**
   * Export báo cáo học viên ra PDF
   */
  async exportStudentPdf(studentId) {
    try {
      console.log(`🔄 Exporting student ${studentId} report to PDF...`);
      const response = await httpClient.get(`/analytics/export/student/${studentId}/pdf`, { 
        responseType: 'blob' 
      });
      
      // Tạo link download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student_${studentId}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      console.log('📄 PDF export completed');
      return response;
    } catch (error) {
      console.error(`❌ Error exporting student ${studentId} report to PDF:`, error);
      throw error;
    }
  }

  /**
   * Format số với dấu phẩy
   */
  formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Format thời gian từ giây
   */
  formatTime(seconds) {
    if (!seconds) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  /**
   * Format phần trăm
   */
  formatPercentage(value, decimals = 1) {
    if (value === null || value === undefined) return '0%';
    return `${Number(value).toFixed(decimals)}%`;
  }

  /**
   * Format điểm số
   */
  formatScore(score, maxScore = 10) {
    if (score === null || score === undefined) return `0/${maxScore}`;
    return `${Number(score).toFixed(1)}/${maxScore}`;
  }

  /**
   * Lấy màu cho completion rate
   */
  getCompletionRateColor(rate) {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    if (rate >= 40) return 'text-orange-600';
    return 'text-red-600';
  }

  /**
   * Lấy màu cho accuracy rate
   */
  getAccuracyRateColor(rate) {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-blue-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Convert level enum to display name
   */
  getLevelDisplayName(level) {
    const levelMap = {
      'A2': 'Cơ bản',
      'B1': 'Trung cấp thấp', 
      'B2': 'Trung cấp cao',
      'C1': 'Nâng cao'
    };
    return levelMap[level] || level;
  }

  /**
   * Convert lesson type to display name
   */
  getLessonTypeDisplayName(type) {
    const typeMap = {
      'LISTENING': 'Bài nghe',
      'READING': 'Bài đọc'
    };
    return typeMap[type] || type;
  }
}

export default new AnalyticsService();
