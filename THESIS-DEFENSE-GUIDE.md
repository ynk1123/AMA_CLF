# 🎓 LF Portal — Thesis Defense Guide

**System:** Campus Lost and Found Portal (LF Portal)
**Architecture:** MERN-like stack — React (frontend) + Node.js/Express (backend) + PostgreSQL (database) + Sequelize (ORM) + SendGrid (email) + Cloudinary (image storage)

This guide explains the parts of your code that panelists will most likely ask about, in plain language you can use during your defense.

---

## 1. SYSTEM OVERVIEW (Intro questions)

**What is the system?**
A web-based platform where students can **report lost or found items**, **claim lost items** (with proof/answers to verification questions), **chat with moderators** about items, and **book appointments** to retrieve items. An **admin** approves posts, verifies claims, manages users, and views dashboard statistics.

**Key modules:**
- Student registration / login / email verification
- Lost & Found item posting (with image upload)
- Claim verification workflow
- Inquiry & Chat (item-based messaging)
- Appointment scheduling
- Notification system
- Admin dashboard (users, items, claims, appointments, stats, contacts)

**Tech stack you chose and WHY:**
- **React** — component-based UI, fast, huge ecosystem, easy state management with Context API.
- **Node.js + Express** — lightweight, event-driven, single language across front & back (JavaScript), great for API servers.
- **PostgreSQL** — relational DB, enforces data integrity (foreign keys, constraints), good for structured data like users/items/claims.
- **Sequelize ORM** — prevents SQL injection by parameterizing queries, makes DB access code clean and portable.
- **JWT** — stateless authentication, no server-side session storage needed, scales well.
- **bcryptjs** — industry-standard password hashing.
- **Cloudinary** — offloads image storage so the server's ephemeral filesystem isn't used (important on Render free tier).
- **SendGrid** — transactional email for verification and password reset.

---

## 2. AUTHENTICATION & LOGIN SECURITY (Very likely asked)

### 2.1 Password hashing with bcrypt
`routes/auth.js` — `bcrypt.hash(password, 12)` and `bcrypt.compare(...)`

- Passwords are **never stored in plain text**. They are hashed with bcrypt using **12 salt rounds**.
- The **salt** (random value) is incorporated into the hash, so identical passwords produce different hashes — this defeats rainbow-table and pre-computed dictionary attacks.
- On login, `bcrypt.compare()` re-hashes the input and compares safely (constant-time), so we never need to (and never do) decrypt/reverse the stored password.
- **Why 12 rounds?** It makes brute-forcing computationally expensive (roughly 0.1–0.3s per attempt), which slows down attackers while staying acceptable for the user.

### 2.2 JWT (JSON Web Token) for sessions
`middleware/auth.js`, `routes/auth.js`

- After successful login, the server signs a token: `jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' })`.
- The token is sent to the client and stored in `sessionStorage`.
- Every protected request includes it in the `Authorization: Bearer <token>` header (see `api.js` interceptor).
- The `authenticate` middleware **verifies the token's signature** using `jwt.verify(token, JWT_SECRET)`. If the signature is invalid or the token is expired, it returns `401`.
- **Why JWT and not sessions?** It's **stateless** — the server doesn't store session data in memory or DB, so it scales horizontally and works on serverless platforms. The token itself carries the user identity.
- **Why 7-day expiry?** Balances user convenience (not re-logging in often) with security (limits how long a stolen token is valid).

### 2.3 Email verification (two-step registration)
`routes/auth.js` — `/register` and `/verify-email`

- When a user registers, the account is created with `is_verified: false` and a random `verification_token` (32 random bytes → hex).
- A verification email is sent via SendGrid with a link containing that token.
- Only after the user clicks the link and the server matches the token do we set `is_verified = true`.
- **Login is blocked until verified** (`if (user.is_verified === false) return 403`).
- **Why?** This confirms the user actually controls the email address, prevents fake/unreachable accounts, and reduces spam accounts.

