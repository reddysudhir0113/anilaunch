/**
 * Countdown Component for AniLaunch (Clean Claymorphism Style)
 */

import React, { useState, useEffect } from 'react';
import { getCountdownBreakdown } from '../services/scheduleService';
import { Clock, Rocket } from 'lucide-react';

export default function Countdown({ targetDate, compact = false, showIcon = true, onPass = null }) {
  const [countdown, setCountdown] = useState(() => getCountdownBreakdown(targetDate));

  useEffect(() => {
    const tick = () => {
      const updated = getCountdownBreakdown(targetDate);
      setCountdown(updated);
      if (updated.isPassed && onPass) {
        onPass();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onPass]);

  if (!targetDate) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <Clock className="w-3.5 h-3.5" />
        Schedule TBA
      </span>
    );
  }

  if (countdown.isPassed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm animate-pulse">
        <Rocket className="w-3.5 h-3.5" />
        Launching Now
      </span>
    );
  }

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 font-mono">
        {showIcon && <Clock className="w-3 h-3 text-indigo-500" />}
        {countdown.formatted}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {countdown.days > 0 && (
        <div className="flex flex-col items-center justify-center bg-white border border-slate-100 shadow-sm rounded-xl px-2.5 py-1.5 min-w-[44px]">
          <span className="text-sm font-extrabold font-mono text-slate-800">{String(countdown.days).padStart(2, '0')}</span>
          <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">days</span>
        </div>
      )}
      <div className="flex flex-col items-center justify-center bg-white border border-slate-100 shadow-sm rounded-xl px-2.5 py-1.5 min-w-[44px]">
        <span className="text-sm font-extrabold font-mono text-slate-800">{String(countdown.hours).padStart(2, '0')}</span>
        <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">hrs</span>
      </div>
      <div className="flex flex-col items-center justify-center bg-white border border-slate-100 shadow-sm rounded-xl px-2.5 py-1.5 min-w-[44px]">
        <span className="text-sm font-extrabold font-mono text-indigo-600">{String(countdown.minutes).padStart(2, '0')}</span>
        <span className="text-[9px] uppercase tracking-wider font-semibold text-indigo-400">min</span>
      </div>
      <div className="flex flex-col items-center justify-center bg-white border border-slate-100 shadow-sm rounded-xl px-2.5 py-1.5 min-w-[44px] animate-tick">
        <span className="text-sm font-extrabold font-mono text-sky-500">{String(countdown.seconds).padStart(2, '0')}</span>
        <span className="text-[9px] uppercase tracking-wider font-semibold text-sky-400">sec</span>
      </div>
    </div>
  );
}
