import React, { useState } from 'react';
import { useWallet, getUserReceiveAddress } from '../context/WalletContext';
import { CryptoAsset } from '../types';
import { CryptoIcon } from './CryptoIcon';
import {
  X,
  CreditCard,
  Building2,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Zap,
  Globe,
  ChevronDown,
  Sparkles,
  Layers,
  Lock,
} from 'lucide-react';

interface BuyCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSymbol?: string;
}

interface FiatCurrency {
  code: string;
  symbol: string;
  name: string;
  rateToUsd: number;
}

const FIAT_CURRENCIES: FiatCurrency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rateToUsd: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', rateToUsd: 1.08 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateToUsd: 1.28 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToUsd: 0.0116 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateToUsd: 0.272 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToUsd: 0.73 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToUsd: 0.65 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUsd: 0.0065 },
];

const ONRAMP_PROVIDERS = [
  {
    id: 'moonpay',
    name: 'MoonPay',
    tagline: 'Fastest Card & Apple Pay processing',
    feePercent: 1.5,
    speed: 'Instant (~2 mins)',
    badge: 'Popular',
    icon: '⚡',
  },
  {
    id: 'transak',
    name: 'Transak',
    tagline: 'Lowest fees on Bank Transfers & UPI',
    feePercent: 0.99,
    speed: 'Fast (~5 mins)',
    badge: 'Best Rate',
    icon: '🏦',
  },
  {
    id: 'binance',
    name: 'Binance Connect',
    tagline: 'Global liquidity with verified trust',
    feePercent: 1.2,
    speed: 'Instant (~1 min)',
    badge: 'Official Partner',
    icon: '🔶',
  },
  {
    id: 'ramp',
    name: 'Ramp Network',
    tagline: 'Direct Web3 onramp & zero gas extra',
    feePercent: 1.4,
    speed: 'Fast (~3 mins)',
    badge: 'Web3 Native',
    icon: '🚀',
  },
];

