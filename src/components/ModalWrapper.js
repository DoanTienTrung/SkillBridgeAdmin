import React from 'react';
import ReactDOM from 'react-dom';

// Simple modal wrapper to ensure proper positioning
export default function ModalWrapper({ children, isOpen, onClose, preventClose = false }) {
  if (!isOpen) return null;

  const modalRoot = document.getElementById('modal-root') || createModalRoot();

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose && !preventClose) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );

  return ReactDOM.createPortal(modalContent, modalRoot);
}

function createModalRoot() {
  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  modalRoot.style.position = 'relative';
  modalRoot.style.zIndex = '9999';
  document.body.appendChild(modalRoot);
  return modalRoot;
}
