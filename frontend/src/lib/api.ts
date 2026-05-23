const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get auth headers
const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const api = {
  // Authentication
  auth: {
    async register(data: any) {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Registration failed');
      return json;
    },
    async login(data: any) {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Login failed');
      return json;
    },
    async me() {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch user');
      return json;
    },
    async forgotPassword(email: string) {
      const res = await fetch(`${API_URL}/auth/forgotpassword`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to request password reset');
      return json;
    },
    async resetPassword(token: string, data: any) {
      const res = await fetch(`${API_URL}/auth/resetpassword/${token}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Password reset failed');
      return json;
    },
    async verifyEmail(token: string) {
      const res = await fetch(`${API_URL}/auth/verifyemail/${token}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Email verification failed');
      return json;
    },
    async resendVerification() {
      const res = await fetch(`${API_URL}/auth/resendverification`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to resend verification email');
      return json;
    },
    async uploadDocument(document: string) {
      const res = await fetch(`${API_URL}/auth/verify-document`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ document }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to upload verification document');
      return json;
    },
    async verifyDrivingLicense(document: string) {
      const res = await fetch(`${API_URL}/auth/verify-driving-license`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ document }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to upload driving license');
      return json;
    },
    async sendPhoneOtp(phone: string) {
      const res = await fetch(`${API_URL}/auth/send-phone-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send verification SMS');
      return json;
    },
    async verifyPhoneOtp(otp: string) {
      const res = await fetch(`${API_URL}/auth/verify-phone-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ otp }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to verify OTP code');
      return json;
    },
  },

  // Listings
  listings: {
    async getAll(params: {
      lng?: number;
      lat?: number;
      distance?: number;
      category?: string;
      query?: string;
      minPrice?: number;
      maxPrice?: number;
    } = {}) {
      const queryParams = new URLSearchParams();
      
      if (params.lng !== undefined && params.lat !== undefined) {
        queryParams.append('lng', params.lng.toString());
        queryParams.append('lat', params.lat.toString());
        if (params.distance) queryParams.append('distance', params.distance.toString());
      }
      
      if (params.category && params.category !== 'All') {
        queryParams.append('category', params.category);
      }
      
      if (params.query) {
        queryParams.append('query', params.query);
      }

      if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());

      const res = await fetch(`${API_URL}/listings?${queryParams.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch listings');
      return json;
    },

    async getOne(id: string) {
      const res = await fetch(`${API_URL}/listings/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch listing');
      return json;
    },

    async create(data: any) {
      const res = await fetch(`${API_URL}/listings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create listing');
      return json;
    },
    
    async update(id: string, data: any) {
      const res = await fetch(`${API_URL}/listings/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update listing');
      return json;
    },

    async delete(id: string) {
      const res = await fetch(`${API_URL}/listings/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete listing');
      return json;
    },
    
    async getAvailability(id: string) {
      const res = await fetch(`${API_URL}/listings/${id}/availability`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch listing availability');
      return json;
    },
    async getMy() {
      const res = await fetch(`${API_URL}/listings/my`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch my listings');
      return json;
    },
  },

  // Bookings
  bookings: {
    async create(data: { listingId: string; startDate: string; endDate: string; paymentId?: string; paymentStatus?: string }) {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create booking');
      return json;
    },

    async getRenterBookings() {
      const res = await fetch(`${API_URL}/bookings/renter`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch renter bookings');
      return json;
    },

    async getOwnerBookings() {
      const res = await fetch(`${API_URL}/bookings/owner`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch owner bookings');
      return json;
    },

    async updateStatus(id: string, status: 'pending' | 'accepted' | 'rejected' | 'active' | 'completed' | 'cancelled') {
      const res = await fetch(`${API_URL}/bookings/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update booking status');
      return json;
    },

    async accept(id: string) {
      const res = await fetch(`${API_URL}/bookings/${id}/accept`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to accept booking');
      return json;
    },

    async reject(id: string) {
      const res = await fetch(`${API_URL}/bookings/${id}/reject`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to reject booking');
      return json;
    },

    async cancel(id: string) {
      const res = await fetch(`${API_URL}/bookings/${id}/cancel`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to cancel booking');
      return json;
    },
  },

  // Notifications
  notifications: {
    async getAll() {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch notifications');
      return json;
    },

    async markAsRead(id: string) {
      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to mark notification as read');
      return json;
    },
  },

  // Reviews
  reviews: {
    async getForListing(listingId: string) {
      const res = await fetch(`${API_URL}/listings/${listingId}/reviews`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch reviews');
      return json;
    },
    async create(listingId: string, data: { rating: number; comment: string }) {
      const res = await fetch(`${API_URL}/listings/${listingId}/reviews`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit review');
      return json;
    },
    async createBookingReview(bookingId: string, data: { rating: number; comment: string }) {
      const res = await fetch(`${API_URL}/reviews/booking/${bookingId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit booking review');
      return json;
    },
  },

  // Chats
  chats: {
    async getAll() {
      const res = await fetch(`${API_URL}/chats`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch chats');
      return json;
    },
    async getHistory(userId: string) {
      const res = await fetch(`${API_URL}/chats/${userId}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch chat history');
      return json;
    },
    async sendMessage(recipientId: string, message: string) {
      const res = await fetch(`${API_URL}/chats`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ recipientId, message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send message');
      return json;
    },
  },

  // Payments
  payments: {
    async createOrder(bookingId: string) {
      const res = await fetch(`${API_URL}/payments/order`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ bookingId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to initialize payment order');
      return json;
    },
    async verifyPayment(data: {
      razorpayOrderId: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
      bookingId: string;
    }) {
      const res = await fetch(`${API_URL}/payments/verify`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to verify payment');
      return json;
    },
    async getHistory() {
      const res = await fetch(`${API_URL}/payments/history`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch payment history');
      return json;
    },
    async disputeDeposit(depositId: string, disputeReason: string) {
      const res = await fetch(`${API_URL}/payments/deposits/${depositId}/dispute`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ disputeReason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to dispute deposit');
      return json;
    },
  },

  // Admin
  admin: {
    async getAnalytics() {
      const res = await fetch(`${API_URL}/admin/analytics`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch admin analytics');
      return json;
    },
    async getUsers() {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch users');
      return json;
    },
    async verifyUser(userId: string, status: 'approved' | 'rejected', remarks?: string) {
      const res = await fetch(`${API_URL}/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, remarks }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update user verification');
      return json;
    },
    async getListings() {
      const res = await fetch(`${API_URL}/admin/listings`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch listings');
      return json;
    },
    async moderateListing(listingId: string) {
      const res = await fetch(`${API_URL}/admin/listings/${listingId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete/moderate listing');
      return json;
    },
    async getBookings() {
      const res = await fetch(`${API_URL}/admin/bookings`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch bookings');
      return json;
    },
    async getVerificationRequests() {
      const res = await fetch(`${API_URL}/admin/verification-requests`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch verification requests');
      return json;
    },
    async verifyVerificationRequest(requestId: string, status: 'approved' | 'rejected', remarks?: string) {
      const res = await fetch(`${API_URL}/admin/verification-requests/${requestId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, remarks }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update verification request');
      return json;
    },
    async getDeposits() {
      const res = await fetch(`${API_URL}/admin/deposits`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch security deposits');
      return json;
    },
    async resolveDepositDispute(depositId: string, resolution: 'release_to_renter' | 'payout_to_owner', remarks?: string) {
      const res = await fetch(`${API_URL}/admin/deposits/${depositId}/resolve`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ resolution, remarks }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to resolve deposit dispute');
      return json;
    },
  },
};
