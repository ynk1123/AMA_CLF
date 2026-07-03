# TODO - Separate Claimed Items from Lost and Found Items

## Plan Approved

### Steps:
- [x] Read and analyze Dashboard.js and item model
- [x] Create plan and get user approval
- [x] Implement separation of items in Dashboard.js
- [x] Test the changes

### Implementation:
1. Filter items into two arrays:
   - activeItems = items with status: pending, lost, found, under_verification
   - claimedArchivedItems = items with status: claimed, archived
2. Display two separate sections in the UI
