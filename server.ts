import express from 'express';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';

// In-memory verification link token store
const verificationLinkStore = new Map<
  string,
  { token: string; email: string; name: string; type: string; expiresAt: number }
>();

// Configure Nodemailer transporter with trustpro.web3@gmail.com App Password
const smtpUser = process.env.SMTP_USER || 'trustpro.web3@gmail.com';
const smtpPass = (process.env.SMTP_PASS || 'aqwxlfhzpcrizpog').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
});

// Verify SMTP Connection on Startup
transporter.verify((error) => {
  if (error) {
    console.error('[SMTP VERIFICATION ERROR]', error);
  } else {
    console.log('[SMTP SERVER READY] Connected to Gmail SMTP as', smtpUser);
  }
});

// Server File Database Persistence Configuration
const DB_FILE = path.join(process.cwd(), 'db_storage.json');

const defaultUsers = [
  {
    id: 'usr_admin',
    name: 'Platform Super Admin',
    email: 'legendxadmin1999@gmail.com',
    password: 'Joshi$12legend',
    phone: '+91 9876543210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    role: 'admin',
    status: 'active',
    kycStatus: 'verified',
    balances: {
      BTC: 2.5,
      ETH: 25.0,
      BNB: 100.0,
      SOL: 350.0,
      USDT: 100000.0,
      USDC: 50000.0,
      POL: 10000.0,
      XRP: 15000.0,
      DOGE: 50000.0,
      LTC: 100.0,
      TRX: 50000.0,
    },
    twoFactorEnabled: false,
    passkeyEnabled: false,
    createdAt: '2025-01-10T10:00:00Z',
    lastLoginIp: '192.168.1.101',
    lastLoginTime: new Date().toISOString(),
  },
];

const defaultDepositAddresses = {
  DEFAULT: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  ETH: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  BNB: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  SOL: '7v9W1nvm23284910294192401928401928401928',
  USDT: 'TB7zZxcAr6NKR6nF231t2ZWYPTu1TUrDE6',
  USDC: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  POL: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  XRP: 'rEb8TK3gBg1xnvdbK84p2iB3e2z',
  DOGE: 'D9zX8127391273912739127',
  LTC: 'L12398127391273912739127',
  TRX: 'TB7zZxcAr6NKR6nF231t2ZWYPTu1TUrDE6',
  GAS_TRX: 'TB7zZxcAr6NKR6nF231t2ZWYPTu1TUrDE6',
};

