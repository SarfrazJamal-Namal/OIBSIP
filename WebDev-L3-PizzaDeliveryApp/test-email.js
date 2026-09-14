const { sendVerificationEmail } = require('./utils/emailService');

// Test email sending
const testEmail = async () => {
    console.log('🧪 Testing email service...\n');
    
    const testToken = 'test123abc456def';
    const testRecipient = 'sarfrazjamal56@gmail.com';
    
    console.log(`📧 Sending test email to: ${testRecipient}`);
    console.log(`🔑 Verification token: ${testToken}\n`);
    
    const result = await sendVerificationEmail(testRecipient, testToken);
    
    if (result.success) {
        console.log('✅ Email sent successfully!');
        console.log(`📬 Message ID: ${result.messageId}`);
        console.log('\n✉️ Check your inbox at:', testRecipient);
    } else {
        console.log('❌ Email sending failed!');
        console.log('Error:', result.error);
    }
    
    process.exit(0);
};

testEmail();
