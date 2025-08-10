import httpClient from './httpClient';
import API_BASE_URL, { API_ENDPOINTS } from './config';

/**
 * Custom Error Classes cho Audio Service
 */
class AudioUploadError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'AudioUploadError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Audio Service để xử lý upload, validate và quản lý file audio
 */
class AudioService {
  constructor() {
    // File size limits
    this.MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    
    // Allowed file extensions
    this.ALLOWED_EXTENSIONS = ['mp3', 'wav', 'm4a', 'aac', 'ogg'];
    
    // Allowed MIME types
    this.ALLOWED_MIME_TYPES = [
      'audio/mpeg',
      'audio/mp3', 
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/mp4',
      'audio/aac',
      'audio/ogg'
    ];

    // Error messages
    this.ERROR_MESSAGES = {
      FILE_TOO_LARGE: 'File quá lớn. Kích thước tối đa là 50MB',
      INVALID_FORMAT: 'Format không hỗ trợ. Chỉ chấp nhận MP3, WAV, M4A, AAC, OGG',
      UPLOAD_FAILED: 'Upload thất bại. Vui lòng thử lại',
      DELETE_FAILED: 'Xóa file thất bại',
      NETWORK_ERROR: 'Lỗi kết nối mạng',
      SERVER_ERROR: 'Lỗi server',
      FILE_NOT_FOUND: 'File không tồn tại',
      INVALID_FILE: 'File không hợp lệ'
    };

    // Error codes
    this.ERROR_CODES = {
      VALIDATION_ERROR: 'VALIDATION_ERROR',
      UPLOAD_ERROR: 'UPLOAD_ERROR',
      NETWORK_ERROR: 'NETWORK_ERROR', 
      SERVER_ERROR: 'SERVER_ERROR',
      FILE_NOT_FOUND: 'FILE_NOT_FOUND'
    };
  }

