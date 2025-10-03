#!/bin/bash

# 🚀 Vercel Deployment Script for USDT-INR Platform
# This script helps you deploy frontend and admin panel to Vercel

echo "🚀 Starting Vercel Deployment for USDT-INR Platform"
echo "=================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel
echo "🔐 Logging into Vercel..."
vercel login

# Deploy Frontend
echo "🌐 Deploying Frontend..."
cd apps/buy-site

# Create vercel.json for frontend
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.usdtinr.com"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/$1"
    }
  ]
}
EOF

# Deploy frontend
echo "📦 Deploying frontend to Vercel..."
vercel --prod

# Set custom domain for frontend
echo "🌍 Setting up custom domain for frontend..."
echo "Please add 'usdtinr.com' as custom domain in Vercel dashboard"

cd ../..

# Deploy Admin Panel
echo "👑 Deploying Admin Panel..."
cd apps/admin

# Create vercel.json for admin
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.usdtinr.com"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/$1"
    }
  ]
}
EOF

# Deploy admin panel
echo "📦 Deploying admin panel to Vercel..."
vercel --prod

# Set custom domain for admin
echo "🌍 Setting up custom domain for admin panel..."
echo "Please add 'admin.usdtinr.com' as custom domain in Vercel dashboard"

cd ../..

echo ""
echo "🎉 Vercel Deployment Complete!"
echo "============================="
echo ""
echo "Your frontend and admin panel are now deployed to Vercel!"
echo ""
echo "Next steps:"
echo "1. Add custom domains in Vercel dashboard:"
echo "   - usdtinr.com (Frontend)"
echo "   - admin.usdtinr.com (Admin Panel)"
echo "2. Update DNS records to point to Vercel"
echo "3. Test all functionality"
echo "4. Set up monitoring"
echo ""
echo "Vercel Dashboard: https://vercel.com/dashboard"
echo ""
