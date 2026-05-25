'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft, Package, Megaphone } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

export default function SignupPage() {
  const { user, signup, googleLogin, loading: authLoading } = useAuth();
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

  // Initialize Google Identity Services
  useEffect(() => {
    const handleGoogleCredentialResponse = async (response: any) => {
      setLoading(true);
      try {
        await googleLogin(response.credential);
        router.push('/');
      } catch (err) {
        // Handled by AuthContext
      } finally {
        setLoading(false);
      }
    };

    const initGoogle = () => {
      if (typeof window !== 'undefined' && window.google) {
        window.google.accounts.id.initialize({
          client_id: '641838109536-ocmplusnchf4ba86omme0u9d2kolnci2.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signup-btn'),
          { theme: 'outline', size: 'large', width: 380, shape: 'pill' }
        );
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      window.onGoogleLibraryLoad = initGoogle;
    }
  }, [googleLogin, router]);

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
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive"
        onLoad={() => {
          if (window.onGoogleLibraryLoad) window.onGoogleLibraryLoad();
        }}
      />
      {/* Animated Emerald Orbs */}
      <div className="auth-orb-1" />
      <div className="auth-orb-2" />
      <div className="auth-orb-3" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 animate-fadeInUp py-6">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 mb-4 text-xs sm:text-sm font-semibold text-primary/70 hover:text-primary transition group"
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
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Create Account</h1>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-[260px] leading-relaxed">
              Join Lentive and start sharing and renting items in your neighborhood.
            </p>
          </div>


          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Role Selector Tabs */}
            <div className="flex flex-col gap-1.5">
              <label className="auth-label">I want to</label>
              <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-primary/5 border border-primary/10 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setRole('renter')}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-200 cursor-pointer text-center ${
                    role === 'renter' 
                      ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                      : 'hover:bg-primary/5 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Package className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-bold leading-none">Rent Gear</span>
                  <span className={`text-[8px] font-medium leading-none ${role === 'renter' ? 'text-white/70' : 'text-muted-foreground/60'}`}>I need items</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-200 cursor-pointer text-center ${
                    role === 'owner' 
                      ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                      : 'hover:bg-primary/5 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Megaphone className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-bold leading-none">List & Earn</span>
                  <span className={`text-[8px] font-medium leading-none ${role === 'owner' ? 'text-white/70' : 'text-muted-foreground/60'}`}>I have items</span>
                </button>
              </div>
            </div>

            {/* Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="auth-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
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
                <span className="text-[10px] text-rose-500 font-medium ml-1">{errors.name}</span>
              )}
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="auth-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
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
                <span className="text-[10px] text-rose-500 font-medium ml-1">{errors.email}</span>
              )}
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <label className="auth-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-primary transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password Strength Meter */}
              {password && (
                <div className="flex flex-col gap-1 mt-1 ml-1">
                  <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                    <span>Password Strength</span>
                    <span className="font-bold">{passwordStrength.label}</span>
                  </div>
                  <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden flex gap-0.5">
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
                <span className="text-[10px] text-rose-550 font-medium ml-1">{errors.password}</span>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="flex flex-col gap-1.5">
              <label className="auth-label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
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
                <span className="text-[10px] text-rose-500 font-medium ml-1">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary mt-2 group text-xs font-black uppercase tracking-wider"
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

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-border/40" />
            <span className="text-[9px] text-muted-foreground/60 px-3 uppercase tracking-wider font-extrabold">or connect with</span>
            <div className="flex-grow border-t border-border/40" />
          </div>

          {/* Google Sign-in button */}
          <div className="relative w-full max-w-[380px] mx-auto min-h-[46px] group cursor-pointer">
            {/* Custom styled mock button underneath */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 px-5 py-3 border border-border/80 group-hover:border-primary/30 bg-white group-hover:bg-[#f8faf9] text-xs font-black uppercase tracking-wider text-foreground rounded-2xl transition active:scale-95 shadow-sm min-h-[46px] pointer-events-none select-none">
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Continue with Google</span>
            </div>
            
            {/* Real Google GIS button overlayed on top but completely transparent */}
            <div id="google-signup-btn" className="opacity-0 absolute inset-0 z-10 w-full h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:cursor-pointer cursor-pointer" />
          </div>

          {/* Footer Navigation */}

          <p className="text-center text-xs text-muted-foreground mt-6 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 hover:underline font-bold transition">
              Log in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

