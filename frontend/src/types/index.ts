export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: 'renter' | 'owner' | 'admin';
  avatar: string;
  address: string;
  isVerified: boolean;
  verificationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  verificationRemarks?: string;
  ratings?: {
    average: number;
    count: number;
  };
  createdAt: string;
}

export interface Listing {
  _id: string;
  title: string;
  description: string;
  category: 'Tools' | 'Electronics' | 'Vehicles' | 'Fashion' | 'Outdoor' | 'Party Supplies' | 'Other';
  pricePerDay: number;
  securityDeposit: number;
  images: string[];
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  owner: User | string;
  isAvailable: boolean;
  ratings?: {
    average: number;
    count: number;
  };
  createdAt: string;
}

export interface Booking {
  _id: string;
  listingId: Listing | string;
  listing?: Listing; // Backwards compatibility for UI mapping
  renterId: User | string;
  renter?: User; // Backwards compatibility for UI mapping
  ownerId: User | string;
  owner?: User; // Backwards compatibility for UI mapping
  startDate: string;
  endDate: string;
  totalDays: number;
  totalAmount: number;
  depositAmount: number;
  bookingStatus: 'pending' | 'accepted' | 'rejected' | 'active' | 'completed' | 'cancelled';
  paymentId?: string;
  paymentStatus: 'pending' | 'captured' | 'failed';
  createdAt: string;
  
  // Custom mapped properties for frontend ease of use
  role?: 'renter' | 'owner';
  status?: 'pending' | 'accepted' | 'rejected' | 'active' | 'completed' | 'cancelled';
  totalPrice?: number;
  securityDeposit?: number;
}

export interface Review {
  _id: string;
  listing: string;
  reviewer: User;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: User | string;
  type: string;
  booking?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  _id?: string;
  sender: string | User;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatThread {
  _id: string;
  participants: User[];
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
