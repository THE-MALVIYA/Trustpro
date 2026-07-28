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
} from 'lucide-react';

export const SwapView: React.FC = () => {
  const { assets, currentUser, swapCrypto } = useWallet();

  const [fromSymbol, setFromSymbol] = useState('USDT');
  const [toSymbol, setToSymbol] = useState('ETH');
  const [fromAmount, setFromAmount] = useState('1000');
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [txResult, setTxResult] = useState<{ success: boolean; message: string; txHash?: string } | null>(null);

  const fromAsset = assets.find((a) => a.symbol === fromSymbol) || assets[0];
  const toAsset = assets.find((a) => a.symbol === toSymbol) || assets[1];

  const userFromBalance = currentUser?.balances[fromSymbol] || 0;
  const numFromAmount = parseFloat(fromAmount) || 0;

  // Real Rate Calculation
  const exchangeRate = fromAsset.priceUsd / (toAsset.priceUsd || 1);
  const calculatedToAmount = numFromAmount * exchangeRate;
  const priceImpact = numFromAmount > 10000 ? 0.35 : 0.04;
  const estimatedGasUsd = 2.5;

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

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="rounded-3xl bg-[#0E1422] border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-[#00D092]/10 border border-[#00D092]/30 flex items-center justify-center text-[#00D092]">
              <Repeat className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-wider">TrustPro Swap</h1>
              <p className="text-xs text-[#B7BDC6]">Sub-second DEX token exchange & liquidity routing</p>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-[#141C2E] border border-white/10 text-[#B7BDC6] hover:text-white transition-colors"
            title="Slippage Settings"
            id="swap-settings-btn"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Slippage Settings Dropdown */}
        {showSettings && (
          <div className="mb-6 p-4 rounded-2xl bg-[#080C14] border border-white/10 text-xs space-y-2 animate-fadeIn">
            <p className="font-bold text-[#B7BDC6]">Slippage Tolerance</p>
            <div className="flex gap-2">
              {[0.1, 0.5, 1.0].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSlippage(val)}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    slippage === val
                      ? 'bg-[#00D092] text-black'
                      : 'bg-[#141C2E] text-[#B7BDC6] hover:text-white'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>
        )}

        {txResult && (
          <div
            className={`mb-6 p-4 rounded-2xl border text-xs flex items-center gap-3 ${
              txResult.success
                ? 'bg-[#00D092]/10 border-[#00D092]/30 text-[#00D092]'
                : 'bg-[#F6465D]/10 border-[#F6465D]/30 text-[#F6465D]'
            }`}
          >
            {txResult.success ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
            <div>
              <p className="font-bold">{txResult.message}</p>
              {txResult.txHash && <p className="font-mono text-[10px] truncate mt-0.5">Hash: {txResult.txHash}</p>}
            </div>
          </div>
        )}

        <form onSubmit={handleExecuteSwap} className="space-y-4">
          {/* FROM TOKEN BOX */}
          <div className="rounded-2xl bg-[#080C14] border border-white/10 p-4 space-y-2">
            <div className="flex justify-between text-xs text-[#B7BDC6] font-medium">
              <span>You Pay</span>
              <button
                type="button"
                onClick={() => setFromAmount(userFromBalance.toString())}
                className="text-[#00D092] font-bold hover:underline"
              >
                Balance: {userFromBalance} {fromSymbol}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="w-full bg-transparent text-2xl font-mono font-bold text-white focus:outline-none"
              />

              <div className="flex items-center gap-2 bg-[#141C2E] border border-white/10 rounded-xl px-2.5 py-1.5">
                <CryptoIcon symbol={fromAsset.symbol} src={fromAsset.icon} size="sm" />
                <select
                  value={fromSymbol}
                  onChange={(e) => setFromSymbol(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.symbol} className="bg-[#080C14] text-white">
                      {a.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-[10px] text-[#7A8494] font-mono">
              ≈ ${(numFromAmount * fromAsset.priceUsd).toFixed(2)}
            </p>
          </div>

          {/* SWAP DIRECTION BUTTON */}
          <div className="relative flex justify-center -my-2 z-10">
            <button
              type="button"
              onClick={handleSwapTokens}
              className="h-10 w-10 rounded-2xl bg-[#141C2E] border border-white/20 flex items-center justify-center text-[#00D092] hover:scale-110 transition-transform shadow-lg"
              title="Reverse direction"
              id="reverse-swap-direction-btn"
            >
              <ArrowDown className="h-5 w-5" />
            </button>
          </div>

          {/* TO TOKEN BOX */}
          <div className="rounded-2xl bg-[#080C14] border border-white/10 p-4 space-y-2">
            <div className="flex justify-between text-xs text-[#B7BDC6] font-medium">
              <span>You Receive (Estimated)</span>
              <span>Balance: {currentUser?.balances[toSymbol] || 0} {toSymbol}</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                readOnly
                value={calculatedToAmount > 0 ? calculatedToAmount.toFixed(6) : '0.00'}
                className="w-full bg-transparent text-2xl font-mono font-bold text-[#00D092] focus:outline-none"
              />

              <div className="flex items-center gap-2 bg-[#141C2E] border border-white/10 rounded-xl px-2.5 py-1.5">
                <CryptoIcon symbol={toAsset.symbol} src={toAsset.icon} size="sm" />
                <select
                  value={toSymbol}
                  onChange={(e) => setToSymbol(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.symbol} className="bg-[#080C14] text-white">
                      {a.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-[10px] text-[#7A8494] font-mono">
              ≈ ${(calculatedToAmount * toAsset.priceUsd).toFixed(2)}
            </p>
          </div>

          {/* ROUTE PREVIEW & GAS DETAILS */}
          <div className="rounded-2xl bg-[#080C14]/80 border border-white/10 p-4 text-xs space-y-2">
            <div className="flex justify-between text-[#B7BDC6]">
              <span>Exchange Rate</span>
              <span className="font-mono text-white">
                1 {fromSymbol} = {exchangeRate.toFixed(6)} {toSymbol}
              </span>
            </div>
            <div className="flex justify-between text-[#B7BDC6]">
              <span>Best Route Aggregator</span>
              <span className="text-[#00D092] font-semibold flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> TrustPro Liquidity Engine
              </span>
            </div>
            <div className="flex justify-between text-[#B7BDC6]">
              <span>Price Impact</span>
              <span className="text-white font-mono">~{priceImpact}%</span>
            </div>
            <div className="flex justify-between text-[#B7BDC6]">
              <span>Estimated Network Gas</span>
              <span className="text-white font-mono">${estimatedGasUsd.toFixed(2)}</span>
            </div>
          </div>

          {/* EXECUTE BUTTON */}
          <button
            type="submit"
            className="w-full btn-cyan py-4 text-sm font-extrabold text-black hover:opacity-95 transition-all shadow-xl shadow-[#00D092]/20"
            id="execute-swap-btn"
          >
            Swap {fromSymbol} to {toSymbol}
          </button>
        </form>
      </div>
    </div>
  );
};
