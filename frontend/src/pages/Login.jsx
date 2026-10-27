/**
 * Module: pages/Login.jsx
 * Purpose: Redesigned PulseVault Sign-In page with 1-Click Demo Account Switcher & zero-key verification.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login, reset } from '../redux/authSlice';
import { Mail, Lock, LogIn, ArrowRight, Zap, ShieldCheck, Gavel, Store } from 'lucide-react';
import Reveal from '../components/ui/Reveal';
import TurnstileWidget from '../components/ui/TurnstileWidget';

const DEMO_ACCOUNTS = [
  {
    label: 'Alex Vance (Bidder & Winner)',
    roleBadge: 'BIDDER / WINNER',
    email: 'alex@bidpulse.io',
    password: 'Password@123',
    icon: Gavel,
    desc: 'Pre-verified collector • Can bid live & test Winner Escrow Checkout',
  },
  {
    label: 'Maya Lin (Curator Seller)',
    roleBadge: 'SELLER',
    email: 'maya@bidpulse.io',
    password: 'Password@123',
    icon: Store,
    desc: 'Pre-verified seller • Manage listings, analytics & escrow payouts',
  },
  {
    label: 'Liam Sterling (Rival Bidder)',
    roleBadge: 'RIVAL BIDDER',
    email: 'liam@bidpulse.io',
    password: 'Password@123',
    icon: Zap,
    desc: 'Pre-verified rival • Compete in 2-player turn-based rooms',
  },
  {
    label: 'Super Admin',
    roleBadge: 'ADMIN',
    email: 'admin@bidpulse.io',
    password: 'Admin@1234',
    icon: ShieldCheck,
    desc: 'Full moderation • Approve listings, manage users & support chat',
  },
];

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [turnstileToken, setTurnstileToken] = useState('local_shield_verified_init');
  const { email, password } = formData;
  const turnstileRef = useRef(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || 'free-local-shield';

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError && message) {
      toast.error(message, { toastId: `login-error-${message}` });
      turnstileRef.current?.reset?.();
    }

    if (user || isSuccess) {
      if (user?.role === 'admin') navigate('/dashboard/admin');
      else navigate('/');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(
      login({
        email,
        password,
        turnstileToken: turnstileToken || `local_shield_verified_${Date.now()}`,
      })
    );
  };

  const handleQuickDemoLogin = (account) => {
    setFormData({ email: account.email, password: account.password });
    dispatch(
      login({
        email: account.email,
        password: account.password,
        turnstileToken: `local_shield_verified_${Date.now()}`,
      })
    );
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-10">
      <Reveal className="w-full max-w-5xl">
        <div className="premium-panel grid overflow-hidden rounded-3xl border-violet-200/70 lg:grid-cols-12">
          <div className="flex flex-col justify-between bg-gradient-to-br from-[#130d26] via-[#25154d] to-[#0b2e2a] p-8 text-white lg:col-span-5 lg:p-10">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-mono text-xs font-bold tracking-wider text-emerald-300">
                <Zap size={13} /> 1-CLICK DEMO SWITCHER
              </div>
              <h1 className="text-3xl font-bold leading-tight">Instant Sandbox Access</h1>
              <p className="mt-2 text-sm text-violet-200">
                Click any pre-seeded role below to sign in immediately without typing credentials:
              </p>

              <div className="mt-6 space-y-2.5">
                {DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleQuickDemoLogin(acc)}
                      className="group w-full rounded-2xl border border-white/15 bg-white/5 p-3.5 text-left transition hover:border-emerald-400/60 hover:bg-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                          <Icon size={15} className="text-emerald-400" /> {acc.label}
                        </span>
                        <span className="rounded-md bg-violet-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-200 group-hover:bg-emerald-500 group-hover:text-slate-950">
                          {acc.roleBadge}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-300">{acc.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4 text-xs text-violet-200">
              Want to test full registration & OTP?{' '}
              <Link to="/register" className="font-bold text-emerald-300 hover:underline">
                Create a custom account →
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 lg:col-span-7 md:p-10">
            <div className="mb-7 text-center">
              <div className="animate-pulse-glow mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-700 to-emerald-600">
                <LogIn className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Sign In to PulseVault</h2>
              <p className="mt-1 text-sm text-slate-600">
                Enter your credentials or select a 1-click demo role on the left
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                    placeholder="alex@bidpulse.io"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-3 text-sm"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-3.5">
                <TurnstileWidget
                  ref={turnstileRef}
                  siteKey={turnstileSiteKey}
                  onVerify={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken('')}
                  onError={() => setTurnstileToken('')}
                />
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs font-semibold text-bid-purple hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-premium w-full py-3 text-sm disabled:opacity-70"
              >
                {isLoading ? 'Authenticating...' : <>Sign In to Exchange <ArrowRight size={16} /></>}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-500">New collector or seller? </span>
              <Link to="/register" className="font-bold text-bid-purple hover:underline">
                Create New Account
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
};

export default Login;
