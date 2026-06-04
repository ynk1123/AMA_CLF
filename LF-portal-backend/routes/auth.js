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
        console.log('❌ SMTP verify failed:', verifyErr.message);
        if (verifyErr.code) console.log('SMTP code:', verifyErr.code);
      } else {
        console.log(`✅ Email transporter ready (${smtpHost}:${smtpPort}, secure=${smtpSecure})`);
      }
    });
  } else {
    console.log('⚠️ EMAIL_USER / EMAIL_PASS missing. Reset emails will not be sent.');
  }
} catch (err) {
  console.log('⚠️ Email transporter init error:', err.message);
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

    if (!user.email || !String(user.email).includes('@')) {
      return res.status(400).json({ message: 'User email is missing or invalid' });
    }

    const secret = JWT_SECRET + user.password;
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      secret, 
      { expiresIn: '1h' }
    );

    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${user.id}/${token}`;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"LF Portal" <${emailUser}>`,
          to: user.email,
          subject: 'LF Portal Password Reset',
          text: `You requested a password reset.\n\nUse this link to reset your password:\n${resetURL}\n\nThis link expires in 1 hour.`,
          html: `
            <p>You requested a password reset.</p>
            <p>Click this link to reset your password:</p>
            <p><a href="${resetURL}">${resetURL}</a></p>
            <p>This link expires in 1 hour.</p>
          `
        });
        console.log(`✅ Reset email sent to ${user.email}`);
        return res.status(200).json({ message: 'Reset link sent to email!' });
      } catch (emailErr) {
        console.log('❌ Email send error:', emailErr.message);
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

  try {
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    const secret = JWT_SECRET + user.password;
    
    try {
      jwt.verify(token, secret);
    } catch (e) {
      return res.status(400).json({ message: "Invalid or expired token!" });
    }

    if (typeof password !== 'string' || password.trim().length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const encryptedPassword = await bcrypt.hash(password.trim(), 12);
    user.password = encryptedPassword;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully!' });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { studentId, displayName, password, email } = req.body;
    const existingUser = await User.findOne({ where: { studentId } });
    if (existingUser) {
      return res.status(400).json({ message: 'Student ID already registered' });
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
    let user = await User.findOne({ where: { studentId } }) || await User.findOne({ where: { email: studentId } });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
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
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { studentId: 'ADMIN', role: 'admin' } });
  } catch (err) {
    res.status(400).json({ message: 'Admin login failed' });
  }
});

module.exports = router;