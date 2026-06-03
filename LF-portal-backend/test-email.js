const nodemailer = require('nodemailer');
require('dotenv').config();

const emailUser = (process.env.EMAIL_USER || '').trim();
const emailPass = (process.env.EMAIL_PASS || '').trim();
const to = process.argv[2] || emailUser;

if (!emailUser || !emailPass) {
  console.error('❌ Missing EMAIL_USER or EMAIL_PASS in .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPass
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((verifyErr) => {
  if (verifyErr) {
    console.error('❌ SMTP VERIFY ERROR:', verifyErr.message);
    if (verifyErr.code) console.error('SMTP code:', verifyErr.code);
    return;
  }

  console.log('✅ SMTP verified. Sending test email...');
  transporter.sendMail({
    from: `"LF Portal" <${emailUser}>`,
    to,
    subject: 'LF Portal - Test Email',
    text: '✅ Gmail SMTP working for reset password flow.'
  }).then(info => {
    console.log('✅ EMAIL SENT!');
    console.log('To:', to);
    console.log('Message ID:', info.messageId);
  }).catch(err => {
    console.error('❌ EMAIL ERROR:', err.message);
    if (err.code) console.error('SMTP code:', err.code);
    if (err.response) console.error('SMTP response:', err.response);
  });
});
