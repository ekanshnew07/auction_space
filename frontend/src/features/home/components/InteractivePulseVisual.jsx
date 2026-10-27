/**
 * Module: features/home/components/InteractivePulseVisual.jsx
 * Purpose: Displays an interactive real-time Soft-Close & Escrow Telemetry widget in the Hero section.
 */
import React from 'react';
import { motion } from 'motion/react';
import { Flame, Lock, Radio, ShieldAlert, Zap } from 'lucide-react';

const InteractivePulseVisual = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-400/30 bg-gradient-to-br from-[#130d26] via-[#231447] to-[#0b2926] p-5 text-white shadow-xl">
      <motion.div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-violet-500/30 blur-2xl"
        animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.75, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-300">
            Socket.IO Arena Telemetry
          </span>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[11px] text-violet-200">
          25s Turn + 15s Anti-Snipe
        </span>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <ShieldAlert size={14} /> Soft-Close Shield
          </div>
          <p className="mt-1 font-mono text-lg font-extrabold text-white">+15s Auto</p>
          <p className="text-[11px] text-slate-300">Extends clock on bids &lt; 12s</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
            <Lock size={14} /> Escrow Vault
          </div>
          <p className="mt-1 font-mono text-lg font-extrabold text-white">95% / 5%</p>
          <p className="text-[11px] text-slate-300">Released on buyer receipt</p>
        </div>
      </div>

      <div className="relative mt-3 flex items-center justify-between rounded-xl border border-violet-400/25 bg-violet-950/50 px-3.5 py-2.5 text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium text-violet-200">
          <Flame size={14} className="text-amber-400" /> Zero External Keys Needed
        </span>
        <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-300">
          <Zap size={13} /> Ready
        </span>
      </div>
    </div>
  );
};

export default InteractivePulseVisual;
