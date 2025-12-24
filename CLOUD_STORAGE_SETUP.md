# Cloud Storage Setup Guide

## Problem
On cloud hosting platforms like Render, the filesystem is **ephemeral** - files stored locally are **lost** when the server restarts or redeploys. This causes images to disappear after some time.

## Solution
We've integrated **Cloudinary** for persistent cloud storage. Files are automatically uploaded to Cloudinary and served via CDN, ensuring they persist even after server restarts.

## Setup Instructions

### 1. Create a Cloudinary Account
1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account (generous free tier available)
3. After signing up, you'll see your dashboard with credentials

### 2. Get Your Credentials
From your Cloudinary dashboard, copy:
- **Cloud Name** (e.g., `dxyz123abc`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 3. Add Environment Variables
Add these to your Render service environment variables (or `.env` file for local development):

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Deploy
After adding the environment variables:
1. Commit your changes
2. Push to trigger a new deployment
3. The system will automatically use Cloudinary for all new uploads

## How It Works

### With Cloudinary (Production)
- Files are uploaded to Cloudinary cloud storage
- Images are automatically optimized and served via CDN
- Files persist permanently (even after server restarts)
- URLs look like: `https://res.cloudinary.com/your-cloud/image/upload/...`

### Without Cloudinary (Development/Fallback)
- Files are stored locally in `server/uploads/`
- URLs look like: `http://localhost:5000/uploads/filename.jpg`
- ⚠️ **Files will be lost on server restart** (this is why you need Cloudinary for production)

## Features

- ✅ **Automatic fallback**: If Cloudinary isn't configured, system uses local storage
- ✅ **Image optimization**: Images are automatically resized and optimized
- ✅ **CDN delivery**: Fast global content delivery
- ✅ **Free tier**: Generous free tier (25GB storage, 25GB bandwidth/month)
- ✅ **No code changes needed**: Works automatically once credentials are set

## Troubleshooting

### Images still disappearing?
1. Check that all three Cloudinary environment variables are set
2. Verify credentials are correct (no extra spaces)
3. Check server logs for Cloudinary errors
4. Ensure you've redeployed after adding environment variables

### Want to use a different cloud storage?
The system is designed to be extensible. You can modify `server/services/cloudStorage.js` to use:
- AWS S3
- Google Cloud Storage
- Azure Blob Storage
- Any other cloud storage service

## Cost
- **Free tier**: 25GB storage, 25GB bandwidth/month
- **Paid plans**: Start at $89/month for more storage/bandwidth
- For most small-to-medium applications, the free tier is sufficient

## Security Notes
- Never commit your `CLOUDINARY_API_SECRET` to version control
- Use environment variables only
- The API secret has full access to your Cloudinary account - keep it secure
