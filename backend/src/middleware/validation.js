const {
  validateRegisterInput,
  validateLoginInput,
  validateForgotPasswordInput,
  validateResetPasswordInput
} = require('../validations/auth');

const { validateListingInput } = require('../validations/listings');
const { validateBookingInput } = require('../validations/bookings');

const {
  validateCreateOrderInput,
  validateVerifyPaymentInput
} = require('../validations/payments');

const validateRegister = (req, res, next) => {
  const { isValid, errors } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json({ success: false, error: errors[0] });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { isValid, errors } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json({ success: false, error: errors[0] });
  }
  next();
};

const validateForgotPassword = (req, res, next) => {
  const { isValid, errors } = validateForgotPasswordInput(req.body);
  if (!isValid) {
    return res.status(400).json({ success: false, error: errors[0] });
  }
  next();
};

const validateResetPassword = (req, res, next) => {
  const { isValid, errors } = validateResetPasswordInput(req.body);
  if (!isValid) {
    return res.status(400).json({ success: false, error: errors[0] });
  }
  next();
};

const validateListing = (req, res, next) => {
  const { isValid, errors } = validateListingInput(req.body);
  if (!isValid) {
    return res.status(400).json({ success: false, error: errors[0] });
  }
  next();
};

const validateBooking = (req, res, next) => {
  const { isValid, errors } = validateBookingInput(req.body);
  if (!isValid) {
    return res.status(400).json({ success: false, error: errors[0] });
  }
  next();
};

const validateCreateOrder = (req, res, next) => {
  const { isValid, errors } = validateCreateOrderInput(req.body);
  if (!isValid) {
    return res.status(400).json({ success: false, error: errors[0] });
  }
  next();
};

const validateVerifyPayment = (req, res, next) => {
  const { isValid, errors } = validateVerifyPaymentInput(req.body);
  if (!isValid) {
    return res.status(400).json({ success: false, error: errors[0] });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateListing,
  validateBooking,
  validateCreateOrder,
  validateVerifyPayment
};
