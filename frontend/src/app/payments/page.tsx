'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePaymentStore, Transaction } from '../../store/paymentStore';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../lib/utils';
import { 
  CreditCard, ArrowDownRight, ArrowUpRight, ShieldCheck, ShieldAlert, 
  ExternalLink, Calendar, HelpCircle, Loader2, ArrowLeft 
} from 'lucide-react';

export default function PaymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { transactions, fetchHistory, loading: paymentsLoading } = usePaymentStore();

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Loading payment ledger...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 gap-4 max-w-md mx-auto">
        <div className="h-16 w-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
          <CreditCard className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-foreground">Sign in to view payments</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Check your transaction receipts, escrow security deposit holdings, and monthly payouts ledger.
        </p>
        <Link
          href="/login?redirect=/payments"
          className="w-full py-3 bg-primary hover:brightness-110 text-white font-extrabold rounded-xl transition-all duration-200 shadow-md shadow-primary/20 text-xs tracking-wide active:scale-95 cursor-pointer block text-center"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const totalSpent = transactions
    .filter(t => t.status === 'captured')
    .reduce((acc, t) => acc + t.amount, 0);

  const renderStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'captured') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          Captured
        </span>
      );
    } else if (s === 'refunded') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
          Refunded
        </span>
      );
    } else if (s === 'failed') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
          Failed
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
        Pending
      </span>
    );
  };

  const getTransactionTypeDetails = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t === 'deposit') {
      return {
        label: 'Escrow Security Deposit',
        icon: <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />,
        bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700',
      };
    } else if (t === 'refund') {
      return {
        label: 'Deposit Refund Outflow',
        icon: <ArrowUpRight className="h-4 w-4 text-indigo-600 shrink-0" />,
        bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-700',
      };
    }
    return {
      label: 'Rental Booking charge',
      icon: <ArrowDownRight className="h-4 w-4 text-primary shrink-0" />,
      bg: 'bg-primary/10 border-primary/20 text-primary',
    };
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      
      {/* Back button */}
      <Link 
        href="/profile" 
        className="flex items-center gap-1.5 text-xs font-extrabold text-muted-foreground hover:text-foreground w-fit transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Profile
      </Link>

      {/* Header and Summary stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Transaction Ledger
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
            Track payments, captured security escrows, and rental receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted/40 border border-border/20 px-4 py-2 rounded-2xl text-xs font-semibold">
          <span className="text-muted-foreground">Total Captured Value:</span>
          <span className="text-foreground font-black text-sm">{formatCurrency(totalSpent)}</span>
        </div>
      </div>

      {/* Transaction List */}
      {paymentsLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-7 w-7 text-primary animate-spin" />
          <p className="text-xs font-bold text-muted-foreground">Syncing transaction history...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-3xl border border-border/40 bg-card p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 border border-border/20 mb-1">
            <CreditCard className="h-7 w-7" />
          </div>
          <h3 className="font-extrabold text-sm text-foreground">No payments history</h3>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Your transactions and escrow logs will show up here as soon as you complete bookings.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          
          {/* Mobile Card List */}
          <div className="flex flex-col gap-3 md:hidden">
            {transactions.map((tx) => {
              const typeDetails = getTransactionTypeDetails(tx.type);
              return (
                <div 
                  key={tx._id}
                  className="rounded-2xl border border-border/30 bg-card p-4 flex flex-col gap-3.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg border flex items-center justify-center ${typeDetails.bg.split(' ')[0]} ${typeDetails.bg.split(' ')[1]}`}>
                        {typeDetails.icon}
                      </div>
                      <span className="text-xs font-extrabold text-foreground">{typeDetails.label}</span>
                    </div>
                    <span className="text-xs font-black text-foreground">{formatCurrency(tx.amount)}</span>
                  </div>

                  <div className="flex flex-col gap-1.5 text-[10px] font-semibold text-muted-foreground border-t border-border/20 pt-3">
                    <div className="flex justify-between">
                      <span>Order ID</span>
                      <span className="font-mono font-bold text-foreground">{tx.razorpayOrderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment ID</span>
                      <span className="font-mono font-bold text-foreground truncate max-w-[150px]">{tx.razorpayPaymentId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date</span>
                      <span className="font-bold text-foreground">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span>Status</span>
                      {renderStatusBadge(tx.status)}
                    </div>
                  </div>
                  
                  {tx.bookingId && (
                    <Link
                      href={`/booking/${tx.bookingId}`}
                      className="w-full py-2 bg-muted/65 hover:bg-muted border border-border/20 rounded-xl text-center text-[10px] font-extrabold text-foreground flex items-center justify-center gap-1 mt-1.5"
                    >
                      View Booking Details
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-3xl border border-border/40 bg-card overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="bg-muted/30 border-b border-border/20 text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                  <th className="py-4 px-5">Type / Date</th>
                  <th className="py-4 px-5">Razorpay Order / Payment ID</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Amount</th>
                  <th className="py-4 px-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-y-border/20 text-muted-foreground">
                {transactions.map((tx) => {
                  const typeDetails = getTransactionTypeDetails(tx.type);
                  return (
                    <tr key={tx._id} className="hover:bg-muted/5 transition-colors">
                      <td className="py-4.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl border flex items-center justify-center ${typeDetails.bg.split(' ')[0]} ${typeDetails.bg.split(' ')[1]}`}>
                            {typeDetails.icon}
                          </div>
                          <div>
                            <p className="font-extrabold text-foreground leading-tight">{typeDetails.label}</p>
                            <p className="text-[10px] font-medium text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Calendar className="h-3 w-3 shrink-0" />
                              {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4.5 px-5 font-mono text-[10px]">
                        <p className="font-bold text-foreground">Order: {tx.razorpayOrderId}</p>
                        <p className="text-muted-foreground mt-0.5">Pay: {tx.razorpayPaymentId || 'N/A'}</p>
                      </td>

                      <td className="py-4.5 px-5">
                        {renderStatusBadge(tx.status)}
                      </td>

                      <td className="py-4.5 px-5 text-right font-black text-sm text-foreground">
                        {formatCurrency(tx.amount)}
                      </td>

                      <td className="py-4.5 px-5 text-right">
                        {tx.bookingId && (
                          <Link
                            href={`/booking/${tx.bookingId}`}
                            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors inline-block"
                            title="View Booking Detail"
                          >
                            <ExternalLink className="h-4.5 w-4.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Ledger notice */}
          <div className="rounded-2xl border border-border/20 bg-muted/20 p-4 flex gap-3 text-[10px] text-muted-foreground leading-relaxed font-semibold">
            <HelpCircle className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-extrabold text-foreground">Escrow Holding Policies</p>
              <p className="mt-0.5 leading-relaxed">
                Rent payouts are disbursed directly to owner bank accounts after deduction of the standard 5% platform service commission. Security deposits are captured, secured in an escrow ledger, and automatically refunded to renters within 48 hours of rental return approval, provided no safety disputes are filed.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
