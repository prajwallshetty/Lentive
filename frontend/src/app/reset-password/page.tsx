'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Lock, Eye, EyeOff, Sparkles, ArrowRight, Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordFormContent() {
  const { resetPassword } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Weak', color: 'bg-rose-500' });

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: 'Weak', color: 'bg-rose-500' });
      return;
    }

    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let label = 'Weak';
    let color = 'bg-rose-500';

    if (score >= 4) {
      label = 'Strong';
      color = 'bg-emerald-500';
    } else if (score >= 2) {
      label = 'Medium';
      color = 'bg-amber-500';
    }

    setPasswordStrength({ score, label, color });
  }, [password]);

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast('No reset token found in URL. Please check the email link again.', 'error');
      return;
    }
    if (!validateForm()) return;

    setLoading(true);
    try {
      await resetPassword(token, { password });
      router.push('/');
    } catch (err: any) {
      // error is handled by AuthProvider toast
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
          href="/login" 
          className="inline-flex items-center gap-2 mb-6 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
          {/* Card Top Border Glow */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          {!token ? (
            <div className="flex flex-col items-center text-center py-4">
              <ShieldAlert className="h-16 w-16 text-rose-500 mb-4 animate-pulse" />
              <h2 className="text-xl font-extrabold text-white">Invalid Reset Link</h2>
              <p className="text-xs text-slate-400 mt-2 max-w-[280px] leading-relaxed">
                The password reset token is missing from the URL. Please click the reset link directly from the email or request a new one.
              </p>
              <Link
                href="/forgot-password"
                className="w-full mt-6 py-3 bg-primary text-white font-extrabold rounded-2xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 text-xs flex items-center justify-center gap-2"
              >
                Request New Link
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white shadow-xl shadow-accent/20 mb-3">
                  <span className="text-2xl font-black tracking-tighter">L</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white">Set New Password</h1>
                <p className="text-xs text-slate-400 mt-1 max-w-[250px]">
                  Please enter and confirm your new password below.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs sm:text-sm font-semibold text-white">
                
                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">New Password</label>
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
                  {/* Password Strength Meter */}
                  {password && (
                    <div className="flex flex-col gap-1 mt-1 ml-1">
                      <div className="flex justify-between items-center text-[9px] text-slate-400">
                        <span>Password Strength</span>
                        <span className="font-bold">{passwordStrength.label}</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-full flex-1 transition ${
                              i < passwordStrength.score ? passwordStrength.color : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <span className="text-[10px] text-rose-400 font-medium ml-1">{errors.password}</span>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-11 pr-4 py-3 bg-white/5 border rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all ${
                        errors.confirmPassword 
                          ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500' 
                          : 'border-white/10 focus:ring-primary focus:border-primary'
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-[10px] text-rose-400 font-medium ml-1">{errors.confirmPassword}</span>
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
                      Saving password...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-semibold">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordFormContent />
    </Suspense>
  );
}
