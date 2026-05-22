const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, address, coordinates } = req.body;

    // Create location GeoJSON if coordinates are provided
    let location = undefined;
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      location = {
        type: 'Point',
        coordinates: [Number(coordinates[0]), Number(coordinates[1])] // [lng, lat]
      };
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role: role || 'renter',
      address: address || '',
      location
    });

    // Generate email verification token
    const verifyToken = user.getVerificationToken();

    await user.save();

    // Create verification URL
    const frontendVerifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verifyToken}`;
    const message = `Welcome to Lentive! Please verify your email by clicking the link below:\n\n${frontendVerifyUrl}\n\nThis verification link will expire in 24 hours.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Lentive - Email Verification Request',
        message
      });
    } catch (err) {
      console.log('Verification email could not be sent', err);
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verifyemail/:verifytoken
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.verifytoken)
      .digest('hex');

    const user = await User.findOne({
      verificationToken,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired email verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Resend email verification token
// @route   POST /api/auth/resendverification
// @access  Private
exports.resendVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, error: 'User is already verified' });
    }

    const verifyToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });

    const frontendVerifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verifyToken}`;
    const message = `Please verify your email address by clicking the link below:\n\n${frontendVerifyUrl}\n\nThis verification link will expire in 24 hours.`;

    await sendEmail({
      email: user.email,
      subject: 'Lentive - Email Verification Link',
      message
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: 'There is no user with that email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const frontendResetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the link below to complete the process:\n\n${frontendResetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n\nThis reset link will expire in 10 minutes.`;

    let simulatedLink = undefined;
    try {
      const emailResult = await sendEmail({
        email: user.email,
        subject: 'Lentive - Password Reset Request',
        message
      });
      if (emailResult && emailResult.simulated) {
        simulatedLink = frontendResetUrl;
      }
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      ...(simulatedLink && { simulatedLink })
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired password reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Upload Identity Verification Document
// @route   PUT /api/auth/verify-document
// @access  Private
exports.uploadDocument = async (req, res, next) => {
  try {
    const { document } = req.body;

    if (!document) {
      return res.status(400).json({ success: false, error: 'Please provide a document (base64 or URL)' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.verificationDocument = document;
    user.verificationStatus = 'pending';
    user.verificationRemarks = '';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Verification document uploaded successfully. Status is now pending approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
        location: user.location,
        ratings: user.ratings,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        verificationDocument: user.verificationDocument,
        verificationRemarks: user.verificationRemarks
      }
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to sign JWT and return token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      location: user.location,
      ratings: user.ratings,
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus,
      verificationDocument: user.verificationDocument,
      verificationRemarks: user.verificationRemarks
    }
  });
};

