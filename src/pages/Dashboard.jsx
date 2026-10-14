/**
 * Dashboard Command Center for AniLaunch (Clean Claymorphism Light Style)
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Film,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Plus,
  Rocket,
  TrendingUp,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { useAnime } from '../context/AnimeContext';
import { calculateNextRelease, getAnimeReleasingThisWeek } from '../services/scheduleService';
import { calculateWatchStats } from '../utils/episodeProgress';
import Countdown from '../components/Countdown';
import AnimeCard from '../components/AnimeCard';
import EmptyState from '../components/EmptyState';
import { formatLaunchDate, getRelativeLaunchLabel } from '../utils/dates';
import { useGsapStagger } from '../hooks/useGsapReveal';

export default function Dashboard({ onOpenAddModal }) {
  const navigate = useNavigate();
  const { animeList, settings, incrementEpisode, loadDemoAnime } = useAnime();

  const totalTracked = animeList.length;
  const completedCount = animeList.filter((a) => a.status === 'completed').length;
  const { totalHours, totalEpisodesWatched } = calculateWatchStats(animeList);

  const releasingThisWeek = getAnimeReleasingThisWeek(animeList);

  const scheduledList = animeList
    .map((anime) => {
      const schedule = calculateNextRelease(anime);
      return { anime, ...schedule };
    })
    .filter((item) => item.nextReleaseDate)
    .sort((a, b) => a.nextReleaseDate.getTime() - b.nextReleaseDate.getTime());

  const nextLaunch = scheduledList[0] || null;

  const recentlyUpdated = [...animeList]
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 4);

  const releasingGridRef = useGsapStagger([releasingThisWeek.length], {
    duration: 0.45,
    stagger: 0.05,
    y: 15,
  });

  const recentListRef = useGsapStagger([recentlyUpdated.length], {
    duration: 0.45,
    stagger: 0.05,
    y: 15,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDateFormatted = formatLaunchDate(new Date(), 'EEEE, MMMM d, yyyy');

  if (totalTracked === 0) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-clay border border-white">
              <img src="./pilot-avatar.jpg" alt="Pilot Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
                {getGreeting()}, {settings.displayName || 'Pilot'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {currentDateFormatted} • Local Command Deck
              </p>
            </div>
          </div>
        </div>

        <EmptyState
          title="Welcome to AniLaunch Command Center"
          description="Your personal anime release hub is ready. Start by adding an airing anime to track upcoming episodes, upload custom artwork, and monitor live countdowns."
          onAddAnime={onOpenAddModal}
          onLoadDemo={loadDemoAnime}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* ---------------------------------------------------- */}
      {/* TOP HEADER: GREETING WITH ANIME CHARACTER AVATAR     */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl overflow-hidden shadow-clay border-2 border-white flex-shrink-0 bg-white">
            <img src="./pilot-avatar.jpg" alt="Pilot Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-mono flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Orbital Station Online
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
              {getGreeting()}, {settings.displayName || 'Pilot'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {currentDateFormatted} • {settings.timezone || 'UTC'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/calendar"
            className="px-4 py-2.5 rounded-2xl clay-btn-secondary text-slate-700 text-xs font-bold flex items-center gap-2"
          >
            <CalendarIcon className="w-4 h-4 text-indigo-500" />
            <span>Launch Calendar</span>
          </Link>
          <button
            onClick={onOpenAddModal}
            className="px-5 py-2.5 rounded-2xl clay-btn-primary text-white text-xs font-bold flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Anime</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* CLAY METRICS GRID                                    */}
      {/* ---------------------------------------------------- */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {[
          {
            icon: <Film className="w-6 h-6" />,
            value: totalTracked,
            label: 'Tracked Anime',
            bg: 'bg-indigo-50',
            border: 'border-indigo-100',
            text: 'text-indigo-600',
          },
          {
            icon: <Rocket className="w-6 h-6" />,
            value: releasingThisWeek.length,
            label: 'Releasing This Week',
            bg: 'bg-sky-50',
            border: 'border-sky-100',
            text: 'text-sky-600',
          },
          {
            icon: <TrendingUp className="w-6 h-6" />,
            value: totalEpisodesWatched,
            label: `Episodes (${totalHours}h)`,
            bg: 'bg-purple-50',
            border: 'border-purple-100',
            text: 'text-purple-600',
          },
          {
            icon: <CheckCircle2 className="w-6 h-6" />,
            value: completedCount,
            label: 'Completed Series',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            text: 'text-emerald-600',
          },
        ].map((metric) => (
          <motion.div
            key={metric.label}
            className="p-5 rounded-3xl clay-card flex items-center gap-4"
            variants={{
              hidden: { opacity: 0, y: 24, scale: 0.96 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
            }}
          >
            <div className={`w-12 h-12 rounded-2xl ${metric.bg} border ${metric.border} flex items-center justify-center ${metric.text} flex-shrink-0 shadow-sm`}>
              {metric.icon}
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
                {metric.value}
              </span>
              <span className="text-xs text-slate-500 block font-semibold">
                {metric.label}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ---------------------------------------------------- */}
      {/* SPOTLIGHT HERO: NEXT UPCOMING LAUNCH                 */}
      {/* ---------------------------------------------------- */}
      {nextLaunch && (
        <div className="relative rounded-3xl clay-card p-6 sm:p-8 overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mb-3 border border-indigo-100 shadow-sm">
                <Rocket className="w-3.5 h-3.5 animate-pulse" />
                <span>Next Orbital Departure</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
                {nextLaunch.anime.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 mt-2 flex items-center gap-2 flex-wrap font-medium">
                <span className="font-bold text-slate-700">Episode {nextLaunch.nextEpisodeNumber || 1}</span>
                <span>•</span>
                <span>Scheduled: {getRelativeLaunchLabel(nextLaunch.nextReleaseDate)}</span>
                {nextLaunch.anime.genres && nextLaunch.anime.genres.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{nextLaunch.anime.genres.slice(0, 3).join(', ')}</span>
                  </>
                )}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to={`/anime/${nextLaunch.anime.id}`}
                  className="px-5 py-2.5 rounded-2xl clay-btn-primary text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Inspect Flight Deck</span>
                </Link>

                <button
                  onClick={() => incrementEpisode(nextLaunch.anime.id)}
                  className="px-4 py-2.5 rounded-2xl clay-btn-secondary text-slate-700 text-xs font-bold"
                >
                  +1 Watched Episode
                </button>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="p-5 sm:p-6 rounded-3xl clay-panel border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 block">
                T-Minus Countdown
              </span>
              <Countdown targetDate={nextLaunch.nextReleaseDate} />
              <span className="text-[10px] text-indigo-500 font-mono font-bold mt-3">
                Synchronized with system clock
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* RELEASING THIS WEEK SECTION                          */}
      {/* ---------------------------------------------------- */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-sm">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900">
              Launching This Week
            </h3>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-200/60 text-slate-700">
              {releasingThisWeek.length}
            </span>
          </div>

          <Link
            to="/calendar"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>Full Calendar</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {releasingThisWeek.length === 0 ? (
          <div className="p-8 rounded-3xl clay-panel text-center">
            <p className="text-sm text-slate-500 font-medium">
              No anime scheduled to release in the remainder of this calendar week.
            </p>
          </div>
        ) : (
          <div ref={releasingGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {releasingThisWeek.slice(0, 4).map((anime) => (
              <AnimeCard key={anime.id} anime={anime} onIncrementEpisode={incrementEpisode} />
            ))}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* RECENTLY UPDATED WATCHLIST FEED                      */}
      {/* ---------------------------------------------------- */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
              <Film className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900">
              Recently Updated Watchlist
            </h3>
          </div>

          <Link
            to="/anime"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>View All ({totalTracked})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div ref={recentListRef} className="space-y-3">
          {recentlyUpdated.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              viewMode="compact"
              onIncrementEpisode={incrementEpisode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
