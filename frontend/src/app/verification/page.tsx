'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { 
  ShieldCheck, CheckCircle2, Clock, AlertCircle, X, 
  Upload, ArrowLeft, Loader2, Award, ShieldAlert 
} from 'lucide-react';

export default function VerificationPage() {
  const router = useRouter();
  const { user, uploadDocument, loading: authLoading } = useAuthStore();
  const { showToast } = useToast();
  
  const [verifyingDoc, setVerifyingDoc] = useState<string>('');
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);

  const handleDocFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast('Document file is too large. Under 5MB please.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setVerifyingDoc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitVerification = async () => {
    if (!verifyingDoc) return;
    setUploadingDoc(true);
    try {
      await uploadDocument(verifyingDoc);
      showToast('Identity document submitted successfully for admin review.', 'success');
      setVerifyingDoc('');
    } catch (err: any) {
      showToast(err.message || 'Upload failed.', 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Loading verification portal...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 gap-4 max-w-md mx-auto">
        <div className="h-16 w-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-foreground">Sign in to verify ID</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Verification unlocks high-value rental tools, electronics, and verifies you to neighboring lenders.
        </p>
        <Link
          href="/login?redirect=/verification"
          className="w-full py-3 bg-primary hover:brightness-110 text-white font-extrabold rounded-xl transition-all duration-200 shadow-md shadow-primary/20 text-xs tracking-wide active:scale-95 cursor-pointer block text-center"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const isVerified = user.isVerified || user.verificationStatus === 'approved';
  const isPending = user.verificationStatus === 'pending';

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      
      {/* Back button */}
      <Link 
        href="/profile" 
        className="flex items-center gap-1.5 text-xs font-extrabold text-muted-foreground hover:text-foreground w-fit transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Profile
      </Link>

      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Trust & Identity Verification
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
          Build community trust by verifying your government credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Left sidebar - why verify */}
        <div className="sm:col-span-1 flex flex-col gap-4">
          <div className="rounded-2xl border border-border/30 bg-card p-4 flex flex-col gap-3 shadow-xs">
            <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Benefits</h3>
            <ul className="flex flex-col gap-2.5 text-[10px] font-semibold text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Rent items over ₹5,000 value</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Golden Trust Badge on your profile</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>3x faster booking confirmations</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right main panel - upload form */}
        <div className="sm:col-span-2">
          <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm flex flex-col gap-5">
            
            {isVerified ? (
              <div className="flex flex-col items-center text-center py-6 px-4 gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl animate-fadeIn">
                <div className="h-14 w-14 rounded-full bg-emerald-500 flex items-center justify-center text-white border border-emerald-600 shadow-md shadow-emerald-500/20">
                  <Award className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-base font-black text-emerald-800 dark:text-emerald-300">Identity Fully Verified</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 max-w-xs font-semibold">
                    Congratulations! Your government credentials have been approved. You have full access to high-value rentals and lending programs.
                  </p>
                </div>
              </div>
            ) : isPending ? (
              <div className="flex flex-col items-center text-center py-6 px-4 gap-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl animate-pulse">
                <div className="h-14 w-14 rounded-full bg-amber-500 flex items-center justify-center text-white border border-amber-600 shadow-md shadow-amber-500/20">
                  <Clock className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-base font-black text-amber-800 dark:text-amber-300">Credentials Review Pending</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 max-w-xs font-semibold">
                    We have received your document photo. Our verification team will review your details within 12-24 hours. We will send an alert as soon as it is approved.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                
                {user.verificationStatus === 'rejected' && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[11px] text-rose-600 dark:text-rose-400 leading-relaxed font-semibold">
                    <p className="font-extrabold flex items-center gap-1.5">
                      <ShieldAlert className="h-4.5 w-4.5" />
                      Verification Rejected
                    </p>
                    <p className="mt-1 font-medium leading-relaxed">
                      Remarks: {user.verificationRemarks || 'The photo submitted was unclear. Please upload a high-resolution, glare-free picture.'}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Upload Identification Doc</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 font-semibold">
                    Please upload a clean, uncropped photo of a government-issued identification card (Aadhaar, Driving License, Passport, or PAN card). Make sure text is readable and the photo is well lit.
                  </p>
                </div>

                <div className="flex flex-col gap-3 mt-1 text-xs font-semibold">
                  {verifyingDoc ? (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border/40 bg-muted">
                      <img src={verifyingDoc} alt="Document Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setVerifyingDoc('')}
                        className="absolute top-3 right-3 p-2 bg-black/75 hover:bg-black/90 text-white rounded-full transition cursor-pointer active:scale-90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-2xl p-8 bg-muted/20 hover:bg-muted/40 cursor-pointer transition duration-300">
                      <Upload className="h-8 w-8 text-primary mb-2" />
                      <span className="text-xs font-extrabold text-foreground uppercase tracking-wide">Upload Photo ID</span>
                      <span className="text-[9px] text-muted-foreground/60 mt-1 font-semibold">JPEG, PNG format under 5 megabytes</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDocFile(file);
                        }}
                      />
                    </label>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleSubmitVerification}
                    disabled={!verifyingDoc || uploadingDoc}
                    className="w-full py-3 bg-primary text-white font-extrabold rounded-xl hover:brightness-110 disabled:opacity-50 transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 text-xs active:scale-98 mt-2"
                  >
                    {uploadingDoc && <Loader2 className="h-4 w-4 animate-spin" />}
                    {uploadingDoc ? 'Uploading...' : 'Submit Credentials for Approval'}
                  </button>
                </div>

              </div>
            )}
            
          </div>
        </div>

      </div>

    </div>
  );
}
