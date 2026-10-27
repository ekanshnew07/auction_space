/**
 * Module: backend/controllers/payment/actions/createCheckoutSession.js
 * Purpose: Creates an Escrow Checkout Session (Free Built-In Escrow Gateway or optional Stripe).
 */
const stripeLib = require('stripe');
const Auction = require('../../../models/Auction');
const { emitRealtimeNotification } = require('../paymentHelpers');

const isFreeEscrowMode = () =>
  process.env.FREE_ESCROW_MODE === 'true' || !process.env.STRIPE_SECRET_KEY;

const createCheckoutSession = async (req, res) => {
  const { shippingAddress } = req.body;

  try {
    const auction = await Auction.findById(req.params.auctionId);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (!auction.winner) return res.status(400).json({ message: 'Winner not found for this auction' });
    if (auction.winner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the winner can pay for this auction' });
    }
    if (auction.status === 'paid_shipping_pending' || auction.status === 'closed' || auction.payment?.status === 'paid') {
      return res.status(400).json({ message: 'Payment has already been completed for this auction' });
    }
    if (auction.status !== 'completed') {
      return res.status(400).json({ message: 'Payment is only available after the auction is completed' });
    }

    if (shippingAddress) {
      auction.shippingDetails = shippingAddress;
    }

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

    // Free Built-In Escrow Checkout Mode (zero external paid keys required)
    if (isFreeEscrowMode()) {
      const sessionId = `escrow_sess_${auction._id}_${Date.now()}`;
      const redirectUrl = `${clientUrl}/payment/success?session_id=${sessionId}&auction_id=${auction._id}&mode=free_escrow`;

      auction.payment = {
        ...auction.payment,
        status: 'checkout_created',
        amount: auction.currentPrice,
        stripeSessionId: sessionId,
        lastFailureReason: '',
        lastFailureAt: null,
      };
      await auction.save();

      emitRealtimeNotification(
        req,
        {
          type: 'info',
          title: 'Escrow Checkout Initiated',
          message: `Escrow deposit session started for "${auction.title}"`,
          auctionId: auction._id.toString(),
        },
        {
          userIds: [req.user.id],
          includeAdmins: true,
        }
      );

      return res.status(200).json({ id: sessionId, url: redirectUrl, mode: 'free_escrow' });
    }

    // Optional Stripe fallback if someone configures a live/test Stripe key
    const stripe = stripeLib(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: auction.title,
              description: auction.description ? auction.description.substring(0, 400) : 'Auction Item',
            },
            unit_amount: Math.round(auction.currentPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        metadata: {
          auctionId: auction._id.toString(),
          winnerId: req.user.id.toString(),
        },
      },
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&auction_id=${auction._id}`,
      cancel_url: `${clientUrl}/auction/${auction._id}`,
      metadata: {
        auctionId: auction._id.toString(),
        winnerId: req.user.id.toString(),
        sellerId: auction.seller.toString(),
      },
    });

    auction.payment = {
      ...auction.payment,
      status: 'checkout_created',
      amount: auction.currentPrice,
      stripeSessionId: session.id,
      lastFailureReason: '',
      lastFailureAt: null,
    };
    await auction.save();

    emitRealtimeNotification(
      req,
      {
        type: 'info',
        title: 'Payment Session Created',
        message: `Checkout started for "${auction.title}"`,
        auctionId: auction._id.toString(),
      },
      {
        userIds: [req.user.id],
        includeAdmins: true,
      }
    );

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout Error:', error.message);
    return res.status(500).json({ message: error.message || 'Payment Processing Failed' });
  }
};

module.exports = createCheckoutSession;
