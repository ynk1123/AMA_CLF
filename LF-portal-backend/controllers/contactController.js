const Contact = require('../models/contact');
const crypto = require('crypto');
const { sendEmail } = require('../utils/mailer');

// Helper: Send email notification
const sendContactNotification = async (contact) => {
  try {
    const to = process.env.SENDGRID_CONTACT_TO || process.env.SENDGRID_FROM_EMAIL;
    if (!to) throw new Error('Missing SENDGRID_CONTACT_TO (or SENDGRID_FROM_EMAIL).');

    const subject = `New Contact Form: ${contact.subject || 'No Subject'}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">📬 New Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${contact.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${contact.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${contact.subject || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Message:</td>
          </tr>
        </table>
        <div style="padding: 15px; background: #f9f9f9; border-radius: 5px; margin-top: 10px;">
          ${contact.message.replace(/\n/g, '<br>')}
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 20px;">
          Submitted: ${new Date(contact.createdAt).toLocaleString()}
        </p>
      </div>
    `;

    await sendEmail({
      to,
      subject,
      html,
      text: `New contact form submission\n\nName: ${contact.name}\nEmail: ${contact.email}\nSubject: ${contact.subject || 'N/A'}\n\n${contact.message}`
    });

    console.log('✅ Contact notification email sent (SendGrid)');
    return true;
  } catch (err) {
    console.error('❌ Failed to send contact notification email:', err.message);
    return false;
  }
};

// Simple in-memory rate limiting (use Redis for production)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // Max 5 submissions per window

// Helper: Get IP hash for privacy
const getIpHash = (ip) => {
  const secret = process.env.SECRET_KEY || 'default-secret-key';
  return crypto.createHash('sha256').update(ip + secret).digest('hex').substring(0, 64);
};

// Helper: Check rate limit
const checkRateLimit = (ip) => {
  const now = Date.now();
  const ipHash = getIpHash(ip);

  // Clean old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(key);
    }
  }

  const record = rateLimitMap.get(ipHash);
  if (!record) {
    rateLimitMap.set(ipHash, { timestamp: now, count: 1 });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
};

// Submit contact form (public endpoint - no auth required)
exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message, website } = req.body;

    // HONEYPOT CHECK: If website field is filled, it's a bot
    if (website && website.length > 0) {
      console.log('🚫 Honeypot blocked - bot detected');
      return res.json({ message: 'Thank you for your message!' });
    }

    // RATE LIMIT CHECK
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      console.log('🚫 Rate limit exceeded for IP:', clientIp);
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }

    // INPUT VALIDATION
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate message length (prevent very long submissions)
    if (message.length < 10 || message.length > 5000) {
      return res.status(400).json({ message: 'Message must be between 10 and 5000 characters' });
    }

    // Sanitize inputs - remove potential SQL injection / XSS
    const sanitize = (str) => {
      if (typeof str !== 'string') return '';
      return str
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/['\";]/g, '') // Remove quotes and semicolons
        .trim();
    };

    // Save contact submission
    const contact = await Contact.create({
      name: sanitize(name),
      email: sanitize(email).toLowerCase(),
      subject: subject ? sanitize(subject) : null,
      message: sanitize(message),
      ipHash: getIpHash(clientIp),
      userAgent: req.get('User-Agent') || null
    });

    console.log('✅ Contact form submitted:', contact.id);

    // Send email notification (don't fail the submission if email fails)
    const emailOk = await sendContactNotification(contact);

    res.status(201).json({
      message: emailOk
        ? 'Thank you for your message! We will get back to you soon.'
        : 'Your message was saved, but we could not send the email notification. Please try again later.',
      id: contact.id,
      emailSent: emailOk
    });
  } catch (err) {
    console.error('Error in submitContact:', err);
    res.status(500).json({ message: 'Failed to submit contact form' });
  }
};

// Get all contacts (admin only)
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(contacts);
  } catch (err) {
    console.error('Error in getAllContacts:', err);
    res.status(500).json({ message: 'Failed to fetch contacts' });
  }
};

// Get single contact (admin only)
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contact);
  } catch (err) {
    console.error('Error in getContact:', err);
    res.status(500).json({ message: 'Failed to fetch contact' });
  }
};

// Update contact status (admin only)
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    contact.status = status;
    await contact.save();
    res.json(contact);
  } catch (err) {
    console.error('Error in updateContactStatus:', err);
    res.status(500).json({ message: 'Failed to update contact status' });
  }
};

// Delete contact (admin only)
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    await contact.destroy();
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    console.error('Error in deleteContact:', err);
    res.status(500).json({ message: 'Failed to delete contact' });
  }
};

