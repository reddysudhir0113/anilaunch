/**
 * Confirm Dialog Modal for AniLaunch (Clean Claymorphism Light Style)
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md rounded-3xl bg-white p-6 border border-slate-200/80 shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-2xl flex-shrink-0 ${
                  variant === 'danger'
                    ? 'bg-rose-50 text-rose-500 border border-rose-200'
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                }`}
              >
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed font-medium">
                  {message}
                </p>
              </div>

              <button
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-xl transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-2xl clay-btn-secondary text-slate-600 font-bold text-xs"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md ${
                  variant === 'danger'
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200'
                    : 'clay-btn-primary text-white'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
