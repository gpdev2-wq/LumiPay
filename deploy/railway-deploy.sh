#!/bin/bash

# 🚀 Railway Deployment Script for USDT-INR Platform
# This script helps you deploy your entire platform to Railway

echo "🚀 Starting Railway Deployment for USDT-INR Platform"
echo "=================================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Create new project
echo "📦 Creating new Railway project..."
railway init

# Set environment variables
echo "🔧 Setting up environment variables..."

# Production environment
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-super-secure-jwt-secret-key-change-this
railway variables set ADMIN_EMAIL=admin@usdtinr.com
railway variables set ADMIN_PASSWORD=YourSecurePassword123!

# Firebase Configuration (Update these with your actual values)
railway variables set FIREBASE_PROJECT_ID=your-firebase-project-id
railway variables set FIREBASE_PRIVATE_KEY_ID=your-private-key-id
railway variables set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
railway variables set FIREBASE_CLIENT_EMAIL=your-service-account-email
railway variables set FIREBASE_CLIENT_ID=your-client-id
railway variables set FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
railway variables set FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# CORS Configuration
railway variables set CORS_ORIGINS=https://usdtinr.com,https://admin.usdtinr.com,https://www.usdtinr.com

# Rate Limiting
railway variables set RATE_LIMIT_WINDOW_MS=900000
railway variables set RATE_LIMIT_MAX_REQUESTS=100

echo "✅ Environment variables set!"

# Deploy backend
echo "🔧 Deploying backend..."
cd backend
railway up --service backend
cd ..

# Deploy frontend
echo "🌐 Deploying frontend..."
cd apps/buy-site
railway up --service frontend
cd ../..

# Deploy admin panel
echo "👑 Deploying admin panel..."
cd apps/admin
railway up --service admin
cd ../..

# Set up custom domains
echo "🌍 Setting up custom domains..."
echo "Please add these domains in Railway dashboard:"
echo "- usdtinr.com (Frontend)"
echo "- admin.usdtinr.com (Admin Panel)"
echo "- api.usdtinr.com (Backend)"

# Show deployment status
echo "📊 Checking deployment status..."
railway status

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "Your USDT-INR platform is now live on Railway!"
echo ""
echo "Next steps:"
echo "1. Add custom domains in Railway dashboard"
echo "2. Update Firebase CORS settings"
echo "3. Test all functionality"
echo "4. Set up monitoring"
echo ""
echo "Railway Dashboard: https://railway.app/dashboard"
echo ""
