/**
 * Module: features/auctionDetails/components/sections/AuctionHistorySection.jsx
 * Purpose: Renders the live Socket.IO bid pulse feed with Soft-Close Anti-Snipe badges.
 */
import React from 'react';
import { Flame, Gavel } from 'lucide-react';

const AuctionHistorySection = ({ auction }) => (
  <div className="mb-5">
    <div className="mb-2 flex items-center justify-between">
      <h3 className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-slate-700">
        <Gavel size={14} className="text-bid-purple" /> Live Offer Ledger ({auction.bids?.length || 0})
      </h3>
      <span className="font-mono text-[11px] text-slate-400">Real-Time Socket Feed</span>
    </div>

    <div className="max-h-48 space-y-2 overflow-y-auto rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
      {auction.bids?.length > 0 ? (
        [...auction.bids].reverse().map((bid, index) => (
          <div
            key={index}
            className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
              index === 0
                ? 'border-violet-300 bg-white font-semibold shadow-sm'
                : 'border-slate-200/60 bg-white/70 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-bold ${
                  index === 0 ? 'bg-violet-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {auction.bids.length - index}
              </span>
              <div>
                <span className="font-bold text-slate-900">{bid.bidder?.name || 'Verified Collector'}</span>
                {bid.time && (
                  <span className="ml-2 font-mono text-[11px] text-slate-400">
                    {new Date(bid.time).toLocaleTimeString()}
                  </span>
                )}
              </div>
              {bid.softCloseTriggered && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-900">
                  <Flame size={10} /> +15s ANTI-SNIPE
                </span>
              )}
            </div>

            <span className="font-mono text-base font-extrabold text-bid-purple">
              ${Number(bid.amount).toLocaleString()}
            </span>
          </div>
        ))
      ) : (
        <p className="py-4 text-center text-xs text-slate-400">
          No offers recorded yet. Place the opening offer to ignite the turn clock!
        </p>
      )}
    </div>
  </div>
);

export default AuctionHistorySection;
