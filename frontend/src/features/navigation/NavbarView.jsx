/**
 * Module: features/navigation/NavbarView.jsx
 * Purpose: Renders the redesigned PulseVault top navigation bar with live status telemetry.
 */
import React from 'react';
import { Menu, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { NAV_LINKS } from './navbarConfig';
import { useNavbarState } from './useNavbarState';
import DesktopNavLinks from './components/DesktopNavLinks';
import MobileNavMenu from './components/MobileNavMenu';
import NavbarAuthControls from './components/NavbarAuthControls';

const NavbarView = () => {
  const {
    location,
    user,
    unreadCount,
    isDropdownOpen,
    setIsDropdownOpen,
    isNotificationOpen,
    setIsNotificationOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    dropdownRef,
    notificationRef,
    isSellerMode,
    dashboardPath,
    onLogout,
    handleSwitchMode,
  } = useNavbarState();

  return (
    <nav className="sticky top-0 z-50 border-b border-violet-200/70 bg-white/85 shadow-[0_18px_38px_-28px_rgba(88,28,135,0.45)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-700 via-purple-600 to-emerald-600 text-white shadow-md">
            <Sparkles size={19} />
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-shimmer bg-gradient-to-r from-violet-800 via-purple-600 to-emerald-600 bg-clip-text text-lg font-extrabold leading-none tracking-tight text-transparent">
              PulseVault
            </span>
            <span className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              <ShieldCheck size={10} className="text-emerald-600" /> Soft-Close • Escrow
            </span>
          </div>
        </Link>

        <DesktopNavLinks links={NAV_LINKS} currentPath={location.pathname} />

        <div className="flex items-center gap-2 sm:gap-3">
          <NavbarAuthControls
            user={user}
            unreadCount={unreadCount}
            isNotificationOpen={isNotificationOpen}
            setIsNotificationOpen={setIsNotificationOpen}
            notificationRef={notificationRef}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            dropdownRef={dropdownRef}
            isSellerMode={isSellerMode}
            dashboardPath={dashboardPath}
            onLogout={onLogout}
            handleSwitchMode={handleSwitchMode}
          />

          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex rounded-xl border border-violet-200 bg-white p-2 text-slate-700 lg:hidden"
            type="button"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <MobileNavMenu
        isMobileMenuOpen={isMobileMenuOpen}
        links={NAV_LINKS}
        currentPath={location.pathname}
        user={user}
        dashboardPath={dashboardPath}
        isSellerMode={isSellerMode}
        handleSwitchMode={handleSwitchMode}
        onLogout={onLogout}
      />
    </nav>
  );
};

export default NavbarView;
