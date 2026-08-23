import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Landmark, TrendingUp, Layers, Zap } from 'lucide-react';

export const DefiView: React.FC = () => {
  const { defiPositions, currentUser } = useWallet();

  const userPositions = currentUser ? defiPositions.filter(pos => pos.userId === currentUser.id) : [];

  const totalLiquidity = userPositions.reduce((sum, pos) => sum + pos.userLiquidityUsd, 0);
  const totalDailyYield = userPositions.reduce((sum, pos) => sum + pos.dailyEarningsUsd, 0);
  
  // Calculate average APY weighted by liquidity
  const avgApy = totalLiquidity > 0 
    ? userPositions.reduce((sum, pos) => sum + (pos.apy * pos.userLiquidityUsd), 0) / totalLiquidity 
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Landmark className="h-6 w-6 text-[#38B6FF]" />
          <span>DeFi Yield & Liquidity Aggregator</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor liquidity pools, automated yield farming, and decentralized credit protocols.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
          <p className="text-xs text-slate-400 font-medium">Total Liquidity Supplied</p>
          <p className="text-3xl font-black text-white font-mono mt-1">${totalLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <span className="text-[10px] text-[#38B6FF] font-bold mt-2 inline-block">Across {userPositions.length} Protocol Pools</span>
        </div>

        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
          <p className="text-xs text-slate-400 font-medium">Average Net Yield APY</p>
          <p className="text-3xl font-black text-[#38B6FF] font-mono mt-1">{avgApy.toFixed(2)}%</p>
          <span className="text-[10px] text-slate-400 mt-2 inline-block">Compound Interest Auto-Reinvested</span>
        </div>

        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
          <p className="text-xs text-slate-400 font-medium">Daily Estimated Yield</p>
          <p className="text-3xl font-black text-blue-300 font-mono mt-1">${totalDailyYield.toFixed(2)} / day</p>
          <span className="text-[10px] text-slate-400 mt-2 inline-block">≈ ${(totalDailyYield * 30).toFixed(2)} / month</span>
        </div>
      </div>

      {/* Positions Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#38B6FF]" />
          <span>Active Liquidity Positions</span>
        </h2>

        {userPositions.length === 0 ? (
          <div className="text-center py-10">
            <Landmark className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No Active DeFi Positions</p>
            <p className="text-xs text-slate-500 mt-1">You have not supplied any liquidity to DeFi protocols yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="pb-3">Protocol & Pool</th>
                  <th className="pb-3">Network</th>
                  <th className="pb-3">Total TVL</th>
                  <th className="pb-3">My Liquidity</th>
                  <th className="pb-3">Current APY</th>
                  <th className="pb-3 text-right">Daily Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {userPositions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={pos.protocolLogo} alt={pos.protocol} className="h-8 w-8 rounded-full" />
                        <div>
                          <p className="font-bold text-white">{pos.protocol}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{pos.pool}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 font-mono text-slate-300">{pos.network}</td>

                    <td className="py-4 font-mono text-slate-300">${(pos.tvlUsd / 1e6).toFixed(1)}M</td>

                    <td className="py-4 font-mono font-bold text-white">${pos.userLiquidityUsd.toLocaleString()}</td>

                    <td className="py-4 font-bold text-[#38B6FF]">{pos.apy}%</td>

                    <td className="py-4 text-right font-mono font-bold text-blue-300">+${pos.dailyEarningsUsd.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
