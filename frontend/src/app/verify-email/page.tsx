'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, ShieldAlert, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const { verifyEmail } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const executeVerification = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Verification token is missing from the URL.');
        return;
      }

      try {
        await verifyEmail(token);
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'The verification link is invalid or has expired.');
      }
    };

    executeVerification();
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 auth-gradient overflow-hidden font-sans">
      {/* Animated Emerald Orbs */}
      <div className="auth-orb-1" />
      <div className="auth-orb-2" />
      <div className="auth-orb-3" />

      {/* Main Card Container */}
      <div className="w-full max-w-md relative z-10 animate-fadeInUp">
        <div className="rounded-3xl auth-card p-8 relative overflow-hidden">
          <div className="auth-glow-line" />

          {status === 'verifying' && (
            <div className="flex flex-col items-center text-center py-8">
              <Loader2 className="h-14 w-14 animate-spin text-emerald-400 mb-5" />
              <h2 className="text-xl font-extrabold text-white">Verifying Email</h2>
              <p className="text-xs text-emerald-200/40 mt-2 max-w-[250px] leading-relaxed">
                Validating your verification token with our servers. Please wait...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center text-center py-6">
              <div className="h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 animate-bounce" />
              </div>
              <h2 className="text-xl font-extrabold text-white">Email Verified!</h2>
              <p className="text-xs text-emerald-200/40 mt-2 max-w-[280px] leading-relaxed">
                Your email has been successfully verified. You can now use all features of Lentive.
              </p>
              <Link
                href="/"
                className="auth-btn-primary mt-6 group"
              >
                Go to Homepage
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center text-center py-6">
              <div className="h-20 w-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5">
                <ShieldAlert className="h-10 w-10 text-rose-400 animate-pulse" />
              </div>
              <h2 className="text-xl font-extrabold text-rose-300">Verification Failed</h2>
              <p className="text-xs text-emerald-200/40 mt-2 max-w-[280px] leading-relaxed">
                {errorMessage}
              </p>
              
              <Link
                href="/"
                className="mt-6 py-2.5 px-5 bg-emerald-500/5 hover:bg-emerald-500/10 text-white border border-emerald-500/10 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go to Homepage
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center auth-gradient">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
