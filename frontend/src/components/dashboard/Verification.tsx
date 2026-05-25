'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { 
  ShieldCheck, CheckCircle2, Clock, AlertCircle, X, Upload, 
  Phone, Mail, FileText, Check, Award, AlertTriangle, ArrowRight,
  Shield, CheckSquare, Info
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
    <div className="rounded-3xl border border-border/80 bg-white p-6 shadow-xs flex flex-col gap-5">
      
      {/* Header & Badges */}
      <div className="border-b border-border/40 pb-4 flex items-center justify-between">
        <h3 className="text-xs font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <ShieldCheck className="h-4.5 w-4.5 text-primary shrink-0" />
          Trust & Safety Center
        </h3>
        <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase border ${getLevelStyles(user?.verificationLevel || 'none')}`}>
          Tier: {user?.verificationLevel === 'none' ? 'Unverified' : user?.verificationLevel}
        </span>
      </div>

      {/* Trust Level Details Card */}
      <div className="bg-[#f8faf9] rounded-2xl p-4 border border-border/40 text-[11px] leading-relaxed flex flex-col gap-3 font-semibold">
        <p className="font-black text-foreground flex items-center gap-1.5 text-xs">
          <Award className="h-4 w-4 text-amber-500" />
          Lentive Security Credentials Status
        </p>
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center justify-between border-b border-border/20 pb-2">
            <span className="text-muted-foreground">1. Contact Verification (Email + SMS Phone)</span>
            {user?.isVerified && user?.isPhoneVerified ? (
              <span className="flex items-center gap-1 text-emerald-600 font-black uppercase text-[9px]">
                <Check className="h-3.5 w-3.5" /> Done
              </span>
            ) : (
              <span className="text-amber-600 bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10 text-[9px] uppercase tracking-wider">Pending Step 1</span>
            )}
          </div>
          <div className="flex items-center justify-between border-b border-border/20 pb-2">
            <span className="text-muted-foreground">2. ID Identity Audit (Official Photo Document)</span>
            {user?.verificationStatus === 'approved' ? (
              <span className="flex items-center gap-1 text-emerald-600 font-black uppercase text-[9px]">
                <Check className="h-3.5 w-3.5" /> Done
              </span>
            ) : user?.verificationStatus === 'pending' ? (
              <span className="text-amber-600 bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10 text-[9px] uppercase tracking-wider animate-pulse">In Review</span>
            ) : (
              <span className="text-muted-foreground/60 text-[9px] uppercase tracking-wider flex items-center gap-1">
                Locked
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">3. Vehicle Escrow Endorsement (Driving License)</span>
            {user?.drivingLicenseStatus === 'approved' ? (
              <span className="flex items-center gap-1 text-emerald-600 font-black uppercase text-[9px]">
                <Check className="h-3.5 w-3.5" /> Done
              </span>
            ) : user?.drivingLicenseStatus === 'pending' ? (
              <span className="text-amber-600 bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10 text-[9px] uppercase tracking-wider animate-pulse">In Review</span>
            ) : (
              <span className="text-muted-foreground/60 text-[9px] uppercase tracking-wider flex items-center gap-1">
                Locked
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Step 1: Email and Phone OTP verification */}
      {(!user?.isVerified || !user?.isPhoneVerified) && (
        <div className="flex flex-col gap-4 p-4 border border-blue-500/25 bg-blue-500/5 rounded-2xl text-xs">
          <h4 className="font-black text-blue-700 flex items-center gap-1.5">
            <Phone className="h-4.5 w-4.5" />
            Step 1: Contact Information Validation
          </h4>
          
          {/* Email verified indicator */}
          <div className="flex items-center justify-between text-[11px] font-black text-muted-foreground bg-white p-3 rounded-xl border border-border/40">
            <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-primary" /> Registered Email Address</span>
            <span>
              {user?.isVerified ? (
                <span className="text-emerald-600 bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10 font-black uppercase text-[9px]">Verified</span>
              ) : (
                <span className="text-rose-600 bg-rose-500/5 px-2 py-0.5 rounded-md border border-rose-500/10 font-black uppercase text-[9px] animate-pulse">Awaiting Verification Link</span>
              )}
            </span>
          </div>

          {/* Phone verification form */}
          {!user?.isPhoneVerified && (
            <div className="flex flex-col gap-3 mt-1">
              {!otpSent ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">Input Mobile Number</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="+91 99999 99999" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-grow p-2.5 text-xs border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground bg-white font-semibold"
                    />
                    <button 
                      type="button" 
                      onClick={handleSendOtp}
                      className="px-4 bg-primary hover:brightness-110 active:scale-95 text-[10px] font-black uppercase tracking-wider text-white rounded-xl transition cursor-pointer"
                    >
                      Send OTP
                    </button>
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-0.5 font-bold leading-normal">Simulated SMS: The random 6-digit OTP will be printed in your backend server logs.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2 animate-in fade-in duration-200">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">Enter 6-Digit SMS OTP</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="XXXXXX" 
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="flex-grow p-2.5 text-xs border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground bg-white text-center tracking-widest font-black"
                    />
                    <button 
                      type="button" 
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp}
                      className="px-4 bg-primary hover:brightness-110 active:scale-95 text-[10px] font-black uppercase tracking-wider text-white rounded-xl transition cursor-pointer disabled:opacity-50"
                    >
                      {verifyingOtp ? 'Verifying...' : 'Verify Code'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-[9px] text-muted-foreground hover:text-foreground text-left mt-0.5 font-black transition hover:underline"
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
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
            <FileText className="h-4.5 w-4.5 text-primary" />
            Step 2: Identity Document Check
          </h4>

          {user?.verificationStatus === 'approved' ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl shadow-xs">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
              <div className="text-[11px] font-semibold">
                <p className="font-black text-emerald-700">Official Government ID Approved</p>
                <p className="text-muted-foreground mt-0.5 font-medium leading-relaxed">Your official government-issued card credentials have been verified. You can now post and rent out items.</p>
              </div>
            </div>
          ) : user?.verificationStatus === 'pending' ? (
            <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl shadow-xs animate-pulse">
              <Clock className="h-6 w-6 text-amber-500 shrink-0" />
              <div className="text-[11px] font-semibold">
                <p className="font-black text-amber-700">Audit in Progress</p>
                <p className="text-muted-foreground mt-0.5 font-medium leading-relaxed">The Lentive compliance board is reviewing your upload. This usually takes under 2 hours.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {user?.verificationStatus === 'rejected' && (
                <div className="p-3 bg-rose-500/5 border border-rose-500/15 rounded-2xl text-[10px] text-rose-600 leading-relaxed font-semibold">
                  <p className="font-black flex items-center gap-1"><AlertCircle className="h-4 w-4 shrink-0" /> Identity Document Rejected</p>
                  <p className="mt-1 font-medium">Remarks: {user.verificationRemarks || 'Please upload a clear, high-resolution front view photo ID.'}</p>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground font-semibold">Upload a clear photo of your Aadhaar, PAN, Passport, or Voter Card.</p>
              
              {idDocPreview ? (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border/80 bg-muted">
                  <img src={idDocPreview} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setIdDocPreview('')}
                    className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 hover:border-primary/50 rounded-2xl p-6 bg-[#f8faf9] hover:bg-white cursor-pointer transition-all duration-300">
                  <Upload className="h-6 w-6 text-muted-foreground/60 mb-1.5" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Upload Government Photo ID</span>
                  <p className="text-[8px] text-muted-foreground/60 mt-1 font-bold">JPEG, PNG up to 5MB</p>
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
                  className="w-full py-3 bg-primary hover:brightness-110 text-white text-[10px] font-black uppercase tracking-wider rounded-2xl disabled:opacity-50 transition cursor-pointer shadow-md shadow-primary/10"
                >
                  {submittingId ? 'Submitting ID...' : 'Submit ID for Verification'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Driving license upload for vehicle categories */}
      {user?.isVerified && user?.isPhoneVerified && user?.verificationStatus === 'approved' && (
        <div className="flex flex-col gap-4 border-t border-border/40 pt-5">
          <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-4.5 w-4.5 text-purple-500" />
            Step 3: Escrow Driver License Endorsement
          </h4>
          
          <div className="flex items-start gap-2.5 bg-purple-50/50 dark:bg-purple-950/15 border border-purple-200 dark:border-purple-900/40 p-4 rounded-2xl text-[11px] text-purple-700 dark:text-purple-300 font-semibold leading-relaxed">
            <AlertTriangle className="h-4 w-4 shrink-0 text-purple-500 mt-0.5" />
            <span>Required only if you intend to rent out vehicles, cars, or motorbikes. Completing this unlocks the <b>Trusted User</b> marketplace tier.</span>
          </div>

          {user?.drivingLicenseStatus === 'approved' ? (
            <div className="flex items-center gap-3 p-4 bg-purple-500/5 border border-purple-500/15 rounded-2xl shadow-xs">
              <CheckCircle2 className="h-6 w-6 text-purple-500 shrink-0" />
              <div className="text-[11px] font-semibold">
                <p className="font-black text-purple-700">Driving Permit Approved</p>
                <p className="text-muted-foreground mt-0.5 font-medium leading-relaxed">Escrow tier updated to Trusted User. You are authorized for vehicle transactions.</p>
              </div>
            </div>
          ) : user?.drivingLicenseStatus === 'pending' ? (
            <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl shadow-xs animate-pulse">
              <Clock className="h-6 w-6 text-amber-500 shrink-0" />
              <div className="text-[11px] font-semibold">
                <p className="font-black text-amber-700">Endorsement Review In Progress</p>
                <p className="text-muted-foreground mt-0.5 font-medium leading-relaxed font-semibold">Our admin agents are verifying your driving license credentials.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {user?.drivingLicenseStatus === 'rejected' && (
                <div className="p-3 bg-rose-500/5 border border-rose-500/15 rounded-2xl text-[10px] text-rose-600 leading-relaxed font-semibold">
                  <p className="font-black flex items-center gap-1"><AlertCircle className="h-4 w-4 shrink-0" /> Driving License Rejected</p>
                  <p className="mt-1 font-medium font-semibold">Remarks: {user.drivingLicenseRemarks || 'Please upload a clear copy showing license details and expiration date.'}</p>
                </div>
              )}
              
              {licensePreview ? (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border/80 bg-muted">
                  <img src={licensePreview} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setLicensePreview('')}
                    className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 hover:border-primary/50 rounded-2xl p-6 bg-[#f8faf9] hover:bg-white cursor-pointer transition-all duration-300">
                  <Upload className="h-6 w-6 text-muted-foreground/60 mb-1.5" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Upload Driving Permit</span>
                  <p className="text-[8px] text-muted-foreground/60 mt-1 font-bold">JPEG, PNG up to 5MB</p>
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
                  className="w-full py-3 bg-[#6366f1] hover:brightness-110 text-white text-[10px] font-black uppercase tracking-wider rounded-2xl disabled:opacity-50 transition cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  {submittingLicense ? 'Submitting License...' : 'Submit Driving License'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
