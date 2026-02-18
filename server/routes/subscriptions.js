const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { auth } = require('../middleware/auth');

router.post('/create-checkout', auth, subscriptionController.createCheckoutSession);
router.post('/verify-payment', auth, subscriptionController.verifyPayment);
router.get('/my-subscription', auth, subscriptionController.getUserSubscription);
router.post('/cancel', auth, subscriptionController.cancelSubscription);

module.exports = router;