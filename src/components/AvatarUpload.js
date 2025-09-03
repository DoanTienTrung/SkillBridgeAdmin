import React, { useState } from 'react';
import authService from 'services/authService';

export default function AvatarUpload({ user, onAvatarUpdate, className = '' }) {
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Handle avatar file selection
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        showMessage('error', 'Vui lòng chọn file ảnh');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        showMessage('error', 'File ảnh không được vượt quá 10MB');
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const updatedUser = await authService.uploadAvatar(
        avatarFile,
        (progress) => setUploadProgress(progress)
      );

      // Notify parent component
      // if (onAvatarUpdate) {
      //   onAvatarUpdate(updatedUser);
      // }
      
      setAvatarFile(null);
      setAvatarPreview(null);
      showMessage('success', 'Upload ảnh đại diện thành công!');
      
    } catch (error) {
      console.error('Error uploading avatar: - AvatarUpload.js:63', error);
      showMessage('error', error.message || 'Upload ảnh đại diện thất bại');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (user?.avatarUrl) return `/api/upload/images/${user.avatarUrl.split('/').pop()}`;
    return '/img/default-avatar.png';
  };

  return (
    <div className={`text-center ${className}`}>
      {/* Message Alert */}
      {message.text && (
        <div className={`mb-4 p-3 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Avatar Display */}
      <div className="mb-6">
        <div className="inline-block relative">
          <img
            src={getAvatarUrl()}
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            onError={(e) => {
              e.target.src = '/img/default-avatar.png';
            }}
          />
          {avatarPreview && (
            <button
              onClick={() => {
                setAvatarFile(null);
                setAvatarPreview(null);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {user?.fullName || 'Người dùng'}
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn ảnh đại diện mới
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarSelect}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isUploading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Chấp nhận file JPG, PNG, GIF. Tối đa 10MB
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Đang upload...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {avatarFile && !isUploading && (
        <button
          onClick={handleAvatarUpload}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <i className="fas fa-upload mr-2"></i>
          Upload ảnh đại diện
        </button>
      )}
      
      {isUploading && (
        <button
          disabled
          className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed"
        >
          <i className="fas fa-spinner fa-spin mr-2"></i>
          Đang upload...
        </button>
      )}
    </div>
  );
}