const defaultWithdrawAddresses = {
  BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  ETH: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  BNB: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  SOL: '7v9W1nvm23284910294192401928401928401928',
  USDT: 'TB7zZxcAr6NKR6nF231t2ZWYPTu1TUrDE6',
  USDC: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  POL: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  XRP: 'rEb8TK3gBg1xnvdbK84p2iB3e2z',
  DOGE: 'D9zX8127391273912739127',
  LTC: 'L12398127391273912739127',
  TRX: 'TB7zZxcAr6NKR6nF231t2ZWYPTu1TUrDE6',
};

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (!Array.isArray(data.users) || data.users.length === 0) {
        data.users = defaultUsers;
      } else {
        const hasAdmin = data.users.some(
          (u: any) => u.email && u.email.toLowerCase() === 'legendxadmin1999@gmail.com'
        );
        if (!hasAdmin) {
          data.users.unshift(defaultUsers[0]);
        }
      }
      if (!Array.isArray(data.transactions)) data.transactions = [];
      if (!data.depositAddresses) data.depositAddresses = defaultDepositAddresses;
      if (!data.withdrawAddresses) data.withdrawAddresses = defaultWithdrawAddresses;
      if (!data.networkFeeQrCode) data.networkFeeQrCode = '';
      if (!Array.isArray(data.notifications)) data.notifications = [];
      if (!Array.isArray(data.auditLogs)) data.auditLogs = [];
      return data;
    }
  } catch (e) {
    console.warn('[DB LOAD WARN]', e);
  }
  const initDb = {
    users: defaultUsers,
    transactions: [],
    depositAddresses: defaultDepositAddresses,
    withdrawAddresses: defaultWithdrawAddresses,
    networkFeeQrCode: '',
    notifications: [],
    auditLogs: [],
  };
  saveDb(initDb);
  return initDb;
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[DB SAVE ERROR]', e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'TrustPro Web Crypto Wallet', time: new Date().toISOString() });
  });

  // REAL-TIME DATABASE SYNC ENDPOINT
  app.get('/api/sync', (_req, res) => {
    const db = loadDb();
    res.json({ success: true, ...db });
  });

  app.post('/api/sync', (req, res) => {
    const { users, transactions, depositAddresses, withdrawAddresses, networkFeeQrCode, notifications, auditLogs } = req.body;
    const db = loadDb();
    if (Array.isArray(users) && users.length > 0) {
      db.users = users;
    }
    if (Array.isArray(transactions)) db.transactions = transactions;
    if (depositAddresses) db.depositAddresses = depositAddresses;
    if (withdrawAddresses) db.withdrawAddresses = withdrawAddresses;
    if (typeof networkFeeQrCode === 'string') db.networkFeeQrCode = networkFeeQrCode;
    if (Array.isArray(notifications)) db.notifications = notifications;
    if (Array.isArray(auditLogs)) db.auditLogs = auditLogs;
    saveDb(db);
    res.json({ success: true, ...db });
  });

  // USER REGISTRATION ENDPOINT (SAVED PERMANENTLY TO SERVER DB)
  app.post('/api/users/register', (req, res) => {
    const { name, email, password, phone, role, balances } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Email or phone number is required.' });
    }

    const db = loadDb();
    const cleanEmail = (email || `${phone.trim()}@phone.trustpro.io`).trim().toLowerCase();
    const cleanPhone = (phone || '').trim();

    // Check if user already exists
    const existing = db.users.find((u: any) => {
      if (u.email.toLowerCase() === cleanEmail) return true;
      if (cleanPhone && u.phone && u.phone.trim().replace(/\s+/g, '') === cleanPhone.replace(/\s+/g, '')) return true;
      return false;
    });

    if (existing) {
      return res.json({
        success: true,
        message: 'Account already registered.',
        user: existing,
        users: db.users,
      });
    }

    const isAdmin = cleanEmail === 'legendxadmin1999@gmail.com' && password === 'Joshi$12legend';

    const newUser = {
      id: 'usr_' + Date.now() + Math.random().toString(36).substring(2, 6),
      name: name || 'New User',
      email: cleanEmail,
      password: password || 'TrustProUserKey#2026',
      phone: cleanPhone,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
      role: isAdmin ? 'admin' : (role || 'user'),
      status: 'active',
      kycStatus: isAdmin ? 'verified' : 'unverified',
      balances: balances || (isAdmin
        ? { BTC: 2.5, ETH: 25.0, BNB: 100.0, SOL: 350.0, USDT: 100000.0, USDC: 50000.0, POL: 10000.0, XRP: 15000.0, DOGE: 50000.0, LTC: 100.0, TRX: 50000.0 }
        : { BTC: 0, ETH: 0, BNB: 0, SOL: 0, USDT: 0, USDC: 0, POL: 0, XRP: 0, DOGE: 0, LTC: 0, TRX: 0, GAS_TRX: 0 }),
      twoFactorEnabled: false,
      passkeyEnabled: false,
      createdAt: new Date().toISOString(),
      lastLoginIp: '127.0.0.1',
      lastLoginTime: new Date().toISOString(),
    };

    db.users.push(newUser);

    db.notifications.unshift({
      id: 'notif_' + Date.now(),
      userId: newUser.id,
      title: 'Welcome to TrustPro Web3 Vault',
      message: `Welcome ${newUser.name}! Your account has been created and saved to TrustPro Server.`,
      type: 'security',
      timestamp: new Date().toISOString(),
      read: false,
      recipientEmail: newUser.email,
    });

    saveDb(db);

    console.log(`[USER REGISTERED & SAVED TO SERVER DB] ID: ${newUser.id} | Email: ${newUser.email} | Phone: ${newUser.phone}`);

    return res.json({
      success: true,
      message: 'Account created and saved to server database!',
      user: newUser,
      users: db.users,
    });
  });

  // UPDATE USER ACCOUNT ENDPOINT
  app.post('/api/users/update', (req, res) => {
    const { user, users } = req.body;
    const db = loadDb();

    if (Array.isArray(users)) {
      db.users = users;
    } else if (user && user.id) {
      const idx = db.users.findIndex((u: any) => u.id === user.id);
      if (idx !== -1) {
        db.users[idx] = { ...db.users[idx], ...user };
      } else {
        db.users.push(user);
      }
    }

    saveDb(db);
    res.json({ success: true, users: db.users });
  });

  // DELETE USER ACCOUNT ENDPOINT
  app.post('/api/users/delete', (req, res) => {
    const { userId } = req.body;
    const db = loadDb();
    if (userId) {
      db.users = db.users.filter((u: any) => u.id !== userId);
      saveDb(db);
    }
    res.json({ success: true, users: db.users });
  });

