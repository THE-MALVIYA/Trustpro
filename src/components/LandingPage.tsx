import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { CryptoIcon } from './CryptoIcon';
import {
  Shield,
  Zap,
  Lock,
  Globe,
  Coins,
  ChevronRight,
  CheckCircle2,
  Download,
  ArrowRight,
  TrendingUp,
  Sparkles,
  QrCode,
  Smartphone,
  Laptop,
  Check,
  Mail,
  HelpCircle,
  Award,
  Layers,
  BarChart3,
  RefreshCw,
  Cpu,
  BarChart2,
  ShieldCheck,
  Users,
  Activity,
  Server,
  Key,
  Flame,
  Send,
  ExternalLink,
  Plus,
  Search,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const {
    setActiveTab,
    setIsAuthModalOpen,
    assets,
    faqs,
    currentUser,
    setIsSendModalOpen,
    setIsReceiveModalOpen,
  } = useWallet();
  const [openFaq, setOpenFaq] = useState<string | null>('faq_1');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Dynamic user portfolio calculation for Overview
  const userPortfolioUsd = currentUser
    ? assets.reduce((total, asset) => {
        const bal = currentUser.balances[asset.symbol] || 0;
        return total + bal * asset.priceUsd;
      }, 0)
    : 0;

  const topAssets = assets.slice(0, 5);

  const chains = [
    { name: 'Bitcoin', symbol: 'BTC', icon: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', color: '#F7931A' },
    { name: 'Ethereum', symbol: 'ETH', icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', color: '#627EEA' },
    { name: 'BNB Chain', symbol: 'BNB', icon: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png', color: '#F3BA2F' },
    { name: 'Solana', symbol: 'SOL', icon: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', color: '#14F195' },
    { name: 'Polygon', symbol: 'POL', icon: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png', color: '#8247E5' },
    { name: 'XRP Ledger', symbol: 'XRP', icon: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png', color: '#23292F' },
    { name: 'TRON Network', symbol: 'TRX', icon: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png', color: '#FF0013' },
    { name: 'Dogecoin', symbol: 'DOGE', icon: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', color: '#C2A633' },
  ];

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#FFFFFF] font-sans selection:bg-[#F4B400] selection:text-black">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 border-b border-white/5">
        {/* Animated Glow Backdrop Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-[#F4B400]/10 blur-[150px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/3 right-10 h-[300px] w-[300px] rounded-full bg-blue-300/10 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-xl bg-[#F4B400]/10 border border-[#F4B400]/30 px-3.5 py-1.5 text-xs font-bold text-[#F4B400] mb-6 backdrop-blur-sm shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span>INSTITUTIONAL-GRADE CRYPTO EXCHANGE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] mb-6">
                Trade Digital Assets <br />
                <span className="bg-gradient-to-r from-[#F4B400] via-[#0094FF] to-[#F4B400] bg-clip-text text-transparent">
                  with Confidence
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#B8C1CC] max-w-2xl mx-auto lg:mx-0 font-normal mb-8 leading-relaxed">
                A secure, high-performance cryptocurrency exchange built for professional traders and long-term investors. Experience lightning-fast execution, institutional-grade security, deep liquidity, and seamless multi-chain asset management—all in one powerful platform.
              </p>

              {/* Hero CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <button
                  onClick={() => setActiveTab('overview')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 btn-gold px-8 py-3.5 text-sm font-bold transition-all shadow-lg shadow-[#F4B400]/20 group"
                  id="start-trading-hero-btn"
                >
                  <span>Start Trading</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => setActiveTab('markets')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#171E29] border border-white/10 px-8 py-3.5 text-sm font-bold text-[#FFFFFF] hover:bg-[#1f2837] hover:border-white/20 transition-all"
                  id="explore-markets-hero-btn"
                >
                  <TrendingUp className="h-4 w-4 text-[#F4B400]" />
                  <span>Explore Markets</span>
                </button>
              </div>

              {/* Hero Statistics Bar */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-left">
                <div>
                  <p className="text-xl font-black text-[#F4B400]">$120B+</p>
                  <p className="text-xs text-[#B8C1CC] font-medium">Daily Volume</p>
                </div>
                <div>
                  <p className="text-xl font-black text-[#16C784]">0.001s</p>
                  <p className="text-xs text-[#B8C1CC] font-medium">Order Latency</p>
                </div>
                <div>
                  <p className="text-xl font-black text-white">100%</p>
                  <p className="text-xs text-[#B8C1CC] font-medium">Proof of Reserves</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Portfolio Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="glass-card p-6 shadow-2xl relative overflow-hidden">
                {/* Top Wallet Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#F4B400]/10 border border-[#F4B400]/30 flex items-center justify-center text-[#F4B400]">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-[#B8C1CC] font-medium">TrustPro Wallet Balance</p>
                      <p className="text-2xl font-black text-white font-mono">
                        ${userPortfolioUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#16C784]/10 border border-[#16C784]/20 px-2.5 py-1 text-xs font-bold text-[#16C784]">
                    <TrendingUp className="h-3.5 w-3.5" /> Live Spot
                  </span>
                </div>

                {/* Quick Action Deposit / Withdraw Buttons */}
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setIsAuthModalOpen(true);
                      } else {
                        setIsReceiveModalOpen(true);
                      }
                    }}
                    className="flex items-center justify-center gap-2 btn-gold py-2.5 text-xs font-bold transition-all shadow-md"
                    id="overview-deposit-btn"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Deposit Crypto</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setIsAuthModalOpen(true);
                      } else {
                        setIsSendModalOpen(true);
                      }
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#111827] border border-white/10 py-2.5 text-xs font-bold text-[#FFFFFF] hover:bg-[#161B22] transition-all"
                    id="overview-withdraw-btn"
                  >
                    <Send className="h-3.5 w-3.5 text-[#EA3943]" />
                    <span>Withdraw</span>
                  </button>
                </div>

                {/* Quick Tokens List Preview */}
                <div className="space-y-2.5 mb-5">
                  {topAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between rounded-xl bg-[#111827] border border-white/5 p-3 hover:border-[#F4B400]/40 transition-all cursor-pointer"
                      onClick={() => setActiveTab('markets')}
                    >
                      <div className="flex items-center gap-3">
                        <CryptoIcon symbol={asset.symbol} src={asset.icon} size="sm" />
                        <div>
                          <p className="text-xs font-bold text-white">{asset.name}</p>
                          <p className="text-[10px] text-[#B8C1CC] font-mono">{asset.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold font-mono text-white">${asset.priceUsd.toLocaleString()}</p>
                        <p className={`text-[10px] font-semibold ${asset.change24h >= 0 ? 'text-[#16C784]' : 'text-[#EA3943]'}`}>
                          {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick CTA */}
                <button
                  onClick={() => setActiveTab('swap')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#111827] border border-white/10 py-2.5 text-xs font-bold text-[#F4B400] hover:bg-[#161B22] transition-all"
                  id="preview-quick-swap-btn"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Instant TrustPro Convert</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORTED CHAINS SECTION */}
      <section className="py-12 bg-[#111827] border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-white">Multi-Chain Ecosystem & Native Blockchains</h2>
            <p className="text-xs text-[#B8C1CC] mt-1">Direct cross-chain settlement via TrustPro institutional liquidity routers.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {chains.map((chain) => (
              <div
                key={chain.symbol}
                className="flex flex-col items-center justify-center rounded-2xl glass-card p-3 hover:border-[#F4B400]/40 transition-all cursor-pointer"
                onClick={() => setActiveTab('markets')}
              >
                <img src={chain.icon} alt={chain.name} className="h-8 w-8 mb-2 object-contain" />
                <span className="text-xs font-bold text-white">{chain.name}</span>
                <span className="text-[10px] text-[#6B7280] font-mono mt-0.5">{chain.symbol}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED ASSETS & PERFORMANCE ANALYTICS */}
      <section className="py-20 bg-[#0B0F19]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F4B400]">Market Highlights</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">Featured Assets & Performance Analytics</h2>
            </div>
            <button
              onClick={() => setActiveTab('markets')}
              className="flex items-center gap-2 text-xs font-bold text-[#F4B400] hover:underline"
            >
              <span>View All 200+ Trading Pairs</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {assets.slice(0, 4).map((asset) => (
              <div key={asset.id} className="glass-card p-5 space-y-4 hover:border-[#F4B400]/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CryptoIcon symbol={asset.symbol} src={asset.icon} size="md" />
                    <div>
                      <h3 className="text-sm font-extrabold text-white">{asset.symbol}</h3>
                      <p className="text-[10px] text-[#6B7280]">{asset.name}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      asset.change24h >= 0 ? 'bg-[#16C784]/10 text-[#16C784]' : 'bg-[#EA3943]/10 text-[#EA3943]'
                    }`}
                  >
                    {asset.change24h >= 0 ? '+' : ''}
                    {asset.change24h}%
                  </span>
                </div>

                <div>
                  <p className="text-2xl font-black text-white font-mono">${asset.priceUsd.toLocaleString()}</p>
                  <p className="text-[11px] text-[#6B7280] font-mono mt-0.5">24h Vol: ${(asset.volume24hUsd / 1e6).toFixed(1)}M</p>
                </div>

                {/* Sparkline mini chart */}
                <div className="h-10 w-full flex items-end gap-1 pt-2">
                  {asset.sparkline.map((v, i) => {
                    const min = Math.min(...asset.sparkline);
                    const max = Math.max(...asset.sparkline);
                    const range = max - min || 1;
                    const h = Math.max(((v - min) / range) * 100, 15);
                    return (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className={`flex-1 rounded-t-sm ${asset.change24h >= 0 ? 'bg-[#16C784]' : 'bg-[#EA3943]'}`}
                      />
                    );
                  })}
                </div>

                <button
                  onClick={() => setActiveTab('swap')}
                  className="w-full btn-gold py-2 text-xs font-bold transition-all"
                >
                  Trade {asset.symbol}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE TRUSTPRO & ENTERPRISE SECURITY */}
      <section className="py-20 bg-[#111827] border-y border-white/5 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F4B400]">Institutional Pillar</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Why Choose TrustPro Exchange</h2>
            <p className="text-sm text-[#B8C1CC] mt-3">
              Engineered with cold-storage custody, zero-knowledge security proofs, and deep liquidity aggregation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 space-y-4 hover:border-[#F4B400]/40 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-[#F4B400]/10 border border-[#F4B400]/30 flex items-center justify-center text-[#F4B400]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">Enterprise Security Score</h3>
              <p className="text-xs text-[#B8C1CC] leading-relaxed">
                Multi-sig vault architecture, hardware security module (HSM) key storage, 2FA authenticator app integration, and anti-phishing safeguards.
              </p>
            </div>

            <div className="glass-card p-8 space-y-4 hover:border-[#F4B400]/40 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-[#16C784]/10 border border-[#16C784]/30 flex items-center justify-center text-[#16C784]">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">Global Liquidity Pools</h3>
              <p className="text-xs text-[#B8C1CC] leading-relaxed">
                Deep orderbook depth with institutional liquidity providers, enabling multi-million dollar trades with sub-pip slippage.
              </p>
            </div>

            <div className="glass-card p-8 space-y-4 hover:border-[#F4B400]/40 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-blue-300/10 border border-blue-300/30 flex items-center justify-center text-blue-300">
                <Coins className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">TrustPro Earn & Staking</h3>
              <p className="text-xs text-[#B8C1CC] leading-relaxed">
                High-yield flexible and locked staking products with automated daily compounding payouts directly into your Web3 wallet.
              </p>
            </div>
          </div>

          {/* Trusted by Thousands Banner */}
          <div className="glass-card p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-[#F4B400]">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-xl font-black text-white">Trusted by Over 500,000+ Active Global Traders</h4>
              <p className="text-xs text-[#B8C1CC]">Operating with 99.99% uptime since launch with over $200B in cumulative volume.</p>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-gold px-8 py-3 text-xs font-bold shrink-0"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* MOBILE TRADING APP & PARTNER ECOSYSTEM */}
      <section className="py-20 bg-[#0B0F19]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F4B400]">Trade Anywhere, Anytime</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                TrustPro Mobile App <br />
                Power in Your Pocket
              </h2>
              <p className="text-sm text-[#B8C1CC] leading-relaxed">
                Stay connected to global crypto markets with our native iOS & Android applications. Realtime price alerts, instant biometric login, touch order execution, and full Web3 wallet management.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="glass-card p-4 flex items-center gap-3">
                  <Smartphone className="h-8 w-8 text-[#F4B400]" />
                  <div>
                    <p className="text-xs font-bold text-white">iOS & Android</p>
                    <p className="text-[10px] text-[#6B7280]">Download App</p>
                  </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-3">
                  <QrCode className="h-8 w-8 text-[#16C784]" />
                  <div>
                    <p className="text-xs font-bold text-white">Scan QR Code</p>
                    <p className="text-[10px] text-[#6B7280]">Instant Sync</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md glass-card p-6 border border-white/10 text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-[#F4B400] text-black flex items-center justify-center font-black text-2xl shadow-xl">
                  T
                </div>
                <h3 className="text-xl font-black text-white">Download TrustPro Pro App</h3>
                <p className="text-xs text-[#B8C1CC]">Compatible with iOS 15+, Android 10+, and macOS M-series.</p>
                <div className="pt-2 flex justify-center gap-3">
                  <button className="btn-gold px-6 py-2.5 text-xs font-bold">App Store</button>
                  <button className="rounded-xl bg-[#111827] border border-white/10 px-6 py-2.5 text-xs font-bold text-white hover:bg-[#161B22]">Google Play</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-[#111827] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F4B400]">Help Center</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="glass-card p-5 border border-white/5 cursor-pointer transition-all"
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-[#F4B400]" />
                      {faq.question}
                    </h3>
                    <ChevronRight className={`h-4 w-4 text-[#B8C1CC] transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </div>
                  {isOpen && (
                    <p className="text-xs text-[#B8C1CC] mt-3 leading-relaxed border-t border-white/5 pt-3">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE ENTERPRISE FOOTER */}
      <footer className="bg-[#0B0F19] border-t border-white/10 pt-16 pb-12 text-xs text-[#B8C1CC]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Top Newsletter Row */}
          <div className="glass-card p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-black text-white">Subscribe to TrustPro Market Insights</h3>
              <p className="text-xs text-[#B8C1CC] mt-1">Get daily market research, technical analysis, and exchange announcements.</p>
            </div>
            <form onSubmit={handleNewsletter} className="flex w-full lg:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="rounded-xl bg-[#111827] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#F4B400] w-full sm:w-72"
              />
              <button type="submit" className="btn-gold px-6 py-2.5 text-xs font-bold shrink-0">
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>

          {/* Links Columns Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-white/10 pb-12">
            {/* Column 1: Company */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-white tracking-wider">Company</h4>
              <ul className="space-y-2 text-[#B8C1CC]">
                <li className="hover:text-[#F4B400] cursor-pointer">About Us</li>
                <li className="hover:text-[#F4B400] cursor-pointer">Careers (Hiring)</li>
                <li className="hover:text-[#F4B400] cursor-pointer">Press & Media</li>
                <li className="hover:text-[#F4B400] cursor-pointer">TrustPro Blog</li>
                <li className="hover:text-[#F4B400] cursor-pointer">Proof of Reserves</li>
              </ul>
            </div>

            {/* Column 2: Products */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-white tracking-wider">Products</h4>
              <ul className="space-y-2 text-[#B8C1CC]">
                <li onClick={() => setActiveTab('markets')} className="hover:text-[#F4B400] cursor-pointer">Spot Trading</li>
                <li onClick={() => setActiveTab('markets')} className="hover:text-[#F4B400] cursor-pointer">Futures Trading</li>
                <li onClick={() => setActiveTab('staking')} className="hover:text-[#F4B400] cursor-pointer">TrustPro Staking</li>
                <li onClick={() => setActiveTab('overview')} className="hover:text-[#F4B400] cursor-pointer">Launchpad</li>
                <li onClick={() => setActiveTab('nft')} className="hover:text-[#F4B400] cursor-pointer">NFT Marketplace</li>
                <li onClick={() => setActiveTab('portfolio')} className="hover:text-[#F4B400] cursor-pointer">Web3 Wallet</li>
              </ul>
            </div>

            {/* Column 3: Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-white tracking-wider">Support</h4>
              <ul className="space-y-2 text-[#B8C1CC]">
                <li onClick={() => setActiveTab('overview')} className="hover:text-[#F4B400] cursor-pointer">24/7 Help Center</li>
                <li onClick={() => setActiveTab('overview')} className="hover:text-[#F4B400] cursor-pointer">Contact Support</li>
                <li onClick={() => setActiveTab('settings')} className="hover:text-[#F4B400] cursor-pointer">API Documentation</li>
                <li className="hover:text-[#F4B400] cursor-pointer">Community Forums</li>
                <li onClick={() => setActiveTab('settings')} className="hover:text-[#F4B400] cursor-pointer">Security Center</li>
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-white tracking-wider">Legal & Compliance</h4>
              <ul className="space-y-2 text-[#B8C1CC]">
                <li className="hover:text-[#F4B400] cursor-pointer">Privacy Policy</li>
                <li className="hover:text-[#F4B400] cursor-pointer">Terms of Service</li>
                <li className="hover:text-[#F4B400] cursor-pointer">Risk Disclosure</li>
                <li className="hover:text-[#F4B400] cursor-pointer">AML / KYC Policy</li>
                <li className="hover:text-[#F4B400] cursor-pointer">Cookie Settings</li>
              </ul>
            </div>

            {/* Column 5: Social */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-white tracking-wider">Social Channels</h4>
              <ul className="space-y-2 text-[#B8C1CC]">
                <li className="hover:text-[#F4B400] cursor-pointer flex items-center gap-2">
                  <span>X (Twitter)</span>
                </li>
                <li className="hover:text-[#F4B400] cursor-pointer flex items-center gap-2">
                  <span>Telegram Global</span>
                </li>
                <li className="hover:text-[#F4B400] cursor-pointer flex items-center gap-2">
                  <span>Discord Community</span>
                </li>
                <li className="hover:text-[#F4B400] cursor-pointer flex items-center gap-2">
                  <span>GitHub Open Source</span>
                </li>
                <li className="hover:text-[#F4B400] cursor-pointer flex items-center gap-2">
                  <span>LinkedIn Official</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[#6B7280]">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-[#F4B400] text-black flex items-center justify-center font-black text-xs">
                T
              </div>
              <span className="font-bold text-white uppercase text-sm">TRUSTPRO EXCHANGE</span>
            </div>
            <p>© 2026 TrustPro Enterprise Exchange Ltd. All rights reserved.</p>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-[#16C784]">
                <span className="h-2 w-2 rounded-full bg-[#16C784] animate-pulse" />
                All Systems Normal
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

