import React, { useState } from 'react';
import authService from '../../services/authService';

export default function ChangePasswordForm({ className = '' }) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'Xác nhận mật khẩu không khớp');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      showMessage('error', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      showMessage('error', 'Mật khẩu mới phải khác mật khẩu hiện tại');
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      });
      
      // Clear form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      showMessage('success', 'Đổi mật khẩu thành công!');
    } catch (error) {
      console.error('Error changing password:', error);
      showMessage('error', error.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: '' };
    if (password.length < 6) return { strength: 1, text: 'Yếu', color: 'text-red-500' };
    if (password.length < 8) return { strength: 2, text: 'Trung bình', color: 'text-yellow-500' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, text: 'Mạnh', color: 'text-green-500' };
    }
    return { strength: 2, text: 'Trung bình', color: 'text-yellow-500' };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <div className={className}>
      {/* Message Alert */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          <div className="flex items-center">
            <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
            {message.text}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-md">
        {/* Current Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mật khẩu hiện tại *
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <i className={`fas ${showPasswords.current ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>
        
        {/* New Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mật khẩu mới *
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              minLength="6"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <i className={`fas ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {passwordForm.newPassword && (
            <div className="mt-2">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-500">Độ mạnh:</span>
                <span className={passwordStrength.color}>{passwordStrength.text}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    passwordStrength.strength === 1 ? 'bg-red-500 w-1/3' :
                    passwordStrength.strength === 2 ? 'bg-yellow-500 w-2/3' :
                    passwordStrength.strength === 3 ? 'bg-green-500 w-full' : 'w-0'
                  }`}
                ></div>
              </div>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            Mật khẩu phải có ít nhất 6 ký tự. Để mạnh hơn, hãy sử dụng chữ hoa và số.
          </p>
        </div>
        
        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Xác nhận mật khẩu mới *
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <i className={`fas ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
          
          {/* Confirmation Status */}
          {passwordForm.confirmPassword && (
            <div className="mt-1 text-xs">
              {passwordForm.newPassword === passwordForm.confirmPassword ? (
                <span className="text-green-600">
                  <i className="fas fa-check mr-1"></i>
                  Mật khẩu khớp
                </span>
              ) : (
                <span className="text-red-600">
                  <i className="fas fa-times mr-1"></i>
                  Mật khẩu không khớp
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Đang đổi mật khẩu...
            </>
          ) : (
            <>
              <i className="fas fa-key mr-2"></i>
              Đổi mật khẩu
            </>
          )}
        </button>
      </form>
    </div>
  );
}
