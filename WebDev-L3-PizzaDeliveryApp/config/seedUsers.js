const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

// Simple password hashing
const hashPassword = (password) => {
    return Buffer.from(password).toString('base64');
};

// Only Admin Account - Sarfraz Jamal
const adminUser = {
    email: 'sarfrazjamal56@gmail.com',
    password: hashPassword('S@rK!sh2639'),
    role: 'admin',
    name: 'Sarfraz Jamal',
    isVerified: true, // Admin pre-verified
    verificationToken: null
};

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 75000,
            family: 4
        });

        console.log('[SUCCESS] Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminUser.email });
        
        if (existingAdmin) {
            console.log('[INFO] Admin account already exists');
            console.log(`[INFO] Email: ${adminUser.email}`);
        } else {
            // Create admin account
            await User.create(adminUser);
            console.log('[SUCCESS] Admin account created');
            console.log('='.repeat(60));
            console.log('🔐 ADMIN ACCOUNT CREATED:');
            console.log(`   Email: ${adminUser.email}`);
            console.log(`   Role: Admin`);
            console.log('='.repeat(60));
        }
        
        process.exit(0);
    } catch (error) {
        console.error('[ERROR] Seed admin failed:', error);
        process.exit(1);
    }
};

seedAdmin();
