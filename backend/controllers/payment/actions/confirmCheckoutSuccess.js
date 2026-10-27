/**
 * Module: backend/controllers/payment/actions/confirmCheckoutSuccess.js
 * Purpose: Confirms escrow deposit completion and transitions order to managed shipping.
 */
const stripeLib = require('stripe');
const Auction = require('../../../models/Auction');
const {
  calculatePaymentSplit,
  queuePaymentSuccessEmails,
  emitRealtimeNotification,
} = require('../paymentHelpers');

const isFreeEscrowSession = (sessionId) =>
  process.env.FREE_ESCROW_MODE === 'true' ||
  !process.env.STRIPE_SECRET_KEY ||
  String(sessionId || '').startsWith('escrow_sess_');

const confirmCheckoutSuccess = async (req, res) => {
  try {
    const { sessionId, auctionId } = req.body || {};
    if (!sessionId || !auctionId) {
      return res.status(400).json({ message: 'sessionId and auctionId are required' });
    }

    const auction = await Auction.findById(auctionId).populate('seller', 'email stripeAccountId');
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (!auction.winner) return res.status(400).json({ message: 'Winner not found for this auction' });
    if (auction.winner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the winner can confirm this payment' });
    }
    if (auction.payment?.status === 'paid' || ['paid_shipping_pending', 'closed'].includes(auction.status)) {
      return res.status(200).json({ message: 'Payment already confirmed', auctionStatus: auction.status });
    }

    let resolvedPaymentIntentId = `escrow_pi_${Date.now()}`;

    if (!isFreeEscrowSession(sessionId)) {
      const stripe = stripeLib(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Payment session not found' });
      }
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ message: 'Payment is not completed yet for this session' });
      }
      resolvedPaymentIntentId = String(session.payment_intent || '');
    }

    const { totalAmount, commission, sellerPayout } = calculatePaymentSplit(auction.currentPrice);

    auction.status = 'paid_shipping_pending';
    auction.payment = {
      ...auction.payment,
      status: 'paid',
      amount: totalAmount,
      stripeSessionId: sessionId || auction.payment?.stripeSessionId || '',
      stripePaymentIntentId: resolvedPaymentIntentId,
      paidAt: new Date(),
      lastFailureReason: '',
      lastFailureAt: null,
      sellerPayoutAmount: sellerPayout,
      commissionAmount: commission,
      payoutStatus: 'completed',
      payoutAt: new Date(),
    };
    auction.shipping = {
      ...auction.shipping,
      status: 'in_transit',
      expectedMinDays: 7,
      expectedMaxDays: 14,
      paidAt: new Date(),
    };
    await auction.save();

    queuePaymentSuccessEmails({
      winnerEmail: req.user?.email,
      sellerEmail: auction.seller?.email,
      title: auction.title,
      totalAmount,
      sellerPayout,
      commission,
      auctionId: auction._id,
    });

    emitRealtimeNotification(
      req,
      {
        type: 'success',
        title: 'Escrow Deposit Confirmed',
        message: `Escrow funded ($${totalAmount}) for "${auction.title}". Managed shipping is now in progress.`,
        auctionId: auction._id.toString(),
      },
      {
        userIds: [req.user.id, auction.seller?._id || auction.seller],
        includeAdmins: true,
      }
    );

    return res.status(200).json({
      message: 'Escrow payment confirmed! Managed fulfillment is now active.',
      auctionStatus: auction.status,
      escrowBreakdown: {
        totalAmount,
        commission,
        sellerPayout,
      },
    });
  } catch (error) {
    console.error('CONFIRM CHECKOUT SUCCESS ERROR:', error.message);
    return res.status(500).json({ message: error.message || 'Failed to confirm payment success' });
  }
};

module.exports = confirmCheckoutSuccess;
