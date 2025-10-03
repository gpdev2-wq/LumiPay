# 🌐 Complete Netlify Deployment Guide for USDT-INR Exchange

## 📋 Overview
This guide will help you deploy your USDT-INR exchange system using:
- **Netlify** for frontend applications (buy-site, admin, sell-site)
- **Railway** for backend API (recommended alternative to Netlify Functions)

## 🚀 Step 1: Backend Deployment (Railway)

### 1.1 Deploy Backend to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect it's a Node.js app
6. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3001
   CORS_ORIGINS=https://your-buy-site.netlify.app,https://your-admin.netlify.app,https://your-sell-site.netlify.app
   ```
7. Railway will provide a URL like: `https://your-project.railway.app`

## 🌐 Step 2: Netlify Frontend Deployment

### 2.1 Deploy Buy-Site (Main Website)
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Configure build settings:
   - **Base directory**: `apps/buy-site`
   - **Build command**: `npm run build`
   - **Publish directory**: `apps/buy-site/.next`
   - **Node version**: `18`

6. Add environment variables:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-project.railway.app
   NODE_ENV=production
   ```

7. Click "Deploy site"
8. Your site will be available at: `https://random-name.netlify.app`

### 2.2 Deploy Admin Dashboard
1. Create another site on Netlify
2. Use the same repository
3. Configure build settings:
   - **Base directory**: `apps/admin`
   - **Build command**: `npm run build`
   - **Publish directory**: `apps/admin/.next`
   - **Node version**: `18`

4. Add environment variables:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-project.railway.app
   NODE_ENV=production
   ```

### 2.3 Deploy Sell-Site
1. Create third site on Netlify
2. Use the same repository
3. Configure build settings:
   - **Base directory**: `apps/sell-site`
   - **Build command**: `npm run build`
   - **Publish directory**: `apps/sell-site/.next`
   - **Node version**: `18`

4. Add environment variables:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-project.railway.app
   NODE_ENV=production
   ```

## 🔧 Step 3: Update Configuration Files

### 3.1 Update Netlify TOML files
Replace `your-backend-url.railway.app` with your actual Railway URL in:
- `apps/buy-site/netlify.toml`
- `apps/admin/netlify.toml`
- `apps/sell-site/netlify.toml`

### 3.2 Update Frontend API Calls
Update all API calls in your frontend to use the Railway backend URL.

## 🌍 Step 4: Custom Domains (Optional)

### 4.1 Buy-Site Domain
1. In Netlify dashboard → Site settings → Domain management
2. Add custom domain: `yourdomain.com`
3. Configure DNS:
   - Add CNAME record: `www` → `your-site.netlify.app`
   - Add A record: `@` → Netlify IP (provided by Netlify)

### 4.2 Admin Domain
1. Add subdomain: `admin.yourdomain.com`
2. Configure DNS: CNAME `admin` → `your-admin-site.netlify.app`

### 4.3 Sell-Site Domain
1. Add subdomain: `sell.yourdomain.com`
2. Configure DNS: CNAME `sell` → `your-sell-site.netlify.app`

## 🔐 Step 5: Environment Variables

### 5.1 Firebase Configuration
Add these to all Netlify sites:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5.2 Backend CORS Configuration
In Railway, update CORS_ORIGINS with your actual Netlify URLs:
```
CORS_ORIGINS=https://your-buy-site.netlify.app,https://admin.yourdomain.com,https://sell.yourdomain.com
```

## 📱 Step 6: Testing Deployment

### 6.1 Test Each Site
1. **Buy-Site**: Visit your main domain
2. **Admin**: Visit admin subdomain
3. **Sell-Site**: Visit sell subdomain
4. **API**: Test backend endpoints

### 6.2 Test Payment Flow
1. Try creating an order
2. Test payment detection
3. Verify order status updates

## 🚨 Common Issues & Solutions

### Issue 1: Build Failures
**Solution**: Check Node version (use 18) and build commands

### Issue 2: API Calls Failing
**Solution**: Verify NEXT_PUBLIC_BACKEND_URL is correct

### Issue 3: CORS Errors
**Solution**: Update CORS_ORIGINS in Railway with actual Netlify URLs

### Issue 4: Environment Variables Not Working
**Solution**: Ensure variables start with `NEXT_PUBLIC_` for client-side access

## 📊 Monitoring & Maintenance

### Netlify Analytics
- Enable Netlify Analytics in site settings
- Monitor traffic and performance

### Railway Monitoring
- Check Railway dashboard for backend health
- Monitor API response times

### Updates
1. Push changes to GitHub
2. Netlify auto-deploys on push
3. Railway auto-deploys on push

## 💰 Cost Estimation

- **Netlify**: Free tier (100GB bandwidth, 300 build minutes)
- **Railway**: $5/month for hobby plan
- **Domain**: $10-15/year
- **Total**: ~$15/month + domain

## 🎯 Final URLs Structure

After deployment:
- **Main Site**: `https://yourdomain.com`
- **Admin**: `https://admin.yourdomain.com`
- **Sell Site**: `https://sell.yourdomain.com`
- **API**: `https://your-project.railway.app`

## 🆘 Support

If you encounter issues:
1. Check Netlify build logs
2. Check Railway deployment logs
3. Verify environment variables
4. Test API endpoints directly


