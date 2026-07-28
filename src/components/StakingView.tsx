import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { CryptoIcon } from './CryptoIcon';
import {
  Coins,
  TrendingUp,
  Lock,
  CheckCircle2,
  Sparkles,
  Zap,
  Award,
} from 'lucide-react';

export const StakingView: React.FC = () => {
  const {
    stakingPositions,
    assets,
    currentUser,
    stakeCrypto,
    unstakeCrypto,
    claimStakingRewards,
  } = useWallet();

  const [selectedAsset, setSelectedAsset] = useState('ETH');
  const [amount, setAmount] = useState('1.0');
  const [message, setMessage] = useState('');

  const activeAsset = assets.find((a) => a.symbol === selectedAsset) || assets[1];
  const userBalance = currentUser?.balances[selectedAsset] || 0;

  const handleStake = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount) || 0;
    if (num <= 0) return;

    const res = stakeCrypto(selectedAsset, num);
    setMessage(res.message);
    setTimeout(() => setMessage(''), 3000);
  };

  const userPositions = stakingPositions.filter((p) => p.status === 'active');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Coins className="h-6 w-6 text-[#FCD535]" />
          <span>Institutional Staking Hub</span>
        </h1>
        <p className="text-xs text-[#B7BDC6] mt-1">
          Earn non-custodial yield directly from native proof-of-stake blockchain validators.
        </p>
      </div>

      {message && (
        <div className="rounded-2xl bg-[#00D092]/10 border border-[#00D092]/30 p-4 text-xs font-bold text-[#00D092] flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{message}</span>
        </div>
      )}

      {/* STAKING FORM & POOLS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Stake Action Box */}
        <div className="lg:col-span-5 rounded-3xl bg-[#0E1422] border border-white/10 p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#00D092]" />
            <span>Stake Assets & Earn APY</span>
          </h2>

          <form onSubmit={handleStake} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#B7BDC6] mb-1">Select Staking Asset</label>
              <div className="flex items-center gap-2 bg-[#080C14] border border-white/10 rounded-xl px-3 py-2">
                <CryptoIcon symbol={activeAsset.symbol} src={activeAsset.icon} size="sm" />
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="w-full bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
                >
                  <option value="ETH" className="bg-[#080C14] text-white">Ethereum (ETH) — 4.8% APY</option>
                  <option value="SOL" className="bg-[#080C14] text-white">Solana (SOL) — 7.2% APY</option>
                  <option value="BNB" className="bg-[#080C14] text-white">BNB Smart Chain — 5.6% APY</option>
                  <option value="POL" className="bg-[#080C14] text-white">Polygon (POL) — 6.5% APY</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-[#B7BDC6] mb-1">
                <span>Amount to Stake</span>
                <button
                  type="button"
                  onClick={() => setAmount(userBalance.toString())}
                  className="text-[#00D092] font-bold hover:underline"
                >
                  Available: {userBalance} {selectedAsset}
                </button>
              </div>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl bg-[#080C14] border border-white/10 px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#00D092]"
              />
            </div>

            <div className="rounded-2xl bg-[#FCD535]/10 border border-[#FCD535]/20 p-4 text-xs space-y-2">
              <div className="flex justify-between text-[#B7BDC6]">
                <span>Estimated APY</span>
                <span className="font-bold text-[#FCD535]">
                  {selectedAsset === 'ETH' ? '4.8%' : selectedAsset === 'SOL' ? '7.2%' : '5.6%'}
                </span>
              </div>
              <div className="flex justify-between text-[#B7BDC6]">
                <span>Lockup Period</span>
                <span className="font-mono text-white">Flexible (Unstake Anytime)</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-gold py-3 text-xs font-black text-black hover:opacity-95 transition-all shadow-lg"
              id="submit-stake-btn"
            >
              Activate Staking for {amount} {selectedAsset}
            </button>
          </form>
        </div>

        {/* Right Active Stakes List */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0E1422] border border-white/10 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="h-4 w-4 text-[#00D092]" />
            <span>Active Staking Positions</span>
          </h2>

          {userPositions.length === 0 ? (
            <p className="text-xs text-[#7A8494] py-8 text-center">No active stakes yet. Activate a pool on the left!</p>
          ) : (
            <div className="space-y-3">
              {userPositions.map((pos) => (
                <div
                  key={pos.id}
                  className="rounded-2xl bg-[#080C14] border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <CryptoIcon symbol={pos.assetSymbol} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{pos.assetName}</span>
                        <span className="rounded-full bg-[#FCD535]/10 border border-[#FCD535]/30 px-2 py-0.5 text-[10px] font-bold text-[#FCD535]">
                          {pos.apy}% APY
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#B7BDC6] mt-0.5">
                        Staked: {pos.stakedAmount} {pos.assetSymbol} (${pos.stakedAmountUsd.toFixed(2)})
                      </p>
                      <p className="text-[10px] text-[#00D092] font-mono mt-0.5">
                        Earned Rewards: +{pos.earnedRewards.toFixed(4)} {pos.assetSymbol}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => claimStakingRewards(pos.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#00D092]/10 text-[#00D092] hover:bg-[#00D092]/20 font-extrabold text-xs"
                    >
                      Claim Rewards
                    </button>
                    <button
                      onClick={() => unstakeCrypto(pos.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#141C2E] text-white hover:bg-[#1A253A] font-bold text-xs border border-white/10"
                    >
                      Unstake
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
