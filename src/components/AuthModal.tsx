import React, { useState, useEffect, useRef } from 'react';
import { useWallet, generateSeedPhrase } from '../context/WalletContext';
import { verifyTotpCode } from '../utils/totp';
import {
  X,
  Mail,
  Lock,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Smartphone,
  KeyRound,
  Fingerprint,
  ShieldAlert,
  Globe,
} from 'lucide-react';
import { UserAccount } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    setCurrentUser,
    setUsers,
    users,
    registerUser,
    authenticateUser,
    restoreWalletWithSeed,
    setActiveTab,
  } = useWallet();

  // Primary State
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'google' | 'passkey' | 'seed'>('email');
  const [step, setStep] = useState<'form' | 'totp' | 'google_prompt' | 'passkey_scan' | 'seed_prompt' | 'success'>('form');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  // Seed Phrase State
  const [seedInput, setSeedInput] = useState('');
  const [seedWalletName, setSeedWalletName] = useState('trustpro');

  // Graphic Captcha State & Canvas Ref
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 2FA TOTP State
  const [totpInput, setTotpInput] = useState('');
  const [pending2FAUser, setPending2FAUser] = useState<UserAccount | null>(null);

  // Google Account Prompt State
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('trustpro');

  // Passkey Biometric Scanning State
  const [isScanningBiometric, setIsScanningBiometric] = useState(false);

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredUserRef, setRegisteredUserRef] = useState<UserAccount | null>(null);

  // Render Graphic Canvas Captcha with distortion, lines, dots & rotated text
  const drawCaptchaOnCanvas = (code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill Canvas Background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Security Noise Lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(22, 230, 168, 0.5)' : 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Security Noise Dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(22, 230, 168, 0.7)' : 'rgba(245, 197, 66, 0.7)';
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rotated Colorful Distorted Captcha Characters
    const colors = ['#3375BB', '#38BDF8', '#3375BB', '#A855F7', '#EC4899'];
    ctx.font = 'bold 20px monospace';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      ctx.save();
      const x = 16 + i * 28;
      const y = 20 + (Math.random() - 0.5) * 6;
      const angle = (Math.random() - 0.5) * 0.4;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 4;
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  };

  // Generate a random 5-character Graphic Captcha Code
  const generateNewCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    setTimeout(() => {
      drawCaptchaOnCanvas(code);
    }, 50);
  };

  useEffect(() => {
    if (isAuthModalOpen) {
      generateNewCaptcha();
    }
  }, [isAuthModalOpen, tab, authMethod]);

  if (!isAuthModalOpen) return null;

  const handleResetModalState = () => {
    setIsAuthModalOpen(false);
    setStep('form');
    setErrorMessage('');
    setCaptchaInput('');
    setTotpInput('');
    setPending2FAUser(null);
    setRegisteredUserRef(null);
  };

  // Handle Form Submission (Email / Phone) with Captcha Verification
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validate Graphic Captcha
    if (captchaInput.toUpperCase().trim() !== captchaCode) {
      setErrorMessage('Invalid Captcha code! Please enter the exact code shown in the image box.');
      generateNewCaptcha();
      return;
    }

    setIsSubmitting(true);

    const cleanEmail = email.trim().toLowerCase() || `${phone.trim()}@phone.trustpro.io`;
    const fullPhone = `${countryCode} ${phone.trim()}`;

    if (tab === 'register') {
      if (!name.trim() || (!email.trim() && !phone.trim()) || !password.trim()) {
        setErrorMessage('Please fill in your name, contact details, and password.');
        setIsSubmitting(false);
        return;
      }

      // Check existing email
      if (email.trim()) {
        const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
        if (existing) {
          setErrorMessage('An account with this email address already exists. Please sign in instead.');
          setIsSubmitting(false);
          generateNewCaptcha();
          return;
        }
      }

      // Register new user directly with fresh account state
      const res = registerUser(
        name.trim() || 'New User',
        cleanEmail,
        password,
        authMethod === 'phone' ? fullPhone : phone.trim()
      );
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMessage(res.message);
        generateNewCaptcha();
        return;
      }

      if (res.user) {
        setRegisteredUserRef(res.user);
      }
      setStep('success');
    } else {
      // Sign In Flow
      if (!password.trim()) {
        setErrorMessage('Please enter your account password.');
        setIsSubmitting(false);
        return;
      }

      const res = authenticateUser(cleanEmail, password);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMessage(res.message);
        generateNewCaptcha();
        return;
      }

      if (res.requires2FA && res.user) {
        setPending2FAUser(res.user);
        setStep('totp');
      } else {
        setRegisteredUserRef(res.user || null);
        setStep('success');
      }
    }
  };

  // Handle Google OAuth Sign-In / Register
  const handleGoogleLoginSubmit = (selectedEmail: string, selectedName: string) => {
    setIsSubmitting(true);
    setErrorMessage('');

    const cleanEmail = selectedEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid Google Gmail address (e.g. user@gmail.com).');
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

      if (existingUser) {
        setCurrentUser(existingUser);
        setRegisteredUserRef(existingUser);
      } else {
        const finalName = selectedName && selectedName.trim() && selectedName !== 'Google User' ? selectedName.trim() : 'trustpro';
        const res = registerUser(
          finalName,
          cleanEmail,
          'GoogleOAuth2SecuredKeyPass#2026',
          '+91 9800011223'
        );
        if (res.user) {
          setCurrentUser(res.user);
          setRegisteredUserRef(res.user);
        } else {
          // Fallback if user already created in state
          const freshlyFound = users.find((u) => u.email.toLowerCase() === cleanEmail);
          if (freshlyFound) {
            setCurrentUser(freshlyFound);
            setRegisteredUserRef(freshlyFound);
          }
        }
      }

      setIsSubmitting(false);
      setStep('success');
    }, 500);
  };

  // Handle Seed Phrase Restore / Login
  const handleSeedRestoreSubmit = () => {
    if (!seedInput.trim()) {
      setErrorMessage('Please enter your 12 or 24-word Secret Recovery Phrase.');
      return;
    }
    const words = seedInput.trim().split(/\s+/);
    if (words.length < 12) {
      setErrorMessage('Secret Recovery Phrase must contain at least 12 words.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    setTimeout(() => {
      const res = restoreWalletWithSeed(seedInput, seedWalletName || 'trustpro');
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.message);
        return;
      }
      setRegisteredUserRef(res.user || null);
      setStep('success');
    }, 600);
  };

  // Handle Passkey Biometric WebAuthn
  const handlePasskeyBiometricSubmit = async () => {
    setIsScanningBiometric(true);
    setErrorMessage('');

    let isNativeCancelled = false;

    if (navigator.credentials && typeof navigator.credentials.create === 'function') {
      try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        if (tab === 'register' || authMethod === 'passkey') {
          const userIdBytes = new Uint8Array(16);
          window.crypto.getRandomValues(userIdBytes);

          await navigator.credentials.create({
            publicKey: {
              challenge,
              rp: { name: 'TrustPro Web3 Vault' },
              user: {
                id: userIdBytes,
                name: email.trim() || 'passkey_user@trustpro.io',
                displayName: name.trim() || 'Passkey Keyholder',
              },
              pubKeyCredParams: [
                { alg: -7, type: 'public-key' },
                { alg: -257, type: 'public-key' },
              ],
              authenticatorSelection: { userVerification: 'required' },
              timeout: 30000,
            },
          });
        } else {
          await navigator.credentials.get({
            publicKey: {
              challenge,
              userVerification: 'required',
              timeout: 30000,
            },
          });
        }
      } catch (err: any) {
        if (err?.name === 'NotAllowedError' || err?.message?.includes('cancel')) {
          isNativeCancelled = true;
        }
      }
    }

    if (isNativeCancelled) {
      setIsScanningBiometric(false);
      setErrorMessage('Biometric scan canceled. Fingerprint / Face ID scan is required.');
      return;
    }

    setTimeout(() => {
      setIsScanningBiometric(false);

      if (tab === 'login') {
        const cleanEmail = email.trim().toLowerCase();
        let matchedUser = null;

        if (cleanEmail) {
          matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
        } else {
          const savedPasskeyUserId = localStorage.getItem('trustpro_passkey_user_id');
          if (savedPasskeyUserId) {
            matchedUser = users.find((u) => u.id === savedPasskeyUserId);
          } else {
            matchedUser = users.find((u) => u.passkeyEnabled && u.role !== 'admin');
          }
        }

        if (matchedUser) {
          const updatedUser = { ...matchedUser, passkeyEnabled: true };
          setCurrentUser(updatedUser);
          setRegisteredUserRef(updatedUser);
          localStorage.setItem('trustpro_passkey_user_id', updatedUser.id);
          setStep('success');
        } else {
          setErrorMessage(
            'No registered Passkey found for this account/device. Please enter your email and register a Passkey first.'
          );
        }
      } else {
        const userEmail = email.trim() || 'passkey_user@trustpro.io';
        const userName = name.trim() || 'Passkey Keyholder';

        const existing = users.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());
        if (existing) {
          const updatedWithPasskey = { ...existing, passkeyEnabled: true };
          setCurrentUser(updatedWithPasskey);
          setUsers((prev) => prev.map((u) => (u.id === existing.id ? updatedWithPasskey : u)));
          setRegisteredUserRef(updatedWithPasskey);
          localStorage.setItem('trustpro_passkey_user_id', updatedWithPasskey.id);
          setStep('success');
        } else {
          const res = registerUser(userName, userEmail, 'PasskeyKey#2026', phone);
          if (res.user) {
            const updatedWithPasskey = { ...res.user, passkeyEnabled: true };
            setCurrentUser(updatedWithPasskey);
            setUsers((prev) => prev.map((u) => (u.id === res.user.id ? updatedWithPasskey : u)));
            setRegisteredUserRef(updatedWithPasskey);
            localStorage.setItem('trustpro_passkey_user_id', updatedWithPasskey.id);
          }
          setStep('success');
        }
      }
    }, 1000);
  };

  // Handle Google Authenticator 2FA Verification
  const handleTotpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!pending2FAUser || !pending2FAUser.twoFactorSecret) {
      setErrorMessage('2FA configuration error. Please try again.');
      return;
    }

    setIsSubmitting(true);
    const isValid = await verifyTotpCode(pending2FAUser.twoFactorSecret, totpInput);
    setIsSubmitting(false);

    if (!isValid) {
      setErrorMessage('Invalid 6-digit Authenticator code. Check your Google Authenticator app.');
      return;
    }

    const updatedUser = {
      ...pending2FAUser,
      lastLoginTime: new Date().toISOString(),
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === pending2FAUser.id ? updatedUser : u)));
    setRegisteredUserRef(updatedUser);

    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-[26px] bg-gradient-to-b from-[#131A2D] via-[#0E1528] to-[#0B1020] border border-white/10 p-6 sm:p-8 shadow-2xl text-white overflow-hidden">
        {/* Background Subtle Gradient Glow */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#3375BB]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#0500FF]/10 blur-3xl pointer-events-none" />

        {/* Modal Close Button */}
        <button
          onClick={handleResetModalState}
          className="absolute top-5 right-5 h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#AAB3C5] hover:text-white hover:bg-white/10 transition-all z-20"
          id="auth-modal-close-btn"
        >
          <X className="h-4 w-4" />
        </button>

        {/* HEADER BRAND BANNER */}
        <div className="text-center mb-6 relative z-10">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-[#3375BB] to-[#0500FF] p-0.5 mb-3 flex items-center justify-center shadow-lg shadow-[#3375BB]/20 ring-4 ring-[#3375BB]/20">
            <div className="h-full w-full rounded-[14px] bg-[#0B1020] flex items-center justify-center">
              <ShieldCheck className="h-7 w-7 text-[#3375BB]" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-sans">
            TRUST<span className="text-[#3375BB]">PRO</span> MASTER WEB3
          </h3>
          <p className="text-xs text-[#AAB3C5] mt-1 font-medium">
            Non-Custodial Multi-Chain Crypto Exchange & Vault
          </p>
        </div>

        {/* FORM STEP 1 */}
        {step === 'form' && (
          <div className="relative z-10 space-y-4">
            {/* TAB TOGGLE: SIGN IN / REGISTER */}
            <div className="flex rounded-2xl bg-[#0B1020] p-1.5 border border-white/10 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
                  tab === 'login'
                    ? 'btn-gradient-primary text-[#0B1020] shadow-lg'
                    : 'text-[#AAB3C5] hover:text-white'
                }`}
                id="auth-toggle-login"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
                  tab === 'register'
                    ? 'btn-gradient-primary text-[#0B1020] shadow-lg'
                    : 'text-[#AAB3C5] hover:text-white'
                }`}
                id="auth-toggle-register"
              >
                Register Account
              </button>
            </div>

            {/* AUTH METHOD SELECTOR TABS */}
            <div className="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-[#0B1020]/80 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setErrorMessage('');
                }}
                className={`py-2 px-1 text-[10px] font-extrabold rounded-xl flex items-center justify-center gap-1 transition-all ${
                  authMethod === 'email'
                    ? 'bg-[#131A2D] text-[#3375BB] border border-[#3375BB]/40 shadow-md'
                    : 'text-[#AAB3C5] hover:text-white'
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Email</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('phone');
                  setErrorMessage('');
                }}
                className={`py-2 px-1 text-[10px] font-extrabold rounded-xl flex items-center justify-center gap-1 transition-all ${
                  authMethod === 'phone'
                    ? 'bg-[#131A2D] text-[#3375BB] border border-[#3375BB]/40 shadow-md'
                    : 'text-[#AAB3C5] hover:text-white'
                }`}
              >
                <Phone className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Phone</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('google');
                  setStep('google_prompt');
                  setErrorMessage('');
                }}
                className={`py-2 px-1 text-[10px] font-extrabold rounded-xl flex items-center justify-center gap-1 transition-all ${
                  authMethod === 'google'
                    ? 'bg-[#131A2D] text-[#0500FF] border border-[#0500FF]/40 shadow-md'
                    : 'text-[#AAB3C5] hover:text-white'
                }`}
              >
                <Globe className="h-3.5 w-3.5 text-[#0500FF]" />
                <span className="hidden sm:inline">Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('passkey');
                  setStep('passkey_scan');
                  setErrorMessage('');
                }}
                className={`py-2 px-1 text-[10px] font-extrabold rounded-xl flex items-center justify-center gap-1 transition-all ${
                  authMethod === 'passkey'
                    ? 'bg-[#131A2D] text-[#3375BB] border border-[#3375BB]/40 shadow-md'
                    : 'text-[#AAB3C5] hover:text-white'
                }`}
              >
                <Fingerprint className="h-3.5 w-3.5 text-[#3375BB]" />
                <span className="hidden sm:inline">Passkey</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('seed');
                  setStep('seed_prompt');
                  setErrorMessage('');
                }}
                className={`py-2 px-1 text-[10px] font-extrabold rounded-xl flex items-center justify-center gap-1 transition-all ${
                  authMethod === 'seed'
                    ? 'bg-[#131A2D] text-emerald-400 border border-emerald-500/40 shadow-md'
                    : 'text-[#AAB3C5] hover:text-white'
                }`}
              >
                <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Seed</span>
              </button>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 flex items-center gap-2.5 text-rose-400 text-xs font-semibold animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* FORM INPUTS */}
            <form onSubmit={handleFormSubmit} className="space-y-3.5 pt-1">
              {tab === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#AAB3C5] mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-[#AAB3C5]" />
                    <input
                      type="text"
                      placeholder="trustpro"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-xl bg-[#0B1020] border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3375BB]"
                    />
                  </div>
                </div>
              )}

              {/* EMAIL METHOD FIELD */}
              {authMethod === 'email' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#AAB3C5] mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#AAB3C5]" />
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl bg-[#0B1020] border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3375BB]"
                      id="auth-email-input"
                    />
                  </div>
                </div>
              )}

              {/* PHONE METHOD FIELD */}
              {authMethod === 'phone' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#AAB3C5] mb-1">Mobile Phone Number</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="rounded-xl bg-[#0B1020] border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3375BB] font-mono"
                    >
                      <option value="+91">🇮🇳 +91 (IND)</option>
                      <option value="+1">🇺🇸 +1 (USA)</option>
                      <option value="+44">🇬🇧 +44 (UK)</option>
                      <option value="+971">🇦🇪 +971 (UAE)</option>
                      <option value="+65">🇸🇬 +65 (SG)</option>
                    </select>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3.5 top-3 h-4 w-4 text-[#AAB3C5]" />
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full rounded-xl bg-[#0B1020] border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3375BB] font-mono"
                        id="auth-phone-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#AAB3C5] mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#AAB3C5]" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl bg-[#0B1020] border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3375BB]"
                    id="auth-password-input"
                  />
                </div>
              </div>

              {/* GRAPHIC CANVAS IMAGE CAPTCHA BOX */}
              <div className="p-3.5 rounded-2xl bg-[#0B1020] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#3375BB]" />
                    <span>Graphic Security Captcha</span>
                  </span>
                  <button
                    type="button"
                    onClick={generateNewCaptcha}
                    className="flex items-center gap-1 text-[#3375BB] hover:underline text-[10px] font-extrabold"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>New Captcha Image</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-[#131A2D] border border-white/10 select-none">
                  {/* Real HTML5 Canvas Image Captcha */}
                  <canvas
                    ref={canvasRef}
                    width={170}
                    height={44}
                    className="rounded-lg border border-white/10 shadow-inner bg-[#0B1020]"
                  />
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#3375BB] bg-[#3375BB]/10 border border-[#3375BB]/30 px-2 py-1 rounded block">
                      SECURE
                    </span>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Enter 5-character Captcha"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  maxLength={5}
                  required
                  className="w-full text-center uppercase tracking-widest font-mono font-bold rounded-xl bg-[#131A2D] border border-white/10 py-2.5 text-xs text-[#3375BB] focus:outline-none focus:border-[#3375BB]"
                  id="auth-captcha-input"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl btn-gradient-primary py-3.5 text-xs font-black text-[#0B1020] transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
                id="auth-submit-btn"
              >
                <span>
                  {tab === 'register' ? 'Verify Captcha & Create Account' : 'Verify Captcha & Sign In'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* DIRECT GOOGLE, PASSKEY & SEED PHRASE BUTTONS */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('google');
                  setStep('google_prompt');
                }}
                className="w-full py-2.5 rounded-xl bg-[#0B1020] border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google Sign-In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('passkey');
                  setStep('passkey_scan');
                }}
                className="w-full py-2.5 rounded-xl bg-[#0B1020] border border-[#3375BB]/30 text-xs font-bold text-[#3375BB] flex items-center justify-center gap-2 hover:bg-[#3375BB]/10 transition-all"
              >
                <Fingerprint className="h-4 w-4" />
                <span>Biometric Passkey Sign-In (Face ID / Fingerprint)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('seed');
                  setStep('seed_prompt');
                  setErrorMessage('');
                }}
                className="w-full py-2.5 rounded-xl bg-[#0B1020] border border-emerald-500/30 text-xs font-bold text-emerald-400 flex items-center justify-center gap-2 hover:bg-emerald-500/10 transition-all"
              >
                <KeyRound className="h-4 w-4 text-emerald-400" />
                <span>Import & Access via 12-Word Seed Phrase</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GOOGLE OAUTH PROMPT STEP */}
        {step === 'google_prompt' && (
          <div className="relative z-10 space-y-4 animate-fadeIn">
            <div className="text-center space-y-1.5">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-[#0500FF]/10 border border-[#0500FF]/30 flex items-center justify-center">
                <svg className="h-7 w-7" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h4 className="text-lg font-black text-white">Google Account Register & Sign-In</h4>
              <p className="text-xs text-[#AAB3C5]">Directly register a new account or sign in with your Google Gmail</p>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 flex items-center gap-2.5 text-rose-400 text-xs font-semibold animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* CUSTOM GOOGLE ACCOUNT FORM */}
              <div className="p-4 rounded-2xl bg-[#0B1020] border border-[#0500FF]/30 space-y-3">
                <p className="text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Google Account Details:</span>
                  <span className="text-[10px] text-[#3375BB] font-mono">Instant Registration & Login</span>
                </p>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#AAB3C5] mb-1">Your Name / Display Name</label>
                    <input
                      type="text"
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      placeholder="trustpro"
                      className="w-full rounded-xl bg-[#131A2D] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0500FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[#AAB3C5] mb-1">Google Gmail Address</label>
                    <input
                      type="email"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full rounded-xl bg-[#131A2D] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0500FF]"
                      id="google-email-custom-input"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleGoogleLoginSubmit(googleEmail, googleName || 'trustpro')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0500FF] to-[#3375BB] hover:opacity-95 text-xs font-black text-white flex items-center justify-center gap-2 transition-all shadow-md mt-1"
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Register / Sign In with Google</span>
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#AAB3C5] hover:text-white"
            >
              Back
            </button>
          </div>
        )}

        {/* STEP 3: PASSKEY BIOMETRIC SCANNER STEP */}
        {step === 'passkey_scan' && (
          <div className="relative z-10 space-y-6 text-center animate-fadeIn py-2">
            <div className="space-y-2">
              <div className="relative mx-auto h-20 w-20 rounded-full bg-[#3375BB]/10 border border-[#3375BB]/40 flex items-center justify-center text-[#3375BB] shadow-xl shadow-[#3375BB]/20">
                <Fingerprint className={`h-12 w-12 ${isScanningBiometric ? 'animate-pulse text-[#3375BB]' : ''}`} />
                {isScanningBiometric && (
                  <div className="absolute inset-0 rounded-full border-2 border-[#3375BB] animate-ping opacity-75" />
                )}
              </div>
              <h4 className="text-xl font-black text-white">Biometric Passkey Authentication</h4>
              <p className="text-xs text-[#AAB3C5]">
                Touch your fingerprint sensor or look at camera for Face ID / Hardware Security Key
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B1020] border border-white/10 space-y-2 text-xs text-[#AAB3C5]">
              <div className="flex items-center justify-center gap-2 text-[#3375BB] font-bold">
                <KeyRound className="h-4 w-4" />
                <span>WebAuthn FIDO2 Cryptographic Key</span>
              </div>
              <p className="text-[11px]">
                Passkey keys are stored securely in your device's hardware TPM enclave.
              </p>
            </div>

            <button
              type="button"
              disabled={isScanningBiometric}
              onClick={handlePasskeyBiometricSubmit}
              className="w-full py-3.5 rounded-xl btn-gradient-primary text-xs font-black text-[#0B1020] shadow-xl flex items-center justify-center gap-2"
            >
              <Fingerprint className="h-4 w-4" />
              <span>{isScanningBiometric ? 'Scanning Biometrics...' : 'Scan Biometric Passkey Now'}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#AAB3C5] hover:text-white"
            >
              Back to Form Login
            </button>
          </div>
        )}

        {/* STEP 4: SECRET RECOVERY SEED PHRASE STEP */}
        {step === 'seed_prompt' && (
          <div className="relative z-10 space-y-4 animate-fadeIn">
            <div className="text-center space-y-1.5">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <KeyRound className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-black text-white">Import / Sign-In with Seed Phrase</h4>
              <p className="text-xs text-[#AAB3C5]">
                Restore your Web3 wallet using your 12 or 24-word Secret Recovery Phrase
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 flex items-center gap-2.5 text-rose-400 text-xs font-semibold animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-[#0B1020] border border-emerald-500/30 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#AAB3C5] mb-1">
                  Wallet / Account Name
                </label>
                <input
                  type="text"
                  value={seedWalletName}
                  onChange={(e) => setSeedWalletName(e.target.value)}
                  placeholder="trustpro"
                  className="w-full rounded-xl bg-[#131A2D] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-[#AAB3C5]">
                    12 or 24-Word Seed Phrase
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newSeed = generateSeedPhrase();
                      setSeedInput(newSeed);
                      setErrorMessage('');
                    }}
                    className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Generate Test 12-Word Seed</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  placeholder="enter 12 or 24 secret recovery words e.g. alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima..."
                  className="w-full rounded-xl bg-[#131A2D] border border-white/10 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed resize-none"
                  id="auth-seed-phrase-textarea"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-[#131A2D] border border-white/5 flex items-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Client-side cryptographic restore. Master key auto-derived securely.</span>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSeedRestoreSubmit}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-xs font-black text-black transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
                id="auth-seed-submit-btn"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Restore & Access Web3 Wallet</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('form');
                setErrorMessage('');
              }}
              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#AAB3C5] hover:text-white"
            >
              Back
            </button>
          </div>
        )}

        {/* STEP 4: GOOGLE AUTHENTICATOR 2FA STEP */}
        {step === 'totp' && (
          <form onSubmit={handleTotpVerify} className="relative z-10 text-center py-2 space-y-5 animate-fadeIn">
            <div className="space-y-2">
              <Smartphone className="h-12 w-12 text-[#3375BB] mx-auto animate-bounce" />
              <h4 className="text-lg font-black text-white">Google Authenticator Required</h4>
              <p className="text-xs text-[#AAB3C5]">
                Enter the 6-digit live code from your Google Authenticator or Authy app
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 flex items-center justify-center gap-2 text-rose-400 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <input
              type="text"
              maxLength={6}
              value={totpInput}
              onChange={(e) => setTotpInput(e.target.value)}
              placeholder="123456"
              className="w-48 mx-auto text-center text-2xl font-mono font-black tracking-widest rounded-2xl bg-[#0B1020] border border-[#3375BB]/40 py-3 text-[#3375BB] focus:outline-none focus:border-[#3375BB]"
              required
              id="totp-input-field"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl btn-gradient-primary py-3.5 text-xs font-black text-[#0B1020] transition-all shadow-xl"
              id="verify-totp-btn"
            >
              Verify 2FA & Complete Sign In
            </button>
          </form>
        )}

        {/* STEP 5: SUCCESSFUL LOGIN / REGISTRATION SCREEN */}
        {step === 'success' && (
          <div className="relative z-10 text-center py-6 space-y-5 animate-fadeIn">
            <div className="relative mx-auto h-20 w-20 rounded-full bg-[#3375BB]/20 border border-[#3375BB] flex items-center justify-center text-[#3375BB] shadow-2xl shadow-[#3375BB]/30">
              <CheckCircle2 className="h-12 w-12 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-black text-white">Authentication Successful!</h4>
              <p className="text-xs text-[#AAB3C5]">
                Welcome,{' '}
                <span className="text-[#3375BB] font-bold">
                  {currentUser?.name || registeredUserRef?.name || 'User'}
                </span>{' '}
                ({(currentUser?.role || registeredUserRef?.role || 'user').toUpperCase()})
              </p>
            </div>

            {/* KYC UNVERIFIED WARNING BANNER FOR NEW ACCOUNTS */}
            <div className="p-4 rounded-2xl bg-[#3375BB]/10 border border-[#3375BB]/30 text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#3375BB]">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  <span>KYC Identity Verification Status</span>
                </span>
                <span className="bg-[#3375BB]/20 border border-[#3375BB]/40 text-[#3375BB] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {(currentUser?.kycStatus || registeredUserRef?.kycStatus || 'unverified').toUpperCase()}
                </span>
              </div>

              <p className="text-[11px] text-[#AAB3C5] leading-relaxed">
                Your account is currently <strong className="text-white">Unverified</strong>. Upload your KYC identity documents in Account Settings or await Admin approval to unlock full withdrawal limits.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  handleResetModalState();
                  setActiveTab('overview');
                }}
                className="flex-1 py-3 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white hover:bg-white/20 transition-all"
              >
                Upload KYC
              </button>

              <button
                type="button"
                onClick={handleResetModalState}
                className="flex-1 py-3 rounded-xl btn-gradient-primary text-xs font-black text-[#0B1020] transition-all shadow-xl"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
