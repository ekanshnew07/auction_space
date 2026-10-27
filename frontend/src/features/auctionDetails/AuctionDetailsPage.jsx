/**
 * Module: features/auctionDetails/AuctionDetailsPage.jsx
 * Purpose: Renders the redesigned PulseVault Live Bidding Arena and Escrow Vault Breakdown.
 */
import React, { useMemo } from 'react';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { getAuctionImage, handleAuctionImageError } from '../../utils/imageUrl';
import AuctionActionsPanel from './components/sections/AuctionActionsPanel';
import AuctionHistorySection from './components/sections/AuctionHistorySection';
import AuctionOverviewSection from './components/sections/AuctionOverviewSection';
import ShippingDetailsModal from './components/ShippingDetailsModal';
import { deriveAuctionViewState } from './deriveAuctionViewState';
import {
  formatRegistrationCountdown,
  formatRoomActivationCountdown,
  formatTurnCountdown,
} from './formatters';
import { useAuctionDetails } from './useAuctionDetails';

const AuctionDetailsPage = () => {
  const { id } = useParams();
  const {
    user,
    auction,
    loading,
    bidAmount,
    setBidAmount,
    isShippingModalOpen,
    setIsShippingModalOpen,
    relistAmount,
    setRelistAmount,
    shippingDetails,
    setShippingDetails,
    registrationRemainingMs,
    turnRemainingMs,
    roomActivationRemainingMs,
    handleRegister,
    handleOpenAuctionRoom,
    handlePlaceBid,
    handleQuickBid,
    handleSimulateRivalBid,
    handleGiveUp,
    handleConcludeNow,
    handleNoRegistrationDecision,
    handlePayment,
    handleConfirmReceived,
  } = useAuctionDetails(id);

  const registrationCountdown = useMemo(
    () => formatRegistrationCountdown(registrationRemainingMs),
    [registrationRemainingMs]
  );
  const turnCountdown = useMemo(
    () => formatTurnCountdown(turnRemainingMs),
    [turnRemainingMs]
  );
  const roomActivationCountdown = useMemo(
    () => formatRoomActivationCountdown(roomActivationRemainingMs),
    [roomActivationRemainingMs]
  );

  if (loading) return <div className="p-12 text-center font-mono text-sm text-slate-600">Loading Live Arena Telemetry...</div>;
  if (!auction) return <div className="p-12 text-center font-bold text-slate-700">Lot Not Found</div>;

  const viewState = deriveAuctionViewState({
    auction,
    user,
    registrationRemainingMs,
    turnRemainingMs,
  });

  const grossAmount = Number(auction.currentPrice || 0);
  const escrowFee = Number((grossAmount * 0.05).toFixed(2));
  const netSellerPayout = Number((grossAmount - escrowFee).toFixed(2));

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-violet-400 hover:text-bid-purple"
        >
          <ArrowLeft size={16} /> Back to Exchange
        </Link>

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800">
          <ShieldCheck size={14} /> Zero-Key Escrow & Soft-Close Active
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-5">
          <div className="surface-card relative overflow-hidden rounded-3xl">
            <div className="relative h-80 bg-slate-900 sm:h-96">
              <img
                src={getAuctionImage(auction.images)}
                alt={auction.title}
                onError={handleAuctionImageError}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-4 top-4 rounded-xl bg-black/65 px-3 py-1.5 font-mono text-xs font-bold uppercase text-white backdrop-blur-md">
                LOT #{String(auction._id).slice(-6).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Escrow Vault Transparency Card */}
          <div className="surface-card rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
                <Lock size={14} className="text-emerald-600" /> Escrow Settlement Breakdown
              </span>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                BUILT-IN VAULT
              </span>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Current Hammer / Offer Valuation</span>
                <span className="font-mono font-bold text-slate-900">${grossAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Escrow & Transit Fee (5%)</span>
                <span className="font-mono font-semibold text-amber-700">-${escrowFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 font-bold text-emerald-800">
                <span>Net Seller Payout (Released on Receipt)</span>
                <span className="font-mono">${netSellerPayout.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card flex flex-col justify-between rounded-3xl p-6 sm:p-8 lg:col-span-7">
          <div>
            <AuctionOverviewSection
              auction={auction}
              myRegistration={viewState.myRegistration}
              registrationClosed={viewState.registrationClosed}
              registrationCountdown={registrationCountdown}
              roomActivationActive={viewState.roomActivationActive}
              roomActivationCountdown={roomActivationCountdown}
              turnCountdown={turnCountdown}
              turnRemainingMs={turnRemainingMs}
              isSoftCloseZone={viewState.isSoftCloseZone}
            />
            <AuctionHistorySection auction={auction} />
          </div>

          <AuctionActionsPanel
            auction={auction}
            user={user}
            canRegister={viewState.canRegister}
            isRegistered={viewState.isRegistered}
            registrationClosed={viewState.registrationClosed}
            roomActivationActive={viewState.roomActivationActive}
            isCurrentRoomActivator={viewState.isCurrentRoomActivator}
            roomActivationCountdown={roomActivationCountdown}
            canBid={viewState.canBid}
            bidAmount={bidAmount}
            setBidAmount={setBidAmount}
            handleRegister={handleRegister}
            handleOpenAuctionRoom={handleOpenAuctionRoom}
            handlePlaceBid={handlePlaceBid}
            handleQuickBid={handleQuickBid}
            handleSimulateRivalBid={handleSimulateRivalBid}
            isActiveBidder={viewState.isActiveBidder}
            isCurrentTurn={viewState.isCurrentTurn}
            canGiveUp={viewState.canGiveUp}
            handleGiveUp={handleGiveUp}
            handleConcludeNow={handleConcludeNow}
            isOwner={viewState.isOwner}
            relistAmount={relistAmount}
            setRelistAmount={setRelistAmount}
            handleNoRegistrationDecision={handleNoRegistrationDecision}
            isWinner={viewState.isWinner}
            setIsShippingModalOpen={setIsShippingModalOpen}
            handleConfirmReceived={handleConfirmReceived}
          />
        </div>
      </div>

      {isShippingModalOpen && (
        <ShippingDetailsModal
          shippingDetails={shippingDetails}
          onChange={(key, value) => setShippingDetails((prev) => ({ ...prev, [key]: value }))}
          onClose={() => setIsShippingModalOpen(false)}
          onSubmit={handlePayment}
        />
      )}
    </div>
  );
};

export default AuctionDetailsPage;
