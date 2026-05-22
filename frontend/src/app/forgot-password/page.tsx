'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowLeft, Loader2, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [simulatedLink, setSimulatedLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required');
      return;
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setIsSent(true);
      if (res && res.simulatedLink) {
        const urlObj = new URL(res.simulatedLink);
        setSimulatedLink(`${urlObj.pathname}${urlObj.search}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset request.');
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
          href="/login" 
          className="inline-flex items-center gap-2 mb-6 text-xs sm:text-sm font-semibold text-emerald-300/60 hover:text-emerald-200 transition group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        {/* Card */}
        <div className="rounded-3xl auth-card p-8 relative overflow-hidden">
          <div className="auth-glow-line" />
          
          {!isSent ? (
            <>
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="logo-mark mb-4">
                  L
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white">Reset Password</h1>
                <p className="text-xs text-emerald-200/40 mt-1.5 max-w-[260px] leading-relaxed">
                  Enter your email and we&apos;ll send you a link to reset your password.
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
                        if (error) setError('');
                      }}
                      placeholder="name@example.com"
                      className={`auth-input ${error ? 'auth-input-error' : ''}`}
                    />
                  </div>
                  {error && (
                    <span className="text-[10px] text-rose-400 font-medium ml-1">{error}</span>
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
                      Sending reset link...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center text-center py-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 animate-bounce" />
              </div>
              <h2 className="text-xl font-extrabold text-white">Reset Link Sent</h2>
              <p className="text-xs text-emerald-200/40 mt-2 max-w-[280px] leading-relaxed">
                If an account exists for <span className="text-white font-bold">{email}</span>, we&apos;ve sent instructions to reset your password.
              </p>

              {/* Dev Simulation Bypass Link */}
              {simulatedLink && (
                <div className="mt-6 w-full p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300/60">Simulated Outbox</span>
                  </div>
                  <p className="text-[10px] text-emerald-300/40 leading-normal mb-3">
                    SMTP is not configured. We logged the token to the terminal, or you can bypass below:
                  </p>
                  <Link
                    href={simulatedLink}
                    className="auth-btn-primary !py-2.5 !text-xs"
                  >
                    Open Reset Password Form
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="mt-6 py-2.5 px-5 bg-emerald-500/5 hover:bg-emerald-500/10 text-white border border-emerald-500/10 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Login
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
