import React, { useState, useEffect } from 'react';

export default function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation
    setTimeout(() => setIsAnimating(true), 100);

    // Auto close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300); // Wait for animation to complete
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          text: 'text-white',
          border: 'border-green-600',
          icon: 'fas fa-check-circle'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          text: 'text-white', 
          border: 'border-red-600',
          icon: 'fas fa-exclamation-circle'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          text: 'text-black',
          border: 'border-yellow-600',
          icon: 'fas fa-exclamation-triangle'
        };
      case 'info':
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          border: 'border-blue-600',
          icon: 'fas fa-info-circle'
        };
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-white',
          border: 'border-gray-600',
          icon: 'fas fa-info-circle'
        };
    }
  };

  if (!isVisible) return null;

  const styles = getTypeStyles();

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center px-4 py-3 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform min-w-80 max-w-md ${
        isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-[-20px] opacity-0'
      } ${styles.bg} ${styles.text} ${styles.border}`}
      style={{
        zIndex: 9999,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mr-3">
        <i className={`${styles.icon} text-lg`}></i>
      </div>

      {/* Message */}
      <div className="flex-1 font-medium">
        {message}
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className={`ml-3 flex-shrink-0 text-lg hover:opacity-75 transition-opacity focus:outline-none ${styles.text}`}
        aria-label="Đóng thông báo"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}

// Toast Provider để quản lý multiple toasts
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration + animation time
    setTimeout(() => {
      removeToast(id);
    }, duration + 300);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Provide toast functions to children
  const toastContext = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration)
  };

  return (
    <>
      {children}
      
      {/* Render toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2" style={{ zIndex: 9999 }}>
        {toasts.map((toast, index) => (
          <div key={toast.id} style={{ transform: `translateY(${index * 70}px)` }}>
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </>
  );
}

// Hook để sử dụng toast
export function useToast() {
  // Simple implementation - you can enhance this with Context API
  return {
    success: (message, duration = 3000) => {
      // Create and show toast
      const toastEl = document.createElement('div');
      document.body.appendChild(toastEl);
      
      // Render toast
      import('react-dom').then(({ render }) => {
        render(
          <Toast 
            message={message} 
            type="success" 
            duration={duration}
            onClose={() => {
              document.body.removeChild(toastEl);
            }}
          />, 
          toastEl
        );
      });
    },
    error: (message, duration = 4000) => {
      const toastEl = document.createElement('div');
      document.body.appendChild(toastEl);
      
      import('react-dom').then(({ render }) => {
        render(
          <Toast 
            message={message} 
            type="error" 
            duration={duration}
            onClose={() => {
              document.body.removeChild(toastEl);
            }}
          />, 
          toastEl
        );
      });
    },
    warning: (message, duration = 3000) => {
      const toastEl = document.createElement('div');
      document.body.appendChild(toastEl);
      
      import('react-dom').then(({ render }) => {
        render(
          <Toast 
            message={message} 
            type="warning" 
            duration={duration}
            onClose={() => {
              document.body.removeChild(toastEl);
            }}
          />, 
          toastEl
        );
      });
    },
    info: (message, duration = 3000) => {
      const toastEl = document.createElement('div');
      document.body.appendChild(toastEl);
      
      import('react-dom').then(({ render }) => {
        render(
          <Toast 
            message={message} 
            type="info" 
            duration={duration}
            onClose={() => {
              document.body.removeChild(toastEl);
            }}
          />, 
          toastEl
        );
      });
    }
  };
}
