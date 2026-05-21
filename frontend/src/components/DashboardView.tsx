'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { MockLocation } from '../lib/constants';
import { 
  Plus, DollarSign, Package, ShoppingBag, Eye, 
  CheckCircle2, Clock, XCircle, AlertCircle, Calendar, PlusCircle
} from 'lucide-react';

interface DashboardViewProps {
  user: any;
  currentLocation: MockLocation;
}

export default function DashboardView({ user, currentLocation }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'requests' | 'listings' | 'rentals'>('stats');
  const [bookings, setBookings] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  
  // Listing form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Tools');
  const [formPrice, setFormPrice] = useState(15);
  const [formDeposit, setFormDeposit] = useState(50);
  const [formAddress, setFormAddress] = useState(currentLocation.address);
  const [formImage, setFormImage] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchDashboardData = async () => {
    try {
      if (user.role === 'owner') {
        const bookingsRes = await api.bookings.getOwnerBookings();
        setBookings(bookingsRes.bookings || []);
        
        // Fetch listings belonging to the owner
        const listingsRes = await api.listings.getAll();
        const myItems = (listingsRes.listings || []).filter(
          (item: any) => item.owner?._id === user.id || item.owner === user.id
        );
        setListings(myItems);
      } else {
        const rentalsRes = await api.bookings.getRenterBookings();
        setBookings(rentalsRes.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Sync address form when user location context changes
  useEffect(() => {
    setFormAddress(currentLocation.address);
  }, [currentLocation]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!formTitle || !formDescription || !formAddress) {
      setFormError('Please fill out all required fields.');
      return;
    }

    try {
      const defaultImages = formImage ? [formImage] : [
        formCategory === 'Tools' ? 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80' :
        formCategory === 'Electronics' ? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80' :
        formCategory === 'Vehicles' ? 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80' :
        formCategory === 'Outdoor' ? 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80' :
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80'
      ];

      await api.listings.create({
        title: formTitle,
        description: formDescription,
        category: formCategory,
        pricePerDay: Number(formPrice),
        securityDeposit: Number(formDeposit),
        images: defaultImages,
        address: formAddress,
        coordinates: currentLocation.coordinates // Use current simulated location!
      });

      setFormSuccess(true);
      setFormTitle('');
      setFormDescription('');
      setFormImage('');
      
      setTimeout(() => {
        setShowAddForm(false);
        setFormSuccess(false);
        fetchDashboardData();
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || 'Failed to list item.');
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: 'approved' | 'completed' | 'cancelled') => {
    try {
      await api.bookings.updateStatus(bookingId, status);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update booking status.');
    }
  };

  // Stats calculators
  const approvedBookings = bookings.filter(b => b.status === 'approved' || b.status === 'active' || b.status === 'completed');
  const totalEarnings = approvedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="w-full py-6 animate-in fade-in duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">
              {user.role === 'owner' ? 'Hosting Dashboard' : 'Renter Dashboard'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Logged in as <span className="font-semibold text-foreground">{user.name}</span> ({user.email})
            </p>
          </div>
          
          {user.role === 'owner' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white text-xs font-bold rounded-2xl transition shadow-lg shadow-accent/20"
            >
              <Plus className="h-4 w-4" />
              List an Item
            </button>
          )}
        </div>

        {/* Dashboard Tabs */}
        <div className="flex gap-4 border-b border-border/60 py-4 mb-6 text-xs sm:text-sm font-semibold overflow-x-auto no-scrollbar">
          {user.role === 'owner' ? (
            <>
              <button
                onClick={() => setActiveTab('stats')}
                className={`pb-2 border-b-2 transition ${activeTab === 'stats' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`pb-2 border-b-2 transition flex items-center gap-1.5 ${activeTab === 'requests' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground'}`}
              >
                Rental Requests
                {pendingCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] text-white">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`pb-2 border-b-2 transition ${activeTab === 'listings' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground'}`}
              >
                My Items ({listings.length})
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveTab('rentals')}
              className={`pb-2 border-b-2 transition ${activeTab === 'rentals' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground'}`}
            >
              My Rentals ({bookings.length})
            </button>
          )}
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'stats' && user.role === 'owner' && (
          <div className="flex flex-col gap-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-black text-foreground">{formatCurrency(totalEarnings)}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Listings</p>
                  <p className="text-2xl font-black text-foreground">{listings.length}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-black text-foreground">{bookings.length}</p>
                </div>
              </div>
            </div>

            {/* Quick Requests Snippet */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground border-b border-border/60 pb-3 mb-4">
                Recent Booking Requests
              </h3>
              {bookings.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No recent requests.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {bookings.slice(0, 3).map((b) => (
                    <div key={b._id} className="flex flex-col justify-between items-start gap-4 p-4 rounded-2xl border border-border bg-muted/20 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <img 
                          src={b.listing?.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=80&h=80&q=80'} 
                          alt="" 
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-foreground truncate max-w-[200px]">{b.listing?.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Renter: <span className="font-semibold">{b.renter?.name}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-xs">
                          <p className="font-bold text-foreground">{formatCurrency(b.totalPrice)}</p>
                          <span className="text-[9px] text-muted-foreground">For {Math.ceil((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 3600 * 24))} days</span>
                        </div>
                        
                        {/* Status tag */}
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          b.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                          b.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                          b.status === 'completed' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Requests Tab Content */}
        {activeTab === 'requests' && user.role === 'owner' && (
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground border-b border-border/60 pb-3 mb-4">Manage Requests</h3>
            {bookings.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No requests found for your items.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {bookings.map((b) => (
                  <div key={b._id} className="flex flex-col justify-between items-start gap-4 p-4 rounded-2xl border border-border bg-muted/20 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                      <img 
                        src={b.listing?.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=80&h=80&q=80'} 
                        alt="" 
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold text-foreground">{b.listing?.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Renter: <span className="font-semibold text-foreground">{b.renter?.name}</span> ({b.renter?.email})
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-xs md:text-right">
                        <p className="text-sm font-black text-foreground">{formatCurrency(b.totalPrice)}</p>
                        <span className="text-[10px] text-muted-foreground">Deposit: {formatCurrency(b.securityDeposit)} (Refundable)</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(b._id, 'approved')}
                              className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-extrabold rounded-lg hover:bg-emerald-600 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b._id, 'cancelled')}
                              className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-extrabold rounded-lg hover:bg-red-600 transition"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {b.status === 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(b._id, 'completed')}
                            className="px-3 py-1.5 bg-primary text-white text-[10px] font-extrabold rounded-lg hover:bg-primary/95 transition"
                          >
                            Mark Completed
                          </button>
                        )}
                        {b.status !== 'pending' && b.status !== 'approved' && (
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            b.status === 'completed' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {b.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Listings Tab Content */}
        {activeTab === 'listings' && user.role === 'owner' && (
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground border-b border-border/60 pb-3 mb-4">My Listed Items</h3>
            {listings.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">You haven't listed any items yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {listings.map((item) => (
                  <div key={item._id} className="rounded-2xl border border-border p-3 bg-muted/20 flex gap-3">
                    <img 
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=80&h=80&q=80'} 
                      alt="" 
                      className="h-16 w-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex flex-col justify-between overflow-hidden">
                      <div>
                        <p className="text-xs font-bold text-foreground truncate">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.category}</p>
                      </div>
                      <p className="text-sm font-extrabold text-foreground mt-1">
                        {formatCurrency(item.pricePerDay)}<span className="text-[10px] text-muted-foreground">/day</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* rentals Tab Content */}
        {activeTab === 'rentals' && user.role !== 'owner' && (
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground border-b border-border/60 pb-3 mb-4">Rental History</h3>
            {bookings.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">You have not booked any rentals yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {bookings.map((b) => (
                  <div key={b._id} className="flex flex-col justify-between items-start gap-4 p-4 rounded-2xl border border-border bg-muted/20 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                      <img 
                        src={b.listing?.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=80&h=80&q=80'} 
                        alt="" 
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold text-foreground">{b.listing?.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Owner: <span className="font-semibold text-foreground">{b.owner?.name}</span> ({b.owner?.email})
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-xs md:text-right">
                        <p className="text-sm font-black text-foreground">{formatCurrency(b.totalPrice)}</p>
                        <span className="text-[10px] text-muted-foreground">Deposit: {formatCurrency(b.securityDeposit)}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {b.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(b._id, 'cancelled')}
                            className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-extrabold rounded-lg hover:bg-red-600 transition"
                          >
                            Cancel Request
                          </button>
                        )}
                        {b.status !== 'pending' && (
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            b.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                            b.status === 'completed' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {b.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Listing Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-foreground tracking-tight border-b border-border/80 pb-3">List a New Item</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition"
            >
              <XCircle className="h-5 w-5" />
            </button>

            {formSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95">
                <CheckCircle2 className="h-14 w-14 text-emerald-500 mb-2" />
                <h4 className="font-bold text-lg">Item Listed!</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Item was listed successfully at your simulated location!
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateListing} className="flex flex-col gap-4 mt-4 text-xs font-semibold">
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground uppercase">Item Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Cordless Lawn Mower"
                    className="rounded-xl border border-border bg-transparent p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground uppercase">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="rounded-xl border border-border bg-card p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                      <option>Tools</option>
                      <option>Electronics</option>
                      <option>Vehicles</option>
                      <option>Outdoor</option>
                      <option>Party Supplies</option>
                      <option>Fashion</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground uppercase">Address / Location</label>
                    <input
                      type="text"
                      required
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="rounded-xl border border-border bg-transparent p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground uppercase">Price / Day ($)</label>
                    <input
                      type="number"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="rounded-xl border border-border bg-transparent p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground uppercase">Security Deposit ($)</label>
                    <input
                      type="number"
                      value={formDeposit}
                      onChange={(e) => setFormDeposit(Number(e.target.value))}
                      className="rounded-xl border border-border bg-transparent p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground uppercase">Description</label>
                  <textarea
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide condition, features, and pickup instructions..."
                    rows={3}
                    className="rounded-xl border border-border bg-transparent p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="flex items-start gap-2 bg-primary/5 rounded-2xl p-3 border border-primary/10">
                  <PlusCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    This item will be listed at coordinates <span className="font-semibold text-foreground">[{currentLocation.coordinates.join(', ')}]</span> corresponding to your current simulated location, enabling hyperlocal discovery.
                  </p>
                </div>

                {formError && (
                  <div className="flex items-center gap-1.5 text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-xl text-[10px]">
                    <AlertCircle className="h-4 w-4" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary text-white font-extrabold rounded-2xl hover:bg-primary/90 transition shadow-lg shadow-primary/15 mt-2"
                >
                  Confirm Listing
                </button>

              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
