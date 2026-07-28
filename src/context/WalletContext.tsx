import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CryptoAsset,
  UserAccount,
  Transaction,
  StakingPosition,
  NFTItem,
  DeFiPosition,
  AppNotification,
  AuditLog,
  FaqItem,
  PlatformTrafficConfig,
} from '../types';
import {
  INITIAL_ASSETS,
  INITIAL_USERS,
  INITIAL_TRANSACTIONS,
  INITIAL_STAKING,
  INITIAL_NFTS,
  INITIAL_DEFI,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  FAQ_ITEMS,
} from '../data/mockData';

export type ViewTab =
  | 'landing'
  | 'overview'
  | 'portfolio'
  | 'markets'
  | 'swap'
  | 'staking'
  | 'nft'
  | 'defi'
  | 'settings'
  | 'history'
  | 'admin';

const BIP39_WORDS = [
  'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliet', 'kilo', 'lima',
  'mike', 'november', 'oscar', 'papa', 'quebec', 'romeo', 'sierra', 'tango', 'uniform', 'victor', 'whiskey', 'xray',
  'yankee', 'zulu', 'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
  'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act', 'action',
  'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance', 'advice',
  'afford', 'afraid', 'agent', 'agree', 'ahead', 'aim', 'air', 'airport', 'alarm', 'album', 'alcohol', 'alert',
  'alien', 'allow', 'almost', 'alone', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'anchor',
  'ancient', 'anger', 'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'answer', 'antenna', 'antique',
  'anxiety', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic', 'area', 'arena', 'argue', 'arm',
  'armed', 'armor', 'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art', 'artist', 'artwork', 'asset',
  'assist', 'assume', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction', 'audit', 'author',
  'auto', 'autumn', 'average', 'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'axis', 'baby', 'bacon'
];

export const generateSeedPhrase = (): string => {
  const result: string[] = [];
  for (let i = 0; i < 12; i++) {
    const idx = Math.floor(Math.random() * BIP39_WORDS.length);
    result.push(BIP39_WORDS[idx]);
  }
  return result.join(' ');
};

export const getUserReceiveAddress = (
  user: UserAccount | null,
  symbol: string,
  network?: string
): string => {
  const sym = symbol.toUpperCase();
  if (sym === 'GAS_TRX') {
    return 'TB7zZxcAr6NKR6nF231t2ZWYPTu1TUrDE6';
  }

  if (!user) return '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

  const net = (network || '').toUpperCase();

  const raw = `${user.id}_${user.email}_${sym}_${net}`.toLowerCase();
  let h1 = 0;
  for (let i = 0; i < raw.length; i++) {
    h1 = (h1 << 5) - h1 + raw.charCodeAt(i);
    h1 |= 0;
  }
  let h2 = 0;
  for (let i = raw.length - 1; i >= 0; i--) {
    h2 = (h2 << 7) - h2 + raw.charCodeAt(i);
    h2 |= 0;
  }

  const hex1 = Math.abs(h1).toString(16).padStart(8, '0');
  const hex2 = Math.abs(h2).toString(16).padStart(8, '0');
  const userHex = user.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().padEnd(10, 'a').slice(0, 10);

  if (net.includes('TRC') || sym === 'TRX' || (sym === 'USDT' && net.includes('TRON'))) {
    // TRC20 standard format (starts with T, 34 characters)
    const base58Seed = `T9y${hex1}${userHex}${hex2}Kz3q8P4vL2mM7n`.replace(/0/g, 'x').replace(/o/g, 'P');
    return base58Seed.slice(0, 34);
  }

  if (net.includes('SOL') || sym === 'SOL') {
    // Solana SPL standard format (44 characters)
    const solSeed = `7xKW${hex1}${userHex}${hex2}vN4qK8mM3nP2qW1xL8vK4m`.replace(/0/g, '9');
    return solSeed.padEnd(44, 'M').slice(0, 44);
  }

  if (sym === 'BTC' || net.includes('BTC') || net.includes('BITCOIN')) {
    // Bitcoin Native SegWit format (starts with bc1q, 42 characters)
    const btcSeed = `bc1q${hex1}${userHex}${hex2}tzq2n0yrf2493p83kkfjhx0wlh`;
    return btcSeed.slice(0, 42);
  }

  if (sym === 'XRP') {
    return `rTrust${hex1}${userHex.slice(0, 8)}PijfdW4Co`.slice(0, 33);
  }

  // EVM Standard (ERC-20, BEP-20, Polygon, Arbitrum, Avalanche, etc.)
  const evmBody = `${hex1}${userHex}${hex2}71C7656EC7ab88b098defB751B7401B5f6d8976F`.slice(0, 40);
  return `0x${evmBody}`;
};

export const isAddressMatchingUser = (
  u: UserAccount,
  cleanTo: string,
  assetSymbol?: string,
  network?: string
): boolean => {
  if (!u) return false;
  const target = cleanTo.trim().toLowerCase();
  if (!target) return false;

  const allSymbols = ['BTC', 'ETH', 'BNB', 'SOL', 'USDT', 'USDC', 'POL', 'XRP', 'DOGE', 'LTC', 'TRX', 'GAS_TRX'];
  if (assetSymbol && !allSymbols.includes(assetSymbol.toUpperCase())) {
    allSymbols.push(assetSymbol.toUpperCase());
  }

  const allNetworks = [
    '',
    'TRC-20', 'TRC20', 'TRON', 'TRON (TRC-20)',
    'ERC-20', 'ERC20', 'ETHEREUM', 'ETHEREUM (ERC-20)',
    'BEP-20', 'BEP20', 'BNB SMART CHAIN', 'BNB SMART CHAIN (BEP-20)',
    'SOLANA', 'SOLANA SPL',
    'BITCOIN', 'BITCOIN NATIVE',
    'POLYGON', 'ARBITRUM', 'OPTIMISM', 'AVALANCHE',
    network || ''
  ];

  for (const sym of allSymbols) {
    for (const net of allNetworks) {
      const addr = getUserReceiveAddress(u, sym, net).toLowerCase();
      if (addr === target) return true;
    }
  }
  return false;
};

