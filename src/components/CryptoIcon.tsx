import React, { useState } from 'react';

interface CryptoIconProps {
  src?: string;
  symbol: string;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const CryptoIcon: React.FC<CryptoIconProps> = ({
  src,
  symbol,
  name,
  className = '',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);

  const dimensionClasses = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
    xl: 'h-12 w-12 text-base',
  }[size];

  // Symbol color mapping
  const getSymbolGradient = (sym: string) => {
    const uppercase = sym.toUpperCase();
    switch (uppercase) {
      case 'BTC':
        return 'from-[#F7931A] to-[#E07900] text-white';
      case 'ETH':
        return 'from-[#627EEA] to-[#3B51B5] text-white';
      case 'BNB':
        return 'from-[#F3BA2F] to-[#D49E10] text-black font-extrabold';
      case 'SOL':
        return 'from-[#14F195] to-[#9945FF] text-white';
      case 'USDT':
      case 'USDC':
        return 'from-[#26A17B] to-[#127254] text-white';
      case 'XRP':
        return 'from-[#23292F] to-[#111317] text-white border border-white/20';
      case 'DOGE':
        return 'from-[#C2A633] to-[#927A1A] text-white';
      case 'ADA':
        return 'from-[#0033AD] to-[#001D6E] text-white';
      case 'AVAX':
        return 'from-[#E84142] to-[#B3191A] text-white';
      case 'DOT':
        return 'from-[#E6007A] to-[#A30055] text-white';
      default:
        return 'from-[#1E2329] to-[#2B3139] text-[#FCD535] border border-[#FCD535]/30 font-bold';
    }
  };

  if (!src || imageError) {
    return (
      <div
        className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getSymbolGradient(
          symbol
        )} font-mono font-bold shadow-sm ${dimensionClasses} ${className}`}
        title={name || symbol}
      >
        {symbol.slice(0, 3).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name || symbol}
      onError={() => setImageError(true)}
      className={`inline-block shrink-0 rounded-full object-cover ${dimensionClasses} ${className}`}
    />
  );
};
