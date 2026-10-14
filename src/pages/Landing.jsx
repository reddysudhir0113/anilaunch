/**
 * Cinematic Full-Screen Landing / Splash for AniLaunch
 * Full-viewport anime artwork backdrop with staggered CSS letter animations,
 * Framer Motion image fade-in, progress bar auto-redirect to Dashboard.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, ArrowRight, Play, Pause } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasLaunched, setHasLaunched] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const DURATION_SECONDS = 7.0;

  useEffect(() => {
    if (isPaused || hasLaunched) return;

    const intervalTime = 50;
    const step = 100 / ((DURATION_SECONDS * 1000) / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setHasLaunched(true);
          setTimeout(() => {
            navigate('/dashboard');
          }, 600);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, hasLaunched, navigate]);

  const handleSkipNow = () => {
    setHasLaunched(true);
    navigate('/dashboard');
  };

  const welcomeText = 'WELCOME TO ANILAUNCH';
  const taglineText = 'Every Episode Is a New Launch';

  const secondsRemaining = Math.max(
    0,
    Math.ceil(((100 - progress) / 100) * DURATION_SECONDS),
  );

  return (
    /* Root — covers the entire viewport */
    <div className="relative w-screen h-screen overflow-hidden select-none">
      {/* ────────────────────────────────────────────────
          LAYER 1: Full-Screen Background Image
      ──────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.08, opacity: 0, filter: 'blur(12px)' }}
        animate={
          imageLoaded
            ? { scale: 1, opacity: 1, filter: 'blur(0px)' }
            : { scale: 1.08, opacity: 0, filter: 'blur(12px)' }
        }
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src="./hero-launch.jpg"
          alt="Anime Hero Artwork"
          onLoad={() => setImageLoaded(true)}
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      {/* ────────────────────────────────────────────────
          LAYER 2: Gradient Overlays
      ──────────────────────────────────────────────── */}
      {/* Top darkening for nav readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/55 via-transparent to-transparent" />
      {/* Bottom heavy gradient for text readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0A0C14]/90 via-[#0A0C14]/45 to-transparent" />
      {/* Very subtle side vignette */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

      {/* ────────────────────────────────────────────────
          LAYER 3: Content
      ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between px-5 sm:px-10 py-6">

        {/* TOP NAV PILL */}
        <motion.header
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3">
            {/* Mascot thumbnail */}
            <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0 bg-white/10 backdrop-blur-md">
              <img
                src="./rocket-mascot.jpg"
                alt="Mascot"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-display font-extrabold text-base text-white tracking-tight block leading-none">
                ANILAUNCH
              </span>
              <span className="text-[10px] text-white/55 font-mono font-semibold">
                STATION v1.0
              </span>
            </div>
          </div>

          <button
            onClick={handleSkipNow}
            className="px-4 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-white/25 transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <span>Enter Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.header>

        {/* CENTRE SPACER — pushes content to bottom */}
        <div className="flex-1" />

        {/* BOTTOM CONTENT DECK */}
        <div className="w-full max-w-3xl">

          {/* WELCOME BADGE */}
          <motion.div
            className="inline-flex items-center gap-2 mb-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-indigo-300/60 flex-shrink-0">
              <img
                src="./pilot-avatar.jpg"
                alt="Pilot"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[11px] text-white/70 font-mono font-bold uppercase tracking-widest">
              Welcome to Your Command Center
            </span>
          </motion.div>

          {/* LETTER-BY-LETTER TITLE */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display tracking-tight text-white mb-2 flex flex-wrap overflow-hidden">
            {welcomeText.split('').map((char, index) => (
              <span
                key={`w-${index}`}
                className="animate-letter"
                style={{
                  animationDelay: `${0.8 + index * 0.035}s`,
                  marginRight: char === ' ' ? '0.3em' : '0.01em',
                  textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                }}
              >
                {char}
              </span>
            ))}
          </h1>

          {/* TAGLINE LETTER ANIMATION */}
          <h2 className="text-lg sm:text-2xl font-bold font-display tracking-wide text-indigo-300 mb-8 flex flex-wrap overflow-hidden">
            {taglineText.split('').map((char, index) => (
              <span
                key={`t-${index}`}
                className="animate-letter"
                style={{
                  animationDelay: `${1.7 + index * 0.025}s`,
                  marginRight: char === ' ' ? '0.28em' : '0.01em',
                }}
              >
                {char}
              </span>
            ))}
          </h2>

          {/* DESCRIPTION + PROGRESS BAR GLASS CARD */}
          <motion.div
            className="rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 p-5 shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-sm sm:text-base text-white/75 font-medium leading-relaxed mb-4">
              Track airing episodes with live countdowns, upload custom artwork, and manage your watchlist — all stored locally on your device.
            </p>

            {/* Progress Track */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-white/60">
                <span className="flex items-center gap-1.5 text-indigo-300 font-bold">
                  <Rocket className="w-3.5 h-3.5 animate-pulse" />
                  INITIALIZING LAUNCH SEQUENCE
                </span>
                <span className="text-white/80 font-bold">{Math.round(progress)}%</span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-500 animate-progress-wave shadow-sm transition-all duration-75"
                  style={{ width: `${progress}%`, backgroundSize: '200% 200%' }}
                />
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-xs text-white/50 font-medium">
                  Redirecting in{' '}
                  <strong className="text-indigo-300 font-mono">{secondsRemaining}s</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPaused((prev) => !prev)}
                    className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-white/70 text-xs font-bold flex items-center gap-1 hover:bg-white/20 transition-all cursor-pointer"
                  >
                    {isPaused ? (
                      <Play className="w-3 h-3 text-indigo-300" />
                    ) : (
                      <Pause className="w-3 h-3" />
                    )}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>

                  <button
                    onClick={handleSkipNow}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600/90 border border-indigo-400/40 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-600 transition-all active:scale-95 cursor-pointer shadow-md"
                  >
                    <Rocket className="w-3 h-3" />
                    <span>Launch Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────
          LAYER 4: Exit flash overlay
      ──────────────────────────────────────────────── */}
      {hasLaunched && (
        <motion.div
          className="absolute inset-0 z-50 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeIn' }}
        />
      )}
    </div>
  );
}
