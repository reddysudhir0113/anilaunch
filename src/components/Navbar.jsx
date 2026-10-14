/**
 * Global Top Navbar for AniLaunch (Clean Claymorphism Style)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  Plus,
  Rocket,
  Clock,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function Navbar({ onOpenAddModal, onToggleNotificationCenter }) {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/anime?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isLandingPage = location.pathname === '/';

  return (
    <header className="sticky top-0 z-20 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-sm">
      {/* Mobile Logo & Desktop Home link */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl overflow-hidden shadow-clay-subtle flex-shrink-0 border border-indigo-100 bg-white">
            <img
              src="./rocket-mascot.jpg"
              alt="AniLaunch Mascot"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-display font-extrabold text-base text-slate-900 tracking-tight">
            ANILAUNCH
          </span>
        </Link>

        {!isLandingPage && (
          <Link
            to="/"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors ml-4 px-3 py-1.5 rounded-xl clay-btn-secondary"
          >
            <Rocket className="w-3.5 h-3.5 text-indigo-500" />
            <span>Launch Sequence</span>
          </Link>
        )}
      </div>

      {/* Center Search Input with Clay Inset Style */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search anime across title, genres, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl pl-9 pr-4 py-2 text-xs clay-input"
          />
        </div>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live Local Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-mono font-semibold text-slate-600 border border-slate-200/60 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>{currentTimeStr || '00:00:00'}</span>
        </div>

        {/* Notification Bell Button */}
        <button
          onClick={onToggleNotificationCenter}
          className="relative p-2.5 rounded-2xl clay-btn-secondary hover:text-indigo-600 transition-colors"
          aria-label="Open Launch Alerts"
          title="Launch Alerts"
        >
          <Bell className="w-4 h-4 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-md animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Character Avatar Pill */}
        <div className="hidden sm:flex items-center gap-2 p-1 pl-2 rounded-2xl clay-btn-secondary">
          <span className="text-xs font-bold text-slate-700">Pilot</span>
          <div className="w-7 h-7 rounded-xl overflow-hidden shadow-sm border border-indigo-100">
            <img src="./pilot-avatar.jpg" alt="User Character" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Add Anime CTA */}
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl clay-btn-primary text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Anime</span>
        </button>
      </div>
    </header>
  );
}
