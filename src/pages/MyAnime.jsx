/**
 * My Anime Library Page for AniLaunch (Clean Claymorphism Light Style)
 */

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Film,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Plus,
  X,
} from 'lucide-react';
import { useAnime } from '../context/AnimeContext';
import AnimeCard from '../components/AnimeCard';
import EmptyState from '../components/EmptyState';
import { calculateNextRelease } from '../services/scheduleService';
import { calculateProgressPercentage } from '../utils/episodeProgress';
import { useGsapStagger } from '../hooks/useGsapReveal';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'airing', label: 'Airing' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'on_hold', label: 'On Hold' },
  { id: 'completed', label: 'Completed' },
];

const SORT_OPTIONS = [
  { id: 'next_release', label: 'Next Release' },
  { id: 'title', label: 'Title (A-Z)' },
  { id: 'recent', label: 'Recently Added' },
  { id: 'progress', label: 'Watch Progress' },
];

export default function MyAnime({ onOpenAddModal, onEditAnime, onDeleteAnime }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { animeList, incrementEpisode, loadDemoAnime } = useAnime();

  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('next_release');
  const [viewMode, setViewMode] = useState('grid');

  const searchQuery = searchParams.get('search') || '';

  const handleSearchChange = (val) => {
    if (val) {
      setSearchParams({ search: val });
    } else {
      setSearchParams({});
    }
  };

  const allGenres = useMemo(() => {
    const set = new Set();
    animeList.forEach((a) => {
      if (Array.isArray(a.genres)) {
        a.genres.forEach((g) => set.add(g));
      }
    });
    return Array.from(set).sort();
  }, [animeList]);

  const filteredAnimeList = useMemo(() => {
    return animeList
      .filter((anime) => {
        if (statusFilter !== 'all' && anime.status !== statusFilter) {
          return false;
        }

        if (selectedGenre !== 'all') {
          if (!anime.genres || !anime.genres.includes(selectedGenre)) {
            return false;
          }
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const titleMatch = (anime.title || '').toLowerCase().includes(q);
          const altMatch = (anime.altTitle || '').toLowerCase().includes(q);
          const genreMatch = (anime.genres || []).some((g) => g.toLowerCase().includes(q));
          const notesMatch = (anime.notes || '').toLowerCase().includes(q);

          if (!titleMatch && !altMatch && !genreMatch && !notesMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        }

        if (sortBy === 'recent') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }

        if (sortBy === 'progress') {
          const pctA = calculateProgressPercentage(a.currentEpisode, a.totalEpisodes);
          const pctB = calculateProgressPercentage(b.currentEpisode, b.totalEpisodes);
          return pctB - pctA;
        }

        if (sortBy === 'next_release') {
          const schA = calculateNextRelease(a);
          const schB = calculateNextRelease(b);
          if (!schA.nextReleaseDate) return 1;
          if (!schB.nextReleaseDate) return -1;
          return schA.nextReleaseDate.getTime() - schB.nextReleaseDate.getTime();
        }

        return 0;
      });
  }, [animeList, statusFilter, selectedGenre, searchQuery, sortBy]);

  const cardsContainerRef = useGsapStagger([filteredAnimeList, viewMode], {
    duration: 0.45,
    stagger: 0.04,
    y: 16,
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 flex items-center gap-2.5">
            <Film className="w-7 h-7 text-indigo-600" />
            Watchlist Fleet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Manage your anime universe, update watched episodes, and monitor launch schedules.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-5 py-2.5 rounded-2xl clay-btn-primary text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Anime</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl clay-panel space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by title, alt title, or genre..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-2xl pl-9 pr-9 py-2.5 text-xs clay-input"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort & View Mode */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl clay-btn-secondary text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-800 font-bold text-xs outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    Sort: {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center p-1 rounded-2xl clay-panel">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'grid' ? 'clay-btn-primary text-white shadow-sm' : 'text-slate-500 hover:text-indigo-600'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'compact' ? 'clay-btn-primary text-white shadow-sm' : 'text-slate-500 hover:text-indigo-600'
                }`}
                title="Compact list view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Tabs and Genre Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? 'clay-btn-primary text-white shadow-sm'
                    : 'clay-btn-secondary text-slate-600 hover:text-indigo-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {allGenres.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5 text-indigo-500" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-bold outline-none cursor-pointer shadow-sm"
              >
                <option value="all">All Genres</option>
                {allGenres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Anime Grid / List */}
      {filteredAnimeList.length === 0 ? (
        animeList.length === 0 ? (
          <EmptyState
            title="Your Watchlist Is Empty"
            description="Add your first anime mission to track releases, upload custom artwork, and monitor live episode countdowns."
            onAddAnime={onOpenAddModal}
            onLoadDemo={loadDemoAnime}
          />
        ) : (
          <div className="p-12 text-center rounded-3xl clay-panel space-y-3">
            <p className="text-sm text-slate-900 font-bold">
              No anime matching your filter criteria.
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Try clearing your search query or switching status filters.
            </p>
            <button
              onClick={() => {
                setStatusFilter('all');
                setSelectedGenre('all');
                handleSearchChange('');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold clay-btn-secondary text-indigo-600"
            >
              Reset Filters
            </button>
          </div>
        )
      ) : (
        <div
          ref={cardsContainerRef}
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
              : 'space-y-3'
          }
        >
          {filteredAnimeList.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              viewMode={viewMode}
              onEdit={onEditAnime}
              onDelete={onDeleteAnime}
              onIncrementEpisode={incrementEpisode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
