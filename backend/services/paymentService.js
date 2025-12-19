import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create Razorpay order
 * @param {Number} amount - Amount in rupees
 * @param {String} currency - Currency code (default: INR)
 * @param {String} receipt - Receipt ID
 * @returns {Promise<Object>} Order details
 */
export const createOrder = async (amount, currency = 'INR', receipt) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }

    // Ensure receipt is max 40 characters (Razorpay requirement)
    let finalReceipt = receipt || `rcpt_${Date.now().toString().slice(-8)}`;
    if (finalReceipt.length > 40) {
      // Truncate to 40 characters if too long
      finalReceipt = finalReceipt.substring(0, 40);
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: finalReceipt,
      payment_capture: 1 // Auto capture payment
    };

    const order = await razorpay.orders.create(options);
    
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    
    // Extract detailed error message from Razorpay error object
    let errorMessage = 'Failed to create payment order';
    if (error.error && error.error.description) {
      errorMessage = error.error.description;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Verify Razorpay payment signature
 * @param {String} razorpay_order_id - Order ID from Razorpay
 * @param {String} razorpay_payment_id - Payment ID from Razorpay
 * @param {String} razorpay_signature - Signature from Razorpay
 * @returns {Boolean} True if signature is valid
 */
export const verifyPayment = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay key secret not configured');
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;
    return isAuthentic;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
};

/**
 * Get Razorpay key ID for frontend
 * @returns {String} Razorpay key ID
 */
export const getRazorpayKeyId = () => {
  return process.env.RAZORPAY_KEY_ID || '';
};

