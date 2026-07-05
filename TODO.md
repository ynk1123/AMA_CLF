# TODO - SendGrid migration (LF-portal-backend)

- [ ] Replace Gmail/nodemailer usage in `LF-portal-backend/routes/auth.js` (password reset email) with SendGrid using `@sendgrid/mail`.
- [ ] Replace Gmail/nodemailer usage in `LF-portal-backend/controllers/contactController.js` (contact notification email) with SendGrid.
- [ ] Remove hardcoded Gmail credentials from the code and switch to env vars.
- [ ] Add/confirm required env vars for Render:
  - SENDGRID_API_KEY
  - SENDGRID_FROM_EMAIL
  - SENDGRID_FROM_NAME (optional)
  - FRONTEND_URL (already used)
- [ ] Add a small helper module (e.g., `LF-portal-backend/utils/mailer.js`) to centralize SendGrid send logic.
- [ ] Run backend locally to ensure no runtime errors.

