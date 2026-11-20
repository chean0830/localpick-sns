import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const timer = useRef();
  const toast = useCallback((msg) => {
    setMessage(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(''), 2200);
  }, []);
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={`toast ${message ? 'show' : ''}`} role="status">{message}</div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
