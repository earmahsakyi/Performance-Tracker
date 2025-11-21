// utils/sendEmail.js

const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// Debug: Check what Railway sees
console.log('🔍 Checking environment variables...');
console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length);
console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('RESEND')));

const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    return data;
  } catch (error) {
    console.error(" Resend Email Error:", error);
    throw error;
  }
};

module.exports = sendEmail;
