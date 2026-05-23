'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDashboardStore } from '../../store/dashboardStore';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Bell, BellOff, CheckCheck, Calendar, ShieldCheck, ShieldAlert, 
  MessageSquare, Star, ArrowRight, Loader2, Info 
} from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { 
    notifications, 
    fetchNotifications, 
    markNotificationAsRead, 
    loading: notificationsLoading 
  } = useDashboardStore();

  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleMarkAsRead = async (id: string, bookingId?: string) => {
    try {
      await markNotificationAsRead(id);
      if (bookingId) {
        router.push(`/booking/${bookingId}`);
      }
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) {
      showToast('All notifications are already marked as read.', 'info');
      return;
    }

    setMarkingAll(true);
    try {
      await Promise.all(unread.map(n => markNotificationAsRead(n._id)));
      showToast('All notifications marked as read.', 'success');
      await fetchNotifications();
    } catch (err: any) {
      showToast('Failed to mark all notifications as read.', 'error');
    } finally {
      setMarkingAll(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Loading inbox...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 gap-4 max-w-md mx-auto">
        <div className="h-16 w-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
          <Bell className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-foreground">Sign in to view notifications</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Stay updated on your booking requests status, payments escrow status, and direct chats from owners.
        </p>
        <Link
          href="/login?redirect=/notifications"
          className="w-full py-3 bg-primary hover:brightness-110 text-white font-extrabold rounded-xl transition-all duration-200 shadow-md shadow-primary/20 text-xs tracking-wide active:scale-95 cursor-pointer block text-center"
        >
          Sign In / Register
        </Link>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t === 'requested' || t === 'booking') {
      return (
        <div className="h-9 w-9 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Calendar className="h-4.5 w-4.5" />
        </div>
      );
    } else if (t === 'accepted' || t === 'completed') {
      return (
        <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-4.5 w-4.5" />
        </div>
      );
    } else if (t === 'rejected' || t === 'cancelled') {
      return (
        <div className="h-9 w-9 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center shrink-0">
          <ShieldAlert className="h-4.5 w-4.5" />
        </div>
      );
    } else if (t === 'chat' || t === 'message') {
      return (
        <div className="h-9 w-9 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <MessageSquare className="h-4.5 w-4.5" />
        </div>
      );
    } else if (t === 'review') {
      return (
        <div className="h-9 w-9 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Star className="h-4.5 w-4.5 fill-amber-500" />
        </div>
      );
    }
    return (
      <div className="h-9 w-9 rounded-full bg-muted text-muted-foreground border border-border/20 flex items-center justify-center shrink-0">
        <Info className="h-4.5 w-4.5" />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notifications
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
            You have {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''} in your inbox.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-muted/65 hover:bg-muted border border-border/30 hover:border-primary/20 text-muted-foreground hover:text-primary rounded-xl transition-all duration-200 text-xs font-extrabold cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {markingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Loading list state */}
      {notificationsLoading && notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-7 w-7 text-primary animate-spin" />
          <p className="text-xs font-bold text-muted-foreground">Syncing inbox alerts...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-3xl border border-border/40 bg-card p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 border border-border/20 mb-1">
            <BellOff className="h-7 w-7" />
          </div>
          <h3 className="font-extrabold text-sm text-foreground">Inbox is empty</h3>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            When you receive active bookings, reviews, or chat updates, they will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleMarkAsRead(n._id, n.booking)}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                n.isRead
                  ? 'border-border/30 bg-muted/5 hover:bg-muted/15'
                  : 'border-primary/20 bg-primary/5 hover:bg-primary/10 shadow-xs'
              }`}
            >
              {getNotificationIcon(n.type)}

              <div className="flex-grow">
                <div className="flex items-start justify-between gap-4">
                  <p className={`text-xs leading-relaxed ${n.isRead ? 'text-muted-foreground font-semibold' : 'text-foreground font-extrabold'}`}>
                    {n.message}
                  </p>
                  
                  {/* Mark as Read link indicator */}
                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" title="Unread notification" />
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2 text-[9px] text-muted-foreground font-bold">
                  <span>{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  <span>•</span>
                  <span>{new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  {n.booking && (
                    <>
                      <span>•</span>
                      <span className="text-primary hover:underline inline-flex items-center gap-0.5">
                        Track Rental <ArrowRight className="h-2.5 w-2.5" />
                      </span>
                    </>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
