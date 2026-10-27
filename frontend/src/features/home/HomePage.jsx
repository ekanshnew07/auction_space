/**
 * Module: features/home/HomePage.jsx
 * Purpose: Redesigned PulseVault exchange discovery & live arena hub.
 */
import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Flame,
  History,
  Loader,
  Lock,
  Radio,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import AuctionCard from '../../components/cards/AuctionCard';
import Reveal from '../../components/ui/Reveal';
import { HERO_MESSAGES, PHASES } from './homeConfig';
import InteractivePulseVisual from './components/InteractivePulseVisual';
import { useHomePage } from './useHomePage';

const HomePage = () => {
  const {
    user,
    isLoading,
    activePhase,
    setActivePhase,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    watchlist,
    heroMessageIndex,
    categories,
    filteredAuctions,
    toggleWatch,
    registerForBid,
  } = useHomePage();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Reveal>
        <section className="premium-panel relative overflow-hidden rounded-3xl p-7 text-slate-900 sm:p-10">
          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-16 left-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="space-y-4 lg:col-span-7">
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-violet-200 bg-violet-50/90 px-3.5 py-1 text-xs font-bold text-violet-800">
                <Flame size={14} className="text-amber-500" />
                <span>PULSEVAULT LIVE EXCHANGE</span>
                <span className="text-violet-300">•</span>
                <span className="font-mono text-[11px] text-emerald-700">SOFT-CLOSE ANTI-SNIPING</span>
              </div>

              <h1 className="text-3xl font-extrabold leading-tight text-bid-dark md:text-5xl">
                High-Trust Live Auctions with{' '}
                <span className="bg-gradient-to-r from-violet-700 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                  Anti-Snipe & Escrow
                </span>
              </h1>

              <div className="min-h-[3.2rem]">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={HERO_MESSAGES[heroMessageIndex]}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="text-base font-medium text-slate-600 md:text-lg"
                  >
                    {HERO_MESSAGES[heroMessageIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setActivePhase('ongoing')}
                  className="btn-premium px-5 py-2.5 text-sm"
                >
                  <Radio size={15} /> Enter Live Arena
                </button>
                <Link to="/how-it-works" className="btn-soft px-4 py-2.5 text-sm text-slate-800">
                  How Soft-Close Works <ArrowRight size={15} />
                </Link>
                {!user && (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                  >
                    <Zap size={13} /> 1-Click Demo Accounts
                  </Link>
                )}
              </div>
            </div>

            <div className="lg:col-span-5">
              <InteractivePulseVisual />
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={60} className="mt-7">
        <section className="premium-panel rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {PHASES.map((phase) => {
                const Icon = phase.id === 'future' ? CalendarClock : phase.id === 'ongoing' ? Radio : History;
                const isActive = activePhase === phase.id;
                return (
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    key={phase.id}
                    onClick={() => setActivePhase(phase.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-700 to-purple-600 text-white shadow-md'
                        : 'btn-soft text-slate-700'
                    }`}
                    type="button"
                  >
                    <Icon size={15} className={phase.id === 'ongoing' && isActive ? 'animate-pulse text-emerald-300' : ''} />
                    {phase.label}
                  </motion.button>
                );
              })}
            </div>

            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3 lg:max-w-xl">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search vault lots by title or keyword..."
                  className="w-full rounded-xl border border-violet-200/80 bg-white py-2.5 pl-10 pr-3 text-sm"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="w-full rounded-xl border border-violet-200/80 bg-white px-3 py-2.5 text-sm font-medium"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={100} className="mt-7">
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold text-slate-900">
                {PHASES.find((phase) => phase.id === activePhase)?.label}
              </h2>
              {activePhase === 'ongoing' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 font-mono text-xs font-bold text-rose-700">
                  <span className="h-2 w-2 animate-ping rounded-full bg-rose-500" /> LIVE TURN ROOMS
                </span>
              )}
            </div>
            <p className="rounded-full border border-violet-200 bg-white px-3.5 py-1 font-mono text-xs font-bold text-violet-800">
              {filteredAuctions.length} {filteredAuctions.length === 1 ? 'lot' : 'lots'}
            </p>
          </div>

          {isLoading ? (
            <div className="surface-card flex h-56 items-center justify-center rounded-2xl">
              <Loader className="animate-spin text-bid-purple" size={36} />
            </div>
          ) : filteredAuctions.length === 0 ? (
            <div className="surface-card rounded-2xl border-dashed p-12 text-center text-slate-600">
              <p className="text-base font-semibold">No lots match this phase filter right now.</p>
              <p className="mt-1 text-sm text-slate-500">
                Switch between Future, Ongoing, or Previous tabs above to explore all lots.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAuctions.map((auction, index) => (
                <Reveal key={auction._id} delay={index * 35} y={14}>
                  <AuctionCard
                    auction={auction}
                    userId={user?._id}
                    watched={watchlist.includes(auction._id)}
                    onToggleWatch={toggleWatch}
                    onRegister={registerForBid}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </Reveal>

      <Reveal delay={140} className="mt-12">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="surface-card rounded-2xl p-5">
            <div className="mb-2 inline-flex rounded-xl bg-violet-100 p-2.5 text-violet-700">
              <Radio size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900">1. Turn-Based & Soft-Close Arena</h3>
            <p className="mt-1 text-sm text-slate-600">
              Active bidders compete on a live Socket.IO turn clock. Any bid placed inside the final 12 seconds triggers a +15s anti-snipe extension.
            </p>
          </div>

          <div className="surface-card rounded-2xl p-5">
            <div className="mb-2 inline-flex rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
              <Lock size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900">2. Zero-Key Built-In Escrow</h3>
            <p className="mt-1 text-sm text-slate-600">
              Winning bids are deposited into our built-in escrow vault. Funds are held safely while transit is tracked (5% platform fee, 95% seller payout).
            </p>
          </div>

          <div className="surface-card rounded-2xl p-5">
            <div className="mb-2 inline-flex rounded-xl bg-amber-100 p-2.5 text-amber-700">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900">3. Delivery & Payout Release</h3>
            <p className="mt-1 text-sm text-slate-600">
              Once the winning collector confirms product receipt, the escrow vault releases the net payout to the seller and closes the audit trail.
            </p>
          </div>
        </section>
      </Reveal>
    </div>
  );
};

export default HomePage;
