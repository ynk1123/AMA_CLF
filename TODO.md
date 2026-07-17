# TODO

## Inquiry & Chat dark mode panel border fix
- [ ] Identify the right-hand panel container on `portal-frontend/src/pages/Chat.js`.
- [ ] Replace the hard-coded harsh light border (`border: '2px solid #FEE2E2'`) with a theme-aware/subtle border for dark mode.
- [ ] Optionally ensure left panel remains unchanged (already uses `theme.palette.divider`).
- [ ] Keep the border consistent for both states: when `selectedItem` exists and when showing the “Welcome to Inquiry & Chat” empty state.
- [ ] Run frontend lint/build (or at least a quick compile) if available.

