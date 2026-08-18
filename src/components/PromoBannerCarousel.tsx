import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Sparkles,
  X,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Repeat,
  Coins,
  Flame,
  Zap,
} from 'lucide-react';

interface PromoAd {
  id: string;
  title: string;
  actionText: string;
  targetTab: 'defi' | 'staking' | 'swap' | 'markets' | 'settings';
  gradientRing: string;
  icon: React.ReactNode;
  badge?: string;
}

const PROMO_ADS: PromoAd[] = [
  {
    id: 'hyperliquid',
    title: 'Explore Hyperliquid: 200+ perpetual markets & yield...',
    actionText: 'Explore now',
    targetTab: 'defi',
    gradientRing: 'from-[#9945FF] via-[#14F195] to-[#00C2FF]',
    icon: <Sparkles className="h-5 w-5 text-[#14F195]" />,
    badge: 'Trending',
  },
  {
    id: 'launchpool',
    title: 'Trust Wallet Launchpool: Stake BNB / TWT to farm free tokens',
    actionText: 'Stake now',
    targetTab: 'staking',
    gradientRing: 'from-[#F3BA2F] via-[#05D686] to-[#38B6FF]',
    icon: <Coins className="h-5 w-5 text-[#F3BA2F]" />,
    badge: 'Airdrop',
  },
  {
    id: 'staking_apy',
    title: 'Native Liquid Staking: Earn up to 18.5% APY on SOL & ETH',
    actionText: 'Earn APY',
    targetTab: 'staking',
    gradientRing: 'from-[#14F195] via-[#00C2FF] to-[#9945FF]',
    icon: <TrendingUp className="h-5 w-5 text-[#00EC96]" />,
    badge: '18.5% APY',
  },
  {
    id: 'crosschain_swap',
    title: 'Swap 10,000+ tokens across 100+ chains with zero extra gas',
    actionText: 'Swap now',
    targetTab: 'swap',
    gradientRing: 'from-[#38B6FF] via-[#05D686] to-[#F3BA2F]',
    icon: <Repeat className="h-5 w-5 text-[#38B6FF]" />,
    badge: 'Zero Slippage',
  },
  {
    id: 'security_shield',
    title: 'Trust Wallet Security Shield: 24/7 Web3 Scam Protection active',
    actionText: 'Learn more',
    targetTab: 'settings',
    gradientRing: 'from-[#05D686] via-[#38B6FF] to-[#9945FF]',
    icon: <ShieldCheck className="h-5 w-5 text-[#05D686]" />,
    badge: 'Protected',
  },
];

export const PromoBannerCarousel: React.FC = () => {
  const { setActiveTab } = useWallet();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isDismissed || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMO_ADS.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isDismissed, isPaused]);

  if (isDismissed) return null;

  const currentAd = PROMO_ADS[currentIndex];

  const handleBannerClick = () => {
    setActiveTab(currentAd.targetTab);
  };

  return (
    <div
      className="relative mt-2 mb-5 overflow-hidden rounded-2xl bg-[#1A1C20] border border-white/10 p-3.5 shadow-md group transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      id={`promo-ad-${currentAd.id}`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Banner Clickable Content */}
        <div
          onClick={handleBannerClick}
          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
        >
          {/* Glowing Animated Circular Orb Icon */}
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${currentAd.gradientRing} p-0.5 shadow-lg transition-transform group-hover:scale-105`}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#121418]">
              {currentAd.icon}
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2">
              <h4 className="text-[13px] font-bold text-white tracking-tight truncate">
                {currentAd.title}
              </h4>
            </div>
            <div className="flex items-center gap-1 text-[12px] font-bold text-[#05D686] hover:text-[#00EC96] transition-colors mt-0.5">
              <span>{currentAd.actionText}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* Right Controls: Dots & Close Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Dot Indicators */}
          <div className="hidden sm:flex items-center gap-1 bg-[#121418]/80 px-2 py-1 rounded-full border border-white/5">
            {PROMO_ADS.map((ad, idx) => (
              <button
                key={ad.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-4 bg-[#05D686]' : 'w-1.5 bg-white/20 hover:bg-white/40'
                }`}
                title={`Ad ${idx + 1}`}
              />
            ))}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss Announcement"
            id="close-promo-banner-btn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
