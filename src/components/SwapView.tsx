import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { CryptoIcon } from './CryptoIcon';
import {
  Repeat,
  ArrowDown,
  Settings,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Shield,
  Layers,
  BarChart3,
  Sliders,
  DollarSign,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface SwingPosition {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  amount: number;
  leverage: number;
  pnlUsd: number;
  pnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: string;
}

export const SwapView: React.FC = () => {
  const { assets, currentUser, setCurrentUser, setUsers, swapCrypto, addNotification, saveToServer } = useWallet();

  // Mode Toggle: 'swap' (Instant DEX Swap) or 'swing' (Pro Swing / Perpetual Trading)
  const [tradingMode, setTradingMode] = useState<'swap' | 'swing'>('swap');

  // Swap State
  const [fromSymbol, setFromSymbol] = useState('USDT');
  const [toSymbol, setToSymbol] = useState('ETH');
  const [fromAmount, setFromAmount] = useState('1000');
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [txResult, setTxResult] = useState<{ success: boolean; message: string; txHash?: string } | null>(null);

  // Swing Trading State
  const [swingSymbol, setSwingSymbol] = useState('ETH');
  const [swingType, setSwingType] = useState<'LONG' | 'SHORT'>('LONG');
  const [swingMargin, setSwingMargin] = useState('250');
  const [swingLeverage, setSwingLeverage] = useState(5);
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLossPercent, setStopLossPercent] = useState('5');
  const [takeProfitPercent, setTakeProfitPercent] = useState('15');
  const [activePositions, setActivePositions] = useState<SwingPosition[]>([
    {
      id: 'pos_1',
      symbol: 'ETH',
      type: 'LONG',
      entryPrice: 2840.5,
      currentPrice: 2895.1,
      amount: 0.85,
      leverage: 5,
      pnlUsd: 46.41,
      pnlPercent: 9.61,
      stopLoss: 2698.0,
      takeProfit: 3266.0,
      timestamp: '2 hours ago',
    },
    {
      id: 'pos_2',
      symbol: 'SOL',
      type: 'SHORT',
      entryPrice: 182.4,
      currentPrice: 178.9,
      amount: 5.5,
      leverage: 3,
      pnlUsd: 19.25,
      pnlPercent: 5.75,
      stopLoss: 191.5,
      takeProfit: 160.0,
      timestamp: '5 hours ago',
    },
  ]);

  const fromAsset = assets.find((a) => a.symbol === fromSymbol) || assets[0];
  const toAsset = assets.find((a) => a.symbol === toSymbol) || assets[1];
  const targetSwingAsset = assets.find((a) => a.symbol === swingSymbol) || assets[1];

  const userFromBalance = currentUser?.balances[fromSymbol] || 0;
  const userUsdtBalance = currentUser?.balances['USDT'] || 0;
  const numFromAmount = parseFloat(fromAmount) || 0;

  // Real Rate Calculation
  const exchangeRate = fromAsset.priceUsd / (toAsset.priceUsd || 1);
  const calculatedToAmount = numFromAmount * exchangeRate;
  const priceImpact = numFromAmount > 10000 ? 0.35 : 0.04;
  const estimatedGasUsd = 1.85;

  // Swing Position calculations
  const parsedMargin = parseFloat(swingMargin) || 0;
  const swingPositionSizeUsd = parsedMargin * swingLeverage;
  const swingTokenAmount = targetSwingAsset.priceUsd > 0 ? swingPositionSizeUsd / targetSwingAsset.priceUsd : 0;
  const estimatedLiqPrice =
    swingType === 'LONG'
      ? targetSwingAsset.priceUsd * (1 - 0.9 / swingLeverage)
      : targetSwingAsset.priceUsd * (1 + 0.9 / swingLeverage);

  const handleSwapTokens = () => {
    const tempSymbol = fromSymbol;
    setFromSymbol(toSymbol);
    setToSymbol(tempSymbol);
  };

  const handleExecuteSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (numFromAmount <= 0) return;

    const res = swapCrypto(fromSymbol, toSymbol, numFromAmount, calculatedToAmount);
    setTxResult(res);

    if (res.success) {
      setTimeout(() => setTxResult(null), 4000);
    }
  };

  const handleOpenSwingPosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedMargin <= 0) return;

    if (userUsdtBalance < parsedMargin) {
      setTxResult({
        success: false,
        message: `Insufficient USDT balance. You have $${userUsdtBalance.toFixed(2)} USDT.`,
      });
      return;
    }

    // Deduct margin from user balances
    if (currentUser) {
      const updatedBalances = {
        ...currentUser.balances,
        USDT: Math.max(0, userUsdtBalance - parsedMargin),
      };

      const updatedUser = {
        ...currentUser,
        balances: updatedBalances,
      };

      setCurrentUser(updatedUser);
      setUsers((prev) => {
        const next = prev.map((u) => (u.id === currentUser.id ? updatedUser : u));
        try {
          localStorage.setItem('trustpro_curr_user_v2', JSON.stringify(updatedUser));
          localStorage.setItem('trustpro_users_v2', JSON.stringify(next));
        } catch (err) {
          console.warn(err);
        }
        saveToServer({ users: next });
        return next;
      });
    }

    const slPrice =
      swingType === 'LONG'
        ? targetSwingAsset.priceUsd * (1 - parseFloat(stopLossPercent) / 100)
        : targetSwingAsset.priceUsd * (1 + parseFloat(stopLossPercent) / 100);

    const tpPrice =
      swingType === 'LONG'
        ? targetSwingAsset.priceUsd * (1 + parseFloat(takeProfitPercent) / 100)
        : targetSwingAsset.priceUsd * (1 - parseFloat(takeProfitPercent) / 100);

    const newPos: SwingPosition = {
      id: 'pos_' + Date.now(),
      symbol: swingSymbol,
      type: swingType,
      entryPrice: targetSwingAsset.priceUsd,
      currentPrice: targetSwingAsset.priceUsd,
      amount: swingTokenAmount,
      leverage: swingLeverage,
      pnlUsd: 0.0,
      pnlPercent: 0.0,
      stopLoss: slPrice,
      takeProfit: tpPrice,
      timestamp: 'Just now',
    };

    setActivePositions((prev) => [newPos, ...prev]);

    if (currentUser) {
      addNotification(
        currentUser.id,
        `Swing ${swingType} Opened (${swingSymbol})`,
        `Opened ${swingLeverage}x ${swingType} on ${swingSymbol} with $${parsedMargin} margin. Est. Position: $${swingPositionSizeUsd.toFixed(2)}.`,
        'transaction'
      );
    }

    setTxResult({
      success: true,
      message: `Swing ${swingType} order executed successfully at $${targetSwingAsset.priceUsd.toLocaleString()}!`,
    });

    setTimeout(() => setTxResult(null), 4000);
  };

  const handleClosePosition = (posId: string) => {
    const pos = activePositions.find((p) => p.id === posId);
    if (!pos) return;

    // Refund margin + PnL
    if (currentUser) {
      const returnUsdt = (pos.amount * pos.currentPrice) / pos.leverage + pos.pnlUsd;
      const newUsdtBal = (currentUser.balances['USDT'] || 0) + Math.max(0, returnUsdt);

      const updatedUser = {
        ...currentUser,
        balances: {
          ...currentUser.balances,
          USDT: newUsdtBal,
        },
      };

      setCurrentUser(updatedUser);
      setUsers((prev) => {
        const next = prev.map((u) => (u.id === currentUser.id ? updatedUser : u));
        saveToServer({ users: next });
        return next;
      });

      addNotification(
        currentUser.id,
        `Swing Position Closed (${pos.symbol})`,
        `Closed ${pos.type} position on ${pos.symbol}. PnL: ${pos.pnlUsd >= 0 ? '+' : ''}$${pos.pnlUsd.toFixed(2)} (${pos.pnlPercent.toFixed(2)}%).`,
        'transaction'
      );
    }

    setActivePositions((prev) => prev.filter((p) => p.id !== posId));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Top Toggle: Instant DEX Swap vs. Pro Swing Trading */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex rounded-2xl bg-[#16181D] p-1 border border-white/10 shadow-lg">
          <button
            type="button"
            onClick={() => setTradingMode('swap')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all ${
              tradingMode === 'swap'
                ? 'bg-[#3862FB] text-white shadow-md shadow-[#3862FB]/20'
                : 'text-slate-400 hover:text-white'
            }`}
            id="tab-mode-instant-swap"
          >
            <Repeat className="h-3.5 w-3.5" />
            <span>Instant DEX Swap</span>
          </button>
          <button
            type="button"
            onClick={() => setTradingMode('swing')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all ${
              tradingMode === 'swing'
                ? 'bg-gradient-to-r from-[#0570F2] to-[#3862FB] text-white shadow-md shadow-[#0570F2]/20'
                : 'text-slate-400 hover:text-white'
            }`}
            id="tab-mode-pro-swing"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Pro Swing Trading</span>
            <span className="rounded-full bg-black/30 px-1.5 py-0.2 text-[9px] font-mono font-bold text-white">
              PRO
            </span>
          </button>
        </div>
      </div>

      <div className="rounded-3xl bg-[#121418] border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#3862FB]/15 blur-3xl pointer-events-none" />

        {/* Feedback alert */}
        {txResult && (
          <div
            className={`mb-6 p-4 rounded-2xl border text-xs flex items-center gap-3 ${
              txResult.success
                ? 'bg-[#3862FB]/10 border-[#3862FB]/30 text-[#38B6FF]'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {txResult.success ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
            <div>
              <p className="font-bold">{txResult.message}</p>
              {txResult.txHash && <p className="font-mono text-[10px] truncate mt-0.5">Hash: {txResult.txHash}</p>}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 1: INSTANT DEX SWAP                                  */}
        {/* ======================================================== */}
        {tradingMode === 'swap' && (
          <div>
            {/* Header Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-[#3862FB]/15 border border-[#3862FB]/30 flex items-center justify-center text-[#38B6FF]">
                  <Repeat className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-white">Trust Wallet DEX Swap</h1>
                  <p className="text-xs text-slate-400">Sub-second multi-chain liquidity aggregation</p>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-xl bg-[#1A1C20] border border-white/10 text-slate-400 hover:text-white transition-colors"
                title="Slippage Settings"
                id="swap-settings-btn"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>

            {/* Slippage Settings Dropdown */}
            {showSettings && (
              <div className="mb-6 p-4 rounded-2xl bg-[#16181D] border border-white/10 text-xs space-y-2 animate-fadeIn">
                <p className="font-bold text-slate-300">Slippage Tolerance</p>
                <div className="flex gap-2">
                  {[0.1, 0.5, 1.0, 3.0].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSlippage(val)}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                        slippage === val
                          ? 'bg-[#3862FB] text-white'
                          : 'bg-[#1E2024] text-slate-400 hover:text-white'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleExecuteSwap} className="space-y-3">
              {/* FROM TOKEN BOX */}
              <div className="rounded-2xl bg-[#16181D] border border-white/10 p-4 transition-all hover:border-white/20">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Pay</span>
                  <span>
                    Balance:{' '}
                    <span className="text-white font-mono font-bold">
                      {userFromBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })}{' '}
                      {fromSymbol}
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    placeholder="0.0"
                    step="any"
                    className="w-full bg-transparent text-2xl sm:text-3xl font-black text-white focus:outline-none placeholder-slate-600 font-mono"
                    id="swap-from-amount-input"
                  />

                  <select
                    value={fromSymbol}
                    onChange={(e) => setFromSymbol(e.target.value)}
                    className="rounded-xl bg-[#25282E] border border-white/10 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#3862FB]"
                    id="swap-from-symbol-select"
                  >
                    {assets.slice(0, 20).map((a) => (
                      <option key={a.id} value={a.symbol}>
                        {a.symbol} (${a.priceUsd.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SWAP REVERSE BUTTON */}
              <div className="flex justify-center -my-2 relative z-10">
                <button
                  type="button"
                  onClick={handleSwapTokens}
                  className="h-10 w-10 rounded-2xl bg-[#1E2024] border border-white/10 hover:border-[#3862FB] flex items-center justify-center text-slate-400 hover:text-[#38B6FF] transition-all shadow-xl hover:rotate-180 duration-300"
                  id="swap-invert-tokens-btn"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>

              {/* TO TOKEN BOX */}
              <div className="rounded-2xl bg-[#16181D] border border-white/10 p-4 transition-all hover:border-white/20">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Receive (Estimated)</span>
                  <span>
                    1 {fromSymbol} ={' '}
                    <span className="text-[#38B6FF] font-mono">
                      {exchangeRate.toFixed(6)} {toSymbol}
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="text-2xl sm:text-3xl font-black text-[#38B6FF] font-mono">
                    {calculatedToAmount.toFixed(6)}
                  </div>

                  <select
                    value={toSymbol}
                    onChange={(e) => setToSymbol(e.target.value)}
                    className="rounded-xl bg-[#25282E] border border-white/10 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#3862FB]"
                    id="swap-to-symbol-select"
                  >
                    {assets.slice(0, 20).map((a) => (
                      <option key={a.id} value={a.symbol}>
                        {a.symbol} (${a.priceUsd.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ROUTE & DETAILS */}
              <div className="rounded-2xl bg-[#16181D] border border-white/5 p-3.5 space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Liquidity Route:</span>
                  <span className="text-white font-mono text-[11px]">Uniswap V3 &rarr; Trust Pool</span>
                </div>
                <div className="flex justify-between">
                  <span>Price Impact:</span>
                  <span className="text-[#38B6FF] font-mono">~{priceImpact}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Network Fee:</span>
                  <span className="text-white font-mono">${estimatedGasUsd} (Subsidized)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={numFromAmount <= 0}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[#3862FB] to-[#38B6FF] hover:opacity-95 text-white font-black text-sm transition-all shadow-lg shadow-[#3862FB]/20 active:scale-[0.98] disabled:opacity-50"
                id="execute-swap-submit-btn"
              >
                <Zap className="h-4 w-4 fill-white" />
                <span>Execute Sub-Second Swap</span>
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 2: PRO SWING TRADING                                 */}
        {/* ======================================================== */}
        {tradingMode === 'swing' && (
          <div className="space-y-5">
            {/* Header Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-[#3862FB]/15 border border-[#3862FB]/30 flex items-center justify-center text-[#3862FB]">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-white">TrustPro Swing Trading</h1>
                  <p className="text-xs text-slate-400">Spot & Perpetual Margin Swing Execution</p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-[#1A1C20] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                <span className="text-slate-400">USDT Margin:</span>
                <span className="font-mono font-bold text-white">${userUsdtBalance.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleOpenSwingPosition} className="space-y-4">
              {/* Asset & Direction Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Asset Pair</label>
                  <select
                    value={swingSymbol}
                    onChange={(e) => setSwingSymbol(e.target.value)}
                    className="w-full rounded-2xl bg-[#16181D] border border-white/10 px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#3862FB]"
                  >
                    {assets.slice(0, 15).map((a) => (
                      <option key={a.id} value={a.symbol}>
                        {a.symbol}/USDT (${a.priceUsd.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Swing Position</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSwingType('LONG')}
                      className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
                        swingType === 'LONG'
                          ? 'bg-[#3862FB] text-white shadow-md shadow-[#3862FB]/20'
                          : 'bg-[#16181D] text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>LONG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSwingType('SHORT')}
                      className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
                        swingType === 'SHORT'
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                          : 'bg-[#16181D] text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      <TrendingDown className="h-3.5 w-3.5" />
                      <span>SHORT</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Leverage Selector */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span className="font-semibold">Leverage Multiplier</span>
                  <span className="font-bold text-white font-mono">{swingLeverage}x Swing Power</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 5, 10, 20].map((lev) => (
                    <button
                      key={lev}
                      type="button"
                      onClick={() => setSwingLeverage(lev)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                        swingLeverage === lev
                          ? 'bg-gradient-to-r from-[#3862FB] to-[#38B6FF] text-white shadow-md'
                          : 'bg-[#16181D] text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Margin Input */}
              <div className="rounded-2xl bg-[#16181D] border border-white/10 p-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Margin Amount (USDT)</span>
                  <span>
                    Position Size:{' '}
                    <span className="text-[#38B6FF] font-bold font-mono">
                      ${swingPositionSizeUsd.toFixed(2)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={swingMargin}
                    onChange={(e) => setSwingMargin(e.target.value)}
                    placeholder="250"
                    min="10"
                    className="w-full bg-transparent text-2xl font-black text-white focus:outline-none placeholder-slate-600 font-mono"
                  />
                  <span className="text-xs font-bold text-slate-400 font-mono">USDT</span>
                </div>
              </div>

              {/* Stop-Loss & Take-Profit Targets */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#16181D] border border-white/10 p-3">
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1">Take-Profit Target</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={takeProfitPercent}
                      onChange={(e) => setTakeProfitPercent(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-[#38B6FF] focus:outline-none font-mono"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#16181D] border border-white/10 p-3">
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1">Stop-Loss Protection</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={stopLossPercent}
                      onChange={(e) => setStopLossPercent(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-rose-400 focus:outline-none font-mono"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </div>
              </div>

              {/* Swing Metrics Box */}
              <div className="rounded-2xl bg-[#16181D] border border-white/5 p-3.5 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Entry Index Price:</span>
                  <span className="font-mono text-white">${targetSwingAsset.priceUsd.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Liquidation Price:</span>
                  <span className="font-mono text-amber-400">${estimatedLiqPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Position Tokens:</span>
                  <span className="font-mono text-white">
                    {swingTokenAmount.toFixed(4)} {swingSymbol}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-[0.98] ${
                  swingType === 'LONG'
                    ? 'bg-[#3862FB] hover:bg-[#2f54db] text-white shadow-[#3862FB]/20'
                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                }`}
              >
                <Zap className="h-4 w-4" />
                <span>
                  Open {swingLeverage}x {swingType} Position on {swingSymbol}
                </span>
              </button>
            </form>

            {/* Active Swing Positions Table */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Active Swing Positions ({activePositions.length})
                </h3>
              </div>

              {activePositions.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 bg-[#16181D] rounded-2xl border border-white/5">
                  No active swing positions open.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activePositions.map((pos) => (
                    <div
                      key={pos.id}
                      className="p-3.5 rounded-2xl bg-[#16181D] border border-white/10 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-mono">{pos.symbol}</span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-extrabold ${
                              pos.type === 'LONG'
                                ? 'bg-[#3862FB]/20 text-[#38B6FF]'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {pos.leverage}x {pos.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 font-mono">
                          Entry: ${pos.entryPrice.toLocaleString()} | Mark: ${pos.currentPrice.toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <div
                          className={`font-mono font-bold ${
                            pos.pnlUsd >= 0 ? 'text-[#38B6FF]' : 'text-rose-400'
                          }`}
                        >
                          {pos.pnlUsd >= 0 ? '+' : ''}${pos.pnlUsd.toFixed(2)} ({pos.pnlPercent.toFixed(2)}%)
                        </div>
                        <button
                          type="button"
                          onClick={() => handleClosePosition(pos.id)}
                          className="mt-1 px-2.5 py-1 rounded-lg bg-[#25282E] hover:bg-rose-500 hover:text-white text-[10px] font-bold text-slate-300 transition-colors"
                        >
                          Close Position
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
