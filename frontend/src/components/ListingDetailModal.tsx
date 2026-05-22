'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, ShieldCheck, MapPin, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { api } from '../lib/api';
import { useBookingStore } from '../store/bookingStore';
import { usePaymentStore } from '../store/paymentStore';

interface ListingDetailModalProps {
  listing: any;
  user: any;
  onClose: () => void;
  onBookingSuccess: () => void;
  onStartChat?: (ownerId: string) => void;
}

export default function ListingDetailModal({ listing, user, onClose, onBookingSuccess, onStartChat }: ListingDetailModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [days, setDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Advanced States
  const [blockedDates, setBlockedDates] = useState<{ startDate: string; endDate: string }[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showPaymentSimulator, setShowPaymentSimulator] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<any>(null);
  const [pendingOrder, setPendingOrder] = useState<any>(null);

  const createBooking = useBookingStore((state) => state.createBooking);
  const createOrder = usePaymentStore((state) => state.createOrder);
  const verifyPayment = usePaymentStore((state) => state.verifyPayment);

  // Load Razorpay SDK
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existingScript = document.getElementById('razorpay-sdk');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'razorpay-sdk';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  // Fetch blocked dates and reviews on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const availRes = await api.listings.getAvailability(listing._id);
        setBlockedDates(availRes.bookings || []);
        
        const reviewsRes = await api.reviews.getForListing(listing._id);
        setReviews(reviewsRes.reviews || []);
      } catch (err) {
        console.error('Error fetching modal details:', err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchData();
  }, [listing._id]);

  // Overlap checker
  const isDateRangeOverlapping = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return false;
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    return blockedDates.some(blocked => {
      const blockedStart = new Date(blocked.startDate);
      const blockedEnd = new Date(blocked.endDate);
      
      // Overlap formula: (start <= blockedEnd) && (end >= blockedStart)
      return (start <= blockedEnd) && (end >= blockedStart);
    });
  };

  // Recalculate price and validate overlaps when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        if (isDateRangeOverlapping(startDate, endDate)) {
          setDays(0);
          setTotalPrice(0);
          setError('Selected dates overlap with an existing booking. Please pick another range.');
        } else {
          setDays(diffDays);
          setTotalPrice(diffDays * listing.pricePerDay);
          setError('');
        }
      } else {
        setDays(0);
        setTotalPrice(0);
        setError('End date must be after start date');
      }
    } else {
      setDays(0);
      setTotalPrice(0);
    }
  }, [startDate, endDate, listing.pricePerDay, blockedDates]);

  const handleBookingClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please login first to reserve items.');
      return;
    }
    if (user.id === listing.owner?._id || user.id === listing.owner) {
      setError('You cannot rent your own item.');
      return;
    }
    if (days <= 0) {
      setError('Please select valid booking dates.');
      return;
    }
    if (isDateRangeOverlapping(startDate, endDate)) {
      setError('Selected dates overlap with an existing booking.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create booking in pending status
      const booking = await createBooking({
        listingId: listing._id,
        startDate,
        endDate,
      });

      // 2. Create order via payments API
      const orderRes = await createOrder(booking._id);
      
      if (orderRes.isSimulated) {
        setPendingBooking(booking);
        setPendingOrder(orderRes.order);
        setShowPaymentSimulator(true);
      } else {
        const options = {
          key: orderRes.keyId,
          amount: orderRes.order.amount,
          currency: orderRes.order.currency,
          name: 'Lentive Hyperlocal',
          description: `Rental of ${listing.title}`,
          order_id: orderRes.order.id,
          handler: async function (response: any) {
            setLoading(true);
            try {
              await verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                bookingId: booking._id,
              });
              setSuccess(true);
              setTimeout(() => {
                onBookingSuccess();
                onClose();
              }, 2000);
            } catch (err: any) {
              setError(err.message || 'Payment verification failed.');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: {
            color: '#3b82f6',
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setError(response.error.description || 'Payment failed.');
        });
        rzp.open();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize booking or payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedPaymentSuccess = async () => {
    if (!pendingBooking || !pendingOrder) return;
    setLoading(true);
    setError('');
    setShowPaymentSimulator(false);

    try {
      await verifyPayment({
        razorpayOrderId: pendingOrder.id,
        bookingId: pendingBooking._id,
      });
      setSuccess(true);
      setTimeout(() => {
        onBookingSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to complete booking request.');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = user && (user.id === listing.owner?._id || user.id === listing.owner);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-xs bottom-sheet-overlay">
      <div className="relative w-full md:max-w-4xl max-h-[92vh] md:max-h-[90vh] overflow-y-auto rounded-t-[28px] md:rounded-[32px] bg-card border-t md:border border-border/30 text-foreground shadow-2xl p-6 md:p-8 bottom-sheet-content md:animate-in md:zoom-in-95 md:duration-200 hide-scrollbar">
        
        {/* Mobile drag handle */}
        <div className="block md:hidden drag-handle" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mt-2 md:mt-4">
          
          {/* Main Content - Left 3 Columns */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <div>
              <span className="text-xs font-extrabold text-primary uppercase tracking-widest">{listing.category}</span>
              <h2 className="text-2xl font-black tracking-tight text-foreground mt-1 leading-tight">{listing.title}</h2>
              
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>{listing.address}</span>
              </div>
            </div>

            {/* Image Showcase */}
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-muted border border-border/40 shadow-inner">
              <img
                src={listing.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80'}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Description */}
            <div>
              <h4 className="font-bold text-sm text-foreground border-b border-border/40 pb-2 uppercase tracking-wider">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                {listing.description}
              </p>
            </div>

            {/* Owner Section */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border/40 p-4 bg-muted/40 dark:bg-black/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={listing.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'}
                    alt={listing.owner?.name || 'Owner'}
                    className="h-11 w-11 rounded-full object-cover border border-border/20 shadow-sm"
                  />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Offered by</p>
                    <p className="text-sm font-bold text-foreground">{listing.owner?.name || 'Local Host'}</p>
                  </div>
                </div>
                
                {listing.owner?.ratings && (
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-sm font-bold text-foreground">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span>{(listing.owner.ratings.average || 5.0).toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{listing.owner.ratings.count || 3} reviews</span>
                  </div>
                )}
              </div>
              
              {!isOwner && user && onStartChat && (
                <button
                  type="button"
                  onClick={() => onStartChat(listing.owner?._id || listing.owner)}
                  className="w-full py-2 bg-secondary hover:brightness-110 text-secondary-foreground font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer text-center"
                >
                  Message Owner
                </button>
              )}
            </div>

            {/* Reviews Section */}
            <div className="mt-2">
              <h4 className="font-bold text-sm text-foreground border-b border-border/40 pb-2 flex items-center justify-between uppercase tracking-wider">
                <span>Reviews & Ratings</span>
                {listing.ratings && listing.ratings.count > 0 && (
                  <span className="text-xs text-primary font-bold flex items-center gap-1 normal-case tracking-normal">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    {listing.ratings.average.toFixed(1)} ({listing.ratings.count} ratings)
                  </span>
                )}
              </h4>
              
              {reviewsLoading ? (
                <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="py-8 text-center rounded-2xl border border-dashed border-border/40 bg-muted/20 mt-3 text-xs text-muted-foreground">
                  No reviews yet. Be the first to rent and review this item!
                </div>
              ) : (
                <div className="flex flex-col gap-3 mt-3 max-h-[300px] overflow-y-auto pr-1 hide-scrollbar">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-4 rounded-2xl border border-border/30 bg-muted/25 shadow-sm flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.reviewer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'}
                            alt=""
                            className="h-7 w-7 rounded-full object-cover border border-border/20"
                          />
                          <div>
                            <p className="text-xs font-bold text-foreground">{rev.reviewer?.name || 'Renter'}</p>
                            <p className="text-[9px] text-muted-foreground">{new Date(rev.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 shrink-0" />
                          <span>{rev.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pl-9">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking Side Widget - Right 2 Columns */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-md">
              
              {/* Daily pricing head */}
              <div className="flex items-baseline justify-between border-b border-border/40 pb-4 mb-4">
                <div>
                  <span className="text-2xl font-black text-primary">{formatCurrency(listing.pricePerDay)}</span>
                  <span className="text-xs text-muted-foreground"> / day</span>
                </div>
                {listing.ratings && listing.ratings.count > 0 && (
                  <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span>{listing.ratings.average.toFixed(1)}</span>
                    <span className="text-muted-foreground">({listing.ratings.count})</span>
                  </div>
                )}
              </div>

              {/* Blocked Dates Notice */}
              {blockedDates.length > 0 && (
                <div className="mb-4 bg-muted/40 border border-border/40 p-3 rounded-2xl text-[10px] text-muted-foreground">
                  <p className="font-bold text-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    Booked Dates (Unavailable)
                  </p>
                  <div className="flex flex-col gap-1 max-h-[60px] overflow-y-auto hide-scrollbar font-semibold">
                    {blockedDates.map((b, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>• {new Date(b.startDate).toLocaleDateString()}</span>
                        <span>to {new Date(b.endDate).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {success ? (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95">
                  <CheckCircle2 className="h-16 w-16 text-primary mb-3" />
                  <h4 className="font-bold text-lg text-foreground">Reservation Sent!</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    Your booking request has been sent to the owner. Redirecting...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookingClick} className="flex flex-col gap-4">
                  {/* Date pickers */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">Start Date</label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-2xl border border-border/40 bg-muted/40 dark:bg-black/25 p-3 text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground cursor-pointer h-12"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">End Date</label>
                      <input
                        type="date"
                        required
                        value={endDate}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-2xl border border-border/40 bg-muted/40 dark:bg-black/25 p-3 text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground cursor-pointer h-12"
                      />
                    </div>
                  </div>

                  {/* Pricing breakdowns */}
                  {days > 0 && (
                    <div className="flex flex-col gap-2.5 bg-muted/50 dark:bg-black/15 rounded-2xl p-4 mt-2 border border-border/40 text-xs">
                      <div className="flex justify-between text-muted-foreground font-semibold">
                        <span>{formatCurrency(listing.pricePerDay)} × {days} days</span>
                        <span className="font-bold text-foreground">{formatCurrency(totalPrice)}</span>
                      </div>
                      {listing.securityDeposit > 0 && (
                        <div className="flex justify-between text-muted-foreground font-semibold">
                          <span>Refundable deposit</span>
                          <span className="font-bold text-foreground">{formatCurrency(listing.securityDeposit)}</span>
                        </div>
                      )}
                      <div className="h-[1px] bg-border/40 my-1" />
                      <div className="flex justify-between text-sm font-extrabold">
                        <span>Total Due</span>
                        <span className="text-primary font-black text-base">{formatCurrency(totalPrice + (listing.securityDeposit || 0))}</span>
                      </div>
                    </div>
                  )}

                  {/* Warning for owners */}
                  {isOwner && (
                    <div className="flex items-start gap-2 rounded-2xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span className="font-semibold">This is your listing. You cannot rent your own items.</span>
                    </div>
                  )}

                  {/* Error Notification */}
                  {error && (
                    <div className="flex items-start gap-2 rounded-2xl bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span className="font-semibold">{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || isOwner || !!error || !startDate || !endDate}
                    className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-extrabold rounded-2xl disabled:opacity-50 transition shadow-md text-xs uppercase tracking-wider mt-2 cursor-pointer active:scale-[0.98]"
                  >
                    {loading ? 'Reserving...' : 'Request Booking'}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-muted-foreground font-bold">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    <span>Refundable security deposit is protected in escrow</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Checkout Simulator overlay */}
      {showPaymentSimulator && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-card text-foreground border border-border/40 shadow-2xl p-6 flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Razorpay stylized header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm tracking-tight text-white">R</div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none font-bold">Razorpay Secure</p>
                  <p className="text-xs font-bold leading-none mt-1 text-foreground">Lentive Hyperlocal</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">TEST MODE</span>
            </div>

            <div className="flex flex-col gap-4 text-xs font-medium">
              <div className="flex justify-between items-center bg-muted/50 dark:bg-black/15 p-3 rounded-2xl border border-border/40">
                <div>
                  <p className="text-muted-foreground text-[10px]">Rental Item</p>
                  <p className="text-xs font-bold mt-0.5 text-foreground truncate max-w-[150px]">{listing.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-[10px]">Total Amount</p>
                  <p className="text-sm font-black mt-0.5 text-primary">{formatCurrency(totalPrice + listing.securityDeposit)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-muted/50 dark:bg-black/15 border border-border/40">
                <p className="text-muted-foreground text-[10px] uppercase">Renter Account</p>
                <p className="font-bold truncate text-foreground">{user?.name} ({user?.email})</p>
              </div>

              <div className="flex flex-col gap-1 bg-primary/10 text-primary p-3 rounded-2xl border border-primary/20 text-[10px] leading-relaxed">
                <p className="font-bold">Trust Indicators & Escrow Guarantee:</p>
                <p>• Refundable security deposit of {formatCurrency(listing.securityDeposit)} is protected in escrow.</p>
                <p>• Daily rate of {formatCurrency(listing.pricePerDay)} is held pending owner approval.</p>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button
                onClick={handleSimulatedPaymentSuccess}
                className="flex-grow py-3 bg-primary hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-2xl transition shadow-md cursor-pointer text-center"
              >
                Pay Successful
              </button>
              <button
                onClick={() => setShowPaymentSimulator(false)}
                className="py-3 px-4 bg-muted hover:bg-muted/80 active:scale-95 text-foreground text-xs font-bold rounded-2xl transition border border-border/40 cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
