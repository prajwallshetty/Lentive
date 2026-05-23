'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { 
  ShieldAlert, RefreshCw, Upload, Check, X, 
  FileText, Award, HelpCircle, ShieldAlert as AlertIcon, 
  UserCheck, DollarSign 
} from 'lucide-react';

export default function AdminConsole() {
  const { showToast } = useToast();

  const [adminAnalytics, setAdminAnalytics] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminListings, setAdminListings] = useState<any[]>([]);
  const [adminBookings, setAdminBookings] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);
  const [adminSubTab, setAdminSubTab] = useState<'analytics' | 'users' | 'verifications' | 'listings' | 'bookings' | 'deposits'>('analytics');
  
  // Action states
  const [verifRemarks, setVerifRemarks] = useState<Record<string, string>>({});
  const [disputeRemarks, setDisputeRemarks] = useState<Record<string, string>>({});

  const loadAdminData = async () => {
    setAdminLoading(true);
    try {
      const [analyticsRes, usersRes, listingsRes, bookingsRes, verifRes, depositsRes] = await Promise.all([
        api.admin.getAnalytics(),
        api.admin.getUsers(),
        api.admin.getListings(),
        api.admin.getBookings(),
        api.admin.getVerificationRequests(),
        api.admin.getDeposits()
      ]);
      setAdminAnalytics(analyticsRes.analytics || analyticsRes.data || null);
      setAdminUsers(usersRes.users || usersRes.data || []);
      setAdminListings(listingsRes.listings || listingsRes.data || []);
      setAdminBookings(bookingsRes.bookings || bookingsRes.data || []);
      setVerificationRequests(verifRes.verificationRequests || verifRes.data || []);
      setDeposits(depositsRes.deposits || depositsRes.data || []);
    } catch (err) {
      console.error('Failed to load admin console data:', err);
      showToast('Failed to load admin data.', 'error');
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAdminVerifyUser = async (userId: string, status: 'approved' | 'rejected', remarks?: string) => {
    try {
      await api.admin.verifyUser(userId, status, remarks);
      showToast(`User verification ${status} successfully.`, 'success');
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Verification update failed.', 'error');
    }
  };

  const handleVerifyRequest = async (requestId: string, status: 'approved' | 'rejected', remarks?: string) => {
    try {
      await api.admin.verifyVerificationRequest(requestId, status, remarks);
      showToast(`Verification request ${status} successfully!`, 'success');
      setVerifRemarks(prev => {
        const next = { ...prev };
        delete next[requestId];
        return next;
      });
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update verification request.', 'error');
    }
  };

  const handleResolveDispute = async (depositId: string, resolution: 'release_to_renter' | 'payout_to_owner', remarks: string) => {
    if (!remarks.trim()) {
      showToast('Please provide a reason or remarks for resolving this dispute.', 'error');
      return;
    }
    try {
      await api.admin.resolveDepositDispute(depositId, resolution, remarks);
      showToast(`Dispute resolved. Funds allocated: ${resolution === 'release_to_renter' ? 'Renter' : 'Owner'}.`, 'success');
      setDisputeRemarks(prev => {
        const next = { ...prev };
        delete next[depositId];
        return next;
      });
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to resolve dispute.', 'error');
    }
  };

  const handleAdminModerateListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to deactivate/moderate this listing?')) return;
    try {
      await api.admin.moderateListing(listingId);
      showToast('Listing deactivated successfully.', 'success');
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Deactivation failed.', 'error');
    }
  };

  const renderStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    let classes = 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';
    let label = 'Unknown';

    if (s === 'pending') {
      classes = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      label = 'Pending';
    } else if (s === 'accepted') {
      classes = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
      label = 'Confirmed';
    } else if (s === 'rejected') {
      classes = 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
      label = 'Rejected';
    } else if (s === 'active') {
      classes = 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20 animate-pulse';
      label = 'Active';
    } else if (s === 'completed') {
      classes = 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
      label = 'Completed';
    } else if (s === 'cancelled') {
      classes = 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/10';
      label = 'Cancelled';
    }

    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${classes}`}>
        {label}
      </span>
    );
  };

  const getLevelBadgeStyles = (level: string) => {
    switch (level) {
      case 'Trusted User':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'ID Verified':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Basic Verified':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/10';
    }
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/40 pb-4 gap-4">
        <div>
          <h3 className="text-lg font-black text-orange-600 flex items-center gap-1.5">
            <ShieldAlert className="h-5 w-5" />
            Admin Moderation Console
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Audit uploaded P2P identification documents, handle escrow disputes, and moderate active listings.</p>
        </div>
        <button
          type="button"
          onClick={loadAdminData}
          disabled={adminLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/10 text-orange-600 hover:bg-orange-600/20 border border-orange-600/20 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${adminLoading ? 'animate-spin' : ''}`} />
          Refresh Console
        </button>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar border-b border-border/20 pb-3">
        {[
          { id: 'analytics', label: 'Overview' },
          { id: 'verifications', label: `Pending Audits (${verificationRequests.filter(r => r.status === 'pending').length})` },
          { id: 'deposits', label: `Escrow Disputes (${deposits.filter(d => d.status === 'disputed').length})` },
          { id: 'users', label: 'All Users' },
          { id: 'listings', label: 'Moderate Listings' },
          { id: 'bookings', label: 'All Bookings' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setAdminSubTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
              adminSubTab === tab.id 
                ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {adminLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500 mb-3" />
          <p className="text-xs font-bold">Loading admin portal data...</p>
        </div>
      ) : (
        <>
          {/* 1. Analytics Sub-Tab */}
          {adminSubTab === 'analytics' && adminAnalytics && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-border/40 bg-card/50 relative overflow-hidden">
                  <p className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-wider">Total Members</p>
                  <p className="text-lg font-black text-foreground mt-1">{adminAnalytics.totalUsers || 0}</p>
                </div>
                <div className="p-4 rounded-xl border border-border/40 bg-card/50 relative overflow-hidden">
                  <p className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-wider">Active Listings</p>
                  <p className="text-lg font-black text-foreground mt-1">{adminAnalytics.totalListings || 0}</p>
                </div>
                <div className="p-4 rounded-xl border border-border/40 bg-card/50 relative overflow-hidden">
                  <p className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-wider">Total Bookings</p>
                  <p className="text-lg font-black text-foreground mt-1">{adminAnalytics.totalBookings || 0}</p>
                </div>
                <div className="p-4 rounded-xl border border-border/40 bg-card/50 relative overflow-hidden">
                  <p className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-wider">Captured Volume</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(adminAnalytics.totalEarnings || 0)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border border-border/45 bg-muted/10">
                  <h4 className="text-xs font-extrabold text-foreground border-b border-border/20 pb-2 mb-3">User Distribution</h4>
                  {adminAnalytics.usersByRole?.map((roleGroup: any) => (
                    <div key={roleGroup._id} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-card/50 border border-border/20 mb-1.5">
                      <span className="font-bold capitalize">{roleGroup._id}</span>
                      <span className="text-muted-foreground">{roleGroup.count} users</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl border border-border/45 bg-muted/10">
                  <h4 className="text-xs font-extrabold text-foreground border-b border-border/20 pb-2 mb-3">Listing Category Breakdown</h4>
                  {adminAnalytics.listingsByCategory?.map((catGroup: any) => (
                    <div key={catGroup._id} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-card/50 border border-border/20 mb-1.5">
                      <span className="font-bold">{catGroup._id}</span>
                      <span className="text-muted-foreground">{catGroup.count} items</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Verification Requests Auditing Tab */}
          {adminSubTab === 'verifications' && (
            <div className="overflow-x-auto border border-border/30 rounded-xl">
              <table className="min-w-full divide-y divide-border/20 text-left text-xs font-semibold text-foreground">
                <thead className="bg-muted/30 text-muted-foreground font-bold">
                  <tr>
                    <th className="p-3 text-[10px] uppercase tracking-wider">User</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Type</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Document Preview</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Status</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 bg-card/40">
                  {verificationRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-muted-foreground text-[11px]">No verification uploads submitted yet.</td>
                    </tr>
                  ) : (
                    verificationRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-muted/15 transition-all">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img src={req.userId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=32&h=32&q=80'} className="h-7 w-7 rounded-full object-cover border border-border/20" alt="" />
                            <div>
                              <p className="font-extrabold text-[11px] text-foreground">{req.userId?.name || 'Deleted User'}</p>
                              <p className="text-[9px] text-muted-foreground">{req.userId?.email || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-primary capitalize">
                          {req.type === 'id_verification' ? 'ID Document' : 'Driving License'}
                        </td>
                        <td className="p-3">
                          {req.documentUrl ? (
                            <button
                              type="button"
                              onClick={() => {
                                const w = window.open();
                                if (w) {
                                  w.document.write(`<img src="${req.documentUrl}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                                  w.document.title = `Document Preview`;
                                }
                              }}
                              className="text-primary hover:underline text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Upload className="h-3.5 w-3.5" />
                              View Uploaded Image
                            </button>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">No upload</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase border ${
                            req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15' :
                            req.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/15 animate-pulse' :
                            'bg-rose-500/10 text-rose-600 border-rose-500/15'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {req.status === 'pending' && (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-1.5">
                              <input
                                type="text"
                                value={verifRemarks[req._id] || ''}
                                onChange={(e) => setVerifRemarks(prev => ({ ...prev, [req._id]: e.target.value }))}
                                placeholder="Remarks/Rejection reason..."
                                className="rounded-lg border border-border bg-card px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-600 focus:border-orange-600 text-foreground w-44"
                              />
                              <div className="flex gap-1 justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleVerifyRequest(req._id, 'approved', verifRemarks[req._id])}
                                  className="px-2.5 py-1 bg-emerald-600 hover:brightness-110 text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const remarks = verifRemarks[req._id] || '';
                                    if (!remarks.trim()) {
                                      showToast('Please enter remarks for rejection.', 'error');
                                      return;
                                    }
                                    handleVerifyRequest(req._id, 'rejected', remarks);
                                  }}
                                  className="px-2.5 py-1 bg-rose-600 hover:brightness-110 text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. Escrow Deposit Disputes Resolving Tab */}
          {adminSubTab === 'deposits' && (
            <div className="overflow-x-auto border border-border/30 rounded-xl">
              <table className="min-w-full divide-y divide-border/20 text-left text-xs font-semibold text-foreground">
                <thead className="bg-muted/30 text-muted-foreground font-bold">
                  <tr>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Renter</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Lender</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Escrow Amount</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Dispute Reason</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Status</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-right">Escrow Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 bg-card/40">
                  {deposits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-muted-foreground text-[11px]">No security deposits logged in database.</td>
                    </tr>
                  ) : (
                    deposits.map((d) => (
                      <tr key={d._id} className="hover:bg-muted/15 transition-all">
                        <td className="p-3">
                          <p className="font-extrabold text-[11px] text-foreground">{d.renterId?.name || 'N/A'}</p>
                          <p className="text-[9px] text-muted-foreground">{d.renterId?.email || ''}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-extrabold text-[11px] text-foreground">{d.ownerId?.name || 'N/A'}</p>
                          <p className="text-[9px] text-muted-foreground">{d.ownerId?.email || ''}</p>
                        </td>
                        <td className="p-3 font-black text-primary">{formatCurrency(d.amount)}</td>
                        <td className="p-3 text-rose-500 font-semibold max-w-[150px] truncate" title={d.disputeReason}>
                          {d.disputeReason || <span className="text-muted-foreground font-normal italic">None</span>}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase border ${
                            d.status === 'released' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15' :
                            d.status === 'disputed' ? 'bg-rose-500/10 text-rose-600 border-rose-500/15 animate-pulse' :
                            d.status === 'refunded' ? 'bg-blue-500/10 text-blue-600 border-blue-500/15' :
                            'bg-slate-500/10 text-slate-500 border-slate-500/10'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {d.status === 'disputed' && (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-1.5">
                              <input
                                type="text"
                                value={disputeRemarks[d._id] || ''}
                                onChange={(e) => setDisputeRemarks(prev => ({ ...prev, [d._id]: e.target.value }))}
                                placeholder="Resolution remarks..."
                                className="rounded-lg border border-border bg-card px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-600 focus:border-orange-600 text-foreground w-44"
                              />
                              <div className="flex gap-1 justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleResolveDispute(d._id, 'release_to_renter', disputeRemarks[d._id] || '')}
                                  className="px-2.5 py-1 bg-blue-600 hover:brightness-110 text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                                >
                                  Refund Renter
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResolveDispute(d._id, 'payout_to_owner', disputeRemarks[d._id] || '')}
                                  className="px-2.5 py-1 bg-orange-600 hover:brightness-110 text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                                >
                                  Payout Owner
                                </button>
                              </div>
                            </div>
                          )}
                          {d.status !== 'disputed' && d.resolvedRemarks && (
                            <span className="text-[10px] text-muted-foreground max-w-[150px] truncate block" title={d.resolvedRemarks}>
                              Res: {d.resolvedRemarks}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. Users Tab */}
          {adminSubTab === 'users' && (
            <div className="overflow-x-auto border border-border/30 rounded-xl">
              <table className="min-w-full divide-y divide-border/20 text-left text-xs font-semibold text-foreground">
                <thead className="bg-muted/30 text-muted-foreground font-bold">
                  <tr>
                    <th className="p-3 text-[10px] uppercase tracking-wider">User</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Role</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Tier Badge</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Direct Verify</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 bg-card/40">
                  {adminUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-muted/15 transition-all">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=32&h=32&q=80'} className="h-7 w-7 rounded-full object-cover border border-border/20" alt="" />
                          <div>
                            <p className="font-extrabold text-[11px]">{u.name}</p>
                            <p className="text-[9px] text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 capitalize">{u.role}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase border ${getLevelBadgeStyles(u.verificationLevel || 'none')}`}>
                          {u.verificationLevel === 'none' ? 'none' : u.verificationLevel}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-muted-foreground">
                        Email: {u.isVerified ? '✓' : '✗'} | Phone: {u.isPhoneVerified ? '✓' : '✗'}
                      </td>
                      <td className="p-3 text-right">
                        {u.verificationStatus === 'pending' && (
                          <div className="flex gap-1 justify-end">
                            <button
                              type="button"
                              onClick={() => handleAdminVerifyUser(u._id, 'approved')}
                              className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdminVerifyUser(u._id, 'rejected', 'Direct rejection')}
                              className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. Listings Tab */}
          {adminSubTab === 'listings' && (
            <div className="overflow-x-auto border border-border/30 rounded-xl">
              <table className="min-w-full divide-y divide-border/20 text-left text-xs font-semibold text-foreground">
                <thead className="bg-muted/30 text-muted-foreground font-bold">
                  <tr>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Listing Item</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Owner</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Category</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Price/Day</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Status</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 bg-card/40">
                  {adminListings.map((l) => (
                    <tr key={l._id} className="hover:bg-muted/15 transition-all">
                      <td className="p-3 flex items-center gap-2.5">
                        <img src={l.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=32&h=32&q=80'} className="h-8 w-8 rounded-lg object-cover border border-border/20 shrink-0" alt="" />
                        <span className="font-extrabold text-[11px] truncate max-w-[200px]">{l.title}</span>
                      </td>
                      <td className="p-3">
                        <p className="font-extrabold text-[11px]">{l.owner?.name || 'Unknown'}</p>
                        <p className="text-[9px] text-muted-foreground">{l.owner?.email}</p>
                      </td>
                      <td className="p-3">{l.category}</td>
                      <td className="p-3 font-extrabold text-primary">{formatCurrency(l.pricePerDay)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase border ${
                          l.isAvailable ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15' : 'bg-rose-500/10 text-rose-600 border-rose-500/15'
                        }`}>
                          {l.isAvailable ? 'Available' : 'Booked/Inactive'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleAdminModerateListing(l._id)}
                          className="px-2.5 py-1.5 bg-rose-500/15 text-rose-600 hover:bg-rose-500/25 border border-rose-500/20 rounded-lg text-[10px] font-bold transition cursor-pointer active:scale-95"
                        >
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 6. All Bookings Tab */}
          {adminSubTab === 'bookings' && (
            <div className="overflow-x-auto border border-border/30 rounded-xl">
              <table className="min-w-full divide-y divide-border/20 text-left text-xs font-semibold text-foreground">
                <thead className="bg-muted/30 text-muted-foreground font-bold">
                  <tr>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Listing Item</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Renter</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Owner</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Dates</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Price Details</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 bg-card/40">
                  {adminBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-muted/15 transition-all">
                      <td className="p-3 font-extrabold text-[11px]">{b.listingId?.title || 'Seeded Item'}</td>
                      <td className="p-3">
                        <p className="font-extrabold text-[11px]">{b.renterId?.name || 'N/A'}</p>
                        <p className="text-[9px] text-muted-foreground">{b.renterId?.email}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-extrabold text-[11px]">{b.ownerId?.name || 'N/A'}</p>
                        <p className="text-[9px] text-muted-foreground">{b.ownerId?.email}</p>
                      </td>
                      <td className="p-3 text-[10px] text-muted-foreground">
                        {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <p className="font-black">{formatCurrency(b.totalPrice || b.totalAmount || 0)}</p>
                        <span className="text-[9px] text-muted-foreground">Dep: {formatCurrency(b.securityDeposit || b.depositAmount || 0)}</span>
                      </td>
                      <td className="p-3 text-right">
                        {renderStatusBadge(b.status || b.bookingStatus)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
