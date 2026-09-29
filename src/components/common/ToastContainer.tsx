import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = Info;
          let borderClass = 'border-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100';
          let iconClass = 'text-blue-500';

          if (toast.type === 'success') {
            Icon = CheckCircle2;
            borderClass = 'border-emerald-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100';
            iconClass = 'text-emerald-500';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            borderClass = 'border-rose-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100';
            iconClass = 'text-rose-500';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            borderClass = 'border-amber-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100';
            iconClass = 'text-amber-500';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto p-4 rounded-xl border shadow-lg flex items-start gap-3 ${borderClass}`}
              id={`toast-item-${toast.id}`}
            >
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconClass}`} />
              <div className="flex-1 text-sm">
                <div className="font-semibold text-slate-900 dark:text-white">{toast.title}</div>
                {toast.message && <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">{toast.message}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                aria-label="Tutup notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
