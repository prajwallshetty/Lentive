const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('./models/User');
const Listing = require('./models/Listing');
const Booking = require('./models/Booking');
const Review = require('./models/Review');

// Load env variables
dotenv.config();

const usersData = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    address: 'Indiranagar, Bengaluru, Karnataka, India',
    location: {
      type: 'Point',
      coordinates: [77.6412, 12.9719] // [longitude, latitude]
    },
    isVerified: true,
    verificationStatus: 'approved'
  },
  {
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    address: 'Koramangala, Bengaluru, Karnataka, India',
    location: {
      type: 'Point',
      coordinates: [77.6245, 12.9352]
    },
    isVerified: true,
    verificationStatus: 'approved'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'renter',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
    address: 'HSR Layout, Bengaluru, Karnataka, India',
    location: {
      type: 'Point',
      coordinates: [77.6387, 12.9101]
    },
    isVerified: true,
    verificationStatus: 'approved'
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    address: 'Whitefield, Bengaluru, Karnataka, India',
    location: {
      type: 'Point',
      coordinates: [77.7499, 12.9698]
    },
    isVerified: true,
    verificationStatus: 'approved'
  }
];

const listingsData = [
  {
    title: 'DeWalt 20V Max Cordless Drill Kit',
    description: 'High-performance cordless drill with 2 batteries, charger, and carrying case. Perfect for home improvement projects, mounting TVs, or assembling furniture.',
    category: 'Tools',
    pricePerDay: 400,
    securityDeposit: 1500,
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80'
    ],
    address: 'Indiranagar, Bengaluru, Karnataka, India',
    location: {
      type: 'Point',
      coordinates: [77.6412, 12.9719] // Owned by John Doe (Indiranagar)
    },
    isAvailable: true
  },
  {
    title: 'Sony Alpha 7 III Mirrorless Camera',
    description: 'Premium full-frame camera. Excellent for high-quality photography and 4K videography. Supplied with a 28-70mm lens, 2 batteries, and a 128GB SD card.',
    category: 'Electronics',
    pricePerDay: 2500,
    securityDeposit: 10000,
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=600&q=80'
    ],
    address: 'Domlur, Bengaluru, Karnataka, India',
    location: {
      type: 'Point',
      coordinates: [77.6380, 12.9620] // Near John Doe's area
    },
    isAvailable: true
  },
  {
    title: 'Segway Ninebot Max Electric Scooter',
    description: 'Foldable electric kick scooter with a 40-mile range. Speed up to 18.6 mph. Ideal for commuting, exploring the city, or running errands.',
    category: 'Vehicles',
    pricePerDay: 800,
    securityDeposit: 4000,
    images: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1605335198083-d2d0a0b63cc9?auto=format&fit=crop&w=600&q=80'
    ],
    address: 'Koramangala, Bengaluru, Karnataka, India',
    location: {
      type: 'Point',
      coordinates: [77.6245, 12.9352] // Owned by Sarah Connor (Koramangala)
    },
    isAvailable: true
  },
  {
    title: 'Premium 4-Person Camping Tent',
    description: 'Coleman dome tent with setup in under 5 minutes. Weather-proof with rainfly included. Spacious interior fits a queen size airbed.',
    category: 'Outdoor',
    pricePerDay: 500,
    securityDeposit: 2000,
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80'
    ],
    address: 'HSR Layout Sector 3, Bengaluru, Karnataka, India',
    location: {
      type: 'Point',
      coordinates: [77.6300, 12.9150] // Near Sarah Connor's area
    },
    isAvailable: true
  },
  {
    title: 'JBL PartyBox 310 Bluetooth Speaker',
    description: '240W of powerful sound, dynamic light show synced to the beat, and 18 hours of battery life. Perfect for backyard parties, events, or weddings.',
    category: 'Party Supplies',
    pricePerDay: 1500,
    securityDeposit: 5000,
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80'
    ],
    address: 'Koramangala, Bengaluru, Karnataka, India',
    location: {
      type: 'Point',
      coordinates: [77.6245, 12.9352] // Owned by Sarah Connor
    },
    isAvailable: true
  },
  {
    title: 'Patagonia Retro-X Fleece Jacket (Size M)',
    description: 'Windproof, warm, and stylish fleece jacket. Great for cold evenings or outdoor trekking trips.',
    category: 'Fashion',
    pricePerDay: 300,
    securityDeposit: 1000,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80'
    ],
    address: 'Indiranagar, Bengaluru, Karnataka, India',
    location: {
      type: 'Point',
      coordinates: [77.6412, 12.9719] // Owned by John Doe
    },
    isAvailable: true
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lentive');
    console.log('Connected to MongoDB for seeding...');

    // Clear DB
    await User.deleteMany();
    await Listing.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();
    
    // Import and clear new models
    const Chat = require('./models/Chat');
    const Payment = require('./models/Payment');
    const Deposit = require('./models/Deposit');
    const VerificationRequest = require('./models/VerificationRequest');
    const Notification = require('./models/Notification');
    await Chat.deleteMany();
    await Payment.deleteMany();
    await Deposit.deleteMany();
    await VerificationRequest.deleteMany();
    await Notification.deleteMany();
    
    console.log('Cleared existing data.');

    // 1. Create Users
    const users = [];
    for (const u of usersData) {
      // Add custom phone, license and verification fields for seeder
      if (u.name === 'John Doe') {
        u.phone = '+919876543210';
        u.isPhoneVerified = true;
        u.verificationLevel = 'Trusted User';
        u.drivingLicenseStatus = 'approved';
        u.drivingLicense = 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=300&q=80';
      } else if (u.name === 'Sarah Connor') {
        u.phone = '+919876543211';
        u.isPhoneVerified = true;
        u.verificationLevel = 'ID Verified';
      } else if (u.name === 'Jane Smith') {
        u.phone = '+919876543212';
        u.isPhoneVerified = true;
        u.verificationLevel = 'Basic Verified';
      }

      const createdUser = await User.create(u);
      users.push(createdUser);
    }
    console.log(`Seeded ${users.length} users with updated verification levels.`);

    // Map owners
    const john = users.find(u => u.name === 'John Doe');
    const sarah = users.find(u => u.name === 'Sarah Connor');
    const jane = users.find(u => u.name === 'Jane Smith');

    // 2. Create Listings
    const listings = [];
    for (const item of listingsData) {
      if (item.category === 'Tools' || item.category === 'Electronics' || item.category === 'Fashion') {
        item.owner = john._id;
      } else {
        item.owner = sarah._id;
      }
      const createdListing = await Listing.create(item);
      listings.push(createdListing);
    }
    console.log(`Seeded ${listings.length} listings.`);

    // 3. Create Completed Bookings for Reviews
    const bookingsData = [
      {
        listingId: listings[0]._id, // Drill (John)
        renterId: jane._id,
        ownerId: john._id,
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-03'),
        totalDays: 2,
        totalAmount: 800,
        depositAmount: 1500,
        bookingStatus: 'completed',
        paymentStatus: 'captured',
        paymentId: 'pay_seeded_1'
      },
      {
        listingId: listings[0]._id, // Drill (John)
        renterId: sarah._id,
        ownerId: john._id,
        startDate: new Date('2026-05-04'),
        endDate: new Date('2026-05-05'),
        totalDays: 1,
        totalAmount: 400,
        depositAmount: 1500,
        bookingStatus: 'completed',
        paymentStatus: 'captured',
        paymentId: 'pay_seeded_2'
      },
      {
        listingId: listings[1]._id, // Camera (John)
        renterId: jane._id,
        ownerId: john._id,
        startDate: new Date('2026-05-10'),
        endDate: new Date('2026-05-14'),
        totalDays: 4,
        totalAmount: 10000,
        depositAmount: 10000,
        bookingStatus: 'completed',
        paymentStatus: 'captured',
        paymentId: 'pay_seeded_3'
      },
      {
        listingId: listings[2]._id, // Scooter (Sarah)
        renterId: jane._id,
        ownerId: sarah._id,
        startDate: new Date('2026-05-08'),
        endDate: new Date('2026-05-10'),
        totalDays: 2,
        totalAmount: 1600,
        depositAmount: 4000,
        bookingStatus: 'completed',
        paymentStatus: 'captured',
        paymentId: 'pay_seeded_4'
      },
      {
        listingId: listings[3]._id, // Tent (Sarah)
        renterId: john._id,
        ownerId: sarah._id,
        startDate: new Date('2026-05-12'),
        endDate: new Date('2026-05-15'),
        totalDays: 3,
        totalAmount: 1500,
        depositAmount: 2000,
        bookingStatus: 'completed',
        paymentStatus: 'captured',
        paymentId: 'pay_seeded_5'
      }
    ];

    const bookings = [];
    for (const b of bookingsData) {
      const createdBooking = await Booking.create(b);
      bookings.push(createdBooking);

      // Seed Deposit logs (escrow refunded since completed)
      if (b.depositAmount > 0) {
        await Deposit.create({
          bookingId: createdBooking._id,
          renterId: b.renterId,
          ownerId: b.ownerId,
          amount: b.depositAmount,
          status: 'released'
        });
      }

      // Seed Payment logs
      await Payment.create({
        bookingId: createdBooking._id,
        userId: b.renterId,
        amount: b.totalAmount + b.depositAmount,
        razorpayOrderId: `order_seeded_${createdBooking._id}`,
        razorpayPaymentId: b.paymentId,
        type: 'booking',
        status: 'captured'
      });
    }
    console.log(`Seeded ${bookings.length} completed booking logs, payments, and deposits.`);

    // 4. Create Reviews (linked to completed bookings)
    const reviewsData = [
      {
        booking: bookings[0]._id,
        listing: listings[0]._id, // Drill
        reviewer: jane._id,
        reviewee: john._id,
        type: 'renter',
        rating: 5,
        comment: 'Great drill, came fully charged and made our mounting task super easy. Highly recommend John!'
      },
      {
        booking: bookings[1]._id,
        listing: listings[0]._id, // Drill
        reviewer: sarah._id,
        reviewee: john._id,
        type: 'renter',
        rating: 4,
        comment: 'Worked perfectly. The user experience was smooth and John was very helpful with instructions.'
      },
      {
        booking: bookings[2]._id,
        listing: listings[1]._id, // Camera
        reviewer: jane._id,
        reviewee: john._id,
        type: 'renter',
        rating: 5,
        comment: 'Amazing camera condition. Used it for a weekend shoot and the footage was professional-grade.'
      },
      {
        booking: bookings[3]._id,
        listing: listings[2]._id, // Scooter
        reviewer: jane._id,
        reviewee: sarah._id,
        type: 'renter',
        rating: 5,
        comment: 'So much fun riding around Bengaluru on this scooter! Batterylife was excellent. Sarah was super nice.'
      },
      {
        booking: bookings[4]._id,
        listing: listings[3]._id, // Tent
        reviewer: john._id,
        reviewee: sarah._id,
        type: 'renter',
        rating: 4,
        comment: 'Nice tent, setup was really easy. Clean and had all instructions. Thank you Sarah!'
      }
    ];

    for (const r of reviewsData) {
      await Review.create(r);
    }
    console.log('Seeded reviews and triggered rating aggregations.');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
