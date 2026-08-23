import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { CryptoAsset } from '../types';
import { TradingViewChart } from './TradingViewChart';
import { CryptoIcon } from './CryptoIcon';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Star,
  RefreshCw,
  X,
  Copy,
  Check,
  BarChart2,
  Sliders,
  ExternalLink,
  CandlestickChart,
  List,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const MarketsView: React.FC = () => {
  const { assets, watchlist, toggleWatchlist, refreshPrices, isPriceLoading, setActiveTab } =
    useWallet();

  const [activeViewMode, setActiveViewMode] = useState<'chart' | 'table'>('chart');
  const [selectedTradingAsset, setSelectedTradingAsset] = useState<CryptoAsset>(assets[0] || null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<
    'all' | 'gainers' | 'losers' | 'trending'
  >('all');
  const [selectedCoin, setSelectedCoin] = useState<CryptoAsset | null>(null);

  // Timeframe and Indicators state for Coin detail modal chart
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1H' | '24H' | '7D' | '1M' | '1Y'>('24H');
  const [showEma, setShowEma] = useState(true);
  const [showRsi, setShowRsi] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  // Filtered Coins
  const filteredCoins = assets.filter((coin) => {
    const matchesSearch =
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTabFilter === 'gainers') return coin.change24h > 0;
    if (activeTabFilter === 'losers') return coin.change24h < 0;
    if (activeTabFilter === 'trending') return coin.isPopular;
    return true;
  });

  // Sort gainers/losers
  if (activeTabFilter === 'gainers') {
    filteredCoins.sort((a, b) => b.change24h - a.change24h);
  } else if (activeTabFilter === 'losers') {
    filteredCoins.sort((a, b) => a.change24h - b.change24h);
  }

  // Generate interactive chart points for selected coin
  const generateChartData = (coin: CryptoAsset) => {
    const base = coin.priceUsd;
    const factor = selectedTimeframe === '1H' ? 0.005 : selectedTimeframe === '24H' ? 0.03 : 0.12;

    return coin.sparkline.map((val, idx) => {
      const price = base * (0.95 + idx * 0.015 + (Math.sin(idx) * factor));
      const ema = price * 0.995;
      const rsi = 45 + idx * 4 + (Math.sin(idx) * 10);
      return {
        time: `Pt ${idx + 1}`,
        Price: Number(price.toFixed(2)),
        EMA: Number(ema.toFixed(2)),
        RSI: Number(rsi.toFixed(1)),
      };
    });
  };

  const handleCopyContract = (address?: string) => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-[#FCD535]" />
            <span>Crypto Market & Trading Terminal</span>
          </h1>
          <p className="text-xs text-[#B7BDC6] mt-1">
            Real-time multi-chain market quotes, TradingView technical analysis, and live order terminal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle: TradingView Chart vs Table List */}
          <div className="flex rounded-xl bg-[#161A22] border border-white/10 p-1">
            <button
              onClick={() => setActiveViewMode('chart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeViewMode === 'chart'
                  ? 'bg-[#FCD535] text-black shadow-md'
                  : 'text-[#B7BDC6] hover:text-white'
              }`}
              id="view-toggle-chart"
            >
              <CandlestickChart className="h-3.5 w-3.5" />
              <span>TradingView Chart</span>
            </button>
            <button
              onClick={() => setActiveViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeViewMode === 'table'
                  ? 'bg-[#FCD535] text-black shadow-md'
                  : 'text-[#B7BDC6] hover:text-white'
              }`}
              id="view-toggle-table"
            >
              <List className="h-3.5 w-3.5" />
              <span>Market Table</span>
            </button>
          </div>

          <button
            onClick={refreshPrices}
            disabled={isPriceLoading}
            className="flex items-center gap-2 btn-secondary-dark px-4 py-2 text-xs font-bold transition-all shrink-0"
            id="refresh-prices-btn"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#FCD535] ${isPriceLoading ? 'animate-spin' : ''}`} />
            <span>{isPriceLoading ? 'Syncing...' : 'Sync Prices'}</span>
          </button>
        </div>
      </div>

      {/* TRADINGVIEW LIVE CHART SECTION */}
      {activeViewMode === 'chart' && (
        <TradingViewChart
          selectedAsset={selectedTradingAsset}
          onSelectAsset={(asset) => setSelectedTradingAsset(asset)}
        />
      )}

      {/* SEARCH AND CATEGORY TABS & TABLE */}
      <div className="rounded-3xl glass-card border border-white/10 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Coins' },
              { id: 'trending', label: '🔥 Trending' },
              { id: 'gainers', label: '🚀 Top Gainers' },
              { id: 'losers', label: '🔻 Top Losers' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabFilter(tab.id as any)}
                className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  activeTabFilter === tab.id
                    ? 'bg-[#FCD535] text-black shadow-md'
                    : 'bg-[#161A22] text-[#B7BDC6] hover:text-white'
                }`}
                id={`market-filter-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#7A8494]" />
            <input
              type="text"
              placeholder="Search coin or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-[#161A22] border border-white/10 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FCD535]"
            />
          </div>
        </div>

        {/* MARKET DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-[#7A8494]">
              <tr>
                <th className="pb-3 pl-2">Asset</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">24h Change</th>
                <th className="pb-3">24h High / Low</th>
                <th className="pb-3">24h Volume</th>
                <th className="pb-3">Market Cap</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {filteredCoins.map((coin) => {
                const isWatchlisted = watchlist.includes(coin.symbol);
                return (
                  <tr
                    key={coin.id}
                    onClick={() => {
                      setSelectedTradingAsset(coin);
                      setActiveViewMode('chart');
                    }}
                    className="hover:bg-[#2B3139]/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(coin.symbol);
                          }}
                          className="text-[#7A8494] hover:text-[#FCD535] transition-colors"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              isWatchlisted ? 'fill-[#FCD535] text-[#FCD535]' : ''
                            }`}
                          />
                        </button>
                        <CryptoIcon symbol={coin.symbol} src={coin.icon} network={coin.network} size="sm" />
                        <div>
                          <p className="font-bold text-white group-hover:text-[#FCD535] transition-colors">
                            {coin.name}
                          </p>
                          <span className="text-[10px] text-[#B7BDC6] font-mono">
                            {coin.symbol} • {coin.network}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 font-mono font-bold text-white">
                      ${coin.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </td>

                    <td className="py-4 font-semibold">
                      <span className={coin.change24h >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}>
                        {coin.change24h >= 0 ? '+' : ''}
                        {coin.change24h}%
                      </span>
                    </td>

                    <td className="py-4 font-mono text-[#B7BDC6]">
                      ${coin.high24h.toLocaleString()} / ${coin.low24h.toLocaleString()}
                    </td>

                    <td className="py-4 font-mono text-[#B7BDC6]">
                      ${(coin.volume24hUsd / 1e6).toFixed(1)}M
                    </td>

                    <td className="py-4 font-mono font-bold text-white">
                      ${(coin.marketCapUsd / 1e9).toFixed(2)}B
                    </td>

                    <td className="py-4 text-right pr-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTradingAsset(coin);
                          setActiveViewMode('chart');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#0ECB81]/10 text-[#0ECB81] hover:bg-[#0ECB81]/20 font-bold text-xs"
                      >
                        Trade Chart
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* COIN DETAILS CHART MODAL / DRAWER */}
      {selectedCoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl rounded-3xl bg-[#0e1015] border border-slate-800 p-6 lg:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedCoin(null)}
              className="absolute top-4 right-4 h-9 w-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              id="close-coin-modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
              <div className="flex items-center gap-4">
                <CryptoIcon symbol={selectedCoin.symbol} src={selectedCoin.icon} network={selectedCoin.network} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-white">{selectedCoin.name}</h2>
                    <span className="text-sm font-mono text-slate-400 font-bold">{selectedCoin.symbol}</span>
                  </div>
                  <p className="text-xs text-slate-400">Network: {selectedCoin.network}</p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-3xl font-black text-white font-mono">
                  ${selectedCoin.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </p>
                <span className={`inline-block font-bold text-sm ${selectedCoin.change24h >= 0 ? 'text-[#00D182]' : 'text-[#FF4A5A]'}`}>
                  {selectedCoin.change24h >= 0 ? '+' : ''}{selectedCoin.change24h}% (24h)
                </span>
              </div>
            </div>

            {/* Chart Toolbar: Timeframe + Indicators */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                {(['1H', '24H', '7D', '1M', '1Y'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg ${
                      selectedTimeframe === tf ? 'bg-[#3862FB] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold cursor-pointer bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={showEma}
                    onChange={(e) => setShowEma(e.target.checked)}
                    className="rounded text-[#3862FB] focus:ring-[#3862FB]"
                  />
                  <span>EMA (20)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold cursor-pointer bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={showRsi}
                    onChange={(e) => setShowRsi(e.target.checked)}
                    className="rounded text-[#3862FB] focus:ring-[#3862FB]"
                  />
                  <span>RSI</span>
                </label>
              </div>
            </div>

            {/* TradingView-Style Interactive Chart Area */}
            <div className="h-64 sm:h-80 w-full rounded-2xl bg-slate-950 border border-slate-800/80 p-4 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateChartData(selectedCoin)}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3862FB" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3862FB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#475569" fontSize={11} />
                  <YAxis stroke="#475569" fontSize={11} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Price"
                    stroke="#38B6FF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#priceGradient)"
                  />
                  {showEma && <Area type="monotone" dataKey="EMA" stroke="#3b82f6" strokeWidth={1.5} fill="none" />}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Key Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-6 text-xs">
              <div>
                <p className="text-slate-500 font-medium">Market Cap</p>
                <p className="text-sm font-bold font-mono text-white mt-0.5">${(selectedCoin.marketCapUsd / 1e9).toFixed(2)}B</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">24h Trading Vol</p>
                <p className="text-sm font-bold font-mono text-white mt-0.5">${(selectedCoin.volume24hUsd / 1e6).toFixed(1)}M</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Circulating Supply</p>
                <p className="text-sm font-bold font-mono text-white mt-0.5">{selectedCoin.circulatingSupply.toLocaleString()} {selectedCoin.symbol}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Network Standard</p>
                <p className="text-sm font-bold font-mono text-[#38B6FF] mt-0.5">{selectedCoin.network}</p>
              </div>
            </div>

            {/* Contract Address row */}
            {selectedCoin.contractAddress && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs mb-6">
                <span className="text-slate-400 font-medium">Contract Address:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-200">{selectedCoin.contractAddress.slice(0, 14)}...{selectedCoin.contractAddress.slice(-6)}</span>
                  <button
                    onClick={() => handleCopyContract(selectedCoin.contractAddress)}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copiedContract ? <Check className="h-3.5 w-3.5 text-[#38B6FF]" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Action CTA inside Modal */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedTradingAsset(selectedCoin);
                  setSelectedCoin(null);
                  setActiveViewMode('chart');
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#3862FB] to-[#38B6FF] py-3 text-xs font-bold text-white hover:opacity-90 transition-all text-center shadow-lg shadow-[#3862FB]/20"
              >
                Trade {selectedCoin.symbol} on TradingView Chart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

