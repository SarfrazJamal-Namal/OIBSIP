const fetch = require('node-fetch');

const testRegistration = async () => {
    console.log('🧪 Testing FRESH Registration with Email...\n');
    
    // Generate unique email
    const timestamp = Date.now();
    const testUser = {
        email: `testuser${timestamp}@example.com`,
        password: 'Test1234',
        role: 'user'
    };
    
    console.log('📧 Registering user:', testUser.email);
    
    try {
        const res = await fetch('http://127.0.0.1:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        
        const data = await res.json();
        
        console.log('\n📊 Response Status:', res.status);
        console.log('📦 Response Data:', JSON.stringify(data, null, 2));
        
        if (data.success) {
            console.log('\n✅ Registration successful!');
            console.log('📧 Check backend logs for email send confirmation');
        } else {
            console.log('\n❌ Registration failed:', data.message);
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
};

testRegistration();
