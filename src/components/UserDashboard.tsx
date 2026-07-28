import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { CryptoAsset } from '../types';
import { CryptoIcon } from './CryptoIcon';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  Coins,
  TrendingUp,
  Search,
  Star,
  ExternalLink,
  ShieldCheck,
  PlusCircle,
  Clock,
  CheckCircle2,
  Send,
  Download,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const UserDashboard: React.FC = () => {
  const {
    currentUser,
    assets,
    transactions,
    watchlist,
    toggleWatchlist,
    setActiveTab,
    setIsSendModalOpen,
    setIsReceiveModalOpen,
    setSelectedAssetForModal,
  } = useWallet();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'watchlist' | 'popular'>('all');
  const [hideZeroBalances, setHideZeroBalances] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <Wallet className="h-16 w-16 text-emerald-400 mb-4 animate-bounce" />
        <h2 className="text-2xl font-extrabold text-white">Connect Your Wallet</h2>
        <p className="text-sm text-slate-400 max-w-md mt-2 mb-6">
          Log in or connect a wallet to view your portfolio balances, transaction logs, and multi-chain assets.
        </p>
      </div>
    );
  }

  // Calculate total portfolio value and P&L
  let totalPortfolioUsd = 0;
  const userAssetBreakdown = assets.map((asset) => {
    const userAmount = currentUser.balances[asset.symbol] || 0;
    const valueUsd = userAmount * asset.priceUsd;
    totalPortfolioUsd += valueUsd;
    return {
      ...asset,
      userAmount,
      valueUsd,
    };
  });

  // Calculate weighted 24h P&L percent
  let weighted24hPnlUsd = 0;
  userAssetBreakdown.forEach((item) => {
    if (item.valueUsd > 0) {
      const pnlFactor = item.change24h / 100;
      weighted24hPnlUsd += item.valueUsd * pnlFactor;
    }
  });

  const weighted24hPnlPercent =
    totalPortfolioUsd > 0 ? (weighted24hPnlUsd / totalPortfolioUsd) * 100 : 0;

  // Filtered Assets List
  const filteredAssets = userAssetBreakdown.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterMode === 'all'
        ? true
        : filterMode === 'watchlist'
        ? watchlist.includes(asset.symbol)
        : asset.isPopular;

    const matchesZero = hideZeroBalances ? asset.userAmount > 0 : true;

    return matchesSearch && matchesFilter && matchesZero;
  });

  // Data for Recharts Pie Distribution
  const pieData = userAssetBreakdown
    .filter((a) => a.valueUsd > 0)
    .map((a) => ({
      name: a.symbol,
      value: a.valueUsd,
      color: a.color,
    }));

  const defaultColors = ['#F7931A', '#627EEA', '#14F195', '#F3BA2F', '#8247E5', '#26A17B'];

  const handleOpenSend = (asset: CryptoAsset) => {
    setSelectedAssetForModal(asset);
    setIsSendModalOpen(true);
  };

  const handleOpenReceive = (asset: CryptoAsset) => {
    setSelectedAssetForModal(asset);
    setIsReceiveModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* PORTFOLIO HEADER CARD */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#0e121a] to-slate-900 border border-slate-800 p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-emerald-500/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Balance Summary */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Wallet Net Worth
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  title="Toggle Balance Visibility"
                >
                  {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-400">
                  {currentUser.role.toUpperCase()}
                </span>
                <span
                  onClick={() => setActiveTab('settings')}
                  className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-mono font-bold border transition-all ${
                    currentUser.kycStatus === 'verified'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : currentUser.kycStatus === 'pending'
                      ? 'bg-blue-300/10 border-blue-300/30 text-blue-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                  }`}
                  title="Click to manage KYC verification"
                >
                  KYC: {currentUser.kycStatus.toUpperCase()}
                  {currentUser.kycStatus !== 'verified' && ' ⚠️'}
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-4">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                {showBalance ? `$${totalPortfolioUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••••••'}
              </h1>
              <div
                className={`flex items-center gap-1 font-bold text-sm px-2.5 py-1 rounded-full ${
                  weighted24hPnlPercent >= 0
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>
                  {weighted24hPnlPercent >= 0 ? '+' : ''}
                  {showBalance ? `$${weighted24hPnlUsd.toFixed(2)} (${weighted24hPnlPercent.toFixed(2)}%)` : '•••'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Connected Address: <span className="font-mono text-slate-200">0x71C...392A (Native EVM / Solana / BTC)</span>
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedAssetForModal(assets[0]);
                  setIsSendModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-black hover:bg-emerald-400 transition-all shadow-md"
                id="dashboard-send-btn"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send</span>
              </button>

              <button
                onClick={() => {
                  setSelectedAssetForModal(assets[0]);
                  setIsReceiveModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-all"
                id="dashboard-receive-btn"
              >
                <Download className="h-3.5 w-3.5 text-emerald-400" />
                <span>Receive</span>
              </button>

              <button
                onClick={() => setActiveTab('swap')}
                className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-all"
                id="dashboard-swap-btn"
              >
                <Repeat className="h-3.5 w-3.5 text-blue-300" />
                <span>Swap</span>
              </button>

              <button
                onClick={() => setActiveTab('staking')}
                className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-all"
                id="dashboard-stake-btn"
              >
                <Coins className="h-3.5 w-3.5 text-purple-400" />
                <span>Earn Staking</span>
              </button>
            </div>
          </div>

          {/* Right Pie Chart Breakdown */}
          <div className="lg:col-span-5 h-48 flex items-center justify-center relative">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || defaultColors[index % defaultColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any) => `$${Number(val).toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">No positive asset balances yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* DEDICATED NETWORK FEE RESERVE VAULT CARD */}
      {(() => {
        const gasTrxAsset = assets.find((a) => a.symbol === 'GAS_TRX') || assets[0];
        
        const gasTrxAmount = currentUser.balances['GAS_TRX'] || 0;
        
        const totalGasReserveUsd = gasTrxAmount * (gasTrxAsset.priceUsd || 0.14);

        return (
          <div className="rounded-3xl bg-gradient-to-r from-[#1A1F35] via-[#131728] to-[#0D1120] border border-[#3375BB]/40 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#3375BB]/10 blur-2xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[#3375BB]/20 border border-[#3375BB]/40 flex items-center justify-center text-[#3375BB] shadow-md">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Network Fee Vault Reserve (Gas Protocol)</span>
                    </h3>
                    <p className="text-[11px] text-[#AAB3C5]">
                      Dedicated gas fee balances for transaction settlement, TRC20 gas & network processing
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-baseline gap-3 pt-1">
                  {/* WHITE COLOR FOR $0.00 USD AS REQUESTED BY USER */}
                  <span className="text-3xl font-black text-white font-mono">
                    {showBalance ? `$${totalGasReserveUsd.toFixed(2)} USD` : '••••••••'}
                  </span>
                </div>
              </div>

              {/* Dedicated Gas Fee Deposit & Withdraw Buttons for Gas fee TRX */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    setSelectedAssetForModal(gasTrxAsset);
                    setIsReceiveModalOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-xl btn-gradient-primary px-4 py-2.5 text-xs font-black text-[#0B1020] transition-all shadow-xl hover:scale-[1.02]"
                  id="gas-trx-deposit-btn"
                >
                  <Download className="h-4 w-4" />
                  <span>Deposit Gas fee TRX</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedAssetForModal(gasTrxAsset);
                    setIsSendModalOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition-all hover:scale-[1.02]"
                  id="gas-trx-withdraw-btn"
                >
                  <Send className="h-4 w-4 text-[#3375BB]" />
                  <span>Withdraw Gas fee TRX</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ASSET LIST & MARKET TABLE */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
        {/* Table Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Filters & Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filterMode === 'all'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              All Assets ({assets.length})
            </button>
            <button
              onClick={() => setFilterMode('watchlist')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filterMode === 'watchlist'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              Watchlist ({watchlist.length})
            </button>
            <button
              onClick={() => setFilterMode('popular')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filterMode === 'popular'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              Popular
            </button>
          </div>

          {/* Search & Hide Zero Controls */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={hideZeroBalances}
                onChange={(e) => setHideZeroBalances(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
              />
              <span>Hide Zero Balances</span>
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search coin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="pb-3 pl-2">Asset</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">24h Change</th>
                <th className="pb-3">My Balance</th>
                <th className="pb-3">Market Value</th>
                <th className="pb-3 text-right pr-2">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredAssets.map((asset) => {
                const isWatchlisted = watchlist.includes(asset.symbol);
                return (
                  <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors group">
                    {/* Coin & Symbol */}
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleWatchlist(asset.symbol)}
                          className="text-slate-600 hover:text-blue-300 transition-colors"
                          title="Toggle Watchlist"
                        >
                          <Star className={`h-4 w-4 ${isWatchlisted ? 'fill-blue-300 text-blue-300' : ''}`} />
                        </button>
                        <CryptoIcon symbol={asset.symbol} src={asset.icon} size="md" />
                        <div>
                          <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">{asset.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{asset.symbol} • {asset.network}</span>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 font-mono font-bold text-white">
                      ${asset.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </td>

                    {/* 24h Change */}
                    <td className="py-4 font-semibold">
                      <span className={asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                      </span>
                    </td>

                    {/* Balance */}
                    <td className="py-4 font-mono">
                      {showBalance ? (
                        <div>
                          <p className="font-bold text-slate-200">{asset.userAmount} {asset.symbol}</p>
                        </div>
                      ) : (
                        '••••••'
                      )}
                    </td>

                    {/* Value USD */}
                    <td className="py-4 font-mono font-bold text-white">
                      {showBalance ? `$${asset.valueUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
                    </td>

                    {/* Actions */}
                    <td className="py-4 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenSend(asset)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-semibold text-[11px]"
                        >
                          Send
                        </button>
                        <button
                          onClick={() => handleOpenReceive(asset)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-[11px]"
                        >
                          Receive
                        </button>
                        <button
                          onClick={() => setActiveTab('swap')}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-blue-300 hover:bg-slate-700 font-semibold text-[11px]"
                        >
                          Swap
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT ACTIVITY SECTION */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-400" />
            <span>Recent Activity Logs</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {transactions.filter((tx) => tx.userId === currentUser.id).length} Total Tx
          </span>
        </div>

        <div className="space-y-2">
          {transactions.filter((tx) => tx.userId === currentUser.id).length === 0 ? (
            <div className="text-center py-8 rounded-2xl bg-slate-950/40 border border-slate-800/60 p-4">
              <Clock className="h-8 w-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-slate-400">No transactions recorded yet</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Your wallet balance is $0.00 until credited by platform administration.
              </p>
            </div>
          ) : (
            transactions
              .filter((tx) => tx.userId === currentUser.id)
              .slice(0, 8)
              .map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-xl bg-slate-950/60 border border-slate-800/80 p-3.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        tx.type === 'send' || tx.type === 'admin_debit' || tx.type === 'withdraw'
                          ? 'bg-rose-500/10 text-rose-400'
                          : tx.type === 'receive' || tx.type === 'admin_credit' || tx.type === 'deposit'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-blue-300/10 text-blue-300'
                      }`}
                    >
                      {tx.type === 'send' || tx.type === 'admin_debit' || tx.type === 'withdraw' ? '↑' : '↓'}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-white capitalize">
                        {tx.type.replace('_', ' ')} • {tx.assetSymbol}
                      </p>
                      {tx.toAddress && (
                        <p className="text-[11px] font-mono text-emerald-400 font-medium truncate max-w-[220px]" title={tx.toAddress}>
                          To: {tx.toAddress}
                        </p>
                      )}
                      {!tx.toAddress && tx.fromAddress && (
                        <p className="text-[11px] font-mono text-slate-400 font-medium truncate max-w-[220px]" title={tx.fromAddress}>
                          From: {tx.fromAddress}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(tx.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-bold font-mono text-xs ${
                        tx.type === 'send' || tx.type === 'admin_debit' || tx.type === 'withdraw'
                          ? 'text-rose-400'
                          : tx.type === 'receive' || tx.type === 'admin_credit' || tx.type === 'deposit'
                          ? 'text-emerald-400'
                          : 'text-white'
                      }`}
                    >
                      {tx.type === 'send' || tx.type === 'admin_debit' || tx.type === 'withdraw' ? '-' : '+'}
                      {tx.amount} {tx.assetSymbol}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">${tx.amountUsd.toFixed(2)}</p>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