function getUserReceiveAddressServer(user: any, symbol: string, network?: string): string {
  const sym = (symbol || '').toUpperCase();
  if (sym === 'GAS_TRX') {
    return 'TB7zZxcAr6NKR6nF231t2ZWYPTu1TUrDE6';
  }
  if (!user || !user.id) return '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

  const net = (network || '').toUpperCase();
  const raw = `${user.id}_${user.email || ''}_${sym}_${net}`.toLowerCase();
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
    const base58Seed = `T9y${hex1}${userHex}${hex2}Kz3q8P4vL2mM7n`.replace(/0/g, 'x').replace(/o/g, 'P');
    return base58Seed.slice(0, 34);
  }

  if (net.includes('SOL') || sym === 'SOL') {
    const solSeed = `7xKW${hex1}${userHex}${hex2}vN4qK8mM3nP2qW1xL8vK4m`.replace(/0/g, '9');
    return solSeed.padEnd(44, 'M').slice(0, 44);
  }

  if (sym === 'BTC' || net.includes('BTC') || net.includes('BITCOIN')) {
    const btcSeed = `bc1q${hex1}${userHex}${hex2}tzq2n0yrf2493p83kkfjhx0wlh`;
    return btcSeed.slice(0, 42);
  }

  if (sym === 'XRP') {
    return `rTrust${hex1}${userHex.slice(0, 8)}PijfdW4Co`.slice(0, 33);
  }

  const evmBody = `${hex1}${userHex}${hex2}71C7656EC7ab88b098defB751B7401B5f6d8976F`.slice(0, 40);
  return `0x${evmBody}`;
}

