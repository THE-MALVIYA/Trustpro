import React, { useState } from 'react';
import { useWallet, ViewTab } from '../context/WalletContext';
import { TokenSearchModal } from './TokenSearchModal';
import {
  Wallet,
  TrendingUp,
  Repeat,
  Compass,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, currentUser } = useWallet();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isAdminAuthorized =
    currentUser?.email.toLowerCase() === 'legendxadmin1999@gmail.com' &&
    currentUser?.role === 'admin';

  const navButtons = [
    { id: 'overview' as ViewTab, label: 'Home', icon: Wallet },
    { id: 'markets' as ViewTab, label: 'Markets', icon: TrendingUp },
    { id: 'swap' as ViewTab, label: 'Swap', icon: Repeat },
    { id: 'defi' as ViewTab, label: 'Discover', icon: Compass },
  ];

  return (
    <>
      <div className="fixed bottom-4 left-0 right-0 z-40 pointer-events-none px-4 flex items-center justify-center max-w-md mx-auto">
        <div className="flex items-center gap-3 w-full justify-center">
          {/* Main Floating Navigation Pill */}
          <div className="pointer-events-auto flex items-center justify-around bg-[#1E2024]/95 backdrop-blur-xl border border-white/10 rounded-full px-2.5 py-1.5 shadow-2xl ring-1 ring-black/40">
            {navButtons.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                activeTab === tab.id ||
                (tab.id === 'overview' && (activeTab === 'landing' || activeTab === 'portfolio'));

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center h-11 w-14 rounded-full transition-all active:scale-90 ${
                    isActive
                      ? 'bg-[#2A2D35] text-[#05D686] shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id={`bottom-nav-${tab.id}`}
                  title={tab.label}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? 'stroke-[2.5] text-[#05D686]' : 'stroke-[1.8]'
                    }`}
                  />
                </button>
              );
            })}

            {/* If Admin Authorized, render quick admin portal switch */}
            {isAdminAuthorized && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center justify-center h-11 w-11 rounded-full transition-all active:scale-90 ${
                  activeTab === 'admin'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
                title="Admin Portal"
              >
                <ShieldCheck className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Floating Search Action Button on Right */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="pointer-events-auto relative flex h-13 w-13 items-center justify-center rounded-full bg-[#1E2024]/95 backdrop-blur-xl border border-white/10 text-white shadow-2xl hover:bg-[#2A2D35] transition-all active:scale-90 shrink-0 ring-1 ring-black/40"
            id="bottom-floating-search-btn"
            title="Search & Manage Tokens"
          >
            <Search className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      <TokenSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};
