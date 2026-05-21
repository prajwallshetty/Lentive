const express = require('express');
const {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
} = require('../middleware/validation');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.get('/verifyemail/:verifytoken', verifyEmail);
router.post('/resendverification', protect, resendVerification);
router.post('/forgotpassword', validateForgotPassword, forgotPassword);
router.put('/resetpassword/:resettoken', validateResetPassword, resetPassword);

module.exports = router;

