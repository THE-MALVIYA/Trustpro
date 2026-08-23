import React, { useState } from 'react';

export interface CryptoIconProps {
  src?: string;
  symbol: string;
  name?: string;
  network?: string;
  networkBadge?: 'TRC20' | 'ERC20' | 'BEP20' | 'SOL' | 'POL' | 'BTC' | 'TON' | 'SUI' | 'NEAR' | 'AVAX' | 'ARB' | 'OP' | string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showBadge?: boolean;
}

// Official High-Resolution Verified Logos (CoinGecko + Trust Wallet Assets CDN)
const OFFICIAL_ICON_URLS: Record<string, string> = {
  USDT: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
  BTC: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  BNB: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  TRX: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
  GAS_TRX: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
  NEAR: 'https://assets.coingecko.com/coins/images/10365/large/near.png',
  XRP: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
  ADA: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
  AVAX: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
  DOT: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
  LINK: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
  SHIB: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
  TON: 'https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png',
  LTC: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
  SUI: 'https://assets.coingecko.com/coins/images/26375/large/sui-ocean-square.png',
  PEPE: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
  APT: 'https://assets.coingecko.com/coins/images/26455/large/aptos_round.png',
  RNDR: 'https://assets.coingecko.com/coins/images/11636/large/rndr.png',
  TAO: 'https://assets.coingecko.com/coins/images/29165/large/tao.png',
  ARB: 'https://assets.coingecko.com/coins/images/16547/large/arbitrum_logo.png',
  OP: 'https://assets.coingecko.com/coins/images/25244/large/OP.png',
  POL: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
  MATIC: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
  UNI: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
  KAS: 'https://assets.coingecko.com/coins/images/25751/large/kaspa-icon300.png',
  XMR: 'https://assets.coingecko.com/coins/images/69/large/monero_logo.png',
  ATOM: 'https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png',
  XLM: 'https://assets.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png',
  BCH: 'https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png',
  WIF: 'https://assets.coingecko.com/coins/images/33566/large/wif.png',
  BONK: 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg',
  INJ: 'https://assets.coingecko.com/coins/images/12882/large/injective_logo.png',
  TIA: 'https://assets.coingecko.com/coins/images/31967/large/tia.png',
  FLOKI: 'https://assets.coingecko.com/coins/images/16746/large/FLOKI.png',
  FET: 'https://assets.coingecko.com/coins/images/5681/large/Fetch.jpg',
  STX: 'https://assets.coingecko.com/coins/images/2069/large/Stacks_logo_full.png',
  CRV: 'https://assets.coingecko.com/coins/images/12124/large/Curve.png',
  MKR: 'https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png',
  AAVE: 'https://assets.coingecko.com/coins/images/12645/large/AAVE.png',
  FIL: 'https://assets.coingecko.com/coins/images/12817/large/filecoin.png',
  HBAR: 'https://assets.coingecko.com/coins/images/3688/large/hbar.png',
  ICP: 'https://assets.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png',
  SEI: 'https://assets.coingecko.com/coins/images/28205/large/Sei_Logo_-_Transparent.png',
  JUP: 'https://assets.coingecko.com/coins/images/34188/large/jup.png',
  WLD: 'https://assets.coingecko.com/coins/images/31062/large/worldcoin.png',
  RUNE: 'https://assets.coingecko.com/coins/images/13677/large/Thorchain_logo.png',
  ETC: 'https://assets.coingecko.com/coins/images/453/large/ethereum-classic-logo.png',
  ALGO: 'https://assets.coingecko.com/coins/images/4380/large/download.png',
  VET: 'https://assets.coingecko.com/coins/images/1167/large/VeChain-Logo-768x725.png',
};

// Official Blockchain Network Badge Icons
const NETWORK_BADGE_URLS: Record<string, string> = {
  TRC20: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
  TRON: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
  ERC20: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  BEP20: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  BSC: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  BNB: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  POL: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
  POLYGON: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
  BTC: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  TON: 'https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png',
  SUI: 'https://assets.coingecko.com/coins/images/26375/large/sui-ocean-square.png',
  NEAR: 'https://assets.coingecko.com/coins/images/10365/large/near.png',
  AVAX: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
  ARB: 'https://assets.coingecko.com/coins/images/16547/large/arbitrum_logo.png',
  OP: 'https://assets.coingecko.com/coins/images/25244/large/OP.png',
};

// Secondary CDN Fallback
const SECONDARY_CDN_URLS: Record<string, string> = {
  USDT: 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/usdt.png',
  BTC: 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/btc.png',
  ETH: 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/eth.png',
  BNB: 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/bnb.png',
  SOL: 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/sol.png',
  TRX: 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/trx.png',
  XRP: 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/xrp.png',
  DOGE: 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/doge.png',
  ADA: 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/ada.png',
  AVAX: 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/avax.png',
  DOT: 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/dot.png',
  LINK: 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/link.png',
  LTC: 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/ltc.png',
  USDC: 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/usdc.png',
  UNI: 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/uni.png',
  ATOM: 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/atom.png',
};

