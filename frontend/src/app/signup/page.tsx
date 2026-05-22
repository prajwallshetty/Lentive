'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft, Package, Megaphone } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const { user, signup, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'renter' | 'owner'>('renter');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Weak', color: 'bg-rose-500' });

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/');
    }
  }, [user, authLoading, router]);

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

  // Form validation
  const validateForm = () => {
    const newErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

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

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signup({
        name,
        email,
        password,
        role
      });
    } catch (err: any) {
      // AuthProvider handles error toast
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
      <div className="w-full max-w-md relative z-10 animate-fadeInUp py-6">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 mb-4 text-xs sm:text-sm font-semibold text-emerald-300/60 hover:text-emerald-200 transition group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Listings
        </Link>

        {/* Auth Card */}
        <div className="rounded-3xl auth-card p-8 relative overflow-hidden">
          <div className="auth-glow-line" />
          
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="logo-mark mb-4">
              L
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Create Account</h1>
            <p className="text-xs text-emerald-200/40 mt-1.5 max-w-[260px] leading-relaxed">
              Join Lentive and start sharing and renting items in your neighborhood.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Role Selector Tabs */}
            <div className="flex flex-col gap-1.5">
              <label className="auth-label">I want to</label>
              <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setRole('renter')}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-200 cursor-pointer text-center ${
                    role === 'renter' 
                      ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                      : 'hover:bg-emerald-500/5 text-emerald-300/50 hover:text-emerald-200'
                  }`}
                >
                  <Package className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-bold leading-none">Rent Gear</span>
                  <span className={`text-[8px] font-medium leading-none ${role === 'renter' ? 'text-white/70' : 'text-emerald-400/30'}`}>I need items</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-200 cursor-pointer text-center ${
                    role === 'owner' 
                      ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                      : 'hover:bg-emerald-500/5 text-emerald-300/50 hover:text-emerald-200'
                  }`}
                >
                  <Megaphone className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-bold leading-none">List & Earn</span>
                  <span className={`text-[8px] font-medium leading-none ${role === 'owner' ? 'text-white/70' : 'text-emerald-400/30'}`}>I have items</span>
                </button>
              </div>
            </div>

            {/* Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="auth-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400/40" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  placeholder="John Doe"
                  className={`auth-input ${errors.name ? 'auth-input-error' : ''}`}
                />
              </div>
              {errors.name && (
                <span className="text-[10px] text-rose-400 font-medium ml-1">{errors.name}</span>
              )}
            </div>

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
              <label className="auth-label">Password</label>
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
              {/* Password Strength Meter */}
              {password && (
                <div className="flex flex-col gap-1 mt-1 ml-1">
                  <div className="flex justify-between items-center text-[9px] text-emerald-300/40">
                    <span>Password Strength</span>
                    <span className="font-bold">{passwordStrength.label}</span>
                  </div>
                  <div className="h-1 w-full bg-emerald-500/10 rounded-full overflow-hidden flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-full flex-1 rounded-full transition ${
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
              <label className="auth-label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400/40" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder="••••••••"
                  className={`auth-input ${errors.confirmPassword ? 'auth-input-error' : ''}`}
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
              className="auth-btn-primary mt-2 group"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <p className="text-center text-xs text-emerald-300/40 mt-6 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 hover:underline font-bold transition">
              Log in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
