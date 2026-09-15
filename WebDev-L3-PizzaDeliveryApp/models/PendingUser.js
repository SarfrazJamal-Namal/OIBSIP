const mongoose = require('mongoose');

// Temporary storage for unverified users
const pendingUserSchema = new mongoose.Schema({
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
    verificationCode: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        index: { expires: 0 } // Auto-delete after expiration
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);
