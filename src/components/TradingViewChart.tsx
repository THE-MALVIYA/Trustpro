import React, { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { CryptoAsset } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  CheckCircle2,
  AlertCircle,
  CandlestickChart,
  LineChart,
  RefreshCw,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface TradingViewChartProps {
  initialSymbol?: string;
  selectedAsset?: CryptoAsset | null;
  onSelectAsset?: (asset: CryptoAsset) => void;
}

// Map crypto symbol to TradingView ticker format
const getTradingViewSymbol = (symbol: string): string => {
  const clean = symbol.toUpperCase().replace('USDT', '').replace('USD', '');
  if (clean === 'BTC') return 'BINANCE:BTCUSDT';
  if (clean === 'ETH') return 'BINANCE:ETHUSDT';
  if (clean === 'SOL') return 'BINANCE:SOLUSDT';
  if (clean === 'BNB') return 'BINANCE:BNBUSDT';
  if (clean === 'XRP') return 'BINANCE:XRPUSDT';
  if (clean === 'ADA') return 'BINANCE:ADAUSDT';
  if (clean === 'AVAX') return 'BINANCE:AVAXUSDT';
  if (clean === 'DOGE') return 'BINANCE:DOGEUSDT';
  if (clean === 'DOT') return 'BINANCE:DOTUSDT';
  if (clean === 'LINK') return 'BINANCE:LINKUSDT';
  return `BINANCE:${clean}USDT`;
};

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  initialSymbol = 'BTC',
  selectedAsset,
  onSelectAsset,
}) => {
  const { assets, currentUser, swapCrypto } = useWallet();

  const activeAsset = selectedAsset || assets.find((a) => a.symbol === initialSymbol) || assets[0];
  const tvSymbol = getTradingViewSymbol(activeAsset.symbol);

  // Mode: Isolated TradingView iFrame vs Native Technical Recharts
  const [chartEngine, setChartEngine] = useState<'tradingview' | 'native'>('tradingview');

  // Trading order form states
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState<string>('0.1');
  const [limitPrice, setLimitPrice] = useState<string>(activeAsset.priceUsd.toString());
  const [isExecuting, setIsExecuting] = useState(false);
  const [orderStatus, setOrderStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync limit price when asset changes
  useEffect(() => {
    setLimitPrice(activeAsset.priceUsd.toString());
  }, [activeAsset]);

  // Generate safe HTML for isolated iframe embedding without leaking global window script errors
  const tvIframeSrcDoc = `
<!DOCTYPE html>
<html style="width:100%;height:100%;margin:0;padding:0;background:#090b0e;overflow:hidden;">
<head>
  <meta charset="utf-8" />
  <style>
    html, body { width: 100%; height: 100%; margin: 0; padding: 0; background: #090b0e; overflow: hidden; }
    .tradingview-widget-container { width: 100%; height: 100%; }
    .tradingview-widget-container__widget { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div class="tradingview-widget-container">
    <div class="tradingview-widget-container__widget"></div>
    <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js" async>
    ${JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: '15',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      hide_side_toolbar: false,
      details: true,
      hotlist: false,
    })}
    </script>
  </div>
</body>
</html>
`;

  // Order Calculations
  const parsedAmount = parseFloat(tradeAmount) || 0;
  const executionPrice = orderType === 'limit' ? parseFloat(limitPrice) || activeAsset.priceUsd : activeAsset.priceUsd;
  const totalUsdCost = parsedAmount * executionPrice;

  // Available balances
  const usdtBalance = currentUser?.balances['USDT'] || 0;
  const coinBalance = currentUser?.balances[activeAsset.symbol] || 0;

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderStatus(null);

    if (!currentUser) {
      setOrderStatus({ type: 'error', message: 'Please log in or connect wallet to trade.' });
      return;
    }

    if (parsedAmount <= 0) {
      setOrderStatus({ type: 'error', message: 'Enter a valid trade amount.' });
      return;
    }

    setIsExecuting(true);

    setTimeout(() => {
      if (tradeSide === 'buy') {
        if (usdtBalance < totalUsdCost) {
          setOrderStatus({
            type: 'error',
            message: `Insufficient USDT balance. Need $${totalUsdCost.toFixed(2)} USDT, available: $${usdtBalance.toFixed(2)} USDT.`,
          });
          setIsExecuting(false);
          return;
        }

        const result = swapCrypto('USDT', activeAsset.symbol, totalUsdCost, parsedAmount);
        if (result.success) {
          setOrderStatus({
            type: 'success',
            message: `Buy order filled! Received +${parsedAmount} ${activeAsset.symbol} @ $${executionPrice.toLocaleString()}.`,
          });
        } else {
          setOrderStatus({ type: 'error', message: result.message });
        }
      } else {
        if (coinBalance < parsedAmount) {
          setOrderStatus({
            type: 'error',
            message: `Insufficient ${activeAsset.symbol} balance. Available: ${coinBalance} ${activeAsset.symbol}.`,
          });
          setIsExecuting(false);
          return;
        }

        const result = swapCrypto(activeAsset.symbol, 'USDT', parsedAmount, totalUsdCost);
        if (result.success) {
          setOrderStatus({
            type: 'success',
            message: `Sell order filled! Received +$${totalUsdCost.toFixed(2)} USDT @ $${executionPrice.toLocaleString()}.`,
          });
        } else {
          setOrderStatus({ type: 'error', message: result.message });
        }
      }
      setIsExecuting(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* PAIRS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {assets.slice(0, 10).map((coin) => {
          const isSelected = coin.symbol === activeAsset.symbol;
          return (
            <button
              key={coin.id}
              onClick={() => onSelectAsset && onSelectAsset(coin)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <img src={coin.icon} alt={coin.name} className="h-4 w-4 rounded-full" />
              <span>{coin.symbol}/USDT</span>
              <span className={`text-[10px] ${coin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
              </span>
            </button>
          );
        })}
      </div>

      {/* MAIN CHART + TRADING ORDER TICKET GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* TradingView / Technical Chart Container */}
        <div className="lg:col-span-8 flex flex-col rounded-3xl bg-[#090b0e] border border-slate-800 p-4 min-h-[560px] shadow-2xl relative overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3">
            <div className="flex items-center gap-3">
              <img src={activeAsset.icon} alt={activeAsset.name} className="h-8 w-8 rounded-full" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">{activeAsset.symbol}/USDT</h3>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                    SPOT TRADING
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{activeAsset.name} Real-time Technical Analysis</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5">
                <button
                  onClick={() => setChartEngine('tradingview')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    chartEngine === 'tradingview'
                      ? 'bg-emerald-500 text-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  id="engine-tv-btn"
                >
                  <CandlestickChart className="h-3 w-3" />
                  <span>TradingView Pro</span>
                </button>
                <button
                  onClick={() => setChartEngine('native')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    chartEngine === 'native'
                      ? 'bg-emerald-500 text-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  id="engine-native-btn"
                >
                  <LineChart className="h-3 w-3" />
                  <span>Native Chart</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-3 text-xs font-mono border-l border-slate-800 pl-3">
                <div>
                  <span className="text-slate-500 block text-[10px]">Mark Price</span>
                  <span className="font-bold text-white text-sm">${activeAsset.priceUsd.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Rendering Area */}
          <div className="w-full flex-1 min-h-[460px] rounded-2xl overflow-hidden relative border border-slate-800/60 bg-[#090b0e]">
            {chartEngine === 'tradingview' ? (
              <iframe
                key={tvSymbol}
                title={`TradingView-${tvSymbol}`}
                srcDoc={tvIframeSrcDoc}
                className="w-full h-full border-0 min-h-[460px]"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            ) : (
              <div className="p-4 h-full flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">24h Change:</span>
                    <span
                      className={`font-bold flex items-center gap-0.5 ${
                        activeAsset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {activeAsset.change24h >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {activeAsset.change24h >= 0 ? '+' : ''}
                      {activeAsset.change24h}%
                    </span>
                  </div>
                  <div className="text-slate-400">
                    High: <span className="text-white">${activeAsset.high24h.toLocaleString()}</span> | Low:{' '}
                    <span className="text-white">${activeAsset.low24h.toLocaleString()}</span>
                  </div>
                </div>

                <div className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeAsset.sparkline}>
                      <defs>
                        <linearGradient id="nativeChartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={activeAsset.change24h >= 0 ? '#10b981' : '#f43f5e'}
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor={activeAsset.change24h >= 0 ? '#10b981' : '#f43f5e'}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={['auto', 'auto']} hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                        formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Price']}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={activeAsset.change24h >= 0 ? '#10b981' : '#f43f5e'}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#nativeChartGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Execution Order Ticket */}
        <div className="lg:col-span-4 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span>Live Order Terminal</span>
            </h4>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Zero Fees
            </span>
          </div>

          {/* Buy / Sell Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setTradeSide('buy')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                tradeSide === 'buy'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Buy {activeAsset.symbol}
            </button>
            <button
              type="button"
              onClick={() => setTradeSide('sell')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                tradeSide === 'sell'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sell {activeAsset.symbol}
            </button>
          </div>

          {/* Market / Limit Order Selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">Order Type:</span>
            <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setOrderType('market')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                  orderType === 'market' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'
                }`}
              >
                Market
              </button>
              <button
                type="button"
                onClick={() => setOrderType('limit')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                  orderType === 'limit' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'
                }`}
              >
                Limit
              </button>
            </div>
          </div>

          {/* Balances Display */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs flex justify-between font-mono">
            <span className="text-slate-400">Available:</span>
            <span className="text-white font-bold">
              {tradeSide === 'buy'
                ? `$${usdtBalance.toLocaleString()} USDT`
                : `${coinBalance} ${activeAsset.symbol}`}
            </span>
          </div>

          <form onSubmit={handleExecuteTrade} className="space-y-4">
            {orderType === 'limit' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Limit Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">$</span>
                  <input
                    type="number"
                    step="any"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-7 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                <span>Amount ({activeAsset.symbol})</span>
                <button
                  type="button"
                  onClick={() => {
                    if (tradeSide === 'buy') {
                      const maxAmount = usdtBalance / executionPrice;
                      setTradeAmount(maxAmount.toFixed(4));
                    } else {
                      setTradeAmount(coinBalance.toString());
                    }
                  }}
                  className="text-emerald-400 hover:underline text-[10px]"
                >
                  MAX
                </button>
              </div>
              <input
                type="number"
                step="any"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                placeholder="0.00"
                required
              />
            </div>

            {/* Quick Percentage Buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => {
                    if (tradeSide === 'buy') {
                      const allocatedUsdt = usdtBalance * (pct / 100);
                      setTradeAmount((allocatedUsdt / executionPrice).toFixed(4));
                    } else {
                      setTradeAmount((coinBalance * (pct / 100)).toFixed(4));
                    }
                  }}
                  className="py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                >
                  {pct}%
                </button>
              ))}
            </div>

            {/* Summary Box */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Order Value:</span>
                <span className="text-slate-200 font-bold">${totalUsdCost.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Slippage Tolerance:</span>
                <span className="text-emerald-400 font-bold">0.1%</span>
              </div>
            </div>

            {orderStatus && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  orderStatus.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {orderStatus.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{orderStatus.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isExecuting}
              className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                tradeSide === 'buy'
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20'
                  : 'bg-rose-500 text-white hover:bg-rose-400 shadow-rose-500/20'
              }`}
              id="execute-trade-btn"
            >
              {isExecuting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              <span>
                {isExecuting
                  ? 'Executing Order...'
                  : `${tradeSide.toUpperCase()} ${activeAsset.symbol}`}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
