import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { CryptoAsset } from '../types';
import { CryptoIcon } from './CryptoIcon';
import { TokenDetailModal } from './TokenDetailModal';
import { TokenSearchModal } from './TokenSearchModal';
import { WalletManageModal } from './WalletManageModal';
import { BuyCryptoModal } from './BuyCryptoModal';
import { PromoBannerCarousel } from './PromoBannerCarousel';
import {
  ArrowUpRight,
  ArrowDown,
  ArrowDownLeft,
  Repeat,
  Plus,
  ChevronRight,
  Sparkles,
  History,
  Scan,
  Shield,
  ShieldCheck,
  ChevronDown,
  X,
  SlidersHorizontal,
  ExternalLink,
  TrendingDown,
  TrendingUp,
  Wallet,
  Eye,
  EyeOff,
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const {
    currentUser,
    assets,
    watchlist,
    setActiveTab,
    setIsSendModalOpen,
    setIsReceiveModalOpen,
    setSelectedAssetForModal,
    setIsWeb3ModalOpen,
    setIsAuthModalOpen,
  } = useWallet();

  const [selectedCoinForDetail, setSelectedCoinForDetail] = useState<CryptoAsset | null>(null);
  const [isTokenSearchOpen, setIsTokenSearchOpen] = useState(false);
  const [isWalletManageOpen, setIsWalletManageOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(() => {
    return localStorage.getItem('trustpro_hide_balance') === 'true';
  });

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden((prev) => {
      const next = !prev;
      localStorage.setItem('trustpro_hide_balance', String(next));
      return next;
    });
  };

  // Calculate actual total balance from currentUser balances
  let computedTotalUsd = 0;
  let computed24hPnlUsd = 0;

  assets.forEach((asset) => {
    const userAmount = currentUser?.balances?.[asset.symbol] || 0;
    const valUsd = userAmount * asset.priceUsd;
    computedTotalUsd += valUsd;
    computed24hPnlUsd += valUsd * (asset.change24h / 100);
  });

  const displayTotalUsd = computedTotalUsd;
  const display24hPnlUsd = computed24hPnlUsd;
  const display24hPnlPercent =
    computedTotalUsd > 0
      ? (computed24hPnlUsd / computedTotalUsd) * 100
      : 0;

  // Custom priority tokens to match the default order
  const prioritySymbols = ['USDT', 'SOL', 'NEAR', 'BNB', 'ETH', 'BTC', 'TRX', 'GAS_TRX', 'DOGE', 'ADA', 'AVAX', 'POL', 'XRP'];

  // Map and sort assets: show strictly tokens enabled in watchlist OR tokens that have a positive user balance
  const visibleTokens = assets
    .filter((asset) => {
      const hasBal = (currentUser?.balances?.[asset.symbol] || 0) > 0;
      const isWatched = watchlist.includes(asset.symbol);
      return isWatched || hasBal;
    })
    .sort((a, b) => {
      const aBal = currentUser?.balances?.[a.symbol] || 0;
      const bBal = currentUser?.balances?.[b.symbol] || 0;
      if (aBal > 0 && bBal === 0) return -1;
      if (bBal > 0 && aBal === 0) return 1;
      if (aBal > 0 && bBal > 0) return bBal * b.priceUsd - aBal * a.priceUsd;

      const aIdx = prioritySymbols.indexOf(a.symbol);
      const bIdx = prioritySymbols.indexOf(b.symbol);

      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;

      return 0;
    });

  // Specific token display mapping
  const formatUsdDisplay = (val: number): string => {
    if (val === 0) return '$0.00';
    const abs = Math.abs(val);
    if (abs >= 1000) {
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (abs >= 1) {
      return `$${val.toFixed(2)}`;
    }
    if (abs >= 0.001) {
      return `$${val.toFixed(4)}`;
    }
    if (abs >= 0.00001) {
      return `$${val.toFixed(6)}`;
    }
    return `$${val.toFixed(8)}`;
  };

  const formatPnlChangeDisplay = (changeUsd: number, isPositive: boolean, changePercent: number): { text: string; colorClass: string } => {
    const abs = Math.abs(changeUsd);
    if (abs < 0.000000001 || Math.abs(changePercent) < 0.0001) {
      return { text: '$0.00', colorClass: 'text-[#8290A4]' };
    }

    const sign = isPositive ? '+' : '-';
    const colorClass = isPositive ? 'text-[#00D182]' : 'text-[#FF4A5A]';

    let valStr = '';
    if (abs >= 1000) {
      valStr = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (abs >= 1) {
      valStr = abs.toFixed(2);
    } else if (abs >= 0.001) {
      valStr = abs.toFixed(4);
    } else if (abs >= 0.00001) {
      valStr = abs.toFixed(6);
    } else {
      valStr = abs.toFixed(8);
    }

    return {
      text: `${sign}$${valStr}`,
      colorClass,
    };
  };

  const getTokenDisplayData = (asset: CryptoAsset) => {
    const rawBal = currentUser?.balances?.[asset.symbol] || 0;
    const bal = rawBal;

    // If user holds balance, show total USD value of holdings; otherwise show token's live unit price!
    const usdVal = bal > 0 ? bal * asset.priceUsd : asset.priceUsd;
    
    // 24h change in USD: if holding > 0, show holding change, otherwise show coin's per-unit price change in USD
    const change = bal > 0 ? usdVal * (asset.change24h / 100) : asset.priceUsd * (asset.change24h / 100);

    let formattedBal = '0';
    if (bal > 0) {
      if (bal < 0.0001) formattedBal = bal.toFixed(8);
      else if (bal < 1) formattedBal = bal.toFixed(6);
      else formattedBal = bal.toLocaleString(undefined, { maximumFractionDigits: 6 });
    }

    return {
      balanceFormatted: `${formattedBal} ${asset.symbol}`,
      usdValue: usdVal,
      changeUsd: change,
      hasBalance: bal > 0,
    };
  };

  const handleActionClick = (action: 'send' | 'receive' | 'swap' | 'buy') => {
    if (!currentUser && action !== 'receive') {
      setIsAuthModalOpen(true);
      return;
    }
    if (action === 'send') {
      setIsSendModalOpen(true);
    } else if (action === 'receive') {
      setIsReceiveModalOpen(true);
    } else if (action === 'swap') {
      setActiveTab('swap');
    } else if (action === 'buy') {
      setIsBuyModalOpen(true);
    }
  };

  const isAdminAuthorized =
    currentUser?.email.toLowerCase() === 'legendxadmin1999@gmail.com' &&
    currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white pb-28 pt-2 select-none">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        {/* TOP BAR: [ 💳 Official ▾ ] on Left, [ ⏱️ ] and [ ⛶ ] on Right */}
        <div className="flex items-center justify-between py-3">
          {/* Wallet Selector Pill (Exact Trust Wallet UI) */}
          <button
            onClick={() => {
              if (!currentUser) {
                setIsAuthModalOpen(true);
              } else {
                setIsWalletManageOpen(true);
              }
            }}
            className="flex items-center gap-2.5 rounded-full bg-[#181D28] hover:bg-[#202738] border border-[#232A3B] px-3.5 py-1.5 transition-all active:scale-95 shadow-sm"
            id="wallet-selector-pill"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#3862FB] text-white shadow-sm">
              <Wallet className="h-3.5 w-3.5 stroke-[2.2]" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">
              {currentUser?.name || 'Official'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-[#8290A4]" />
          </button>

          {/* Right Action Icons: History & QR Scanner */}
          <div className="flex items-center gap-2.5">
            {isAdminAuthorized && (
              <button
                onClick={() => setActiveTab('admin')}
                className="flex items-center gap-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-full hover:bg-amber-500/30 transition-all"
                title="Super Admin Portal"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin</span>
              </button>
            )}

            {/* History Button */}
            <button
              onClick={() => {
                if (!currentUser) {
                  setIsAuthModalOpen(true);
                } else {
                  setActiveTab('history');
                }
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#181D28] hover:bg-[#202738] text-white border border-[#232A3B] transition-all active:scale-90"
              title="Transaction History"
              id="header-history-btn"
            >
              <History className="h-4 w-4" />
            </button>

            {/* Scan / QR Scanner Button */}
            <button
              onClick={() => setIsWeb3ModalOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#181D28] hover:bg-[#202738] text-white border border-[#232A3B] transition-all active:scale-90"
              title="Scan QR / Connect Web3"
              id="header-scan-btn"
            >
              <Scan className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ONBOARDING HERO FOR FRESH VISITORS */}
        {!currentUser && (
          <div className="relative mt-1 mb-4 overflow-hidden rounded-2xl bg-gradient-to-r from-[#12192A] via-[#161E33] to-[#0B0E14] border border-[#3862FB]/30 p-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#3862FB]">
                  <ShieldCheck className="h-4 w-4 fill-[#3862FB]/20" />
                  <span>Trust Wallet Web3 Hub</span>
                </div>
                <h3 className="text-sm font-extrabold text-white">
                  Welcome to Trust Wallet
                </h3>
                <p className="text-[12px] text-slate-300 leading-snug">
                  Register your personal wallet or connect directly with Trust Wallet Web3.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex-1 rounded-xl bg-[#3862FB] hover:bg-[#2D54E5] text-white py-2 text-xs font-bold transition-all text-center shadow-md shadow-[#3862FB]/30"
              >
                + Register Account
              </button>
              <button
                onClick={() => setIsWeb3ModalOpen(true)}
                className="flex-1 rounded-xl bg-[#181D2A] hover:bg-[#202738] border border-[#232A3B] text-white py-2 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
              >
                <Wallet className="h-3.5 w-3.5 text-[#3862FB]" />
                <span>Connect Trust Web3</span>
              </button>
            </div>
          </div>
        )}

        {/* PROMO BANNER CAROUSEL (Multiple rotating Trust Wallet ads) */}
        <PromoBannerCarousel />

        {/* TOTAL BALANCE SECTION */}
        <div className="text-center py-2 flex flex-col items-center justify-center">
          <div
            onClick={toggleBalanceVisibility}
            className="cursor-pointer group inline-flex items-center justify-center gap-2.5 transition-all select-none hover:opacity-95 active:scale-[0.99]"
            title="Click to hide/show balance"
            id="overview-total-balance-toggle"
          >
            {/* Main Balance */}
            <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
              {isBalanceHidden
                ? '••••••'
                : `$${displayTotalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>

            {/* Eye Toggle Icon */}
            <div className="p-1 rounded-full text-slate-400 group-hover:text-white transition-colors">
              {isBalanceHidden ? (
                <EyeOff className="h-5 w-5 text-[#3862FB]" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </div>
          </div>

          {/* 24h PnL */}
          <div
            onClick={toggleBalanceVisibility}
            className="flex items-center justify-center gap-1 mt-1 text-sm font-semibold cursor-pointer"
          >
            {isBalanceHidden ? (
              <span className="text-slate-500 font-mono text-xs tracking-widest">••••••</span>
            ) : display24hPnlUsd >= 0 ? (
              <span className="text-[#00D182] flex items-center gap-1">
                ▲ +${display24hPnlUsd.toFixed(4)} ({display24hPnlPercent.toFixed(2)}%)
              </span>
            ) : (
              <span className="text-[#FF4A5A] flex items-center gap-1">
                ▼ -${Math.abs(display24hPnlUsd).toFixed(4)} ({Math.abs(display24hPnlPercent).toFixed(2)}%)
              </span>
            )}
          </div>
        </div>

        {/* 4 CORE ACTION BUTTONS: [ Send ], [ Receive ], [ Swap ], [ Buy ] (Exact Screenshot 4 Colors) */}
        <div className="flex items-center justify-between my-6 px-2 sm:px-4">
          {/* Send */}
          <button
            onClick={() => handleActionClick('send')}
            className="flex flex-col items-center focus:outline-none group cursor-pointer"
            id="trust-action-send"
          >
            <div className="w-[66px] h-[52px] sm:w-[74px] sm:h-[56px] rounded-[22px] bg-[#181D2A] hover:bg-[#202738] text-white flex items-center justify-center border border-white/5 transition-all duration-150 active:scale-95 shadow-sm">
              <ArrowUpRight className="h-6 w-6 stroke-[2.4]" />
            </div>
            <span className="text-sm font-bold text-white tracking-normal mt-2">Send</span>
          </button>

          {/* Receive */}
          <button
            onClick={() => handleActionClick('receive')}
            className="flex flex-col items-center focus:outline-none group cursor-pointer"
            id="trust-action-receive"
          >
            <div className="w-[66px] h-[52px] sm:w-[74px] sm:h-[56px] rounded-[22px] bg-[#181D2A] hover:bg-[#202738] text-white flex items-center justify-center border border-white/5 transition-all duration-150 active:scale-95 shadow-sm">
              <ArrowDown className="h-6 w-6 stroke-[2.4]" />
            </div>
            <span className="text-sm font-bold text-white tracking-normal mt-2">Receive</span>
          </button>

          {/* Swap (Trust Signature Electric Royal Blue) */}
          <button
            onClick={() => handleActionClick('swap')}
            className="flex flex-col items-center focus:outline-none group cursor-pointer"
            id="trust-action-swap"
          >
            <div className="w-[66px] h-[52px] sm:w-[74px] sm:h-[56px] rounded-[22px] bg-[#3862FB] hover:bg-[#2D54E5] text-white flex items-center justify-center transition-all duration-150 active:scale-95 shadow-lg shadow-[#3862FB]/30">
              <Repeat className="h-6 w-6 stroke-[2.4]" />
            </div>
            <span className="text-sm font-bold text-white tracking-normal mt-2">Swap</span>
          </button>

          {/* Buy */}
          <button
            onClick={() => handleActionClick('buy')}
            className="flex flex-col items-center focus:outline-none group cursor-pointer"
            id="trust-action-buy"
          >
            <div className="w-[66px] h-[52px] sm:w-[74px] sm:h-[56px] rounded-[22px] bg-[#181D2A] hover:bg-[#202738] text-white flex items-center justify-center border border-white/5 transition-all duration-150 active:scale-95 shadow-sm">
              <Plus className="h-6 w-6 stroke-[2.4]" />
            </div>
            <span className="text-sm font-bold text-white tracking-normal mt-2">Buy</span>
          </button>
        </div>

        {/* SECTION HEADER: Tokens > */}
        <div className="flex items-center justify-between pt-3 pb-2">
          <button
            onClick={() => setIsTokenSearchOpen(true)}
            className="flex items-center gap-1.5 text-lg font-bold text-white hover:text-[#3862FB] transition-colors group cursor-pointer"
            id="tokens-header-btn"
          >
            <span>Tokens</span>
            <ChevronRight className="h-4 w-4 text-[#8290A4] group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => setIsTokenSearchOpen(true)}
            className="text-xs font-semibold text-[#8290A4] hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Manage</span>
          </button>
        </div>

        {/* TOKEN ROWS LIST */}
        <div className="space-y-1 mt-1">
          {visibleTokens.map((asset) => {
            const { balanceFormatted, usdValue, changeUsd } = getTokenDisplayData(asset);
            const isChangePositive = asset.change24h >= 0;

            // Short network badge tag (e.g. TRC20, ERC20, BEP20, SOL)
            const networkTag =
              asset.symbol === 'USDT'
                ? 'TRC20'
                : asset.symbol === 'GAS_TRX' || asset.symbol === 'TRX'
                ? 'TRON'
                : asset.symbol === 'BNB'
                ? 'BEP20'
                : asset.symbol === 'ETH'
                ? 'ERC20'
                : asset.symbol === 'SOL'
                ? 'SOL'
                : asset.symbol === 'NEAR'
                ? 'NEAR'
                : asset.symbol === 'AVAX'
                ? 'AVAX'
                : asset.symbol === 'POL' || asset.symbol === 'MATIC'
                ? 'POL'
                : asset.symbol === 'BTC'
                ? 'BTC'
                : asset.network?.includes('TRC')
                ? 'TRC20'
                : asset.network?.includes('BEP')
                ? 'BEP20'
                : asset.network?.includes('ERC')
                ? 'ERC20'
                : asset.network?.includes('SOL')
                ? 'SOL'
                : null;

            // Proper label matching Trust Wallet (e.g. "Tether USDT", "Solana", "NEAR", "Tron", "Avalanche")
            const displayName =
              asset.symbol === 'USDT'
                ? 'Tether USDT'
                : asset.symbol === 'GAS_TRX'
                ? 'Gas fee TRX'
                : asset.name;

            return (
              <div
                key={asset.id}
                onClick={() => setSelectedCoinForDetail(asset)}
                className="flex items-center justify-between py-3 px-2 rounded-2xl hover:bg-[#121622] cursor-pointer transition-colors group"
                id={`token-row-${asset.symbol}`}
              >
                {/* Left: Official Icon with Network Badge + Token Name & Balance */}
                <div className="flex items-center gap-3 min-w-0">
                  <CryptoIcon
                    symbol={asset.symbol}
                    name={asset.name}
                    network={asset.network}
                    networkBadge={networkTag || undefined}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[15px] font-bold text-white truncate group-hover:text-[#3862FB] transition-colors">
                        {displayName}
                      </span>
                    </div>
                    {/* Holding Quantity */}
                    <div className="text-xs text-[#8290A4] font-mono mt-0.5">
                      {isBalanceHidden ? '••••••' : balanceFormatted}
                    </div>
                  </div>
                </div>

                {/* Right: Holding USD Value & 24h PnL USD change */}
                <div className="text-right shrink-0">
                  <div className="text-[15px] font-bold text-white font-mono">
                    {isBalanceHidden ? '••••••' : formatUsdDisplay(usdValue)}
                  </div>
                  {(() => {
                    const pnl = formatPnlChangeDisplay(changeUsd, isChangePositive, asset.change24h);
                    return (
                      <div className={`text-xs font-semibold font-mono mt-0.5 ${pnl.colorClass}`}>
                        {isBalanceHidden ? '••••••' : pnl.text}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add More Tokens Footer Link */}
        <div className="pt-6 pb-4 text-center">
          <button
            onClick={() => setIsTokenSearchOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#181D2A] hover:bg-[#202738] border border-[#232A3B] text-xs font-bold text-[#8290A4] hover:text-white transition-all active:scale-95 cursor-pointer"
            id="manage-crypto-bottom-btn"
          >
            <Plus className="h-3.5 w-3.5 text-[#3862FB]" />
            <span>Manage Crypto</span>
          </button>
        </div>
      </div>

      {/* Modals & Bottom Sheets */}
      <TokenDetailModal
        asset={selectedCoinForDetail}
        isOpen={!!selectedCoinForDetail}
        onClose={() => setSelectedCoinForDetail(null)}
      />

      <TokenSearchModal
        isOpen={isTokenSearchOpen}
        onClose={() => setIsTokenSearchOpen(false)}
        onSelectToken={(t) => setSelectedCoinForDetail(t)}
      />

      <WalletManageModal
        isOpen={isWalletManageOpen}
        onClose={() => setIsWalletManageOpen(false)}
      />

      <BuyCryptoModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
      />
    </div>
  );
};
