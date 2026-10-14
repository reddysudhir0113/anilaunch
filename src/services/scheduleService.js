/**
 * Schedule & Countdown Service for AniLaunch
 * Robust episode calculations, live countdowns, and recurrence logic using date-fns.
 */

import {
  parseISO,
  isValid,
  isBefore,
  isAfter,
  addWeeks,
  addDays,
  setHours,
  setMinutes,
  setSeconds,
  differenceInSeconds,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  getDay,
  format,
} from 'date-fns';

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Parses a time string 'HH:mm' into hours and minutes
 * @param {string} timeStr 
 * @returns {{ hours: number, minutes: number }}
 */
export function parseTimeString(timeStr) {
  if (!timeStr) return { hours: 0, minutes: 0 };
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return { hours, minutes };
}

/**
 * Calculates the next release Date object for a given anime
 * @param {Object} anime 
 * @param {Date} [fromTime=new Date()]
 * @returns {{ nextReleaseDate: Date|null, nextEpisodeNumber: number|null, isFinished: boolean }}
 */
export function calculateNextRelease(anime, fromTime = new Date()) {
  if (!anime) {
    return { nextReleaseDate: null, nextEpisodeNumber: null, isFinished: false };
  }

  // If anime is marked completed or on-hold
  if (anime.status === 'completed') {
    return { nextReleaseDate: null, nextEpisodeNumber: null, isFinished: true };
  }

  const totalEpisodes = anime.totalEpisodes ? Number(anime.totalEpisodes) : null;
  const firstEpisodeNum = anime.firstEpisodeNum ? Number(anime.firstEpisodeNum) : 1;

  // Case 1: Has a start date and weekly day schedule
  if (anime.startDate) {
    const parsedStart = parseISO(anime.startDate);
    if (isValid(parsedStart)) {
      const { hours, minutes } = parseTimeString(anime.releaseTime || '00:00');
      let firstAirDate = setSeconds(setMinutes(setHours(parsedStart, hours), minutes), 0);

      // If weekly release day is specified, align first air date to that weekday if needed
      if (anime.weeklyDay !== undefined && anime.weeklyDay !== null && anime.weeklyDay !== '') {
        const targetDay = Number(anime.weeklyDay);
        let currentDay = getDay(firstAirDate);
        let dayDiff = (targetDay - currentDay + 7) % 7;
        firstAirDate = addDays(firstAirDate, dayDiff);
      }

      // Check if start date is still in future
      if (isAfter(firstAirDate, fromTime)) {
        return {
          nextReleaseDate: firstAirDate,
          nextEpisodeNumber: firstEpisodeNum,
          isFinished: false,
        };
      }

      // If weekly recurring
      if (anime.isWeekly !== false && (anime.weeklyDay !== undefined && anime.weeklyDay !== null && anime.weeklyDay !== '')) {
        // Calculate which episode should be released next
        let checkDate = firstAirDate;
        let epNum = firstEpisodeNum;

        // Iterate episodes week by week
        while (isBefore(checkDate, fromTime) || checkDate.getTime() === fromTime.getTime()) {
          checkDate = addWeeks(checkDate, 1);
          epNum++;

          // If reached total episodes cap
          if (totalEpisodes && epNum > totalEpisodes) {
            return {
              nextReleaseDate: null,
              nextEpisodeNumber: null,
              isFinished: true,
            };
          }
        }

        return {
          nextReleaseDate: checkDate,
          nextEpisodeNumber: epNum,
          isFinished: false,
        };
      } else {
        // One-time release that has already passed
        return {
          nextReleaseDate: null,
          nextEpisodeNumber: null,
          isFinished: true,
        };
      }
    }
  }

  // Case 2: No valid start date, but weeklyDay is set: calculate next occurrence of that weekday
  if (anime.weeklyDay !== undefined && anime.weeklyDay !== null && anime.weeklyDay !== '') {
    const targetDay = Number(anime.weeklyDay);
    const { hours, minutes } = parseTimeString(anime.releaseTime || '12:00');
    
    let candidate = setSeconds(setMinutes(setHours(fromTime, hours), minutes), 0);
    const currentDay = getDay(fromTime);
    let dayDiff = (targetDay - currentDay + 7) % 7;

    if (dayDiff === 0 && isBefore(candidate, fromTime)) {
      dayDiff = 7;
    }
    candidate = addDays(candidate, dayDiff);

    const watched = anime.currentEpisode || 0;
    const nextEp = watched + 1;

    if (totalEpisodes && nextEp > totalEpisodes) {
      return { nextReleaseDate: null, nextEpisodeNumber: null, isFinished: true };
    }

    return {
      nextReleaseDate: candidate,
      nextEpisodeNumber: nextEp,
      isFinished: false,
    };
  }

  return { nextReleaseDate: null, nextEpisodeNumber: null, isFinished: false };
}

