# Render Environment Variables Setup

## Required Environment Variables for Render Backend

Set these environment variables in your Render backend service:

### Database Configuration
```
DATABASE_URL=postgresql://postgres:Macbayprince05@@db.iptfgbgnfcipeggazsxi.supabase.co:5432/postgres
```

### Application Configuration
```
NODE_ENV=production
RENDER=true
PORT=10000
```

### Authentication
```
JWT_SECRET=your_jwt_secret_here
```

### CORS Configuration
```
CLIENT_URL=https://social-network-frontend-k0ml.onrender.com
FRONTEND_URL=https://social-network-frontend-k0ml.onrender.com
RENDER_FRONTEND_URL=https://social-network-frontend-k0ml.onrender.com
```

### Optional Email Configuration (if using email features)
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

## Render Deployment Settings

### Backend Service Settings:
- **Build Command**: `cd server && npm ci`
- **Start Command**: `cd server && npm start`
- **Environment**: `Node`
- **Node Version**: `18` or `20`

### Frontend Service Settings:
- **Build Command**: `cd client && npm ci && npm run build`
- **Publish Directory**: `client/dist`
- **Environment**: `Static Site`

## Testing Your Deployment

1. **Backend Health Check**: https://social-network-backend-w91a.onrender.com/health
2. **Frontend**: https://social-network-frontend-k0ml.onrender.com

## Troubleshooting

### Common Issues:
1. **Database Connection**: Ensure DATABASE_URL is correctly set
2. **CORS Errors**: Check that CLIENT_URL matches your frontend URL
3. **Build Failures**: Ensure all dependencies are in package.json
4. **Environment Variables**: Double-check all required variables are set

### Logs:
- Check Render service logs for detailed error messages
- Database connection issues will show in startup logs
- CORS errors will show in request logs


