/**
 * Notification Center Drawer Component (Clean Claymorphism Style)
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, X, Rocket, AlertCircle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatLaunchDate } from '../utils/dates';
import { useNavigate } from 'react-router-dom';

export default function NotificationCenter({ isOpen, onClose }) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    permissionStatus,
    requestPermission,
  } = useNotifications();

  const navigate = useNavigate();

  const handleItemClick = (notif) => {
    markAsRead(notif.id);
    if (notif.animeId) {
      onClose();
      navigate(`/anime/${notif.animeId}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-white border-l border-slate-200/80 shadow-2xl flex flex-col"
            >
              {/* Header with Navigator Avatar Icon */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex-shrink-0">
                    <img src="./navigator-avatar.jpg" alt="Navigator" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 font-display text-base flex items-center gap-2">
                      Launch Alerts
                      {unreadCount > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500 text-white font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Real-time episode notices
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <>
                      <button
                        onClick={markAllAsRead}
                        title="Mark all as read"
                        className="p-2 rounded-xl clay-btn-secondary hover:text-indigo-600 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={clearNotifications}
                        title="Clear history"
                        className="p-2 rounded-xl clay-btn-secondary hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl clay-btn-secondary hover:text-slate-900 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Browser Permission Banner */}
              {permissionStatus !== 'granted' && (
                <div className="p-4 mx-4 mt-4 rounded-2xl clay-panel border border-indigo-100 text-xs">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">
                        Enable Desktop Notifications
                      </p>
                      <p className="text-slate-500 mt-0.5 leading-relaxed">
                        Receive launch alerts when episodes air while AniLaunch is open in your browser.
                      </p>
                      <button
                        onClick={requestPermission}
                        className="mt-2.5 px-3 py-1.5 rounded-xl clay-btn-primary text-white font-bold text-xs"
                      >
                        Allow Browser Alerts
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-clay-subtle border border-slate-100 mb-3 bg-white">
                      <img src="./rocket-mascot.jpg" alt="Mascot" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 font-display">
                      No Alerts Yet
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      You will receive notifications here when your tracked anime are about to launch new episodes.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleItemClick(notif)}
                      className={`group p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        !notif.isRead
                          ? 'bg-indigo-50/60 border-indigo-200/80 shadow-sm'
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {!notif.isRead && (
                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      )}

                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 text-indigo-500 flex-shrink-0 mt-0.5">
                          <Rocket className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 pr-3">
                          <h4 className="text-xs font-bold text-slate-900 font-display truncate">
                            {notif.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono mt-2 block">
                            {formatLaunchDate(notif.timestamp, 'MMM d, h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Notice */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-400 text-center font-medium">
                <span>Frontend-only: Alerts run actively while tab remains open.</span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
