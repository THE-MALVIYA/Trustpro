import React, { useState, useRef } from 'react';
import { useWallet } from '../context/WalletContext';
import { CryptoIcon } from './CryptoIcon';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  Coins,
  Shield,
  ShieldCheck,
  Search,
  Star,
  PlusCircle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  XCircle,
  Send,
  Download,
  Eye,
  EyeOff,
  LayoutDashboard,
  PieChart as PieIcon,
  Activity,
  Zap,
  Gift,
  HelpCircle,
  Settings as SettingsIcon,
  Bell,
  MessageSquare,
  Lock,
  Key,
  Flame,
  Globe,
  Share2,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Sparkles,
  BarChart2,
  User,
  Camera,
  Upload,
  FileText,
  AlertCircle,
  X,
  Filter,
  DollarSign,
  Award,
  ArrowLeft,
  RefreshCw,
  Menu,
  Info,
  Sliders,
  Cpu,
  Layers,
  Users,
  Server,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const OverviewDashboard: React.FC = () => {
  const {
    currentUser,
    assets,
    transactions,
    watchlist,
    toggleWatchlist,
    setActiveTab,
    setIsSendModalOpen,
    setIsReceiveModalOpen,
    setSelectedAssetForModal,
    addNotification,
    notifications,
    updateUserProfileAvatar,
  } = useWallet();

  // Navigation state - default to 'all' master dashboard grid
  const [activeSection, setActiveSection] = useState<
    | 'all'
    | 'portfolio'
    | 'wallets'
    | 'markets'
    | 'allocation'
    | 'activity'
    | 'deposits'
    | 'withdrawals'
    | 'trades'
    | 'transactions'
    | 'assets'
    | 'analytics'
    | 'reports'
    | 'settings'
    | 'security'
    | 'notifications'
    | 'referral'
    | 'support'
    | 'kyc'
    | 'profile'
  >('all');

  // UI States
  const [showBalance, setShowBalance] = useState(true);
  const [searchCoinQuery, setSearchCoinQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // 3-Line Navigation Menu Toggle State
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

  // Modal Views State (Privacy Policy, About Us, Contact Us, Settings, Trade)
  const [activeModal, setActiveModal] = useState<'privacy' | 'about' | 'contact' | 'settings' | 'trade' | null>(null);

  // Profile Photo Upload Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // KYC Upload States
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadingKyc, setIsUploadingKyc] = useState(false);
  const [kycSuccess, setKycSuccess] = useState(false);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-[#3375BB]/10 border border-[#3375BB]/30 flex items-center justify-center text-[#3375BB] mb-4 animate-bounce">
          <LayoutDashboard className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-wider">Welcome to TrustPro Overview</h2>
        <p className="text-xs text-[#AAB3C5] max-w-md mt-2 mb-6">
          Log in or register your account to access your live portfolio balance, market heatmap, trade history, and security features.
        </p>
      </div>
    );
  }

  // Calculate Total Portfolio Balances
  let totalPortfolioUsd = 0;
  const assetBalances = assets.map((asset) => {
    const userAmount = currentUser.balances[asset.symbol] || 0;
    const valueUsd = userAmount * asset.priceUsd;
    totalPortfolioUsd += valueUsd;
    return {
      ...asset,
      userAmount,
      valueUsd,
    };
  });

  // Today PnL Calculation
  let weighted24hPnlUsd = 0;
  assetBalances.forEach((item) => {
    if (item.valueUsd > 0) {
      weighted24hPnlUsd += item.valueUsd * (item.change24h / 100);
    }
  });
  const weighted24hPnlPercent = totalPortfolioUsd > 0 ? (weighted24hPnlUsd / totalPortfolioUsd) * 100 : 0;

  // Breakdown across wallets (Spot, Funding, Futures, Earn, Staking)
  const spotWalletUsd = totalPortfolioUsd * 0.65;
  const futuresWalletUsd = totalPortfolioUsd * 0.15;
  const earnWalletUsd = totalPortfolioUsd * 0.10;
  const fundingWalletUsd = totalPortfolioUsd * 0.07;
  const marginWalletUsd = totalPortfolioUsd * 0.03;

  const availableBalanceUsd = totalPortfolioUsd * (currentUser.isFrozen ? 0 : 0.95);
  const frozenBalanceUsd = currentUser.isFrozen ? totalPortfolioUsd : totalPortfolioUsd * 0.05;

  // Allocation Donut Chart Data
  const allocationData =
    totalPortfolioUsd > 0
      ? [
          { name: 'Spot Wallet', value: spotWalletUsd, color: '#3375BB' },
          { name: 'Futures Wallet', value: futuresWalletUsd, color: '#0500FF' },
          { name: 'Earn Wallet', value: earnWalletUsd, color: '#3375BB' },
          { name: 'Funding Wallet', value: fundingWalletUsd, color: '#A855F7' },
          { name: 'Staking Wallet', value: marginWalletUsd, color: '#EC4899' },
        ]
      : [{ name: 'Spot Wallet', value: 0, color: '#3375BB' }];

  // Handle Photo Selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedPhotoPreview(reader.result as string);
        setIsAvatarModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = () => {
    if (selectedPhotoPreview) {
      updateUserProfileAvatar(selectedPhotoPreview);
      setIsAvatarModalOpen(false);
      setSelectedPhotoPreview(null);
    }
  };

  // Handle Referral Copy
  const handleCopyReferral = () => {
    const refUrl = `https://trustpro.exchange/register?ref=${currentUser.id.slice(0, 8)}`;
    navigator.clipboard.writeText(refUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Handle KYC Submit
  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFrontFile) {
      alert('Please select ID Front document image.');
      return;
    }
    setIsUploadingKyc(true);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploadingKyc(false);
          setKycSuccess(true);
          addNotification(
            currentUser.id,
            'KYC Documents Submitted',
            'Your identity verification documents have been received and are being verified.',
            'security'
          );
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  // Master Dashboard Nav Items List (20 items as requested)
  const navDashboardButtons = [
    {
      id: 'all',
      title: 'All Dashboard',
      subtitle: 'Master overview & summary cards',
      icon: LayoutDashboard,
      color: 'from-[#3375BB] to-[#0500FF]',
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
      subtitle: 'Total balance & asset breakdown',
      icon: Wallet,
      color: 'from-[#0500FF] to-[#0094FF]',
    },
    {
      id: 'wallets',
      title: 'Wallets',
      subtitle: 'Spot, Funding, Futures & Staking',
      icon: DollarSign,
      color: 'from-[#3375BB] to-[#10B981]',
    },
    {
      id: 'markets',
      title: 'Market Overview',
      subtitle: 'Live prices, top gainers & volume',
      icon: TrendingUp,
      color: 'from-[#3375BB] to-[#F59E0B]',
    },
    {
      id: 'allocation',
      title: 'Portfolio Allocation',
      subtitle: 'Asset distribution chart',
      icon: PieIcon,
      color: 'from-[#EC4899] to-[#8B5CF6]',
    },
    {
      id: 'activity',
      title: 'Wallet Activity',
      subtitle: 'All recent wallet transactions',
      icon: Activity,
      color: 'from-[#0094FF] to-[#3375BB]',
    },
    {
      id: 'deposits',
      title: 'Deposit History',
      subtitle: 'Crypto deposit logs & hashes',
      icon: Download,
      color: 'from-[#3375BB] to-[#059669]',
    },
    {
      id: 'withdrawals',
      title: 'Withdraw History',
      subtitle: 'Send & withdrawal records',
      icon: Send,
      color: 'from-[#EF4444] to-[#F97316]',
    },
    {
      id: 'trades',
      title: 'Trade History',
      subtitle: 'Spot, Futures & Swap orders',
      icon: Repeat,
      color: 'from-[#3375BB] to-[#10B981]',
    },
    {
      id: 'transactions',
      title: 'Transactions',
      subtitle: 'Complete financial log',
      icon: Clock,
      color: 'from-[#6366F1] to-[#0094FF]',
    },
    {
      id: 'assets',
      title: 'Assets',
      subtitle: 'Available token balances',
      icon: Coins,
      color: 'from-[#3375BB] to-[#3375BB]',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      subtitle: 'Profit/Loss performance stats',
      icon: BarChart2,
      color: 'from-[#8B5CF6] to-[#EC4899]',
    },
    {
      id: 'reports',
      title: 'Reports',
      subtitle: 'Account statements & history',
      icon: FileText,
      color: 'from-[#10B981] to-[#0094FF]',
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Account preferences & defaults',
      icon: SettingsIcon,
      color: 'from-[#64748B] to-[#475569]',
    },
    {
      id: 'security',
      title: 'Security',
      subtitle: '2FA, Password & API keys',
      icon: ShieldCheck,
      color: 'from-[#3375BB] to-[#0500FF]',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'System & trade alerts',
      icon: Bell,
      color: 'from-[#3375BB] to-[#EF4444]',
    },
    {
      id: 'referral',
      title: 'Referral',
      subtitle: 'Invite friends & earn yield',
      icon: Gift,
      color: 'from-[#EC4899] to-[#3375BB]',
    },
    {
      id: 'support',
      title: 'Support',
      subtitle: '24/7 compliance ticket desk',
      icon: MessageSquare,
      color: 'from-[#0094FF] to-[#3375BB]',
    },
    {
      id: 'kyc',
      title: 'KYC',
      subtitle: 'Identity verification & limits',
      icon: Shield,
      color: 'from-[#3375BB] to-[#10B981]',
    },
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'User info & profile picture',
      icon: User,
      color: 'from-[#0500FF] to-[#6366F1]',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* TOP USER PROFILE BANNER */}
      <div className="relative overflow-hidden rounded-[22px] bg-[#131A2D] border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Professional Institutional Badge Avatar */}
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3375BB] via-[#0500FF] to-[#0094FF] text-[#0B1020] font-black text-2xl shadow-xl ring-4 ring-white/10 shrink-0">
              {(currentUser.name || 'US').slice(0, 2).toUpperCase()}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-white">{currentUser.name}</h1>
                {/* Dynamic KYC Status Badge */}
                {currentUser.kycStatus === 'verified' && (
                  <span className="rounded-full bg-[#3375BB]/10 border border-[#3375BB]/50 px-3 py-0.5 text-[11px] font-black text-[#3375BB] uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    VERIFIED
                  </span>
                )}
                {currentUser.kycStatus === 'pending' && (
                  <span className="rounded-full bg-[#3375BB]/10 border border-[#3375BB]/50 px-3 py-0.5 text-[11px] font-black text-[#3375BB] uppercase tracking-wider flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    PENDING VERIFICATION
                  </span>
                )}
                {(currentUser.kycStatus === 'unverified' || !currentUser.kycStatus) && (
                  <span className="rounded-full bg-rose-500/10 border border-rose-500/50 px-3 py-0.5 text-[11px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" />
                    UNVERIFIED
                  </span>
                )}
                {currentUser.kycStatus === 'rejected' && (
                  <span className="rounded-full bg-rose-600/20 border border-rose-600/60 px-3 py-0.5 text-[11px] font-black text-rose-500 uppercase tracking-wider flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    KYC REJECTED
                  </span>
                )}
                <span className="rounded-full bg-[#10B981]/10 border border-[#10B981]/30 px-2.5 py-0.5 text-[10px] font-extrabold text-[#10B981] uppercase">
                  ● ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#AAB3C5] mt-1.5 font-mono">
                Email: <span className="text-white font-medium">{currentUser.email}</span> • Registered:{' '}
                {(currentUser?.createdAt || new Date().toISOString()).split('T')[0]}
              </p>
            </div>
          </div>

          {/* Quick Actions Header Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsReceiveModalOpen(true)}
              className="flex items-center gap-2 btn-cyan px-5 py-3 text-xs font-black transition-all shadow-lg"
              id="header-deposit-btn"
            >
              <Download className="h-4 w-4" />
              <span>Deposit Crypto</span>
            </button>
            <button
              onClick={() => setIsSendModalOpen(true)}
              className="flex items-center gap-2 btn-secondary-dark px-5 py-3 text-xs font-bold transition-all"
              id="header-withdraw-btn"
            >
              <Send className="h-4 w-4 text-[#3375BB]" />
              <span>Withdraw</span>
            </button>
            <button
              onClick={() => setActiveTab('swap')}
              className="flex items-center gap-2 btn-blue-cyan px-5 py-3 text-xs font-extrabold transition-all"
              id="header-swap-btn"
            >
              <Repeat className="h-4 w-4" />
              <span>Instant Swap</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-LINE NAVIGATION DASHBOARD MENU CONTAINER */}
      <div className="rounded-[22px] bg-[#131A2D] border border-white/10 p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* 3-LINE HAMBURGER MENU TOGGLE BUTTON */}
            <button
              onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
              className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#3375BB] via-[#0500FF] to-[#0094FF] px-4 py-3 text-[#0B1020] font-black shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all group"
              id="three-line-nav-menu-toggle"
              title="Click to open or close 3-line navigation menu"
            >
              {/* 3 Horizontal Lines Icon (Menu) */}
              <Menu className="h-6 w-6 stroke-[3]" />
              <div className="text-left">
                <span className="text-xs uppercase tracking-wider font-extrabold block">
                  {isNavMenuOpen ? 'Close Navigation Menu' : 'Navigation Dashboard Menu'}
                </span>
                <span className="text-[10px] text-[#0B1020]/80 font-bold block">
                  20 Master Web3 Modules Included
                </span>
              </div>
              <span className="ml-2 rounded-full bg-[#0B1020]/20 px-2.5 py-1 text-[11px] font-mono font-black">
                {isNavMenuOpen ? '▲' : '▼'}
              </span>
            </button>

            <div className="hidden lg:block">
              <p className="text-xs font-bold text-white">TrustPro Master Web3 Navigation</p>
              <p className="text-[10px] text-[#AAB3C5]">Click the 3-line menu button to open all 20 dashboard controls</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeSection !== 'all' && (
              <button
                onClick={() => setActiveSection('all')}
                className="flex items-center gap-2 rounded-xl bg-[#0B1020] border border-[#3375BB]/40 px-3.5 py-2 text-xs font-extrabold text-[#3375BB] hover:bg-[#1C263F] transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Show Master Dashboard</span>
              </button>
            )}
            <button
              onClick={() => setActiveModal('about')}
              className="flex items-center gap-1.5 rounded-xl bg-[#0B1020] border border-white/10 px-3 py-2 text-xs font-semibold text-[#AAB3C5] hover:text-white transition-all"
            >
              <Info className="h-3.5 w-3.5 text-[#3375BB]" />
              <span>About</span>
            </button>
            <button
              onClick={() => setActiveModal('contact')}
              className="flex items-center gap-1.5 rounded-xl bg-[#0B1020] border border-white/10 px-3 py-2 text-xs font-semibold text-[#AAB3C5] hover:text-white transition-all"
            >
              <Phone className="h-3.5 w-3.5 text-[#0500FF]" />
              <span>Contact</span>
            </button>
            <button
              onClick={() => setActiveModal('privacy')}
              className="flex items-center gap-1.5 rounded-xl bg-[#0B1020] border border-white/10 px-3 py-2 text-xs font-semibold text-[#AAB3C5] hover:text-white transition-all"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#3375BB]" />
              <span>Privacy</span>
            </button>
          </div>
        </div>

        {/* 20 BUTTONS GRID INSIDE THE 3-LINE MENU TOGGLE */}
        {isNavMenuOpen && (
          <div className="pt-4 border-t border-white/10 animate-fadeIn">
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-xs font-extrabold text-[#3375BB] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>All 20 Navigation Dashboard Modules (Select to open):</span>
              </p>
              <button
                onClick={() => setIsNavMenuOpen(false)}
                className="text-xs text-[#AAB3C5] hover:text-white flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" /> Close Menu
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {navDashboardButtons.map((btn) => {
                const Icon = btn.icon;
                const isSelected = activeSection === btn.id;
                return (
                  <button
                    key={btn.id}
                    onClick={() => {
                      setActiveSection(btn.id as any);
                    }}
                    className={`flex flex-col justify-between text-left p-3.5 rounded-[18px] border transition-all hover:-translate-y-1 ${
                      isSelected
                        ? 'bg-[#1C263F] border-[#3375BB] shadow-lg shadow-[#3375BB]/10 ring-2 ring-[#3375BB]/40'
                        : 'bg-[#0B1020] border-white/10 hover:border-[#3375BB]/40'
                    }`}
                    id={`dashboard-nav-card-${btn.id}`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div
                        className={`h-9 w-9 rounded-xl bg-gradient-to-br ${btn.color} text-[#0B1020] flex items-center justify-center font-bold shadow-md`}
                      >
                        <Icon className="h-4 w-4 stroke-[2.5]" />
                      </div>
                      <span
                        className={`h-2 w-2 rounded-full ${isSelected ? 'bg-[#3375BB] animate-ping' : 'bg-white/20'}`}
                      />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">{btn.title}</h3>
                      <p className="text-[9px] text-[#AAB3C5] mt-0.5 line-clamp-1">{btn.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ACTIVE SECTION CONTENT DISPLAY (Smoothly loaded when clicked) */}
      <div className="pt-2">
        {/* SECTION: ALL DASHBOARD SUMMARY CARDS */}
        {activeSection === 'all' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Balance Stats Banner */}
            <div className="rounded-[20px] bg-[#131A2D] border border-white/10 p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-[#3375BB]" />
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    Total Portfolio Overview
                  </h2>
                </div>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0B1020] border border-white/10 px-3 py-1.5 text-xs text-[#AAB3C5] hover:text-white transition-all"
                >
                  {showBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{showBalance ? 'Hide Balances' : 'Show Balances'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#0B1020] rounded-2xl p-5 border border-white/10">
                <div>
                  <p className="text-xs text-[#AAB3C5] font-semibold uppercase tracking-wider">
                    Total Portfolio Value
                  </p>
                  <p className="text-3xl font-black text-white font-mono mt-1">
                    {showBalance
                      ? `$${totalPortfolioUsd.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : '•••••••• USD'}
                  </p>
                  <p className="text-xs text-[#AAB3C5] font-mono mt-0.5">
                    ≈ {showBalance ? (totalPortfolioUsd / (assets[0]?.priceUsd || 64000)).toFixed(4) : '••••'} BTC
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#AAB3C5] font-semibold uppercase tracking-wider">
                    24h Profit / Loss
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p
                      className={`text-2xl font-black font-mono ${
                        weighted24hPnlUsd >= 0 ? 'text-[#3375BB]' : 'text-[#F6465D]'
                      }`}
                    >
                      {showBalance
                        ? `${weighted24hPnlUsd >= 0 ? '+' : ''}$${weighted24hPnlUsd.toFixed(2)}`
                        : '•••• USD'}
                    </p>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-bold font-mono ${
                        weighted24hPnlPercent >= 0
                          ? 'bg-[#3375BB]/10 text-[#3375BB]'
                          : 'bg-[#F6465D]/10 text-[#F6465D]'
                      }`}
                    >
                      {weighted24hPnlPercent >= 0 ? '+' : ''}
                      {weighted24hPnlPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[#AAB3C5] font-semibold uppercase tracking-wider">
                    Available vs. Frozen
                  </p>
                  <div className="mt-1.5 space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#AAB3C5]">Available:</span>
                      <span className="text-[#3375BB] font-bold">
                        ${showBalance ? availableBalanceUsd.toFixed(2) : '••••'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#AAB3C5]">Frozen:</span>
                      <span className="text-[#3375BB] font-bold">
                        ${showBalance ? frozenBalanceUsd.toFixed(2) : '••••'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: PORTFOLIO & WALLETS */}
        {(activeSection === 'portfolio' || activeSection === 'wallets') && (
          <div className="rounded-[20px] bg-[#131A2D] border border-white/10 p-6 shadow-xl space-y-6 animate-fadeIn">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[#3375BB]" />
              <span>Multi-Wallet Asset Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[
                { label: 'Spot Wallet', val: spotWalletUsd, color: 'text-[#3375BB]' },
                { label: 'Futures Wallet', val: futuresWalletUsd, color: 'text-[#0500FF]' },
                { label: 'Earn Wallet', val: earnWalletUsd, color: 'text-[#3375BB]' },
                { label: 'Funding Wallet', val: fundingWalletUsd, color: 'text-[#A855F7]' },
                { label: 'Staking Wallet', val: marginWalletUsd, color: 'text-[#EC4899]' },
              ].map((w, idx) => (
                <div key={idx} className="rounded-2xl bg-[#0B1020] border border-white/10 p-4">
                  <p className="text-xs text-[#AAB3C5] font-medium">{w.label}</p>
                  <p className={`text-lg font-black font-mono mt-1 ${w.color}`}>
                    ${showBalance ? w.val.toFixed(2) : '••••'}
                  </p>
                </div>
              ))}
            </div>

            {/* Asset Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#AAB3C5] font-bold">
                    <th className="py-3 px-4">Asset</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">24h Change</th>
                    <th className="py-3 px-4">Your Balance</th>
                    <th className="py-3 px-4">USD Value</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {assets.map((asset) => {
                    const amount = currentUser.balances[asset.symbol] || 0;
                    const valUsd = amount * asset.priceUsd;
                    return (
                      <tr key={asset.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <CryptoIcon symbol={asset.symbol} src={asset.icon} size="sm" />
                          <div>
                            <span className="font-bold text-white block">{asset.name}</span>
                            <span className="text-[10px] text-[#AAB3C5] font-mono">{asset.symbol}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          ${asset.priceUsd.toLocaleString()}
                        </td>
                        <td
                          className={`py-3 px-4 font-mono font-bold ${
                            asset.change24h >= 0 ? 'text-[#3375BB]' : 'text-[#F6465D]'
                          }`}
                        >
                          {asset.change24h >= 0 ? '+' : ''}
                          {asset.change24h}%
                        </td>
                        <td className="py-3 px-4 font-mono text-white">
                          {amount} {asset.symbol}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          ${valUsd.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedAssetForModal(asset);
                                setIsReceiveModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#3375BB]/10 text-[#3375BB] hover:bg-[#3375BB]/20 font-bold text-xs"
                            >
                              Deposit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAssetForModal(asset);
                                setIsSendModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#0500FF]/10 text-[#0500FF] hover:bg-[#0500FF]/20 font-bold text-xs"
                            >
                              Withdraw
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Network Fee Section inside Portfolio */}
            <div className="rounded-2xl bg-[#0B1020] border border-white/10 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#3375BB]" />
                  <span>Network Fee Schedule</span>
                </h4>
                <span className="text-[10px] font-mono text-[#3375BB] bg-[#3375BB]/10 px-2.5 py-0.5 rounded-full font-bold border border-[#3375BB]/30">
                  REAL-TIME ON-CHAIN RATES
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-[#AAB3C5] font-bold">
                      <th className="py-2.5 px-3">Coin</th>
                      <th className="py-2.5 px-3">Network</th>
                      <th className="py-2.5 px-3">Deposit Fee</th>
                      <th className="py-2.5 px-3">Withdrawal Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {assets.slice(0, 8).map((asset) => {
                      const netName =
                        asset.symbol === 'USDT' || asset.symbol === 'TRX'
                          ? 'TRC-20'
                          : asset.symbol === 'BTC'
                          ? 'Bitcoin Native'
                          : asset.symbol === 'ETH' || asset.symbol === 'USDC'
                          ? 'ERC-20'
                          : asset.symbol === 'SOL'
                          ? 'Solana SPL'
                          : asset.symbol === 'BNB'
                          ? 'BEP-20'
                          : 'Mainnet';

                      const withdrawFee =
                        asset.symbol === 'USDT'
                          ? '1.0 USDT'
                          : asset.symbol === 'BTC'
                          ? '0.0005 BTC'
                          : asset.symbol === 'ETH'
                          ? '0.003 ETH'
                          : asset.symbol === 'TRX'
                          ? '1.0 TRX'
                          : asset.symbol === 'SOL'
                          ? '0.01 SOL'
                          : '0.00% Network Gas';

                      return (
                        <tr key={asset.id} className="hover:bg-white/5">
                          <td className="py-2.5 px-3 flex items-center gap-2">
                            <CryptoIcon symbol={asset.symbol} src={asset.icon} size="sm" />
                            <span className="font-bold text-white font-sans">{asset.name}</span>
                            <span className="text-[10px] text-[#AAB3C5]">({asset.symbol})</span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#0500FF]">{netName}</td>
                          <td className="py-2.5 px-3 text-[#3375BB] font-bold">Free (0.00%)</td>
                          <td className="py-2.5 px-3 text-white font-bold">{withdrawFee}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons below Network Fee */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReceiveModalOpen(true)}
                  className="flex-1 btn-gradient-primary py-2.5 text-xs font-black text-[#0B1020] flex items-center justify-center gap-2 shadow-lg"
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  <span>Deposit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSendModalOpen(true)}
                  className="flex-1 btn-secondary-dark py-2.5 text-xs font-bold text-white flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10"
                >
                  <ArrowUpRight className="h-4 w-4 text-[#0500FF]" />
                  <span>Withdraw</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: MARKET OVERVIEW & HEATMAP */}
        {(activeSection === 'markets' || activeSection === 'assets') && (
          <div className="rounded-[20px] bg-[#131A2D] border border-white/10 p-6 shadow-xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#3375BB]" />
                <span>Live Crypto Market Overview</span>
              </h3>
              <button
                onClick={() => setActiveTab('markets')}
                className="text-xs font-bold text-[#3375BB] hover:underline"
              >
                Open Full Trading Market →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {assets.slice(0, 8).map((coin) => (
                <div
                  key={coin.id}
                  className="rounded-2xl bg-[#0B1020] border border-white/10 p-4 hover:border-[#3375BB]/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CryptoIcon symbol={coin.symbol} src={coin.icon} size="sm" />
                      <span className="font-extrabold text-white">{coin.symbol}</span>
                    </div>
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                        coin.change24h >= 0 ? 'bg-[#3375BB]/10 text-[#3375BB]' : 'bg-[#F6465D]/10 text-[#F6465D]'
                      }`}
                    >
                      {coin.change24h >= 0 ? '+' : ''}
                      {coin.change24h}%
                    </span>
                  </div>
                  <p className="text-lg font-black text-white font-mono">${coin.priceUsd.toLocaleString()}</p>
                  <p className="text-[10px] text-[#AAB3C5] font-mono mt-1">Vol: ${(coin.volume24hUsd / 1e6).toFixed(1)}M</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: PORTFOLIO ALLOCATION */}
        {activeSection === 'allocation' && (
          <div className="rounded-[20px] bg-[#131A2D] border border-white/10 p-6 shadow-xl space-y-6 animate-fadeIn">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-[#EC4899]" />
              <span>Portfolio Asset Distribution</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {allocationData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-white/10">
                    <div className="flex items-center gap-2.5">
                      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-bold text-white">{item.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#3375BB]">
                      ${item.value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RICH ATTRACTIVE OVERVIEW CARDS & WEBSITE DESCRIPTION */}
            <div className="rounded-[22px] bg-gradient-to-br from-[#131A2D] via-[#0E1528] to-[#131A2D] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#3375BB]/5 blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#3375BB]/10 border border-[#3375BB]/30 px-3.5 py-1 text-xs font-black text-[#3375BB] uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 animate-spin" />
                    <span>Master Web3 Crypto Infrastructure</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                    Next-Gen Non-Custodial Exchange & Cross-Chain Web3 Engine
                  </h2>
                  <p className="text-xs sm:text-sm text-[#AAB3C5] leading-relaxed">
                    TrustPro Master Web3 is engineered for high-frequency crypto trading, instant 0-slippage cross-chain swaps, 125x perpetual futures, and automated decentralized yield farming. Built on non-custodial multi-party computation (MPC) cold storage, your assets remain under your direct cryptographic ownership at all times.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    onClick={() => setActiveTab('swap')}
                    className="btn-gradient-primary px-6 py-3.5 text-xs font-black text-[#0B1020] flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Trade Master Web3 Now</span>
                  </button>
                  <button
                    onClick={() => setActiveModal('about')}
                    className="btn-secondary-dark px-6 py-3.5 text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
                  >
                    <Info className="h-4 w-4 text-[#3375BB]" />
                    <span>Ecosystem Overview</span>
                  </button>
                </div>
              </div>

              {/* 4 CORE ECOSYSTEM HIGHLIGHT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#0B1020]/80 border border-white/10 space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-[#3375BB]/10 border border-[#3375BB]/30 text-[#3375BB] flex items-center justify-center font-bold">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-white">100,000+ TPS Engine</h3>
                  <p className="text-xs text-[#AAB3C5]">
                    Ultra-low latency matching engine for instant execution on Spot, Futures, and Margin trading with zero slippage.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0B1020]/80 border border-white/10 space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-[#0500FF]/10 border border-[#0500FF]/30 text-[#0500FF] flex items-center justify-center font-bold">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-white">Non-Custodial Vaults</h3>
                  <p className="text-xs text-[#AAB3C5]">
                    Hardware-level encryption and MPC key isolation. You hold full cryptographic authority over your private seed.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0B1020]/80 border border-white/10 space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-[#3375BB]/10 border border-[#3375BB]/30 text-[#3375BB] flex items-center justify-center font-bold">
                    <Layers className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-white">70+ Blockchain Chains</h3>
                  <p className="text-xs text-[#AAB3C5]">
                    Natively trade assets across Bitcoin, Ethereum, Solana, BNB Chain, Polygon, Arbitrum, Optimism & Avalanche.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0B1020]/80 border border-white/10 space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-[#EC4899]/10 border border-[#EC4899]/30 text-[#EC4899] flex items-center justify-center font-bold">
                    <Coins className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-white">32.5% Staking Yields</h3>
                  <p className="text-xs text-[#AAB3C5]">
                    Automated yield compounding in decentralized Liquidity Vaults with daily payouts directly to your Web3 wallet.
                  </p>
                </div>
              </div>
            </div>

            {/* DEDICATED TRUST WALLET MENTION & INTEGRATION CARD */}
            <div className="rounded-[22px] bg-gradient-to-br from-[#0B132B] via-[#101A36] to-[#0D152D] border border-[#3375BB]/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start sm:items-center gap-4">
                  {/* Trust Wallet Shield Icon */}
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#3375BB] to-[#0500FF] p-3 text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#3375BB]/20 ring-4 ring-[#3375BB]/20">
                    <svg className="h-8 w-8 fill-none stroke-white stroke-[2.5]" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5L4 6.5V12C4 17.5 7.5 21.8 12 23C16.5 21.8 20 17.5 20 12V6.5L12 2.5Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    </svg>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#3375BB] uppercase tracking-wider bg-[#3375BB]/10 border border-[#3375BB]/30 px-2.5 py-0.5 rounded-full">
                        Official Infrastructure Partner
                      </span>
                      <span className="text-xs font-extrabold text-white">Integrated with Trust Wallet Protocol</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Powered by Trust Wallet Self-Custody Security Shield
                    </h3>
                    <p className="text-xs sm:text-sm text-[#AAB3C5] max-w-3xl leading-relaxed">
                      TrustPro Master Web3 works seamlessly with <strong>Trust Wallet</strong>, enabling instant 1-click Web3 wallet connection, gasless dApp transactions, and multi-chain seed phrase security. Hold, swap, and trade over 10 million assets across 70+ blockchains directly from your Trust Wallet app or extension with full non-custodial protection.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
                  <a
                    href="https://trustwallet.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gradient-primary px-5 py-3 text-xs font-black text-[#0B1020] flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all"
                  >
                    <span>Visit Official Trust Wallet Site (trustwallet.com)</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => setActiveModal('about')}
                    className="btn-secondary-dark px-4 py-3 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Shield className="h-4 w-4 text-[#3375BB]" />
                    <span>Trust Security Details</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: WALLET ACTIVITY & TRANSACTIONS & DEPOSIT/WITHDRAW/TRADE HISTORY */}
        {(activeSection === 'activity' ||
          activeSection === 'deposits' ||
          activeSection === 'withdrawals' ||
          activeSection === 'trades' ||
          activeSection === 'transactions') && (() => {
          const userSectionTxs = transactions.filter((tx) => tx.userId === currentUser.id);

          let displayTxs = userSectionTxs;
          if (activeSection === 'deposits') {
            displayTxs = userSectionTxs.filter(
              (tx) => tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'admin_credit'
            );
          } else if (activeSection === 'withdrawals') {
            displayTxs = userSectionTxs.filter(
              (tx) => tx.type === 'withdraw' || tx.type === 'send' || tx.type === 'admin_debit'
            );
          } else if (activeSection === 'trades') {
            displayTxs = userSectionTxs.filter((tx) => tx.type === 'swap' || tx.type === 'trade');
          }

          return (
            <div className="rounded-[20px] bg-[#131A2D] border border-white/10 p-6 shadow-xl space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white flex items-center gap-2 capitalize">
                  <Clock className="h-5 w-5 text-[#3375BB]" />
                  <span>{activeSection.replace('_', ' ')} History Logs</span>
                </h3>
                <span className="text-xs font-mono text-[#AAB3C5]">
                  {displayTxs.length} Total Records
                </span>
              </div>

              {displayTxs.length === 0 ? (
                <div className="py-12 text-center text-[#AAB3C5] space-y-2">
                  <Clock className="h-10 w-10 mx-auto text-white/20" />
                  <p className="text-sm font-extrabold text-white">
                    No {activeSection.replace('_', ' ')} logs found
                  </p>
                  <p className="text-xs text-[#AAB3C5] max-w-md mx-auto">
                    Your account has no recorded {activeSection.replace('_', ' ')} activity yet. New
                    transactions will be automatically logged here in real time.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-[#AAB3C5] font-bold">
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Asset</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Recipient / Address</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">TX Hash</th>
                        <th className="py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {displayTxs.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <span className="rounded-lg bg-[#3375BB]/10 border border-[#3375BB]/30 px-2 py-0.5 text-[10px] font-extrabold text-[#3375BB] uppercase">
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-white">{tx.assetSymbol}</td>
                          <td className="py-3 px-4 font-bold text-white">{tx.amount}</td>
                          <td className="py-3 px-4 text-white">
                            {tx.toAddress ? (
                              <span className="text-[#3375BB] font-bold max-w-[160px] truncate block text-[11px]" title={tx.toAddress}>
                                {tx.toAddress}
                              </span>
                            ) : tx.fromAddress ? (
                              <span className="text-[#AAB3C5] max-w-[160px] truncate block text-[11px]" title={tx.fromAddress}>
                                From: {tx.fromAddress}
                              </span>
                            ) : (
                              <span className="text-[#AAB3C5]">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[#10B981] font-bold">● {tx.status}</span>
                          </td>
                          <td className="py-3 px-4 text-[#AAB3C5]">
                            {tx.txHash ? `${tx.txHash.slice(0, 10)}...` : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-[#AAB3C5]">
                            {(tx.timestamp || tx.createdAt || new Date().toISOString()).split('T')[0]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}

        {/* SECTION: ANALYTICS & REPORTS */}
        {(activeSection === 'analytics' || activeSection === 'reports') && (() => {
          const userSectionTxs = transactions.filter((tx) => tx.userId === currentUser.id);
          const totalVolUsd = userSectionTxs.reduce(
            (acc, tx) =>
              acc +
              (tx.amountUsd ||
                tx.amount * (assets.find((a) => a.symbol === tx.assetSymbol)?.priceUsd || 1)),
            0
          );
          const completedCount = userSectionTxs.filter((tx) => tx.status === 'completed').length;
          const totalCount = userSectionTxs.length;
          const winRate =
            totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) + '%' : '0.0%';

          return (
            <div className="rounded-[20px] bg-[#131A2D] border border-white/10 p-6 shadow-xl space-y-6 animate-fadeIn">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-[#8B5CF6]" />
                <span>Performance Analytics & Statement Reports</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#0B1020] border border-white/10">
                  <p className="text-xs text-[#AAB3C5]">7-Day Cumulative PnL</p>
                  <p className="text-2xl font-black text-[#3375BB] font-mono mt-1">+$0.00 (0.0%)</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#0B1020] border border-white/10">
                  <p className="text-xs text-[#AAB3C5]">30-Day Trading Volume</p>
                  <p className="text-2xl font-black text-white font-mono mt-1">
                    ${totalVolUsd.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#0B1020] border border-white/10">
                  <p className="text-xs text-[#AAB3C5]">Win Rate</p>
                  <p className="text-2xl font-black text-[#3375BB] font-mono mt-1">{winRate}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* SECTION: KYC VERIFICATION SECTION */}
        {activeSection === 'kyc' && (
          <div className="rounded-[20px] bg-[#131A2D] border border-white/10 p-6 sm:p-8 shadow-xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-[#3375BB]" />
                  <span>Identity Verification (KYC Compliance)</span>
                </h3>
                <p className="text-xs text-[#AAB3C5] mt-1">
                  Upload official state-issued documents to unlock unlimited daily withdrawal limits.
                </p>
              </div>
              <span className="rounded-full bg-[#3375BB]/10 border border-[#3375BB]/50 px-3 py-1 text-xs font-black text-[#3375BB] uppercase">
                Status: VERIFIED
              </span>
            </div>

            <form onSubmit={handleKycSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ID Front Upload Card */}
                <div className="rounded-2xl bg-[#0B1020] border-2 border-dashed border-white/20 p-6 text-center hover:border-[#3375BB] transition-all relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setIdFrontFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="h-12 w-12 rounded-xl bg-[#3375BB]/10 text-[#3375BB] flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h4 className="text-xs font-black text-white">Government ID Front</h4>
                  <p className="text-[10px] text-[#AAB3C5] mt-1">Passport or Driver's License</p>
                  {idFrontFile ? (
                    <p className="text-xs font-bold text-[#3375BB] mt-3 font-mono">
                      ✓ {idFrontFile.name}
                    </p>
                  ) : (
                    <span className="inline-block mt-3 px-3 py-1 rounded-lg bg-white/5 text-[10px] text-white font-bold">
                      Click to Browse
                    </span>
                  )}
                </div>

                {/* ID Back Upload Card */}
                <div className="rounded-2xl bg-[#0B1020] border-2 border-dashed border-white/20 p-6 text-center hover:border-[#3375BB] transition-all relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setIdBackFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="h-12 w-12 rounded-xl bg-[#0500FF]/10 text-[#0500FF] flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h4 className="text-xs font-black text-white">Government ID Back</h4>
                  <p className="text-[10px] text-[#AAB3C5] mt-1">Back side barcode / details</p>
                  {idBackFile ? (
                    <p className="text-xs font-bold text-[#3375BB] mt-3 font-mono">
                      ✓ {idBackFile.name}
                    </p>
                  ) : (
                    <span className="inline-block mt-3 px-3 py-1 rounded-lg bg-white/5 text-[10px] text-white font-bold">
                      Click to Browse
                    </span>
                  )}
                </div>

                {/* Selfie Upload Card */}
                <div className="rounded-2xl bg-[#0B1020] border-2 border-dashed border-white/20 p-6 text-center hover:border-[#3375BB] transition-all relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="h-12 w-12 rounded-xl bg-[#3375BB]/10 text-[#3375BB] flex items-center justify-center mx-auto mb-3">
                    <Camera className="h-6 w-6" />
                  </div>
                  <h4 className="text-xs font-black text-white">Liveness Selfie Verification</h4>
                  <p className="text-[10px] text-[#AAB3C5] mt-1">Clear face photo holding ID</p>
                  {selfieFile ? (
                    <p className="text-xs font-bold text-[#3375BB] mt-3 font-mono">
                      ✓ {selfieFile.name}
                    </p>
                  ) : (
                    <span className="inline-block mt-3 px-3 py-1 rounded-lg bg-white/5 text-[10px] text-white font-bold">
                      Click to Browse
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar Animation */}
              {isUploadingKyc && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[#3375BB] font-bold">
                    <span>Uploading Documents...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0B1020] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#3375BB] to-[#0500FF] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {kycSuccess && (
                <div className="p-4 rounded-2xl bg-[#3375BB]/10 border border-[#3375BB]/40 flex items-center gap-3 text-[#3375BB] text-xs font-bold">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>KYC Documents verified and approved successfully! Unlimited withdrawals active.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploadingKyc}
                className="w-full btn-gradient-primary py-4 text-xs font-black text-[#0B1020] hover:opacity-90 transition-all shadow-xl"
              >
                Submit Documents for KYC Review
              </button>
            </form>
          </div>
        )}

        {/* SECTION: SETTINGS, SECURITY, PROFILE, NOTIFICATIONS, REFERRAL, SUPPORT */}
        {(activeSection === 'settings' ||
          activeSection === 'security' ||
          activeSection === 'profile' ||
          activeSection === 'notifications' ||
          activeSection === 'referral' ||
          activeSection === 'support') && (
          <div className="rounded-[20px] bg-[#131A2D] border border-white/10 p-6 shadow-xl space-y-6 animate-fadeIn">
            <h3 className="text-lg font-black text-white flex items-center gap-2 capitalize">
              <SettingsIcon className="h-5 w-5 text-[#3375BB]" />
              <span>{activeSection} Management</span>
            </h3>

            {activeSection === 'referral' && (
              <div className="p-6 rounded-2xl bg-[#0B1020] border border-white/10 space-y-4">
                <h4 className="text-sm font-bold text-white">Your Unique Referral Link</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://trustpro.exchange/register?ref=${currentUser.id.slice(0, 8)}`}
                    className="w-full rounded-xl bg-[#131A2D] border border-white/10 px-4 py-2.5 text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleCopyReferral}
                    className="btn-gradient-primary px-4 py-2.5 text-xs font-black shrink-0 text-[#0B1020]"
                  >
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#0B1020] border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</p>
                    <p className="text-[10px] text-[#AAB3C5]">Google Authenticator / SMS Code</p>
                  </div>
                  <span className="text-xs font-bold text-[#3375BB]">ENABLED</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#0B1020] border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Anti-Phishing Code</p>
                    <p className="text-[10px] text-[#AAB3C5]">Verify legitimate emails from TrustPro</p>
                  </div>
                  <span className="text-xs font-bold text-[#3375BB]">CONFIGURED</span>
                </div>
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="p-6 rounded-2xl bg-[#0B1020] border border-white/10 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3375BB] via-[#0500FF] to-[#0094FF] text-[#0B1020] font-black text-xl shadow-xl ring-2 ring-white/10 shrink-0">
                    {(currentUser.name || 'US').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white">{currentUser.name}</h4>
                    <p className="text-xs text-[#AAB3C5] font-mono">{currentUser.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#3375BB]/10 border border-[#3375BB]/30 px-3 py-1 text-[11px] font-extrabold text-[#3375BB]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Verified Institutional Web3 Account</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* QUICK FOOTER LINKS BAR & ABOUT/PRIVACY/CONTACT SECTION */}
        <div className="rounded-[22px] bg-[#131A2D] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl mt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-white/10 pb-8">
            {/* Brand Col */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3375BB] to-[#0500FF] p-1.5 shadow-md">
                  <svg className="h-5 w-5 fill-none stroke-white stroke-[2.5]" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5L4 6.5V12C4 17.5 7.5 21.8 12 23C16.5 21.8 20 17.5 20 12V6.5L12 2.5Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-black text-white uppercase tracking-wider">
                    TRUST<span className="text-[#3375BB]">PRO</span>
                  </span>
                  <span className="ml-2 text-[9px] font-mono font-bold text-[#3375BB] bg-[#3375BB]/10 border border-[#3375BB]/30 px-1.5 py-0.5 rounded">
                    MASTER WEB3
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#AAB3C5] leading-relaxed">
                Institutional-grade non-custodial Web3 crypto exchange. Natively powered by & integrated with Trust Wallet security.
              </p>
              <a
                href="https://trustwallet.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#3375BB] hover:underline"
              >
                <span>Trust Wallet Official Website</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Quick Trade Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Trade & Products</h4>
              <ul className="space-y-2 text-xs text-[#AAB3C5]">
                <li>
                  <button onClick={() => setActiveTab('markets')} className="hover:text-white transition-colors">
                    Spot Markets & Order Book
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('swap')} className="hover:text-white transition-colors">
                    Instant Web3 Swap
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('staking')} className="hover:text-white transition-colors">
                    High Yield Staking & Earn
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModal('trade')} className="hover:text-white transition-colors text-[#3375BB] font-bold">
                    Futures 125x Leverage Hub
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal & Policy Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Legal & Security</h4>
              <ul className="space-y-2 text-xs text-[#AAB3C5]">
                <li>
                  <button onClick={() => setActiveModal('privacy')} className="hover:text-white transition-colors flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#3375BB]" />
                    <span>Privacy Policy</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModal('about')} className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-[#0500FF]" />
                    <span>About TrustPro Web3</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModal('contact')} className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#3375BB]" />
                    <span>Contact Us & Helpdesk</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModal('settings')} className="hover:text-white transition-colors flex items-center gap-1.5">
                    <SettingsIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span>Account Settings</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact & Trust Wallet Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Contact & Trust Wallet</h4>
              <p className="text-xs text-[#AAB3C5]">
                24/7 Global Web3 Compliance & Support Desk
              </p>
              <div className="space-y-1.5 text-xs text-white font-mono">
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#3375BB]" />
                  <span>support@trustpro.exchange</span>
                </p>
                <p className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-[#0500FF]" />
                  <a href="https://trustwallet.com" target="_blank" rel="noopener noreferrer" className="hover:underline text-[#3375BB]">
                    www.trustwallet.com
                  </a>
                </p>
              </div>
              <button
                onClick={() => setActiveModal('contact')}
                className="btn-cyan w-full py-2.5 text-xs font-black"
              >
                Open Contact Support
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#AAB3C5]">
            <p>© 2026 TrustPro Master Web3 Exchange. Integrated with Trust Wallet Security Shield. All Rights Reserved.</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveModal('privacy')} className="hover:text-white">Privacy Policy</button>
              <button onClick={() => setActiveModal('about')} className="hover:text-white">About Us</button>
              <button onClick={() => setActiveModal('contact')} className="hover:text-white">Contact Us</button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ABOUT US */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl rounded-[22px] bg-[#131A2D] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 text-[#AAB3C5] hover:text-white rounded-full bg-white/5"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#3375BB] to-[#0500FF] p-2.5 text-white flex items-center justify-center shadow-lg">
                <Info className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">About TrustPro Master Web3</h3>
                <p className="text-xs text-[#3375BB] font-bold">Integrated with Trust Wallet Security Shield</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-[#AAB3C5] leading-relaxed border-t border-white/10 pt-4">
              <p>
                <strong>TrustPro Master Web3 Exchange</strong> was built to redefine high-frequency cryptocurrency trading by merging institutional-grade execution speed with non-custodial decentralized security.
              </p>
              <p>
                Through our direct technical partnership and integration with <strong>Trust Wallet</strong>, users enjoy full sovereign control over their private keys and digital assets without sacrificing trading features like 125x perpetual futures, instant cross-chain swaps, or automated high-yield staking.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#0B1020] border border-white/10 space-y-1">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-[#3375BB]" /> 100,000+ TPS Matching
                  </h4>
                  <p className="text-[11px]">Sub-millisecond trade processing engine with zero slippage execution.</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0B1020] border border-white/10 space-y-1">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#0500FF]" /> Trust Wallet Shield
                  </h4>
                  <p className="text-[11px]">Non-custodial seed phrase protection and hardware-level encryption.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#3375BB]/10 border border-[#3375BB]/30 space-y-2">
                <p className="text-xs font-bold text-white">Official Trust Wallet Website Reference:</p>
                <p className="text-[11px] text-[#AAB3C5]">
                  Learn more about Trust Wallet self-custody and mobile/browser extension tools at{' '}
                  <a href="https://trustwallet.com" target="_blank" rel="noopener noreferrer" className="text-[#3375BB] font-bold hover:underline">
                    https://trustwallet.com
                  </a>
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href="https://trustwallet.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gradient-primary flex-1 py-3 text-xs font-black text-[#0B1020] text-center flex items-center justify-center gap-2"
              >
                <span>Visit Trust Wallet Official Site</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                onClick={() => setActiveModal(null)}
                className="btn-secondary-dark px-6 py-3 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRIVACY POLICY */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl rounded-[22px] bg-[#131A2D] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 text-[#AAB3C5] hover:text-white rounded-full bg-white/5"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#3375BB] to-[#F97316] p-2.5 text-[#0B1020] flex items-center justify-center shadow-lg">
                <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Privacy Policy & Security Guarantee</h3>
                <p className="text-xs text-[#3375BB] font-bold">Zero-Knowledge Non-Custodial Data Standards</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-[#AAB3C5] leading-relaxed border-t border-white/10 pt-4">
              <p>
                <strong>TrustPro Master Web3 Exchange</strong> respects your fundamental right to financial privacy. As a non-custodial Web3 trading platform:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>No Seed Phrase Storage:</strong> Your private keys, seed phrases, and secrets are NEVER transmitted to or stored on our servers.</li>
                <li><strong>Zero IP Tracking:</strong> Web3 wallet interactions are routed through encrypted RPC nodes without storing personal identifier logs.</li>
                <li><strong>End-to-End Client Encryption:</strong> User profile settings and verification documents are protected by AES-256 military-grade encryption.</li>
                <li><strong>Trust Wallet Privacy Compatibility:</strong> Fully adheres to Trust Wallet's privacy standards for dApp interactions.</li>
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="btn-cyan px-8 py-3 text-xs font-black"
              >
                I Understand & Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONTACT US */}
      {activeModal === 'contact' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl rounded-[22px] bg-[#131A2D] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 text-[#AAB3C5] hover:text-white rounded-full bg-white/5"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0500FF] to-[#0094FF] p-2.5 text-white flex items-center justify-center shadow-lg">
                <Phone className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Contact Us & Trust Wallet Support</h3>
                <p className="text-xs text-[#0500FF] font-bold">24/7 Global Customer Support Desk</p>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-4">
              <p className="text-xs text-[#AAB3C5]">
                Our support desk is available 24 hours a day, 7 days a week to assist you with trading inquiries, deposit/withdrawal verifications, and Trust Wallet integrations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#0B1020] border border-white/10 space-y-2">
                  <Mail className="h-5 w-5 text-[#3375BB]" />
                  <h4 className="text-xs font-bold text-white">Email Support</h4>
                  <p className="text-xs font-mono text-[#3375BB]">support@trustpro.exchange</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0B1020] border border-white/10 space-y-2">
                  <Globe className="h-5 w-5 text-[#0500FF]" />
                  <h4 className="text-xs font-bold text-white">Trust Wallet Official Site</h4>
                  <a
                    href="https://trustwallet.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[#3375BB] hover:underline flex items-center gap-1"
                  >
                    <span>https://trustwallet.com</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1020] border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#3375BB]" />
                  <span>Send Direct Message to Support</span>
                </h4>
                <input
                  type="text"
                  placeholder="Subject (e.g. Deposit Inquiry / Trust Wallet Connect)"
                  className="w-full rounded-xl bg-[#131A2D] border border-white/10 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3375BB]"
                />
                <textarea
                  rows={3}
                  placeholder="Describe your issue or question..."
                  className="w-full rounded-xl bg-[#131A2D] border border-white/10 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3375BB]"
                />
                <button
                  type="button"
                  onClick={() => {
                    alert('Your ticket has been submitted to TrustPro Support Desk. We will reply shortly.');
                    setActiveModal(null);
                  }}
                  className="btn-cyan w-full py-2.5 text-xs font-black"
                >
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SETTINGS */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-[22px] bg-[#131A2D] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 text-[#AAB3C5] hover:text-white rounded-full bg-white/5"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#64748B] to-[#475569] p-2.5 text-white flex items-center justify-center shadow-lg">
                <SettingsIcon className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">TrustPro Settings</h3>
                <p className="text-xs text-[#AAB3C5]">Account Preferences & Wallet Defaults</p>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-4 text-xs text-[#AAB3C5]">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-white/10">
                <span>Display Currency</span>
                <span className="font-mono font-bold text-white">USD ($)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-white/10">
                <span>Trust Wallet Auto-Connect</span>
                <span className="font-mono font-bold text-[#3375BB]">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-white/10">
                <span>2FA Security Layer</span>
                <span className="font-mono font-bold text-[#10B981]">Active</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="btn-cyan w-full py-3 text-xs font-black"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* MODAL: TRADE QUICK HUB */}
      {activeModal === 'trade' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-[22px] bg-[#131A2D] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 text-[#AAB3C5] hover:text-white rounded-full bg-white/5"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#3375BB] to-[#0500FF] p-2.5 text-[#0B1020] flex items-center justify-center shadow-lg">
                <TrendingUp className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Master Web3 Trade Hub</h3>
                <p className="text-xs text-[#3375BB] font-bold">Spot, Futures 125x, Swap & Staking</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <button
                onClick={() => {
                  setActiveTab('markets');
                  setActiveModal(null);
                }}
                className="p-4 rounded-xl bg-[#0B1020] border border-white/10 hover:border-[#3375BB] text-left transition-all space-y-1"
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Spot Trading</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#3375BB]" />
                </div>
                <p className="text-[10px] text-[#AAB3C5]">Real-time order book with 350+ pairs</p>
              </button>

              <button
                onClick={() => {
                  setActiveTab('swap');
                  setActiveModal(null);
                }}
                className="p-4 rounded-xl bg-[#0B1020] border border-white/10 hover:border-[#0500FF] text-left transition-all space-y-1"
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Instant Swap</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#0500FF]" />
                </div>
                <p className="text-[10px] text-[#AAB3C5]">0 slippage multi-chain converter</p>
              </button>

              <button
                onClick={() => {
                  setActiveTab('staking');
                  setActiveModal(null);
                }}
                className="p-4 rounded-xl bg-[#0B1020] border border-white/10 hover:border-[#3375BB] text-left transition-all space-y-1"
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Earn & Staking</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#3375BB]" />
                </div>
                <p className="text-[10px] text-[#AAB3C5]">Up to 32.5% APY yield vaults</p>
              </button>

              <a
                href="https://trustwallet.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-[#0B1020] border border-white/10 hover:border-[#EC4899] text-left transition-all space-y-1"
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Trust Wallet dApp</span>
                  <ExternalLink className="h-3.5 w-3.5 text-[#EC4899]" />
                </div>
                <p className="text-[10px] text-[#AAB3C5]">Direct Web3 dApp browser link</p>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
