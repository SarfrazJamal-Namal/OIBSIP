const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter with connection pool
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 10
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('[EMAIL] Transporter configuration error:', error);
  } else {
    console.log('[EMAIL] Email service ready');
  }
});

// Send verification code email
const sendVerificationCode = async (email, verificationCode) => {
  const mailOptions = {
    from: `"Pizza Delivery Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🍕 Your Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0284c7; font-size: 42px; margin: 0;">🍕</h1>
          <h2 style="color: #1f2937; margin-top: 10px;">Pizza Platform</h2>
        </div>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
          Your verification code is:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: #f0f9ff; border: 2px solid #0284c7; border-radius: 8px; padding: 20px 40px;">
            <span style="font-size: 48px; font-weight: bold; color: #0284c7; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${verificationCode}
            </span>
          </div>
        </div>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
          Enter this code to verify your account and start ordering delicious pizzas!
        </p>
        
        <p style="color: #dc2626; font-size: 14px; text-align: center; margin-top: 20px;">
          ⏰ This code will expire in 10 minutes
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          If you didn't register for this account, please ignore this email.
        </p>
      </div>
    `
  };

  try {
    // Set timeout for email sending (5 seconds)
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email send timeout')), 5000)
    );

    const info = await Promise.race([sendPromise, timeoutPromise]);
    
    console.log('[EMAIL] Verification code sent:', info.messageId);
    console.log('[EMAIL] Accepted recipients:', info.accepted);
    console.log('[EMAIL] Rejected recipients:', info.rejected);
    
    // Check if email was rejected (email doesn't exist)
    if (info.rejected && info.rejected.length > 0) {
      console.error('[EMAIL] Email address rejected by server:', info.rejected);
      return { 
        success: false, 
        error: `Email address does not exist or is invalid: ${info.rejected.join(', ')}` 
      };
    }
    
    // Check if no emails were accepted (another form of rejection)
    if (!info.accepted || info.accepted.length === 0) {
      console.error('[EMAIL] No recipients accepted the email');
      return { 
        success: false, 
        error: 'Email address does not exist or is invalid' 
      };
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL ERROR] Exception during send:', error.message);
    
    // Parse specific error messages
    if (error.message.includes('No recipients defined') || 
        error.message.includes('Invalid email') ||
        error.message.includes('invalid') ||
        error.message.includes('Recipient address rejected') ||
        error.message.includes('User unknown') ||
        error.message.includes('Mailbox') ||
        error.message.includes('timeout')) {
      return { 
        success: false, 
        error: 'Email address does not exist or is invalid' 
      };
    }
    
    // Generic error (network issues, etc.)
    return { 
      success: false, 
      error: 'Failed to send email. Please try again.' 
    };
  }
};

module.exports = {
  sendVerificationCode
};
