export type Role = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  network: string;
  icon: string;
  color: string;
  priceUsd: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24hUsd: number;
  marketCapUsd: number;
  circulatingSupply: number;
  contractAddress?: string;
  decimals: number;
  sparkline: number[];
  enabled: boolean;
  isPopular?: boolean;
}

export interface UserBalance {
  symbol: string;
  amount: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  role: Role;
  status: UserStatus;
  isFrozen?: boolean;
  kycStatus: KycStatus;
  balances: Record<string, number>; // symbol -> amount
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  passkeyEnabled: boolean;
  passkeyRegisteredAt?: string;
  passkeyDeviceName?: string;
  seedPhrase?: string;
  customCoinAddresses?: Record<string, string>; // Admin custom overridden deposit/receive addresses per coin/network
  createdAt: string;
  lastLoginIp: string;
  lastLoginTime: string;
}

export interface PlatformTrafficConfig {
  activeUsers: number;
  liveTraders: number;
  onlineNodes: number;
  systemStatus: 'OPERATIONAL' | 'HIGH_VOLUME' | 'SURGE' | 'MAINTENANCE';
  tickerNotice?: string;
  autoFluctuate: boolean;
}

export type TransactionType =
  | 'send'
  | 'receive'
  | 'deposit'
  | 'withdraw'
  | 'swap'
  | 'stake'
  | 'unstake'
  | 'admin_credit'
  | 'admin_debit';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  assetSymbol: string;
  assetName: string;
  amount: number;
  amountUsd: number;
  toAddress?: string;
  fromAddress?: string;
  txHash: string;
  network: string;
  feeUsd: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'rejected' | 'failed';
  targetCompletionTime?: string;
  note?: string;
}

export interface StakingPosition {
  id: string;
  userId: string;
  assetSymbol: string;
  assetName: string;
  stakedAmount: number;
  stakedAmountUsd: number;
  apy: number;
  earnedRewards: number;
  startDate: string;
  status: 'active' | 'unstaking' | 'claimed';
  lockDays: number;
}

export interface NFTItem {
  id: string;
  name: string;
  collection: string;
  image: string;
  floorPriceEth: number;
  floorPriceUsd: number;
  rarityRank: number;
  tokenId: string;
  network: string;
  owner: string;
  traits: Array<{ trait_type: string; value: string }>;
}

export interface DeFiPosition {
  id: string;
  userId: string;
  protocol: string;
  protocolLogo: string;
  pool: string;
  network: string;
  suppliedAsset: string;
  suppliedAmount: number;
  tvlUsd: number;
  userLiquidityUsd: number;
  apy: number;
  dailyEarningsUsd: number;
  startDate: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'deposit' | 'withdraw' | 'swap' | 'price' | 'security' | 'system';
  timestamp: string;
  read: boolean;
  emailSubject?: string;
  emailBody?: string;
  recipientEmail?: string;
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  time: string;
  category: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

export interface RoadmapItem {
  quarter: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  features: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'wallet' | 'security' | 'swap' | 'staking' | 'admin';
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  targetUserEmail?: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}
