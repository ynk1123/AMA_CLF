- [x] Added is_verified + verification_token to Sequelize User model.
- [x] Updated /api/auth/register to generate crypto token, persist it, and send SendGrid verification email.
- [x] Added GET /api/auth/verify-email endpoint.
- [x] Updated /api/auth/login to block unverified users with 403 message.
- [x] Provide SQL migration command for Render/Postgres (no code change).
- [ ] Smoke test: register -> verify email link -> login unverified fails; verified succeeds.


