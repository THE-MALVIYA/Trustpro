import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  QrCode,
  RefreshCw,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';

interface Web3ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Web3ConnectModal: React.FC<Web3ConnectModalProps> = ({ isOpen, onClose }) => {
  const {
    isConnectedToWeb3,
    web3Address,
    web3ChainId,
    web3ProviderName,
    connectWeb3Wallet,
    disconnectWeb3Wallet,
  } = useWallet();

  const [activeTab, setActiveTab] = useState<'wallets' | 'manual' | 'qr'>('wallets');
  const [manualAddress, setManualAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);

  if (!isOpen) return null;

  const handleWalletSelect = async (providerName: string) => {
    setIsConnecting(true);
    setErrorMessage('');

    try {
      const res = await connectWeb3Wallet(providerName);
      if (res.success) {
        setIsConnecting(false);
        onClose();
      } else {
        setIsConnecting(false);
        if (res.error === 'NO_INJECTED_PROVIDER') {
          setErrorMessage(
            `No browser extension found for ${providerName}. You can enter your real wallet address manually below, or open in Trust Wallet dApp.`
          );
          setActiveTab('manual');
        } else {
          setErrorMessage(res.error || 'Failed to connect Web3 wallet');
        }
      }
    } catch (err: any) {
      setIsConnecting(false);
      setErrorMessage(err.message || 'Connection error occurred');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAddress.trim()) {
      setErrorMessage('Please enter a valid EVM wallet address.');
      return;
    }
    if (!manualAddress.trim().startsWith('0x') || manualAddress.trim().length !== 42) {
      setErrorMessage('Invalid EVM address format. Must start with 0x and be 42 characters long.');
      return;
    }

    setIsConnecting(true);
    setErrorMessage('');

    const res = await connectWeb3Wallet('Trust Wallet', manualAddress.trim());
    setIsConnecting(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Failed to connect address');
    }
  };

  const currentChainName = (chainId: string | null) => {
    switch (chainId) {
      case '0x1':
        return 'Ethereum Mainnet';
      case '0x38':
      case '56':
        return 'BNB Smart Chain';
      case '0x89':
      case '137':
        return 'Polygon PoS';
      case '0xa4b1':
      case '42161':
        return 'Arbitrum One';
      default:
        return 'EVM Multi-Chain';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0F172A] border border-blue-500/30 p-6 shadow-2xl space-y-5 text-white overflow-hidden">
        {/* Decorative Top Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-24 w-48 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600 blur-3xl opacity-30 pointer-events-none" />

        {/* Header Title & Close Button */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#3375BB]/10 border border-[#3375BB]/30 text-[#3375BB]">
              {/* Trust Wallet Shield Icon */}
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 5V11C3 16.55 7 21.74 12 23C17 21.74 21 16.55 21 11V5L12 2Z" fill="#3375BB" fillOpacity="0.2" stroke="#3375BB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 6L7 9V12C7 15.5 9.5 18.5 12 19.5C14.5 18.5 17 15.5 17 12V9L12 6Z" fill="#3375BB"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                <span>Trust Wallet & Web3 Connect</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  REAL EIP-1193
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Connect your sovereign crypto wallet safely</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* IF ALREADY CONNECTED */}
        {isConnectedToWeb3 ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide font-mono">
                    {web3ProviderName || 'Trust Wallet'} Connected
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {currentChainName(web3ChainId)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase font-mono">Wallet Address</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono font-bold text-white break-all">{web3Address}</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (web3Address) {
                        navigator.clipboard.writeText(web3Address);
                        setCopiedAddress(true);
                        setTimeout(() => setCopiedAddress(false), 2000);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-emerald-400 ml-2 shrink-0"
                    title="Copy Address"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {copiedAddress && <p className="text-[10px] text-emerald-400 font-bold">Address Copied!</p>}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Integrated with Trust Wallet Security Shield & non-custodial protection</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  disconnectWeb3Wallet();
                }}
                className="w-full py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 font-bold text-xs transition-all"
              >
                Disconnect Web3 Wallet
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* NOT CONNECTED - OPTIONS */
          <div className="space-y-4">
            {/* Navigation Tabs */}
            <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('wallets');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                  activeTab === 'wallets' ? 'bg-[#3375BB] text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Wallet Extension
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('manual');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                  activeTab === 'manual' ? 'bg-[#3375BB] text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Enter Address
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('qr');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                  activeTab === 'qr' ? 'bg-[#3375BB] text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Trust App QR
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: BROWSER EXTENSIONS */}
            {activeTab === 'wallets' && (
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={isConnecting}
                  onClick={() => handleWalletSelect('Trust Wallet')}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#3375BB]/20 to-blue-900/30 border border-[#3375BB]/50 hover:border-[#3375BB] text-left flex items-center justify-between group transition-all"
                  id="connect-trust-wallet-option"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#3375BB] flex items-center justify-center text-white shrink-0 shadow-lg">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L3 5V11C3 16.55 7 21.74 12 23C17 21.74 21 16.55 21 11V5L12 2Z" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="2"/>
                        <path d="M12 6L7 9V12C7 15.5 9.5 18.5 12 19.5C14.5 18.5 17 15.5 17 12V9L12 6Z" fill="white"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>Trust Wallet</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          RECOMMENDED
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400">Official Trust Wallet browser extension & dApp</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#3375BB] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  disabled={isConnecting}
                  onClick={() => handleWalletSelect('MetaMask')}
                  className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 text-left flex items-center justify-between group transition-all"
                  id="connect-metamask-option"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">MetaMask Wallet</p>
                      <p className="text-[10px] text-slate-400">Injected EIP-1193 EVM browser extension</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  type="button"
                  disabled={isConnecting}
                  onClick={() => handleWalletSelect('Coinbase Wallet / WalletConnect')}
                  className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-left flex items-center justify-between group transition-all"
                  id="connect-walletconnect-option"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">Coinbase / WalletConnect</p>
                      <p className="text-[10px] text-slate-400">Scan QR or connect via Web3 provider</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            )}

            {/* TAB 2: MANUAL REAL ADDRESS INPUT */}
            {activeTab === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Real EVM Wallet Address (0x...)
                  </label>
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#3375BB]"
                    id="manual-web3-address-input"
                  />
                  <p className="text-[10px] text-slate-400">
                    Paste your real Trust Wallet or MetaMask public address to link your Web3 identity.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#3375BB] to-indigo-600 hover:opacity-95 text-white font-bold text-xs transition-all shadow-xl flex items-center justify-center gap-2"
                  id="connect-manual-address-btn"
                >
                  {isConnecting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Link Real Address</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 3: TRUST WALLET APP QR / DEEP LINK */}
            {activeTab === 'qr' && (
              <div className="space-y-4 text-center">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="mx-auto h-32 w-32 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg">
                    {/* Simulated Trust Wallet QR Code */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        'https://link.trustwallet.com/open_url?url=' + window.location.href
                      )}`}
                      alt="Trust Wallet Connect QR"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="text-xs font-bold text-white">Scan with Trust Wallet Mobile App</p>
                  <p className="text-[10px] text-slate-400">
                    Open Trust Wallet on Android / iOS, tap Camera or dApp Scanner to connect instantly.
                  </p>
                </div>

                <a
                  href={`https://link.trustwallet.com/open_url?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-[#3375BB] hover:bg-[#28609c] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open directly in Trust Wallet Mobile</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
