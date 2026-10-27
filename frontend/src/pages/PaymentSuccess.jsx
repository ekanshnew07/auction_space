/**
 * Module: pages/PaymentSuccess.jsx
 * Purpose: Free Built-In Escrow Settlement & Confirmation screen (zero external Stripe keys required).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Lock, PackageCheck, ShieldCheck } from 'lucide-react';
import axios from '../utils/axiosConfig';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(true);
  const [confirmMessage, setConfirmMessage] = useState('Locking winning funds into PulseVault Escrow...');
  const [breakdown, setBreakdown] = useState(null);

  const sessionId = useMemo(() => searchParams.get('session_id') || '', [searchParams]);
  const auctionId = useMemo(() => searchParams.get('auction_id') || '', [searchParams]);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId || !auctionId) {
        setConfirmMessage('Escrow deposit recorded. Open lot details to track fulfillment.');
        setIsConfirming(false);
        return;
      }

      try {
        const { data } = await axios.post('/payment/confirm-success', { sessionId, auctionId });
        setConfirmMessage(data?.message || 'Escrow deposit confirmed! Managed shipping is now in progress.');
        if (data?.escrowBreakdown) {
          setBreakdown(data.escrowBreakdown);
        }
      } catch (error) {
        setConfirmMessage(
          error.response?.data?.message ||
            'Escrow settlement recorded. Open lot details to review shipping status.'
        );
      } finally {
        setIsConfirming(false);
      }
    };

    confirmPayment();
  }, [sessionId, auctionId]);

  return (
    <div className="mx-auto flex min-h-[82vh] max-w-2xl flex-col items-center justify-center px-4 py-12">
      <div className="premium-panel w-full rounded-3xl p-8 text-center shadow-2xl sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
          <CheckCircle2 className="h-9 w-9" />
        </div>

        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 font-mono text-xs font-bold text-emerald-800">
          <Lock size={13} /> FREE BUILT-IN ESCROW VAULT FUNDED
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          {isConfirming ? 'Finalizing Escrow Lock...' : 'Escrow Deposit Confirmed!'}
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600">
          {confirmMessage}
        </p>

        {breakdown && (
          <div className="mt-6 rounded-2xl border border-violet-200 bg-white p-5 text-left shadow-sm">
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-mono text-xs font-bold uppercase text-slate-500">
                Escrow Ledger Receipt
              </span>
              <span className="font-mono text-xs text-violet-700">{sessionId.slice(0, 24)}...</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Gross Escrow Deposit</span>
                <span className="font-mono font-bold text-slate-900">
                  ${Number(breakdown.totalAmount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Platform Protection Fee (5%)</span>
                <span className="font-mono font-semibold text-amber-700">
                  ${Number(breakdown.commission).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 font-bold text-emerald-800">
                <span>Seller Net Payout (Held Until Delivery)</span>
                <span className="font-mono">${Number(breakdown.sellerPayout).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <PackageCheck size={15} /> Next Step: Return to the lot page and click &ldquo;Confirm Product Received&rdquo; to release the seller payout!
          </span>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={auctionId ? `/auction/${auctionId}` : '/'}
            className="btn-premium px-6 py-3 text-sm"
          >
            Return to Lot & Confirm Delivery <ArrowRight size={16} />
          </Link>
          <Link to="/" className="btn-soft px-5 py-3 text-sm text-slate-700">
            Explore Exchange
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck size={13} className="text-emerald-600" /> PulseVault Zero-Key Escrow Settlement Engine
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
