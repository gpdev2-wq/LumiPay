#!/bin/bash

# USDT-INR Exchange Deployment Script
echo "🚀 Starting deployment of USDT-INR Exchange System..."

# Check if running on production server
if [ "$NODE_ENV" != "production" ]; then
    echo "⚠️  Warning: Not running in production mode"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build all applications
echo "🔨 Building applications..."
pnpm run build

# Create production directories
echo "📁 Creating production directories..."
mkdir -p /var/www/usdt-inr
mkdir -p /var/log/usdt-inr

# Copy built applications
echo "📋 Copying applications..."
cp -r backend/dist /var/www/usdt-inr/backend/
cp -r apps/admin/.next /var/www/usdt-inr/admin/
cp -r apps/buy-site/.next /var/www/usdt-inr/buy-site/
cp -r apps/sell-site/.next /var/www/usdt-inr/sell-site/

# Copy configuration files
echo "⚙️  Copying configuration files..."
cp backend/package.json /var/www/usdt-inr/backend/
cp backend/node_modules /var/www/usdt-inr/backend/ -r

# Set permissions
echo "🔐 Setting permissions..."
chown -R www-data:www-data /var/www/usdt-inr
chmod -R 755 /var/www/usdt-inr

echo "✅ Deployment completed successfully!"
echo "🌐 Your applications should now be accessible at:"
echo "   - Backend API: http://yourdomain.com:3001"
echo "   - Admin: http://yourdomain.com:3000"
echo "   - Buy Site: http://yourdomain.com:3002"
echo "   - Sell Site: http://yourdomain.com:3003"
