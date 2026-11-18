import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              toast.type === 'success'
                ? 'bg-[#151D19]/90 border-[#20D69A]/40 text-[#F4F7F5]'
                : toast.type === 'error'
                ? 'bg-[#1D1517]/90 border-[#FF646D]/40 text-[#F4F7F5]'
                : toast.type === 'warning'
                ? 'bg-[#1D1B15]/90 border-[#F4B942]/40 text-[#F4F7F5]'
                : 'bg-[#151D19]/90 border-[#8AF0C7]/30 text-[#F4F7F5]'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#20D69A]" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-[#FF646D]" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#F4B942]" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-[#8AF0C7]" />}
            </div>
            <div className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#929F98] hover:text-[#F4F7F5] transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

