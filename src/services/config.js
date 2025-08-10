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
  STUDENTS: '/users/students',
  USER_BY_ID: (id) => `/users/${id}`,
  TOGGLE_USER: (id) => `/users/${id}/toggle-active`,
  
  // Listening Lessons
  LISTENING_LESSONS: '/listening-lessons',
  LISTENING_LESSON_BY_ID: (id) => `/listening-lessons/${id}`,
  PUBLISH_LESSON: (id) => `/listening-lessons/${id}/publish`,
  
  // Categories
  CATEGORIES: '/categories'
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
