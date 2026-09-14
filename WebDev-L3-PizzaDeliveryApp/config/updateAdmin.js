const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const updateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 75000,
            family: 4
        });

        console.log('[SUCCESS] Connected to MongoDB');

        // Update admin to be verified
        const result = await User.updateOne(
            { email: 'sarfrazjamal56@gmail.com' },
            { 
                $set: { 
                    isVerified: true,
                    verificationToken: null
                }
            }
        );

        console.log('[SUCCESS] Admin account updated:', result.modifiedCount, 'document(s)');
        
        process.exit(0);
    } catch (error) {
        console.error('[ERROR] Update failed:', error);
        process.exit(1);
    }
};

updateAdmin();
