const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const crypto = require('crypto');
const dns = require('dns').promises;
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');


const router = express.Router();

// JWT SECRET
require('dotenv').config();

const FALLBACK_JWT_SECRET = '63e8eb5362c3f1acf11a3dfc4050fcab';
const JWT_SECRET = process.env.JWT_SECRET || global.__FALLBACK_JWT_SECRET || FALLBACK_JWT_SECRET;

if (!process.env.JWT_SECRET) {
  global.__FALLBACK_JWT_SECRET = global.__FALLBACK_JWT_SECRET || FALLBACK_JWT_SECRET;
  // eslint-disable-next-line no-console
  console.warn('JWT_SECRET missing; using local fallback. Set JWT_SECRET properly for production safety.');
}

/*
  Email via Gmail SMTP (App Password).
  Keeps password reset UX fast: request responds immediately; email is sent async.
*/

const EMAIL_USER = process.env.EMAIL_USER ? String(process.env.EMAIL_USER).trim() : '';
const EMAIL_PASS = process.env.EMAIL_PASS ? String(process.env.EMAIL_PASS).trim() : '';
const EMAIL_FROM = process.env.EMAIL_FROM ? String(process.env.EMAIL_FROM).trim() : EMAIL_USER || 'noreply@campuslostandfound.com';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY ? String(process.env.SENDGRID_API_KEY).trim() : '';
const SMTP_HOST = process.env.SMTP_HOST ? String(process.env.SMTP_HOST).trim() : 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587; // TLS

const SMTP_SECURE = process.env.SMTP_SECURE === 'true'; // usually false for 587
const SMTP_TLS_REJECT_UNAUTHORIZED = process.env.SMTP_TLS_REJECT_UNAUTHORIZED === undefined
  ? false
  : process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false';

let transporter = null;
let mailProvider = 'none';

try {
  if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
    mailProvider = 'sendgrid';
    console.log('✅ Email provider ready (SendGrid)');
  } else if (EMAIL_USER && EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      requireTLS: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: SMTP_TLS_REJECT_UNAUTHORIZED
      },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 30_000
    });

    // verify without blocking requests
    transporter.verify((verifyErr) => {
      if (verifyErr) {
        console.log('❌ SMTP verify failed:', verifyErr.message);
        if (verifyErr.code) console.log('SMTP code:', verifyErr.code);
      } else {
        mailProvider = 'smtp';
        console.log(`✅ SMTP transporter ready (${SMTP_HOST}:${SMTP_PORT})`);
      }
    });
  } else {
    console.log('⚠️ EMAIL_USER / EMAIL_PASS missing. Reset emails will not be sent.');
  }
} catch (err) {
  console.log('⚠️ SMTP transporter init error:', err.message);
}

const sendPasswordResetEmail = async ({ to, resetURL }) => {
  const subject = 'LF Portal Password Reset';
  const text = `You requested a password reset.\n\nUse this link to reset your password:\n${resetURL}\n\nThis link expires in 30 minutes.`;
  const html = `
    <p>You requested a password reset.</p>
    <p>Click this link to reset your password:</p>
    <p><a href="${resetURL}">${resetURL}</a></p>
    <p>This link expires in 30 minutes.</p>
  `;

  if (mailProvider === 'sendgrid') {
    await sgMail.send({ to, from: EMAIL_FROM, subject, text, html });
    return;
  }

  if (transporter) {
    await transporter.sendMail({ from: EMAIL_FROM, to, subject, text, html });
    return;
  }

  throw new Error('No mail provider configured');
};


