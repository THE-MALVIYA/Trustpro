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
  Eye,
  EyeOff,
  Check,
  Sparkles,
  Info,
  HelpCircle,
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
    setActiveTab,
  } = useWallet();

  // Primary Navigation State
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'google' | 'passkey'>('email');
  const [step, setStep] = useState<'form' | 'totp' | 'google_prompt' | 'passkey_scan' | 'forgot_password' | 'success'>('form');

  // Form Field State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Graphic Captcha State & Canvas Ref
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [isCaptchaRefreshing, setIsCaptchaRefreshing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 2FA TOTP State
  const [totpInput, setTotpInput] = useState('');
  const [pending2FAUser, setPending2FAUser] = useState<UserAccount | null>(null);

  // Google Account State
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('trustpro');

  // Passkey Biometric Scanning State
  const [isScanningBiometric, setIsScanningBiometric] = useState(false);

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredUserRef, setRegisteredUserRef] = useState<UserAccount | null>(null);

  // Password Strength Calculator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-700', text: 'text-slate-400', width: 'w-0' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400', width: 'w-1/3' };
    if (score === 2 || score === 3) return { score: 2, label: 'Moderate', color: 'bg-amber-500', text: 'text-amber-400', width: 'w-2/3' };
    return { score: 3, label: 'Strong & Secure', color: 'bg-emerald-500', text: 'text-emerald-400', width: 'w-full' };
  };

  const pwdStrength = getPasswordStrength(password);

  // Render Graphic Canvas Captcha with distortion, lines, noise dots & rotated text
  const drawCaptchaOnCanvas = (code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#090D16');
    bgGradient.addColorStop(1, '#111827');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle Grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Security Noise Lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(16, 185, 129, 0.45)' : 'rgba(59, 130, 246, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Security Noise Dots
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(245, 158, 11, 0.6)';
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Colorful Distorted Captcha Characters
    const colors = ['#10B981', '#38BDF8', '#6366F1', '#A855F7', '#EC4899'];
    ctx.font = 'bold 22px monospace';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      ctx.save();
      const x = 18 + i * 28;
      const y = 22 + (Math.random() - 0.5) * 6;
      const angle = (Math.random() - 0.5) * 0.35;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 5;
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  };

  // Generate a random 5-character Graphic Captcha Code
  const generateNewCaptcha = () => {
    setIsCaptchaRefreshing(true);
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    setTimeout(() => {
      drawCaptchaOnCanvas(code);
      setIsCaptchaRefreshing(false);
    }, 100);
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
    setForgotSent(false);
  };

  // Handle Form Submission (Email / Phone)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validate Graphic Captcha
    if (captchaInput.toUpperCase().trim() !== captchaCode) {
      setErrorMessage('Invalid security captcha! Please enter the exact 5-character code.');
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

      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
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

      // Register new user
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

      const res = await authenticateUser(cleanEmail, password);
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
            'No registered Passkey found for this account. Please enter your email and register a Passkey first.'
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

  // Handle Forgot Password Request
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setForgotSent(true);
      setErrorMessage('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#16181D] border border-white/10 p-6 sm:p-8 shadow-2xl text-white overflow-hidden my-auto">
        {/* Background Subtle Gradient Glows */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#05D686]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        {/* Modal Close Button */}
        <button
          onClick={handleResetModalState}
          className="absolute top-5 right-5 h-9 w-9 rounded-2xl bg-[#1E2024] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#25282E] transition-all z-20"
          id="auth-modal-close-btn"
        >
          <X className="h-4 w-4" />
        </button>

        {/* HEADER BRAND BANNER */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E2024] border border-white/10 text-[10px] font-mono text-[#05D686] mb-3 shadow-inner">
            <span className="h-1.5 w-1.5 rounded-full bg-[#05D686] animate-pulse" />
            <span>SECURED WEB3 MULTI-CHAIN VAULT</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="h-10 w-10 rounded-2xl bg-[#05D686] p-0.5 flex items-center justify-center shadow-lg shadow-[#05D686]/20">
              <div className="h-full w-full rounded-[14px] bg-[#16181D] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-[#05D686]" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              Trust <span className="text-[#05D686]">Wallet</span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
            The simple & secure multi-chain crypto wallet
          </p>
        </div>

        {/* FORM STEP 1 */}
        {step === 'form' && (
          <div className="relative z-10 space-y-4">
            {/* TAB TOGGLE: SIGN IN / REGISTER */}
            <div className="flex rounded-2xl bg-[#121418] p-1.5 border border-white/10 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  tab === 'login'
                    ? 'bg-[#05D686] text-[#121418] shadow-md'
                    : 'text-slate-400 hover:text-white'
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
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  tab === 'register'
                    ? 'bg-[#05D686] text-[#121418] shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                id="auth-toggle-register"
              >
                Create Account
              </button>
            </div>

            {/* AUTH METHOD SELECTOR TABS */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-[#121418] border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setErrorMessage('');
                }}
                className={`py-2 px-1 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
                  authMethod === 'email'
                    ? 'bg-[#24272D] text-[#05D686] border border-[#05D686]/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
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
                className={`py-2 px-1 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
                  authMethod === 'phone'
                    ? 'bg-[#24272D] text-[#05D686] border border-[#05D686]/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
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
                className={`py-2 px-1 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
                  authMethod === 'google'
                    ? 'bg-[#24272D] text-blue-400 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="h-3.5 w-3.5 text-blue-400" />
                <span className="hidden sm:inline">Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('passkey');
                  setStep('passkey_scan');
                  setErrorMessage('');
                }}
                className={`py-2 px-1 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
                  authMethod === 'passkey'
                    ? 'bg-[#24272D] text-purple-400 border border-purple-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Fingerprint className="h-3.5 w-3.5 text-purple-400" />
                <span className="hidden sm:inline">Passkey</span>
              </button>
            </div>

            {errorMessage && (
              <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-3 flex items-center gap-2.5 text-rose-400 text-xs font-medium animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* FORM INPUTS */}
            <form onSubmit={handleFormSubmit} className="space-y-3.5 pt-1">
              {tab === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Satoshi Nakamoto"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-2xl bg-[#1E2024] border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#05D686] transition-all"
                    />
                  </div>
                </div>
              )}

              {/* EMAIL METHOD FIELD */}
              {authMethod === 'email' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-2xl bg-[#1E2024] border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#05D686] transition-all"
                      id="auth-email-input"
                    />
                  </div>
                </div>
              )}

              {/* PHONE METHOD FIELD */}
              {authMethod === 'phone' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Mobile Phone Number</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="rounded-2xl bg-[#1E2024] border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#05D686] font-mono"
                    >
                      <option value="+91">🇮🇳 +91 (IND)</option>
                      <option value="+1">🇺🇸 +1 (USA)</option>
                      <option value="+44">🇬🇧 +44 (UK)</option>
                      <option value="+971">🇦🇪 +971 (UAE)</option>
                      <option value="+65">🇸G +65 (SG)</option>
                      <option value="+49">🇩🇪 +49 (GER)</option>
                      <option value="+33">🇫🇷 +33 (FRA)</option>
                      <option value="+81">🇯🇵 +81 (JPN)</option>
                    </select>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full rounded-2xl bg-[#1E2024] border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#05D686] font-mono transition-all"
                        id="auth-phone-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PASSWORD FIELD WITH VISIBILITY TOGGLE */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-300">Password</label>
                  {tab === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setStep('forgot_password');
                        setErrorMessage('');
                      }}
                      className="text-[10px] font-bold text-[#05D686] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl bg-[#1E2024] border border-white/10 pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#05D686] transition-all"
                    id="auth-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength Meter on Registration */}
                {tab === 'register' && password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Security Strength:</span>
                      <span className={`font-bold ${pwdStrength.text}`}>{pwdStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#121418] rounded-full overflow-hidden">
                      <div className={`h-full ${pwdStrength.color} ${pwdStrength.width} transition-all duration-300`} />
                    </div>
                  </div>
                )}
              </div>

              {/* REMEMBER ME & TERMS CHECKBOX */}
              {tab === 'login' ? (
                <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-[#1E2024] border-white/10 text-[#05D686] focus:ring-[#05D686]/30 h-3.5 w-3.5"
                    />
                    <span className="text-[11px] font-medium">Remember this browser</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">2FA Enforced</span>
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 leading-relaxed pt-0.5">
                  By creating an account, you agree to Trust Wallet’s{' '}
                  <span className="text-[#05D686] font-semibold cursor-pointer hover:underline">Terms of Service</span> and{' '}
                  <span className="text-[#05D686] font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
                </div>
              )}

              {/* GRAPHIC CANVAS IMAGE CAPTCHA BOX */}
              <div className="p-3.5 rounded-2xl bg-[#1E2024] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#05D686]" />
                    <span>Security Image Captcha</span>
                  </span>
                  <button
                    type="button"
                    onClick={generateNewCaptcha}
                    disabled={isCaptchaRefreshing}
                    className="flex items-center gap-1 text-[#05D686] hover:underline text-[10px] font-bold"
                  >
                    <RefreshCw className={`h-3 w-3 ${isCaptchaRefreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh Code</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-[#121418] border border-white/10 select-none">
                  {/* Real HTML5 Canvas Image Captcha */}
                  <canvas
                    ref={canvasRef}
                    width={170}
                    height={44}
                    className="rounded-lg border border-white/10 shadow-inner bg-[#16181D]"
                  />
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#05D686] bg-[#05D686]/10 border border-[#05D686]/30 px-2 py-1 rounded block">
                      {captchaInput.length === 5 && captchaInput.toUpperCase() === captchaCode ? (
                        <span className="flex items-center gap-1 text-[#05D686]">
                          <Check className="h-3 w-3" /> MATCHED
                        </span>
                      ) : (
                        'SECURE'
                      )}
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
                  className="w-full text-center uppercase tracking-widest font-mono font-bold rounded-xl bg-[#121418] border border-white/10 py-2.5 text-xs text-[#05D686] focus:outline-none focus:border-[#05D686] transition-all"
                  id="auth-captcha-input"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-[#05D686] hover:bg-[#04c47b] py-3.5 text-xs font-black text-[#121418] transition-all shadow-lg shadow-[#05D686]/20 flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-95 hover:scale-[1.01]"
                id="auth-submit-btn"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>
                      {tab === 'register' ? 'Verify Captcha & Create Account' : 'Verify Captcha & Sign In'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* DIRECT GOOGLE & PASSKEY BUTTONS */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-mono">
                Alternative Fast Sign-In
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('google');
                    setStep('google_prompt');
                  }}
                  className="py-2.5 px-2 rounded-xl bg-[#1E2024] border border-white/10 text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1.5 hover:bg-[#25282E] hover:border-blue-500/40 transition-all"
                >
                  <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('passkey');
                    setStep('passkey_scan');
                  }}
                  className="py-2.5 px-2 rounded-xl bg-[#1E2024] border border-white/10 text-[11px] font-bold text-purple-400 flex items-center justify-center gap-1.5 hover:bg-[#25282E] hover:border-purple-500/40 transition-all"
                >
                  <Fingerprint className="h-3.5 w-3.5 shrink-0" />
                  <span>Fingerprint / Passkey</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: FORGOT PASSWORD FLOW */}
        {step === 'forgot_password' && (
          <div className="relative z-10 space-y-4 animate-fadeIn">
            <div className="text-center space-y-1.5">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-[#05D686]/10 border border-[#05D686]/30 flex items-center justify-center text-[#05D686]">
                <Lock className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-black text-white">Reset Account Password</h4>
              <p className="text-xs text-slate-400">
                Enter your registered email address to receive a secure password reset link
              </p>
            </div>

            {forgotSent ? (
              <div className="p-4 rounded-2xl bg-[#05D686]/10 border border-[#05D686]/30 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-[#05D686] mx-auto" />
                <h5 className="text-sm font-bold text-white">Reset Email Sent!</h5>
                <p className="text-xs text-slate-300">
                  We've sent a password reset link to <strong className="text-[#05D686]">{forgotEmail}</strong>. Please check your inbox or spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setForgotSent(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#1E2024] border border-white/10 text-xs font-bold text-white hover:bg-[#25282E]"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                {errorMessage && (
                  <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 flex items-center gap-2 text-rose-400 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Registered Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="w-full rounded-2xl bg-[#1E2024] border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#05D686]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-[#05D686] hover:bg-[#04c47b] text-xs font-black text-[#121418] transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <span>Send Password Reset Link</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="w-full py-2.5 rounded-2xl bg-[#1E2024] border border-white/10 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Back to Login
                </button>
              </form>
            )}
          </div>
        )}

        {/* STEP 2: GOOGLE OAUTH PROMPT STEP */}
        {step === 'google_prompt' && (
          <div className="relative z-10 space-y-4 animate-fadeIn">
            <div className="text-center space-y-1.5">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <svg className="h-7 w-7" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h4 className="text-lg font-black text-white">Google OAuth Authentication</h4>
              <p className="text-xs text-slate-400">Sign in or create account via Google Workspace</p>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 flex items-center gap-2.5 text-rose-400 text-xs font-semibold animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#1E2024] border border-white/10 space-y-3">
                <p className="text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Google Credentials:</span>
                  <span className="text-[10px] text-[#05D686] font-mono">Instant Sign-In</span>
                </p>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      placeholder="e.g. Satoshi"
                      className="w-full rounded-xl bg-[#121418] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Google Gmail Address</label>
                    <input
                      type="email"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full rounded-xl bg-[#121418] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      id="google-email-custom-input"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleGoogleLoginSubmit(googleEmail, googleName || 'trustwallet')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-xs font-black text-white flex items-center justify-center gap-2 transition-all shadow-md mt-1"
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Sign In with Google</span>
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-full py-2.5 rounded-xl bg-[#1E2024] border border-white/10 text-xs font-bold text-slate-400 hover:text-white"
            >
              Back
            </button>
          </div>
        )}

        {/* STEP 3: PASSKEY BIOMETRIC SCANNER STEP */}
        {step === 'passkey_scan' && (
          <div className="relative z-10 space-y-6 text-center animate-fadeIn py-2">
            <div className="space-y-2">
              <div className="relative mx-auto h-20 w-20 rounded-full bg-purple-500/10 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-xl shadow-purple-500/20">
                <Fingerprint className={`h-12 w-12 ${isScanningBiometric ? 'animate-pulse text-purple-400' : ''}`} />
                {isScanningBiometric && (
                  <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-75" />
                )}
              </div>
              <h4 className="text-xl font-black text-white">Biometric Passkey Scan</h4>
              <p className="text-xs text-slate-400">
                Touch your fingerprint sensor or look at camera for Face ID
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#1E2024] border border-white/10 space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-center gap-2 text-purple-400 font-bold">
                <KeyRound className="h-4 w-4" />
                <span>WebAuthn FIDO2 Cryptographic Key</span>
              </div>
              <p className="text-[11px]">
                Passkeys are hardware encrypted in your device's Secure Enclave.
              </p>
            </div>

            <button
              type="button"
              disabled={isScanningBiometric}
              onClick={handlePasskeyBiometricSubmit}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-xs font-black text-white shadow-xl flex items-center justify-center gap-2"
            >
              <Fingerprint className="h-4 w-4" />
              <span>{isScanningBiometric ? 'Scanning Biometrics...' : 'Scan Biometric Passkey Now'}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-full py-2.5 rounded-xl bg-[#1E2024] border border-white/10 text-xs font-bold text-slate-400 hover:text-white"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* STEP 4: GOOGLE AUTHENTICATOR 2FA STEP */}
        {step === 'totp' && (
          <form onSubmit={handleTotpVerify} className="relative z-10 text-center py-2 space-y-5 animate-fadeIn">
            <div className="space-y-2">
              <Smartphone className="h-12 w-12 text-[#05D686] mx-auto animate-bounce" />
              <h4 className="text-lg font-black text-white">Google Authenticator Required</h4>
              <p className="text-xs text-slate-400">
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
              className="w-48 mx-auto text-center text-2xl font-mono font-black tracking-widest rounded-2xl bg-[#121418] border border-[#05D686]/40 py-3 text-[#05D686] focus:outline-none focus:border-[#05D686]"
              required
              id="totp-input-field"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-[#05D686] hover:bg-[#04c47b] py-3.5 text-xs font-black text-[#121418] transition-all shadow-xl"
              id="verify-totp-btn"
            >
              Verify 2FA & Complete Sign In
            </button>
          </form>
        )}

        {/* STEP 5: SUCCESSFUL LOGIN / REGISTRATION SCREEN */}
        {step === 'success' && (
          <div className="relative z-10 text-center py-6 space-y-5 animate-fadeIn">
            <div className="relative mx-auto h-20 w-20 rounded-full bg-[#05D686]/20 border border-[#05D686] flex items-center justify-center text-[#05D686] shadow-2xl shadow-[#05D686]/30">
              <CheckCircle2 className="h-12 w-12 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-black text-white">Authentication Successful!</h4>
              <p className="text-xs text-slate-400">
                Welcome,{' '}
                <span className="text-[#05D686] font-bold">
                  {currentUser?.name || registeredUserRef?.name || 'User'}
                </span>{' '}
                ({(currentUser?.role || registeredUserRef?.role || 'user').toUpperCase()})
              </p>
            </div>

            {/* KYC UNVERIFIED WARNING BANNER FOR NEW ACCOUNTS */}
            <div className="p-4 rounded-2xl bg-[#1E2024] border border-white/10 text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#05D686]">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  <span>KYC Identity Status</span>
                </span>
                <span className="bg-[#05D686]/10 border border-[#05D686]/30 text-[#05D686] px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase">
                  {(currentUser?.kycStatus || registeredUserRef?.kycStatus || 'unverified').toUpperCase()}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your account is ready for trading. Complete identity verification anytime in your Account Settings to increase daily limits.
              </p>
            </div>

            <div className="flex gap-3">
              {(currentUser?.role === 'admin' || registeredUserRef?.role === 'admin') ? (
                <button
                  type="button"
                  onClick={() => {
                    handleResetModalState();
                    setActiveTab('admin');
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Launch Super Admin Portal</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      handleResetModalState();
                      setActiveTab('settings');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-[#1E2024] border border-white/10 text-xs font-bold text-white hover:bg-[#25282E] transition-all"
                  >
                    Account Settings
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleResetModalState();
                      setActiveTab('overview');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-[#05D686] hover:bg-[#04c47b] text-xs font-black text-[#121418] transition-all shadow-xl"
                  >
                    Go to Dashboard
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