  /**
   * Validate audio file
   * @param {File} file - File object cần validate
   * @returns {Object} Validation result
   */
  validateAudioFile(file) {
    console.log('🔍 Validating audio file:', file?.name);

    // Null/undefined check
    if (!file) {
      return {
        isValid: false,
        error: this.ERROR_MESSAGES.INVALID_FILE,
        fileInfo: null
      };
    }

    // File size validation
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: this.ERROR_MESSAGES.FILE_TOO_LARGE,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          extension: this._getFileExtension(file.name)
        }
      };
    }

    // File extension validation
    const extension = this._getFileExtension(file.name);
    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        isValid: false,
        error: this.ERROR_MESSAGES.INVALID_FORMAT,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          extension: extension
        }
      };
    }

    // MIME type validation
    if (!this._isValidMimeType(file.type)) {
      return {
        isValid: false,
        error: this.ERROR_MESSAGES.INVALID_FORMAT,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          extension: extension
        }
      };
    }

    // All validations passed
    console.log('✅ File validation passed:', file.name);
    return {
      isValid: true,
      error: null,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        extension: extension,
        formattedSize: this.formatFileSize(file.size)
      }
    };
  }

  /**
   * Format file size to human readable string
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    // Input validation
    if (typeof bytes !== 'number' || bytes < 0) {
      return '0 B';
    }

    if (bytes === 0) {
      return '0 B';
    }

    // Unit conversion
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    
    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  /**
   * Get audio duration (Optional method)
   * @param {File} file - Audio file
   * @returns {Promise<string>} Duration in MM:SS format
   */
  async getAudioDuration(file) {
    return new Promise((resolve, reject) => {
      console.log('🎧 Getting audio duration for:', file.name);

      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(url);
        reject(new Error('Timeout getting audio duration'));
      }, 10000);

      audio.addEventListener('loadedmetadata', () => {
        try {
          clearTimeout(timeout);
          const duration = audio.duration;
          const formattedDuration = this._formatDuration(duration);
          
          URL.revokeObjectURL(url);
          console.log('✅ Audio duration:', formattedDuration);
          resolve(formattedDuration);
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      });

      audio.addEventListener('error', (error) => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
        console.error('❌ Error getting audio duration:', error);
        reject(new Error('Cannot get audio duration'));
      });

      audio.src = url;
    });
  }

  /**
   * Upload audio file với progress tracking
   * @param {File} file - File cần upload
   * @param {Function} onProgress - Callback cho progress (0-100)
   * @returns {Promise<Object>} Upload result
   */
  async uploadAudio(file, onProgress) {
    console.log('📤 Starting audio upload:', file.name);

    // Pre-upload validation
    const validation = this.validateAudioFile(file);
    if (!validation.isValid) {
      throw new AudioUploadError(
        validation.error,
        this.ERROR_CODES.VALIDATION_ERROR,
        validation.fileInfo
      );
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      // Setup progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          console.log(`📊 Upload progress: ${progress}%`);
          if (onProgress && typeof onProgress === 'function') {
            onProgress(progress);
          }
        }
      });

      // Handle successful response
      xhr.addEventListener('load', () => {
        try {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              console.log('✅ Upload successful:', response.data);
              resolve(response.data);
            } else {
              reject(new AudioUploadError(
                response.message || this.ERROR_MESSAGES.UPLOAD_FAILED,
                this.ERROR_CODES.UPLOAD_ERROR
              ));
            }
          } else {
            const errorMessage = this._getErrorMessageByStatus(xhr.status);
            reject(new AudioUploadError(
              errorMessage,
              this.ERROR_CODES.SERVER_ERROR,
              { status: xhr.status }
            ));
          }
        } catch (error) {
          reject(new AudioUploadError(
            'Invalid server response',
            this.ERROR_CODES.SERVER_ERROR,
            { originalError: error.message }
          ));
        }
      });

      // Handle network errors
      xhr.addEventListener('error', () => {
        console.error('❌ Network error during upload');
        reject(new AudioUploadError(
          this.ERROR_MESSAGES.NETWORK_ERROR,
          this.ERROR_CODES.NETWORK_ERROR
        ));
      });

      // Handle timeout
      xhr.addEventListener('timeout', () => {
        console.error('❌ Upload timeout');
        reject(new AudioUploadError(
          'Upload timeout. Vui lòng thử lại',
          this.ERROR_CODES.NETWORK_ERROR
        ));
      });

      // Setup request
      const url = `${API_BASE_URL}${API_ENDPOINTS.AUDIO_UPLOAD}`;
      xhr.open('POST', url);
      
      // Set authorization header
      const token = httpClient.getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      // Set timeout (30 seconds)
      xhr.timeout = 30000;

      // Start upload
      console.log('🚀 Sending upload request to:', url);
      xhr.send(formData);
    });
  }

  /**
   * Delete uploaded audio file
   * @param {string} fileName - Tên file cần xóa
   * @returns {Promise<Object>} Delete result
   */
  async deleteAudio(fileName) {
    console.log('🗑️ Deleting audio file:', fileName);

    // Input validation
    if (!fileName || typeof fileName !== 'string') {
      throw new AudioUploadError(
        'Tên file không hợp lệ',
        this.ERROR_CODES.VALIDATION_ERROR
      );
    }

    try {
      // Extract just filename from full path if needed
      const justFileName = fileName.split('/').pop();
      
      console.log('📡 Sending delete request for:', justFileName);
      
      const response = await httpClient.delete(
        API_ENDPOINTS.AUDIO_DELETE(justFileName)
      );

      if (response.success) {
        console.log('✅ File deleted successfully:', justFileName);
        return {
          success: true,
          message: response.message || 'Xóa file thành công'
        };
      } else {
        throw new AudioUploadError(
          response.message || this.ERROR_MESSAGES.DELETE_FAILED,
          this.ERROR_CODES.SERVER_ERROR
        );
      }

    } catch (error) {
      console.error('❌ Delete failed:', error);
      
      if (error instanceof AudioUploadError) {
        throw error;
      }

      // Handle different error types
      if (error.message?.includes('404')) {
        throw new AudioUploadError(
          this.ERROR_MESSAGES.FILE_NOT_FOUND,
          this.ERROR_CODES.FILE_NOT_FOUND
        );
      }

      if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
        throw new AudioUploadError(
          this.ERROR_MESSAGES.NETWORK_ERROR,
          this.ERROR_CODES.NETWORK_ERROR
        );
      }

      throw new AudioUploadError(
        error.message || this.ERROR_MESSAGES.DELETE_FAILED,
        this.ERROR_CODES.SERVER_ERROR
      );
    }
  }

  /**
   * Validate file on server without uploading
   * @param {File} file - File cần validate
   * @returns {Promise<Object>} Validation result
   */
  async validateAudioOnServer(file) {
    console.log('🔍 Server validation for:', file.name);

    const validation = this.validateAudioFile(file);
    if (!validation.isValid) {
      throw new AudioUploadError(
        validation.error,
        this.ERROR_CODES.VALIDATION_ERROR
      );
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await httpClient.post(API_ENDPOINTS.AUDIO_VALIDATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        isValid: response.success,
        message: response.message
      };

    } catch (error) {
      console.error('❌ Server validation failed:', error);
      throw new AudioUploadError(
        error.message || 'Server validation failed',
        this.ERROR_CODES.SERVER_ERROR
      );
    }
  }

  /**
   * Check if audio file exists on server
   * @param {string} fileName - File name to check
   * @returns {Promise<Object>} File info
   */
  async checkAudioFile(fileName) {
    try {
      const justFileName = fileName.split('/').pop();
      const response = await httpClient.get(API_ENDPOINTS.AUDIO_CHECK(justFileName));

      return {
        exists: response.success,
        fileInfo: response.data
      };

    } catch (error) {
      if (error.message?.includes('404')) {
        return { exists: false, fileInfo: null };
      }
      throw error;
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Extract file extension from filename
   * @private
   * @param {string} filename - File name
   * @returns {string} File extension (lowercase)
   */
  _getFileExtension(filename) {
    if (!filename || typeof filename !== 'string') {
      return '';
    }
    
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
      return '';
    }
    
    return filename.substring(lastDotIndex + 1).toLowerCase();
  }

  /**
   * Check if MIME type is valid
   * @private
   * @param {string} mimeType - MIME type to check
   * @returns {boolean} Is valid MIME type
   */
  _isValidMimeType(mimeType) {
    if (!mimeType) return false;
    return this.ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase());
  }

  /**
   * Format duration from seconds to MM:SS or HH:MM:SS
   * @private
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  _formatDuration(seconds) {
    if (isNaN(seconds) || seconds < 0) {
      return '00:00';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Get error message by HTTP status code
   * @private
   * @param {number} status - HTTP status code
   * @returns {string} Error message
   */
  _getErrorMessageByStatus(status) {
    switch (status) {
      case 400:
        return 'Dữ liệu không hợp lệ';
      case 401:
        return 'Chưa đăng nhập hoặc phiên đăng nhập hết hạn';
      case 403:
        return 'Không có quyền truy cập';
      case 404:
        return 'Không tìm thấy endpoint';
      case 413:
        return 'File quá lớn';
      case 500:
        return 'Lỗi server nội bộ';
      default:
        return `Lỗi không xác định (${status})`;
    }
  }

  /**
   * Upload with retry mechanism
   * @param {File} file - File to upload
   * @param {Function} onProgress - Progress callback
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<Object>} Upload result
   */
  async uploadWithRetry(file, onProgress, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Upload attempt ${attempt}/${maxRetries}`);
        return await this.uploadAudio(file, onProgress);
      } catch (error) {
        lastError = error;
        
        // Don't retry validation errors
        if (error.code === this.ERROR_CODES.VALIDATION_ERROR) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }
}

// Create and export singleton instance
const audioService = new AudioService();

// Export both the class and instance
export { AudioService, AudioUploadError };
export default audioService;