import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Lock,
  Mail,
  User,
  ArrowRight,
  Shield,
  Briefcase,
  UserCheck,
  CheckCircle2,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { UserRole } from '../../types';

export const AuthPage: React.FC = () => {
  const { login, register, sendPasswordReset } = useHR();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('employee');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Login with:', loginIdentifier, loginPassword);
    await login(loginIdentifier, loginPassword);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regUsername || !regPassword) {
      alert('Please fill in all fields including password');
      return;
    }
    console.log('📝 Register with:', regName, regEmail, regUsername, regRole, regPassword);
    await register(regName, regEmail, regUsername, regRole, regPassword);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    await sendPasswordReset(forgotEmail);
    setForgotSubmitted(true);
  };

  const quickDemoLogin = (email: string) => {
    console.log('⚡ Quick login with:', email);
    setLoginIdentifier(email);
    login(email, 'admin123');
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center p-3.5 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-zinc-900/50 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-6 sm:mb-8 relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#F16E15] via-amber-500 to-orange-400 text-white font-black text-2xl shadow-lg shadow-orange-500/20 mb-3 border border-orange-400/20">
          <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Nexus<span className="text-[#F16E15]">HR</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-sm px-2">
          Next-Generation Enterprise Workforce & Human Resource Cloud
        </p>
      </div>

      {/* Main Authentication Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-[#121215] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        {/* Top Mode Header / Tabs */}
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {authMode === 'login' && 'Welcome Back'}
                {authMode === 'register' && 'Create Account'}
                {authMode === 'forgot' && 'Reset Password'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {authMode === 'login' && 'Sign in to access your enterprise dashboard'}
                {authMode === 'register' && 'Enter your company credentials to join'}
                {authMode === 'forgot' && 'Enter your email to receive recovery instructions'}
              </p>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
              JWT v2.4
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8">
          <AnimatePresence mode="wait">
            {/* LOGIN VIEW */}
            {authMode === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                {/* Email / Username Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Work Email or Username</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="admin@nexushr.io"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full bg-[#18181c] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#F16E15] focus:ring-2 focus:ring-[#F16E15]/20 transition-all min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot')}
                      className="text-xs text-[#F16E15] hover:underline font-medium p-1"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-[#18181c] border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#F16E15] focus:ring-2 focus:ring-[#F16E15]/20 transition-all min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#18181c] border-zinc-700 text-[#F16E15] focus:ring-[#F16E15]"
                    />
                    <span className="text-xs text-zinc-400">Remember session (24h JWT)</span>
                  </label>
                </div>

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  id="auth-submit-btn"
                  className="w-full py-3 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-white font-bold text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer min-h-[44px]"
                >
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Demo Quick Logins Box */}
                <div className="pt-3 border-t border-zinc-800 space-y-2">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block text-center">
                    Instant Demo Profiles (1-Click)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => quickDemoLogin('admin@nexushr.io')}
                      className="p-2 rounded-xl bg-[#18181c] hover:bg-[#202026] border border-zinc-800 text-center transition-all group min-h-[44px]"
                    >
                      <Shield className="w-4 h-4 text-[#F16E15] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <div className="text-[11px] font-bold text-zinc-200">Admin</div>
                      <div className="text-[9px] text-zinc-500">CHRO</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => quickDemoLogin('hr@nexushr.io')}
                      className="p-2 rounded-xl bg-[#18181c] hover:bg-[#202026] border border-zinc-800 text-center transition-all group min-h-[44px]"
                    >
                      <Briefcase className="w-4 h-4 text-amber-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <div className="text-[11px] font-bold text-zinc-200">HR Manager</div>
                      <div className="text-[9px] text-zinc-500">Partner</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => quickDemoLogin('employee@nexushr.io')}
                      className="p-2 rounded-xl bg-[#18181c] hover:bg-[#202026] border border-zinc-800 text-center transition-all group min-h-[44px]"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <div className="text-[11px] font-bold text-zinc-200">Employee</div>
                      <div className="text-[9px] text-zinc-500">Architect</div>
                    </button>
                  </div>
                </div>

                {/* Footer Switch */}
                <div className="text-center pt-2">
                  <p className="text-xs text-zinc-400">
                    Don&apos;t have an enterprise account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-[#F16E15] font-semibold hover:underline"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </motion.form>
            )}

            {/* REGISTER VIEW */}
            {authMode === 'register' && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-3.5"
              >
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Mitchell"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-[#18181c] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Work Email</label>
                    <input
                      type="email"
                      required
                      placeholder="jordan@nexushr.io"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-[#18181c] border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Username</label>
                    <input
                      type="text"
                      required
                      placeholder="jordan.m"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full bg-[#18181c] border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Create secure password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-[#18181c] border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Select Initial Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['employee', 'hr', 'admin'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRegRole(r)}
                        className={`p-2 rounded-xl border text-xs font-semibold capitalize text-center transition-all min-h-[40px] ${
                          regRole === r
                            ? 'bg-[#F16E15] border-[#F16E15] text-white'
                            : 'bg-[#18181c] border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-white font-bold text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 mt-2 min-h-[44px]"
                >
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Already registered? <span className="text-[#F16E15] font-semibold">Sign in</span>
                  </button>
                </div>
              </motion.form>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {authMode === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {!forgotSubmitted ? (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Registered Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          placeholder="name@company.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full bg-[#18181c] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-white font-bold text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Send Recovery Link</span>
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">Instructions Dispatched</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      We have sent a secure password reset link to <strong className="text-zinc-200">{forgotEmail}</strong>. Please check your inbox.
                    </p>
                  </div>
                )}

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setForgotSubmitted(false);
                    }}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    ← Back to login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer copyright */}
      <div className="mt-8 text-center text-xs text-zinc-500 relative z-10">
        NexusHR Enterprise Platform v2.4 • SOC-2 Type II Certified
      </div>
    </div>
  );
};