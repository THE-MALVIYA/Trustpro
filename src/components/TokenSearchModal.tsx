import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { CryptoAsset } from '../types';
import { CryptoIcon } from './CryptoIcon';
import {
  Search,
  X,
  Plus,
  Check,
  Star,
  Layers,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

interface TokenSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken?: (token: CryptoAsset) => void;
}

export const TokenSearchModal: React.FC<TokenSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectToken,
}) => {
  const { assets, watchlist, toggleWatchlist } = useWallet();
  const [query, setQuery] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all');
  const [customTokenOpen, setCustomTokenOpen] = useState(false);
  const [customContract, setCustomContract] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');
  const [customName, setCustomName] = useState('');

  if (!isOpen) return null;

  const networks = [
    { id: 'all', label: 'All Networks' },
    { id: 'TRON', label: 'TRON' },
    { id: 'Ethereum', label: 'Ethereum' },
    { id: 'Solana', label: 'Solana' },
    { id: 'BNB Smart Chain', label: 'BNB' },
    { id: 'NEAR', label: 'NEAR' },
    { id: 'Bitcoin', label: 'Bitcoin' },
  ];

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(query.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(query.toLowerCase());

    const matchesNetwork =
      selectedNetwork === 'all'
        ? true
        : (asset.network || '').toLowerCase().includes(selectedNetwork.toLowerCase()) ||
          (asset.symbol === 'TRX' && selectedNetwork === 'TRON') ||
          (asset.symbol === 'USDT' && selectedNetwork === 'TRON');

    return matchesSearch && matchesNetwork;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#121418] border border-white/10 p-5 sm:p-6 shadow-2xl relative max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Manage Tokens</h2>
            <p className="text-xs text-slate-400">Search & toggle assets on your Trust Wallet</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search token name or contract address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl bg-[#1A1C20] border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#3862FB] focus:outline-none transition-colors"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Network Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2 shrink-0 no-scrollbar">
          {networks.map((net) => (
            <button
              key={net.id}
              onClick={() => setSelectedNetwork(net.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedNetwork === net.id
                  ? 'bg-[#3862FB] text-white shadow-sm'
                  : 'bg-[#1E2024] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {net.label}
            </button>
          ))}
        </div>

        {/* Token List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[300px]">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Search className="h-10 w-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-medium">No tokens found for "{query}"</p>
              <button
                onClick={() => setCustomTokenOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3862FB] text-white text-xs font-bold"
              >
                <Plus className="h-4 w-4" />
                <span>Add Custom Token</span>
              </button>
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const isEnabled = watchlist.includes(asset.symbol);

              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    if (onSelectToken) {
                      onSelectToken(asset);
                      onClose();
                    } else {
                      toggleWatchlist(asset.symbol);
                    }
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all active:scale-[0.99] ${
                    isEnabled
                      ? 'bg-[#181C24] border-[#3862FB]/40 shadow-sm'
                      : 'bg-[#14161B] border-white/5 hover:bg-[#1A1D24]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CryptoIcon symbol={asset.symbol} name={asset.name} network={asset.network} size="md" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{asset.name}</span>
                        <span className="text-xs text-slate-400 font-mono uppercase">{asset.symbol}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>${asset.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                        <span
                          className={`font-semibold ${
                            asset.change24h >= 0 ? 'text-[#38B6FF]' : 'text-[#F6465D]'
                          }`}
                        >
                          {asset.change24h >= 0 ? '+' : ''}
                          {asset.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(asset.symbol);
                    }}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      isEnabled ? 'bg-[#3862FB]' : 'bg-[#2A2D35]'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Custom Token Adder Drawer */}
        {customTokenOpen && (
          <div className="pt-3 border-t border-white/10 mt-2 space-y-2">
            <h3 className="text-xs font-bold text-white">Import Custom Token</h3>
            <input
              type="text"
              placeholder="Contract Address (0x... / T...)"
              value={customContract}
              onChange={(e) => setCustomContract(e.target.value)}
              className="w-full rounded-xl bg-[#1A1C20] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3862FB]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Symbol (e.g. USDT)"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value)}
                className="w-full rounded-xl bg-[#1A1C20] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Token Name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full rounded-xl bg-[#1A1C20] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setCustomTokenOpen(false)}
                className="flex-1 py-2 rounded-xl bg-[#1E2024] text-xs text-white font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (customSymbol) {
                    toggleWatchlist(customSymbol.toUpperCase());
                    setCustomTokenOpen(false);
                  }
                }}
                className="flex-1 py-2 rounded-xl bg-[#3862FB] text-xs text-white font-bold"
              >
                Import Token
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
