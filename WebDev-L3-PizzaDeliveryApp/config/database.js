const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Modern Mongoose options (v6+)
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 75000,
            family: 4, // Force IPv4
            // DNS resolution options
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`[SUCCESS] MongoDB Connected: ${conn.connection.host}`);
        console.log(`[INFO] Database: ${conn.connection.name}`);
        
        // Connection event listeners for production
        mongoose.connection.on('error', (err) => {
            console.error('[ERROR] MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('[WARN] MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('[INFO] MongoDB reconnected successfully');
        });

    } catch (error) {
        console.error('[ERROR] Database Connection Failed:', error.message);
        
        // Try to provide helpful debugging info
        if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
            console.error('[DEBUG] DNS Resolution Issue Detected');
            console.error('[HELP] Possible fixes:');
            console.error('  1. Run: ipconfig /flushdns (as Administrator)');
            console.error('  2. Check Windows Firewall/Antivirus settings');
            console.error('  3. Try using Google DNS (8.8.8.8)');
            console.error('  4. Use Standard MongoDB URI instead of SRV format');
        }
        
        console.log('[INFO] Server will continue without database');
    }
};

module.exports = connectDB;
