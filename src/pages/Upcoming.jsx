/**
 * Upcoming Episodes Release Feed & AniList Live Broadcast Discovery for AniLaunch
 * Connects directly to the public AniList GraphQL API to show upcoming/airing anime
 * worldwide with automatic broadcast day/time, release year, countdowns, and cover artwork.
 * Allows users to selectively add any anime to their personal watchlist with a single click.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  ArrowRight,
  Plus,
  Search,
  Check,
  Sparkles,
  RefreshCw,
  Eye,
  X,
  Radio,
  Tv,
  Film,
  Info,
} from 'lucide-react';
import { useAnime } from '../context/AnimeContext';
import { useNotifications } from '../context/NotificationContext';
import { calculateNextRelease, DAY_NAMES } from '../services/scheduleService';
import { fetchAniListUpcoming } from '../services/anilistService';
import Countdown from '../components/Countdown';
import EmptyState from '../components/EmptyState';
import { formatLaunchDate } from '../utils/dates';
import { isToday, isTomorrow, isThisWeek } from 'date-fns';
import { useGsapStagger } from '../hooks/useGsapReveal';

export default function Upcoming({ onOpenAddModal }) {
  const { animeList, addAnime, incrementEpisode, triggerCelebration } = useAnime();
  const { addToast } = useNotifications();

  // Navigation tab: 'anilist' (Live AniList API Explorer) | 'tracked' (User's Tracked Schedule)
  const [activeTab, setActiveTab] = useState('anilist');

  // AniList Explorer State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'airing' | 'upcoming'
  const [anilistItems, setAnilistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveApi, setIsLiveApi] = useState(true);
  const [selectedAnime, setSelectedAnime] = useState(null); // for synopsis inspect modal

  // Debounced AniList search & fetch
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      const result = await fetchAniListUpcoming({
        search: searchQuery,
        filterMode,
        perPage: 24,
      });

      if (!isCancelled) {
        setAnilistItems(result.animeList);
        setIsLiveApi(result.isLive);
        setIsLoading(false);
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, filterMode]);

  // Handle adding an anime directly from AniList into personal watchlist
  const handleAddFromAniList = (item) => {
    // Check if already tracked
    const alreadyExists = animeList.some(
      (a) => a.aniListId === item.aniListId || a.title.toLowerCase() === item.title.toLowerCase()
    );

    if (alreadyExists) {
      addToast({
        title: 'Already in Watchlist',
        message: `${item.title} is already being tracked in your orbit.`,
        type: 'info',
      });
      return;
    }

    addAnime({
      aniListId: item.aniListId,
      title: item.title,
      altTitle: item.altTitle,
      posterUrl: item.posterUrl,
      bannerUrl: item.bannerUrl,
      status: item.status,
      totalEpisodes: item.totalEpisodes,
      currentEpisode: 0,
      weeklyDay: item.weeklyDay,
      releaseTime: item.releaseTime,
      startDate: item.startDate,
      endDate: item.endDate,
      seasonYear: item.seasonYear,
      season: item.season,
      genres: item.genres,
      description: item.description,
      episodeDuration: item.episodeDuration,
    });

    triggerCelebration();

    addToast({
      title: 'Added to Watchlist!',
      message: `${item.title} is now tracked with automatic launch timings (${
        item.weeklyDay !== null ? DAY_NAMES[Number(item.weeklyDay)] : 'Weekly'
      } at ${item.releaseTime}).`,
      type: 'success',
    });
  };

  // Check if a specific AniList item is in the user's watchlist
  const isTracked = (item) => {
    return animeList.some(
      (a) => a.aniListId === item.aniListId || a.title?.toLowerCase() === item.title?.toLowerCase()
    );
  };

  // Group user's tracked anime by release time
  const upcomingTrackedGrouped = useMemo(() => {
    const list = animeList
      .map((anime) => {
        const schedule = calculateNextRelease(anime);
        return { anime, ...schedule };
      })
      .filter((item) => item.nextReleaseDate && !item.isFinished)
      .sort((a, b) => a.nextReleaseDate.getTime() - b.nextReleaseDate.getTime());

    const groups = {
      today: [],
      tomorrow: [],
      thisWeek: [],
      future: [],
    };

    list.forEach((item) => {
      const date = item.nextReleaseDate;
      if (isToday(date)) {
        groups.today.push(item);
      } else if (isTomorrow(date)) {
        groups.tomorrow.push(item);
      } else if (isThisWeek(date, { weekStartsOn: 0 })) {
        groups.thisWeek.push(item);
      } else {
        groups.future.push(item);
      }
    });

    return { list, groups };
  }, [animeList]);

  // GSAP Ref for smooth container card reveals
  const cardsContainerRef = useGsapStagger([anilistItems, activeTab, filterMode], {
    duration: 0.45,
    stagger: 0.04,
    y: 16,
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* ──────────────────────────────────────────────── */}
      {/* HEADER WITH VIEW MODE TABS                        */}
      {/* ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1">
              <Radio className="w-3 h-3 text-indigo-500 animate-pulse" />
              PUBLIC ANILIST FEED
            </span>
            {isLiveApi ? (
              <span className="text-[10px] font-mono font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Broadcast Sync
              </span>
            ) : (
              <span className="text-[10px] font-mono font-semibold text-amber-600">
                Offline Mode Cached
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-indigo-600" />
            Upcoming Launch Trajectories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Explore live anime airing worldwide. Add selected anime to your command center with automatic timings, years, and posters.
          </p>
        </div>

        {/* View Switcher Tabs (AniList Discover vs My Tracked) */}
        <div className="flex items-center p-1.5 rounded-2xl clay-panel self-start md:self-auto border border-white">
          <button
            onClick={() => setActiveTab('anilist')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'anilist'
                ? 'clay-btn-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>AniList Airing Feed</span>
          </button>
          <button
            onClick={() => setActiveTab('tracked')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tracked'
                ? 'clay-btn-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>My Tracked ({upcomingTrackedGrouped.list.length})</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────── */}
      {/* TAB 1: ANILIST PUBLIC API AIRING FEED            */}
      {/* ──────────────────────────────────────────────── */}
      {activeTab === 'anilist' && (
        <div className="space-y-6">
          {/* Search & Filter Toolbar */}
          <div className="p-4 sm:p-5 rounded-3xl clay-panel space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search upcoming anime on AniList..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl pl-9 pr-9 py-2.5 text-xs clay-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl clay-panel">
                {[
                  { id: 'all', label: 'All Upcoming & Airing' },
                  { id: 'airing', label: 'Currently Airing' },
                  { id: 'upcoming', label: 'Upcoming Premieres' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterMode(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      filterMode === f.id
                        ? 'clay-btn-primary text-white shadow-sm'
                        : 'text-slate-600 hover:text-indigo-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2 border-t border-slate-100">
              <span>
                Showing {anilistItems.length} anime releases from AniList database
              </span>
              <span className="text-[11px] font-mono text-indigo-500">
                Click "+ Track Anime" to auto-import release timings & poster
              </span>
            </div>
          </div>

          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl clay-card p-4 space-y-3 animate-pulse bg-white"
                >
                  <div className="aspect-[2/3] rounded-2xl bg-slate-100" />
                  <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
                  <div className="h-8 bg-slate-100 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : anilistItems.length === 0 ? (
            <div className="p-12 text-center rounded-3xl clay-panel space-y-3">
              <p className="text-sm font-bold text-slate-800">
                No matching anime found on AniList.
              </p>
              <p className="text-xs text-slate-500">
                Try searching with a different title or resetting filter options.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterMode('all');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold clay-btn-secondary text-indigo-600"
              >
                Reset Search
              </button>
            </div>
          ) : (
            /* AniList Anime Grid */
            <div
              ref={cardsContainerRef}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {anilistItems.map((anime) => {
                const added = isTracked(anime);
                const dayName =
                  anime.weeklyDay !== null && anime.weeklyDay !== undefined
                    ? DAY_NAMES[Number(anime.weeklyDay)]
                    : null;

                return (
                  <div
                    key={anime.aniListId}
                    className="group rounded-3xl clay-card flex flex-col overflow-hidden bg-white"
                  >
                    {/* Poster with overlays */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-100">
                      {anime.posterUrl ? (
                        <img
                          src={anime.posterUrl}
                          alt={anime.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                          <Film className="w-8 h-8 text-indigo-400 mb-2" />
                          <span className="text-xs text-slate-500 font-bold">{anime.title}</span>
                        </div>
                      )}

                      {/* Status Badges Overlay */}
                      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
                        {anime.status === 'airing' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-600 border border-sky-200/80 shadow-sm flex items-center gap-1.5 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                            Airing
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-200/80 shadow-sm backdrop-blur-md">
                            Upcoming
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/95 text-slate-700 shadow-sm backdrop-blur-md">
                          {anime.seasonYear || '2025'}
                        </span>
                      </div>

                      {/* Quick Synopsis Inspect Button */}
                      <button
                        onClick={() => setSelectedAnime(anime)}
                        className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 text-slate-700 hover:text-indigo-600 shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20 cursor-pointer"
                        title="Inspect Synopsis"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Live Ticking Countdown Overlay */}
                      {anime.nextReleaseDate && (
                        <div className="absolute bottom-2.5 inset-x-2.5 z-10">
                          <div className="px-2.5 py-1 rounded-xl bg-white/95 border border-white/80 shadow-sm backdrop-blur-md flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Ep {anime.nextEpisodeNumber || 1}:
                            </span>
                            <Countdown
                              targetDate={anime.nextReleaseDate}
                              compact={true}
                              showIcon={false}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Content & Action Button */}
                    <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                      <div>
                        {/* Broadcast schedule info */}
                        <div className="text-[11px] text-slate-400 font-medium mb-1 flex items-center justify-between">
                          <span>
                            {dayName ? `Every ${dayName}` : 'Schedule'} • {anime.releaseTime || 'TBA'}
                          </span>
                          {anime.totalEpisodes && (
                            <span className="font-mono">{anime.totalEpisodes} eps</span>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-900 font-display text-sm leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {anime.title}
                        </h3>

                        {anime.altTitle && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {anime.altTitle}
                          </p>
                        )}

                        {/* Genres */}
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {(anime.genres || []).slice(0, 2).map((g) => (
                            <span
                              key={g}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600"
                            >
                              {g}
                            </span>
                          ))}
                          {anime.studio && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-indigo-50 text-indigo-600">
                              {anime.studio}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add to Watchlist Button */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        {added ? (
                          <div className="w-full py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
                            <Check className="w-3.5 h-3.5" />
                            <span>Tracked in Orbit</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddFromAniList(anime)}
                            className="w-full py-2 px-3 rounded-xl clay-btn-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Track Anime</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────── */}
      {/* TAB 2: USER'S PERSONAL TRACKED SCHEDULE          */}
      {/* ──────────────────────────────────────────────── */}
      {activeTab === 'tracked' && (
        <div className="space-y-8">
          {upcomingTrackedGrouped.list.length === 0 ? (
            <EmptyState
              title="No Upcoming Releases in Your Watchlist"
              description="You have not added any upcoming or airing anime to your command center yet. Browse the AniList feed to pick and track upcoming shows."
              onAddAnime={() => setActiveTab('anilist')}
              onLoadDemo={onOpenAddModal}
            />
          ) : (
            <div className="space-y-10">
              <TrackedGroup
                title="Today's Releases"
                items={upcomingTrackedGrouped.groups.today}
                dotColor="bg-sky-500"
                onIncrement={incrementEpisode}
              />
              <TrackedGroup
                title="Tomorrow"
                items={upcomingTrackedGrouped.groups.tomorrow}
                dotColor="bg-indigo-500"
                onIncrement={incrementEpisode}
              />
              <TrackedGroup
                title="Later This Week"
                items={upcomingTrackedGrouped.groups.thisWeek}
                dotColor="bg-purple-500"
                onIncrement={incrementEpisode}
              />
              <TrackedGroup
                title="Future Launch Missions"
                items={upcomingTrackedGrouped.groups.future}
                dotColor="bg-slate-400"
                onIncrement={incrementEpisode}
              />
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────── */}
      {/* ANIME SYNOPSIS INSPECT MODAL                     */}
      {/* ──────────────────────────────────────────────── */}
      {selectedAnime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl clay-card bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedAnime(null)}
              className="absolute top-4 right-4 p-2 rounded-xl clay-btn-secondary text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4 pr-8">
              <div className="w-20 h-28 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm">
                <img
                  src={selectedAnime.posterUrl}
                  alt={selectedAnime.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                  {selectedAnime.seasonYear} • {selectedAnime.status.toUpperCase()}
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 font-display">
                  {selectedAnime.title}
                </h3>
                {selectedAnime.altTitle && (
                  <p className="text-xs text-slate-400 mt-0.5">{selectedAnime.altTitle}</p>
                )}
                <div className="text-xs text-slate-500 font-medium mt-1">
                  Broadcast:{' '}
                  <strong className="text-slate-800">
                    {selectedAnime.weeklyDay !== null ? DAY_NAMES[Number(selectedAnime.weeklyDay)] : 'Weekly'} at {selectedAnime.releaseTime}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {selectedAnime.genres.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600"
                >
                  {g}
                </span>
              ))}
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 font-display block">
                Storyline Synopsis:
              </span>
              <p className="text-xs text-slate-600 leading-relaxed max-h-48 overflow-y-auto font-normal">
                {selectedAnime.description || 'No detailed synopsis provided.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedAnime(null)}
                className="px-4 py-2 rounded-xl clay-btn-secondary text-xs font-bold text-slate-600 cursor-pointer"
              >
                Close
              </button>

              {isTracked(selectedAnime) ? (
                <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <Check className="w-3.5 h-3.5" />
                  <span>Already in Watchlist</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleAddFromAniList(selectedAnime);
                    setSelectedAnime(null);
                  }}
                  className="px-5 py-2 rounded-xl clay-btn-primary text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to My Watchlist</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Subcomponent for user's personal tracked groups
 */
function TrackedGroup({ title, items, dotColor, onIncrement }) {
  const groupRef = useGsapStagger([items.length], { duration: 0.45, stagger: 0.05, y: 16 });

  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <span className={`w-3 h-3 rounded-full ${dotColor} shadow-sm animate-pulse`} />
        <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900">
          {title}
        </h2>
        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
          {items.length}
        </span>
      </div>

      <div ref={groupRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.anime.id}
            className="p-5 rounded-3xl clay-card flex flex-col justify-between gap-4 bg-white"
          >
            <div className="flex items-start gap-4">
              <Link
                to={`/anime/${item.anime.id}`}
                className="w-16 h-22 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 flex-shrink-0 relative group shadow-sm"
              >
                {item.anime.posterUrl ? (
                  <img
                    src={item.anime.posterUrl}
                    alt={item.anime.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    No Poster
                  </div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block font-mono">
                  Episode {item.nextEpisodeNumber || '?'}
                </span>
                <Link
                  to={`/anime/${item.anime.id}`}
                  className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-base font-display truncate block mt-0.5"
                >
                  {item.anime.title}
                </Link>

                <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatLaunchDate(item.nextReleaseDate, 'EEEE, MMM d • h:mm a')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Countdown targetDate={item.nextReleaseDate} />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onIncrement(item.anime.id)}
                  className="px-3 py-1.5 rounded-xl clay-btn-primary text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                  <span>Watched</span>
                </button>
                <Link
                  to={`/anime/${item.anime.id}`}
                  className="p-2 rounded-xl clay-btn-secondary text-slate-500 hover:text-slate-900"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
