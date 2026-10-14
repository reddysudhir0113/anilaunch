/**
 * Completed Anime Archive for AniLaunch (Clean Claymorphism Light Style)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Film,
  Clock,
  Trophy,
} from 'lucide-react';
import { useAnime } from '../context/AnimeContext';
import AnimeCard from '../components/AnimeCard';
import { calculateWatchStats } from '../utils/episodeProgress';
import { useGsapStagger } from '../hooks/useGsapReveal';

export default function Completed({ onEditAnime, onDeleteAnime }) {
  const { animeList, updateAnime, triggerCelebration } = useAnime();

  const completedList = animeList.filter((a) => a.status === 'completed');
  const { totalHours, totalEpisodesWatched } = calculateWatchStats(completedList);

  const completedGridRef = useGsapStagger([completedList.length], {
    duration: 0.45,
    stagger: 0.05,
    y: 16,
  });

  const handleReactivate = (animeId) => {
    updateAnime(animeId, { status: 'airing' });
  };

  const handleRewatch = (animeId) => {
    updateAnime(animeId, {
      currentEpisode: 0,
      watchedEpisodes: [],
      status: 'airing',
    });
  };

  if (completedList.length === 0) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 flex items-center gap-2.5">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            Completed Fleet Missions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Archive of finished anime series and completed seasons.
          </p>
        </div>

        <div className="p-12 text-center rounded-3xl clay-card space-y-4 max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-display">
            No Completed Missions Yet
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            When you finish all episodes of a series, it will automatically land here with celebration honors.
          </p>
          <Link
            to="/anime"
            className="inline-block px-6 py-3 rounded-2xl clay-btn-primary text-white text-xs font-bold shadow-md mt-4"
          >
            Explore Active Watchlist
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 flex items-center gap-2.5">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            Completed Fleet Missions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Archive of fully watched anime series and concluded seasons.
          </p>
        </div>

        <button
          onClick={triggerCelebration}
          className="px-5 py-2.5 rounded-2xl clay-btn-secondary text-indigo-600 text-xs font-bold flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Celebrate Milestones</span>
        </button>
      </div>

      {/* Completion Trophy Summary Banner */}
      <div className="p-6 rounded-3xl clay-card grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <span className="text-2xl font-extrabold font-display text-slate-900">
              {completedList.length} Series
            </span>
            <span className="text-xs text-slate-500 block font-semibold">
              Successfully Concluded
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Film className="w-7 h-7" />
          </div>
          <div>
            <span className="text-2xl font-extrabold font-display text-slate-900">
              {totalEpisodesWatched} Episodes
            </span>
            <span className="text-xs text-slate-500 block font-semibold">
              Total Watched Episodes
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-2xl font-extrabold font-display text-slate-900">
              {totalHours} Hours
            </span>
            <span className="text-xs text-slate-500 block font-semibold">
              Screen Time Logged
            </span>
          </div>
        </div>
      </div>

      {/* Completed Anime Grid */}
      <div ref={completedGridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {completedList.map((anime) => (
          <div key={anime.id} className="relative group flex flex-col">
            <AnimeCard
              anime={anime}
              onEdit={onEditAnime}
              onDelete={onDeleteAnime}
            />

            <div className="mt-2.5 flex items-center justify-between px-2 text-xs">
              <button
                onClick={() => handleRewatch(anime.id)}
                className="text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1 transition-colors"
                title="Reset watch progress and move back to active"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                <span>Re-watch</span>
              </button>
              <button
                onClick={() => handleReactivate(anime.id)}
                className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
              >
                Reactivate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
