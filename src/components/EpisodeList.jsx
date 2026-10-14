/**
 * EpisodeList Component for Anime Details view (Clean Claymorphism Style)
 */

import React, { useState } from 'react';
import { Check, Circle, Calendar } from 'lucide-react';
import { addWeeks, parseISO, isValid, setHours, setMinutes, setSeconds, addDays, getDay, isBefore } from 'date-fns';
import { formatLaunchDate } from '../utils/dates';
import { parseTimeString } from '../services/scheduleService';

export default function EpisodeList({
  anime,
  onToggleWatched,
  onMarkUpToEpisode,
}) {
  const [filter, setFilter] = useState('all');

  if (!anime) return null;

  // If totalEpisodes is unknown, show only up to watched count + 1 (the next expected episode)
  const watchedCount = Number(anime.currentEpisode) || 0;
  const total = anime.totalEpisodes
    ? Number(anime.totalEpisodes)
    : Math.max(watchedCount + 1, 1);
  const watchedSet = Array.isArray(anime.watchedEpisodes)
    ? new Set(anime.watchedEpisodes)
    : null;

  const calculateAirDateForEp = (epNum) => {
    if (!anime.startDate) return null;
    const parsedStart = parseISO(anime.startDate);
    if (!isValid(parsedStart)) return null;

    const { hours, minutes } = parseTimeString(anime.releaseTime || '00:00');
    let firstAir = setSeconds(setMinutes(setHours(parsedStart, hours), minutes), 0);

    if (anime.weeklyDay !== undefined && anime.weeklyDay !== null && anime.weeklyDay !== '') {
      const targetDay = Number(anime.weeklyDay);
      const diff = (targetDay - getDay(firstAir) + 7) % 7;
      firstAir = addDays(firstAir, diff);
    }

    const weeksToAdd = epNum - (anime.firstEpisodeNum || 1);
    return addWeeks(firstAir, Math.max(0, weeksToAdd));
  };

  const now = new Date();

  const episodes = [];
  for (let i = 1; i <= total; i++) {
    const isWatched = watchedSet ? watchedSet.has(i) : i <= watchedCount;
    const airDate = calculateAirDateForEp(i);
    const hasAired = airDate ? isBefore(airDate, now) : true;

    episodes.push({
      number: i,
      title: `Episode ${i}`,
      isWatched,
      airDate,
      hasAired,
    });
  }

  const filteredEpisodes = episodes.filter((ep) => {
    if (filter === 'watched') return ep.isWatched;
    if (filter === 'unwatched') return !ep.isWatched;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 p-1 rounded-2xl clay-panel">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'clay-btn-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            All ({total})
          </button>
          <button
            onClick={() => setFilter('watched')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'watched'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            Watched ({watchedCount})
          </button>
          <button
            onClick={() => setFilter('unwatched')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'unwatched'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            Unwatched ({Math.max(0, total - watchedCount)})
          </button>
        </div>

        <span className="text-xs text-slate-400 font-mono font-semibold">
          Showing {filteredEpisodes.length} episodes
        </span>
      </div>

      {/* Episode Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
        {filteredEpisodes.map((ep) => (
          <div
            key={ep.number}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              ep.isWatched
                ? 'bg-slate-50 border-slate-200/60 text-slate-400'
                : 'bg-white clay-card border-white'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <button
                type="button"
                onClick={() => onToggleWatched(anime.id, ep.number, !ep.isWatched)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                  ep.isWatched
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600'
                }`}
                title={ep.isWatched ? 'Mark unwatched' : 'Mark watched'}
              >
                {ep.isWatched ? (
                  <Check className="w-4 h-4 stroke-[3] animate-check-pop" />
                ) : (
                  <Circle className="w-3.5 h-3.5" />
                )}
              </button>

              <div className="min-w-0">
                <h4
                  className={`text-sm font-bold truncate ${
                    ep.isWatched ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                >
                  Episode {ep.number}
                </h4>

                {ep.airDate && (
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5 font-medium">
                    <Calendar className="w-3 h-3" />
                    {formatLaunchDate(ep.airDate, 'MMM d, yyyy • h:mm a')}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!ep.isWatched && onMarkUpToEpisode && (
                <button
                  type="button"
                  onClick={() => onMarkUpToEpisode(anime.id, ep.number)}
                  className="text-[11px] px-2.5 py-1 rounded-xl clay-btn-secondary text-slate-600 font-bold hover:text-indigo-600 transition-colors"
                >
                  Mark up to Ep {ep.number}
                </button>
              )}

              {ep.isWatched && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold">
                  Completed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
