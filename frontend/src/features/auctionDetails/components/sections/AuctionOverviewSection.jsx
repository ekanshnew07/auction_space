/**
 * Module: features/auctionDetails/components/sections/AuctionOverviewSection.jsx
 * Purpose: Displays live turn clock, Soft-Close Anti-Sniping progress bar, and participant duel state.
 */
import React from 'react';
import { Clock, Flame, Gavel, Radio, ShieldAlert, ShieldCheck, Users } from 'lucide-react';

const AuctionOverviewSection = ({
  auction,
  myRegistration,
  registrationClosed,
  registrationCountdown,
  roomActivationActive,
  roomActivationCountdown,
  turnCountdown,
  turnRemainingMs = 0,
  isSoftCloseZone = false,
}) => {
  const turnTotalMs = (auction.turnDurationSeconds || 25) * 1000;
  const turnProgressPct = Math.min(100, Math.max(0, Math.round((turnRemainingMs / turnTotalMs) * 100)));
  const currentTurnBidderName =
    auction.activeBidders?.find(
      (b) => String(b._id || b) === String(auction.currentTurnBidder?._id || auction.currentTurnBidder)
    )?.name || 'Any Active Bidder';

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 font-mono text-xs font-bold uppercase text-violet-800">
          {auction.category}
        </span>
        {auction.status === 'ongoing' && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 font-mono text-xs font-bold text-rose-700">
            <span className="h-2 w-2 animate-ping rounded-full bg-rose-600" /> LIVE SOCKET.IO ARENA
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 font-mono text-xs font-bold text-emerald-800">
          <ShieldCheck size={13} /> 5% ESCROW PROTECTED
        </span>
      </div>

      <h1 className="mb-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">{auction.title}</h1>
      <p className="mb-5 text-sm leading-relaxed text-slate-600">{auction.description}</p>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/90 to-white p-4 shadow-sm">
          <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Current Highest Offer</span>
            <Gavel size={14} className="text-bid-purple" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-bid-purple">
            ${Number(auction.currentPrice || 0).toLocaleString()}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Reserve: ${Number(auction.startingPrice || 0).toLocaleString()}</span>
            {auction.winner?.name && (
              <span className="font-semibold text-emerald-700">Leader: {auction.winner.name}</span>
            )}
          </div>
        </div>

        <div
          className={`rounded-2xl border p-4 shadow-sm transition ${
            isSoftCloseZone
              ? 'border-amber-400 bg-amber-50/90'
              : 'border-slate-200 bg-slate-50/90'
          }`}
        >
          {auction.status === 'future' && !registrationClosed ? (
            <>
              <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Clock size={14} /> Registration Window
              </div>
              <div className="font-mono text-2xl font-extrabold text-slate-900">{registrationCountdown}</div>
              <p className="mt-1 text-xs text-slate-500">Register before timer ends to join turn queue</p>
            </>
          ) : auction.status === 'future' && roomActivationActive ? (
            <>
              <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
                <Clock size={14} /> Room Activation Handoff
              </div>
              <div className="font-mono text-2xl font-extrabold text-blue-900">{roomActivationCountdown}</div>
            </>
          ) : auction.status === 'ongoing' ? (
            <>
              <div className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <span className={isSoftCloseZone ? 'text-amber-800' : 'text-slate-600'}>
                  {isSoftCloseZone ? '⚡ Anti-Snipe Critical Zone' : 'Turn & Soft-Close Clock'}
                </span>
                <span className="font-mono text-xs text-violet-700">
                  {auction.softCloseExtensionCount || 0} Extensions
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div
                  className={`font-mono text-3xl font-extrabold ${
                    isSoftCloseZone ? 'animate-pulse text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {turnCountdown}
                </div>
                <span className="text-xs font-semibold text-slate-600">
                  Turn: <b className="text-slate-900">{currentTurnBidderName}</b>
                </span>
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full transition-all duration-300 ${
                    isSoftCloseZone
                      ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                      : 'bg-gradient-to-r from-violet-600 to-emerald-500'
                  }`}
                  style={{ width: `${turnProgressPct}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Lifecycle Status
              </div>
              <div className="font-mono text-xl font-extrabold uppercase text-slate-900">
                {auction.status.replaceAll('_', ' ')}
              </div>
              <p className="mt-1 text-xs text-slate-500">Managed by PulseVault Escrow</p>
            </>
          )}
        </div>
      </div>

      {auction.status === 'ongoing' && (
        <div
          className={`mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-xs ${
            isSoftCloseZone
              ? 'border-amber-300 bg-amber-100/90 text-amber-950'
              : 'border-violet-200 bg-violet-50/70 text-violet-900'
          }`}
        >
          <span className="inline-flex items-center gap-1.5 font-semibold">
            {isSoftCloseZone ? <ShieldAlert size={15} className="text-rose-600" /> : <Flame size={15} className="text-amber-600" />}
            {isSoftCloseZone
              ? 'Soft-Close Armed: Any bid placed right now automatically adds +15s to prevent sniping!'
              : 'Soft-Close Anti-Sniping Protection: Bids inside the final 12s extend the turn timer by +15s.'}
          </span>
          <span className="font-mono font-bold">
            Active Duel: {auction.activeBidders?.map((b) => b.name).join(' vs ') || 'Open Arena'}
          </span>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold">
          <Users size={13} className="text-violet-600" /> Registered Collectors: {auction.registrations?.length || 0}
        </span>
        {myRegistration && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 font-mono font-bold text-emerald-800">
            Slot #{myRegistration.sequence}
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold">
          <Radio size={13} className="text-emerald-600" /> Seller: {auction.seller?.name || 'Verified Curator'}
        </span>
      </div>

      {auction.status === 'disapproved' && auction.verificationNote ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <b>Moderation Note:</b> {auction.verificationNote}
        </div>
      ) : null}
    </div>
  );
};

export default AuctionOverviewSection;
