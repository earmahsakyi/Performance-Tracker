// utils/sendEmail.js
require('dotenv').config(); // Load env variables

const { Resend } = require('resend');

// Validate API key exists
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Validate required fields
    if (!to || !subject || !html) {
      throw new Error('Missing required email fields: to, subject, or html');
    }

    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });

    console.log('✅ Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Resend Email Error:', error.message);
    throw error;
  }
};

module.exports = sendEmail;