/**
 * Calculates countdown breakdown: days, hours, minutes, seconds
 * @param {Date|null} targetDate 
 * @param {Date} [currentDate=new Date()]
 * @returns {{ days: number, hours: number, minutes: number, seconds: number, isPassed: boolean, formatted: string }}
 */
export function getCountdownBreakdown(targetDate, currentDate = new Date()) {
  if (!targetDate || !isValid(targetDate)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPassed: true,
      formatted: 'Awaiting Schedule',
    };
  }

  const diffInSec = differenceInSeconds(targetDate, currentDate);

  if (diffInSec <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPassed: true,
      formatted: 'Releasing Now',
    };
  }

  const days = Math.floor(diffInSec / 86400);
  const hours = Math.floor((diffInSec % 86400) / 3600);
  const minutes = Math.floor((diffInSec % 3600) / 60);
  const seconds = Math.floor(diffInSec % 60);

  const pad = (n) => String(n).padStart(2, '0');
  const formatted = `${days > 0 ? `${days}d ` : ''}${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

  return {
    days,
    hours,
    minutes,
    seconds,
    isPassed: false,
    formatted,
  };
}

/**
 * Calculates how many episodes have officially aired up to a given time
 * @param {Object} anime 
 * @param {Date} [currentTime=new Date()]
 * @returns {number}
 */
export function getAiredEpisodesCount(anime, currentTime = new Date()) {
  if (!anime || !anime.startDate) return 0;
  const parsedStart = parseISO(anime.startDate);
  if (!isValid(parsedStart)) return 0;

  const { hours, minutes } = parseTimeString(anime.releaseTime || '00:00');
  let firstAir = setSeconds(setMinutes(setHours(parsedStart, hours), minutes), 0);

  if (anime.weeklyDay !== undefined && anime.weeklyDay !== null && anime.weeklyDay !== '') {
    const targetDay = Number(anime.weeklyDay);
    const dayDiff = (targetDay - getDay(firstAir) + 7) % 7;
    firstAir = addDays(firstAir, dayDiff);
  }

  if (isAfter(firstAir, currentTime)) return 0;

  const total = anime.totalEpisodes ? Number(anime.totalEpisodes) : Infinity;
  let count = 1;
  let check = firstAir;

  while (true) {
    check = addWeeks(check, 1);
    if (isAfter(check, currentTime)) break;
    count++;
    if (count >= total) break;
  }

  return Math.min(count, total);
}

/**
 * Returns anime releasing this calendar week (Sunday to Saturday)
 * @param {Array} animeList 
 * @param {Date} [referenceDate=new Date()]
 * @returns {Array}
 */
export function getAnimeReleasingThisWeek(animeList, referenceDate = new Date()) {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 0 });

  return animeList
    .map((anime) => {
      const schedule = calculateNextRelease(anime, referenceDate);
      return {
        ...anime,
        nextRelease: schedule.nextReleaseDate,
        nextEpisode: schedule.nextEpisodeNumber,
        isFinished: schedule.isFinished,
      };
    })
    .filter((item) => {
      if (!item.nextRelease) return false;
      return (
        !isBefore(item.nextRelease, weekStart) &&
        !isAfter(item.nextRelease, weekEnd)
      );
    })
    .sort((a, b) => a.nextRelease.getTime() - b.nextRelease.getTime());
}

/**
 * Calculates the projected or official completion / end date for an anime
 * @param {Object} anime
 * @returns {Date|null}
 */
export function calculateAnimeEndDate(anime) {
  if (!anime) return null;
  if (anime.endDate) {
    const parsed = parseISO(anime.endDate);
    if (isValid(parsed)) return parsed;
  }
  if (!anime.startDate) return null;
  const parsedStart = parseISO(anime.startDate);
  if (!isValid(parsedStart)) return null;

  const total = anime.totalEpisodes ? Number(anime.totalEpisodes) : null;
  if (!total) return null;
  if (total <= 1) return parsedStart;

  const { hours, minutes } = parseTimeString(anime.releaseTime || '00:00');
  let firstAir = setSeconds(setMinutes(setHours(parsedStart, hours), minutes), 0);

  if (anime.weeklyDay !== undefined && anime.weeklyDay !== null && anime.weeklyDay !== '') {
    const targetDay = Number(anime.weeklyDay);
    const dayDiff = (targetDay - getDay(firstAir) + 7) % 7;
    firstAir = addDays(firstAir, dayDiff);
  }

  return addWeeks(firstAir, total - 1);
}

/**
 * Checks if a specific calendar day falls within an anime's airing broadcast window
 * (i.e. on or after startDate, and on or before endDate).
 * Also returns the specific episode number airing on that day if it matches the weekly broadcast slot.
 * @param {Object} anime
 * @param {Date} calendarDay
 * @returns {{ airsOnDay: boolean, episodeNumber: number|null }}
 */
export function getAnimeAirInfoForDay(anime, calendarDay) {
  if (!anime) return { airsOnDay: false, episodeNumber: null };
  if (anime.weeklyDay === undefined || anime.weeklyDay === null || anime.weeklyDay === '') {
    return { airsOnDay: false, episodeNumber: null };
  }

  const targetWeekday = Number(anime.weeklyDay);
  if (getDay(calendarDay) !== targetWeekday) {
    return { airsOnDay: false, episodeNumber: null };
  }

  const dayStart = startOfDay(calendarDay);

  if (!anime.startDate) {
    return { airsOnDay: anime.status !== 'completed', episodeNumber: null };
  }

  const parsedStart = parseISO(anime.startDate);
  if (!isValid(parsedStart)) return { airsOnDay: false, episodeNumber: null };

  const { hours, minutes } = parseTimeString(anime.releaseTime || '00:00');
  let firstAir = setSeconds(setMinutes(setHours(parsedStart, hours), minutes), 0);
  const startDayDiff = (targetWeekday - getDay(firstAir) + 7) % 7;
  firstAir = addDays(firstAir, startDayDiff);

  const firstAirStart = startOfDay(firstAir);
  if (isBefore(dayStart, firstAirStart)) {
    return { airsOnDay: false, episodeNumber: null }; // Day is before the series started airing
  }

  const firstEpNum = anime.firstEpisodeNum ? Number(anime.firstEpisodeNum) : 1;
  const total = anime.totalEpisodes ? Number(anime.totalEpisodes) : null;

  // Calculate which episode airs on this week
  const diffDays = Math.round((dayStart.getTime() - firstAirStart.getTime()) / (1000 * 60 * 60 * 24));
  const weeksDiff = Math.round(diffDays / 7);
  const epNum = firstEpNum + weeksDiff;

  // Check against explicit endDate
  if (anime.endDate) {
    const parsedEnd = parseISO(anime.endDate);
    if (isValid(parsedEnd) && isAfter(dayStart, endOfDay(parsedEnd))) {
      return { airsOnDay: false, episodeNumber: null };
    }
  }

  // Check against calculated end from totalEpisodes
  if (total && epNum > total) {
    return { airsOnDay: false, episodeNumber: null };
  }

  // If anime is marked completed and the date is in the future
  if (anime.status === 'completed' && isAfter(dayStart, startOfDay(new Date()))) {
    return { airsOnDay: false, episodeNumber: null };
  }

  return { airsOnDay: true, episodeNumber: epNum };
}