### 2.4 Account suspension
`routes/auth.js` login, `adminController.js` `suspendUser`

- The User model has a `status` field (`active` / `suspended`).
- On login, if `user.status === 'suspended'` → return `403` with a clear message.
- Admins can suspend/reactivate users. Admin cannot suspend/delete themselves or other admins (guards in `adminController.js`).

### 2.5 Password reset (tokenized, time-limited)
`routes/auth.js` — `/requestPasswordReset` and `/resetPassword/:id/:token`

- To reset, the user's password is used as **part of the JWT secret**: `secret = JWT_SECRET + user.password`.
- The token is then signed with that combined secret and expires in **30 minutes**.
- **Why include the password in the secret?** If the user changes their password, the old reset token automatically becomes **invalid** (because the secret changes). This is a strong security property — a used or superseded reset link can't be reused.
- The reset link is emailed; the password is never sent.
- The new password must pass a **complexity regex** (uppercase, lowercase, digit, special char, min 8 chars).

### 2.6 Admin authentication
`routes/auth.js` `/admin-login`

- Admin logs in with `username`/`password` compared against environment variables (`ADMIN_USERNAME`, `ADMIN_PASSWORD`).
- **Important note for defense:** Admin credentials are stored as environment variables, not hardcoded in source or in the DB. The admin JWT is signed with `{ role: 'admin', id: 0 }`.
- The `authorizeAdmin` middleware checks `req.user.role === 'admin'` and returns `403` otherwise. This protects all `/api/admin/*` routes.

### 2.7 Input validation on register
- **Student ID** must be exactly 11 digits (`/^\d{11}$/`).
- **Email** must be a valid `@gmail.com` (school policy) AND the server does a **DNS MX lookup** to confirm the domain actually accepts mail — this rejects fake domains.
- **Password** must meet complexity rules.
- Duplicate student ID / email are rejected.

---

## 3. ANTI-SPAM ON "CONTACT US" (Very likely asked)

This is one of your strongest features. Located in `contactController.js`, `routes/contact.js`, `ContactUs.js`, `models/contact.js`.

### 3.1 Honeypot field (bot trap)
- A hidden text field named **`website`** is rendered off-screen (`left: -9999px`, `opacity: 0`) in the Contact form (`ContactUs.js`).
- Real humans never see or fill it. **Bots** that auto-fill every field will populate it.
- On the backend (`submitContact`), if `website` is non-empty → the request is treated as a bot and silently "accepted" (`{ message: 'Thank you...' }`) **without saving** — so the bot thinks it succeeded and doesn't retry/adapt.
- **Why silently accept instead of rejecting?** If we return an error, smart bots learn to avoid the field. Pretending to succeed is more effective spam defense.

### 3.2 Rate limiting (express-rate-limit)
- Applies a **global limiter** (100 requests / 15 min per IP) on public routes in `server.js`.
- A **stricter contact limiter** on `routes/contact.js`: **5 submissions per 15 minutes per IP**.
- Also an **in-memory rate-limit map** in `contactController.js` (`RATE_LIMIT_WINDOW = 15 min`, `MAX_REQUESTS = 5`).
- **Why two layers?** Defense in depth — the route-level limiter stops bursts, and the controller-level map is an additional backstop.

### 3.3 IP hashing (privacy + spam tracking)
- Instead of storing raw IPs (a privacy concern), the controller hashes the IP with a secret: `sha256(ip + secret)`.
- This still lets the server detect and limit repeat offenders from the same IP, while **not storing personally identifiable raw IP addresses**.

### 3.4 Input sanitization (XSS / SQL injection defense)
- `sanitize()` strips HTML tags (`/<[^>]*>/g`) and removes quotes/semicolons (`' ; "`).
- This prevents **stored XSS** (a malicious script embedded in a message) and neutralizes basic SQL injection payloads.
- Email format is validated with a regex; message length is bounded (10–5000 chars).

