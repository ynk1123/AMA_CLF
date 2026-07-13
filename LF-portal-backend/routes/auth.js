const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const dns = require('dns');

const router = express.Router();

require('dotenv').config();

dns.setDefaultResultOrder('ipv4first');

const FALLBACK_JWT_SECRET = '63e8eb5362c3f1acf11a3dfc4050fcab';
const JWT_SECRET = process.env.JWT_SECRET || global.__FALLBACK_JWT_SECRET || FALLBACK_JWT_SECRET;

if (!process.env.JWT_SECRET) {
  global.__FALLBACK_JWT_SECRET = global.__FALLBACK_JWT_SECRET || FALLBACK_JWT_SECRET;
  // eslint-disable-next-line no-console
  console.warn('JWT_SECRET missing; using local fallback. Set JWT_SECRET properly for production safety.');
}

/*
  Email via SendGrid.
  Keeps password reset UX fast: request responds immediately; email is sent async.
*/
const { sendEmail } = require('../utils/mailer');

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

    // If user does not exist, explicitly say so.
    if (!user) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    // Allow reset by studentId even without email
    let userEmail = user.email;
    if (!userEmail || !String(userEmail).includes('@')) {
      userEmail = user.studentId + '@campus.edu';
    }

    const secret = JWT_SECRET + user.password;
    const token = jwt.sign({ id: user.id, email: userEmail }, secret, { expiresIn: '30m' });

    // Use hash route so it works even when server/Render rewrites don't forward deep links.
    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/#/reset-password/${user.id}/${token}`;

    // Respond immediately (don’t block on email).
    res.status(200).json({ message: 'A reset email was sent!' });

    // Fire-and-forget email sending (don’t hold the HTTP request open).
    sendEmail({
      to: userEmail,
      subject: 'LF Portal Password Reset',
      text: `You requested a password reset.\n\nUse this link to reset your password:\n${resetURL}\n\nThis link expires in 30 minutes.`,
      html: `
        <p>You requested a password reset.</p>
        <p style="margin: 20px 0;">
          <a href="${resetURL}" style="display: inline-block; padding: 12px 20px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px;">
            Change Password
          </a>
        </p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${resetURL}</p>
        <p>This link expires in 30 minutes.</p>
      `
    })
      .then(() => {
        console.log(`✁ Reset email sent to ${userEmail} (SendGrid)`);
      })
      .catch((emailErr) => {
        console.log('❁ SendGrid send error:', emailErr?.message || emailErr);
      });
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
      return res.status(400).json({ message: 'User not found!' });
    }

    const secret = JWT_SECRET + user.password;

    try {
      jwt.verify(token, secret);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid or expired token!' });
    }

    // Password must contain: lowercase, uppercase, digit, and at least one special char.
    // Future-proof: allow all non-whitespace symbols (including '_'), while still requiring a special/non-alphanumeric character.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(?:[^A-Za-z\d]|.*_))[^\s]{8,}$/;

    const normalizedPassword = typeof password === 'string' ? password.trim() : password;


    const pwLower = /[a-z]/.test(normalizedPassword);
    const pwUpper = /[A-Z]/.test(normalizedPassword);
    const pwDigit = /\d/.test(normalizedPassword);
    const pwSpecial = /[^A-Za-z\d]/.test(normalizedPassword) || /_/.test(normalizedPassword);
    const pwMatchesRegex = typeof normalizedPassword === 'string' ? passwordRegex.test(normalizedPassword) : false;

    if (typeof normalizedPassword !== 'string' || !pwMatchesRegex) {

      return res.status(400).json({
        message:
          'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }


    const encryptedPassword = await bcrypt.hash(password, 12);

    user.password = encryptedPassword;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully!' });
  } catch (error) {
    console.log('❌ Reset error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  // Always normalize inputs first
  // (prevents duplicate/invalid emails from creating multiple un-verifiable accounts)

  try {
    const { studentId, displayName, password, email } = req.body;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(?:[^A-Za-z\d]|.*_))[^\s]{8,}$/;


    // Strict validation: only allow properly formatted @gmail.com addresses.
    if (typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    // Strict validation: Student ID must be exactly 11 digits (numbers only)
    const studentIdRegex = /^\d{11}$/;
    if (typeof studentId !== 'string' || !studentIdRegex.test(studentId)) {
      return res.status(400).json({
        message: 'Student ID must be exactly 11 digits and contain numbers only.'
      });
    }


    const normalizedEmail = email.trim();
    const gmailOnlyRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailOnlyRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email address. Only valid @gmail.com accounts are allowed.' });
    }

    // Password complexity validation (MUST run before hashing/SendGrid/DB writes)
    const normalizedPassword = typeof password === 'string' ? password.trim() : password;

    const pwLower = typeof normalizedPassword === 'string' ? /[a-z]/.test(normalizedPassword) : false;
    const pwUpper = typeof normalizedPassword === 'string' ? /[A-Z]/.test(normalizedPassword) : false;
    const pwDigit = typeof normalizedPassword === 'string' ? /\d/.test(normalizedPassword) : false;
    const pwSpecial = typeof normalizedPassword === 'string' ? /[^A-Za-z\d]/.test(normalizedPassword) || /_/.test(normalizedPassword) : false;
    const pwMatchesRegex = typeof normalizedPassword === 'string' ? passwordRegex.test(normalizedPassword) : false;

    console.log('TEMP_PW_REGISTER_VALIDATE', {
      typeofPassword: typeof password,
      normalizedLength: typeof normalizedPassword === 'string' ? normalizedPassword.length : null,
      pwLower,
      pwUpper,
      pwDigit,
      pwSpecial,
      pwMatchesRegex,
      normalizedPasswordPreview: typeof normalizedPassword === 'string' ? normalizedPassword.slice(0, 24) : null
    });

    if (typeof normalizedPassword !== 'string' || !pwMatchesRegex) {


      return res.status(400).json({
        message:
          'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }



    // DNS MX lookup check (ensures the domain has mail records).
    const domain = normalizedEmail.split('@')[1];
    try {
      await new Promise((resolve, reject) => {
        dns.resolveMx(domain, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    } catch {
      return res.status(400).json({ error: 'Invalid email address. Gmail domain mail records not found.' });
    }


    const existingUser = await User.findOne({ where: { studentId } });
    if (existingUser) {
      return res.status(400).json({ message: 'Student ID already registered' });
    }

    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 12);


    const verificationToken = crypto.randomBytes(32).toString('hex');
    const userEmail = email || studentId + '@campus.edu';

    // Store token + mark unverified
    const user = await User.create({
      studentId,
      displayName,
      password: hashedPassword,
      email: userEmail,
      is_verified: false,
      verification_token: verificationToken,
    });

    // IMPORTANT: use deployed backend URL (Render domain), not localhost.
    const backendBaseURL = process.env.BACKEND_URL;
    if (!backendBaseURL) {
      console.warn('BACKEND_URL missing; cannot generate reachable verification link for users.');
    }

    const verifyURL = `${backendBaseURL || 'http://localhost:5000'}/api/auth/verify-email?token=${verificationToken}`;

    // DEBUG for Render logs: confirm the clickable link being emailed
    console.log('📨 Verification link being emailed:', verifyURL);


    sendEmail({
      to: userEmail,
      subject: 'Verify your LF Portal email',
      text: `Please verify your email by clicking this link:\n\n${verifyURL}\n\nIf you did not create an account, you can ignore this email.`,
      html: `
        <p>Hello ${displayName || ''},</p>
        <p>Thanks for registering with LF Portal. Please verify your email address by clicking the button below:</p>
        <p style="margin: 20px 0;"><a href="${verifyURL}" style="display: inline-block; padding: 12px 20px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px;">Verify Email</a></p>

      `,
    }).catch((emailErr) => {
      console.log('❁ SendGrid send error (verification email):', emailErr?.message || emailErr);
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

    let user =
      (await User.findOne({ where: { studentId } })) ||
      (await User.findOne({ where: { email: studentId } }));

    if (!user || !(await bcrypt.compare(trimmedPassword, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Contact admin for help.' });
    }

    if (user.is_verified === false) {
      return res.status(403).json({ message: 'Please verify your email address before logging in.' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user.id,
        studentId: user.studentId,
        displayName: user.displayName,
        email: user.email,
        role: 'student'
      }
    });
  } catch (err) {
    res.status(400).json({ message: 'Login failed' });
  }
});

// VERIFY EMAIL
router.get('/verify-email', async (req, res) => {
  try {
    const token = req.query.token;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid token' });
    }

    const user = await User.findOne({ where: { verification_token: token } });

    // If token isn't found, redirect to login.
    if (!user) {
      // Token might have been used already (verification_token cleared) or it's not the latest.
    const frontendBaseURL = process.env.FRONTEND_URL || 'https://ama-clf-1.onrender.com';
    // Use hash route so it always lands on the React login page.
    return res.redirect(`${frontendBaseURL}/#/login?verified=1`);
    }



    user.is_verified = true;
    user.verification_token = null;
    await user.save();

    // Tell the browser before redirecting (still ends up on the React login route).
    const frontendBaseURL = process.env.FRONTEND_URL || 'https://ama-clf-1.onrender.com';
    return res
      .status(200)
      .send(`<html><body style="font-family: Arial, sans-serif; padding: 24px;">
        <h2>Verification successful 🎉</h2>
        <p>Redirecting you to login...</p>
        <script>setTimeout(() => { window.location.href = '${frontendBaseURL}/#/login?verified=1'; }, 1200);</script>
      </body></html>`);

  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong verifying email' });
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

