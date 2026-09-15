const express = require('express');
const router = express.Router();
const {
    sendOTP,
    verifyOTP,
    login,
    getCurrentUser
} = require('../controllers/authController');

// Auth routes
router.post('/send-otp', sendOTP);      // Step 1: Send OTP (replaces /register)
router.post('/verify-otp', verifyOTP);  // Step 2: Verify OTP and create user
router.post('/login', login);
router.get('/me', getCurrentUser);

// Legacy route support (redirect to new endpoint)
router.post('/register', sendOTP);
router.post('/verify-code', verifyOTP);

module.exports = router;
