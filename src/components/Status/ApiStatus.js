import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';

export default function ApiStatus() {
  const [status, setStatus] = useState({
    connected: false,
    loading: true,
    error: null,
    responseTime: null
  });

  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    setStatus(prev => ({ ...prev, loading: true, error: null }));
    const startTime = Date.now();

    try {
      await authService.testConnection();
      const responseTime = Date.now() - startTime;
      
      setStatus({
        connected: true,
        loading: false,
        error: null,
        responseTime
      });
    } catch (error) {
      setStatus({
        connected: false,
        loading: false,
        error: error.message,
        responseTime: null
      });
    }
  };

  const getStatusColor = () => {
    if (status.loading) return 'text-yellow-500';
    if (status.connected) return 'text-green-500';
    return 'text-red-500';
  };

  const getStatusIcon = () => {
    if (status.loading) return 'fas fa-spinner fa-spin';
    if (status.connected) return 'fas fa-check-circle';
    return 'fas fa-exclamation-triangle';
  };

  const getStatusText = () => {
    if (status.loading) return 'Đang kiểm tra...';
    if (status.connected) return `Kết nối thành công (${status.responseTime}ms)`;
    return 'Không thể kết nối';
  };

  return (
    <div className="inline-flex items-center text-xs">
      <i className={`${getStatusIcon()} ${getStatusColor()} mr-2`}></i>
      <span className={getStatusColor()}>
        {getStatusText()}
      </span>
      {!status.loading && (
        <button
          onClick={testApiConnection}
          className="ml-2 text-blueGray-400 hover:text-blueGray-600 transition-colors"
          title="Kiểm tra lại kết nối"
        >
          <i className="fas fa-redo text-xs"></i>
        </button>
      )}
    </div>
  );
}