/**
 * Anime Context for AniLaunch
 * Central state management for watchlist, episode progress, IndexedDB sync, and library actions.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  getStoredAnimeList,
  saveStoredAnimeList,
  getStoredSettings,
  saveStoredSettings,
  exportAllData,
  importUserData,
  clearAllStoredData,
} from '../services/localStorage';
import { deleteImageBlob, clearAllImages } from '../services/indexedDB';
import { DEMO_ANIME_LIST } from '../data/demoAnime';
import { parseISO, differenceInDays, format } from 'date-fns';
import { calculateAnimeEndDate } from '../services/scheduleService';

const AnimeContext = createContext(null);

export function AnimeProvider({ children }) {
  const [animeList, setAnimeList] = useState(() => getStoredAnimeList());
  const [settings, setSettings] = useState(() => getStoredSettings());
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync state to LocalStorage whenever animeList changes
  useEffect(() => {
    saveStoredAnimeList(animeList);
  }, [animeList]);

  // Sync settings
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Initial startup cleanup for completed anime if configured
  useEffect(() => {
    if (!isInitialized) {
      if (settings?.completedCleanup?.autoDelete) {
        const retentionDays = Number(settings.completedCleanup.retentionDays) || 30;
        const now = new Date();
        const filtered = animeList.filter((item) => {
          if (item.status === 'completed' && item.updatedAt) {
            const daysSince = differenceInDays(now, parseISO(item.updatedAt));
            if (daysSince >= retentionDays) {
              // Cleanup image blobs
              if (item.posterKey) deleteImageBlob(item.posterKey);
              if (item.bannerKey) deleteImageBlob(item.bannerKey);
              return false;
            }
          }
          return true;
        });

        if (filtered.length !== animeList.length) {
          setAnimeList(filtered);
        }
      }
      setIsInitialized(true);
    }
  }, [isInitialized, animeList, settings]);

  /**
   * Triggers joyful celebration confetti
   */
  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8065FF', '#62DDF5', '#D85CBA', '#F5F5FF'],
      });
    } catch (err) {
      console.log('Confetti failed to run', err);
    }
  }, []);

  /**
   * Adds a new anime to library
   */
  const addAnime = useCallback((newAnime) => {
    let finalEndDate = newAnime.endDate || null;
    if (!finalEndDate && newAnime.startDate && newAnime.totalEpisodes) {
      const autoEnd = calculateAnimeEndDate(newAnime);
      if (autoEnd) finalEndDate = format(autoEnd, 'yyyy-MM-dd');
    }

    const entry = {
      ...newAnime,
      endDate: finalEndDate,
      id: newAnime.id || `anime_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentEpisode: Number(newAnime.currentEpisode) || 0,
      totalEpisodes: newAnime.totalEpisodes ? Number(newAnime.totalEpisodes) : null,
      status: newAnime.status || 'airing',
    };

    setAnimeList((prev) => [entry, ...prev]);
    return entry;
  }, []);

  /**
   * Updates an existing anime
   */
  const updateAnime = useCallback((id, updatedFields) => {
    setAnimeList((prev) =>
      prev.map((anime) => {
        if (anime.id !== id) return anime;

        const updated = {
          ...anime,
          ...updatedFields,
          updatedAt: new Date().toISOString(),
        };

        const total = updated.totalEpisodes ? Number(updated.totalEpisodes) : null;
        const current = Number(updated.currentEpisode) || 0;

        // Auto-complete: all episodes watched
        if (total && current >= total && updated.status !== 'completed') {
          updated.status = 'completed';
          updated.endDate = updated.endDate || new Date().toISOString();
          triggerCelebration();
        }

        // Revert completed status if episodes drop below total (e.g. user decrements)
        if (
          total &&
          current < total &&
          updated.status === 'completed' &&
          !updatedFields.status // only revert if status wasn't explicitly set by the caller
        ) {
          updated.status = 'airing';
          updated.endDate = null;
        }

        // If user explicitly marks status=completed without episode count matching, stamp endDate
        if (updatedFields.status === 'completed' && !updated.endDate) {
          updated.endDate = new Date().toISOString();
        }

        return updated;
      })
    );
  }, [triggerCelebration]);

  /**
   * Deletes an anime and cleans up IndexedDB blobs
   */
  const deleteAnime = useCallback(async (id) => {
    const animeToDelete = animeList.find((a) => a.id === id);
    if (animeToDelete) {
      if (animeToDelete.posterKey) await deleteImageBlob(animeToDelete.posterKey);
      if (animeToDelete.bannerKey) await deleteImageBlob(animeToDelete.bannerKey);
    }
    setAnimeList((prev) => prev.filter((a) => a.id !== id));
  }, [animeList]);

  /**
   * Quick increments current episode watched count by 1
   */
  const incrementEpisode = useCallback((id) => {
    setAnimeList((prev) =>
      prev.map((anime) => {
        if (anime.id !== id) return anime;

        const current = Number(anime.currentEpisode) || 0;
        const total = anime.totalEpisodes ? Number(anime.totalEpisodes) : null;
        const next = current + 1;

        if (total && next > total) return anime;

        let watchedList = Array.isArray(anime.watchedEpisodes) ? [...anime.watchedEpisodes] : [];
        if (!watchedList.includes(next)) watchedList.push(next);

        const updated = {
          ...anime,
          watchedEpisodes: watchedList,
          currentEpisode: next,
          updatedAt: new Date().toISOString(),
        };

        if (total && next >= total) {
          updated.status = 'completed';
          updated.endDate = anime.endDate || new Date().toISOString();
          triggerCelebration();
        }

        return updated;
      })
    );
  }, [triggerCelebration]);

  /**
   * Sets specific episode watched or unwatched
   */
  const markEpisodeWatched = useCallback((id, episodeNumber, isWatched) => {
    setAnimeList((prev) =>
      prev.map((anime) => {
        if (anime.id !== id) return anime;

        let watchedList = Array.isArray(anime.watchedEpisodes) ? [...anime.watchedEpisodes] : [];
        if (isWatched) {
          if (!watchedList.includes(episodeNumber)) watchedList.push(episodeNumber);
        } else {
          watchedList = watchedList.filter((n) => n !== episodeNumber);
        }

        const maxWatchedInList = watchedList.length > 0 ? Math.max(...watchedList) : 0;
        const newCurrent = isWatched ? Math.max(anime.currentEpisode || 0, episodeNumber) : maxWatchedInList;
        const total = anime.totalEpisodes ? Number(anime.totalEpisodes) : null;

        const updated = {
          ...anime,
          watchedEpisodes: watchedList,
          currentEpisode: newCurrent,
          updatedAt: new Date().toISOString(),
        };

        // Auto-complete when all episodes are watched
        if (total && newCurrent >= total && updated.status !== 'completed') {
          updated.status = 'completed';
          updated.endDate = anime.endDate || new Date().toISOString();
          triggerCelebration();
        }

        // Revert completed status when an episode is unmarked and count drops below total
        if (total && newCurrent < total && updated.status === 'completed') {
          updated.status = 'airing';
          updated.endDate = null;
        }

        return updated;
      })
    );
  }, [triggerCelebration]);

  /**
   * Loads curated demo anime pack without overwriting existing entries
   */
  const loadDemoAnime = useCallback(() => {
    setAnimeList((prev) => {
      const existingIds = new Set(prev.map((a) => a.id));
      const nonDuplicateDemo = DEMO_ANIME_LIST.filter((d) => !existingIds.has(d.id));
      return [...prev, ...nonDuplicateDemo];
    });
  }, []);

  /**
   * Imports data JSON
   */
  const importData = useCallback((jsonData, merge = false) => {
    const result = importUserData(jsonData, merge);
    if (result.success) {
      setAnimeList(getStoredAnimeList());
      setSettings(getStoredSettings());
    }
    return result;
  }, []);

  /**
   * Exports full data JSON
   */
  const exportData = useCallback(() => {
    return exportAllData();
  }, []);

  /**
   * Clears all data including IndexedDB images
   */
  const clearAllData = useCallback(async () => {
    await clearAllImages();
    clearAllStoredData();
    setAnimeList([]);
    setSettings(getStoredSettings());
  }, []);

  /**
   * Updates settings
   */
  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  return (
    <AnimeContext.Provider
      value={{
        animeList,
        settings,
        addAnime,
        updateAnime,
        deleteAnime,
        incrementEpisode,
        markEpisodeWatched,
        loadDemoAnime,
        importData,
        exportData,
        clearAllData,
        updateSettings,
        triggerCelebration,
      }}
    >
      {children}
    </AnimeContext.Provider>
  );
}

export function useAnime() {
  const context = useContext(AnimeContext);
  if (!context) {
    throw new Error('useAnime must be used within an AnimeProvider');
  }
  return context;
}
