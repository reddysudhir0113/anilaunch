/**
 * AnimeCard Component for AniLaunch (Clean Claymorphism Style)
 * Tactile 3D lift, light sheen shimmer on hover, pastel status pills, and bouncy controls.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Play,
  Film,
  Sparkles,
} from 'lucide-react';
import Countdown from './Countdown';
import { calculateNextRelease, DAY_NAMES } from '../services/scheduleService';
import { calculateProgressPercentage } from '../utils/episodeProgress';
import { formatLaunchDate } from '../utils/dates';
import { getImageUrlByKey } from '../services/indexedDB';

export default function AnimeCard({
  anime,
  viewMode = 'grid', // 'grid' | 'compact'
  onEdit,
  onDelete,
  onIncrementEpisode,
}) {
  const navigate = useNavigate();
  const [posterSrc, setPosterSrc] = useState(anime.posterUrl || null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (anime.posterKey) {
      getImageUrlByKey(anime.posterKey).then((url) => {
        if (isMounted && url) {
          setPosterSrc(url);
          setImgError(false);
        }
      });
    } else if (anime.posterUrl) {
      setPosterSrc(anime.posterUrl);
      setImgError(false);
    }
    return () => {
      isMounted = false;
    };
  }, [anime.posterKey, anime.posterUrl]);

  const schedule = calculateNextRelease(anime);
  const progressPct = calculateProgressPercentage(anime.currentEpisode, anime.totalEpisodes);
  const totalDisplay = anime.totalEpisodes ? anime.totalEpisodes : '?';
  const currentEp = anime.currentEpisode || 0;
  const isFinished = anime.status === 'completed';

  const weeklyDayName =
    anime.weeklyDay !== undefined && anime.weeklyDay !== null && anime.weeklyDay !== ''
      ? DAY_NAMES[Number(anime.weeklyDay)]
      : null;

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    navigate(`/anime/${anime.id}`);
  };

  // Pastel Status Pill Badges
  const getStatusBadge = () => {
    switch (anime.status) {
      case 'airing':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-sky-50 text-sky-600 border border-sky-200/80 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            Airing
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-sm flex items-center gap-1.5">
            <CheckCircle className="w-2.5 h-2.5" />
            Completed
          </span>
        );
      case 'upcoming':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-50 text-purple-600 border border-purple-200/80 shadow-sm">
            Upcoming
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">
            {anime.status || 'Active'}
          </span>
        );
    }
  };

  const renderPosterFallback = () => (
    <div className="w-full h-full bg-gradient-to-br from-indigo-50 via-slate-100 to-sky-50 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center mb-2.5 text-indigo-500">
        <Film className="w-7 h-7" />
      </div>
      <h4 className="font-display font-bold text-slate-800 text-xs line-clamp-2 px-2">
        {anime.title}
      </h4>
      <span className="text-[10px] text-indigo-500 font-mono font-semibold mt-1">ANILAUNCH</span>
    </div>
  );

  // ----------------------------------------------------
  // COMPACT LIST VIEW (CLAY STYLE)
  // ----------------------------------------------------
  if (viewMode === 'compact') {
    return (
      <div
        onClick={handleCardClick}
        className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl clay-panel cursor-pointer gap-4"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Thumbnail */}
          <div className="relative w-14 h-20 sm:w-16 sm:h-22 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200/60 shadow-sm">
            {posterSrc && !imgError ? (
              <img
                src={posterSrc}
                alt={anime.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              renderPosterFallback()
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {getStatusBadge()}
              {weeklyDayName && (
                <span className="text-[11px] text-slate-500 font-medium">
                  {weeklyDayName} {anime.releaseTime || ''}
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base font-display truncate group-hover:text-indigo-600 transition-colors">
              {anime.title}
            </h3>
            {anime.altTitle && (
              <p className="text-xs text-slate-400 truncate -mt-0.5 mb-2">
                {anime.altTitle}
              </p>
            )}

            {/* Progress Bar */}
            <div className="flex items-center gap-3 max-w-xs">
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden clay-inset">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-500 rounded-full transition-all duration-300 shadow-sm animate-progress-wave"
                  style={{ width: `${progressPct}%`, backgroundSize: '200% 200%' }}
                />
              </div>
              <span className="text-xs font-mono font-semibold text-slate-600 whitespace-nowrap">
                Ep {currentEp} / {totalDisplay} ({progressPct}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          {!isFinished && schedule.nextReleaseDate && (
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Next Launch
              </span>
              <Countdown targetDate={schedule.nextReleaseDate} compact={true} />
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {onIncrementEpisode && !isFinished && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onIncrementEpisode(anime.id);
                }}
                title="Mark next episode watched"
                className="px-3 py-1.5 rounded-xl clay-btn-primary text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+1 Ep</span>
              </button>
            )}

            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(anime);
                }}
                title="Edit Anime"
                className="p-2 rounded-xl clay-btn-secondary hover:text-indigo-600 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(anime.id);
                }}
                title="Delete Anime"
                className="p-2 rounded-xl clay-btn-secondary hover:text-rose-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // GRID CARD VIEW (WOW-FACTOR CLAY CARD WITH SHIMMER)
  // ----------------------------------------------------
  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-3xl clay-card cursor-pointer flex flex-col overflow-hidden"
    >
      {/* Poster Image Container (2:3 aspect ratio) */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-100">
        {posterSrc && !imgError ? (
          <img
            src={posterSrc}
            alt={anime.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          renderPosterFallback()
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/40 via-transparent to-transparent flex items-center justify-between z-10">
          {getStatusBadge()}

          {weeklyDayName && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-700 shadow-sm backdrop-blur-md">
              {weeklyDayName.slice(0, 3)} {anime.releaseTime || ''}
            </span>
          )}
        </div>

        {/* Quick actions hover overlay (top right) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all z-20 transform translate-y-1 group-hover:translate-y-0">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(anime);
              }}
              title="Edit"
              className="p-1.5 rounded-xl bg-white/95 text-slate-700 hover:text-indigo-600 shadow-md transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(anime.id);
              }}
              title="Delete"
              className="p-1.5 rounded-xl bg-white/95 text-slate-700 hover:text-rose-500 shadow-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Subtle Bottom Scrim for Countdown Pill */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {/* Floating countdown pill over lower image */}
        {!isFinished && schedule.nextReleaseDate && (
          <div className="absolute bottom-3 inset-x-3 z-10">
            <div className="px-3 py-1.5 rounded-2xl bg-white/95 border border-white/80 shadow-md backdrop-blur-md flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Launch:
              </span>
              <Countdown targetDate={schedule.nextReleaseDate} compact={true} showIcon={false} />
            </div>
          </div>
        )}
      </div>

      {/* Card Content & Details (Pure White Clay Base) */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white relative z-10">
        <div>
          <h3 className="font-bold text-slate-900 font-display text-base leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {anime.title}
          </h3>
          {anime.altTitle ? (
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {anime.altTitle}
            </p>
          ) : (
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {anime.genres && anime.genres.length > 0 ? anime.genres.join(' • ') : 'Anime Series'}
            </p>
          )}
        </div>

        {/* Watch Progress Section */}
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 font-medium">
              Progress: <strong className="text-slate-900 font-mono">Ep {currentEp}</strong> / {totalDisplay}
            </span>
            <span className="font-mono text-[11px] text-indigo-600 font-bold">
              {progressPct}%
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden clay-inset">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-500 rounded-full transition-all duration-300 shadow-sm animate-progress-wave"
              style={{ width: `${progressPct}%`, backgroundSize: '200% 200%' }}
            />
          </div>

          {/* Bottom quick +1 Episode button */}
          <div className="mt-3.5 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">
              {anime.episodeDuration ? `${anime.episodeDuration}m per ep` : '24m per ep'}
            </span>

            {onIncrementEpisode && !isFinished && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onIncrementEpisode(anime.id);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl clay-btn-primary text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+1 Watched</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
