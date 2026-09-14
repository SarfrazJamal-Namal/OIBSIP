const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getCurrentUser,
    verifyCode
} = require('../controllers/authController');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-code', verifyCode);
router.get('/me', getCurrentUser);

module.exports = router;
