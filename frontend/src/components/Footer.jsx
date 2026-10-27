/**
 * Module: components/Footer.jsx
 * Purpose: Redesigned PulseVault footer with escrow & anti-sniping architecture highlights.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Radio, ShieldCheck, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-violet-950 bg-[#0e091d] text-slate-300">
      <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="absolute -bottom-28 left-6 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-violet-500/25 bg-[#16102c]/85 p-7 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-emerald-500 text-white">
                  <Sparkles size={19} />
                </div>
                <div>
                  <span className="text-xl font-extrabold text-white">PulseVault</span>
                  <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                    FREE EDITION
                  </span>
                </div>
              </Link>

              <p className="max-w-md text-sm leading-relaxed text-slate-300">
                Real-time turn-based & soft-close anti-sniping auction exchange with built-in zero-key escrow settlement and role-based command dashboards.
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
                  <Radio size={12} /> Socket.IO Anti-Snipe Arena
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  <Lock size={12} /> 100% Free Local Escrow Vault
                </span>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-wider text-violet-300">Exchange</h3>
              <div className="grid gap-3 text-sm">
                <Link to="/" className="text-slate-300 hover:text-white">Live Arena</Link>
                <Link to="/about" className="text-slate-300 hover:text-white">Architecture</Link>
                <Link to="/how-it-works" className="text-slate-300 hover:text-white">Soft-Close Rules</Link>
                <Link to="/safety" className="text-slate-300 hover:text-white">Escrow Protection</Link>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-wider text-violet-300">Governance</h3>
              <div className="grid gap-3 text-sm">
                <Link to="/help" className="text-slate-300 hover:text-white">Support Desk</Link>
                <Link to="/terms" className="text-slate-300 hover:text-white">Terms of Exchange</Link>
                <Link to="/privacy" className="text-slate-300 hover:text-white">Data & Privacy</Link>
              </div>
            </div>

            <div className="lg:col-span-3">
              <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-wider text-violet-300">Instant Access</h3>
              <p className="mb-4 text-sm text-slate-300">
                Jump into live rooms with pre-verified collector accounts or register your own identity.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/login" className="btn-premium px-4 py-2 text-sm">Demo Sign In</Link>
                <Link to="/register" className="rounded-xl border border-violet-400/30 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-violet-900/50 pt-6 text-xs text-slate-400 md:flex-row">
          <p className="inline-flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" /> &copy; {new Date().getFullYear()} PulseVault Exchange (AuctionPulse Clone). Zero-Paid-Key Edition.
          </p>
          <p className="font-mono text-[11px] text-violet-300/80">MERN + Socket.IO + Soft-Close Engine</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