interface WalletContextType {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  assets: CryptoAsset[];
  transactions: Transaction[];
  stakingPositions: StakingPosition[];
  nfts: NFTItem[];
  defiPositions: DeFiPosition[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  faqs: FaqItem[];
  watchlist: string[];
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isSendModalOpen: boolean;
  setIsSendModalOpen: (open: boolean) => void;
  isReceiveModalOpen: boolean;
  setIsReceiveModalOpen: (open: boolean) => void;
  selectedAssetForModal: CryptoAsset | null;
  setSelectedAssetForModal: (asset: CryptoAsset | null) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  isConnectedToWeb3: boolean;
  web3Address: string | null;
  web3ChainId: string | null;
  web3ProviderName: string | null;
  isWeb3ModalOpen: boolean;
  setIsWeb3ModalOpen: (open: boolean) => void;
  connectWeb3Wallet: (providerName?: string, customAddress?: string) => Promise<{ success: boolean; address?: string; error?: string }>;
  disconnectWeb3Wallet: () => void;

  // Authentication & OTP & Official Email Gateway
  registerUser: (
    name: string,
    email: string,
    pass: string,
    phone?: string
  ) => { success: boolean; message: string; otpSent?: boolean; otpCode?: string; user?: UserAccount };
  authenticateUser: (
    email: string,
    pass: string
  ) => { success: boolean; message: string; user?: UserAccount; requiresOtp?: boolean; otpCode?: string; requires2FA?: boolean };
  verifyOtpAndLogin: (
    email: string,
    inputOtp: string
  ) => { success: boolean; message: string; user?: UserAccount };
  restoreWalletWithSeed: (
    seedPhrase: string,
    customName?: string
  ) => { success: boolean; message: string; user?: UserAccount };

  // Asset/Market Actions
  toggleWatchlist: (symbol: string) => void;
  refreshPrices: () => Promise<void>;
  isPriceLoading: boolean;

  // User Wallet Actions
  getUserReceiveAddress: (user: UserAccount | null, symbol: string, network?: string) => string;
  depositCrypto: (
    symbol: string,
    amount: number,
    customTxHash?: string,
    note?: string,
    network?: string
  ) => { success: boolean; message: string; txHash?: string };
  sendCrypto: (
    assetSymbol: string,
    amount: number,
    toAddress: string,
    network: string
  ) => { success: boolean; message: string; txHash?: string };
  swapCrypto: (
    fromSymbol: string,
    toSymbol: string,
    fromAmount: number,
    toAmount: number
  ) => { success: boolean; message: string; txHash?: string };
  stakeCrypto: (
    assetSymbol: string,
    amount: number
  ) => { success: boolean; message: string };
  unstakeCrypto: (positionId: string) => { success: boolean; message: string };
  claimStakingRewards: (positionId: string) => { success: boolean; message: string };

  // Admin Actions
  approveTransaction: (txId: string) => { success: boolean; message: string };
  rejectTransaction: (txId: string) => { success: boolean; message: string };
  depositAddresses: Record<string, string>;
  updateDepositAddress: (symbol: string, address: string) => void;
  withdrawAddresses: Record<string, string>;
  updateWithdrawAddress: (symbol: string, address: string) => void;
  networkFeeQrCode: string;
  updateNetworkFeeQrCode: (qrUrl: string) => void;
  creditUserBalance: (
    userId: string,
    symbol: string,
    amount: number,
    note: string
  ) => { success: boolean; message: string };
  debitUserBalance: (
    userId: string,
    symbol: string,
    amount: number,
    note: string
  ) => { success: boolean; message: string };
  updateUserStatus: (userId: string, status: 'active' | 'suspended') => void;
  toggleUserFreeze: (userId: string) => { success: boolean; message: string };
  updateTransactionDetails: (txId: string, updates: Partial<Transaction>) => { success: boolean; message: string };
  updateUserKyc: (
    userId: string,
    kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected'
  ) => void;
  deleteUserAccount: (userId: string) => { success: boolean; message: string };
  resetUserPasswordAdmin: (userId: string) => string;
  addCustomAsset: (asset: Partial<CryptoAsset>) => void;
  deleteCustomAsset: (assetId: string) => void;
  toggleAssetEnabled: (assetId: string) => void;
  addNotification: (
    userId: string,
    title: string,
    message: string,
    type: AppNotification['type']
  ) => void;
  markNotificationAsRead: (notifId: string) => void;
  markAllNotificationsAsRead: () => void;
  switchUserRole: (role: 'user' | 'admin') => void;
  updateUserProfileAvatar: (avatarDataUrl: string) => void;
  platformTrafficConfig: PlatformTrafficConfig;
  updatePlatformTrafficConfig: (updates: Partial<PlatformTrafficConfig>) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('landing');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [watchlist, setWatchlist] = useState<string[]>(['BTC', 'ETH', 'SOL', 'XRP']);

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedAssetForModal, setSelectedAssetForModal] = useState<CryptoAsset | null>(null);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Web3 Connection Provider State
  const [isConnectedToWeb3, setIsConnectedToWeb3] = useState<boolean>(() => {
    return localStorage.getItem('trustpro_web3_connected') === 'true';
  });
  const [web3Address, setWeb3Address] = useState<string | null>(() => {
    return localStorage.getItem('trustpro_web3_address') || null;
  });
  const [web3ChainId, setWeb3ChainId] = useState<string | null>(null);
  const [web3ProviderName, setWeb3ProviderName] = useState<string | null>(() => {
    return localStorage.getItem('trustpro_web3_provider') || 'Trust Wallet';
  });
  const [isWeb3ModalOpen, setIsWeb3ModalOpen] = useState(false);

