const nodemailer = require('nodemailer');
require('dotenv').config();

// Use Gmail app password
const emailUser = 'campuslostandfoundama@gmail.com';
const emailPass = 'epje cstg rdvd wnzr';
const to = process.argv[2] || emailUser;

const smtpHost = 'smtp.gmail.com';
const smtpPort = 587;

console.log('Using Gmail SMTP');
console.log('Email User:', emailUser);
console.log('SMTP Host:', smtpHost, 'Port:', smtpPort);

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: false,
  requireTLS: true,
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

  console.log(`✅ SMTP verified (${smtpHost}:${smtpPort}). Sending test email...`);
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
