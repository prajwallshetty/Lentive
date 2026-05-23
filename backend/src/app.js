const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Set security headers
app.use(helmet());

// Prevent NoSQL injection
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Mount routers
const auth = require('./routes/auth');
const listings = require('./routes/listings');
const bookings = require('./routes/bookings');
const notifications = require('./routes/notifications');
const chats = require('./routes/chats');
const payments = require('./routes/payments');
const admin = require('./routes/admin');
const reviews = require('./routes/reviews');

app.use('/api/auth', auth);
app.use('/api/listings', listings);
app.use('/api/bookings', bookings);
app.use('/api/notifications', notifications);
app.use('/api/chats', chats);
app.use('/api/payments', payments);
app.use('/api/admin', admin);
app.use('/api/reviews', reviews);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Lentive API Server is running smoothly' });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
