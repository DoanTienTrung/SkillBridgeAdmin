import React, { useState } from 'react';
import Toast from './Toast';

// Demo component để test Toast
export default function ToastDemo() {
  const [showToast, setShowToast] = useState(null);

  const showSuccessToast = () => {
    setShowToast({
      message: '✨ Lưu từ vựng thành công!',
      type: 'success'
    });
  };

  const showErrorToast = () => {
    setShowToast({
      message: '❌ Có lỗi xảy ra khi lưu từ vựng!',
      type: 'error'
    });
  };

  const showWarningToast = () => {
    setShowToast({
      message: '⚠️ Từ vựng đã có trong danh sách!',
      type: 'warning'
    });
  };

  const showInfoToast = () => {
    setShowToast({
      message: 'ℹ️ Thông tin từ vựng đã được cập nhật!',
      type: 'info'
    });
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>🍞 Toast Notification Test</h2>
      
      {/* Test Buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
        <button 
          onClick={showSuccessToast}
          style={{
            padding: '12px 24px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          ✅ Success Toast
        </button>

        <button 
          onClick={showErrorToast}
          style={{
            padding: '12px 24px',
            backgroundColor: '#DC2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          ❌ Error Toast
        </button>

        <button 
          onClick={showWarningToast}
          style={{
            padding: '12px 24px',
            backgroundColor: '#D97706',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          ⚠️ Warning Toast
        </button>

        <button 
          onClick={showInfoToast}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          ℹ️ Info Toast
        </button>

        <button 
          onClick={() => setShowToast(null)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6B7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          🗑️ Clear Toast
        </button>
      </div>

      {/* Usage Examples */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ marginBottom: '15px' }}>📝 Usage Examples:</h3>
        
        <div style={{ fontSize: '14px', fontFamily: 'monospace', color: '#374151' }}>
          <p><strong>Basic Usage:</strong></p>
          <pre style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>{`// Import
import Toast from 'components/Toast';

// In component
const [toast, setToast] = useState(null);

// Show toast
setToast({
  message: '✨ Lưu từ vựng thành công!',
  type: 'success'
});

// In JSX
{toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    onClose={() => setToast(null)}
  />
)}`}</pre>

          <p style={{ marginTop: '15px' }}><strong>Available Types:</strong></p>
          <ul style={{ paddingLeft: '20px' }}>
            <li><code>success</code> - Green background, check icon</li>
            <li><code>error</code> - Red background, error icon</li>
            <li><code>warning</code> - Yellow background, warning icon</li>
            <li><code>info</code> - Blue background, info icon</li>
          </ul>

          <p style={{ marginTop: '15px' }}><strong>Props:</strong></p>
          <ul style={{ paddingLeft: '20px' }}>
            <li><code>message</code> - Text to display (required)</li>
            <li><code>type</code> - Toast type (default: 'success')</li>
            <li><code>duration</code> - Auto-close time in ms (default: 3000)</li>
            <li><code>onClose</code> - Callback when toast closes</li>
          </ul>
        </div>
      </div>

      {/* Current State */}
      <div style={{ 
        backgroundColor: showToast ? '#FEF3C7' : '#F3F4F6', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #E5E7EB'
      }}>
        <strong>Current Toast State:</strong>
        <pre style={{ marginTop: '5px', fontSize: '12px' }}>
          {showToast ? JSON.stringify(showToast, null, 2) : 'null'}
        </pre>
      </div>

      {/* Render Toast */}
      {showToast && (
        <Toast
          message={showToast.message}
          type={showToast.type}
          duration={5000} // 5 seconds for demo
          onClose={() => setShowToast(null)}
        />
      )}
    </div>
  );
}
