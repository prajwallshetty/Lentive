'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowLeft, Loader2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { user, forgotPassword, loading: authLoading } = useAuth();
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
        // Strip the localhost:3000 parts if redirecting internally
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
          
          {!isSent ? (
            <>
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white shadow-xl shadow-accent/20 mb-3">
                  <span className="text-2xl font-black tracking-tighter">L</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white">Reset Password</h1>
                <p className="text-xs text-slate-400 mt-1 max-w-[250px]">
                  Enter your email address and we'll send you a link to reset your password.
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
                        if (error) setError('');
                      }}
                      placeholder="name@example.com"
                      className={`w-full pl-11 pr-4 py-3 bg-white/5 border rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all ${
                        error 
                          ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500' 
                          : 'border-white/10 focus:ring-primary focus:border-primary'
                      }`}
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
                  className="w-full mt-2 py-3 bg-primary text-white font-extrabold rounded-2xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer group"
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
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4 animate-bounce" />
              <h2 className="text-xl font-extrabold text-white">Reset Link Sent</h2>
              <p className="text-xs text-slate-400 mt-2 max-w-[280px] leading-relaxed">
                If an account exists for <span className="text-white font-bold">{email}</span>, we've sent instructions on how to reset your password.
              </p>

              {/* Dev Simulation Bypass Link */}
              {simulatedLink && (
                <div className="mt-6 w-full p-4 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col items-center">
                  <div className="flex items-center gap-1.5 mb-2 text-primary">
                    <Sparkles className="h-4 w-4 text-accent fill-accent" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Simulated Outbox</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal mb-3">
                    SMTP is not configured. We logged the password reset token to the terminal console, or you can bypass email checking below:
                  </p>
                  <Link
                    href={simulatedLink}
                    className="w-full py-2.5 bg-accent hover:bg-accent/95 text-white font-bold rounded-xl text-xs transition shadow-md shadow-accent/15 flex items-center justify-center gap-1"
                  >
                    Open Reset Password Form
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="mt-6 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
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
