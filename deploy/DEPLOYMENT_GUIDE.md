# 🚀 USDT-INR Exchange System Deployment Guide

## 📋 Prerequisites

1. **Server Requirements:**
   - Ubuntu 20.04+ or CentOS 8+
   - 2GB+ RAM
   - 20GB+ Storage
   - Node.js 18+
   - PM2 (Process Manager)
   - Nginx
   - SSL Certificate

2. **Domain Setup:**
   - Point your domain to the server IP
   - Get SSL certificate (Let's Encrypt recommended)

## 🔧 Server Setup

### 1. Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y
```

### 2. Clone Your Repository
```bash
git clone https://github.com/yourusername/usdt-inr.git
cd usdt-inr
```

### 3. Configure Environment Variables
```bash
# Copy example environment file
cp deploy/production.env.example .env.production

# Edit with your actual values
nano .env.production
```

### 4. Build Applications
```bash
# Install dependencies
pnpm install

# Build all applications
pnpm run build
```

### 5. Deploy with PM2
```bash
# Make deployment script executable
chmod +x deploy/deploy.sh

# Run deployment
./deploy/deploy.sh

# Start applications with PM2
pm2 start deploy/ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

### 6. Configure Nginx
```bash
# Copy Nginx configuration
sudo cp deploy/nginx.conf /etc/nginx/sites-available/usdt-inr

# Enable the site
sudo ln -s /etc/nginx/sites-available/usdt-inr /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 7. Setup SSL (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 🐳 Docker Deployment (Alternative)

If you prefer Docker:

```bash
# Build and start all services
docker-compose -f deploy/docker-compose.yml up -d

# View logs
docker-compose -f deploy/docker-compose.yml logs -f

# Stop services
docker-compose -f deploy/docker-compose.yml down
```

## 📊 Monitoring & Maintenance

### Check Application Status
```bash
# PM2 status
pm2 status

# PM2 logs
pm2 logs

# Restart applications
pm2 restart all

# Update applications
git pull
pnpm run build
pm2 restart all
```

### Nginx Commands
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo nginx -s reload

# Restart Nginx
sudo systemctl restart nginx
```

## 🔐 Security Checklist

- [ ] SSL certificate installed and working
- [ ] Firewall configured (only ports 80, 443, 22)
- [ ] Regular security updates
- [ ] Strong passwords for server access
- [ ] Regular backups
- [ ] Monitoring setup (optional)

## 🌐 Final URLs

After deployment, your applications will be available at:

- **Main Site (Buy USDT)**: https://yourdomain.com
- **Admin Dashboard**: https://yourdomain.com/admin
- **Sell Site**: https://yourdomain.com/sell
- **API**: https://yourdomain.com/api

## 🆘 Troubleshooting

### Common Issues:

1. **Port conflicts**: Make sure ports 3000-3003 are not used by other services
2. **Permission errors**: Run deployment script with proper permissions
3. **SSL issues**: Check certificate paths in Nginx configuration
4. **PM2 not starting**: Check logs with `pm2 logs`

### Log Locations:
- PM2 logs: `~/.pm2/logs/`
- Nginx logs: `/var/log/nginx/`
- Application logs: `/var/log/usdt-inr/`

## 📞 Support

If you encounter issues:
1. Check logs first
2. Verify all services are running
3. Test individual components
4. Check network connectivity