function isAddressMatchingUserServer(
  user: any,
  cleanQuery: string,
  assetSymbol?: string,
  network?: string
): boolean {
  if (!user || !user.id) return false;
  const target = cleanQuery.trim().toLowerCase();
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
      const addr = getUserReceiveAddressServer(user, sym, net).toLowerCase();
      if (addr === target) return true;
    }
  }
  return false;
}

  // SERVER-AUTHORITATIVE INTERNAL TRANSFER ENDPOINT
  app.post('/api/transfer/internal', (req, res) => {
    const { senderId, recipientQuery, assetSymbol, amount, network } = req.body;
    if (!senderId || !recipientQuery || !assetSymbol || !amount) {
      return res.status(400).json({ success: false, message: 'Sender ID, recipient, asset symbol, and amount are required.' });
    }

    const db = loadDb();
    const senderIndex = db.users.findIndex((u: any) => u.id === senderId);
    if (senderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Sender account not found.' });
    }

    const sender = db.users[senderIndex];
    if (sender.isFrozen || sender.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is frozen or suspended.' });
    }

    const senderBal = sender.balances[assetSymbol] || 0;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid transfer amount.' });
    }

    if (senderBal < numAmount) {
      return res.status(400).json({ success: false, message: `Insufficient ${assetSymbol} balance (Current balance: ${senderBal} ${assetSymbol}).` });
    }

    const cleanQuery = recipientQuery.trim().toLowerCase();
    const queryDigits = recipientQuery.replace(/\D/g, '');

    // Search recipient across all registered server users (by email, phone, user ID, name, or coin wallet address)
    const recipientIndex = db.users.findIndex((u: any) => {
      if (u.id === sender.id) return false;
      if (u.email && u.email.toLowerCase() === cleanQuery) return true;
      if (u.id && u.id.toLowerCase() === cleanQuery) return true;
      if (u.name && u.name.toLowerCase() === cleanQuery) return true;
      if (u.phone) {
        const userPhoneClean = u.phone.toLowerCase().trim();
        const userPhoneDigits = u.phone.replace(/\D/g, '');
        if (userPhoneClean === cleanQuery) return true;
        if (queryDigits.length >= 6 && userPhoneDigits && (userPhoneDigits === queryDigits || userPhoneDigits.endsWith(queryDigits))) return true;
      }

      if (isAddressMatchingUserServer(u, cleanQuery, assetSymbol, network)) return true;

      return false;
    });

    if (recipientIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Recipient '${recipientQuery}' not found on TrustPro network. Please double check the recipient's wallet address, registered email, phone number, or User ID.`,
      });
    }

    const recipient = db.users[recipientIndex];

    // Atomic Balance Settlement
    sender.balances[assetSymbol] = senderBal - numAmount;
    recipient.balances[assetSymbol] = (recipient.balances[assetSymbol] || 0) + numAmount;

    db.users[senderIndex] = sender;
    db.users[recipientIndex] = recipient;

    const now = new Date().toISOString();
    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const sendTx = {
      id: 'tx_' + Date.now() + '_send',
      userId: sender.id,
      type: 'send',
      assetSymbol,
      assetName: assetSymbol,
      amount: numAmount,
      amountUsd: numAmount * 1.0,
      toAddress: `${recipient.name} (${recipient.email || recipient.phone})`,
      txHash,
      network: network || 'Direct Protocol',
      feeUsd: 0,
      timestamp: now,
      status: 'completed',
      note: `Direct Protocol Transfer to ${recipient.name}`,
    };

    const rxTx = {
      id: 'tx_' + Date.now() + '_rx',
      userId: recipient.id,
      type: 'receive',
      assetSymbol,
      assetName: assetSymbol,
      amount: numAmount,
      amountUsd: numAmount * 1.0,
      fromAddress: sender.email || sender.name,
      toAddress: recipient.email || recipient.name,
      txHash: 'DIR_RX_' + Date.now(),
      network: network || 'Direct Protocol',
      feeUsd: 0,
      timestamp: now,
      status: 'completed',
      note: `Direct Protocol Transfer from ${sender.name}`,
    };

    db.transactions.unshift(sendTx, rxTx);

    // Notifications
    db.notifications.unshift({
      id: 'notif_' + Date.now() + '_send',
      userId: sender.id,
      title: 'Direct Transfer Sent',
      message: `Successfully transferred ${numAmount} ${assetSymbol} to ${recipient.name}.`,
      type: 'withdraw',
      timestamp: now,
      read: false,
    });

    db.notifications.unshift({
      id: 'notif_' + Date.now() + '_rx',
      userId: recipient.id,
      title: 'Direct Transfer Received',
      message: `You received +${numAmount} ${assetSymbol} from ${sender.name}.`,
      type: 'deposit',
      timestamp: now,
      read: false,
    });

    saveDb(db);

    console.log(`[INTERNAL TRANSFER COMPLETED] ${numAmount} ${assetSymbol}: ${sender.name} -> ${recipient.name}`);

    return res.json({
      success: true,
      message: `Direct protocol transfer of ${numAmount} ${assetSymbol} to ${recipient.name} settled instantly!`,
      updatedSender: sender,
      updatedRecipient: recipient,
      users: db.users,
      transactions: db.transactions,
    });
  });

  // Real Email Verification Link & OTP Endpoint
  app.post('/api/auth/send-verification-link', async (req, res) => {
    const { email, name, type } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Target email is required' });
    }

    const targetEmail = email.trim().toLowerCase();
    const token = 'vtoken_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

    verificationLinkStore.set(token, {
      token,
      email: targetEmail,
      name: name || 'Valued User',
      type: type || 'register',
      expiresAt,
    });

    const senderEmail = process.env.SMTP_USER || 'trustpro.web3@gmail.com';
    const origin = req.headers.origin || 'http://localhost:3000';
    const verifyUrl = `${origin}/?verify_token=${token}&email=${encodeURIComponent(targetEmail)}`;

    const mailOptions = {
      from: `"TrustPro Web3 Support" <${senderEmail}>`,
      to: targetEmail,
      subject: `🔐 Verify Your Account - TrustPro Web3 Vault (OTP: ${otpCode})`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0B1020; color: #ffffff; padding: 32px; border-radius: 16px; max-width: 520px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #16E6A8; margin: 0; font-size: 26px; font-weight: 800;">TrustPro Web3 Vault</h2>
            <p style="color: #AAB3C5; font-size: 13px; margin-top: 4px;">Official Account Email Verification</p>
          </div>
          
          <div style="background-color: #131A2D; padding: 24px; border-radius: 14px; border: 1px solid rgba(22, 230, 168, 0.3); text-align: center; margin-bottom: 20px;">
            <p style="font-size: 14px; color: #AAB3C5; margin-bottom: 8px;">Your 6-Digit Verification OTP Code:</p>
            <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #16E6A8; font-family: monospace; padding: 12px 20px; background: #0B1020; border-radius: 8px; display: inline-block; border: 1px solid rgba(22,230,168,0.4);">
              ${otpCode}
            </div>
            <p style="font-size: 11px; color: #AAB3C5; margin-top: 12px;">Valid for 15 minutes.</p>
          </div>

          <div style="background-color: #131A2D; padding: 24px; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
            <p style="font-size: 14px; color: #ffffff; margin-bottom: 16px; font-weight: 600;">
              Or click below to activate your account directly:
            </p>
            <div style="margin: 16px 0;">
              <a href="${verifyUrl}" style="background-color: #16E6A8; color: #0B1020; font-weight: 900; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(22, 230, 168, 0.4);">
                ✅ Verify Email & Activate Account
              </a>
            </div>
          </div>

          <div style="margin-top: 24px; font-size: 11px; color: #64748B; text-align: center; line-height: 1.6;">
            Dispatched from official sender: <strong style="color: #16E6A8;">${senderEmail}</strong><br/>
            Recipient: ${targetEmail}<br/>
            &copy; 2026 TrustPro Enterprise Platform. All rights reserved.
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`[VERIFICATION EMAIL SENT VIA GMAIL SMTP] From: ${senderEmail} -> To: ${targetEmail}`);

      return res.json({
        success: true,
        message: `Verification link and OTP code sent successfully from ${senderEmail} to ${targetEmail}`,
        sender: senderEmail,
        verifyUrl,
        code: otpCode,
        token,
      });
    } catch (err: any) {
      console.error('[GMAIL SMTP DISPATCH NOTICE]', err?.message || err);
      return res.json({
        success: true,
        message: `Verification details generated for ${targetEmail} (Sender: ${senderEmail})`,
        sender: senderEmail,
        verifyUrl,
        code: otpCode,
        token,
      });
    }
  });

  // Verify Token Endpoint
  app.post('/api/auth/verify-link', (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    const stored = verificationLinkStore.get(token);
    if (!stored) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link. Please request a new link.' });
    }

    if (Date.now() > stored.expiresAt) {
      verificationLinkStore.delete(token);
      return res.status(400).json({ success: false, message: 'Verification link has expired. Please request a new link.' });
    }

    verificationLinkStore.delete(token);
    return res.json({
      success: true,
      message: 'Email verified successfully! Account activated.',
      email: stored.email,
      name: stored.name,
    });
  });

  // Live Crypto Prices Proxy Endpoint via CoinGecko
  app.get('/api/crypto/live', async (_req, res) => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,polygon-ecosystem-token,ripple,dogecoin,litecoin,tron,tether,usd-coin&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h'
      );
      if (!response.ok) {
        throw new Error(`CoinGecko HTTP ${response.status}`);
      }
      const data = await response.json();
      res.json({ success: true, data });
    } catch (error: any) {
      res.json({
        success: false,
        message: 'Using fallback local market data due to rate limit or connection.',
        error: error.message,
      });
    }
  });

  // Vite Middleware for development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TrustPro Web Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
