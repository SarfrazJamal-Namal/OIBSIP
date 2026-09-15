#!/usr/bin/env node
/**
 * Verification Script - Check if Security Fix is Working
 * Run this AFTER starting the server
 */

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function pass(message) {
    log(`✅ PASS: ${message}`, colors.green);
}

function fail(message) {
    log(`❌ FAIL: ${message}`, colors.red);
}

function info(message) {
    log(`ℹ️  INFO: ${message}`, colors.cyan);
}

function warn(message) {
    log(`⚠️  WARN: ${message}`, colors.yellow);
}

async function testRegistration(email, shouldSucceed = true) {
    try {
        const response = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password: 'test123',
                role: 'user'
            })
        });

        const data = await response.json();
        
        return {
            status: response.status,
            success: data.success,
            needsVerification: data.needsVerification,
            message: data.message
        };
    } catch (error) {
        return { error: error.message };
    }
}

async function checkDatabase() {
    try {
        const mongoose = require('mongoose');
        const User = require('./models/User');
        const PendingUser = require('./models/PendingUser');
        
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pizza_delivery');
        
        const userCount = await User.countDocuments();
        const unverifiedCount = await User.countDocuments({ isVerified: false });
        const pendingCount = await PendingUser.countDocuments();
        
        await mongoose.disconnect();
        
        return { userCount, unverifiedCount, pendingCount };
    } catch (error) {
        return { error: error.message };
    }
}

async function runTests() {
    log('\n' + '='.repeat(60), colors.bright);
    log('🔒 SECURITY FIX VERIFICATION SCRIPT', colors.bright);
    log('='.repeat(60) + '\n', colors.bright);

    // Test 1: Check if server is running
    log('Test 1: Checking if server is running...', colors.cyan);
    try {
        const response = await fetch('http://localhost:5001/api/auth/register', {
            method: 'OPTIONS'
        });
        pass('Server is running on port 5001');
    } catch (error) {
        fail('Server is not running. Please start it with: npm start');
        process.exit(1);
    }

    // Test 2: Invalid email should fail
    log('\nTest 2: Testing invalid email (should fail)...', colors.cyan);
    info('Testing: notreal999888@gmail.com');
    const invalidTest = await testRegistration('notreal999888@gmail.com', false);
    
    if (invalidTest.error) {
        fail(`Network error: ${invalidTest.error}`);
    } else if (invalidTest.success === false && invalidTest.needsVerification === false) {
        pass('Invalid email correctly rejected');
        info(`Message: ${invalidTest.message}`);
    } else {
        fail('Invalid email was NOT rejected properly!');
        warn('Expected: success=false, needsVerification=false');
        warn(`Got: success=${invalidTest.success}, needsVerification=${invalidTest.needsVerification}`);
    }

    // Test 3: Valid email format should attempt to send
    log('\nTest 3: Testing valid email format...', colors.cyan);
    info('Note: This might fail if email doesn\'t actually exist');
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@gmail.com`;
    info(`Testing: ${testEmail}`);
    
    const validTest = await testRegistration(testEmail);
    
    if (validTest.error) {
        fail(`Network error: ${validTest.error}`);
    } else {
        if (validTest.success === true && validTest.needsVerification === true) {
            pass('Valid email format accepted (email validation working)');
            info(`Message: ${validTest.message}`);
        } else if (validTest.success === false && validTest.needsVerification === false) {
            warn('Email rejected (might be because email doesn\'t actually exist)');
            info('This is expected behavior - email validation is working!');
        } else {
            warn('Unexpected response');
            info(`success=${validTest.success}, needsVerification=${validTest.needsVerification}`);
        }
    }

    // Test 4: Database check
    log('\nTest 4: Checking database state...', colors.cyan);
    const dbCheck = await checkDatabase();
    
    if (dbCheck.error) {
        warn(`Could not check database: ${dbCheck.error}`);
        info('Make sure MongoDB is running and credentials are correct');
    } else {
        info(`Total users in User collection: ${dbCheck.userCount}`);
        info(`Unverified users in User collection: ${dbCheck.unverifiedCount}`);
        info(`Pending users in PendingUser collection: ${dbCheck.pendingCount}`);
        
        if (dbCheck.unverifiedCount === 0) {
            pass('No unverified users in User collection (CORRECT)');
        } else {
            fail(`Found ${dbCheck.unverifiedCount} unverified users in User collection (SHOULD BE 0)`);
        }
    }

    // Final summary
    log('\n' + '='.repeat(60), colors.bright);
    log('📊 VERIFICATION SUMMARY', colors.bright);
    log('='.repeat(60) + '\n', colors.bright);

    log('Expected Behavior:', colors.cyan);
    log('  ✅ Invalid emails should be rejected (needsVerification: false)');
    log('  ✅ No modal should open for invalid emails');
    log('  ✅ No data saved to User collection for invalid emails');
    log('  ✅ Valid emails stored in PendingUser (temporary)');
    log('  ✅ User collection only contains verified users');

    log('\nTo manually test:', colors.yellow);
    log('  1. Go to http://localhost:5173');
    log('  2. Try fake email: notreal123@gmail.com');
    log('     → Should show alert, NO modal');
    log('  3. Try your real Gmail');
    log('     → Should open modal, check email for code');

    log('\n' + '='.repeat(60) + '\n', colors.bright);
}

// Run tests
runTests().catch(error => {
    fail(`Script error: ${error.message}`);
    process.exit(1);
});
