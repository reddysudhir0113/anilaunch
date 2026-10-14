/**
 * Toast Container & Individual Toast Component (Clean Claymorphism Light Style)
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function Toast() {
  const { toasts, removeToast } = useNotifications();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto rounded-3xl p-4 bg-white border shadow-clay flex items-start gap-3 relative overflow-hidden ${
              toast.type === 'launch'
                ? 'border-indigo-200'
                : toast.type === 'success'
                ? 'border-emerald-200'
                : toast.type === 'warning'
                ? 'border-amber-200'
                : 'border-slate-200'
            }`}
          >
            <div
              className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                toast.type === 'launch'
                  ? 'bg-indigo-500'
                  : toast.type === 'success'
                  ? 'bg-emerald-500'
                  : toast.type === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-indigo-400'
              }`}
            />

            <div className="flex-shrink-0 mt-0.5 ml-1">
              {toast.type === 'launch' && <Rocket className="w-5 h-5 text-indigo-500 animate-pulse" />}
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-500" />}
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-xs font-bold text-slate-900 font-display">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-medium">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-xl transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
