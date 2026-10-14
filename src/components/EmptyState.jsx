/**
 * Empty State Component with 3D Anime Mascot Character (Clean Claymorphism Style)
 */

import React from 'react';
import { Plus, Sparkles } from 'lucide-react';

export default function EmptyState({
  title = 'No Anime Detected in Your Orbit',
  description = 'Your launchpad is awaiting its first mission. Track upcoming episodes, upload custom artwork, and monitor live countdowns.',
  onAddAnime,
  onLoadDemo,
}) {
  return (
    <div className="relative rounded-3xl clay-card p-8 sm:p-12 text-center max-w-xl mx-auto my-8">
      {/* 3D Clay Anime Rocket Mascot */}
      <div className="relative mx-auto mb-6 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shadow-clay border-2 border-white bg-slate-50 animate-float">
        <img
          src="./rocket-mascot.jpg"
          alt="AniLaunch Anime Companion Mascot"
          className="w-full h-full object-cover"
        />
      </div>

      <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed font-normal">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onAddAnime && (
          <button
            onClick={onAddAnime}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl clay-btn-primary text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add First Anime
          </button>
        )}
        {onLoadDemo && (
          <button
            onClick={onLoadDemo}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl clay-btn-secondary text-slate-700 font-bold text-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Load Curated Starter Anime
          </button>
        )}
      </div>
    </div>
  );
}
