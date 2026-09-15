const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sendVerificationCode, verifyEmailDeliverability } = require('../utils/emailService');

// In-memory storage for pending registrations (OTP + user data)
// Structure: { email: { name, password (hashed), role, otp, expiresAt } }
const pendingRegistrations = new Map();

// Cleanup expired entries every minute
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of pendingRegistrations.entries()) {
        if (now > data.expiresAt) {
            pendingRegistrations.delete(email);
            console.log(`[CLEANUP] Expired OTP for: ${email}`);
        }
    }
}, 60000);

// Password hashing with bcrypt
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// @desc    Send OTP (STEP 1: Validate email deliverability and send verification code)
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
                needsVerification: false
            });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists in main database
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email address',
                needsVerification: false
            });
        }

        // Generate 6-digit verification code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        console.log('[SEND-OTP] Attempting to send verification code to:', normalizedEmail);

        // Send verification code via email FIRST (this validates email exists)
        const emailResult = await sendVerificationCode(normalizedEmail, otp);
        
        if (!emailResult.success) {
            // Email sending failed - email doesn't exist or is invalid
            console.error('[EMAIL] Failed to send verification code:', emailResult.error);
            
            // DO NOT SAVE ANYTHING TO DATABASE OR MEMORY
            // DO NOT SEND ADMIN EMAIL
            return res.status(400).json({
                success: false,
                message: 'Failed to send verification email. Please check your email address and try again.',
                needsVerification: false
            });
        }

        // Email sent successfully! NOW store in memory temporarily (NO DATABASE SAVE)
        const hashedPassword = await hashPassword(password);
        
        pendingRegistrations.set(normalizedEmail, {
            name: name || 'Guest User',
            password: hashedPassword,
            role: role || 'user',
            otp: otp,
            expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes from now
        });

        console.log('[SUCCESS] Verification code sent and stored in memory:', normalizedEmail);

        // Email sent successfully - user can proceed to verification
        res.status(200).json({
            success: true,
            message: 'Verification code sent to your email!',
            email: normalizedEmail,
            needsVerification: true
        });
    } catch (error) {
        console.error('[ERROR] Send OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send verification code',
            needsVerification: false
        });
    }
};

// @desc    Verify OTP and CREATE user (STEP 2: Verify and save to database)
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validate required fields
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and verification code are required'
            });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Find pending registration in memory
        const pendingData = pendingRegistrations.get(normalizedEmail);
        
        if (!pendingData) {
            return res.status(404).json({
                success: false,
                message: 'No pending registration found. Please register again.'
            });
        }

        // Check if OTP expired
        if (Date.now() > pendingData.expiresAt) {
            pendingRegistrations.delete(normalizedEmail);
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired. Please register again.'
            });
        }

        // Check if OTP matches
        if (pendingData.otp !== otp.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code. Please try again.'
            });
        }

        // OTP is valid! NOW create user in main database
        const isAdminEmail = normalizedEmail === 'sarfrazjamal56@gmail.com';
        
        const newUser = await User.create({
            email: normalizedEmail,
            password: pendingData.password, // Already hashed
            role: isAdminEmail ? 'admin' : pendingData.role,
            name: isAdminEmail ? 'Sarfraz Jamal' : pendingData.name,
            isVerified: true // Already verified via OTP
        });

        // Delete from memory
        pendingRegistrations.delete(normalizedEmail);

        // Generate JWT token for auto-login
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log(`[SUCCESS] User verified and created: ${normalizedEmail}`);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully!',
            token,
            role: newUser.role,
            email: newUser.email,
            name: newUser.name
        });
    } catch (error) {
        console.error('[ERROR] Verify OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Find user
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password (now using bcrypt)
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if email is verified (skip for admin)
        if (!user.isVerified && user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in. Check your inbox.'
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            role: user.role,
            email: user.email,
            name: user.name,
            isVerified: user.isVerified
        });
    } catch (error) {
        console.error('[ERROR] Login:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('[ERROR] Get User:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user',
            error: error.message
        });
    }
};
