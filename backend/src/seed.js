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
    address: 'Union Square, San Francisco, CA',
    location: {
      type: 'Point',
      coordinates: [-122.4089, 37.7879] // [longitude, latitude]
    }
  },
  {
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    address: 'The Castro, San Francisco, CA',
    location: {
      type: 'Point',
      coordinates: [-122.4316, 37.7699]
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'renter',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
    address: 'Civic Center, San Francisco, CA',
    location: {
      type: 'Point',
      coordinates: [-122.4194, 37.7749]
    }
  }
];

const listingsData = [
  {
    title: 'DeWalt 20V Max Cordless Drill Kit',
    description: 'High-performance cordless drill with 2 batteries, charger, and carrying case. Perfect for home improvement projects, mounting TVs, or assembling furniture.',
    category: 'Tools',
    pricePerDay: 15,
    securityDeposit: 50,
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80'
    ],
    address: 'Union Square, San Francisco, CA',
    location: {
      type: 'Point',
      coordinates: [-122.4089, 37.7879] // Owned by John Doe (Union Square)
    },
    isAvailable: true
  },
  {
    title: 'Sony Alpha 7 III Mirrorless Camera',
    description: 'Premium full-frame camera. Excellent for high-quality photography and 4K videography. Supplied with a 28-70mm lens, 2 batteries, and a 128GB SD card.',
    category: 'Electronics',
    pricePerDay: 45,
    securityDeposit: 250,
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=600&q=80'
    ],
    address: 'Chinatown, San Francisco, CA',
    location: {
      type: 'Point',
      coordinates: [-122.4075, 37.7941] // Near John Doe's area
    },
    isAvailable: true
  },
  {
    title: 'Segway Ninebot Max Electric Scooter',
    description: 'Foldable electric kick scooter with a 40-mile range. Speed up to 18.6 mph. Ideal for commuting, exploring the city, or running errands.',
    category: 'Vehicles',
    pricePerDay: 25,
    securityDeposit: 100,
    images: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1605335198083-d2d0a0b63cc9?auto=format&fit=crop&w=600&q=80'
    ],
    address: 'The Castro, San Francisco, CA',
    location: {
      type: 'Point',
      coordinates: [-122.4316, 37.7699] // Owned by Sarah Connor (Castro)
    },
    isAvailable: true
  },
  {
    title: 'Premium 4-Person Camping Tent',
    description: 'Coleman dome tent with setup in under 5 minutes. Weather-proof with rainfly included. Spacious interior fits a queen size airbed.',
    category: 'Outdoor',
    pricePerDay: 18,
    securityDeposit: 40,
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80'
    ],
    address: 'Noe Valley, San Francisco, CA',
    location: {
      type: 'Point',
      coordinates: [-122.4350, 37.7550] // Near Sarah Connor's area
    },
    isAvailable: true
  },
  {
    title: 'JBL PartyBox 310 Bluetooth Speaker',
    description: '240W of powerful sound, dynamic light show synced to the beat, and 18 hours of battery life. Perfect for backyard parties, beach events, or weddings.',
    category: 'Party Supplies',
    pricePerDay: 35,
    securityDeposit: 150,
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80'
    ],
    address: 'Mission District, San Francisco, CA',
    location: {
      type: 'Point',
      coordinates: [-122.4148, 37.7599] // Owned by Sarah Connor
    },
    isAvailable: true
  },
  {
    title: 'Patagonia Retro-X Fleece Jacket (Size M)',
    description: 'Windproof, warm, and stylish fleece jacket. Great for cold San Francisco evenings or outdoor hiking trips.',
    category: 'Fashion',
    pricePerDay: 12,
    securityDeposit: 30,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80'
    ],
    address: 'SOMA, San Francisco, CA',
    location: {
      type: 'Point',
      coordinates: [-122.4010, 37.7785] // Owned by John Doe
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
    console.log('Cleared existing data.');

    // 1. Create Users
    const users = [];
    for (const u of usersData) {
      const createdUser = await User.create(u);
      users.push(createdUser);
    }
    console.log(`Seeded ${users.length} users.`);

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

    // 3. Create Reviews
    const reviewsData = [
      {
        listing: listings[0]._id, // Drill
        reviewer: jane._id,
        rating: 5,
        comment: 'Great drill, came fully charged and made our mounting task super easy. Highly recommend John!'
      },
      {
        listing: listings[0]._id, // Drill
        reviewer: sarah._id,
        rating: 4,
        comment: 'Worked perfectly. The user experience was smooth and John was very helpful with instructions.'
      },
      {
        listing: listings[1]._id, // Camera
        reviewer: jane._id,
        rating: 5,
        comment: 'Amazing camera condition. Used it for a weekend shoot and the footage was professional-grade.'
      },
      {
        listing: listings[2]._id, // Scooter
        reviewer: jane._id,
        rating: 5,
        comment: 'So much fun riding around SF on this scooter! Batterylife was excellent. Sarah was super nice.'
      },
      {
        listing: listings[3]._id, // Tent
        reviewer: john._id,
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
