const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayInstance = null;
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (keyId && keySecret) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  } catch (err) {
    console.error('Razorpay initialization failed:', err.message);
  }
}

/**
 * Check if the payment system is running in simulation mode (no keys provided)
 * @returns {boolean}
 */
const isSimulatedMode = () => {
  return !razorpayInstance;
};

/**
 * Get Razorpay Key ID
 * @returns {string|undefined}
 */
const getKeyId = () => {
  return keyId;
};

/**
 * Create a payment order
 * @param {string} bookingId 
 * @param {number} amountInINR 
 * @returns {Promise<object>} Order object and simulation details
 */
const createPaymentOrder = async (bookingId, amountInINR) => {
  const amountInPaise = Math.round(amountInINR * 100);
  const receipt = `receipt_booking_${bookingId}`;

  if (razorpayInstance) {
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt
    };
    const order = await razorpayInstance.orders.create(options);
    return {
      order,
      isSimulated: false,
      keyId
    };
  } else {
    const order = {
      id: `order_simulated_${crypto.randomBytes(8).toString('hex')}`,
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      status: 'created'
    };
    return {
      order,
      isSimulated: true,
      keyId: null
    };
  }
};

/**
 * Verify Razorpay payment signature
 * @param {object} params 
 * @param {string} params.razorpayOrderId 
 * @param {string} [params.razorpayPaymentId] 
 * @param {string} [params.razorpaySignature] 
 * @returns {boolean} Whether the payment is verified
 */
const verifyPaymentSignature = (params) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  if (razorpayInstance) {
    if (!razorpayPaymentId || !razorpaySignature) {
      throw new Error('Please provide razorpayPaymentId and razorpaySignature for verification');
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    return generatedSignature === razorpaySignature;
  }

  // Simulated sandbox checkout verification always returns true
  return true;
};

/**
 * Verify Webhook signature
 * @param {object} body 
 * @param {string} signatureHeader 
 * @returns {boolean} Whether the webhook signature is valid
 */
const verifyWebhookSignature = (body, signatureHeader) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return true; // Webhook verification skipped if secret not configured
  }

  const shasum = crypto.createHmac('sha256', webhookSecret);
  shasum.update(JSON.stringify(body));
  const digest = shasum.digest('hex');

  return digest === signatureHeader;
};

/**
 * Refund a payment (full or partial)
 * @param {string} paymentId 
 * @param {number} [amountInINR] - Optional amount to refund. If omitted, refunds the full amount.
 * @returns {Promise<object>} Refund details
 */
const refundPayment = async (paymentId, amountInINR) => {
  if (razorpayInstance) {
    const options = {};
    if (amountInINR) {
      options.amount = Math.round(amountInINR * 100); // Convert to paise
    }
    return await razorpayInstance.payments.refund(paymentId, options);
  } else {
    // Simulated refund
    return {
      id: `rfnd_simulated_${crypto.randomBytes(8).toString('hex')}`,
      payment_id: paymentId,
      amount: amountInINR ? Math.round(amountInINR * 100) : 0,
      status: 'processed',
      created_at: Math.floor(Date.now() / 1000)
    };
  }
};

module.exports = {
  isSimulatedMode,
  getKeyId,
  createPaymentOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  refundPayment
};
