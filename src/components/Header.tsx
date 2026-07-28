import React, { useState } from 'react';
import { useWallet, ViewTab } from '../context/WalletContext';
import { Web3ConnectModal } from './Web3ConnectModal';
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
    connectWeb3Wallet,
    disconnectWeb3Wallet,
    switchUserRole,
    assets,
  } = useWallet();

  const unreadCount = notifications.filter(
    (n) => !n.read && (n.userId === currentUser?.id || (!n.userId && currentUser?.role === 'admin'))
  ).length;

  const [showNoticeModal, setShowNoticeModal] = useState(false);

  const navItems: Array<{ id: ViewTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'history', label: 'History', icon: History },
    { id: 'markets', label: 'Markets', icon: TrendingUp },
    { id: 'swap', label: 'Swap', icon: Repeat },
    { id: 'staking', label: 'Staking', icon: Coins },
    { id: 'nft', label: 'NFTs', icon: Layers },
    { id: 'defi', label: 'DeFi', icon: Landmark },
    { id: 'settings', label: 'Settings', icon: Zap },
  ];

  // Admin tab is ONLY accessible when logged in with the specific admin email legendxadmin1999@gmail.com
  const isAdminAuthorized =
    currentUser?.email.toLowerCase() === 'legendxadmin1999@gmail.com' &&
    currentUser?.role === 'admin';

  if (isAdminAuthorized) {
    navItems.push({ id: 'admin', label: 'Admin Portal', icon: ShieldCheck });
  }

  // Ticker items for top running ticker bar
  const tickerAssets = assets.slice(0, 6);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0E11]/95 backdrop-blur-md transition-colors duration-300">
      {/* TrustPro Top Ticker Bar */}
      <div className="hidden md:flex overflow-hidden whitespace-nowrap bg-[#161A22] border-b border-white/5 py-1.5 px-4 text-xs font-mono">
        <div className="flex animate-marquee items-center gap-8 text-[#B7BDC6]">
          <span className="flex items-center gap-1.5 text-[#FCD535] font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FCD535] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FCD535]"></span>
            </span>
            TRUSTPRO SPOT MARKETS
          </span>
          {tickerAssets.map((asset) => (
            <div key={asset.id} className="flex items-center gap-2">
              <span className="font-semibold text-white">{asset.symbol}:</span>
              <span className="text-[#B7BDC6]">${asset.priceUsd.toLocaleString()}</span>
              <span
                className={
                  asset.change24h >= 0 ? 'text-[#0ECB81] font-semibold' : 'text-[#F6465D] font-semibold'
                }
              >
                {asset.change24h >= 0 ? '+' : ''}
                {asset.change24h}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main TrustPro Nav Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* TrustPro Brand Logo - Trust Wallet Shield */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-3 text-left focus:outline-none group"
            id="brand-logo-button"
          >
            {/* Official Trust Wallet Shield Logo Icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#38B6FF] to-[#00A3FF] p-2 shadow-lg shadow-[#38B6FF]/20 transition-transform group-hover:scale-105">
              <svg className="h-6 w-6 fill-none stroke-white stroke-[2.5]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5L4 6.5V12C4 17.5 7.5 21.8 12 23C16.5 21.8 20 17.5 20 12V6.5L12 2.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-wider text-white font-sans uppercase">
                  TRUST<span className="text-[#38B6FF]">PRO</span>
                </span>
                <span className="rounded-md bg-[#38B6FF]/10 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#38B6FF] border border-[#38B6FF]/30">
                  MASTER WEB3
                </span>
              </div>
              <p className="text-[10px] text-[#AAB3C5] font-medium tracking-tight">Master Web3 Exchange</p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 rounded-2xl bg-[#0E1528] p-1.5 border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'btn-gradient-primary text-[#0B1020] shadow-md'
                    : 'text-[#AAB3C5] hover:bg-[#131A2D] hover:text-white'
                }`}
                id={`nav-link-${item.id}`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#0B1020]' : 'text-[#AAB3C5]'}`} />
                <span>{item.label}</span>
                {item.id === 'admin' && (
                  <span className="ml-0.5 rounded bg-black/20 px-1 py-0.2 text-[9px] font-extrabold text-[#0B1020]">
                    ADMIN
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2.5">

          {/* Web3 Wallet Connect */}
          {isConnectedToWeb3 ? (
            <button
              onClick={() => setIsWeb3ModalOpen(true)}
              className="hidden sm:flex items-center gap-2 rounded-xl border border-[#38B6FF]/40 bg-[#38B6FF]/10 px-3.5 py-1.5 text-xs font-bold text-[#38B6FF] hover:bg-[#38B6FF]/20 transition-all cursor-pointer"
              id="web3-connected-button"
              title="View Web3 Wallet Details & Network"
            >
              <span className="h-2 w-2 rounded-full bg-[#38B6FF] animate-pulse" />
              <span>{web3ProviderName ? `${web3ProviderName}: ` : ''}{web3Address?.slice(0, 6)}...{web3Address?.slice(-4)}</span>
            </button>
          ) : (
            <button
              onClick={async () => {
                const res = await connectWeb3Wallet('Trust Wallet');
                if (!res.success) {
                  setIsWeb3ModalOpen(true);
                }
              }}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-[#131A2D] border border-[#38B6FF]/40 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#1C263F] hover:border-[#38B6FF] transition-all cursor-pointer"
              id="connect-web3-button"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#38B6FF]" />
              <span>Web3 Connect</span>
            </button>
          )}

          {/* Notifications Bell */}
          <button
            onClick={() => setIsNotificationDrawerOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#131A2D] border border-white/10 text-white hover:bg-[#1C263F] transition-all"
            aria-label="Notifications"
            id="notification-bell-button"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#38B6FF] text-[10px] font-bold text-[#0B1020]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#131A2D] border border-white/10 text-white hover:bg-[#1C263F] transition-all"
            aria-label="Toggle Theme"
            id="theme-toggle-button"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-[#38B6FF]" /> : <Moon className="h-4 w-4 text-slate-400" />}
          </button>

          {/* User Account / Auth CTA */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-2 rounded-xl bg-[#131A2D] border border-white/10 p-1 pr-3 text-xs font-semibold text-white hover:bg-[#1C263F] transition-all"
                id="user-profile-button"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#38B6FF] via-[#00A3FF] to-[#0094FF] text-[#0B1020] font-black text-xs ring-1 ring-white/20 shadow-sm">
                  {(currentUser.name || 'US').slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold leading-tight text-white">{currentUser.name}</p>
                  <p className="text-[9px] text-[#38B6FF] font-mono capitalize">{currentUser.role}</p>
                </div>
              </button>
              <button
                onClick={() => setCurrentUser(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F6465D]/10 border border-[#F6465D]/20 text-[#F6465D] hover:bg-[#F6465D]/20 transition-all"
                title="Log Out"
                id="logout-button"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 btn-gradient-primary px-4 py-2 text-xs font-black transition-all shadow-md"
              id="login-modal-trigger"
            >
              <User className="h-3.5 w-3.5" />
              <span>Log In / Register</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex overflow-x-auto gap-1.5 border-t border-white/10 px-3 py-2 no-scrollbar bg-[#0E1528]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'btn-gradient-primary text-[#0B1020] shadow-sm'
                  : 'bg-[#131A2D] text-[#AAB3C5] hover:bg-[#1C263F] hover:text-white'
              }`}
              id={`mobile-nav-${item.id}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <Web3ConnectModal
        isOpen={isWeb3ModalOpen}
        onClose={() => setIsWeb3ModalOpen(false)}
      />
    </header>
  );
};
