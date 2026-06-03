const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: (process.env.EMAIL_PASS ?? '').trim()
  },
  // ⭐ FIX SSL ERROR
  tls: {
    rejectUnauthorized: false
  }
});

transporter.sendMail({
  from: '"Campus Portal" <jbc050805@gmail.com>',
  to: 'your-test-email@gmail.com',  // ← YOUR EMAIL
  subject: 'Test Email',
  text: '✅ Gmail working!'
}).then(info => {
  console.log('✅ EMAIL SENT!');
  console.log('Message ID:', info.messageId);
}).catch(err => {
  console.error('❌ EMAIL ERROR:', err);
});