'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastMessage['type']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts((previousToasts) => [...previousToasts, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((previousToasts) => previousToasts.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/30 text-red-100'
                : toast.type === 'success'
                  ? 'bg-green-950/90 border-green-500/30 text-green-100'
                  : 'bg-slate-900/90 border-slate-700 text-slate-100'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
