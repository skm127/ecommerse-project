import React, { useState, useCallback } from 'react';

const ToastContext = React.createContext(() => {});

export const useToast = () => React.useContext(ToastContext);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState('success');
  const timerRef = React.useRef(null);

  const showToast = useCallback((msg, msgType = 'success') => {
    setMessage(msg);
    setType(msgType);
    setVisible(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2500);
  }, []);

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      icon: '✓',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-600',
      icon: '✕',
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      icon: 'ℹ',
    },
  };

  const current = styles[type] || styles.success;

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 ${current.bg} text-white px-6 py-3.5 rounded-xl shadow-2xl transition-all duration-500 z-[1000] flex items-center gap-3 ${
          visible
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-24 opacity-0 scale-95 pointer-events-none'
        }`}
        role="status"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg shrink-0">
          {current.icon}
        </div>
        <div className="text-sm font-medium">{message}</div>
      </div>
    </ToastContext.Provider>
  );
}
