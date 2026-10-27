/**
 * Module: components/cards/AuctionCard.jsx
 * Purpose: Renders a redesigned PulseVault lot card with live soft-close and escrow badges.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Flame, Gavel, ShieldCheck, Star, Users } from 'lucide-react';
import { getAuctionImage, handleAuctionImageError } from '../../utils/imageUrl';

const AuctionCard = ({ auction, watched = false, onToggleWatch, onRegister, userId }) => {
  const statusLabelMap = {
    pending_verification: 'Pending Review',
    future: 'Registration Open',
    ongoing: 'Live Arena',
    completed: 'Awaiting Escrow',
    paid_shipping_pending: 'In Escrow Transit',
    paid_held_in_escrow: 'Held in Escrow',
    closed: 'Vault Closed',
    no_registrations: 'No Registrations',
    withdrawn: 'Withdrawn',
    disapproved: 'Disapproved',
  };

  const isFuture = auction.status === 'future';
  const isOngoing = auction.status === 'ongoing';
  const isSeller = String(auction.seller?._id || auction.seller) === String(userId);
  const alreadyRegistered = auction.registrations?.some(
    (entry) => String(entry.bidder?._id || entry.bidder) === String(userId)
  );
  const [timeNow, setTimeNow] = useState(Date.now());

  useEffect(() => {
    if (!isFuture && !isOngoing) return undefined;
    const timer = window.setInterval(() => setTimeNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isFuture, isOngoing]);

  const registrationCountdown = useMemo(() => {
    if (!isFuture || !auction.registrationEndAt) return '';
    const remainingMs = Math.max(new Date(auction.registrationEndAt).getTime() - timeNow, 0);
    const totalSeconds = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  }, [auction.registrationEndAt, isFuture, timeNow]);

  const turnRemainingSec = useMemo(() => {
    if (!isOngoing || !auction.turnExpiresAt) return 0;
    return Math.max(Math.ceil((new Date(auction.turnExpiresAt).getTime() - timeNow) / 1000), 0);
  }, [auction.turnExpiresAt, isOngoing, timeNow]);

  return (
    <div className="surface-card hover-lift group flex h-full flex-col justify-between overflow-hidden rounded-2xl">
      <div>
        <div className="relative h-48 overflow-hidden bg-slate-900">
          <img
            src={getAuctionImage(auction.images)}
            alt={auction.title}
            onError={handleAuctionImageError}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />

          <div className="absolute left-3 top-3 rounded-lg border border-white/25 bg-black/55 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
            {auction.category}
          </div>

          <div
            className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow ${
              isOngoing
                ? 'bg-rose-600'
                : isFuture
                ? 'bg-violet-700'
                : 'bg-slate-900/90'
            }`}
          >
            {isOngoing && <span className="h-2 w-2 animate-ping rounded-full bg-white" />}
            {statusLabelMap[auction.status] || auction.status}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              if (onToggleWatch) onToggleWatch(auction._id);
            }}
            className={`absolute bottom-3 right-3 rounded-full border p-2 shadow-sm transition ${
              watched
                ? 'border-amber-300 bg-amber-300 text-slate-950'
                : 'border-white/40 bg-black/50 text-white hover:bg-white hover:text-slate-900'
            }`}
            title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
            type="button"
          >
            <Star size={14} fill={watched ? 'currentColor' : 'none'} />
          </button>

          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/90 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
              <ShieldCheck size={11} /> ESCROW
            </span>
            {auction.softCloseExtensionCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/90 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-950">
                <Flame size={11} /> +{auction.softCloseExtensionCount} ANTI-SNIPE
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3 p-4">
          <h3 className="line-clamp-1 text-base font-bold text-slate-900" title={auction.title}>
            {auction.title}
          </h3>

          <div className="flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50/55 px-3 py-2">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {isOngoing ? 'Current Live Bid' : 'Current Valuation'}
              </div>
              <div className="font-mono text-lg font-extrabold text-bid-purple">
                ${Number(auction.currentPrice || 0).toLocaleString()}
              </div>
            </div>

            <div className="text-right">
              {isOngoing ? (
                <div className="inline-flex flex-col items-end">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600">
                    Turn Clock
                  </span>
                  <span className="font-mono text-sm font-bold text-rose-700">
                    {turnRemainingSec}s left
                  </span>
                </div>
              ) : isFuture && registrationCountdown ? (
                <div className="inline-flex flex-col items-end">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Closes In
                  </span>
                  <span className="font-mono text-xs font-bold text-violet-800">
                    {registrationCountdown}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 font-mono text-xs text-slate-600">
                  <Clock size={12} />
                  {new Date(auction.registrationEndAt || auction.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 font-medium">
              <Users size={13} className="text-violet-600" /> {auction.registrations?.length || 0} Registered
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-slate-700">
              <Gavel size={12} className="text-emerald-600" /> {auction.bids?.length || 0} Bids
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 px-4 pb-4 pt-3">
        <Link to={`/auction/${auction._id}`} className="btn-secondary w-full py-2 text-xs">
          {isOngoing ? 'Enter Arena' : 'Inspect Lot'}
        </Link>

        {isFuture ? (
          <button
            disabled={!onRegister || !userId || isSeller || alreadyRegistered}
            onClick={() => onRegister?.(auction._id)}
            className="btn-premium w-full py-2 text-xs disabled:opacity-55"
            type="button"
          >
            {alreadyRegistered ? 'Slot Claimed' : 'Claim Slot'}
          </button>
        ) : (
          <Link to={`/auction/${auction._id}`} className="btn-premium w-full py-2 text-xs">
            {isOngoing ? 'Bid Live' : 'View Status'}
          </Link>
        )}
      </div>
    </div>
  );
};

export default AuctionCard;
