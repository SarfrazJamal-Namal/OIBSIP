const { sendVerificationCode } = require('./utils/emailService');

const testEmail = async () => {
    console.log('🧪 Testing 6-digit code email...\n');
    
    const testCode = '123456';
    const testRecipient = 'kishwarraza3939@gmail.com';
    
    console.log(`📧 Sending code email to: ${testRecipient}`);
    console.log(`🔑 Code: ${testCode}\n`);
    
    const result = await sendVerificationCode(testRecipient, testCode);
    
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