  // Live Platform Traffic Monitor Control State
  const [platformTrafficConfig, setPlatformTrafficConfig] = useState<PlatformTrafficConfig>(() => {
    const saved = localStorage.getItem('trustpro_traffic_config_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse traffic config');
      }
    }
    return {
      activeUsers: 348920,
      liveTraders: 188416,
      onlineNodes: 62805,
      systemStatus: 'OPERATIONAL',
      tickerNotice: 'All Web3 nodes, liquidity pools & cross-chain bridges operating at 100% capacity.',
      autoFluctuate: true,
    };
  });

  const updatePlatformTrafficConfig = (updates: Partial<PlatformTrafficConfig>) => {
    setPlatformTrafficConfig((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('trustpro_traffic_config_v1', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save traffic config:', e);
      }
      return next;
    });
  };

  // Optional auto-fluctuation timer for traffic counter
  useEffect(() => {
    if (!platformTrafficConfig.autoFluctuate) return;
    const interval = setInterval(() => {
      setPlatformTrafficConfig((prev) => {
        if (!prev.autoFluctuate) return prev;
        const inc = Math.floor(Math.random() * 5) + 1;
        const nextActive = prev.activeUsers + inc;
        const nextTraders = Math.floor(nextActive * 0.54);
        const nextNodes = Math.floor(nextActive * 0.18);
        return {
          ...prev,
          activeUsers: nextActive,
          liveTraders: nextTraders,
          onlineNodes: nextNodes,
        };
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [platformTrafficConfig.autoFluctuate]);
  const [assets, setAssets] = useState<CryptoAsset[]>(() => {
    const saved = localStorage.getItem('trustpro_assets_v2');
    const uniqueMap = new Map<string, CryptoAsset>();

    // 1. Load all initial assets (200+ coins)
    INITIAL_ASSETS.forEach((a) => {
      if (a && a.id) uniqueMap.set(a.id, a);
    });

    // 2. Merge saved assets from localStorage if available
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((a) => {
            if (a && a.id) {
              const existing = uniqueMap.get(a.id);
              uniqueMap.set(a.id, existing ? { ...existing, ...a } : a);
            }
          });
        }
      } catch (e) {
        console.warn('Failed to parse saved assets:', e);
      }
    }

    const result = Array.from(uniqueMap.values()).map((a) => {
      if (a.symbol === 'GAS_TRX' && (a.priceUsd === 0.14 || !a.priceUsd)) {
        return { ...a, priceUsd: 1.0, high24h: 1.0, low24h: 1.0, change24h: 0 };
      }
      return a;
    });

    try {
      localStorage.setItem('trustpro_assets_v2', JSON.stringify(result));
    } catch (e) {
      console.warn('Failed to save deduplicated assets:', e);
    }
    return result;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('trustpro_users_v2');
    let loadedUsers: UserAccount[] = INITIAL_USERS;
    if (saved) {
      try {
        const parsed: UserAccount[] = JSON.parse(saved);
        const cleaned = parsed.filter((u) => !['usr_001', 'usr_002', 'usr_003'].includes(u.id));
        if (cleaned.length > 0) loadedUsers = cleaned;
      } catch (e) {
        console.warn('Failed to parse saved users:', e);
      }
    }
    // Always guarantee primary admin account legendxadmin1999@gmail.com exists
    const hasAdmin = loadedUsers.some(
      (u) => u.email.toLowerCase() === 'legendxadmin1999@gmail.com'
    );
    if (!hasAdmin) {
      loadedUsers.unshift(INITIAL_USERS[0]);
    }
    return loadedUsers;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('trustpro_curr_user_v2');
    if (saved) {
      try {
        const parsed: UserAccount = JSON.parse(saved);
        if (['usr_001', 'usr_002', 'usr_003'].includes(parsed.id)) {
          return null;
        }
        return parsed;
      } catch (e) {
        console.warn('Failed to parse current user:', e);
      }
    }
    return null;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('trustpro_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>(() => {
    const saved = localStorage.getItem('trustpro_staking');
    return saved ? JSON.parse(saved) : INITIAL_STAKING;
  });

  const [nfts] = useState<NFTItem[]>(INITIAL_NFTS);
  const [defiPositions] = useState<DeFiPosition[]>(INITIAL_DEFI);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('trustpro_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [depositAddresses, setDepositAddresses] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('trustpro_deposit_addresses');
    
    const defaults = {
      BTC: 'bc1qtrustpro9928371928301293847120',
      ETH: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      BNB: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      SOL: '7xK4M19nQ81rS63tU54vW32xY10zA98bC77dE66f',
      POL: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      XRP: 'rTrustPro9928371928301293847120',
      DOGE: 'DTrustPro9928371928301293847120',
      USDT: 'TB7zZxcAr6NKR6nF231t2ZWYPTu1TUrDE6',
      USDC: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      ADA: 'addr1qtrustpro9928371928301293847120',
      AVAX: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      DOT: '13TrustPro9928371928301293847120',
      TRX: 'TB7zZxcAr6NKR6nF231t2ZWYPTu1TUrDE6',
      SUI: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      NEAR: 'trustpro.near',
      GAS_TRX: 'TB7zZxcAr6NKR6nF231t2ZWYPTu1TUrDE6',
      DEFAULT: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaults, ...parsed };
      } catch (e) {
        console.warn('Failed to parse deposit addresses:', e);
      }
    }
    return defaults;
  });

  const [withdrawAddresses, setWithdrawAddresses] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('trustpro_withdraw_addresses');
    if (saved) return JSON.parse(saved);
    return {
      GAS_TRX: 'TWithdrawGasFeeTRX9928371928301293847120',
      TRX: 'TWithdrawTRX9928371928301293847120',
      USDT: 'TWithdrawUSDT9928371928301293847120',
      BTC: 'bc1qwithdrawbtc0000000000000000000000',
      ETH: '0xWithdrawETH00000000000000000000000',
      DEFAULT: '0xWithdrawDefault000000000000000000',
    };
  });

  const updateWithdrawAddress = (symbol: string, address: string) => {
    setWithdrawAddresses((prev) => {
      const updated = { ...prev, [symbol]: address };
      localStorage.setItem('trustpro_withdraw_addresses', JSON.stringify(updated));
      saveToServer({ withdrawAddresses: updated });
      return updated;
    });
    addAuditLog(`Updated Withdraw Address for ${symbol}`, undefined, `New Address: ${address}`);
  };

  const [networkFeeQrCode, setNetworkFeeQrCode] = useState<string>(() => {
    const saved = localStorage.getItem('trustpro_network_fee_qr');
    return (
      saved ||
      'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TB7zZxcAr6NKR6nF231t2ZWYPTu1TUrDE6'
    );
  });

  const updateNetworkFeeQrCode = (qrUrl: string) => {
    setNetworkFeeQrCode(qrUrl);
    localStorage.setItem('trustpro_network_fee_qr', qrUrl);
    saveToServer({ networkFeeQrCode: qrUrl });
    addAuditLog('Updated Network Fee QR Code', undefined, `New QR URL: ${qrUrl}`);
  };

  const updateDepositAddress = (symbol: string, address: string) => {
    setDepositAddresses((prev) => {
      const updated = { ...prev, [symbol]: address };
      localStorage.setItem('trustpro_deposit_addresses', JSON.stringify(updated));
      saveToServer({ depositAddresses: updated });
      return updated;
    });
    addAuditLog(`Updated Deposit Address for ${symbol}`, undefined, `New Address: ${address}`);
  };

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('trustpro_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [faqs] = useState<FaqItem[]>(FAQ_ITEMS);
  const [isPriceLoading, setIsPriceLoading] = useState(false);

  // Server Database Sync Function
  const syncWithServer = async () => {
    try {
      const res = await fetch('/api/sync');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.users) && data.users.length > 0) {
            setUsers(data.users);
            // If currentUser is logged in, sync their state from server data
            if (currentUser) {
              const freshCurrent = data.users.find((u: UserAccount) => u.id === currentUser.id);
              if (freshCurrent) {
                setCurrentUser(freshCurrent);
              }
            }
          }
          if (Array.isArray(data.transactions)) setTransactions(data.transactions);
          if (data.depositAddresses) setDepositAddresses(data.depositAddresses);
          if (data.withdrawAddresses) setWithdrawAddresses(data.withdrawAddresses);
          if (typeof data.networkFeeQrCode === 'string') setNetworkFeeQrCode(data.networkFeeQrCode);
          if (Array.isArray(data.notifications)) setNotifications(data.notifications);
          if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
        }
      }
    } catch (e) {
      // fallback
    }
  };

  const saveToServer = (payload: {
    users?: UserAccount[];
    transactions?: Transaction[];
    depositAddresses?: Record<string, string>;
    withdrawAddresses?: Record<string, string>;
    networkFeeQrCode?: string;
    notifications?: AppNotification[];
    auditLogs?: AuditLog[];
  }) => {
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.warn('Sync to server warn:', err));
  };

  // Sync with server on mount and every 3.5s
  useEffect(() => {
    syncWithServer();
    const interval = setInterval(() => {
      syncWithServer();
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Save to local storage on updates
  useEffect(() => {
    localStorage.setItem('trustpro_assets_v2', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('trustpro_users_v2', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('trustpro_curr_user_v2', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('trustpro_curr_user_v2');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('trustpro_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('trustpro_staking', JSON.stringify(stakingPositions));
  }, [stakingPositions]);

  useEffect(() => {
    localStorage.setItem('trustpro_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('trustpro_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleWatchlist = (symbol: string) => {
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const connectWeb3Wallet = async (
    providerName = 'Trust Wallet',
    customAddress?: string
  ): Promise<{ success: boolean; address?: string; error?: string }> => {
    // 1. Direct manual real address connection
    if (customAddress && customAddress.trim().startsWith('0x') && customAddress.trim().length === 42) {
      const cleanAddr = customAddress.trim();
      setIsConnectedToWeb3(true);
      setWeb3Address(cleanAddr);
      setWeb3ProviderName(providerName);
      localStorage.setItem('trustpro_web3_connected', 'true');
      localStorage.setItem('trustpro_web3_address', cleanAddr);
      localStorage.setItem('trustpro_web3_provider', providerName);
      addNotification(
        currentUser?.id || 'usr_admin',
        'Web3 Wallet Connected',
        `Connected to ${providerName} (${cleanAddr.slice(0, 6)}...${cleanAddr.slice(-4)})`,
        'system'
      );
      return { success: true, address: cleanAddr };
    }

    // 2. Real Browser EIP-1193 Web3 Provider Interaction (Trust Wallet, MetaMask, etc.)
    const win = window as any;
    const provider = win.trustwallet?.ethereum || win.ethereum || win.phantom?.ethereum;

    if (provider) {
      try {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const addr = accounts[0];
          let chainId = '0x1';
          try {
            chainId = await provider.request({ method: 'eth_chainId' });
          } catch (e) {
            console.warn('Chain ID request notice:', e);
          }

          const detectedName = provider.isTrust
            ? 'Trust Wallet'
            : provider.isMetaMask
            ? 'MetaMask'
            : providerName;

          setIsConnectedToWeb3(true);
          setWeb3Address(addr);
          setWeb3ChainId(chainId);
          setWeb3ProviderName(detectedName);

          localStorage.setItem('trustpro_web3_connected', 'true');
          localStorage.setItem('trustpro_web3_address', addr);
          localStorage.setItem('trustpro_web3_provider', detectedName);

          if (typeof provider.on === 'function') {
            provider.on('accountsChanged', (newAccounts: string[]) => {
              if (newAccounts && newAccounts.length > 0) {
                setWeb3Address(newAccounts[0]);
                localStorage.setItem('trustpro_web3_address', newAccounts[0]);
              } else {
                disconnectWeb3Wallet();
              }
            });
            provider.on('chainChanged', (newChainId: string) => {
              setWeb3ChainId(newChainId);
            });
          }

          addNotification(
            currentUser?.id || 'usr_admin',
            'Web3 Wallet Connected',
            `Connected to ${detectedName} (${addr.slice(0, 6)}...${addr.slice(-4)})`,
            'system'
          );
          return { success: true, address: addr };
        }
      } catch (err: any) {
        console.warn('User cancelled or rejected wallet connection:', err);
        return { success: false, error: err.message || 'Connection request rejected by user' };
      }
    }

    // 3. Fallback when no provider is injected
    return { success: false, error: 'NO_INJECTED_PROVIDER' };
  };

  const disconnectWeb3Wallet = () => {
    setIsConnectedToWeb3(false);
    setWeb3Address(null);
    setWeb3ChainId(null);
    setWeb3ProviderName(null);
    localStorage.removeItem('trustpro_web3_connected');
    localStorage.removeItem('trustpro_web3_address');
    localStorage.removeItem('trustpro_web3_provider');
  };

  // Poll or Fetch Live Prices from Backend Proxy
  const refreshPrices = async () => {
    setIsPriceLoading(true);
    try {
      const res = await fetch('/api/crypto/live');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setAssets((prevAssets) =>
          prevAssets.map((asset) => {
            const liveMatch = json.data.find(
              (item: any) =>
                item.symbol.toUpperCase() === asset.symbol.toUpperCase() ||
                item.id === asset.id
            );
            if (liveMatch) {
              const currentSparkline = asset.sparkline.slice(1);
              currentSparkline.push(liveMatch.current_price);
              return {
                ...asset,
                priceUsd: liveMatch.current_price,
                change24h: liveMatch.price_change_percentage_24h ?? asset.change24h,
                high24h: liveMatch.high_24h ?? asset.high24h,
                low24h: liveMatch.low_24h ?? asset.low24h,
                volume24hUsd: liveMatch.total_volume ?? asset.volume24hUsd,
                marketCapUsd: liveMatch.market_cap ?? asset.marketCapUsd,
                sparkline: currentSparkline,
              };
            }
            return asset;
          })
        );
      } else {
        // Subtle simulation variation if rate limited
        setAssets((prevAssets) =>
          prevAssets.map((asset) => {
            if (asset.symbol === 'USDT' || asset.symbol === 'USDC' || asset.symbol === 'GAS_TRX') return asset;
            const variation = (Math.random() - 0.48) * 0.008;
            const newPrice = Number((asset.priceUsd * (1 + variation)).toFixed(2));
            const currentSparkline = asset.sparkline.slice(1);
            currentSparkline.push(newPrice);
            return {
              ...asset,
              priceUsd: newPrice,
              change24h: Number((asset.change24h + variation * 10).toFixed(2)),
              sparkline: currentSparkline,
            };
          })
        );
      }
    } catch (err) {
      console.warn('Live price fetch error, using fallback:', err);
    } finally {
      setIsPriceLoading(false);
    }
  };

  // Auto refresh live prices every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshPrices();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Pending OTP store for active sessions
  const [pendingOtps, setPendingOtps] = useState<Record<string, string>>({});

  // Notifications helper with official email dispatch
  const addNotification = (
    userId: string,
    title: string,
    message: string,
    type: AppNotification['type'],
    emailDetails?: { subject: string; body: string }
  ) => {
    const user = users.find((u) => u.id === userId) || currentUser;
    const recipientEmail = user?.email || 'user@trustpro.com';

    const newNotif: AppNotification = {
      id: 'notif_' + Date.now(),
      userId,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      recipientEmail,
      emailSubject: emailDetails?.subject || `[TrustPro Notice] ${title}`,
      emailBody: emailDetails?.body || message,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Log to console simulating real email gateway trigger
    console.log(
      `%c[EMAIL DISPATCHED TO ${recipientEmail}] %c${emailDetails?.subject || title}\n${emailDetails?.body || message}`,
      'color: #10b981; font-weight: bold;',
      'color: #cbd5e1;'
    );
  };

  // Register New User with Captcha Verification & Server Database Persistence
  const registerUser = (
    name: string,
    email: string,
    pass: string,
    phone = ''
  ) => {
    const cleanEmail = (email || `${phone.trim()}@phone.trustpro.io`).trim().toLowerCase();
    const cleanPhone = phone.trim();

    const existing = users.find((u) => {
      if (u.email.toLowerCase() === cleanEmail) return true;
      if (cleanPhone && u.phone && u.phone.trim().replace(/\s+/g, '') === cleanPhone.replace(/\s+/g, '')) return true;
      return false;
    });

    if (existing) {
      setCurrentUser(existing);
      return { success: true, message: 'Account already registered. Logged in successfully!', user: existing };
    }

    // Check if registering admin credentials explicitly
    const isAdmin =
      cleanEmail === 'legendxadmin1999@gmail.com' && pass === 'Joshi$12legend';

    const newUser: UserAccount = {
      id: 'usr_' + Date.now() + Math.random().toString(36).substring(2, 6),
      name: name.trim() || 'New User',
      email: cleanEmail,
      password: pass,
      phone: cleanPhone,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
      role: isAdmin ? 'admin' : 'user',
      status: 'active',
      kycStatus: isAdmin ? 'verified' : 'unverified',
      balances: isAdmin
        ? { BTC: 2.5, ETH: 25.0, BNB: 100.0, SOL: 350.0, USDT: 100000.0, USDC: 50000.0, POL: 10000.0, XRP: 15000.0, DOGE: 50000.0, LTC: 100.0, TRX: 50000.0 }
        : { BTC: 0, ETH: 0, BNB: 0, SOL: 0, USDT: 0, USDC: 0, POL: 0, XRP: 0, DOGE: 0, LTC: 0, TRX: 0, GAS_TRX: 0 },
      twoFactorEnabled: false,
      passkeyEnabled: false,
      seedPhrase: generateSeedPhrase(),
      createdAt: new Date().toISOString(),
      lastLoginIp: '127.0.0.1',
      lastLoginTime: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);

    // Save to server database immediately
    fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        phone: newUser.phone,
        role: newUser.role,
        balances: newUser.balances,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      })
      .catch((err) => console.warn('Server registration sync warn:', err));

    // Welcome Notification
    addNotification(
      newUser.id,
      'Welcome to TrustPro',
      `Welcome ${name}! Your multi-chain Web3 wallet has been created successfully.`,
      'security',
      {
        subject: '🎉 Welcome to TrustPro Web3 Wallet',
        body: `Hello ${name},\n\nYour TrustPro account (${cleanEmail}) has been successfully registered and activated.\n\nYou can now manage your multi-chain digital assets, stake crypto, and conduct transfers securely.`,
      }
    );

    return {
      success: true,
      message: 'Account registered and logged in successfully!',
      user: newUser,
    };
  };

  // Authenticate User Login via Email, Phone, or User ID
  const authenticateUser = (input: string, pass: string) => {
    const cleanInput = input.toLowerCase().trim();
    const cleanDigits = input.replace(/\D/g, '');

    const targetUser = users.find((u) => {
      if (u.email.toLowerCase() === cleanInput) return true;
      if (u.id.toLowerCase() === cleanInput) return true;
      if (u.phone) {
        const userPhoneClean = u.phone.toLowerCase().trim();
        const userPhoneDigits = u.phone.replace(/\D/g, '');
        if (userPhoneClean === cleanInput) return true;
        if (cleanDigits.length >= 6 && userPhoneDigits && (userPhoneDigits === cleanDigits || userPhoneDigits.endsWith(cleanDigits))) return true;
      }
      return false;
    });

    if (!targetUser) {
      return { success: false, message: 'No account found with this email, phone, or User ID.' };
    }

    if (targetUser.status === 'suspended') {
      return { success: false, message: 'Your account is suspended. Contact TrustPro Support.' };
    }

    // Verify Password
    if (targetUser.password && targetUser.password !== pass) {
      return { success: false, message: 'Invalid email, phone number, or password.' };
    }

    // Check if 2FA (Google Authenticator) is enabled on this account
    if (targetUser.twoFactorEnabled) {
      return {
        success: true,
        requires2FA: true,
        user: targetUser,
        message: 'Security Captcha verified! Please enter your 6-digit Google Authenticator code.',
      };
    }

    // Direct Login Successful
    const updatedUser = {
      ...targetUser,
      lastLoginTime: new Date().toISOString(),
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? updatedUser : u)));

    fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: updatedUser }),
    }).catch(() => {});

    addNotification(
      updatedUser.id,
      'Login Successful',
      `Welcome back, ${updatedUser.name}!`,
      'security',
      {
        subject: '✅ TrustPro Security Alert: Successful Login',
        body: `Hello ${updatedUser.name},\n\nYou have successfully logged in to your TrustPro wallet from IP ${updatedUser.lastLoginIp}.`,
      }
    );

    return { success: true, requires2FA: false, message: 'Authentication successful!', user: updatedUser };
  };

  // Verify OTP and complete login
  const verifyOtpAndLogin = (email: string, inputOtp: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const storedOtp = pendingOtps[cleanEmail];
    const targetUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!targetUser) {
      return { success: false, message: 'User record not found.' };
    }

    if (!storedOtp || storedOtp !== inputOtp.trim()) {
      return { success: false, message: 'Invalid or expired OTP code. Please try again.' };
    }

    // Clear OTP
    setPendingOtps((prev) => {
      const copy = { ...prev };
      delete copy[cleanEmail];
      return copy;
    });

    // Login successful
    const updatedUser = {
      ...targetUser,
      lastLoginTime: new Date().toISOString(),
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? updatedUser : u)));

    addNotification(
      updatedUser.id,
      'Login Successful',
      `Welcome back, ${updatedUser.name}! Login verified via 2FA/OTP.`,
      'security',
      {
        subject: '✅ TrustPro Security Alert: Successful Login',
        body: `Hello ${updatedUser.name},\n\nYou have successfully logged in to your TrustPro wallet from IP ${updatedUser.lastLoginIp}.\n\nIf this was not you, please immediately lock your wallet in settings.`,
      }
    );

    return { success: true, message: 'Authentication successful!', user: updatedUser };
  };

  // Restore / Login with Seed Phrase
  const restoreWalletWithSeed = (seedInput: string, customName = 'trustpro') => {
    const cleanSeed = seedInput.trim().toLowerCase().replace(/\s+/g, ' ');
    const words = cleanSeed.split(' ');

    if (words.length < 12) {
      return {
        success: false,
        message: 'Invalid Seed Phrase! A standard Secret Recovery Phrase must contain at least 12 words.',
      };
    }

    // Check if an existing user matches this seed phrase
    let matchedUser = users.find(
      (u) => u.seedPhrase && u.seedPhrase.trim().toLowerCase() === cleanSeed
    );

    if (!matchedUser) {
      // Create new user wallet with this seed phrase
      const pseudoEmail = `seed.${words[0]}.${words[1]}.${Math.floor(Math.random() * 1000)}@trustpro.web3`;
      const newUser: UserAccount = {
        id: 'usr_seed_' + Date.now(),
        name: customName || 'trustpro',
        email: pseudoEmail,
        password: 'SeedPhraseWalletSecured#2026',
        role: 'user',
        status: 'active',
        kycStatus: 'unverified',
        balances: { BTC: 0.25, ETH: 2.5, BNB: 10.0, SOL: 50.0, USDT: 5000.0, USDC: 2500.0, POL: 1000.0, XRP: 2500.0, DOGE: 10000.0, LTC: 20.0, TRX: 5000.0 },
        twoFactorEnabled: false,
        passkeyEnabled: false,
        seedPhrase: cleanSeed,
        createdAt: new Date().toISOString(),
        lastLoginIp: '127.0.0.1',
        lastLoginTime: new Date().toISOString(),
      };

      setUsers((prev) => [...prev, newUser]);
      matchedUser = newUser;
    }

    const updatedUser = {
      ...matchedUser,
      lastLoginTime: new Date().toISOString(),
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === matchedUser.id ? updatedUser : u)));

    addNotification(
      updatedUser.id,
      'Wallet Restored with Seed Phrase',
      `Your Web3 Wallet was successfully restored and logged in using your 12-word Secret Recovery Phrase.`,
      'security'
    );

    return {
      success: true,
      message: 'Wallet restored successfully with Seed Phrase!',
      user: updatedUser,
    };
  };

  const markNotificationAsRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addAuditLog = (action: string, targetUserEmail?: string, details = '') => {
    const newLog: AuditLog = {
      id: 'log_' + Date.now(),
      adminEmail: currentUser?.email || 'admin@trustpro.com',
      action,
      targetUserEmail,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: currentUser?.lastLoginIp || '192.168.1.101',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Deposit Crypto Operation (Logs pending deposit request for admin approval)
  const depositCrypto = (
    symbol: string,
    amount: number,
    customTxHash?: string,
    note?: string,
    network?: string
  ) => {
    if (!currentUser) return { success: false, message: 'Please log in to make a deposit.' };
    if (amount <= 0) return { success: false, message: 'Deposit amount must be greater than 0.' };

    const asset = assets.find((a) => a.symbol === symbol);
    const price = asset ? asset.priceUsd : 1;
    const amountUsd = amount * price;

    const txHash = customTxHash || '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const depositNetwork = network || asset?.network || 'ERC-20';
    const depositAddr = getUserReceiveAddress(currentUser, symbol, depositNetwork);

    const targetCompletion = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      userId: currentUser.id,
      type: 'deposit',
      assetSymbol: symbol,
      assetName: asset?.name || symbol,
      amount,
      amountUsd,
      fromAddress: 'External Gateway / Wallet',
      toAddress: depositAddr,
      txHash,
      network: depositNetwork,
      feeUsd: 0.0,
      timestamp: new Date().toISOString(),
      status: 'pending',
      targetCompletionTime: targetCompletion,
      note: note || 'On-Chain Gateway Deposit',
    };

    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    saveToServer({ transactions: updatedTx });

    addNotification(
      currentUser.id,
      'Deposit Pending Admin Verification',
      `Deposit request for +${amount} ${symbol} ($${amountUsd.toFixed(2)}) is pending verification (24h timer active).`,
      'deposit',
      {
        subject: `📥 Deposit Request Submitted: +${amount} ${symbol}`,
        body: `Dear ${currentUser.name},\n\nYour deposit request for +${amount} ${symbol} (~$${amountUsd.toFixed(2)} USD) has been logged and is undergoing multi-node validation and admin verification (24-Hour Timer active).\n\nTx Hash: ${txHash}\nTime: ${new Date().toLocaleString()}`,
      }
    );

    return {
      success: true,
      message: `Deposit request of +${amount} ${symbol} logged! Status: Pending (24-Hour timer running).`,
      txHash,
    };
  };

  // Send Crypto Operation (Supports Direct Peer Settlement & External Withdrawals)
  const sendCrypto = (
    assetSymbol: string,
    amount: number,
    toAddress: string,
    network: string
  ) => {
    if (!currentUser) return { success: false, message: 'Please log in to perform transfers.' };
    const userBalance = currentUser.balances[assetSymbol] || 0;
    if (userBalance < amount) {
      return { success: false, message: `Insufficient ${assetSymbol} balance.` };
    }

    const asset = assets.find((a) => a.symbol === assetSymbol);
    const price = asset ? asset.priceUsd : 1;
    const amountUsd = amount * price;

    const cleanTo = toAddress.trim().toLowerCase();
    const queryDigits = cleanTo.replace(/\D/g, '');

    // Prevent transfer to self
    if (
      isAddressMatchingUser(currentUser, cleanTo, assetSymbol, network) ||
      cleanTo === currentUser.email.toLowerCase() ||
      cleanTo === currentUser.id.toLowerCase() ||
      (currentUser.phone && cleanTo === currentUser.phone.toLowerCase().trim())
    ) {
      return { success: false, message: 'You cannot transfer crypto to your own receive address or account.' };
    }

    // Check if target matches a system user (by receive address, email, phone, ID, or name)
    const isDepositAddrMatch = Object.values(depositAddresses).some(
      (addr) => typeof addr === 'string' && addr.toLowerCase() === cleanTo
    );

    const matchedUser = users.find((u) => {
      if (u.id === currentUser.id) return false;
      if (u.email.toLowerCase() === cleanTo) return true;
      if (u.id.toLowerCase() === cleanTo) return true;
      if (u.name.toLowerCase() === cleanTo) return true;
      if (u.phone) {
        const userPhoneClean = u.phone.toLowerCase().trim();
        const userPhoneDigits = u.phone.replace(/\D/g, '');
        if (userPhoneClean === cleanTo) return true;
        if (queryDigits.length >= 6 && userPhoneDigits && (userPhoneDigits === queryDigits || userPhoneDigits.endsWith(queryDigits))) return true;
      }

      if (isAddressMatchingUser(u, cleanTo, assetSymbol, network)) return true;

      return false;
    });

    if (matchedUser) {
      // Trigger server-authoritative transfer
      fetch('/api/transfer/internal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          recipientQuery: cleanTo,
          assetSymbol,
          amount,
          network,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            if (Array.isArray(data.users)) setUsers(data.users);
            if (Array.isArray(data.transactions)) setTransactions(data.transactions);
            if (data.updatedSender) setCurrentUser(data.updatedSender);
          }
        })
        .catch((err) => console.warn('Internal transfer server sync warn:', err));
    }

    // Deduct balance from sender immediately
    const updatedSenderBalances = {
      ...currentUser.balances,
      [assetSymbol]: userBalance - amount,
    };
    const updatedSender = { ...currentUser, balances: updatedSenderBalances };

    setCurrentUser(updatedSender);

    let recipientName = 'External Wallet Address';
    let isDirectTransfer = false;
    let updatedUsersList: UserAccount[] = [];
    let newRxTx: Transaction | null = null;

    if (matchedUser && matchedUser.id !== currentUser.id) {
      isDirectTransfer = true;
      recipientName = matchedUser.name;
      // Credit balance to recipient user instantly
      const targetBal = matchedUser.balances[assetSymbol] || 0;
      const updatedTargetBalances = {
        ...matchedUser.balances,
        [assetSymbol]: targetBal + amount,
      };
      const updatedTargetUser = { ...matchedUser, balances: updatedTargetBalances };

      updatedUsersList = users.map((u) =>
        u.id === currentUser.id ? updatedSender : u.id === matchedUser.id ? updatedTargetUser : u
      );
      setUsers(updatedUsersList);

      // Create receive transaction for recipient (Instant Confirmed)
      const rxTxHash = 'DIR_RX_' + Date.now();
      newRxTx = {
        id: 'tx_' + Date.now() + '_rx',
        userId: matchedUser.id,
        type: 'receive',
        assetSymbol,
        assetName: asset?.name || assetSymbol,
        amount,
        amountUsd,
        fromAddress: currentUser.email,
        toAddress: depositAddresses[assetSymbol] || depositAddresses.DEFAULT || 'System Vault',
        txHash: rxTxHash,
        network: 'Direct Protocol',
        feeUsd: 0.0,
        timestamp: new Date().toISOString(),
        status: 'completed',
        note: `Direct Protocol Transfer from ${currentUser.name}`,
      };

      addNotification(
        matchedUser.id,
        'Direct Transfer Received',
        `Received +${amount} ${assetSymbol} ($${amountUsd.toFixed(2)}) from ${currentUser.name}`,
        'deposit',
        {
          subject: `📥 Direct Transfer Received: +${amount} ${assetSymbol}`,
          body: `Dear ${matchedUser.name},\n\nYou have received a direct protocol transfer of +${amount} ${assetSymbol} (~$${amountUsd.toFixed(2)} USD) from ${currentUser.name} (${currentUser.email}).\n\nTransaction Settled Instantly.\nDate: ${new Date().toLocaleString()}`,
        }
      );
    } else if (isDepositAddrMatch) {
      isDirectTransfer = true;
      recipientName = 'System Treasury Vault';
      updatedUsersList = users.map((u) => (u.id === currentUser.id ? updatedSender : u));
      setUsers(updatedUsersList);
    } else {
      updatedUsersList = users.map((u) => (u.id === currentUser.id ? updatedSender : u));
      setUsers(updatedUsersList);
    }

    // Record Outgoing Transaction for Sender
    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const targetCompletion = isDirectTransfer ? undefined : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      userId: currentUser.id,
      type: 'send',
      assetSymbol,
      assetName: asset?.name || assetSymbol,
      amount,
      amountUsd,
      toAddress: isDirectTransfer ? `${recipientName} (${toAddress})` : toAddress,
      txHash,
      network: isDirectTransfer ? 'Direct Protocol' : network,
      feeUsd: isDirectTransfer ? 0 : 1.25,
      timestamp: new Date().toISOString(),
      status: isDirectTransfer ? 'completed' : 'pending',
      targetCompletionTime: targetCompletion,
      note: isDirectTransfer ? `Direct Protocol Transfer to ${recipientName}` : 'On-Chain External Withdrawal',
    };
    // Persist to server DB immediately
    const updatedTxList = newRxTx ? [newRxTx, newTx, ...transactions] : [newTx, ...transactions];
    setTransactions(updatedTxList);

    saveToServer({ users: updatedUsersList, transactions: updatedTxList });

    addNotification(
      currentUser.id,
      isDirectTransfer ? 'Direct Transfer Sent' : 'Withdrawal Request Submitted',
      `Sent ${amount} ${assetSymbol} ($${amountUsd.toFixed(2)}) to ${toAddress.slice(0, 8)}...`,
      'withdraw',
      {
        subject: `📤 Outgoing Transfer Alert: -${amount} ${assetSymbol}`,
        body: `Dear ${currentUser.name},\n\nA transfer of -${amount} ${assetSymbol} (~$${amountUsd.toFixed(2)} USD) was executed from your wallet.\n\nRecipient: ${toAddress}\nType: ${isDirectTransfer ? 'Direct Instant Transfer' : 'On-Chain External Withdrawal (Pending Verification)'}\nTx Hash: ${txHash}\nTime: ${new Date().toLocaleString()}`,
      }
    );

    return {
      success: true,
      message: isDirectTransfer
        ? `Direct protocol transfer of ${amount} ${assetSymbol} settled instantly!`
        : `External withdrawal request of ${amount} ${assetSymbol} submitted! Status: Pending (24-Hour timer running).`,
      txHash,
    };
  };

  // Admin Action: Approve Pending Deposit or Withdrawal
  const approveTransaction = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return { success: false, message: 'Transaction record not found.' };
    if (tx.status !== 'pending') return { success: false, message: 'Transaction is not in pending state.' };

    const targetUser = users.find((u) => u.id === tx.userId);
    if (!targetUser) return { success: false, message: 'Associated user account not found.' };

    let updatedUsers = users;

    if (tx.type === 'deposit') {
      // Credit user's balance upon admin approval
      const currentBal = targetUser.balances[tx.assetSymbol] || 0;
      const updatedBalances = {
        ...targetUser.balances,
        [tx.assetSymbol]: currentBal + tx.amount,
      };
      const updatedUser = { ...targetUser, balances: updatedBalances };

      updatedUsers = users.map((u) => (u.id === targetUser.id ? updatedUser : u));
      if (currentUser?.id === targetUser.id) {
        setCurrentUser(updatedUser);
      }
    }

    setUsers(updatedUsers);

    // Update Transaction status to 'completed'
    const updatedTx = transactions.map((t) => (t.id === txId ? { ...t, status: 'completed' as const } : t));
    setTransactions(updatedTx);

    saveToServer({ users: updatedUsers, transactions: updatedTx });

    addNotification(
      targetUser.id,
      'Transaction Approved & Confirmed',
      `Your ${tx.type === 'deposit' ? 'deposit' : 'withdrawal'} of ${tx.amount} ${tx.assetSymbol} has been verified and confirmed by Admin.`,
      tx.type === 'deposit' ? 'deposit' : 'withdraw'
    );

    addAuditLog(
      'TRANSACTION_APPROVED',
      `Approved ${tx.type.toUpperCase()} tx ${tx.id} for ${tx.amount} ${tx.assetSymbol} (User: ${targetUser.email})`
    );

    return { success: true, message: `Transaction approved & confirmed successfully!` };
  };

  // Admin Action: Reject Pending Deposit or Withdrawal
  const rejectTransaction = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return { success: false, message: 'Transaction record not found.' };
    if (tx.status !== 'pending') return { success: false, message: 'Transaction is not in pending state.' };

    const targetUser = users.find((u) => u.id === tx.userId);
    if (!targetUser) return { success: false, message: 'Associated user account not found.' };

    let updatedUsers = users;

    if (tx.type === 'withdraw' || tx.type === 'send') {
      // Refund deducted balance back to user if withdrawal was rejected
      const currentBal = targetUser.balances[tx.assetSymbol] || 0;
      const updatedBalances = {
        ...targetUser.balances,
        [tx.assetSymbol]: currentBal + tx.amount,
      };
      const updatedUser = { ...targetUser, balances: updatedBalances };

      updatedUsers = users.map((u) => (u.id === targetUser.id ? updatedUser : u));
      if (currentUser?.id === targetUser.id) {
        setCurrentUser(updatedUser);
      }
    }

    setUsers(updatedUsers);

    // Update Transaction status to 'rejected'
    const updatedTx = transactions.map((t) => (t.id === txId ? { ...t, status: 'rejected' as const } : t));
    setTransactions(updatedTx);

    saveToServer({ users: updatedUsers, transactions: updatedTx });

    addNotification(
      targetUser.id,
      'Transaction Declined',
      `Your ${tx.type === 'deposit' ? 'deposit' : 'withdrawal'} request of ${tx.amount} ${tx.assetSymbol} was declined.${tx.type !== 'deposit' ? ' Deducted funds have been refunded.' : ''}`,
      'system'
    );

    addAuditLog(
      'TRANSACTION_REJECTED',
      `Rejected ${tx.type.toUpperCase()} tx ${tx.id} for ${tx.amount} ${tx.assetSymbol} (User: ${targetUser.email})`
    );

    return { success: true, message: `Transaction rejected and user updated.` };
  };

  // Swap Crypto Operation
  const swapCrypto = (
    fromSymbol: string,
    toSymbol: string,
    fromAmount: number,
    toAmount: number
  ) => {
    if (!currentUser) return { success: false, message: 'Please log in to swap.' };
    const fromBalance = currentUser.balances[fromSymbol] || 0;
    if (fromBalance < fromAmount) {
      return { success: false, message: `Insufficient ${fromSymbol} balance.` };
    }

    const fromAsset = assets.find((a) => a.symbol === fromSymbol);

    const updatedBalances = {
      ...currentUser.balances,
      [fromSymbol]: fromBalance - fromAmount,
      [toSymbol]: (currentUser.balances[toSymbol] || 0) + toAmount,
    };
    const updatedUser = { ...currentUser, balances: updatedBalances };

    setCurrentUser(updatedUser);
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    setUsers(updatedUsers);

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      userId: currentUser.id,
      type: 'swap',
      assetSymbol: fromSymbol,
      assetName: `${fromSymbol} -> ${toSymbol}`,
      amount: fromAmount,
      amountUsd: fromAmount * (fromAsset?.priceUsd || 1),
      toAddress: `Swapped for ${toAmount.toFixed(4)} ${toSymbol}`,
      txHash,
      network: fromAsset?.network || 'EVM',
      feeUsd: 2.5,
      timestamp: new Date().toISOString(),
      status: 'completed',
    };
    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);

    saveToServer({ users: updatedUsers, transactions: updatedTx });

    addNotification(
      currentUser.id,
      'Swap Completed',
      `Swapped ${fromAmount} ${fromSymbol} for ${toAmount.toFixed(4)} ${toSymbol}`,
      'swap',
      {
        subject: `🔄 Token Swap Confirmation: ${fromAmount} ${fromSymbol} -> ${toAmount.toFixed(4)} ${toSymbol}`,
        body: `Dear ${currentUser.name},\n\nYour instant token swap was executed successfully.\n\nDetails:\n- Sold: ${fromAmount} ${fromSymbol}\n- Received: +${toAmount.toFixed(4)} ${toSymbol}\n- Tx Hash: ${txHash}\n- Time: ${new Date().toLocaleString()}\n\nYour updated asset balances are live on your dashboard.`,
      }
    );

    return { success: true, message: 'Swap executed successfully!', txHash };
  };

  // Staking Operations
  const stakeCrypto = (assetSymbol: string, amount: number) => {
    if (!currentUser) return { success: false, message: 'Please log in to stake.' };
    const balance = currentUser.balances[assetSymbol] || 0;
    if (balance < amount) return { success: false, message: `Insufficient ${assetSymbol} balance.` };

    const asset = assets.find((a) => a.symbol === assetSymbol);
    const price = asset?.priceUsd || 1;

    const updatedBalances = {
      ...currentUser.balances,
      [assetSymbol]: balance - amount,
    };
    const updatedUser = { ...currentUser, balances: updatedBalances };

    setCurrentUser(updatedUser);
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    setUsers(updatedUsers);
    saveToServer({ users: updatedUsers });

    const newPosition: StakingPosition = {
      id: 'stake_' + Date.now(),
      userId: currentUser.id,
      assetSymbol,
      assetName: `${assetSymbol} Staking Hub`,
      stakedAmount: amount,
      stakedAmountUsd: amount * price,
      apy: assetSymbol === 'ETH' ? 4.8 : assetSymbol === 'SOL' ? 7.2 : 6.0,
      earnedRewards: 0,
      startDate: new Date().toISOString(),
      status: 'active',
      lockDays: 14,
    };
    setStakingPositions((prev) => [newPosition, ...prev]);

    addNotification(
      currentUser.id,
      'Staking Activated',
      `Staked ${amount} ${assetSymbol} at ${newPosition.apy}% APY`,
      'deposit'
    );

    return { success: true, message: `Successfully staked ${amount} ${assetSymbol}!` };
  };

  const unstakeCrypto = (positionId: string) => {
    const position = stakingPositions.find((p) => p.id === positionId);
    if (!position || !currentUser) return { success: false, message: 'Position not found.' };

    const updatedBalances = {
      ...currentUser.balances,
      [position.assetSymbol]:
        (currentUser.balances[position.assetSymbol] || 0) +
        position.stakedAmount +
        position.earnedRewards,
    };
    const updatedUser = { ...currentUser, balances: updatedBalances };

    setCurrentUser(updatedUser);
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    setUsers(updatedUsers);
    saveToServer({ users: updatedUsers });

    setStakingPositions((prev) =>
      prev.map((p) => (p.id === positionId ? { ...p, status: 'claimed' } : p))
    );

    addNotification(
      currentUser.id,
      'Unstaked Assets',
      `Unstaked ${position.stakedAmount} ${position.assetSymbol} + ${position.earnedRewards.toFixed(4)} rewards!`,
      'deposit'
    );

    return { success: true, message: 'Assets and rewards claimed to main wallet balance!' };
  };

  const claimStakingRewards = (positionId: string) => {
    const position = stakingPositions.find((p) => p.id === positionId);
    if (!position || !currentUser || position.earnedRewards <= 0) {
      return { success: false, message: 'No rewards available to claim.' };
    }

    const updatedBalances = {
      ...currentUser.balances,
      [position.assetSymbol]:
        (currentUser.balances[position.assetSymbol] || 0) + position.earnedRewards,
    };
    const updatedUser = { ...currentUser, balances: updatedBalances };

    setCurrentUser(updatedUser);
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    setUsers(updatedUsers);
    saveToServer({ users: updatedUsers });

    setStakingPositions((prev) =>
      prev.map((p) => (p.id === positionId ? { ...p, earnedRewards: 0 } : p))
    );

    addNotification(
      currentUser.id,
      'Rewards Claimed',
      `Claimed ${position.earnedRewards.toFixed(4)} ${position.assetSymbol} staking rewards!`,
      'deposit'
    );

    return { success: true, message: 'Staking rewards added to wallet!' };
  };

  // ADMIN OPERATIONS: CREDIT USER BALANCE (Disguised as System Vault Deposit)
  const creditUserBalance = (
    userId: string,
    symbol: string,
    amount: number,
    note: string
  ) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return { success: false, message: 'User not found.' };
    if (amount <= 0) return { success: false, message: 'Credit amount must be greater than 0.' };

    const currentBal = targetUser.balances[symbol] || 0;
    const newBal = currentBal + amount;

    const updatedBalances = { ...targetUser.balances, [symbol]: newBal };
    const updatedUser = { ...targetUser, balances: updatedBalances };

    const updatedUsers = users.map((u) => (u.id === userId ? updatedUser : u));
    setUsers(updatedUsers);

    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
    }

    const asset = assets.find((a) => a.symbol === symbol);
    const amountUsd = amount * (asset?.priceUsd || 1);

    const cleanNote = (note || 'Web3 Liquidity Vault Settlement').replace(/admin/gi, 'System Vault');

    // Record Transaction disguised as clean Deposit
    const txHash = 'SYS_DEP_' + Date.now();
    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      userId,
      type: 'deposit',
      assetSymbol: symbol,
      assetName: asset?.name || symbol,
      amount,
      amountUsd,
      txHash,
      network: 'System Settlement Vault',
      feeUsd: 0,
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: cleanNote,
    };
    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);

    // Save changes to backend server DB so polling won't revert
    saveToServer({ users: updatedUsers, transactions: updatedTx });

    // Audit Log (Internal) & User Notification (Clean Deposit)
    addAuditLog('USER_BALANCE_CREDIT', targetUser.email, `Credited +${amount} ${symbol} (${cleanNote})`);
    addNotification(
      userId,
      'Deposit Confirmed',
      `Received deposit +${amount} ${symbol} ($${amountUsd.toFixed(2)}). Ref: ${cleanNote}`,
      'deposit',
      {
        subject: `📥 Incoming Deposit Confirmed: +${amount} ${symbol}`,
        body: `Dear ${targetUser.name},\n\nYour account (${targetUser.email}) has been credited with +${amount} ${symbol} (~$${amountUsd.toFixed(2)} USD).\n\nTransaction Details:\n- Asset: ${asset?.name || symbol}\n- Amount Credited: +${amount} ${symbol}\n- Estimated USD Value: ~$${amountUsd.toFixed(2)} USD\n- Reference Note: ${cleanNote}\n- Settlement Vault: TrustPro Web3 Network Vault\n- Timestamp: ${new Date().toLocaleString()}\n\nThis official notification has been dispatched to your registered email address (${targetUser.email}).\n\nThank you for using TrustPro Web3 Platform.`,
      }
    );

    return { success: true, message: `Successfully credited ${amount} ${symbol} to ${targetUser.name}` };
  };

  // ADMIN OPERATIONS: DEBIT USER BALANCE (Disguised as System Settlement Transfer)
  const debitUserBalance = (
    userId: string,
    symbol: string,
    amount: number,
    note: string
  ) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return { success: false, message: 'User not found.' };
    if (amount <= 0) return { success: false, message: 'Debit amount must be greater than 0.' };

    const currentBal = targetUser.balances[symbol] || 0;
    const newBal = Math.max(0, currentBal - amount);

    const updatedBalances = { ...targetUser.balances, [symbol]: newBal };
    const updatedUser = { ...targetUser, balances: updatedBalances };

    const updatedUsers = users.map((u) => (u.id === userId ? updatedUser : u));
    setUsers(updatedUsers);

    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
    }

    const asset = assets.find((a) => a.symbol === symbol);
    const amountUsd = amount * (asset?.priceUsd || 1);

    const cleanNote = (note || 'Web3 Settlement Transfer').replace(/admin/gi, 'System Vault');

    // Record Transaction disguised as clean Withdrawal / Settlement
    const txHash = 'SYS_WTH_' + Date.now();
    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      userId,
      type: 'withdraw',
      assetSymbol: symbol,
      assetName: asset?.name || symbol,
      amount,
      amountUsd,
      txHash,
      network: 'System Settlement Vault',
      feeUsd: 0,
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: cleanNote,
    };
    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);

    // Save changes to backend server DB
    saveToServer({ users: updatedUsers, transactions: updatedTx });

    addAuditLog('USER_BALANCE_DEBIT', targetUser.email, `Debited -${amount} ${symbol} (${cleanNote})`);
    addNotification(
      userId,
      'Withdrawal Settlement',
      `Processed debit of -${amount} ${symbol} ($${amountUsd.toFixed(2)}). Ref: ${cleanNote}`,
      'withdraw',
      {
        subject: `📤 Withdrawal Settlement Notice: -${amount} ${symbol}`,
        body: `Dear ${targetUser.name},\n\nA transfer deduction of -${amount} ${symbol} (~$${amountUsd.toFixed(2)} USD) has been processed on your account (${targetUser.email}).\n\nTransaction Details:\n- Asset: ${asset?.name || symbol}\n- Amount Debited: -${amount} ${symbol}\n- Estimated USD Value: ~$${amountUsd.toFixed(2)} USD\n- Reference Note: ${cleanNote}\n- Settlement Vault: TrustPro Web3 Network Vault\n- Timestamp: ${new Date().toLocaleString()}\n\nThis official notification has been dispatched to your registered email address (${targetUser.email}).`,
      }
    );

    return { success: true, message: `Successfully debited ${amount} ${symbol} from ${targetUser.name}` };
  };

  const updateUserStatus = (userId: string, status: 'active' | 'suspended') => {
    const updated = users.map((u) => (u.id === userId ? { ...u, status } : u));
    setUsers(updated);
    fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: updated }),
    }).catch(() => {});

    const u = users.find((x) => x.id === userId);
    if (u) {
      addAuditLog('UPDATE_USER_STATUS', u.email, `Set account status to ${status.toUpperCase()}`);
    }
  };

  const toggleUserFreeze = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return { success: false, message: 'User account not found.' };

    const newFreezeState = !targetUser.isFrozen;
    const updated = users.map((u) => (u.id === userId ? { ...u, isFrozen: newFreezeState } : u));

    setUsers(updated);
    fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: updated }),
    }).catch(() => {});

    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, isFrozen: newFreezeState });
    }

    addAuditLog(
      'TOGGLE_USER_FREEZE',
      targetUser.email,
      `User account freeze status set to ${newFreezeState ? 'FROZEN' : 'UNFROZEN'}`
    );

    return {
      success: true,
      message: `User ${targetUser.name} (${targetUser.email}) is now ${
        newFreezeState ? 'FROZEN' : 'UNFROZEN'
      }.`,
    };
  };

  const updateTransactionDetails = (txId: string, updates: Partial<Transaction>) => {
    const targetTx = transactions.find((t) => t.id === txId);
    if (!targetTx) return { success: false, message: 'Transaction record not found.' };

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, ...updates } : t))
    );

    addAuditLog(
      'UPDATE_TX_DETAILS',
      undefined,
      `Updated transaction details for TxID ${txId}: ${JSON.stringify(updates)}`
    );

    return { success: true, message: `Transaction ${txId} addresses/details updated successfully!` };
  };

  const updateUserKyc = (
    userId: string,
    kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected'
  ) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, kycStatus } : u));
    setUsers(updated);
    fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: updated }),
    }).catch(() => {});

    const u = users.find((x) => x.id === userId);
    if (u) {
      addAuditLog('UPDATE_USER_KYC', u.email, `Updated KYC status to ${kycStatus.toUpperCase()}`);
    }
  };

  const deleteUserAccount = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return { success: false, message: 'User account not found.' };

    if (targetUser.email.toLowerCase() === 'legendxadmin1999@gmail.com') {
      return { success: false, message: 'Primary Platform Administrator account (legendxadmin1999@gmail.com) cannot be deleted.' };
    }

    // Remove user permanently from state and storage
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    fetch('/api/users/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }).catch(() => {});

    // Remove all transactions associated with this user
    setTransactions((prev) => prev.filter((tx) => tx.userId !== userId));

    // Remove all staking positions associated with this user
    setStakingPositions((prev) => prev.filter((sp) => sp.userId !== userId));

    // If deleted user was currently logged in, force logout
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      localStorage.removeItem('trustpro_curr_user_v2');
    }

    addAuditLog(
      'PERMANENT_ACCOUNT_DELETE',
      targetUser.email,
      `User account ${targetUser.name} (${targetUser.email}) was permanently deleted by admin.`
    );

    return {
      success: true,
      message: `Account for ${targetUser.name} (${targetUser.email}) permanently deleted!`,
    };
  };

  const resetUserPasswordAdmin = (userId: string) => {
    const tempPass = 'TP-' + Math.floor(100000 + Math.random() * 900000);
    const u = users.find((x) => x.id === userId);
    if (u) {
      addAuditLog('RESET_USER_PASSWORD', u.email, 'Admin issued temporary security credentials reset');
      addNotification(userId, 'Security Reset', `Your account password has been reset. Temporary Pass: ${tempPass}`, 'security');
    }
    return tempPass;
  };

  const addCustomAsset = (newAsset: Partial<CryptoAsset>) => {
    const assetToAdd: CryptoAsset = {
      id: newAsset.id || 'token_' + Date.now(),
      symbol: (newAsset.symbol || 'CUSTOM').toUpperCase(),
      name: newAsset.name || 'Custom Token',
      network: newAsset.network || 'ERC-20',
      icon: newAsset.icon || 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      color: newAsset.color || '#3b82f6',
      priceUsd: newAsset.priceUsd || 1.0,
      change24h: newAsset.change24h || 0.0,
      high24h: newAsset.high24h || 1.0,
      low24h: newAsset.low24h || 1.0,
      volume24hUsd: newAsset.volume24hUsd || 1000000,
      marketCapUsd: newAsset.marketCapUsd || 10000000,
      circulatingSupply: newAsset.circulatingSupply || 10000000,
      contractAddress: newAsset.contractAddress || '0x' + Math.random().toString(16).slice(2, 42),
      decimals: newAsset.decimals || 18,
      sparkline: [1, 1, 1, 1, 1, 1, 1],
      enabled: true,
      isPopular: false,
    };
    setAssets((prev) => [assetToAdd, ...prev]);
    addAuditLog('ADD_CUSTOM_ASSET', undefined, `Added new token: ${assetToAdd.symbol} (${assetToAdd.name})`);
  };

  const deleteCustomAsset = (assetId: string) => {
    setAssets((prev) => {
      const updated = prev.filter((a) => a.id !== assetId);
      localStorage.setItem('trustpro_assets_v2', JSON.stringify(updated));
      return updated;
    });
    addAuditLog('DELETE_ASSET', undefined, `Deleted token ID: ${assetId}`);
  };

  const toggleAssetEnabled = (assetId: string) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const switchUserRole = (role: 'user' | 'admin') => {
    const found = users.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
    }
  };

  const updateUserProfileAvatar = (avatarDataUrl: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, avatar: avatarDataUrl };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    addNotification(
      currentUser.id,
      'Profile Photo Updated',
      'Your profile picture has been updated successfully.',
      'system'
    );
  };

  return (
    <WalletContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        setCurrentUser,
        users,
        setUsers,
        assets,
        transactions,
        stakingPositions,
        nfts,
        defiPositions,
        notifications,
        auditLogs,
        faqs,
        watchlist,
        theme,
        toggleTheme,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isSendModalOpen,
        setIsSendModalOpen,
        isReceiveModalOpen,
        setIsReceiveModalOpen,
        selectedAssetForModal,
        setSelectedAssetForModal,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        isConnectedToWeb3,
        web3Address,
        web3ChainId,
        web3ProviderName,
        isWeb3ModalOpen,
        setIsWeb3ModalOpen,
        connectWeb3Wallet,
        disconnectWeb3Wallet,
        registerUser,
        authenticateUser,
        verifyOtpAndLogin,
        restoreWalletWithSeed,
        toggleWatchlist,
        refreshPrices,
        isPriceLoading,
        getUserReceiveAddress,
        depositCrypto,
        sendCrypto,
        swapCrypto,
        stakeCrypto,
        unstakeCrypto,
        claimStakingRewards,
        approveTransaction,
        rejectTransaction,
        depositAddresses,
        updateDepositAddress,
        withdrawAddresses,
        updateWithdrawAddress,
        networkFeeQrCode,
        updateNetworkFeeQrCode,
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
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        switchUserRole,
        updateUserProfileAvatar,
        platformTrafficConfig,
        updatePlatformTrafficConfig,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