### 3.5 Why this is "defense in depth"
Spam defense uses **multiple independent layers**: honeypot (bot detection) + rate limiting (volume control) + IP hashing (repeat offender tracking) + input sanitization (payload neutralization). If one layer fails, the others still protect the system.

---

## 4. CHAT / MESSAGE FEATURE SECURITY (Likely asked)

Located in `messageController.js`, `routes/message.js`, `Chat.js`.

### 4.1 Authentication is required
- All message routes (`GET /:itemId`, `POST /`, `DELETE /:id`) are protected by the `authenticate` middleware.
- **A user must log in to view or send messages** — the chat is not public.

### 4.2 Input validation
- `createMessage` checks that `content` is a non-empty string and `itemId` is present; otherwise returns a clear `400`.
- Content is trimmed before saving.

### 4.3 Authorization on delete
- `handleDeleteMessage` in `Chat.js` only allows deletion **if the logged-in user is an admin** (`if (user.role !== 'admin') return;`). Regular students cannot delete conversations.

### 4.4 Optimistic UI + race-condition handling
- The frontend uses **optimistic rendering** (shows the message immediately, then replaces it with the server response) for a smooth UX.
- It uses a **fetch sequence counter** (`fetchSeqRef`) and a `isPostingRef` flag so stale GET responses don't overwrite newly posted messages (prevents flicker/vanishing messages).
- This demonstrates careful client-side state management — good to mention.

### 4.5 Does the chat have anti-spam? (IMPLEMENTED ✅)
**Answer:** Yes. The chat now has dedicated anti-spam layers (implemented in `routes/message.js` and `messageController.js`):

**Anti-spam layers (all applied ONLY to message SENDING, so reading/deleting are unaffected):**
1. **Per-endpoint rate limiter** (`routes/message.js`) — `express-rate-limit` on the POST route: **max 10 messages per minute per IP** (`messageCreateLimiter`). Applied only to `POST /` (createMessage), so `GET` (reading) and `DELETE` are NOT rate-limited.
2. **Message length cap** (`messageController.js`) — rejects messages over **2000 characters** (prevents huge payloads / buffer abuse).
3. **Duplicate-message detection** (`messageController.js`) — blocks a user from sending the **exact same message** to the same item twice within a **60-second window** (returns `429`).
4. **Input validation** — content must be a non-empty string; `itemId` required.
5. **Authentication required** — all message routes use `authenticate` (only verified students/admins).
6. **Global rate limiter** also applies to `/api/messages` (`server.js`: 100 req / 15 min per IP).
7. **Admin moderation** — admins can delete any message.

**Why this doesn't compromise other functions:**
- The limiter is attached **only** to the message-create route; message **viewing** and **deletion** work normally.
- The duplicate check is scoped to the **same user + same item + 60s window**, so legitimate distinct messages are never blocked.
- No changes to auth, items, claims, appointments, notifications, or contact features.

**Suggested response to a panelist:**
> "The chat has layered anti-spam. Sending is rate-limited to 10 messages per minute per IP via express-rate-limit, message length is capped at 2000 characters, and sending the exact same message twice within a minute is blocked. Reading and deleting messages are not affected. On top of that, the chat requires authentication, is covered by the global rate limiter, and admins can delete messages."

**Where the code lives:**
- `LF-portal-backend/routes/message.js` — `messageCreateLimiter` (10/min per IP on POST).
- `LF-portal-backend/controllers/messageController.js` — 2000-char cap + duplicate detection (60s window).

---

## 5. RATE LIMITING & DoS PROTECTION (Likely asked)

`server.js`