export const CryptoIcon: React.FC<CryptoIconProps> = ({
  src,
  symbol,
  name,
  network,
  networkBadge,
  className = '',
  size = 'md',
  showBadge = true,
}) => {
  const [imageErrorLevel, setImageErrorLevel] = useState(0);
  const [badgeImageError, setBadgeImageError] = useState(false);

  const dimensionClasses = {
    xs: 'h-5 w-5 text-[9px]',
    sm: 'h-7 w-7 text-[10px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-12 w-12 text-sm',
    xl: 'h-14 w-14 text-base',
    '2xl': 'h-16 w-16 text-lg',
  }[size];

  const badgeSizeClasses = {
    xs: 'h-[10px] w-[10px] -bottom-0.5 -right-0.5 ring-1 ring-[#121418]',
    sm: 'h-[13px] w-[13px] -bottom-0.5 -right-0.5 ring-[1.5px] ring-[#121418]',
    md: 'h-[17px] w-[17px] -bottom-0.5 -right-0.5 ring-2 ring-[#121418]',
    lg: 'h-[20px] w-[20px] -bottom-1 -right-1 ring-2 ring-[#121418]',
    xl: 'h-[24px] w-[24px] -bottom-1 -right-1 ring-2 ring-[#121418]',
    '2xl': 'h-[28px] w-[28px] -bottom-1.5 -right-1.5 ring-2 ring-[#121418]',
  }[size];

  const uppercaseSym = (symbol || '').toUpperCase().trim();

  // Determine if this token needs a network badge (exact Trust Wallet signature styling)
  const inferredBadge: string | undefined =
    networkBadge ||
    (uppercaseSym === 'USDT'
      ? (network?.includes('ERC') ? 'ERC20' : network?.includes('BEP') ? 'BEP20' : network?.includes('SOL') ? 'SOL' : 'TRC20')
      : uppercaseSym === 'USDC'
      ? (network?.includes('SOL') ? 'SOL' : network?.includes('POL') ? 'POL' : network?.includes('TRC') ? 'TRC20' : 'ERC20')
      : network?.includes('TRC') || network?.includes('TRON')
      ? 'TRC20'
      : network?.includes('BEP') || network?.includes('BSC') || network?.includes('Smart Chain')
      ? 'BEP20'
      : network?.includes('ERC') || network?.includes('Ethereum')
      ? 'ERC20'
      : network?.includes('SOL') || network?.includes('Solana')
      ? 'SOL'
      : network?.includes('POL') || network?.includes('Polygon')
      ? 'POL'
      : network?.includes('Bitcoin') || network?.includes('BTC')
      ? 'BTC'
      : network?.includes('TON')
      ? 'TON'
      : network?.includes('SUI')
      ? 'SUI'
      : network?.includes('NEAR')
      ? 'NEAR'
      : network?.includes('AVAX') || network?.includes('Avalanche')
      ? 'AVAX'
      : network?.includes('ARB') || network?.includes('Arbitrum')
      ? 'ARB'
      : undefined);

  // Exact vector SVGs fallback if external images are blocked
  const renderVectorFallback = (sym: string) => {
    switch (sym) {
      case 'USDT':
        return (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#009393] text-white shadow-sm overflow-hidden p-1.5">
            <svg viewBox="0 0 32 32" className="h-full w-full fill-current">
              <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003C9.914 17.15 6.5 15.65 6.5 13.84c0-1.81 3.414-3.31 7.509-3.543v2.81c.25.012.961.042 1.971.042 1.265 0 1.832-.034 1.942-.042v-2.81c4.095.233 7.509 1.733 7.509 3.543 0 1.81-3.414 3.31-7.509 3.543zm0-8.916V5.5h-3.913v2.967C7.683 8.742 3 10.967 3 13.84c0 2.873 4.683 5.098 11.009 5.373v7.287h3.913v-7.287c6.326-.275 11.009-2.5 11.009-5.373 0-2.873-4.683-5.098-11.009-5.373z" />
            </svg>
          </div>
        );

      case 'SOL':
        return (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#121418] border border-white/10 shadow-sm p-1.5">
            <svg viewBox="0 0 397 311" className="h-full w-full">
              <defs>
                <linearGradient id="solGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00FFA3" />
                  <stop offset="50%" stopColor="#DC1FFF" />
                  <stop offset="100%" stopColor="#00FFA3" />
                </linearGradient>
              </defs>
              <path
                fill="url(#solGrad)"
                d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7zM64.6 3.8C67 1.4 70.3 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8zm266.3 115.1c-2.4-2.4-5.7-3.8-9.2-3.8H4.3c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"
              />
            </svg>
          </div>
        );

      case 'TRX':
      case 'GAS_TRX':
        return (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#FF0013] text-white shadow-sm p-1.5">
            <svg viewBox="0 0 100 100" className="h-full w-full fill-white">
              <polygon points="50,5 95,30 80,95 20,95 5,30" fill="none" stroke="white" strokeWidth="6" />
              <polygon points="50,20 80,85 20,85" fill="white" />
            </svg>
          </div>
        );

      case 'BNB':
        return (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#F3BA2F] text-black shadow-sm p-1.5">
            <svg viewBox="0 0 120 120" className="h-full w-full fill-[#121418]">
              <path d="M60 15L78 33L60 51L42 33L60 15ZM60 69L78 87L60 105L42 87L60 69ZM24 51L42 69L24 87L6 69L24 51ZM96 51L114 69L96 87L78 69L96 51ZM60 42L72 54L60 66L48 54L60 42Z" />
            </svg>
          </div>
        );

      case 'ETH':
        return (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#627EEA] text-white shadow-sm p-1.5">
            <svg viewBox="0 0 784 1277" className="h-3/4 w-3/4 fill-white">
              <polygon
                points="392.07 0 383.5 29.11 383.5 873.74 392.07 882.29 784.13 650.54"
                fill="#FFFFFF"
                fillOpacity="0.7"
              />
              <polygon points="392.07 0 0 650.54 392.07 882.29 392.07 472.33" fill="#FFFFFF" />
              <polygon
                points="392.07 956.52 387.24 962.41 387.24 1263.28 392.07 1277.38 784.37 724.89"
                fill="#FFFFFF"
                fillOpacity="0.7"
              />
              <polygon points="392.07 1277.38 392.07 956.52 0 724.89" fill="#FFFFFF" />
            </svg>
          </div>
        );

      case 'BTC':
        return (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#F7931A] text-white shadow-sm p-1.5">
            <svg viewBox="0 0 32 32" className="h-4/5 w-4/5 fill-white">
              <path d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.314-1.256-.314l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.704 2.82 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.537c-.534 2.146-4.148.986-5.318.695l.95-3.805c1.17.292 4.929.871 4.368 3.11zm.535-5.567c-.488 1.954-3.495.962-4.471.718l.86-3.45c.976.244 4.124.7 3.611 2.732z" />
            </svg>
          </div>
        );

      case 'NEAR':
        return (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-black text-white border border-white/20 shadow-sm p-2">
            <svg viewBox="0 0 100 100" className="h-full w-full fill-white">
              <path
                d="M25 80V20L75 80V20"
                stroke="white"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        );

      case 'XRP':
        return (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#23292F] text-white shadow-sm p-2">
            <svg viewBox="0 0 100 100" className="h-full w-full fill-white">
              <path d="M80.5 15H94L50 59 6 15h13.5L50 45.5z M6 85h13.5L50 54.5 80.5 85H94L50 41z" />
            </svg>
          </div>
        );

      case 'DOGE':
        return (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#C2A633] text-white font-black shadow-sm text-base">
            Ð
          </div>
        );

      default:
        return (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#1E222B] text-[#3862FB] font-bold font-mono border border-white/10 shadow-sm">
            {sym.slice(0, 3)}
          </div>
        );
    }
  };

  // Determine current image source based on error fallback hierarchy
  const getResolvedImageSrc = () => {
    if (imageErrorLevel === 0) {
      return src || OFFICIAL_ICON_URLS[uppercaseSym];
    }
    if (imageErrorLevel === 1) {
      return SECONDARY_CDN_URLS[uppercaseSym];
    }
    return null;
  };

  const resolvedImgSrc = getResolvedImageSrc();

  // Signature Trust Wallet Original Network Badge Renderer
  const renderBadge = () => {
    if (!showBadge || !inferredBadge) return null;

    const badgeUrl = NETWORK_BADGE_URLS[inferredBadge];

    // If official image is available and not failed, render official high-res logo
    if (badgeUrl && !badgeImageError) {
      return (
        <div
          className={`absolute ${badgeSizeClasses} flex items-center justify-center rounded-full bg-[#121418] shadow-md z-10 overflow-hidden shrink-0`}
          title={`${inferredBadge} Network`}
        >
          <img
            src={badgeUrl}
            alt={inferredBadge}
            onError={() => setBadgeImageError(true)}
            className="h-full w-full rounded-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }

    // Vector fallback for badges
    if (inferredBadge === 'TRC20' || inferredBadge === 'TRON') {
      return (
        <div
          className={`absolute ${badgeSizeClasses} flex items-center justify-center rounded-full bg-[#FF0013] text-white shadow-lg z-10 p-[1.5px]`}
          title="TRON Network (TRC-20)"
        >
          <svg viewBox="0 0 100 100" className="h-full w-full fill-white">
            <polygon points="50,12 88,32 78,88 50,78 22,88 12,32" fill="none" stroke="white" strokeWidth="6" />
            <polygon points="50,22 75,78 25,78" fill="white" />
          </svg>
        </div>
      );
    }

    if (inferredBadge === 'BEP20' || inferredBadge === 'BSC' || inferredBadge === 'BNB') {
      return (
        <div
          className={`absolute ${badgeSizeClasses} flex items-center justify-center rounded-full bg-[#F3BA2F] text-[#121418] shadow-lg z-10 p-[1.5px]`}
          title="BNB Smart Chain (BEP-20)"
        >
          <svg viewBox="0 0 120 120" className="h-full w-full fill-[#121418]">
            <path d="M60 15L78 33L60 51L42 33L60 15ZM60 69L78 87L60 105L42 87L60 69ZM24 51L42 69L24 87L6 69L24 51ZM96 51L114 69L96 87L78 69L96 51ZM60 42L72 54L60 66L48 54L60 42Z" />
          </svg>
        </div>
      );
    }

    if (inferredBadge === 'ERC20' || inferredBadge === 'ETH') {
      return (
        <div
          className={`absolute ${badgeSizeClasses} flex items-center justify-center rounded-full bg-[#627EEA] text-white shadow-lg z-10 p-[1.5px]`}
          title="Ethereum (ERC-20)"
        >
          <svg viewBox="0 0 784 1277" className="h-full w-full fill-white">
            <polygon points="392.07 0 383.5 29.11 383.5 873.74 392.07 882.29 784.13 650.54" fill="#FFFFFF" fillOpacity="0.75" />
            <polygon points="392.07 0 0 650.54 392.07 882.29 392.07 472.33" fill="#FFFFFF" />
            <polygon points="392.07 956.52 387.24 962.41 387.24 1263.28 392.07 1277.38 784.37 724.89" fill="#FFFFFF" fillOpacity="0.75" />
            <polygon points="392.07 1277.38 392.07 956.52 0 724.89" fill="#FFFFFF" />
          </svg>
        </div>
      );
    }

    if (inferredBadge === 'SOL') {
      return (
        <div
          className={`absolute ${badgeSizeClasses} flex items-center justify-center rounded-full bg-[#121418] border border-[#00FFA3]/40 shadow-lg z-10 p-[1.5px]`}
          title="Solana SPL"
        >
          <svg viewBox="0 0 397 311" className="h-full w-full">
            <defs>
              <linearGradient id="solBadgeVec" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00FFA3" />
                <stop offset="100%" stopColor="#DC1FFF" />
              </linearGradient>
            </defs>
            <path
              fill="url(#solBadgeVec)"
              d="M64.6 237.9h317.4l-62.7 62.7H6.5l62.7-62.7zM64.6 3.8h317.4L319.3 66.5H6.5L64.6 3.8zm266.3 115.1H4.3l62.7 62.7h317.4l-62.7-62.7z"
            />
          </svg>
        </div>
      );
    }

    if (inferredBadge === 'POL' || inferredBadge === 'Polygon') {
      return (
        <div
          className={`absolute ${badgeSizeClasses} flex items-center justify-center rounded-full bg-[#8247E5] text-white shadow-lg z-10 p-[1.5px]`}
          title="Polygon Network"
        >
          <svg viewBox="0 0 100 100" className="h-full w-full fill-white">
            <polygon points="50,10 90,32 90,78 50,100 10,78 10,32" fill="white" />
          </svg>
        </div>
      );
    }

    if (inferredBadge === 'BTC') {
      return (
        <div
          className={`absolute ${badgeSizeClasses} flex items-center justify-center rounded-full bg-[#F7931A] text-white shadow-lg z-10`}
          title="Bitcoin Network"
        >
          <span className="text-[8px] font-black leading-none select-none">₿</span>
        </div>
      );
    }

    if (inferredBadge === 'TON') {
      return (
        <div
          className={`absolute ${badgeSizeClasses} flex items-center justify-center rounded-full bg-[#0098EA] text-white shadow-lg z-10 p-[1.5px]`}
          title="The Open Network"
        >
          <svg viewBox="0 0 100 100" className="h-full w-full fill-white">
            <polygon points="50,15 85,75 50,60 15,75" />
          </svg>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`relative inline-flex shrink-0 items-center justify-center ${dimensionClasses} ${className}`}>
      {resolvedImgSrc ? (
        <img
          src={resolvedImgSrc}
          alt={name || symbol}
          onError={() => setImageErrorLevel((prev) => prev + 1)}
          className="h-full w-full rounded-full object-cover shadow-sm bg-[#1A1C20] border border-white/5"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        renderVectorFallback(uppercaseSym)
      )}
      {renderBadge()}
    </div>
  );
};
