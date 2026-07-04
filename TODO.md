- [ ] Fix Render frontend env: set REACT_APP_API_URL=https://ama-clf.onrender.com/api
- [ ] Redeploy frontend
- [ ] Re-test login/register/admin login on Render; confirm first Network request is NOT 404 (should hit /api/auth/login or /api/auth/register)
- [ ] If still failing: capture first failing Network request (method+URL) + response body