- **helmet()** — sets secure HTTP headers (X-Content-Type-Options, X-Frame-Options, CSP, etc.) to mitigate common web attacks.
- **CORS** — restrict which origins can call the API (allowlist: localhost + the deployed domain). Prevents other websites from making cross-origin requests to your API.
- **Global rate limit** — 100 req / 15 min on `/auth`, `/items`, `/messages`, `/appointments`.
- **Admin rate limit** — 500 req / 15 min on `/admin` (admins are trusted, but still bounded).
- **Contact rate limit** — 5 req / 15 min.
- **Why rate limiting?** Prevents brute-force login attempts, scrapers, and accidental/DoS-style overload from a single IP.

---

## 6. DATA INTEGRITY & ORM (Likely asked)

### 6.1 SQL injection prevention
- All DB access goes through **Sequelize** (an ORM). Queries are **parameterized**, meaning user input is bound as parameters, never concatenated into raw SQL. This is the primary defense against **SQL injection**.

### 6.2 Foreign keys & referential integrity
- `Claim` references `Items` and `Users` via `references`. Messages reference Users/Items.
- When deleting a user/item, the code **deletes dependent rows first** (`deleteUser`, `deleteItem`) to satisfy foreign-key constraints and avoid orphaned records.
- `deleteUser` also **prevents admin self-deletion** and **prevents deleting other admin accounts**.

### 6.3 Data model overview (for "explain your database")
- **User** — id, studentId (unique), displayName, password (hashed), email, role (student/admin), status (active/suspended), is_verified, verification_token.
- **Item** — title, category, color, brand, description, location, date, imageUrl, itemType (lost/found), status (pending/lost/found/under_verification/claimed/archived), userId, claimAnswer, claimStatus.
- **Claim** — itemId, userId, answer, status (pending/approved/rejected).
- **Message** — content, userId, itemId, timestamp.
- **Appointment** — date, time, location, description, userId, status.
- **Contact** — name, email, subject, message, website (honeypot), status, ipHash, userAgent.
- **Notification** — user_id, title, message, is_read, is_deleted.

---

## 7. BUSINESS WORKFLOWS (Panelists love these)

### 7.1 Item posting approval workflow
- When a **student** posts an item, its status is set to **`pending`** (needs admin approval).
- When an **admin** posts, it's approved immediately.
- Students see their own pending items via `/my-posted-items` (owner-only).
- The public `/items` route **only returns approved** statuses (`lost`, `found`, `claimed`, `archived`) — pending items are hidden from everyone except the owner.
- On approval, a **notification** is created and sent to the item owner (DB-driven, not localStorage).
- **Why pending status?** Prevents spam/fake posts from appearing publicly — moderation is required.

### 7.2 Claim verification workflow (multi-claim)
- A student claims an item by answering a verification question (`/items/claim`).
- Multiple students can claim the same item (each claim is a separate row).
- A user **cannot double-claim** the same item while they have a pending claim (duplicate check).
- When a claim is submitted, the item stays `lost`/`found` but the UI marks it as `under_verification` for that user if they have a pending claim.
- **Admin** reviews each claim and can **approve or reject**:
  - **Approve** → item becomes `claimed`, all other pending claims on that item are auto-rejected.
  - **Reject** → if other pending claims exist, item stays `under_verification`; if none remain, it reverts to its original type (`lost`/`found`).
- **Why verification questions?** To confirm the claimant actually owns/knows the item before handing it over — reduces false claims.

### 7.3 Notification system
- Notifications are stored in the database (persistent), not localStorage.
- Created for: item pending approval (to owner + admins), item approved (to owner), and claim-related events.
- Users can mark read / soft-delete (soft delete sets `is_deleted = true` so history is preserved).
- **Why DB-driven?** Notifications survive page reloads and are consistent across devices (unlike localStorage).

### 7.4 Appointment scheduling
- Students create appointments to retrieve items (date, time, location, description). Initial status `pending`.
- Admins view all appointments, update status (`pending/approved/completed/cancelled`), and delete.
- Students only see their own appointments via `/my-appointments`.

---

## 8. DEFENSE-IN-DEPTH SUMMARY (Concluding question: "How is your system secure?")