export const BuyCryptoModal: React.FC<BuyCryptoModalProps> = ({
  isOpen,
  onClose,
  defaultSymbol = 'USDT',
}) => {
  const {
    assets,
    currentUser,
    setCurrentUser,
    setUsers,
    addNotification,
    depositAddresses,
    saveToServer,
  } = useWallet();

  const [selectedFiat, setSelectedFiat] = useState<FiatCurrency>(FIAT_CURRENCIES[0]);
  const [fiatAmount, setFiatAmount] = useState('150');
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const [selectedProviderId, setSelectedProviderId] = useState('transak');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'bank'>('card');
  const [step, setStep] = useState<'quote' | 'processing' | 'failed' | 'success'>('quote');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txDetails, setTxDetails] = useState<{
    txHash: string;
    cryptoAmount: number;
    fiatPaid: string;
    symbol: string;
  } | null>(null);

  if (!isOpen) return null;

  const targetAsset = assets.find((a) => a.symbol === selectedSymbol) || assets[0];
  const selectedProvider =
    ONRAMP_PROVIDERS.find((p) => p.id === selectedProviderId) || ONRAMP_PROVIDERS[0];

  const parsedFiatAmount = parseFloat(fiatAmount) || 0;
  const fiatAmountInUsd = parsedFiatAmount * selectedFiat.rateToUsd;
  const providerFeeUsd = fiatAmountInUsd * (selectedProvider.feePercent / 100);
  const networkFeeUsd = 1.2;
  const netSpendUsd = Math.max(0, fiatAmountInUsd - providerFeeUsd - networkFeeUsd);
  const cryptoReceived =
    targetAsset.priceUsd > 0 ? netSpendUsd / targetAsset.priceUsd : 0;

  const receiveAddress = currentUser
    ? getUserReceiveAddress(currentUser, targetAsset.symbol, 'TRC-20')
    : depositAddresses[targetAsset.symbol] || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

  const handleExecuteBuy = () => {
    if (parsedFiatAmount <= 0) return;
    setIsProcessing(true);
    setStep('processing');

    const generatedTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    setTimeout(() => {
      // NOTE: As requested, the Buy button executes the full flow but strictly NEVER credits any balance to the account.
      // Balance remains untouched at 0.00.
      if (currentUser) {
        // Add Notification informing failed settlement
        addNotification(
          currentUser.id,
          `Fiat Buy Declined (${selectedSymbol})`,
          `Gateway settlement for ${selectedFiat.symbol}${parsedFiatAmount} ${selectedFiat.code} was declined by payment compliance. 0.00 ${selectedSymbol} credited.`,
          'security'
        );
      }

      setTxDetails({
        txHash: generatedTxHash,
        cryptoAmount: cryptoReceived,
        fiatPaid: `${selectedFiat.symbol}${parsedFiatAmount} ${selectedFiat.code}`,
        symbol: selectedSymbol,
      });

      setIsProcessing(false);
      setStep('failed');
    }, 2500);
  };

  const handleClose = () => {
    setStep('quote');
    setIsProcessing(false);
    setTxDetails(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#121418] border border-white/10 p-6 shadow-2xl overflow-hidden text-white">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#3862FB]/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3862FB]/15 text-[#3862FB] border border-[#3862FB]/30 shadow-md">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white">Buy Crypto (Fiat Onramp)</h2>
              <p className="text-xs text-slate-400">Direct fiat purchase via verified global providers</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            id="close-buy-modal-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* STEP 1: QUOTE CONFIGURATION */}
        {step === 'quote' && (
          <div className="space-y-4">
            {/* Pay Amount & Fiat Currency */}
            <div className="rounded-2xl bg-[#1A1C20] border border-white/10 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-semibold">You Pay</span>
                <span>Limits: $10 - $50,000</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={fiatAmount}
                  onChange={(e) => setFiatAmount(e.target.value)}
                  placeholder="150"
                  min="1"
                  className="flex-1 bg-transparent text-2xl font-black text-white focus:outline-none placeholder-slate-600"
                  id="buy-fiat-amount-input"
                />
                <select
                  value={selectedFiat.code}
                  onChange={(e) => {
                    const found = FIAT_CURRENCIES.find((f) => f.code === e.target.value);
                    if (found) setSelectedFiat(found);
                  }}
                  className="rounded-xl bg-[#25282E] border border-white/10 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#3862FB]"
                  id="buy-fiat-currency-select"
                >
                  {FIAT_CURRENCIES.map((f) => (
                    <option key={f.code} value={f.code}>
                      {f.code} ({f.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Receive Crypto */}
            <div className="rounded-2xl bg-[#1A1C20] border border-white/10 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-semibold">You Receive (Estimated)</span>
                <span>Rate: 1 {targetAsset.symbol} = ${targetAsset.priceUsd.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-2xl font-black text-[#3862FB]">
                  {cryptoReceived > 0 ? cryptoReceived.toFixed(6) : '0.00'}
                </div>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="rounded-xl bg-[#25282E] border border-white/10 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#3862FB]"
                  id="buy-crypto-token-select"
                >
                  {assets.slice(0, 15).map((a) => (
                    <option key={a.id} value={a.symbol}>
                      {a.name} ({a.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-[#3862FB]/15 border-[#3862FB] text-white shadow-md shadow-[#3862FB]/10'
                      : 'bg-[#1A1C20] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="h-4 w-4 mb-1 text-[#3862FB]" />
                  <span>Debit / Credit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('apple_pay')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                    paymentMethod === 'apple_pay'
                      ? 'bg-[#3862FB]/15 border-[#3862FB] text-white shadow-md shadow-[#3862FB]/10'
                      : 'bg-[#1A1C20] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="h-4 w-4 mb-1 text-[#3862FB]" />
                  <span>Apple / GPay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                    paymentMethod === 'bank'
                      ? 'bg-[#3862FB]/15 border-[#3862FB] text-white shadow-md shadow-[#3862FB]/10'
                      : 'bg-[#1A1C20] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="h-4 w-4 mb-1 text-[#3862FB]" />
                  <span>Bank / UPI</span>
                </button>
              </div>
            </div>

            {/* Provider Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Onramp Gateway</label>
              <div className="space-y-2">
                {ONRAMP_PROVIDERS.map((p) => {
                  const isSelected = selectedProviderId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProviderId(p.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#1A1C20] border-[#3862FB] ring-1 ring-[#3862FB]'
                          : 'bg-[#16181D] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{p.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{p.name}</span>
                            <span className="rounded-full bg-[#3862FB]/15 px-2 py-0.2 text-[9px] font-extrabold text-[#3862FB]">
                              {p.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">{p.tagline}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-white">{p.speed}</span>
                        <p className="text-[10px] text-slate-400">Fee: {p.feePercent}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fees & Summary Breakdown */}
            <div className="rounded-2xl bg-[#16181D] border border-white/5 p-3.5 space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Gateway Fee ({selectedProvider.name}):</span>
                <span className="font-mono text-white">${providerFeeUsd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Network / Gas Fee:</span>
                <span className="font-mono text-white">${networkFeeUsd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-white/5 font-bold text-white">
                <span>Receiving Wallet:</span>
                <span className="font-mono text-[#38B6FF] text-[11px]">
                  {receiveAddress.slice(0, 8)}...{receiveAddress.slice(-6)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleExecuteBuy}
              disabled={parsedFiatAmount <= 0}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#3862FB] hover:bg-[#2D54E5] text-white font-black text-sm transition-all shadow-lg shadow-[#3862FB]/30 active:scale-[0.98] disabled:opacity-50"
              id="confirm-buy-crypto-btn"
            >
              <Zap className="h-4 w-4 fill-white" />
              <span>
                Buy {cryptoReceived > 0 ? cryptoReceived.toFixed(4) : ''} {targetAsset.symbol} with {selectedFiat.code}
              </span>
            </button>
          </div>
        )}

        {/* STEP 2: PROCESSING SIMULATION */}
        {step === 'processing' && (
          <div className="py-12 px-4 text-center space-y-6">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#3862FB]/15 border-2 border-[#3862FB] animate-pulse">
              <RefreshCw className="h-8 w-8 text-[#3862FB] animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Routing Order via {selectedProvider.name}...</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Securely verifying payment through 3D Secure, acquiring liquidity on-chain, and transferring {selectedSymbol} to your Trust Wallet.
              </p>
            </div>
            <div className="flex justify-center items-center gap-2 text-xs font-mono text-[#38B6FF] bg-[#3862FB]/10 py-2 px-4 rounded-xl border border-[#3862FB]/20 max-w-xs mx-auto">
              <Lock className="h-3.5 w-3.5" />
              <span>256-Bit SSL Encrypted Channel</span>
            </div>
          </div>
        )}

        {/* STEP 3: FAILED / DECLINED GATEWAY CONFIRMATION */}
        {step === 'failed' && txDetails && (
          <div className="py-5 px-2 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
              <AlertCircle className="h-10 w-10 text-rose-400" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold mb-2">
                <Lock className="h-3 w-3" />
                <span>3D Secure Compliance Hold</span>
              </div>
              <h3 className="text-xl font-black text-white">Gateway Settlement Failed</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Payment processor declined the on-chain transfer due to regional compliance checks. <strong>No cryptocurrency has been credited to your balance.</strong>
              </p>
            </div>

            <div className="rounded-2xl bg-[#1A1C20] border border-rose-500/20 p-4 text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-slate-400">Transaction Status:</span>
                <span className="font-bold text-rose-400 uppercase tracking-wide">
                  Declined / Unsettled
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Attempted Fiat Charge:</span>
                <span className="font-bold text-white">{txDetails.fiatPaid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Crypto Credited:</span>
                <span className="font-bold text-slate-400 font-mono">
                  +0.000000 {txDetails.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Wallet Balance Impact:</span>
                <span className="font-bold text-slate-300">$0.00 (Unchanged)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Onramp Provider:</span>
                <span className="font-bold text-white">{selectedProvider.name}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/5 text-[11px]">
                <span className="text-slate-400">Trace ID:</span>
                <span className="font-mono text-slate-400">
                  {txDetails.txHash.slice(0, 10)}...{txDetails.txHash.slice(-8)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('quote')}
                className="flex-1 py-3 rounded-2xl bg-[#25282E] hover:bg-[#2C3038] text-slate-300 font-bold text-xs transition-all border border-white/10"
              >
                Try Other Provider
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/20"
                id="buy-complete-done-btn"
              >
                Close & Check Balance
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
