import { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast';

// Create context
const ToastContext = createContext();

// Toast provider component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  
  // Add a new toast
  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
    return id;
  };
  
  // Remove a toast by ID
  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };
  
  // Helper functions for different toast types
  const showSuccess = (message, duration) => addToast(message, 'success', duration);
  const showError = (message, duration) => addToast(message, 'error', duration);
  const showWarning = (message, duration) => addToast(message, 'warning', duration);
  const showInfo = (message, duration) => addToast(message, 'info', duration);
  
  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      
      {/* Render all active toasts */}
      <div className="toast-container">
        {toasts.map((toast, index) => (
          <div key={toast.id} style={{ marginTop: `${index * 4}rem` }}>
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Custom hook for using toast context
export function useToast() {
  return useContext(ToastContext);
}

export default ToastContext; 