/**
 * Anime Details & Flight Deck View for AniLaunch (Clean Claymorphism Light Style)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2,
  Plus,
  Minus,
  Film,
  Sparkles,
} from 'lucide-react';
import { useAnime } from '../context/AnimeContext';
import { calculateNextRelease, DAY_NAMES } from '../services/scheduleService';
import { calculateProgressPercentage } from '../utils/episodeProgress';
import { formatLaunchDate, getRelativeLaunchLabel } from '../utils/dates';
import { getImageUrlByKey } from '../services/indexedDB';
import Countdown from '../components/Countdown';
import EpisodeList from '../components/EpisodeList';
import { useGsapFadeIn } from '../hooks/useGsapReveal';

export default function AnimeDetails({ onEditAnime, onDeleteAnime }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { animeList, updateAnime, markEpisodeWatched, incrementEpisode } = useAnime();

  const anime = animeList.find((a) => a.id === id);

  const [posterUrl, setPosterUrl] = useState(null);
  const [bannerUrl, setBannerUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (anime?.posterKey) {
      getImageUrlByKey(anime.posterKey).then((url) => {
        if (isMounted && url) setPosterUrl(url);
      });
    } else if (anime?.posterUrl) {
      setPosterUrl(anime.posterUrl);
    }

    if (anime?.bannerKey) {
      getImageUrlByKey(anime.bannerKey).then((url) => {
        if (isMounted && url) setBannerUrl(url);
      });
    } else if (anime?.bannerUrl) {
      setBannerUrl(anime.bannerUrl);
    }

    return () => {
      isMounted = false;
    };
  }, [anime]);

  const posterRef = useGsapFadeIn({ duration: 0.5, y: 20 });
  const contentRef = useGsapFadeIn({ duration: 0.55, y: 15, delay: 0.08 });

  if (!anime) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 font-display">
          Anime Mission Not Found
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          This anime record may have been removed or migrated.
        </p>
        <Link
          to="/anime"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl clay-btn-primary text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Watchlist
        </Link>
      </div>
    );
  }

  const schedule = calculateNextRelease(anime);
  const progressPct = calculateProgressPercentage(anime.currentEpisode, anime.totalEpisodes);
  const currentEp = Number(anime.currentEpisode) || 0;
  const totalEp = anime.totalEpisodes ? Number(anime.totalEpisodes) : null;
  const isFinished = anime.status === 'completed';

  const weeklyDayName =
    anime.weeklyDay !== undefined && anime.weeklyDay !== null && anime.weeklyDay !== ''
      ? DAY_NAMES[Number(anime.weeklyDay)]
      : null;

  const handleDecrementEpisode = () => {
    if (currentEp > 0) {
      // Unmark the current episode so watchedEpisodes stays in sync
      markEpisodeWatched(anime.id, currentEp, false);
    }
  };

  const handleIncrementEpisode = () => {
    if (!totalEp || currentEp < totalEp) {
      incrementEpisode(anime.id);
    }
  };

  const handleMarkUpTo = (animeId, upToEp) => {
    const list = [];
    for (let i = 1; i <= upToEp; i++) {
      list.push(i);
    }
    updateAnime(animeId, {
      watchedEpisodes: list,
      currentEpisode: upToEp,
    });
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Banner Header with Soft Gradient Scrim */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-200 border-b border-slate-200">
        {bannerUrl || posterUrl ? (
          <img
            src={bannerUrl || posterUrl}
            alt={anime.title}
            className="w-full h-full object-cover object-center filter blur-[1px] brightness-90 scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-100 via-sky-50 to-indigo-100 flex items-center justify-center">
            <Film className="w-16 h-16 text-slate-300" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#F0F4FA] via-white/30 to-transparent" />

        {/* Top Navigation */}
        <div className="absolute top-6 inset-x-6 flex items-center justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-md text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditAnime(anime)}
              className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-md text-slate-600 hover:text-indigo-600 transition-colors"
              title="Edit anime"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteAnime(anime.id)}
              className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-md text-slate-600 hover:text-rose-500 transition-colors"
              title="Delete anime"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Anime Profile Details & Poster Card Overlap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-28 sm:-mt-36 relative z-10">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Left: Floating Clay Poster Card */}
          <div ref={posterRef} className="w-44 sm:w-56 md:w-64 rounded-3xl overflow-hidden clay-card flex-shrink-0 aspect-[2/3] bg-white p-2">
            <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-100">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={anime.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                  <Film className="w-10 h-10 text-indigo-500 mb-2" />
                  <span className="text-xs font-bold text-slate-800">{anime.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Title, Status, and Synopsis */}
          <div ref={contentRef} className="flex-1 min-w-0 pt-2 md:pt-14 space-y-4">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-600 border border-sky-200">
                {anime.status || 'Airing'}
              </span>

              {weeklyDayName && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-700 shadow-sm border border-slate-200">
                  Every {weeklyDayName} at {anime.releaseTime || '00:00'}
                </span>
              )}

              {anime.startDate && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-700 shadow-sm border border-slate-200 font-mono">
                  {formatLaunchDate(anime.startDate, 'MMM d, yyyy')}
                  {anime.endDate ? ` → ${formatLaunchDate(anime.endDate, 'MMM d, yyyy')}` : ''}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-slate-900">
              {anime.title}
            </h1>

            {anime.altTitle && (
              <p className="text-sm text-slate-500 font-medium">
                {anime.altTitle}
              </p>
            )}

            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {anime.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-xl text-xs font-bold clay-panel text-slate-600"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {anime.description && (
              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl pt-2 font-normal">
                {anime.description}
              </p>
            )}

            {!isFinished && schedule.nextReleaseDate && (
              <div className="p-4 rounded-3xl clay-panel max-w-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 border border-white">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                    Next Episode Launch
                  </span>
                  <span className="text-xs text-slate-800 font-bold">
                    Episode {schedule.nextEpisodeNumber || currentEp + 1} • {getRelativeLaunchLabel(schedule.nextReleaseDate)}
                  </span>
                </div>
                <Countdown targetDate={schedule.nextReleaseDate} />
              </div>
            )}
          </div>
        </div>

        {/* Watch Progress & Controls Deck */}
        <div className="mt-10 p-6 rounded-3xl clay-card grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Mission Progress</span>
              <span className="text-indigo-600 font-mono">
                {progressPct}% Completed
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden clay-inset">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 font-mono font-medium block">
              Watched {currentEp} of {totalEp || '?'} episodes
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleDecrementEpisode}
              disabled={currentEp <= 0}
              className="p-3 rounded-2xl clay-btn-secondary text-slate-700 disabled:opacity-40 transition-colors"
              title="Previous episode"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="px-5 py-2 rounded-2xl bg-slate-100 text-center min-w-[120px] clay-inset">
              <span className="text-lg font-extrabold font-mono text-slate-900">
                Ep {currentEp}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Current
              </span>
            </div>

            <button
              onClick={handleIncrementEpisode}
              disabled={Boolean(totalEp && currentEp >= totalEp)}
              className="p-3 rounded-2xl clay-btn-primary text-white shadow-md disabled:opacity-40 transition-all active:scale-95"
              title="Next episode"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-start md:justify-end">
            {isFinished ? (
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
                Anime Mission Completed
              </span>
            ) : (
              <button
                onClick={() => {
                  if (totalEp) {
                    handleMarkUpTo(anime.id, totalEp);
                  } else {
                    updateAnime(anime.id, { status: 'completed' });
                  }
                }}
                className="px-5 py-2.5 rounded-2xl clay-btn-secondary hover:text-emerald-600 transition-colors text-xs font-bold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Entire Series Complete</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Episode List */}
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
            <Film className="w-5 h-5 text-indigo-600" />
            Episode Flight Deck
          </h3>

          <EpisodeList
            anime={anime}
            onToggleWatched={markEpisodeWatched}
            onMarkUpToEpisode={handleMarkUpTo}
          />
        </div>

        {anime.notes && (
          <div className="mt-8 p-5 rounded-3xl clay-panel space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Mission Log & Personal Notes
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {anime.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
