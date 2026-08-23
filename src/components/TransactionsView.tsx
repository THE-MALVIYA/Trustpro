import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { CryptoIcon } from './CryptoIcon';
import {
  History,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  Coins,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  FileSpreadsheet,
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const { transactions, currentUser, assets } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  // Update timer tick every second for real-time countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="mx-auto h-16 w-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
          <History className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Transaction History</h2>
        <p className="text-sm text-slate-400 mt-1">Please log in to view your full transaction history.</p>
      </div>
    );
  }

  // Filter user's transactions
  const userTxs = transactions.filter((tx) => tx.userId === currentUser.id);

  // Search and filter logic
  const filteredTxs = userTxs.filter((tx) => {
    // Type filter
    if (selectedType !== 'all') {
      if (selectedType === 'deposit' && tx.type !== 'deposit' && tx.type !== 'admin_credit' && tx.type !== 'receive') return false;
      if (selectedType === 'withdraw' && tx.type !== 'withdraw' && tx.type !== 'admin_debit' && tx.type !== 'send') return false;
      if (selectedType === 'swap' && tx.type !== 'swap') return false;
      if (selectedType === 'stake' && tx.type !== 'stake' && tx.type !== 'unstake') return false;
    }

    // Asset filter
    if (selectedAsset !== 'all' && tx.assetSymbol.toUpperCase() !== selectedAsset.toUpperCase()) {
      return false;
    }

    // Search query match
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchSymbol = tx.assetSymbol.toLowerCase().includes(q);
      const matchHash = tx.txHash.toLowerCase().includes(q);
      const matchNote = tx.note?.toLowerCase().includes(q) || false;
      const matchAddr = tx.toAddress?.toLowerCase().includes(q) || tx.fromAddress?.toLowerCase().includes(q) || false;
      return matchSymbol || matchHash || matchNote || matchAddr;
    }

    return true;
  });

  const handleCopy = (txHash: string, id: string) => {
    navigator.clipboard.writeText(txHash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRemainingTimerText = (tx: any) => {
    const targetMs = tx.targetCompletionTime
      ? new Date(tx.targetCompletionTime).getTime()
      : new Date(tx.timestamp).getTime() + 24 * 60 * 60 * 1000;

    const diff = targetMs - now;
    if (diff <= 0) return 'Verification Due';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStatusBadge = (status: string, tx: any) => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#38B6FF] bg-[#3862FB]/10 px-2.5 py-1 rounded-full border border-[#3862FB]/20">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Confirmed
        </span>
      );
    }

    if (status === 'rejected' || status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
          <XCircle className="h-3.5 w-3.5" />
          Failed
        </span>
      );
    }

    // Pending Status with Active 24-Hour Timer
    const timerText = getRemainingTimerText(tx);
    return (
      <div className="flex flex-col items-end gap-0.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-300 bg-blue-300/10 px-2.5 py-1 rounded-full border border-blue-300/20 animate-pulse">
          <Clock className="h-3.5 w-3.5" />
          Pending
        </span>
        <span className="text-[10px] font-mono text-blue-300 font-semibold">
          ⏱️ {timerText}
        </span>
      </div>
    );
  };

  const getCleanTypeName = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'admin_credit':
      case 'receive':
        return 'Deposit / Receive';
      case 'withdraw':
      case 'admin_debit':
      case 'send':
        return 'Withdraw / Transfer';
      case 'swap':
        return 'Token Swap';
      case 'stake':
        return 'Staked Asset';
      case 'unstake':
        return 'Unstaked Asset';
      default:
        return 'Transaction';
    }
  };

  const getCleanTypeBadge = (type: string) => {
    const isIncome = type === 'deposit' || type === 'admin_credit' || type === 'receive';
    const isOutgoing = type === 'withdraw' || type === 'admin_debit' || type === 'send';

    if (isIncome) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#3862FB]/10 px-2.5 py-1 text-[11px] font-bold text-[#38B6FF] border border-[#3862FB]/20">
          <ArrowDownLeft className="h-3 w-3" />
          Deposit
        </span>
      );
    }
    if (isOutgoing) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-400 border border-rose-500/20">
          <ArrowUpRight className="h-3 w-3" />
          Withdrawal
        </span>
      );
    }
    if (type === 'swap') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-300/10 px-2.5 py-1 text-[11px] font-bold text-blue-300 border border-blue-300/20">
          <Repeat className="h-3 w-3" />
          Swap
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-1 text-[11px] font-bold text-purple-400 border border-purple-500/20">
        <Coins className="h-3 w-3" />
        Staking
      </span>
    );
  };

  // Export CSV Helper
  const handleExportCsv = () => {
    const csvRows = [
      ['Date', 'Type', 'Asset', 'Amount', 'Amount (USD)', 'Recipient / Address', 'Network', 'Tx Hash', 'Status'].join(','),
      ...filteredTxs.map((tx) =>
        [
          `"${new Date(tx.timestamp).toLocaleString()}"`,
          `"${getCleanTypeName(tx.type)}"`,
          `"${tx.assetSymbol}"`,
          `"${tx.amount}"`,
          `"$${tx.amountUsd.toFixed(2)}"`,
          `"${tx.toAddress || tx.fromAddress || 'N/A'}"`,
          `"${tx.network || 'Multi-Chain'}"`,
          `"${tx.txHash}"`,
          `"${tx.status}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TrustPro_Transactions_${currentUser.name.replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#3862FB] to-[#38B6FF] flex items-center justify-center text-white shadow-lg shadow-[#3862FB]/20">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Transaction History & Audit Ledger</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#3862FB]/10 border border-[#3862FB]/20 text-[10px] font-mono text-[#38B6FF]">
                Verified Ledger
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Complete real-time record of all deposits, withdrawals, swaps, and protocol settlements.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md"
          id="export-csv-btn"
        >
          <FileSpreadsheet className="h-4 w-4 text-[#38B6FF]" />
          <span>Export CSV Statement</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by coin symbol, Tx hash, or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#3862FB] transition-colors"
            />
          </div>

          {/* Asset Dropdown Filter */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="rounded-2xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#3862FB]"
            >
              <option value="all">All Cryptos</option>
              {assets.map((a) => (
                <option key={a.id} value={a.symbol}>
                  {a.name} ({a.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Type Tabs */}
        <div className="flex flex-wrap gap-2 border-t border-slate-800/60 pt-3">
          {[
            { id: 'all', label: 'All Activity' },
            { id: 'deposit', label: 'Deposits' },
            { id: 'withdraw', label: 'Withdrawals' },
            { id: 'swap', label: 'Swaps' },
            { id: 'stake', label: 'Staking' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                selectedType === tab.id
                  ? 'bg-[#3862FB] text-white shadow-md shadow-[#3862FB]/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        {filteredTxs.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="h-10 w-10 text-slate-600 mx-auto mb-3 opacity-50" />
            <h3 className="text-sm font-bold text-white">No Transactions Found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try modifying your search or filter options.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Asset</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">USD Value</th>
                  <th className="py-3.5 px-4">Recipient / Address</th>
                  <th className="py-3.5 px-4">NETWORK</th>
                  <th className="py-3.5 px-4">Tx Hash / Reference</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredTxs.map((tx) => {
                  const isIncome = tx.type === 'deposit' || tx.type === 'admin_credit' || tx.type === 'receive';
                  const isOutgoing = tx.type === 'withdraw' || tx.type === 'admin_debit' || tx.type === 'send';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4">{getCleanTypeBadge(tx.type)}</td>
                      <td className="py-4 px-4 font-bold text-white font-sans">
                        <div className="flex items-center gap-2">
                          <CryptoIcon symbol={tx.assetSymbol} network={tx.network} size="xs" />
                          <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[11px]">
                            {tx.assetSymbol}
                          </span>
                          <span className="text-xs">{tx.assetName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold">
                        <span
                          className={
                            isIncome
                              ? 'text-[#38B6FF]'
                              : isOutgoing
                              ? 'text-rose-400'
                              : 'text-white'
                          }
                        >
                          {isIncome ? '+' : isOutgoing ? '-' : ''}
                          {tx.amount} {tx.assetSymbol}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-300 font-bold">
                        ${tx.amountUsd.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-[11px]">
                        {tx.toAddress ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#38B6FF] font-bold truncate max-w-[140px]" title={tx.toAddress}>
                              {tx.toAddress}
                            </span>
                            <button
                              onClick={() => handleCopy(tx.toAddress!, `to_${tx.id}`)}
                              className="text-slate-500 hover:text-white"
                              title="Copy Address"
                            >
                              {copiedId === `to_${tx.id}` ? (
                                <Check className="h-3 w-3 text-[#38B6FF]" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        ) : tx.fromAddress ? (
                          <span className="text-slate-400 truncate max-w-[140px] block" title={tx.fromAddress}>
                            From: {tx.fromAddress}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-400 text-[11px]">
                        <span className="px-2 py-1 rounded-md bg-slate-950 border border-slate-800">
                          {tx.network && !tx.network.toLowerCase().includes('settlement') && !tx.network.toLowerCase().includes('vault')
                            ? tx.network
                            : (assets.find((a) => a.symbol === tx.assetSymbol)?.network || (tx.assetSymbol === 'USDT' || tx.assetSymbol === 'TRX' ? 'TRC20' : tx.assetSymbol === 'ETH' ? 'ERC20' : tx.assetSymbol === 'BNB' ? 'BEP20' : tx.assetSymbol === 'SOL' ? 'Solana' : `${tx.assetSymbol} Network`))}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="text-[#38B6FF] truncate max-w-[120px]">
                            {tx.txHash}
                          </span>
                          <button
                            onClick={() => handleCopy(tx.txHash, tx.id)}
                            className="text-slate-500 hover:text-white"
                            title="Copy Hash"
                          >
                            {copiedId === tx.id ? (
                              <Check className="h-3.5 w-3.5 text-[#38B6FF]" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-400 text-[11px] font-sans">
                        {new Date(tx.timestamp).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {renderStatusBadge(tx.status, tx)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
