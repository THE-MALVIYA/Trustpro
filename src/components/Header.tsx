import React, { useState } from 'react';
import { useWallet, ViewTab } from '../context/WalletContext';
import { Web3ConnectModal } from './Web3ConnectModal';
import { WalletManageModal } from './WalletManageModal';
import {
  Shield,
  Wallet,
  TrendingUp,
  Repeat,
  Coins,
  History,
  Layers,
  Landmark,
  ShieldCheck,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Zap,
  Clock,
  X,
  AlertCircle,
  CheckCircle2,
  LayoutDashboard,
  ArrowLeft,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    setCurrentUser,
    notifications,
    setIsNotificationDrawerOpen,
    theme,
    toggleTheme,
    setIsAuthModalOpen,
    isConnectedToWeb3,
    web3Address,
    web3ProviderName,
    isWeb3ModalOpen,
    setIsWeb3ModalOpen,
    assets,
  } = useWallet();

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const unreadCount = notifications.filter(
    (n) => !n.read && (n.userId === currentUser?.id || (!n.userId && currentUser?.role === 'admin'))
  ).length;

  const navItems: Array<{ id: ViewTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Wallet', icon: Wallet },
    { id: 'markets', label: 'Markets', icon: TrendingUp },
    { id: 'swap', label: 'Swap', icon: Repeat },
    { id: 'history', label: 'History', icon: History },
    { id: 'defi', label: 'Discover', icon: Landmark },
    { id: 'staking', label: 'Earn', icon: Coins },
    { id: 'settings', label: 'Settings', icon: Zap },
  ];

  const isAdminAuthorized =
    currentUser?.email.toLowerCase() === 'legendxadmin1999@gmail.com' &&
    currentUser?.role === 'admin';

  if (isAdminAuthorized) {
    navItems.push({ id: 'admin', label: 'Admin Portal', icon: ShieldCheck });
  }

  // Ticker assets
  const tickerAssets = assets.slice(0, 6);

  // If on mobile and on overview tab, OverviewDashboard renders the exact mobile Trust Wallet header
  const isMobileOverview = activeTab === 'overview';

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b border-white/5 bg-[#121418]/95 backdrop-blur-md transition-colors ${
          isMobileOverview ? 'hidden md:block' : 'block'
        }`}
      >
        {/* Desktop Ticker Bar */}
        <div className="hidden md:flex overflow-hidden whitespace-nowrap bg-[#16181D] border-b border-white/5 py-1.5 px-4 text-xs font-mono">
          <div className="flex animate-marquee items-center gap-8 text-[#8F96A3]">
            <span className="flex items-center gap-1.5 text-[#3862FB] font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3862FB] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3862FB]"></span>
              </span>
              TRUST WALLET ECOSYSTEM
            </span>
            {tickerAssets.map((asset) => (
              <div key={asset.id} className="flex items-center gap-2">
                <span className="font-semibold text-white">{asset.symbol}:</span>
                <span className="text-slate-300">${asset.priceUsd.toLocaleString()}</span>
                <span
                  className={
                    asset.change24h >= 0 ? 'text-[#38B6FF] font-semibold' : 'text-[#F6465D] font-semibold'
                  }
                >
                  {asset.change24h >= 0 ? '+' : ''}
                  {asset.change24h}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Nav Bar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
          {/* Brand / Back Header on mobile */}
          <div className="flex items-center gap-3">
            {activeTab !== 'overview' && (
              <button
                onClick={() => setActiveTab('overview')}
                className="md:hidden flex items-center justify-center h-8 w-8 rounded-full bg-[#1E2024] text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
              id="brand-logo-button"
            >
              {/* Authentic Trust Wallet Gradient Shield Logo */}
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0500FF] via-[#0570F2] to-[#38B6FF] p-0.5 shadow-lg shadow-[#0570F2]/20 transition-transform group-hover:scale-105">
                <div className="h-full w-full rounded-[10px] bg-[#121418] flex items-center justify-center">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2.2L3.5 5.5V11.2C3.5 16.5 7.1 21.4 12 22.8C16.9 21.4 20.5 16.5 20.5 11.2V5.5L12 2.2Z"
                      fill="url(#trustShieldGrad)"
                    />
                    <path
                      d="M12 4.5L5.5 7.1V11.2C5.5 15.3 8.3 19.1 12 20.4C15.7 19.1 18.5 15.3 18.5 11.2V7.1L12 4.5Z"
                      fill="#121418"
                    />
                    <path
                      d="M12 6.8L7.5 8.7V11.2C7.5 14.1 9.4 16.8 12 17.8C14.6 16.8 16.5 14.1 16.5 11.2V8.7L12 6.8Z"
                      fill="url(#trustInnerGrad)"
                    />
                    <defs>
                      <linearGradient id="trustShieldGrad" x1="3.5" y1="2.2" x2="20.5" y2="22.8" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0570F2" />
                        <stop offset="1" stopColor="#38B6FF" />
                      </linearGradient>
                      <linearGradient id="trustInnerGrad" x1="7.5" y1="6.8" x2="16.5" y2="17.8" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0570F2" />
                        <stop offset="0.5" stopColor="#3862FB" />
                        <stop offset="1" stopColor="#38B6FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-white font-sans">
                    Trust<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0570F2] to-[#38B6FF]">Wallet</span>
                  </span>
                  <span className="rounded-md bg-gradient-to-r from-[#0570F2]/15 to-[#3862FB]/15 px-1.5 py-0.5 text-[9px] font-mono font-extrabold text-[#3862FB] border border-[#3862FB]/30 shadow-sm">
                    Web3
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 rounded-2xl bg-[#1A1C20] p-1 border border-white/5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#3862FB] text-white shadow-md shadow-[#3862FB]/20'
                      : 'text-slate-300 hover:bg-[#25282E] hover:text-white'
                  }`}
                  id={`nav-link-${item.id}`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.id === 'admin' && (
                    <span className="ml-0.5 rounded bg-black/20 px-1 py-0.2 text-[9px] font-extrabold text-white">
                      ADMIN
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2">
            {/* Wallet Switcher */}
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#1E2024] hover:bg-[#25282E] border border-white/10 px-3 py-1.5 text-xs font-bold text-white transition-all shadow-sm"
              id="header-wallet-btn"
            >
              <div className="h-2 w-2 rounded-full bg-[#3862FB] animate-pulse" />
              <span>{currentUser?.name || 'Wallet'}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {/* Admin Badge if Authorized */}
            {isAdminAuthorized && (
              <button
                onClick={() => setActiveTab('admin')}
                className="hidden sm:flex items-center gap-1 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-amber-500/30 transition-all"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationDrawerOpen(true)}
              className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-[#1E2024] hover:bg-[#25282E] text-slate-300 hover:text-white border border-white/5 transition-all"
              id="header-notif-btn"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#3862FB] text-[9px] font-bold text-white ring-1 ring-[#121418]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Web3 Connect */}
            <button
              onClick={() => setIsWeb3ModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-[#3862FB] hover:bg-[#2D54E5] text-white px-3 py-1.5 text-xs font-bold transition-all shadow-md shadow-[#3862FB]/20"
              id="header-connect-btn"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>{isConnectedToWeb3 ? 'Connected' : 'Web3 Connect'}</span>
            </button>
          </div>
        </div>
      </header>

      <Web3ConnectModal />
      <WalletManageModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
};
