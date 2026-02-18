const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// Create Checkout Session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body; // 'basic' or 'premium'
    const userId = req.user._id.toString();

    // Define pricing
    const prices = {
      basic: { amount: 999, name: 'StreamX Basic Plan — $9.99/month' },
      premium: { amount: 1999, name: 'StreamX Premium Plan — $19.99/month' }
    };

    if (!prices[plan]) {
      return res.status(400).json({ message: 'Invalid plan. Choose basic or premium.' });
    }

    // Create Stripe Checkout Session (one-time payment for simplicity)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: prices[plan].name,
            },
            unit_amount: prices[plan].amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      client_reference_id: userId,
      metadata: {
        userId,
        plan
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe createCheckoutSession error:', error.message);
    res.status(500).json({ message: 'Payment error', error: error.message });
  }
};

// Verify Payment and Create Subscription
exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    // Check if this session was already verified (prevent duplicates)
    const existingSub = await Subscription.findOne({ stripeSessionId: sessionId });
    if (existingSub) {
      return res.json({
        message: 'Subscription already activated',
        subscription: {
          plan: existingSub.plan,
          expiresAt: existingSub.expiresAt
        }
      });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    if (!userId || !plan) {
      return res.status(400).json({ message: 'Invalid session metadata' });
    }

    // Calculate expiry date (1 month from now)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Create subscription record
    let sub;
    try {
      sub = await Subscription.create({
        userId,
        plan,
        stripeSessionId: sessionId,
        status: 'active',
        expiresAt
      });
    } catch (dbErr) {
      // Handle race condition: if duplicate key error, the other call already created it
      if (dbErr.code === 11000) {
        const existing = await Subscription.findOne({ stripeSessionId: sessionId });
        if (existing) {
          return res.json({
            message: 'Subscription already activated',
            subscription: { plan: existing.plan, expiresAt: existing.expiresAt }
          });
        }
      }
      throw dbErr;
    }

    // Update user subscription
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.subscription.plan = plan;
    user.subscription.expiresAt = expiresAt;
    await user.save();

    res.json({
      message: 'Subscription activated',
      subscription: {
        plan,
        expiresAt
      }
    });
  } catch (error) {
    console.error('Stripe verifyPayment error:', error.message);
    res.status(500).json({ message: 'Verification error', error: error.message });
  }
};

// Get User Subscription
exports.getUserSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('subscription');
    res.json(user.subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel Subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.subscription.plan = 'free';
    user.subscription.expiresAt = null;
    await user.save();

    await Subscription.updateMany(
      { userId: req.user._id, status: 'active' },
      { status: 'cancelled' }
    );

    res.json({ message: 'Subscription cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};