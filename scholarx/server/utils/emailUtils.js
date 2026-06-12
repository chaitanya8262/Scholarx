// ========================================
// Email Utility - sends notifications via nodemailer
// Silently no-ops if EMAIL_USER / EMAIL_PASS not configured (dev mode)
// ========================================
const nodemailer = require('nodemailer');

exports.sendEmail = async ({ to, subject, html, text }) => {
  // If email not configured, just log and return
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`📧 [Email skipped - not configured] To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html
    });

    console.log(`📧 Email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return { success: false, error: error.message };
  }
};
