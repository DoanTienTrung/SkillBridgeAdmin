// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Environment check
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',
  TOKEN_INFO: '/auth/token-info',
  LOGOUT: '/auth/logout',
  
  // Users
  PROFILE: '/users/profile',
  CHANGE_PASSWORD: '/users/change-password',
  UPDATE_AVATAR: '/users/avatar',
  STUDENTS: '/users/students',
  USER_BY_ID: (id) => `/users/${id}`,
  TOGGLE_USER: (id) => `/users/${id}/toggle-active`,
  USERS: '/users',
  CREATE_USER: '/users',
  UPDATE_USER: (id) => `/users/${id}`,
  DELETE_USER: (id) => `/users/${id}`,
  RESET_PASSWORD: (id) => `/users/${id}/reset-password`,
  TOGGLE_USER_STATUS: (id) => `/users/${id}/toggle-status`,
  
  // File Uploads
  UPLOAD_AVATAR: '/upload/avatar',
  UPLOAD_IMAGES: '/upload/images',
  
  // Listening Lessons
  LISTENING_LESSONS: '/listening-lessons',
  LISTENING_LESSONS_ADMIN: '/listening-lessons/admin',
  LISTENING_LESSON_BY_ID: (id) => `/listening-lessons/${id}`,
  PUBLISH_LESSON: (id) => `/listening-lessons/${id}/publish`,

  // Audio Upload
  AUDIO_UPLOAD: '/audio/upload',
  AUDIO_DELETE: (fileName) => `/audio/${fileName}`,


  
  QUESTIONS: '/questions',

  READING_LESSONS: '/reading-lessons',
  READING_LESSONS_ADMIN: '/reading-lessons/admin',
  READING_LESSON_BY_ID: (id) => `/reading-lessons/${id}`,
  READING_LESSON_STATUS: (id) => `/reading-lessons/${id}/status`,
  UPLOAD_TEXT_FILE: '/reading-lessons/upload-text',
  
  // Categories
  CATEGORIES: '/categories',
  
  // Student APIs (through UserController)
  STUDENT_STATS: '/users/student/stats',
  STUDENT_RECENT_LESSONS: '/users/student/recent-lessons',
  STUDENT_LESSONS: '/users/student/lessons',
  STUDENT_LESSON_BY_TYPE_ID: (type, id) => `/users/student/lessons/${type}/${id}`,
  STUDENT_SUBMIT_ANSWERS: '/users/student/submit-answers',
  STUDENT_PROGRESS: '/users/student/progress'
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
};

// Response Status
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};



export default API_BASE_URL;