1. **Authentication** — JWT (stateless, signed, expiring) + `authenticate` middleware on all protected routes.
2. **Password security** — bcrypt hashing (12 rounds), never plaintext.
3. **Account lifecycle** — email verification before login, admin suspension, admin-only role checks.
4. **Password reset** — time-limited JWT whose secret includes the password hash (auto-invalidates on password change).
5. **Anti-spam** — honeypot, IP hashing, layered rate limiting, input sanitization.
6. **Remote code / injection defense** — Sequelize parameterized queries (SQLi), HTML sanitization (XSS), helmet headers, strict input validation.
7. **Access control** — `authorizeAdmin` guards all admin endpoints; users can only see/act on their own data (notifications filtered by `user_id`, appointments by `userId`).
8. **Rate limiting** — global + per-route limits to prevent brute force and abuse.

---

## 9. LIKELY PANEL QUESTIONS & SHORT ANSWERS

| Question | Short answer → point to section |
|----------|-------------------------------|
| How do you store passwords? | bcrypt hash, 12 rounds, never plaintext (2.1) |
| How does authentication work? | JWT stateless, 7-day expiry, verified on every request (2.2) |
| Why email verification? | Confirms ownership, blocks fake accounts (2.3) |
| How do you stop contact-form spam? | Honeypot + rate limit + IP hash + sanitize (3) |
| How do you stop SQL injection? | Sequelize parameterized queries (6.1) |
| How do you stop XSS? | HTML tag stripping / sanitization (3.4) |
| How do you protect admin routes? | JWT role claim + `authorizeAdmin` middleware (2.6) |
| Why is a post "pending"? | Admin moderation before public (7.1) |
| How does claiming work? | Multi-claim + verification answers + admin decision (7.2) |
| Why DB notifications not localStorage? | Persistence & cross-device consistency (7.3) |
| What happens if a token is stolen? | 7-day expiry limits window; role + id checks bound damage (2.2) |
| How do you prevent a user deleting others' data? | Ownership checks / admin-only guards (5, 8) |

---

## 10. POTENTIAL WEAKNESSES (be ready, be honest)

Panelists respect honesty. Have prepared answers:

1. **Admin credentials stored in env** — good practice, but hardcoded comparison (not hashed). Could be improved with bcrypt for admin passwords too.
2. **In-memory rate limiting** — not shared across multiple server instances (use Redis in production). Fine for a single-instance thesis deployment.
3. **Chat rate limiting is in-memory** — the message limiter and duplicate detection use in-memory state, so it's per-server-instance (not shared across multiple servers). Fine for a single-instance thesis deployment; use Redis for multi-instance production.
4. **JWT stored in sessionStorage** — sessionStorage is cleared on tab close (good), but is vulnerable to XSS. Mitigated by React's default escaping and our sanitization. Consider httpOnly cookies for stronger protection.
5. **`req.user.id` for admin** — admin tokens sign `id: 0`, and middleware resolves the real admin row. This is a workaround; could be simplified by storing the real admin id in the token.
6. **No pagination on some list endpoints** — large datasets could be slow; a future enhancement.
7. **FALLBACK_JWT_SECRET** — there's a hardcoded fallback secret in `auth.js` for local dev. In production `JWT_SECRET` must be set. Be ready to explain this is only a dev fallback.

---

## TIPS FOR THE ACTUAL DEFENSE
- **Be confident in the "why"** — panelists care more about *why* you chose a technology/approach than the syntax.
- **Draw the architecture** — frontend (React) → API (Express) → ORM (Sequelize) → PostgreSQL; external services (Cloudinary for images, SendGrid for email).
- **Use the "defense in depth" framing** — it ties all your security features together into one strong narrative.
- **Mention trade-offs** — you chose PostgreSQL for integrity, JWT for statelessness, DB notifications for persistence. Showing you considered alternatives is a big plus.
