#!/bin/bash

# 🚀 DigitalOcean Deployment Script for USDT-INR Platform
# This script helps you deploy your backend to DigitalOcean

echo "🚀 Starting DigitalOcean Deployment for USDT-INR Platform"
echo "========================================================"

# Server configuration
SERVER_IP="YOUR_SERVER_IP"
DOMAIN="api.usdtinr.com"
EMAIL="your-email@example.com"

echo "📋 Server Configuration:"
echo "Server IP: $SERVER_IP"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Check if server IP is set
if [ "$SERVER_IP" = "YOUR_SERVER_IP" ]; then
    echo "❌ Please update SERVER_IP in this script first!"
    exit 1
fi

# Connect to server and setup
echo "🔐 Connecting to server..."
ssh root@$SERVER_IP << 'EOF'

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2
echo "📦 Installing PM2..."
npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
apt install nginx -y

# Install Certbot for SSL
echo "📦 Installing Certbot..."
apt install certbot python3-certbot-nginx -y

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /var/www/usdt-inr
cd /var/www/usdt-inr

# Clone repository (Update with your actual repository)
echo "📥 Cloning repository..."
git clone https://github.com/yourusername/usdt-inr.git .

# Install dependencies
echo "📦 Installing dependencies..."
cd backend
npm install

# Create environment file
echo "🔧 Creating environment file..."
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secure-jwt-secret-key-change-this
ADMIN_EMAIL=admin@usdtinr.com
ADMIN_PASSWORD=YourSecurePassword123!

# Firebase Configuration (Update these with your actual values)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# CORS Configuration
CORS_ORIGINS=https://usdtinr.com,https://admin.usdtinr.com,https://www.usdtinr.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENVEOF

# Build application
echo "🔨 Building application..."
npm run build

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start dist/main.js --name "usdt-backend"
pm2 save
pm2 startup

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/usdtinr << 'NGINXEOF'
server {
    listen 80;
    server_name api.usdtinr.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

# Enable site
ln -s /etc/nginx/sites-available/usdtinr /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Setup SSL certificate
echo "🔒 Setting up SSL certificate..."
certbot --nginx -d api.usdtinr.com --non-interactive --agree-tos --email your-email@example.com

# Setup auto-renewal
echo "🔄 Setting up SSL auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "✅ Backend deployment complete!"
echo "🌐 Your API is now available at: https://api.usdtinr.com"

EOF

echo ""
echo "🎉 DigitalOcean Backend Deployment Complete!"
echo "==========================================="
echo ""
echo "Your backend is now live at: https://api.usdtinr.com"
echo ""
echo "Next steps:"
echo "1. Update DNS records to point to your server IP"
echo "2. Deploy frontend to Vercel"
echo "3. Deploy admin panel to Vercel"
echo "4. Test all functionality"
echo "5. Set up monitoring"
echo ""
echo "Server IP: $SERVER_IP"
echo "Domain: $DOMAIN"
echo ""
