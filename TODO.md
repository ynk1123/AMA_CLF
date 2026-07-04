# TODO - Fix Render Image Uploads

## Step 1: Confirm the failure mode
- [ ] Check deployed browser Network tab for image request
- [ ] Confirm whether `/uploads/<file>` returns 404

## Step 2: Decide storage strategy
- [ ] Prefer durable storage since Render free plan filesystem is ephemeral
- [ ] Implement Cloudinary (fastest) or S3 (standard)

## Step 3: Implement durable uploads
- [ ] Add Cloudinary/S3 dependencies
- [ ] Update `LF-portal-backend/routes/item.js` multer flow to upload to provider
- [ ] Store returned public URL in `Item.imageUrl`
- [ ] Ensure existing `/uploads` static serving still works for old images (optional)

## Step 4: Update frontend (if needed)
- [ ] Verify `Browse.js` / `Dashboard.js` image URL resolver supports provider URLs (already supports full `http` URLs)

## Step 5: Environment variables + deploy
- [ ] Add provider credentials to Render env vars
- [ ] Redeploy backend
- [ ] Create test item with image and verify it renders after reload