// REQUEST PASSWORD RESET
router.post('/requestPasswordReset', async (req, res) => {

  const { email, studentId } = req.body || {};

  try {
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedStudentId = typeof studentId === 'string' ? studentId.trim() : '';

    if (!normalizedEmail && !normalizedStudentId) {
      return res.status(400).json({ message: 'Please provide email or studentId' });
    }

    const where = {};
    if (normalizedEmail) where.email = normalizedEmail;
    else where.studentId = normalizedStudentId;

    const user = await User.findOne({ where });

    // Security: respond the same way whether the user exists or not.
    if (!user) {
      return res.status(200).json({ message: 'If the account exists, a reset email will be sent shortly.' });
    }

    // Allow reset by studentId even without email
    let userEmail = user.email;
    if (!userEmail || !String(userEmail).includes('@')) {
      userEmail = user.studentId + '@campus.edu';
    }

    const secret = JWT_SECRET + user.password;
    const token = jwt.sign(
      { id: user.id, email: userEmail },
      secret,
      { expiresIn: '30m' }
    );

    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${user.id}/${token}`;

    // Respond immediately (don’t block on SMTP).
    res.status(200).json({ message: 'If the account exists, a reset email will be sent shortly.' });

    // Fire-and-forget email sending (don’t hold the HTTP request open).
    if (mailProvider !== 'none' || transporter) {
      sendPasswordResetEmail({ to: userEmail, resetURL })
        .then(() => {
          console.log(`✁ Reset email sent to ${userEmail} (${mailProvider || 'smtp'})`);
        })
        .catch((emailErr) => {
          console.log('❁ Mail send error:', emailErr?.message || emailErr);
          if (emailErr?.code) console.log('Mail code:', emailErr.code);
        });
    } else {
      console.log('⚠️ Mail provider not configured. Reset email not sent.');
    }
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// RESET PASSWORD
router.post('/resetPassword/:id/:token', async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  console.log('🔐 Reset attempt - ID:', id, 'Token:', token ? 'present' : 'MISSING', 'Password:', password ? 'present' : 'MISSING');

  try {
    const user = await User.findByPk(id);
    
    if (!user) {
      console.log('❌ User not found:', id);
      return res.status(400).json({ message: "User not found!" });
    }

    const secret = JWT_SECRET + user.password;
    console.log('🔑 Secret check - User password hash:', user.password.substring(0, 20));
    
    try {
      jwt.verify(token, secret);
      console.log('✅ Token verified successfully');
    } catch (e) {
      console.log('❌ Token verification failed:', e.message);
      return res.status(400).json({ message: "Invalid or expired token!" });
    }

    if (typeof password !== 'string' || password.trim().length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const encryptedPassword = await bcrypt.hash(password.trim(), 12);
    console.log('🔒 New password hash:', encryptedPassword.substring(0, 20));
    user.password = encryptedPassword;
    await user.save();
    console.log('✅ Password reset successful for user:', user.studentId);

    res.status(200).json({ message: 'Password has been reset successfully!' });
  } catch (error) {
    console.log('❌ Reset error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { studentId, displayName, password, email } = req.body;
    
    // Check if studentId already exists
    const existingUser = await User.findOne({ where: { studentId } });
    if (existingUser) {
      return res.status(400).json({ message: 'Student ID already registered' });
    }
    
    // Check if email already exists (if email is provided)
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      studentId,
      displayName,
      password: hashedPassword,
      email: email || studentId + '@campus.edu'
    });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, studentId: user.studentId, role: 'student' } });
  } catch (err) {
    res.status(400).json({ message: 'Registration failed' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;
    const trimmedPassword = typeof password === 'string' ? password.trim() : password;
    let user = await User.findOne({ where: { studentId } }) || await User.findOne({ where: { email: studentId } });
    if (!user || !await bcrypt.compare(trimmedPassword, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Check if user account is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Contact admin for help.' });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, studentId: user.studentId, displayName: user.displayName, email: user.email, role: 'student' } });
  } catch (err) {
    res.status(400).json({ message: 'Login failed' });
  }
});

// ADMIN LOGIN
router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    const token = jwt.sign({ role: 'admin', id: 0 }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { studentId: 'ADMIN', role: 'admin' } });
  } catch (err) {
    res.status(400).json({ message: 'Admin login failed' });
  }
});

module.exports = router;
