const nodemailer = require("nodemailer");

async function sendMail({ email, subject, htmlContent }) {
  const HOST = `${process.env.EMAIL_HOST || ""}`;
  const NO_REPLY_EMAIL = `${process.env.NO_REPLY_EMAIL || ""}`;
  const USER = `${process.env.ADMIN_EMAIL || ""}`;
  const PASSWORD = `${process.env.EMAIL_PASSWORD || ""}`;
  const PORT = `${process.env.EMAIL_PORT || 587}`;

  try {
    const transporter = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: true,
      auth: {
        user: USER,
        pass: PASSWORD,
      },
    });

    const mailOptions = {
      from: NO_REPLY_EMAIL,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error("Email sending error:", err);
    return false;
  }
}

async function sendOTPEmail(userEmail, userName, otp) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .otp-box { background-color: #fff; padding: 20px; text-align: center; margin: 20px 0; border: 2px solid #4CAF50; }
        .otp { font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>OTP Verification</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Thank you for registering with us. Please use the following OTP to verify your email address:</p>
          <div class="otp-box">
            <div class="otp">${otp}</div>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const emailSent = await sendMail({
    email: userEmail,
    subject: "Email Verification OTP",
    htmlContent,
  });

  return emailSent;
}

module.exports = {
  sendMail,
  sendOTPEmail,
};


