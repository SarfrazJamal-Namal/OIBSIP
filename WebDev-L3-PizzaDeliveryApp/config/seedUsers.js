const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Password hashing with bcrypt
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 75000,
            family: 4
        });

        console.log('[SUCCESS] Connected to MongoDB');

        // Admin credentials
        const adminEmail = 'sarfrazjamal56@gmail.com';
        const adminPassword = 'S@rK!sh2639';
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            console.log('[INFO] Admin account exists - Updating password with bcrypt...');
            
            // Update password with bcrypt hash
            existingAdmin.password = await hashPassword(adminPassword);
            existingAdmin.role = 'admin';
            existingAdmin.name = 'Sarfraz Jamal';
            existingAdmin.isVerified = true;
            await existingAdmin.save();
            
            console.log('[SUCCESS] Admin password updated with bcrypt');
            console.log('='.repeat(60));
            console.log('🔐 ADMIN ACCOUNT UPDATED:');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Password: ${adminPassword}`);
            console.log(`   Role: Admin`);
            console.log('='.repeat(60));
        } else {
            // Create admin account
            const hashedPassword = await hashPassword(adminPassword);
            await User.create({
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                name: 'Sarfraz Jamal',
                isVerified: true
            });
            
            console.log('[SUCCESS] Admin account created');
            console.log('='.repeat(60));
            console.log('🔐 ADMIN ACCOUNT CREATED:');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Password: ${adminPassword}`);
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
