/**
 * Module: features/auctionDetails/components/sections/AuctionActionsPanel.jsx
 * Purpose: Renders Quick-Bid buttons, custom bid input, solo arena simulator, and Free Escrow Checkout controls.
 */
import React from 'react';
import { CheckCircle, Gavel, Hand, Lock, Package, Sparkles, Truck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const QUICK_INCREMENTS = [25, 50, 100, 250];

const AuctionActionsPanel = ({
  auction,
  user,
  canRegister,
  isRegistered,
  registrationClosed,
  roomActivationActive,
  isCurrentRoomActivator,
  roomActivationCountdown,
  canBid,
  bidAmount,
  setBidAmount,
  handleRegister,
  handleOpenAuctionRoom,
  handlePlaceBid,
  handleQuickBid,
  handleSimulateRivalBid,
  isActiveBidder,
  isCurrentTurn,
  canGiveUp,
  handleGiveUp,
  handleConcludeNow,
  isOwner,
  relistAmount,
  setRelistAmount,
  handleNoRegistrationDecision,
  isWinner,
  setIsShippingModalOpen,
  handleConfirmReceived,
}) => (
  <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
    {!user && (
      <div className="flex items-center justify-between rounded-2xl border border-violet-200 bg-violet-50/90 p-4">
        <div className="text-xs text-violet-950">
          <p className="font-bold">Sign in to participate in live bidding or claim a slot</p>
          <p className="mt-0.5 text-violet-700">Use 1-click demo accounts on the Sign In screen to test immediately.</p>
        </div>
        <Link to="/login" className="btn-premium shrink-0 px-4 py-2 text-xs">
          Demo Sign In
        </Link>
      </div>
    )}

    {canRegister && (
      <button
        onClick={handleRegister}
        className="btn-premium w-full py-3.5 text-sm shadow-lg"
      >
        <Sparkles size={16} /> Claim Pre-Auction Registration Slot
      </button>
    )}

    {auction.status === 'future' && isRegistered && (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-900">
        ✓ You are registered for this lot. You will be notified when the live room opens.
      </div>
    )}

    {auction.status === 'future' && registrationClosed && roomActivationActive && isCurrentRoomActivator && (
      <div className="space-y-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
        <p className="text-xs text-violet-950">
          It is your priority window to open the live auction room for all participants. Window expires in{' '}
          <b className="font-mono">{roomActivationCountdown}</b>.
        </p>
        <button
          onClick={handleOpenAuctionRoom}
          className="btn-premium w-full py-3 text-sm"
        >
          Open Live Auction Room
        </button>
      </div>
    )}

    {auction.status === 'future' && registrationClosed && roomActivationActive && !isCurrentRoomActivator && isRegistered && (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
        Waiting for Participant #{auction.roomActivation?.currentSequence} to activate the room ({roomActivationCountdown}).
      </div>
    )}

    {auction.status === 'ongoing' && canBid && (
      <div className="space-y-3 rounded-2xl border border-violet-200 bg-violet-50/40 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-900">
            Quick-Fire Increments
          </span>
          <span className="font-mono text-[11px] font-semibold text-emerald-700">
            {isCurrentTurn ? '● Your Active Turn' : '● Instant Bid Ready'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {QUICK_INCREMENTS.map((inc) => (
            <button
              key={inc}
              type="button"
              onClick={() => handleQuickBid?.(inc)}
              className="rounded-xl border border-violet-300 bg-white py-2 font-mono text-xs font-bold text-violet-800 shadow-sm transition hover:border-violet-600 hover:bg-violet-600 hover:text-white"
            >
              +${inc}
            </button>
          ))}
        </div>

        <form onSubmit={handlePlaceBid} className="flex gap-2.5">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-3 font-mono text-sm font-bold text-slate-400">$</span>
            <input
              type="number"
              value={bidAmount}
              onChange={(event) => setBidAmount(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-8 pr-3 font-mono text-sm font-bold"
              min={auction.currentPrice + 1}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-premium px-6 py-2.5 text-sm"
          >
            <Gavel size={16} /> Place Offer
          </button>
        </form>

        {/* Interactive Arena Testing Toolbar for Solo / Demo Users */}
        <div className="mt-2 rounded-xl border border-dashed border-violet-300 bg-white/85 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase text-violet-800">
              <Zap size={12} className="text-amber-500" /> Live Arena Sandbox Controls
            </span>
            <span className="text-[11px] text-slate-500">Test Soft-Close & Escrow Solo</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={handleSimulateRivalBid}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100"
            >
              <Zap size={13} /> Simulate Rival Bid (+$50)
            </button>

            <button
              type="button"
              onClick={handleConcludeNow}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100"
            >
              <Gavel size={13} /> Hammer & Test Escrow
            </button>

            {canGiveUp && (
              <button
                type="button"
                onClick={handleGiveUp}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 hover:bg-rose-100"
              >
                <Hand size={13} /> Pass / Give Up
              </button>
            )}
          </div>
        </div>
      </div>
    )}

    {auction.status === 'ongoing' && isActiveBidder && !canBid && !isCurrentTurn && (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
        Waiting for opponent turn clock ({auction.turnDurationSeconds || 25}s window).
      </div>
    )}

    {auction.status === 'no_registrations' && isOwner && (
      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-semibold text-amber-900">
          No participant registrations recorded. Choose seller resolution:
        </p>
        <button
          onClick={() => handleNoRegistrationDecision('withdraw')}
          className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white"
        >
          Withdraw Lot ($9.99 fee)
        </button>
        <div className="flex gap-2">
          <input
            type="number"
            value={relistAmount}
            min={1}
            onChange={(event) => setRelistAmount(event.target.value)}
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm"
            placeholder="Reduced reserve price"
          />
          <button
            onClick={() => handleNoRegistrationDecision('relist')}
            className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white"
          >
            Relist ($14.99)
          </button>
        </div>
      </div>
    )}

    {auction.status === 'closed' ? (
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-violet-950 to-emerald-950 p-6 text-center text-white shadow-lg">
        <CheckCircle className="mx-auto mb-2 h-9 w-9 text-emerald-400" />
        <h3 className="text-lg font-bold">Escrow Lifecycle Complete</h3>
        <p className="mt-1 text-xs text-slate-300">
          Buyer confirmed delivery receipt and net proceeds have been released from the vault.
        </p>
      </div>
    ) : auction.status === 'paid_shipping_pending' || auction.status === 'paid_held_in_escrow' ? (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50/90 p-5 text-center">
        <Package className="mx-auto mb-2 h-8 w-8 text-emerald-700" />
        <h3 className="text-base font-bold text-emerald-950">
          Escrow Funded • Managed Shipping in Transit
        </h3>
        <p className="mb-3 mt-1 text-xs text-emerald-800">
          ${Number(auction.currentPrice || 0).toLocaleString()} is locked in PulseVault Escrow. Estimated delivery: 7–14 days.
        </p>
        {isWinner ? (
          <button
            onClick={handleConfirmReceived}
            className="btn-premium w-full py-3 text-sm"
          >
            Confirm Product Received & Release Escrow Payout
          </button>
        ) : (
          <p className="font-mono text-xs font-bold text-emerald-700">
            Waiting for Winner ({auction.winner?.name || 'Buyer'}) to confirm delivery receipt.
          </p>
        )}
      </div>
    ) : auction.status === 'completed' ? (
      isWinner ? (
        <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-violet-50 p-5 text-center shadow-sm">
          <div className="mx-auto mb-2 inline-flex rounded-full bg-emerald-100 p-2 text-emerald-700">
            <Lock size={20} />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">
            Congratulations! You Won This Lot (${Number(auction.currentPrice).toLocaleString()})
          </h3>
          <p className="mb-4 mt-1 text-xs text-slate-600">
            Complete the zero-key Free Escrow Deposit to initiate insured shipping. Funds stay in escrow until you confirm receipt.
          </p>
          <button
            onClick={() => setIsShippingModalOpen(true)}
            className="btn-premium flex w-full items-center justify-center gap-2 py-3.5 text-sm"
          >
            <Truck size={18} /> Proceed to Free Escrow Checkout
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-600">
          Auction won by <b className="text-slate-900">{auction.winner?.name || 'Collector'}</b> at{' '}
          <b className="font-mono text-bid-purple">${Number(auction.currentPrice).toLocaleString()}</b>. Awaiting winner escrow settlement.
        </div>
      )
    ) : null}
  </div>
);

export default AuctionActionsPanel;
