/**
 * Module: features/auctionDetails/deriveAuctionViewState.js
 * Purpose: Computes derived view state for the Live Bidding Arena and Escrow lifecycle.
 */
export const deriveAuctionViewState = ({
  auction,
  user,
  registrationRemainingMs,
  turnRemainingMs = 0,
}) => {
  const sellerId = auction.seller?._id || auction.seller;
  const winnerId = auction.winner?._id || auction.winner;
  const userId = String(user?._id || '');
  const isOwner = Boolean(user && String(sellerId) === userId);
  const isWinner = Boolean(user && String(winnerId) === userId);

  const myRegistration = auction.registrations?.find(
    (entry) => String(entry.bidder?._id || entry.bidder) === userId
  );
  const currentRoomActivatorId = String(
    auction.roomActivation?.currentBidder?._id || auction.roomActivation?.currentBidder || ''
  );
  const isRegistered = Boolean(myRegistration);
  const isActiveBidder = Boolean(
    auction.activeBidders?.some((bidder) => String(bidder?._id || bidder) === userId)
  );
  const isCurrentTurn =
    !auction.currentTurnBidder ||
    String(auction.currentTurnBidder?._id || auction.currentTurnBidder) === userId;
  const registrationClosed = auction.status === 'future' && registrationRemainingMs === 0;
  const roomActivationActive = Boolean(auction.roomActivation?.isActive && currentRoomActivatorId);
  const isCurrentRoomActivator = roomActivationActive && currentRoomActivatorId === userId;
  const isSoftCloseZone = auction.status === 'ongoing' && turnRemainingMs > 0 && turnRemainingMs <= 12000;

  return {
    isOwner,
    isWinner,
    myRegistration,
    isRegistered,
    isActiveBidder,
    isCurrentTurn,
    registrationClosed,
    roomActivationActive,
    isCurrentRoomActivator,
    isSoftCloseZone,
    canRegister: Boolean(
      user && auction.status === 'future' && registrationRemainingMs > 0 && !isOwner && !isRegistered
    ),
    // Verified non-seller users can bid in the live arena (auto-enrolled on bid)
    canBid: Boolean(user && auction.status === 'ongoing' && !isOwner && user.emailVerified),
    canGiveUp: Boolean(user && auction.status === 'ongoing' && isActiveBidder),
  };
};
