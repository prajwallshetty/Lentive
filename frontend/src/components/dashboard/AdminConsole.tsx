'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { ShieldAlert, RefreshCw, Upload, Check } from 'lucide-react';

export default function AdminConsole() {
  const { showToast } = useToast();

  const [adminAnalytics, setAdminAnalytics] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminListings, setAdminListings] = useState<any[]>([]);
  const [adminBookings, setAdminBookings] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);
  const [adminSubTab, setAdminSubTab] = useState<'analytics' | 'users' | 'listings' | 'bookings'>('analytics');
  const [verificationRemarks, setVerificationRemarks] = useState<string>('');
  const [userRemarks, setUserRemarks] = useState<Record<string, string>>({});

  const loadAdminData = async () => {
    setAdminLoading(true);
    try {
      const [analyticsRes, usersRes, listingsRes, bookingsRes] = await Promise.all([
        api.admin.getAnalytics(),
        api.admin.getUsers(),
        api.admin.getListings(),
        api.admin.getBookings()
      ]);
      setAdminAnalytics(analyticsRes.analytics || analyticsRes.data || null);
      setAdminUsers(usersRes.users || usersRes.data || []);
      setAdminListings(listingsRes.listings || listingsRes.data || []);
      setAdminBookings(bookingsRes.bookings || bookingsRes.data || []);
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
      const actualRemarks = remarks !== undefined ? remarks : (verificationRemarks || undefined);
      await api.admin.verifyUser(userId, status, actualRemarks);
      showToast(`User verification ${status} successfully.`, 'success');
      setVerificationRemarks('');
      setUserRemarks(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Verification update failed.', 'error');
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
      label = 'Pending Approval';
    } else if (s === 'accepted') {
      classes = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
      label = 'Confirmed';
    } else if (s === 'rejected') {
      classes = 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
      label = 'Rejected';
    } else if (s === 'active') {
      classes = 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20 animate-pulse';
      label = 'Active Rental';
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

  return (
    <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/40 pb-4 gap-4">
        <div>
          <h3 className="text-lg font-black text-orange-600 flex items-center gap-1.5">
            <ShieldAlert className="h-5 w-5" />
            Admin Moderation Console
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Manage users, listings deactivations, verify documents, and review analytics.</p>
        </div>
        <button
          type="button"
          onClick={loadAdminData}
          disabled={adminLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/10 text-orange-600 hover:bg-orange-600/20 border border-orange-600/20 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${adminLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar border-b border-border/20 pb-3">
        <button
          type="button"
          onClick={() => setAdminSubTab('analytics')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
            adminSubTab === 'analytics' 
              ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Analytics Overview
        </button>
        <button
          type="button"
          onClick={() => setAdminSubTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
            adminSubTab === 'users' 
              ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Users & Verification ({adminUsers.length})
        </button>
        <button
          type="button"
          onClick={() => setAdminSubTab('listings')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
            adminSubTab === 'listings' 
              ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Moderate Listings ({adminListings.length})
        </button>
        <button
          type="button"
          onClick={() => setAdminSubTab('bookings')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
            adminSubTab === 'bookings' 
              ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          All Bookings ({adminBookings.length})
        </button>
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
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-border/40 bg-card/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-orange-500/5 rounded-full blur-xl" />
                  <p className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-wider">Total Members</p>
                  <p className="text-lg font-black text-foreground mt-1">{adminAnalytics.totalUsers || 0}</p>
                </div>
                <div className="p-4 rounded-xl border border-border/40 bg-card/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-orange-500/5 rounded-full blur-xl" />
                  <p className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-wider">Active Listings</p>
                  <p className="text-lg font-black text-foreground mt-1">{adminAnalytics.totalListings || 0}</p>
                </div>
                <div className="p-4 rounded-xl border border-border/40 bg-card/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-orange-500/5 rounded-full blur-xl" />
                  <p className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-wider">Total Bookings</p>
                  <p className="text-lg font-black text-foreground mt-1">{adminAnalytics.totalBookings || 0}</p>
                </div>
                <div className="p-4 rounded-xl border border-border/40 bg-card/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-full blur-xl" />
                  <p className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-wider">Captured Volume</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(adminAnalytics.totalEarnings || 0)}</p>
                </div>
              </div>

              {/* Breakdown Graphs / Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border border-border/45 bg-muted/10">
                  <h4 className="text-xs font-extrabold text-foreground border-b border-border/20 pb-2 mb-3">User Distribution</h4>
                  {adminAnalytics.usersByRole && adminAnalytics.usersByRole.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {adminAnalytics.usersByRole.map((roleGroup: any) => (
                        <div key={roleGroup._id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-card/50 border border-border/20">
                          <span className="font-bold capitalize">{roleGroup._id}</span>
                          <span className="text-muted-foreground">{roleGroup.count} users</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground py-4 text-center">No user role data available.</p>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-border/45 bg-muted/10">
                  <h4 className="text-xs font-extrabold text-foreground border-b border-border/20 pb-2 mb-3">Listing Category Breakdown</h4>
                  {adminAnalytics.listingsByCategory && adminAnalytics.listingsByCategory.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {adminAnalytics.listingsByCategory.map((catGroup: any) => (
                        <div key={catGroup._id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-card/50 border border-border/20">
                          <span className="font-bold">{catGroup._id}</span>
                          <span className="text-muted-foreground">{catGroup.count} items</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground py-4 text-center">No category listing data available.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. Users & Verification Sub-Tab */}
          {adminSubTab === 'users' && (
            <div className="overflow-x-auto border border-border/30 rounded-xl">
              <table className="min-w-full divide-y divide-border/20 text-left text-xs font-semibold text-foreground">
                <thead className="bg-muted/30 text-muted-foreground font-bold">
                  <tr>
                    <th className="p-3 text-[10px] uppercase tracking-wider">User</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Role</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">ID Verification</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">ID Preview</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 bg-card/40">
                  {adminUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-muted-foreground text-[11px]">No users registered in system.</td>
                    </tr>
                  ) : (
                    adminUsers.map((u) => (
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
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase border ${
                            u.verificationStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15' :
                            u.verificationStatus === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/15 animate-pulse' :
                            u.verificationStatus === 'rejected' ? 'bg-rose-500/10 text-rose-600 border-rose-500/15' :
                            'bg-slate-500/10 text-slate-500 border-slate-500/10'
                          }`}>
                            {u.verificationStatus || 'none'}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.verificationDocument ? (
                            <button
                              type="button"
                              onClick={() => {
                                const w = window.open();
                                if (w) {
                                  w.document.write(`<img src="${u.verificationDocument}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                                  w.document.title = `${u.name} - Verification Document`;
                                }
                              }}
                              className="text-primary hover:underline text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Upload className="h-3.5 w-3.5" />
                              View Upload
                            </button>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">No upload</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {u.verificationStatus === 'pending' && (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-1.5">
                              <input
                                type="text"
                                value={userRemarks[u._id] || ''}
                                onChange={(e) => {
                                  setUserRemarks(prev => ({ ...prev, [u._id]: e.target.value }));
                                  setVerificationRemarks(e.target.value);
                                }}
                                placeholder="Remarks (for rejection)..."
                                className="rounded-lg border border-border bg-card px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-600 focus:border-orange-600 text-foreground w-36"
                              />
                              <div className="flex gap-1 justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleAdminVerifyUser(u._id, 'approved');
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:brightness-110 text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const rem = userRemarks[u._id] || '';
                                    if (!rem.trim()) {
                                      showToast('Please provide remarks explaining rejection.', 'error');
                                      return;
                                    }
                                    handleAdminVerifyUser(u._id, 'rejected', rem);
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

          {/* 3. Moderate Listings Sub-Tab */}
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
                  {adminListings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-muted-foreground text-[11px]">No listings available.</td>
                    </tr>
                  ) : (
                    adminListings.map((l) => (
                      <tr key={l._id} className="hover:bg-muted/15 transition-all">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img src={l.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=32&h=32&q=80'} className="h-8 w-8 rounded-lg object-cover border border-border/20 shrink-0" alt="" />
                            <span className="font-extrabold text-[11px] truncate max-w-[200px]">{l.title}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="font-extrabold text-[11px]">{l.owner?.name || 'Unknown'}</p>
                          <p className="text-[9px] text-muted-foreground">{l.owner?.email || 'N/A'}</p>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. All Bookings Sub-Tab */}
          {adminSubTab === 'bookings' && (
            <div className="overflow-x-auto border border-border/30 rounded-xl">
              <table className="min-w-full divide-y divide-border/20 text-left text-xs font-semibold text-foreground">
                <thead className="bg-muted/30 text-muted-foreground font-bold">
                  <tr>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Listing Item</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Renter</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Lender / Owner</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Dates</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider">Total Price</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 bg-card/40">
                  {adminBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-muted-foreground text-[11px]">No bookings log registered.</td>
                    </tr>
                  ) : (
                    adminBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-muted/15 transition-all">
                        <td className="p-3 font-extrabold text-[11px]">{b.listingId?.title || b.listing?.title || 'Unknown Item'}</td>
                        <td className="p-3">
                          <p className="font-extrabold text-[11px]">{b.renterId?.name || b.renter?.name || 'N/A'}</p>
                          <p className="text-[9px] text-muted-foreground">{b.renterId?.email || b.renter?.email || ''}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-extrabold text-[11px]">{b.ownerId?.name || b.owner?.name || 'N/A'}</p>
                          <p className="text-[9px] text-muted-foreground">{b.ownerId?.email || b.owner?.email || ''}</p>
                        </td>
                        <td className="p-3 text-[10px] text-muted-foreground">
                          {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                        </td>
                        <td className="p-3 font-black">{formatCurrency(b.totalPrice || b.totalAmount || 0)}</td>
                        <td className="p-3 text-right">
                          {renderStatusBadge(b.status || b.bookingStatus)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
