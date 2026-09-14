const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    name: {
        type: String,
        default: 'Guest User'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        default: null
    },
    verificationCodeExpires: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Generate 6-digit verification code
userSchema.methods.generateVerificationCode = function() {
    // Generate random 6-digit code
    this.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Code expires in 10 minutes
    this.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    return this.verificationCode;
};

module.exports = mongoose.model('User', userSchema);
