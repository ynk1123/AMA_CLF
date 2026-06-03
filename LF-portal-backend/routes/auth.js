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
var transporter = null;
try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
pass: (process.env.EMAIL_PASS ?? '').trim()
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    console.log('✅ Email ready');
  }
} catch (err) {
  console.log('⚠️ Email error:', err.message);
}

// REQUEST PASSWORD RESET
router.post('/requestPasswordReset', async (req, res) => {
  const { email, studentId } = req.body;
  
  try {
    const where = {};
    if (email) where.email = email;
    if (!email && studentId) where.studentId = studentId;

    const user = await User.findOne({ where });
    
    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    const secret = JWT_SECRET + user.password;
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      secret, 
      { expiresIn: '1h' }
    );

    const resetURL = 'http://localhost:3000/reset-password/' + user.id + '/' + token;

    if (transporter) {
      try {
        // Use authenticated sender explicitly as per Gmail requirements
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Password Reset',
          text: 'Reset link: ' + resetURL
        });
        console.log('✅ Email sent!');
        return res.status(200).json({ message: 'Reset link sent to email!' });
      } catch (emailErr) {
        console.log('❌ Email error:', emailErr.message);
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
      const verify = jwt.verify(token, secret);
    } catch (e) {
      return res.status(400).json({ message: "Invalid or expired token!" });
    }

    const encryptedPassword = await bcrypt.hash(password, 12);
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