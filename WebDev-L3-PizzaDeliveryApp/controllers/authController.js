const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendVerificationCode } = require('../utils/emailService');

// Simple password hashing (in production use bcrypt)
const hashPassword = (password) => {
    return Buffer.from(password).toString('base64');
};

const comparePassword = (password, hashedPassword) => {
    return hashPassword(password) === hashedPassword;
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user (NOT verified yet)
        const user = await User.create({
            email,
            password: hashPassword(password),
            role: role || 'user',
            isVerified: false
        });

        // Generate 6-digit verification code
        const verificationCode = user.generateVerificationCode();
        await user.save();

        // Send verification code via email
        const emailResult = await sendVerificationCode(email, verificationCode);
        
        if (!emailResult.success) {
            console.error('[EMAIL] Failed to send verification code:', emailResult.error);
        }

        // DO NOT return JWT token yet - user must verify first
        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email for verification code.',
            email: user.email,
            needsVerification: true
        });
    } catch (error) {
        console.error('[ERROR] Register:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

// @desc    Verify email with code
// @route   POST /api/auth/verify-code
// @access  Public
exports.verifyCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        // Find user
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already verified
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        // Check if code matches
        if (user.verificationCode !== code) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        // Check if code expired
        if (new Date() > user.verificationCodeExpires) {
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired. Please request a new one.'
            });
        }

        // Mark user as verified
        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        await user.save();

        // Generate JWT token NOW
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Email verified successfully!',
            token,
            role: user.role,
            email: user.email
        });
    } catch (error) {
        console.error('[ERROR] Verify Code:', error);
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

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        if (!comparePassword(password, user.password)) {
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
