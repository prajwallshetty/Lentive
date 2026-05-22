'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft, Zap } from 'lucide-react';
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
    <div className="min-h-screen relative flex items-center justify-center p-4 auth-gradient overflow-hidden font-sans">
      {/* Animated Emerald Orbs */}
      <div className="auth-orb-1" />
      <div className="auth-orb-2" />
      <div className="auth-orb-3" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 animate-fadeInUp">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 mb-6 text-xs sm:text-sm font-semibold text-emerald-300/60 hover:text-emerald-200 transition group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Listings
        </Link>

        {/* Auth Card */}
        <div className="rounded-3xl auth-card p-8 relative overflow-hidden">
          <div className="auth-glow-line" />
          
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="logo-mark mb-4">
              L
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Welcome Back</h1>
            <p className="text-xs text-emerald-200/40 mt-1.5 max-w-[260px] leading-relaxed">
              Sign in to rent tools, electronics, and gear from your community.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="auth-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="name@example.com"
                  className={`auth-input ${errors.email ? 'auth-input-error' : ''}`}
                />
              </div>
              {errors.email && (
                <span className="text-[10px] text-rose-400 font-medium ml-1">{errors.email}</span>
              )}
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="auth-label">Password</label>
                <Link 
                  href="/forgot-password" 
                  className="text-[10px] text-emerald-400/50 hover:text-emerald-300 transition font-semibold"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  className={`auth-input !pr-12 ${errors.password ? 'auth-input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400/40 hover:text-emerald-300 transition"
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
              className="auth-btn-primary mt-2 group"
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
          <div className="mt-8 border-t border-emerald-500/10 pt-6">
            <div className="flex items-center gap-1.5 mb-3">
              <Zap className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300/50">
                Quick Demo Login
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'John', email: 'john@example.com', role: 'Host' },
                { name: 'Sarah', email: 'sarah@example.com', role: 'Host' },
                { name: 'Jane', email: 'jane@example.com', role: 'Renter' },
              ].map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleQuickDemoLogin(demo.email)}
                  className="px-2 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/20 text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all duration-200 active:scale-95"
                >
                  <span className="text-xs font-bold text-emerald-300">{demo.name}</span>
                  <span className="text-[8px] text-emerald-400/40 font-medium">{demo.role}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Navigation */}
          <p className="text-center text-xs text-emerald-300/40 mt-6 font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 hover:underline font-bold transition">
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
      <div className="min-h-screen flex items-center justify-center auth-gradient">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
