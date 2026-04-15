const nodemailer = require('nodemailer');

const sendOTPEmail = async (email, otp, userName) => {
  console.log(`📧 Preparing to send OTP to: ${email}`);
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false // Helps with some shared hosting/firewall issues
    }
  });

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Your RoomRadar Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin: 0;">RoomRadar</h1>
          <p style="color: #64748b; font-size: 14px;">Your student housing marketplace</p>
        </div>
        
        <h2 style="color: #1e293b;">Welcome to the community, ${userName}!</h2>
        <p style="color: #475569; line-height: 1.6;">
          Your security is our priority. Please use the following One-Time Password (OTP) to verify your account and start your housing journey:
        </p>
        
        <div style="text-align: center; margin: 40px 0; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
          <h1 style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #0f172a; margin: 0;">${otp}</h1>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 10px; text-transform: uppercase; font-weight: bold;">Code expires in 10 minutes</p>
        </div>
        
        <p style="color: #475569; line-height: 1.6;">
          If you did not request this code, you can safely ignore this email.
        </p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e1e1e1; font-size: 12px; color: #94a3b8; text-align: center;">
          <p>&copy; 2026 RoomRadar. Designed for students, by students.</p>
          <p>This is a secure automated message. Please do not reply.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('🚀 Message sent successfully! ID: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('🔥 SMTP Error during sendMail:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    return false;
  }
};

module.exports = { sendOTPEmail };
