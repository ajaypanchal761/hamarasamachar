import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send password reset OTP email
 * @param {string} email - Recipient email address
 * @param {string} otp - OTP code
 * @param {string} name - Recipient name (optional)
 * @returns {Promise<Object>} - Email send result
 */
export const sendPasswordResetOTP = async (email, otp, name = 'User') => {
  try {
    const mailOptions = {
      from: `"हमारा समाचार" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'पासवर्ड रीसेट OTP - हमारा समाचार',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #E21E26; margin: 0;">हमारा समाचार</h1>
            </div>
            
            <h2 style="color: #1f2937; margin-top: 0;">पासवर्ड रीसेट अनुरोध</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              नमस्ते ${name},
            </p>
            
            <p style="color: #4b5563; line-height: 1.6;">
              आपने अपना पासवर्ड रीसेट करने का अनुरोध किया है। कृपया नीचे दिए गए OTP का उपयोग करें:
            </p>
            
            <div style="background-color: #f3f4f6; border: 2px dashed #E21E26; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="font-size: 32px; font-weight: bold; color: #E21E26; letter-spacing: 8px; margin: 0;">
                ${otp}
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6;">
              यह OTP 10 मिनट के लिए वैध है। यदि आपने यह अनुरोध नहीं किया है, तो कृपया इस ईमेल को अनदेखा करें।
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © 2024 हमारा समाचार. सभी अधिकार सुरक्षित।
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        पासवर्ड रीसेट OTP - हमारा समाचार
        
        नमस्ते ${name},
        
        आपने अपना पासवर्ड रीसेट करने का अनुरोध किया है। कृपया नीचे दिए गए OTP का उपयोग करें:
        
        OTP: ${otp}
        
        यह OTP 10 मिनट के लिए वैध है। यदि आपने यह अनुरोध नहीं किया है, तो कृपया इस ईमेल को अनदेखा करें।
        
        © 2024 हमारा समाचार. सभी अधिकार सुरक्षित।
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Error sending password reset OTP email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Verify email transporter configuration
 * @returns {Promise<boolean>}
 */
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('❌ Email server configuration error:', error);
    return false;
  }
};

