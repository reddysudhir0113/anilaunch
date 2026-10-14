/**
 * Desktop Sidebar Navigation for AniLaunch (Clean Claymorphism Style)
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  Film,
  Calendar,
  Clock,
  CheckCircle2,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useAnime } from '../context/AnimeContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: Compass },
  { to: '/anime', label: 'My Anime', icon: Film },
  { to: '/upcoming', label: 'Upcoming', icon: Clock },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/completed', label: 'Completed', icon: CheckCircle2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { animeList } = useAnime();

  const totalTracked = animeList.length;
  const completedCount = animeList.filter((a) => a.status === 'completed').length;
  const activeCount = animeList.filter((a) => a.status === 'airing').length;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 h-screen sticky top-0 z-30 select-none shadow-sm">
      {/* Brand Header with 3D Anime Rocket Mascot */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-clay-subtle flex-shrink-0 border border-indigo-100 bg-white">
          <img
            src="./rocket-mascot.jpg"
            alt="AniLaunch Mascot"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <span className="font-display font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
            ANILAUNCH
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
              PRO
            </span>
          </span>
          <p className="text-[11px] text-slate-400 font-medium">
            Anime Launch Command
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <span className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
          Station Navigation
        </span>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all group ${
                  isActive
                    ? 'clay-btn-primary text-white shadow-md'
                    : 'clay-btn-secondary text-slate-600 hover:text-indigo-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.label === 'My Anime' && totalTracked > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {totalTracked}
                    </span>
                  )}
                  {item.label === 'Completed' && completedCount > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      {completedCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Station Operator Card featuring 3D Navigator Anime Girl Icon */}
      <div className="p-4 m-3 rounded-3xl clay-panel border border-slate-100">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 flex-shrink-0 animate-float">
            <img src="./navigator-avatar.jpg" alt="Mission Navigator" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-800 block truncate font-display">
              Navigator Luna
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Orbit Active
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">
          {activeCount} anime currently airing in your orbital queue.
        </p>
      </div>
    </aside>
  );
}
