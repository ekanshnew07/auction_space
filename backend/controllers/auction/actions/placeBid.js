/**
 * Module: backend/controllers/auction/actions/placeBid.js
 * Purpose: Implements live turn-based & soft-close anti-sniping bidding.
 */
const Auction = require('../../../models/Auction');
const User = require('../../../models/User');
const { startTurnClock } = require('../helpers');
const { emitAuctionUpdate, populateAuctionDetails } = require('../viewHelpers');

const SOFT_CLOSE_CRITICAL_WINDOW_MS = 12 * 1000;
const SOFT_CLOSE_BONUS_SECONDS = 15;

const placeBid = async (req, res) => {
  try {
    if (!req.user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your profile before placing bids.' });
    }

    const amount = Number(req.body.amount);
    const simulateRival = Boolean(req.body.simulateRival);
    if (Number.isNaN(amount)) {
      return res.status(400).json({ message: 'Invalid bid amount' });
    }

    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    if (auction.status !== 'ongoing') {
      return res.status(400).json({ message: 'Bidding is not active for this listing' });
    }
    if (!simulateRival && String(auction.seller) === req.user.id) {
      return res.status(400).json({ message: 'Seller can spectate but cannot bid on their own listing' });
    }

    // Determine effective bidder ID (either current user or a rival participant for solo arena testing)
    let effectiveBidderId = req.user.id;
    if (simulateRival) {
      const rivalInActive = auction.activeBidders.find((id) => String(id) !== req.user.id);
      if (rivalInActive) {
        effectiveBidderId = String(rivalInActive);
      } else {
        const fallbackRival = await User.findOne({
          _id: { $nin: [req.user.id, auction.seller] },
          role: 'user',
        }).select('_id');
        if (fallbackRival) {
          effectiveBidderId = String(fallbackRival._id);
          if (!auction.activeBidders.some((id) => String(id) === effectiveBidderId)) {
            auction.activeBidders.push(fallbackRival._id);
          }
        }
      }
    } else {
      // Auto-enroll verified user into the live arena if slots are open or if they are registered
      const isAlreadyActive = auction.activeBidders.some((bidderId) => String(bidderId) === req.user.id);
      if (!isAlreadyActive) {
        const isRegistered = auction.registrations.some((r) => String(r.bidder) === req.user.id);
        if (!isRegistered) {
          auction.registrations.push({
            bidder: req.user.id,
            sequence: auction.registrations.length + 1,
            registeredAt: new Date(),
          });
        }
        if (auction.activeBidders.length < 2) {
          auction.activeBidders.push(req.user.id);
        } else {
          // Swap into active arena so the user can bid immediately
          auction.activeBidders[1] = req.user.id;
        }
      }
    }

    if (amount <= auction.currentPrice) {
      return res.status(400).json({ message: 'Bid must be higher than current price' });
    }

    // Check Soft-Close Anti-Sniping trigger (bid placed inside final 12s of clock)
    const nowMs = Date.now();
    const expiresMs = auction.turnExpiresAt ? new Date(auction.turnExpiresAt).getTime() : 0;
    const remainingMs = Math.max(expiresMs - nowMs, 0);
    const softCloseTriggered = remainingMs > 0 && remainingMs <= SOFT_CLOSE_CRITICAL_WINDOW_MS;

    if (softCloseTriggered) {
      auction.softCloseExtensionCount = (auction.softCloseExtensionCount || 0) + 1;
      auction.lastSoftCloseAt = new Date();
    }

    auction.bids.push({
      bidder: effectiveBidderId,
      amount,
      time: Date.now(),
      softCloseTriggered,
    });
    auction.currentPrice = amount;
    auction.winner = effectiveBidderId;

    const nextTurnBidder =
      auction.activeBidders.find((bidderId) => String(bidderId) !== String(effectiveBidderId)) ||
      effectiveBidderId;

    startTurnClock(
      auction,
      nextTurnBidder,
      softCloseTriggered ? SOFT_CLOSE_BONUS_SECONDS : 0
    );

    await auction.save();

    const updatedAuction = await populateAuctionDetails(
      Auction.findById(req.params.id)
        .populate('seller', 'name')
        .populate('winner', 'name')
        .populate('bids.bidder', 'name')
        .populate('activeBidders', 'name')
        .populate('waitingBidders', 'name')
    );

    await emitAuctionUpdate(req, req.params.id, updatedAuction);
    return res.status(200).json(updatedAuction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = placeBid;
