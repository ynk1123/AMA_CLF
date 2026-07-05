const sgMail = require('@sendgrid/mail');

function getEnv(name, fallback = '') {
  const v = process.env[name];
  return typeof v === 'string' ? v.trim() : fallback;
}

function initSendGrid() {
  const apiKey = getEnv('SENDGRID_API_KEY');
  if (!apiKey) return false;

  sgMail.setApiKey(apiKey);
  return true;
}

const SENDGRID_FROM_EMAIL = getEnv('SENDGRID_FROM_EMAIL');
const SENDGRID_FROM_NAME = getEnv('SENDGRID_FROM_NAME', 'LF Portal');

let sendgridReady = false;
try {
  sendgridReady = initSendGrid();
} catch (e) {
  sendgridReady = false;
}

async function sendEmail({ to, subject, text, html }) {
  if (!sendgridReady) {
    throw new Error('SendGrid is not configured. Missing SENDGRID_API_KEY (and/or verification).');
  }
  if (!SENDGRID_FROM_EMAIL) {
    throw new Error('SendGrid is not configured. Missing SENDGRID_FROM_EMAIL.');
  }
  if (!to) {
    throw new Error('Missing "to" email address.');
  }

  const msg = {
    to,
    from: `${SENDGRID_FROM_NAME} <${SENDGRID_FROM_EMAIL}>`,
    subject,
    ...(text ? { text } : {}),
    ...(html ? { html } : {})
  };

  return sgMail.send(msg);
}

module.exports = {
  sendEmail
};

