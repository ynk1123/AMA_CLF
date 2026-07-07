# TODO

- [ ] Inspect current Messages/Chat responsive layout implementation.
- [ ] Implement mobile switching logic in `portal-frontend/src/pages/Chat.js`:
  - [x] Detect `max-width: 600px` via media query.
  - [x] On mobile: show ONLY items list when no conversation selected.
  - [x] On mobile: when an item is selected, hide items list and show ONLY chat panel.
  - [x] Add a visible mobile-only "← Back" button to return to list.

- [ ] Ensure desktop/tablet behavior remains unchanged.
- [ ] Run frontend lint/build/test (if available) and verify chat flow on mobile width.

