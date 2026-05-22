const validateCreateOrderInput = (data) => {
  const { bookingId } = data;
  const errors = [];

  if (!bookingId) {
    errors.push('Please provide a bookingId');
  } else if (!/^[0-9a-fA-F]{24}$/.test(bookingId)) {
    errors.push('Invalid bookingId format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateVerifyPaymentInput = (data) => {
  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;
  const errors = [];

  if (!bookingId) {
    errors.push('Please provide a bookingId');
  } else if (!/^[0-9a-fA-F]{24}$/.test(bookingId)) {
    errors.push('Invalid bookingId format');
  }

  if (!razorpayOrderId) {
    errors.push('Please provide a razorpayOrderId');
  }

  if (razorpaySignature && !razorpayPaymentId) {
    errors.push('Please provide razorpayPaymentId along with signature');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateCreateOrderInput,
  validateVerifyPaymentInput
};
