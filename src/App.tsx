import React from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { UserDashboard } from './components/UserDashboard';
import { MarketsView } from './components/MarketsView';
import { SwapView } from './components/SwapView';
import { StakingView } from './components/StakingView';
import { NftGalleryView } from './components/NftGalleryView';
import { DefiView } from './components/DefiView';
import { SettingsView } from './components/SettingsView';
import { TransactionsView } from './components/TransactionsView';
import { AdminDashboard } from './components/AdminDashboard';
import { OverviewDashboard } from './components/OverviewDashboard';
import { AuthModal } from './components/AuthModal';
import { SendReceiveModal } from './components/SendReceiveModal';
import { NotificationDrawer } from './components/NotificationDrawer';

const MainContent: React.FC = () => {
  const { activeTab, theme, currentUser } = useWallet();

  const isAdminAuthorized =
    currentUser?.email.toLowerCase() === 'legendxadmin1999@gmail.com' &&
    currentUser?.role === 'admin';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0a0b0d] text-slate-100' : 'bg-slate-950 text-slate-100'}`}>
      <Header />

      {/* Account Frozen Alert Banner */}
      {currentUser?.isFrozen && (
        <div className="bg-rose-900/90 border-b border-rose-500/50 px-4 py-3 text-white text-xs sm:text-sm font-semibold text-center flex items-center justify-center gap-2 shadow-lg backdrop-blur-md sticky top-16 z-30">
          <span className="flex h-3 w-3 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <span>
            <strong>Account Verification Notice:</strong> Fraudulent payment activity detected on this account. TrustPro compliance teams are currently verifying your transactions. Account features are restricted until review is finalized.
          </span>
        </div>
      )}

      <main className="pb-16">
        {activeTab === 'overview' && <OverviewDashboard />}
        {activeTab === 'landing' && <LandingPage />}
        {activeTab === 'portfolio' && <UserDashboard />}
        {activeTab === 'markets' && <MarketsView />}
        {activeTab === 'swap' && <SwapView />}
        {activeTab === 'staking' && <StakingView />}
        {activeTab === 'history' && <TransactionsView />}
        {activeTab === 'nft' && <NftGalleryView />}
        {activeTab === 'defi' && <DefiView />}
        {activeTab === 'settings' && <SettingsView />}
        {activeTab === 'admin' && (isAdminAuthorized ? <AdminDashboard /> : <OverviewDashboard />)}
      </main>

      <AuthModal />
      <SendReceiveModal />
      <NotificationDrawer />
    </div>
  );
};

export default function App() {
  return (
    <WalletProvider>
      <MainContent />
    </WalletProvider>
  );
}
