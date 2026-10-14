/**
 * Weekly & Monthly Release Calendar for AniLaunch (Clean Claymorphism Light Style)
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  isAfter,
  startOfDay,
  parseISO,
  isValid,
  getDay,
} from 'date-fns';
import { useAnime } from '../context/AnimeContext';
import { DAY_NAMES, getAnimeAirInfoForDay } from '../services/scheduleService';
import EmptyState from '../components/EmptyState';
import { useGsapStagger } from '../hooks/useGsapReveal';

export default function Calendar({ onOpenAddModal }) {
  const { animeList, loadDemoAnime } = useAnime();
  const [viewType, setViewType] = useState('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());

  const weeklyGridRef = useGsapStagger([currentDate, viewType], {
    duration: 0.45,
    stagger: 0.04,
    y: 15,
  });

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  /**
   * Returns anime that air on a given calendar day, strictly respecting
   * startDate and endDate/totalEpisodes broadcast windows.
   */
  const getAnimeForDay = (calendarDay) => {
    return animeList
      .map((anime) => {
        const airInfo = getAnimeAirInfoForDay(anime, calendarDay);
        return {
          ...anime,
          airsOnDay: airInfo.airsOnDay,
          airingEpisodeNumber: airInfo.episodeNumber,
        };
      })
      .filter((a) => a.airsOnDay);
  };



  const handlePrev = () => {
    if (viewType === 'weekly') setCurrentDate((prev) => subWeeks(prev, 1));
    else setCurrentDate((prev) => subMonths(prev, 1));
  };

  const handleNext = () => {
    if (viewType === 'weekly') setCurrentDate((prev) => addWeeks(prev, 1));
    else setCurrentDate((prev) => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  if (animeList.length === 0) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 flex items-center gap-2.5">
              <CalendarIcon className="w-7 h-7 text-indigo-600" />
              Orbital Launch Calendar
            </h1>
          </div>
        </div>

        <EmptyState
          title="No Scheduled Flights Found"
          description="Your calendar is empty. Add anime with weekly release days to visualize upcoming broadcast windows."
          onAddAnime={onOpenAddModal}
          onLoadDemo={loadDemoAnime}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 flex items-center gap-2.5">
            <CalendarIcon className="w-7 h-7 text-indigo-600" />
            Launch Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Track weekly broadcast schedules and upcoming release slots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Week/Month switch */}
          <div className="flex items-center p-1 rounded-2xl clay-panel">
            <button
              onClick={() => setViewType('weekly')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewType === 'weekly'
                  ? 'clay-btn-primary text-white shadow-sm'
                  : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              Weekly Schedule
            </button>
            <button
              onClick={() => setViewType('monthly')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewType === 'monthly'
                  ? 'clay-btn-primary text-white shadow-sm'
                  : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              Monthly Grid
            </button>
          </div>

          {/* Date arrows */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl clay-panel">
            <button
              onClick={handlePrev}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold font-display px-2 text-slate-800 min-w-[130px] text-center">
              {viewType === 'weekly'
                ? `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`
                : format(currentDate, 'MMMM yyyy')}
            </span>

            <button
              onClick={handleNext}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-4 py-2 rounded-2xl clay-btn-secondary text-xs font-bold text-indigo-600"
          >
            Today
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* WEEKLY CALENDAR VIEW (7 COLUMNS)                     */}
      {/* ---------------------------------------------------- */}
      {viewType === 'weekly' && (
        <div ref={weeklyGridRef} className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const isTodayDate = isToday(day);
            const isPast = isBefore(day, new Date()) && !isTodayDate;
            const animeForDay = getAnimeForDay(day);

            return (
              <div
                key={day.toISOString()}
                className={`rounded-3xl border flex flex-col min-h-[380px] p-3.5 transition-all ${
                  isTodayDate
                    ? 'bg-indigo-50/70 border-indigo-300 shadow-md ring-2 ring-indigo-200'
                    : isPast
                    ? 'bg-slate-50 border-slate-200/60'
                    : 'bg-white clay-card border-white'
                }`}
              >
                <div className="pb-3 mb-3 border-b border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider block font-display ${
                        isTodayDate ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    >
                      {format(day, 'EEE')}
                    </span>
                    <span
                      className={`text-lg font-extrabold font-display ${
                        isTodayDate ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {format(day, 'MMM d')}
                    </span>
                  </div>

                  {isTodayDate && (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-500 text-white shadow-sm">
                      Today
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto">
                  {animeForDay.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-2">
                      <span className="text-[11px] text-slate-400 italic font-medium">
                        No launches
                      </span>
                    </div>
                  ) : (
                    animeForDay.map((anime) => (
                      <Link
                        key={anime.id}
                        to={`/anime/${anime.id}`}
                        className="group block p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm transition-all text-left"
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          <span className="text-[11px] font-mono text-indigo-600 font-bold">
                            {anime.releaseTime || 'TBA'}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 font-display">
                          {anime.title}
                        </h4>

                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                          <span>
                            {anime.airingEpisodeNumber
                              ? `Ep ${anime.airingEpisodeNumber}${anime.totalEpisodes ? ` / ${anime.totalEpisodes}` : ''}`
                              : `Ep ${(anime.currentEpisode || 0) + 1}`}
                          </span>
                          <span className="group-hover:text-indigo-600 transition-colors font-bold">
                            Details →
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MONTHLY CALENDAR VIEW                                */}
      {/* ---------------------------------------------------- */}
      {viewType === 'monthly' && (
        <div className="rounded-3xl clay-panel p-5 overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {DAY_NAMES.map((name) => (
              <span
                key={name}
                className="text-xs font-bold text-slate-400 uppercase tracking-wider py-1 font-display"
              >
                {name.slice(0, 3)}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: getDay(monthDays[0]) }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[100px] rounded-2xl bg-transparent" />
            ))}

            {monthDays.map((day) => {
              const isTodayDate = isToday(day);
              const animeForDay = getAnimeForDay(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[110px] rounded-2xl p-2.5 border flex flex-col justify-between transition-all ${
                    isTodayDate
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-sm'
                      : 'bg-white border-slate-200/60 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold font-mono ${
                        isTodayDate ? 'text-indigo-600' : 'text-slate-800'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {isTodayDate && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    )}
                  </div>

                  <div className="space-y-1 flex-1 overflow-y-auto">
                    {animeForDay.map((anime) => (
                      <Link
                        key={anime.id}
                        to={`/anime/${anime.id}`}
                        className="block px-2 py-1 rounded-xl text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 truncate transition-colors"
                        title={`${anime.title} ${anime.airingEpisodeNumber ? `(Ep ${anime.airingEpisodeNumber})` : ''} - ${anime.releaseTime || ''}`}
                      >
                        {anime.airingEpisodeNumber ? `Ep ${anime.airingEpisodeNumber} • ` : ''}
                        {anime.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
