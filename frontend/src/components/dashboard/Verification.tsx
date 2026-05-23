'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { 
  ShieldCheck, CheckCircle2, Clock, AlertCircle, X, Upload, 
  Phone, Mail, FileText, Check, Award, AlertTriangle 
} from 'lucide-react';

export default function Verification() {
  const { user, sendPhoneOtp, verifyPhoneOtp, uploadDocument, verifyDrivingLicense } = useAuthStore();
  const { showToast } = useToast();
  
  // Phone OTP States
  const [phoneNumber, setPhoneNumber] = useState<string>(user?.phone || '');
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);

  // Upload States
  const [idDocPreview, setIdDocPreview] = useState<string>('');
  const [submittingId, setSubmittingId] = useState<boolean>(false);
  const [licensePreview, setLicensePreview] = useState<string>('');
  const [submittingLicense, setSubmittingLicense] = useState<boolean>(false);

  // Handle file preview conversion
  const handleFileConvert = (file: File, callback: (base64: string) => void) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast('Document file is too large. Under 5MB please.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // OTP Handlers
  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      showToast('Please enter a valid phone number.', 'error');
      return;
    }
    try {
      await sendPhoneOtp(phoneNumber);
      setOtpSent(true);
      showToast('Simulated SMS OTP sent! Check your backend server console logs.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send OTP.', 'error');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      showToast('Please enter the 6-digit code.', 'error');
      return;
    }
    setVerifyingOtp(true);
    try {
      await verifyPhoneOtp(otpCode);
      showToast('Phone number verified successfully!', 'success');
      setOtpSent(false);
      setOtpCode('');
    } catch (err: any) {
      showToast(err.message || 'OTP verification failed.', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ID Upload Handler
  const handleIdUpload = async () => {
    if (!idDocPreview) return;
    setSubmittingId(true);
    try {
      await uploadDocument(idDocPreview);
      showToast('Identity document submitted successfully for admin review.', 'success');
      setIdDocPreview('');
    } catch (err: any) {
      showToast(err.message || 'Upload failed.', 'error');
    } finally {
      setSubmittingId(false);
    }
  };

  // Driving License Upload Handler
  const handleLicenseUpload = async () => {
    if (!licensePreview) return;
    setSubmittingLicense(true);
    try {
      await verifyDrivingLicense(licensePreview);
      showToast('Driving license submitted successfully for admin review.', 'success');
      setLicensePreview('');
    } catch (err: any) {
      showToast(err.message || 'Upload failed.', 'error');
    } finally {
      setSubmittingLicense(false);
    }
  };

  // Verification Level badges config
  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'Trusted User':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25';
      case 'ID Verified':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25';
      case 'Basic Verified':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25';
      default:
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/25';
    }
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm flex flex-col gap-5">
      
      {/* Header & Badges */}
      <div className="border-b border-border/40 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <ShieldCheck className="h-4.5 w-4.5 text-primary shrink-0" />
          Trust & Safety Center
        </h3>
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${getLevelStyles(user?.verificationLevel || 'none')}`}>
          {user?.verificationLevel === 'none' ? 'Unverified' : user?.verificationLevel}
        </span>
      </div>

      {/* Trust Level Details Card */}
      <div className="bg-muted/30 dark:bg-black/10 rounded-xl p-3.5 border border-border/20 text-[10px] leading-relaxed flex flex-col gap-2 font-medium">
        <p className="font-extrabold text-foreground flex items-center gap-1">
          <Award className="h-4 w-4 text-amber-500" />
          Marketplace Trust Standards
        </p>
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">1. Basic Verification (Email + Phone)</span>
            {user?.isVerified && user?.isPhoneVerified ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <span className="text-amber-500">Pending</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">2. ID Identity Check (Govt. Photo ID)</span>
            {user?.verificationStatus === 'approved' ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : user?.verificationStatus === 'pending' ? (
              <span className="text-amber-500">In Review</span>
            ) : (
              <span className="text-muted-foreground">Locked</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">3. Vehicle Escrow License (Driving License)</span>
            {user?.drivingLicenseStatus === 'approved' ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : user?.drivingLicenseStatus === 'pending' ? (
              <span className="text-amber-500">In Review</span>
            ) : (
              <span className="text-muted-foreground">Locked</span>
            )}
          </div>
        </div>
      </div>

      {/* Step 1: Email and Phone OTP verification */}
      {(!user?.isVerified || !user?.isPhoneVerified) && (
        <div className="flex flex-col gap-3 p-3.5 border border-blue-500/25 bg-blue-500/5 rounded-xl text-xs">
          <h4 className="font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <Phone className="h-4 w-4" />
            Step 1: Contact Verification
          </h4>
          
          {/* Email verified indicator */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground bg-card p-2 rounded-lg border border-border/20">
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-primary" /> Email Status</span>
            <span>{user?.isVerified ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">Verified</span> : <span className="text-rose-600">Check Inbox</span>}</span>
          </div>

          {/* Phone verification form */}
          {!user?.isPhoneVerified && (
            <div className="flex flex-col gap-2.5 mt-1">
              {!otpSent ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Enter Phone Number</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="+91 99999 99999" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-grow p-2 text-xs border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground bg-card"
                    />
                    <button 
                      type="button" 
                      onClick={handleSendOtp}
                      className="px-3 bg-primary hover:brightness-110 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
                    >
                      Send OTP
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Enter 6-Digit OTP</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit code" 
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="flex-grow p-2 text-xs border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground bg-card text-center tracking-widest font-black"
                    />
                    <button 
                      type="button" 
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp}
                      className="px-3 bg-primary hover:brightness-110 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-50"
                    >
                      {verifyingOtp ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-[9px] text-muted-foreground hover:text-foreground text-left mt-0.5 font-bold transition hover:underline"
                  >
                    Change Phone Number
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2: ID Identity check */}
      {user?.isVerified && user?.isPhoneVerified && (
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-primary" />
            Step 2: Identity Document Check
          </h4>

          {user?.verificationStatus === 'approved' ? (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <div className="text-[10px]">
                <p className="font-extrabold text-emerald-600 dark:text-emerald-400">ID Document Approved</p>
                <p className="text-muted-foreground mt-0.5">Your official government-issued ID has been verified.</p>
              </div>
            </div>
          ) : user?.verificationStatus === 'pending' ? (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Clock className="h-5 w-5 text-amber-500 shrink-0 animate-pulse" />
              <div className="text-[10px]">
                <p className="font-extrabold text-amber-600 dark:text-amber-400">ID Verification Pending</p>
                <p className="text-muted-foreground mt-0.5">Admin is currently auditing your ID. Please wait.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {user?.verificationStatus === 'rejected' && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-600 dark:text-rose-400 leading-relaxed font-semibold">
                  <p className="font-extrabold flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> Identity Rejected</p>
                  <p className="mt-1">Remarks: {user.verificationRemarks || 'Please upload a clear, legible photo ID.'}</p>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">Upload Aadhaar, PAN, Passport, or Voter ID.</p>
              
              {idDocPreview ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border/40 bg-muted">
                  <img src={idDocPreview} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setIdDocPreview('')}
                    className="absolute top-2 right-2 p-1 bg-black/70 hover:bg-black/90 text-white rounded-full transition cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border border-dashed border-border/50 rounded-xl p-4 bg-muted/20 hover:bg-muted/40 cursor-pointer transition duration-200">
                  <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Upload Govt Photo ID</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileConvert(file, setIdDocPreview);
                    }}
                  />
                </label>
              )}
              
              {idDocPreview && (
                <button
                  type="button"
                  onClick={handleIdUpload}
                  disabled={submittingId}
                  className="w-full py-2 bg-primary hover:brightness-110 text-white text-[10px] font-extrabold uppercase rounded-xl disabled:opacity-50 transition cursor-pointer"
                >
                  {submittingId ? 'Uploading ID...' : 'Submit ID Verification'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Driving license upload for vehicle categories */}
      {user?.isVerified && user?.isPhoneVerified && user?.verificationStatus === 'approved' && (
        <div className="flex flex-col gap-3 border-t border-border/40 pt-4">
          <h4 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-purple-500" />
            Step 3: Escrow Driver License Verification
          </h4>
          
          <div className="flex items-start gap-2 bg-purple-500/5 border border-purple-500/15 p-3 rounded-xl text-[10px] text-purple-700 dark:text-purple-300 font-semibold leading-relaxed">
            <AlertTriangle className="h-4 w-4 shrink-0 text-purple-500 mt-0.5" />
            <span>Required if you plan to rent vehicles or motorbikes. Approved licenses grant you the <b>Trusted User</b> marketplace tier.</span>
          </div>

          {user?.drivingLicenseStatus === 'approved' ? (
            <div className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <CheckCircle2 className="h-5 w-5 text-purple-500 shrink-0" />
              <div className="text-[10px]">
                <p className="font-extrabold text-purple-600 dark:text-purple-400">Driving License Verified</p>
                <p className="text-muted-foreground mt-0.5">Escrow tier updated. You can now rent vehicles.</p>
              </div>
            </div>
          ) : user?.drivingLicenseStatus === 'pending' ? (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Clock className="h-5 w-5 text-amber-500 shrink-0 animate-pulse" />
              <div className="text-[10px]">
                <p className="font-extrabold text-amber-600 dark:text-amber-400">Auditing Driving License</p>
                <p className="text-muted-foreground mt-0.5">Admin is verifying your vehicle permit. Please wait.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {user?.drivingLicenseStatus === 'rejected' && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-600 dark:text-rose-400 leading-relaxed font-semibold">
                  <p className="font-extrabold flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> License Rejected</p>
                  <p className="mt-1">Remarks: {user.drivingLicenseRemarks || 'Please upload a clear driving permit.'}</p>
                </div>
              )}
              
              {licensePreview ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border/40 bg-muted">
                  <img src={licensePreview} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setLicensePreview('')}
                    className="absolute top-2 right-2 p-1 bg-black/70 hover:bg-black/90 text-white rounded-full transition cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border border-dashed border-border/50 rounded-xl p-4 bg-muted/20 hover:bg-muted/40 cursor-pointer transition duration-200">
                  <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Upload Driver Permit</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileConvert(file, setLicensePreview);
                    }}
                  />
                </label>
              )}
              
              {licensePreview && (
                <button
                  type="button"
                  onClick={handleLicenseUpload}
                  disabled={submittingLicense}
                  className="w-full py-2 bg-primary hover:brightness-110 text-white text-[10px] font-extrabold uppercase rounded-xl disabled:opacity-50 transition cursor-pointer"
                >
                  {submittingLicense ? 'Uploading License...' : 'Submit Driving License'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
