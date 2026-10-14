/**
 * Mobile Bottom Navigation Bar (Clean Claymorphism Style)
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Film, Clock, Calendar, CheckCircle2, Settings } from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: Compass },
  { to: '/anime', label: 'Watchlist', icon: Film },
  { to: '/upcoming', label: 'Upcoming', icon: Clock },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/completed', label: 'Done', icon: CheckCircle2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function MobileNav() {
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-2 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-2xl text-[10px] font-bold transition-all ${
                  isActive
                    ? 'clay-btn-primary text-white shadow-sm'
                    : 'text-slate-500 hover:text-indigo-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
