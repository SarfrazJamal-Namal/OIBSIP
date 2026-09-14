const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
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
    const info = await transporter.sendMail(mailOptions);
    console.log('[EMAIL] Verification code sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL ERROR]:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationCode
};
