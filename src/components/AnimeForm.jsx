/**
 * AnimeForm Component for AniLaunch (Clean Claymorphism Style)
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Calendar,
  Clock,
  Check,
  AlertCircle,
  Film,
  Info,
  Sparkles,
  Search,
  Loader2,
} from 'lucide-react';
import { uploadAndStoreImage, deleteImageBlob, getImageUrlByKey } from '../services/indexedDB';
import { validateAnimeForm } from '../utils/validation';
import { DAY_NAMES, calculateAnimeEndDate } from '../services/scheduleService';
import { fetchAniListUpcoming } from '../services/anilistService';
import { format } from 'date-fns';
import AnimeCard from './AnimeCard';

const POPULAR_GENRES = [
  'Action',
  'Adventure',
  'Sci-Fi',
  'Fantasy',
  'Cyberpunk',
  'Mystery',
  'Mecha',
  'Romance',
  'Slice of Life',
  'Supernatural',
  'Comedy',
  'Psychological',
];

export default function AnimeForm({
  isOpen,
  initialData = null,
  onClose,
  onSubmit,
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [formData, setFormData] = useState({
    title: '',
    altTitle: '',
    description: '',
    posterUrl: '',
    posterKey: null,
    bannerUrl: '',
    bannerKey: null,
    startDate: '',
    endDate: '',
    weeklyDay: 6,
    releaseTime: '23:00',
    timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
    totalEpisodes: 12,
    currentEpisode: 0,
    firstEpisodeNum: 1,
    episodeDuration: 24,
    status: 'airing',
    reminderLeadMinutes: 60,
    email: '',
    genres: ['Sci-Fi', 'Action'],
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [customTag, setCustomTag] = useState('');
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // AniList Auto-Fill State
  const [anilistQuery, setAnilistQuery] = useState('');
  const [anilistSuggestions, setAnilistSuggestions] = useState([]);
  const [isSearchingAniList, setIsSearchingAniList] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearchAniList = async (e) => {
    e?.preventDefault();
    if (!anilistQuery.trim()) return;

    setIsSearchingAniList(true);
    setShowSuggestions(true);
    try {
      const res = await fetchAniListUpcoming({ search: anilistQuery.trim(), perPage: 6 });
      setAnilistSuggestions(res.animeList || []);
    } catch (err) {
      console.warn('AniList search failed:', err);
    } finally {
      setIsSearchingAniList(false);
    }
  };

  const handleSelectAniListSuggestion = (item) => {
    const weeklyDayNum = item.weeklyDay !== null && item.weeklyDay !== undefined ? Number(item.weeklyDay) : 0;
    const eps = item.totalEpisodes ? Number(item.totalEpisodes) : null;
    const computedEnd = calculateAnimeEndDate({
      startDate: item.startDate,
      endDate: item.endDate,
      weeklyDay: weeklyDayNum,
      releaseTime: item.releaseTime || '23:00',
      totalEpisodes: eps,
    });
    const endDateStr = computedEnd ? format(computedEnd, 'yyyy-MM-dd') : '';

    setFormData((prev) => ({
      ...prev,
      title: item.title,
      altTitle: item.altTitle || '',
      description: item.description || '',
      posterUrl: item.posterUrl || '',
      posterKey: null,
      bannerUrl: item.bannerUrl || '',
      startDate: item.startDate || '',
      endDate: item.endDate || endDateStr,
      weeklyDay: weeklyDayNum,
      releaseTime: item.releaseTime || '23:00',
      totalEpisodes: eps !== null ? eps : '',
      episodeDuration: item.episodeDuration || 24,
      status: item.status || 'airing',
      genres: item.genres && item.genres.length > 0 ? item.genres : prev.genres,
      aniListId: item.aniListId,
    }));
    if (item.posterUrl) {
      setPosterPreview(item.posterUrl);
    }
    setShowSuggestions(false);
    setAnilistQuery('');
  };

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        endDate: initialData.endDate || '',
        weeklyDay: initialData.weeklyDay !== undefined && initialData.weeklyDay !== null ? Number(initialData.weeklyDay) : '',
        totalEpisodes: initialData.totalEpisodes || '',
        currentEpisode: initialData.currentEpisode || 0,
        genres: Array.isArray(initialData.genres) ? initialData.genres : [],
      });

      if (initialData.posterKey) {
        getImageUrlByKey(initialData.posterKey).then((url) => {
          if (url) setPosterPreview(url);
        });
      } else if (initialData.posterUrl) {
        setPosterPreview(initialData.posterUrl);
      } else {
        setPosterPreview(null);
      }
    } else {
      setFormData({
        title: '',
        altTitle: '',
        description: '',
        posterUrl: '',
        posterKey: null,
        bannerUrl: '',
        bannerKey: null,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        weeklyDay: 6,
        releaseTime: '23:00',
        timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
        totalEpisodes: 12,
        currentEpisode: 0,
        firstEpisodeNum: 1,
        episodeDuration: 24,
        status: 'airing',
        reminderLeadMinutes: 60,
        email: '',
        genres: ['Action', 'Sci-Fi'],
        notes: '',
      });
      setPosterPreview(null);
      setPosterFile(null);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handlePosterSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    setPosterFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPosterPreview(objectUrl);
  };

  const handleRemovePoster = () => {
    setPosterFile(null);
    setPosterPreview(null);
    setFormData((prev) => ({ ...prev, posterUrl: '', posterKey: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleGenre = (genre) => {
    setFormData((prev) => {
      const exists = prev.genres.includes(genre);
      return {
        ...prev,
        genres: exists ? prev.genres.filter((g) => g !== genre) : [...prev.genres, genre],
      };
    });
  };

  const addCustomTag = (e) => {
    e.preventDefault();
    const tag = customTag.trim();
    if (tag && !formData.genres.includes(tag)) {
      setFormData((prev) => ({ ...prev, genres: [...prev.genres, tag] }));
      setCustomTag('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validateAnimeForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsUploading(true);

    try {
      let finalPosterKey = formData.posterKey;

      if (posterFile) {
        if (isEditing && initialData?.posterKey) {
          await deleteImageBlob(initialData.posterKey);
        }
        finalPosterKey = await uploadAndStoreImage(posterFile, 'poster');
      }

      let finalEndDate = formData.endDate?.trim() || null;
      if (!finalEndDate && formData.startDate && formData.totalEpisodes) {
        const autoEnd = calculateAnimeEndDate(formData);
        if (autoEnd) finalEndDate = format(autoEnd, 'yyyy-MM-dd');
      }

      const payload = {
        ...formData,
        endDate: finalEndDate,
        posterKey: finalPosterKey,
        weeklyDay: formData.weeklyDay !== '' ? Number(formData.weeklyDay) : null,
        totalEpisodes: formData.totalEpisodes !== '' ? Number(formData.totalEpisodes) : null,
        currentEpisode: Number(formData.currentEpisode) || 0,
        firstEpisodeNum: Number(formData.firstEpisodeNum) || 1,
        episodeDuration: Number(formData.episodeDuration) || 24,
      };

      onSubmit(payload);
      onClose();
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to save anime image: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const previewAnime = {
    ...formData,
    id: 'preview_temp',
    posterUrl: posterPreview || formData.posterUrl,
    currentEpisode: Number(formData.currentEpisode) || 0,
    totalEpisodes: formData.totalEpisodes ? Number(formData.totalEpisodes) : null,
    weeklyDay: formData.weeklyDay !== '' ? Number(formData.weeklyDay) : null,
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Modal Dialog (Pure White Clay Base) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-5xl rounded-3xl bg-white border border-slate-200/80 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">
                {isEditing ? 'Configure Anime Mission' : 'Add Anime to Launchpad'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Configure release schedules, upload posters, and set live countdowns
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl clay-btn-secondary hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body: Left Form, Right Preview */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form id="animeForm" onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
            {/* AniList Auto-Fill Section */}
            {!isEditing && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 font-display">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Auto-Fill via AniList Database
                  </span>
                  <span className="text-[10px] text-indigo-500 font-mono">
                    Auto-fetches timings, year, poster & episodes
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Type anime title (e.g. Solo Leveling, Frieren)..."
                      value={anilistQuery}
                      onChange={(e) => setAnilistQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchAniList())}
                      className="w-full rounded-xl pl-8 pr-3 py-2 text-xs bg-white border border-indigo-200 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSearchAniList}
                    disabled={isSearchingAniList || !anilistQuery.trim()}
                    className="px-3.5 py-2 rounded-xl clay-btn-primary text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isSearchingAniList ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>Search</span>
                  </button>
                </div>

                {/* Suggestions List */}
                {showSuggestions && anilistSuggestions.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-indigo-100 max-h-48 overflow-y-auto">
                    {anilistSuggestions.map((item) => (
                      <div
                        key={item.aniListId}
                        onClick={() => handleSelectAniListSuggestion(item)}
                        className="p-2 rounded-xl bg-white hover:bg-indigo-50 border border-indigo-100 flex items-center gap-2.5 cursor-pointer transition-colors shadow-xs group"
                      >
                        <div className="w-8 h-11 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          {item.posterUrl && (
                            <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate font-display">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {item.seasonYear} • {item.totalEpisodes ? `${item.totalEpisodes} eps` : 'Ongoing'}
                          </span>
                        </div>
                        <span className="text-[10px] text-indigo-600 font-bold px-2 py-0.5 rounded-lg bg-indigo-50">
                          Use
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Title & Alt Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Anime Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frieren: Beyond Journey's End"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full rounded-2xl px-4 py-2.5 clay-input text-sm ${
                    errors.title ? 'border-rose-500 ring-2 ring-rose-200' : ''
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Alternate / Romaji Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. 葬送のフリーレン"
                  value={formData.altTitle}
                  onChange={(e) => setFormData({ ...formData, altTitle: e.target.value })}
                  className="w-full rounded-2xl px-4 py-2.5 clay-input text-sm"
                />
              </div>
            </div>

            {/* Poster Upload Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Anime Poster Artwork (Stored in IndexedDB)
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="flex-1 w-full border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-4 text-center cursor-pointer transition-all bg-slate-50 hover:bg-white shadow-sm">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePosterSelect}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Upload className="w-6 h-6 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-800">
                      Click to upload poster (PNG, JPG, WebP)
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Preserved locally in browser IndexedDB
                    </span>
                  </div>
                </label>

                {posterPreview && (
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <img src={posterPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePoster}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 border border-rose-200"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-2.5">
                <input
                  type="url"
                  placeholder="Or enter direct image URL (e.g. https://...)"
                  value={formData.posterUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, posterUrl: e.target.value });
                    if (!posterFile) setPosterPreview(e.target.value);
                  }}
                  className="w-full rounded-2xl px-4 py-2 clay-input text-xs"
                />
              </div>
            </div>

            {/* Synopsis */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Description / Synopsis
              </label>
              <textarea
                rows={3}
                placeholder="Storyline, premise, and notes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-2xl px-4 py-2.5 clay-input text-sm resize-none"
              />
            </div>

            {/* Schedule Section */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Launch Schedule Parameters
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Weekly Release Day
                  </label>
                  <select
                    value={formData.weeklyDay}
                    onChange={(e) => setFormData({ ...formData, weeklyDay: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 clay-input text-xs"
                  >
                    <option value="">One-time / No Schedule</option>
                    {DAY_NAMES.map((name, index) => (
                      <option key={name} value={index}>
                        Every {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Release Time (HH:mm)
                  </label>
                  <input
                    type="time"
                    value={formData.releaseTime}
                    onChange={(e) => setFormData({ ...formData, releaseTime: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 clay-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Start Air Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setFormData((prev) => {
                        const updated = { ...prev, startDate: newStart };
                        if (!prev.endDate && newStart && prev.totalEpisodes) {
                          const autoEnd = calculateAnimeEndDate({ ...prev, startDate: newStart });
                          if (autoEnd) updated.endDate = format(autoEnd, 'yyyy-MM-dd');
                        }
                        return updated;
                      });
                    }}
                    className="w-full rounded-xl px-3 py-2 clay-input text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-600">
                      End Air Date
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const autoEnd = calculateAnimeEndDate(formData);
                        if (autoEnd) {
                          setFormData((prev) => ({ ...prev, endDate: format(autoEnd, 'yyyy-MM-dd') }));
                        }
                      }}
                      className="text-[9px] text-indigo-600 font-bold hover:underline cursor-pointer"
                      title="Calculate projected completion date from start date and total episodes"
                    >
                      Auto-Calc
                    </button>
                  </div>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 clay-input text-xs"
                    title="Finale episode air date or completion date"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tracking Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 clay-input text-xs"
                  >
                    <option value="airing">Airing (Active launches)</option>
                    <option value="upcoming">Upcoming (Pre-launch)</option>
                    <option value="completed">Completed (All watched)</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 clay-input text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Episode Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Total Episodes
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 12"
                  value={formData.totalEpisodes}
                  onChange={(e) => setFormData({ ...formData, totalEpisodes: e.target.value })}
                  className="w-full rounded-2xl px-4 py-2.5 clay-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Watched Episodes
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.currentEpisode}
                  onChange={(e) => setFormData({ ...formData, currentEpisode: e.target.value })}
                  className="w-full rounded-2xl px-4 py-2.5 clay-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Duration (mins)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="24"
                  value={formData.episodeDuration}
                  onChange={(e) => setFormData({ ...formData, episodeDuration: e.target.value })}
                  className="w-full rounded-2xl px-4 py-2.5 clay-input text-sm"
                />
              </div>
            </div>

            {/* Genre Pills */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Genre Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {POPULAR_GENRES.map((genre) => {
                  const isSelected = formData.genres.includes(genre);
                  return (
                    <button
                      type="button"
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'clay-btn-primary text-white shadow-sm'
                          : 'clay-btn-secondary text-slate-600 hover:text-indigo-600'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add custom tag (e.g. Isekai, Romance)..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomTag(e)}
                  className="rounded-2xl px-3 py-2 clay-input text-xs flex-1 max-w-xs"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="px-3.5 py-2 rounded-2xl clay-btn-secondary text-xs font-bold text-slate-700"
                >
                  + Add
                </button>
              </div>
            </div>
          </form>

          {/* Right Column: Live Card Preview */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="sticky top-0 w-full max-w-[280px]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 block text-center">
                Live Card Preview
              </span>
              <AnimeCard anime={previewAnime} />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl clay-btn-secondary text-slate-600 font-bold text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="animeForm"
            disabled={isUploading}
            className="px-6 py-2.5 rounded-2xl clay-btn-primary text-white font-bold text-sm flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {isUploading ? (
              <span>Saving Image...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Launch Anime'}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
