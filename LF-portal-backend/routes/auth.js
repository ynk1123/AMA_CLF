const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();

// JWT SECRET - FIXED
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey123';

// Email Transporter
let transporter = null;
// Use Gmail app password
const emailUser = 'campuslostandfoundama@gmail.com';
const emailPass = 'epje cstg rdvd wnzr';
const smtpHost = 'smtp.gmail.com';
const smtpPort = 587;
const smtpSecure = false;

try {
  if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
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
        console.log('❁ESMTP verify failed:', verifyErr.message);
        if (verifyErr.code) console.log('SMTP code:', verifyErr.code);
      } else {
        console.log(`✁EEmail transporter ready (${smtpHost}:${smtpPort}, secure=${smtpSecure})`);
      }
    });
  } else {
    console.log('⚠�E�EEMAIL_USER / EMAIL_PASS missing. Reset emails will not be sent.');
  }
} catch (err) {
  console.log('⚠�E�EEmail transporter init error:', err.message);
}

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

    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    // Allow reset by studentId even without email
    // If email is missing, use studentId@campus.edu as fallback
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

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"LF Portal" <${emailUser}>`,
          to: userEmail,
          subject: 'LF Portal Password Reset',
          text: `You requested a password reset.\n\nUse this link to reset your password:\n${resetURL}\n\nThis link expires in 30 minutes.`,
          html: `
            <p>You requested a password reset.</p>
            <p>Click this link to reset your password:</p>
            <p><a href="${resetURL}">${resetURL}</a></p>
            <p>This link expires in 30 minutes.</p>
          `
        });
        console.log(`✁EReset email sent to ${user.email}`);
        return res.status(200).json({ message: 'Reset link sent to email!' });
      } catch (emailErr) {
        console.log('❁EEmail send error:', emailErr.message);
        if (emailErr.code) console.log('SMTP code:', emailErr.code);
        if (emailErr.response) console.log('SMTP response:', emailErr.response);
        return res.status(200).json({ message: 'Error sending email', resetLink: resetURL });
      }
    }

    return res.status(200).json({ message: 'Link generated', resetLink: resetURL });
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
