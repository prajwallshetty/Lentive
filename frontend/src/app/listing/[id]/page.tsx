'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { useBookingStore } from '../../../store/bookingStore';
import { usePaymentStore } from '../../../store/paymentStore';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, predictTravelTimes } from '../../../lib/utils';
import { useListingStore } from '../../../store/listingStore';
import { MOCK_LOCATIONS } from '../../../lib/constants';
import { ListingDetailSkeleton } from '../../../components/ui/Skeletons';
import { Calendar, ShieldCheck, MapPin, Star, AlertCircle, CheckCircle2, MessageSquare, ArrowLeft, ArrowRight, Shield, Car, Bike, Footprints } from 'lucide-react';
import Link from 'next/link';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { filters } = useListingStore();
  const id = params.id as string;

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Booking specific states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [days, setDays] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [success, setSuccess] = useState(false);

  // Availability & reviews
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

  // Fetch listing data
  useEffect(() => {
    if (!id) return;
    const fetchListingData = async () => {
      try {
        setLoading(true);
        const res = await api.listings.getOne(id);
        if (res.success) {
          setListing(res.listing);
          
          // Fetch availability & reviews in parallel
          const [availRes, reviewsRes] = await Promise.all([
            api.listings.getAvailability(id).catch(() => ({ bookings: [] })),
            api.reviews.getForListing(id).catch(() => ({ reviews: [] }))
          ]);
          
          setBlockedDates(availRes.bookings || []);
          setReviews(reviewsRes.reviews || []);
        } else {
          setError('Listing not found');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load listing information.');
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    };
    fetchListingData();
  }, [id]);

  // Overlap checker
  const isDateRangeOverlapping = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return false;
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    return blockedDates.some(blocked => {
      const blockedStart = new Date(blocked.startDate);
      const blockedEnd = new Date(blocked.endDate);
      return (start <= blockedEnd) && (end >= blockedStart);
    });
  };

  // Recalculate price and validate overlaps when dates change
  useEffect(() => {
    if (startDate && endDate && listing) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        if (isDateRangeOverlapping(startDate, endDate)) {
          setDays(0);
          setTotalPrice(0);
          setBookingError('Selected dates overlap with an existing booking. Please pick another range.');
        } else {
          setDays(diffDays);
          setTotalPrice(diffDays * listing.pricePerDay);
          setBookingError('');
        }
      } else {
        setDays(0);
        setTotalPrice(0);
        setBookingError('End date must be after start date');
      }
    } else {
      setDays(0);
      setTotalPrice(0);
    }
  }, [startDate, endDate, listing, blockedDates]);

  const handleBookingClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login first to reserve items.', 'info');
      router.push(`/login?redirect=/listing/${id}`);
      return;
    }
    if (user.id === listing.owner?._id || user.id === listing.owner) {
      setBookingError('You cannot rent your own item.');
      return;
    }
    if (days <= 0) {
      setBookingError('Please select valid booking dates.');
      return;
    }
    if (isDateRangeOverlapping(startDate, endDate)) {
      setBookingError('Selected dates overlap with an existing booking.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');

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
            setBookingLoading(true);
            try {
              await verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                bookingId: booking._id,
              });
              setSuccess(true);
              showToast('Booking reserved successfully!', 'success');
              setTimeout(() => {
                router.push('/bookings');
              }, 2000);
            } catch (err: any) {
              setBookingError(err.message || 'Payment verification failed.');
            } finally {
              setBookingLoading(false);
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: {
            color: '#006c49',
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setBookingError(response.error.description || 'Payment failed.');
        });
        rzp.open();
      }
    } catch (err: any) {
      setBookingError(err.message || 'Failed to initialize booking or payment.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSimulatedPaymentSuccess = async () => {
    if (!pendingBooking || !pendingOrder) return;
    setBookingLoading(true);
    setBookingError('');
    setShowPaymentSimulator(false);

    try {
      await verifyPayment({
        razorpayOrderId: pendingOrder.id,
        bookingId: pendingBooking._id,
      });
      setSuccess(true);
      showToast('Simulated payment success. Escrow booking created!', 'success');
      setTimeout(() => {
        router.push('/bookings');
      }, 2000);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to complete booking request.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleStartChat = () => {
    if (!user) {
      showToast('Please login first to message owners.', 'info');
      router.push(`/login?redirect=/listing/${id}`);
      return;
    }
    const ownerId = listing.owner?._id || listing.owner;
    router.push(`/chats?chatRecipientId=${ownerId}&listingId=${id}`);
  };

  if (loading) {
    return <ListingDetailSkeleton />;
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <AlertCircle className="h-12 w-12 text-rose-500 animate-pulse" />
        <h2 className="text-xl font-bold text-foreground">Failed to Load Listing</h2>
        <p className="text-xs text-muted-foreground max-w-sm">{error || 'This listing does not exist or has been removed.'}</p>
        <Link href="/" className="px-5 py-2.5 bg-primary hover:bg-[#005c3e] text-white text-xs font-bold rounded-xl transition">
          Return to Browse
        </Link>
      </div>
    );
  }

  // Calculate travel predictions from simulated coordinates
  const storeCoords = filters.coordinates;
  const currentLocation = storeCoords
    ? (MOCK_LOCATIONS.find(
        (loc) => loc.coordinates[0] === storeCoords[0] && loc.coordinates[1] === storeCoords[1]
      ) || MOCK_LOCATIONS[0])
    : null;

  const travel = currentLocation && listing.location?.coordinates
    ? predictTravelTimes(
        currentLocation.coordinates[1],
        currentLocation.coordinates[0],
        listing.location.coordinates[1],
        listing.location.coordinates[0]
      )
    : null;

  const displayImage = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80';

  const isOwner = user && (user.id === listing.owner?._id || user.id === listing.owner);

  return (
    <div className="max-w-7xl mx-auto w-full px-1 py-4 mt-20">
      
      {/* Back navigation link */}
      <Link 
        href="/"
        className="inline-flex items-center gap-2 mb-6 text-xs sm:text-sm font-bold text-muted-foreground hover:text-primary transition group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Main Info - Left 3 Columns */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Main Hero Image */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-muted border border-border/20 shadow-xs">
            <img 
              src={displayImage} 
              alt={listing.title} 
              className="h-full w-full object-cover"
            />
            <span className="absolute left-4 top-4 rounded-full bg-white/95 dark:bg-[#0d1210]/95 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-extrabold text-primary border border-border/10 uppercase tracking-widest shadow-sm select-none">
              {listing.category}
            </span>
          </div>

          {/* Travel Transit Matrix */}
          {travel && (
            <div className="rounded-2xl border border-border/45 p-4 bg-muted/20 dark:bg-black/10">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3 flex justify-between">
                <span>Transit Duration Estimates</span>
                <span className="text-primary font-black">{travel.distance} away</span>
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="flex flex-col items-center gap-1.5 p-2 bg-white dark:bg-neutral-900 rounded-xl border border-border/45 shadow-xs">
                  <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                    <Car className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wide">Drive / Cab</span>
                  <span className="text-sm font-black text-foreground">{travel.driveMins} mins</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 bg-white dark:bg-neutral-900 rounded-xl border border-border/45 shadow-xs">
                  <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
                    <Bike className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wide">Bicycle</span>
                  <span className="text-sm font-black text-foreground">{travel.bikeMins} mins</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 bg-white dark:bg-neutral-900 rounded-xl border border-border/45 shadow-xs">
                  <div className="p-2 rounded-full bg-neutral-500/10 text-neutral-500">
                    <Footprints className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wide">Walking</span>
                  <span className="text-sm font-black text-foreground">{travel.walkMins} mins</span>
                </div>
              </div>
            </div>
          )}

          {/* Heading Section */}
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground leading-tight">{listing.title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg font-semibold text-foreground border border-border/30">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>{listing.address}</span>
              </div>
              {travel && (
                <span className="font-extrabold text-[10px] text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/15">
                  {travel.distance} away
                </span>
              )}
              {listing.ratings?.count > 0 && (
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-lg font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span>{listing.ratings.average.toFixed(1)} ({listing.ratings.count} reviews)</span>
                </div>
              )}
            </div>
          </div>

          <div className="h-[1px] bg-border/20 w-full" />

          {/* Description Section */}
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-extrabold text-foreground">About this rental</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{listing.description}</p>
          </div>

          {/* Deposit & Terms Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-border/25 bg-card">
              <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Security Deposit</span>
              <span className="text-lg font-black text-foreground mt-1 block">
                {listing.securityDeposit ? formatCurrency(listing.securityDeposit) : '₹0 (No Deposit)'}
              </span>
              <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                Held securely in escrow and returned fully after items are successfully handbacked.
              </p>
            </div>
            
            <div className="p-4 rounded-2xl border border-border/25 bg-card flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Safety Coverage</span>
                <span className="text-xs font-bold text-primary flex items-center gap-1 mt-1">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  SafeRent™ Guarantee included
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 leading-normal">
                Damage protection and dispute resolution are configured on this rental transaction.
              </p>
            </div>
          </div>

          {/* Owner details */}
          <div className="p-5 rounded-3xl border border-border/20 bg-muted/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={listing.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'} 
                alt={listing.owner?.name || 'Owner'} 
                className="h-11 w-11 rounded-xl object-cover border border-border/30"
              />
              <div>
                <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">Listed By</span>
                <h4 className="font-extrabold text-sm text-foreground mt-0.5">{listing.owner?.name || 'Local Neighbor'}</h4>
                {listing.owner?.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#006c49] bg-emerald-100 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md mt-1 border border-primary/20">
                    <ShieldCheck className="h-3 w-3" /> Verified Owner
                  </span>
                )}
              </div>
            </div>

            {!isOwner && (
              <button
                onClick={handleStartChat}
                className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-card border border-border hover:bg-muted text-xs font-bold rounded-xl text-foreground transition active:scale-95 cursor-pointer shadow-xs"
              >
                <MessageSquare className="h-4 w-4 text-primary" />
                Message Host
              </button>
            )}
          </div>

          {/* Reviews section */}
          <div className="flex flex-col gap-4 mt-2">
            <h3 className="text-base font-extrabold text-foreground">Community Reviews ({reviews.length})</h3>
            
            {reviewsLoading ? (
              <div className="h-20 bg-muted/20 animate-pulse rounded-2xl" />
            ) : reviews.length === 0 ? (
              <p className="text-xs text-muted-foreground bg-muted/20 p-5 rounded-2xl text-center border border-dashed border-border/50">
                No reviews yet for this listing. Be the first to rent and write one!
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-4 rounded-2xl border border-border/20 bg-card flex flex-col gap-2 shadow-xs">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={rev.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'} 
                          alt={rev.user?.name} 
                          className="h-8 w-8 rounded-lg object-cover"
                        />
                        <div>
                          <h5 className="text-xs font-bold text-foreground">{rev.user?.name || 'Renter'}</h5>
                          <span className="text-[9px] text-muted-foreground/60">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span className="text-xs font-bold">{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Booking Request Widget - Right 2 Columns */}
        <div className="lg:col-span-2 flex flex-col gap-6 sticky top-28">
          
          <div className="rounded-3xl border border-border/25 bg-card p-6 shadow-sm flex flex-col gap-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent" />
            
            <div className="flex justify-between items-end border-b border-border/20 pb-4">
              <div>
                <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Daily Price</span>
                <span className="text-2xl font-black text-primary block mt-0.5">{formatCurrency(listing.pricePerDay)}</span>
              </div>
              <span className="text-xs font-bold text-muted-foreground bg-muted dark:bg-[#0d1210] border border-border/30 px-3 py-1 rounded-full select-none">
                Available Now
              </span>
            </div>

            {/* Availability calendar warning */}
            {blockedDates.length > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-2.5 items-start">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wide">Reserved dates exist</span>
                  <span className="text-[9px] text-muted-foreground leading-normal">
                    This item has active reservations. Overlapping booking requests are blocked.
                  </span>
                </div>
              </div>
            )}

            {/* Booking Inputs */}
            <form onSubmit={handleBookingClick} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      type="date"
                      value={startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-9 pr-2 py-2.5 bg-muted/40 dark:bg-black/10 text-xs font-bold rounded-xl border border-border/30 focus:outline-none focus:border-primary/45"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-9 pr-2 py-2.5 bg-muted/40 dark:bg-black/10 text-xs font-bold rounded-xl border border-border/30 focus:outline-none focus:border-primary/45"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Booking error */}
              {bookingError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-500 flex gap-2 items-center">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Price Calculation breakdown */}
              {days > 0 && (
                <div className="p-4 rounded-2xl bg-muted/50 border border-border/30 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                    <span>{formatCurrency(listing.pricePerDay)} × {days} days</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                    <span>SafeRent Escrow fee</span>
                    <span>₹0</span>
                  </div>
                  <div className="h-[1px] bg-border/20 my-1" />
                  <div className="flex justify-between items-center text-xs font-extrabold text-foreground">
                    <span>Total Billing</span>
                    <span className="text-primary font-black text-sm">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              )}

              {/* Rent trigger button */}
              {success ? (
                <button
                  type="button"
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 border border-emerald-600 shadow-md select-none"
                  disabled
                >
                  <CheckCircle2 className="h-4 w-4 text-white animate-bounce" />
                  Reservation Successful!
                </button>
              ) : isOwner ? (
                <div className="p-3 text-center text-[10px] text-muted-foreground font-bold border border-border bg-muted/20 rounded-2xl select-none">
                  You own this item. Track requests inside dashboard.
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full py-3.5 rounded-2xl bg-primary hover:bg-[#005c3e] text-white font-extrabold text-xs flex items-center justify-center gap-2 border border-primary/10 transition active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 select-none cursor-pointer"
                >
                  {bookingLoading ? 'Initializing Escrow Order...' : 'Request Rental Escrow'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </form>
          </div>

          {/* Safety card widget */}
          <div className="rounded-3xl border border-border/20 p-5 bg-muted/30 flex flex-col gap-3">
            <span className="text-[10px] text-primary font-extrabold uppercase tracking-widest flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-primary fill-primary/10" />
              Lentive Escrow SafeRent™
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Your payment is held safely in escrow. The host is only paid after you collect the rental item and verify its condition. No upfront risk.
            </p>
          </div>

        </div>

      </div>

      {/* Razorpay Simulated Sandbox Overlay Modal */}
      {showPaymentSimulator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl animate-scaleIn flex flex-col gap-5 text-center">
            
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-foreground">Razorpay Sandbox Simulator</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
                Complete a simulated payment flow of <span className="font-bold text-primary">{formatCurrency(totalPrice)}</span> to create your hyperlocal rental escrow order.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/50 border border-border text-left flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-[10px] text-foreground truncate max-w-[150px]">{pendingOrder?.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-muted-foreground">Billing Total</span>
                <span className="text-primary font-extrabold">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-muted-foreground">Gateway Escrow</span>
                <span className="text-foreground bg-primary/10 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Razorpay Sim</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowPaymentSimulator(false);
                  setBookingError('Simulated payment cancelled by user.');
                }}
                className="py-3 bg-muted hover:bg-muted/80 rounded-2xl text-xs font-bold text-muted-foreground transition active:scale-95"
              >
                Decline
              </button>
              
              <button
                onClick={handleSimulatedPaymentSuccess}
                className="py-3 bg-primary hover:bg-[#005c3e] text-white rounded-2xl text-xs font-extrabold transition active:scale-95 shadow-md"
              >
                Authorize Payment
              </button>
            </div>
            
            <p className="text-[9px] text-muted-foreground/60 leading-normal">
              Razorpay sandbox mock completes verified transaction signatures instantly. For local development environments.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
