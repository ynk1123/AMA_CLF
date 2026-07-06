# TODO

## Browse + Dashboard Mobile 4-column grid refactor
- [ ] Refactor `portal-frontend/src/pages/Browse.js` mobile card loop to strict 4-column grid row using exact JSX structure and inline styles provided.
- [ ] Refactor `portal-frontend/src/pages/Dashboard.js` mobile card loops (both Active and Claimed/Archived sections) to strict 4-column grid row using exact JSX structure and inline styles provided.
- [ ] Ensure Browse.js and Dashboard.js use same mobile scaling: 4 columns, image fills column, title text immediately below image.
- [ ] Keep existing desktop/tablet layout behavior intact as much as possible (only adjust mobile rendering via inline responsive styles if needed).
- [ ] Verify dialogs/actions still work after refactor (click handlers still open correct item).
- [ ] Run frontend build/lint commands if available.

