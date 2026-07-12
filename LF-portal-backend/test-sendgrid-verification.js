const { sendEmail } = require('./utils/mailer');

(async () => {
  try {
    const to = process.env.TEST_TO_EMAIL;

    if (!to) {
      console.error('Missing TEST_TO_EMAIL env var');
      process.exit(1);
    }

    await sendEmail({
      to,
      subject: 'LF Portal - SendGrid verification test',
      text: 'If you received this email, SendGrid is configured correctly.',
      html: '<p>If you received this email, SendGrid is configured correctly.</p>',
    });

    console.log('✅ Verification test email sent');
    process.exit(0);
  } catch (e) {
    console.error('❌ SendGrid test failed:', e?.message || e);
    process.exit(1);
  }
})();

