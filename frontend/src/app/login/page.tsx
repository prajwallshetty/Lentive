'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, Eye, EyeOff, Sparkles, Shield, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function LoginFormContent() {
  const { user, login, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !authLoading) {
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
    }
  }, [user, authLoading, router, searchParams]);

  // Form input validation
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email, password);
      // AuthProvider handles success toast and state update
    } catch (err: any) {
      // AuthProvider handles error toast
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill demo accounts
  const handleQuickDemoLogin = async (demoEmail: string) => {
    setLoading(true);
    setEmail(demoEmail);
    setPassword('password123');
    try {
      await login(demoEmail, 'password123');
    } catch (err: any) {
      // error handled by provider
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden font-sans">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 mb-6 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Listings
        </Link>

        {/* Auth Card */}
        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
          {/* Card Top Border Glow */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white shadow-xl shadow-accent/20 mb-3">
              <span className="text-2xl font-black tracking-tighter">L</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Welcome Back</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-[250px]">
              Rent tools, electronics, and gear hyperlocal from your community.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs sm:text-sm font-semibold text-white">
            
            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="name@example.com"
                  className={`w-full pl-11 pr-4 py-3 bg-white/5 border rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all ${
                    errors.email 
                      ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500' 
                      : 'border-white/10 focus:ring-primary focus:border-primary'
                  }`}
                />
              </div>
              {errors.email && (
                <span className="text-[10px] text-rose-400 font-medium ml-1">{errors.email}</span>
              )}
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Password</label>
                <Link 
                  href="/forgot-password" 
                  className="text-[10px] text-slate-400 hover:text-white transition font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-3 bg-white/5 border rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all ${
                    errors.password 
                      ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500' 
                      : 'border-white/10 focus:ring-primary focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-[10px] text-rose-400 font-medium ml-1">{errors.password}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-primary text-white font-extrabold rounded-2xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer group"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Log In
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Section */}
          <div className="mt-8 border-t border-white/5 pt-6">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Demo Accounts (Quick Login)
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('john@example.com')}
                className="px-2 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-[10px] font-bold text-slate-300 transition text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer"
              >
                <span className="text-accent font-extrabold">John</span>
                <span className="text-[8px] text-slate-400 font-medium truncate w-full">Host/Owner</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('sarah@example.com')}
                className="px-2 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-[10px] font-bold text-slate-300 transition text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer"
              >
                <span className="text-primary font-extrabold">Sarah</span>
                <span className="text-[8px] text-slate-400 font-medium truncate w-full">Host/Owner</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('jane@example.com')}
                className="px-2 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-[10px] font-bold text-slate-300 transition text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer"
              >
                <span className="text-emerald-400 font-extrabold">Jane</span>
                <span className="text-[8px] text-slate-400 font-medium truncate w-full">Renter</span>
              </button>
            </div>
          </div>

          {/* Footer Navigation */}
          <p className="text-center text-xs text-slate-400 mt-6 font-medium">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline font-bold">
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-semibold">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
