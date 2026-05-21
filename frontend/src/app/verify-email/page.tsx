'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, ShieldAlert, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const { verifyEmail } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
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
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden font-sans">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

      {/* Main Card Container */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
          {/* Card Top Border Glow */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {status === 'verifying' && (
            <div className="flex flex-col items-center text-center py-6 text-white">
              <Loader2 className="h-14 w-14 animate-spin text-primary mb-4" />
              <h2 className="text-xl font-extrabold">Verifying Email Address</h2>
              <p className="text-xs text-slate-400 mt-2 max-w-[250px] leading-relaxed">
                We are validating your verification token with our servers. Please wait...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center text-center py-4 text-white">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4 animate-bounce" />
              <h2 className="text-xl font-extrabold">Email Verified!</h2>
              <p className="text-xs text-slate-400 mt-2 max-w-[280px] leading-relaxed">
                Thank you! Your email address has been successfully verified. You can now use all the features of Lentive.
              </p>
              <Link
                href="/"
                className="w-full mt-6 py-3 bg-primary text-white font-extrabold rounded-2xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 text-xs flex items-center justify-center gap-2"
              >
                Go to Homepage
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center text-center py-4 text-white">
              <ShieldAlert className="h-16 w-16 text-rose-500 mb-4 animate-pulse" />
              <h2 className="text-xl font-extrabold text-rose-400">Verification Failed</h2>
              <p className="text-xs text-slate-400 mt-2 max-w-[280px] leading-relaxed">
                {errorMessage}
              </p>
              
              <Link
                href="/"
                className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-semibold">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
