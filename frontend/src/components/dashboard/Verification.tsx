'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, CheckCircle2, Clock, AlertCircle, X, Upload } from 'lucide-react';

export default function Verification() {
  const { user, uploadDocument } = useAuthStore();
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

  return (
    <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
      <h3 className="text-sm font-extrabold text-foreground border-b border-border/40 pb-3 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
        <ShieldCheck className="h-4.5 w-4.5 text-primary shrink-0" />
        ID Verification
      </h3>
      
      {user?.verificationStatus === 'approved' ? (
        <div className="flex flex-col items-center text-center p-4 gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Identity Fully Verified</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
            You are a verified member! You can now freely rent and list items on the platform.
          </p>
        </div>
      ) : user?.verificationStatus === 'pending' ? (
        <div className="flex flex-col items-center text-center p-4 gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <Clock className="h-10 w-10 text-amber-500 animate-pulse" />
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Verification Pending</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
            Your identity document has been uploaded and is currently undergoing admin review.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {user?.verificationStatus === 'rejected' && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-600 dark:text-rose-400 leading-relaxed font-semibold">
              <p className="font-extrabold flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> Verification Rejected</p>
              <p className="mt-1">Remarks: {user.verificationRemarks || 'Invalid document. Please upload a clear photo ID.'}</p>
            </div>
          )}
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Please upload a clear government-issued photo ID (Aadhaar, PAN, Driver\'s License, or Passport) to verify your identity.
          </p>
          
          <div className="flex flex-col gap-2 mt-1">
            {verifyingDoc ? (
              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border/40 bg-muted">
                <img src={verifyingDoc} alt="Preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setVerifyingDoc('')}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full transition cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border border-dashed border-border/50 rounded-xl p-4 bg-muted/20 hover:bg-muted/40 cursor-pointer transition duration-200">
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Upload Photo ID</span>
                <span className="text-[8px] text-muted-foreground/60 mt-0.5">JPEG, PNG up to 5MB</span>
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
              className="w-full py-2 bg-primary hover:brightness-110 text-white text-xs font-bold rounded-xl disabled:opacity-50 transition cursor-pointer"
            >
              {uploadingDoc ? 'Submitting...' : 'Submit Verification'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
