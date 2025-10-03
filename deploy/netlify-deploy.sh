#!/bin/bash

echo "🌐 Starting Netlify Deployment Process..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Login to Netlify
echo "🔐 Please login to Netlify..."
netlify login

# Deploy Buy-Site
echo "🚀 Deploying Buy-Site..."
cd apps/buy-site
netlify deploy --prod --dir=.next --site=your-buy-site-id
cd ../..

# Deploy Admin
echo "🚀 Deploying Admin..."
cd apps/admin
netlify deploy --prod --dir=.next --site=your-admin-site-id
cd ../..

# Deploy Sell-Site
echo "🚀 Deploying Sell-Site..."
cd apps/sell-site
netlify deploy --prod --dir=.next --site=your-sell-site-id
cd ../..

echo "✅ All sites deployed to Netlify!"
echo "🌐 Your sites are now live!"


