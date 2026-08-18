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
  const getTokenDisplayData = (asset: CryptoAsset) => {
    const rawBal = currentUser?.balances?.[asset.symbol] || 0;
    const bal = rawBal;
    const usdVal = bal * asset.priceUsd;
    const change = usdVal * (asset.change24h / 100);

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
    <div className="min-h-screen bg-[#121418] text-white pb-28 pt-2 select-none">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        {/* TOP BAR: [ 🛡️ Official ▾ ] on Left, [ ⏱️ ] and [ ⛶ ] on Right */}
        <div className="flex items-center justify-between py-3">
          {/* Wallet Selector Pill */}
          <button
            onClick={() => {
              if (!currentUser) {
                setIsAuthModalOpen(true);
              } else {
                setIsWalletManageOpen(true);
              }
            }}
            className="flex items-center gap-2 rounded-full bg-[#1E2024] hover:bg-[#25282E] border border-white/10 px-3.5 py-1.5 transition-all active:scale-95 shadow-sm"
            id="wallet-selector-pill"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#05D686]/20 text-[#05D686]">
              <Shield className="h-3.5 w-3.5 fill-[#05D686]" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">
              {currentUser?.name || 'Main Web3'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
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
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E2024] hover:bg-[#25282E] text-slate-300 hover:text-white border border-white/10 transition-all active:scale-90"
              title="Transaction History"
              id="header-history-btn"
            >
              <History className="h-4 w-4" />
            </button>

            {/* Scan / Web3 Connect Button */}
            <button
              onClick={() => setIsWeb3ModalOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E2024] hover:bg-[#25282E] text-slate-300 hover:text-white border border-white/10 transition-all active:scale-90"
              title="Scan QR / Connect Web3"
              id="header-scan-btn"
            >
              <Scan className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ONBOARDING HERO FOR FRESH VISITORS */}
        {!currentUser && (
          <div className="relative mt-1 mb-4 overflow-hidden rounded-2xl bg-gradient-to-r from-[#132B21] via-[#16222B] to-[#121418] border border-[#05D686]/40 p-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#05D686]">
                  <ShieldCheck className="h-4 w-4 fill-[#05D686]/20" />
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
                className="flex-1 rounded-xl bg-[#05D686] hover:bg-[#00EC96] text-black py-2 text-xs font-extrabold transition-all text-center shadow-md shadow-[#05D686]/20"
              >
                + Register Account
              </button>
              <button
                onClick={() => setIsWeb3ModalOpen(true)}
                className="flex-1 rounded-xl bg-[#24272D] hover:bg-[#2C3038] border border-white/10 text-white py-2 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
              >
                <Wallet className="h-3.5 w-3.5 text-[#38B6FF]" />
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
                <EyeOff className="h-5 w-5 text-[#05D686]" />
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
              <span className="text-[#05D686] flex items-center gap-1">
                ▲ +${display24hPnlUsd.toFixed(4)} ({display24hPnlPercent.toFixed(2)}%)
              </span>
            ) : (
              <span className="text-[#F6465D] flex items-center gap-1">
                ▼ -${Math.abs(display24hPnlUsd).toFixed(4)} ({Math.abs(display24hPnlPercent).toFixed(2)}%)
              </span>
            )}
          </div>
        </div>

        {/* 4 CORE ACTION BUTTONS: [ Send ], [ Receive ], [ Swap ], [ Buy ] */}
        <div className="flex items-center justify-between my-6 px-2 sm:px-4">
          {/* Send */}
          <button
            onClick={() => handleActionClick('send')}
            className="flex flex-col items-center focus:outline-none group"
            id="trust-action-send"
          >
            <div className="w-[66px] h-[52px] sm:w-[74px] sm:h-[56px] rounded-[22px] bg-[#24272D] hover:bg-[#2C3038] text-white flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm">
              <ArrowUpRight className="h-6 w-6 stroke-[2.4]" />
            </div>
            <span className="text-sm font-bold text-white tracking-normal mt-2">Send</span>
          </button>

          {/* Receive */}
          <button
            onClick={() => handleActionClick('receive')}
            className="flex flex-col items-center focus:outline-none group"
            id="trust-action-receive"
          >
            <div className="w-[66px] h-[52px] sm:w-[74px] sm:h-[56px] rounded-[22px] bg-[#24272D] hover:bg-[#2C3038] text-white flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm">
              <ArrowDown className="h-6 w-6 stroke-[2.4]" />
            </div>
            <span className="text-sm font-bold text-white tracking-normal mt-2">Receive</span>
          </button>

          {/* Swap */}
          <button
            onClick={() => handleActionClick('swap')}
            className="flex flex-col items-center focus:outline-none group"
            id="trust-action-swap"
          >
            <div className="w-[66px] h-[52px] sm:w-[74px] sm:h-[56px] rounded-[22px] bg-[#05D686] hover:bg-[#04c47b] text-[#121418] flex items-center justify-center transition-all duration-150 active:scale-95 shadow-md shadow-[#05D686]/20">
              <Repeat className="h-6 w-6 stroke-[2.4]" />
            </div>
            <span className="text-sm font-bold text-white tracking-normal mt-2">Swap</span>
          </button>

          {/* Buy */}
          <button
            onClick={() => handleActionClick('buy')}
            className="flex flex-col items-center focus:outline-none group"
            id="trust-action-buy"
          >
            <div className="w-[66px] h-[52px] sm:w-[74px] sm:h-[56px] rounded-[22px] bg-[#24272D] hover:bg-[#2C3038] text-white flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm">
              <Plus className="h-6 w-6 stroke-[2.4]" />
            </div>
            <span className="text-sm font-bold text-white tracking-normal mt-2">Buy</span>
          </button>
        </div>

        {/* SECTION HEADER: Tokens > */}
        <div className="flex items-center justify-between pt-3 pb-2">
          <button
            onClick={() => setIsTokenSearchOpen(true)}
            className="flex items-center gap-1 text-base font-bold text-white hover:text-[#05D686] transition-colors group"
            id="tokens-header-btn"
          >
            <span>Tokens</span>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#05D686] group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => setIsTokenSearchOpen(true)}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
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

            return (
              <div
                key={asset.id}
                onClick={() => setSelectedCoinForDetail(asset)}
                className="flex items-center justify-between py-3 px-2 rounded-2xl hover:bg-[#1A1C20] cursor-pointer transition-colors group"
                id={`token-row-${asset.symbol}`}
              >
                {/* Left: Official Icon with Network Badge + Token Name & Live Price */}
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
                      <span className="text-sm font-bold text-white truncate group-hover:text-[#05D686] transition-colors">
                        {asset.symbol === 'USDT' ? 'Tether' : asset.symbol === 'GAS_TRX' ? 'Gas fee TRX' : asset.name}
                      </span>
                      {networkTag && (
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-md bg-[#24272E] text-slate-400 border border-white/5">
                          {networkTag}
                        </span>
                      )}
                    </div>
                    {/* Live Unit Price & 24h Change % */}
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                      <span>
                        ${asset.priceUsd < 0.01
                          ? asset.priceUsd.toFixed(6)
                          : asset.priceUsd < 1
                          ? asset.priceUsd.toFixed(4)
                          : asset.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span
                        className={`font-semibold text-[11px] ${
                          isChangePositive ? 'text-[#05D686]' : 'text-[#F6465D]'
                        }`}
                      >
                        {isChangePositive ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Holding USD Value & Holding Quantity */}
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-white font-mono">
                    {isBalanceHidden
                      ? '••••••'
                      : `$${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`}
                  </div>
                  <div className="text-xs text-slate-400 font-mono truncate">
                    {isBalanceHidden ? '••••••' : balanceFormatted}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add More Tokens Footer Link */}
        <div className="pt-6 pb-4 text-center">
          <button
            onClick={() => setIsTokenSearchOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1E2024] hover:bg-[#25282E] border border-white/5 text-xs font-bold text-slate-300 hover:text-white transition-all active:scale-95"
            id="manage-crypto-bottom-btn"
          >
            <Plus className="h-3.5 w-3.5 text-[#05D686]" />
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
