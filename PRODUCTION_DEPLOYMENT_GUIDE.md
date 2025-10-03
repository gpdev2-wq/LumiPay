# 🚀 Production Deployment Guide

## 🎯 **RECOMMENDED HOSTING SOLUTION**

### **Best Option: DigitalOcean + Vercel (Hybrid)**
- **Backend**: DigitalOcean Droplet ($12/month)
- **Frontend**: Vercel (Free tier)
- **Admin Panel**: Vercel (Free tier)
- **Database**: Firebase (Free tier)
- **Domain**: Namecheap ($10/year)

### **Alternative: Railway (All-in-One)**
- **Everything**: Railway ($5/month)
- **Simpler**: Single platform deployment
- **Good for**: Quick deployment

## 🌐 **RECOMMENDED DOMAIN NAMES**

### **Top Suggestions:**
1. **usdtinr.com** - Direct and professional
2. **cryptoexchange.in** - India-focused
3. **usdttoinr.com** - Clear purpose
4. **instantusdt.com** - Fast transactions
5. **cryptoconvert.in** - Conversion focused

### **Domain Registration:**
- **Provider**: Namecheap.com
- **Cost**: ~$10-15/year
- **Extensions**: .com, .in, .io

## 🏗️ **DEPLOYMENT ARCHITECTURE**

### **Option 1: DigitalOcean + Vercel (RECOMMENDED)**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Admin Panel   │    │   Backend       │
│   (Vercel)      │    │   (Vercel)      │    │   (DigitalOcean)│
│   usdtinr.com   │    │   admin.usdtinr │    │   api.usdtinr   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Firebase      │
                    │   (Database)    │
                    └─────────────────┘
```

### **Option 2: Railway (SIMPLE)**
```
┌─────────────────────────────────────────┐
│              Railway                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Frontend │ │ Admin   │ │ Backend │   │
│  │         │ │ Panel   │ │         │   │
│  └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
```

## 🚀 **STEP-BY-STEP DEPLOYMENT**

### **PHASE 1: Domain Setup**

#### **1. Register Domain:**
1. Go to [Namecheap.com](https://namecheap.com)
2. Search for your preferred domain
3. Purchase domain (~$10-15/year)
4. Complete registration

#### **2. Domain Configuration:**
```
Main Domain: usdtinr.com
Subdomains:
- api.usdtinr.com (Backend)
- admin.usdtinr.com (Admin Panel)
- www.usdtinr.com (Frontend)
```

### **PHASE 2: Backend Deployment (DigitalOcean)**

#### **1. Create DigitalOcean Account:**
1. Go to [DigitalOcean.com](https://digitalocean.com)
2. Sign up for account
3. Add payment method
4. Get $200 free credits (new users)

#### **2. Create Droplet:**
```bash
# Droplet Configuration
OS: Ubuntu 22.04 LTS
Plan: Basic ($12/month)
CPU: 1 vCPU
RAM: 2GB
Storage: 50GB SSD
Region: Bangalore (closest to India)
```

#### **3. Server Setup:**
```bash
# Connect to server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt install nginx -y

# Install Certbot for SSL
apt install certbot python3-certbot-nginx -y
```

#### **4. Deploy Backend:**
```bash
# Clone repository
git clone https://github.com/yourusername/usdt-inr.git
cd usdt-inr/backend

# Install dependencies
npm install

# Create environment file
nano .env
```

#### **5. Environment Configuration:**
```bash
# backend/.env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secure-jwt-secret-key-here
ADMIN_EMAIL=admin@usdtinr.com
ADMIN_PASSWORD=YourSecurePassword123!

# Firebase Configuration
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
```

#### **6. Start Backend:**
```bash
# Build and start
npm run build
pm2 start dist/main.js --name "usdt-backend"
pm2 save
pm2 startup
```

#### **7. Configure Nginx:**
```bash
# Create Nginx config
nano /etc/nginx/sites-available/usdtinr
```

```nginx
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
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/usdtinr /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### **8. Setup SSL:**
```bash
# Get SSL certificate
certbot --nginx -d api.usdtinr.com
```

### **PHASE 3: Frontend Deployment (Vercel)**

#### **1. Create Vercel Account:**
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Connect your repository

#### **2. Deploy Frontend:**
```bash
# In your local project
cd apps/buy-site

# Create vercel.json
nano vercel.json
```

```json
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
  }
}
```

#### **3. Deploy:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set custom domain
vercel domains add usdtinr.com
```

### **PHASE 4: Admin Panel Deployment (Vercel)**

#### **1. Deploy Admin Panel:**
```bash
cd apps/admin

# Create vercel.json
nano vercel.json
```

```json
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
  }
}
```

#### **2. Deploy:**
```bash
vercel --prod
vercel domains add admin.usdtinr.com
```

### **PHASE 5: Firebase Configuration**

#### **1. Update Firebase Rules:**
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules
```

#### **2. Update CORS:**
```javascript
// In Firebase Console
// Add your domains to authorized domains
```

## 🔧 **ALTERNATIVE: Railway Deployment (SIMPLE)**

### **1. Create Railway Account:**
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect repository

### **2. Deploy All Services:**
```bash
# Railway will auto-detect and deploy:
# - Backend (NestJS)
# - Frontend (Next.js)
# - Admin Panel (Next.js)
```

### **3. Environment Variables:**
```bash
# Set in Railway dashboard
NODE_ENV=production
JWT_SECRET=your-secure-secret
ADMIN_EMAIL=admin@usdtinr.com
ADMIN_PASSWORD=YourSecurePassword123!
# ... all other env vars
```

### **4. Custom Domains:**
```bash
# Add custom domains in Railway
usdtinr.com -> Frontend
admin.usdtinr.com -> Admin Panel
api.usdtinr.com -> Backend
```

## 💰 **COST BREAKDOWN**

### **Option 1: DigitalOcean + Vercel**
```
Domain (Namecheap): $12/year
DigitalOcean Droplet: $12/month
Vercel: Free
Firebase: Free
Total: ~$156/year
```

### **Option 2: Railway**
```
Domain (Namecheap): $12/year
Railway: $5/month
Firebase: Free
Total: ~$72/year
```

## 🛡️ **PRODUCTION SECURITY CHECKLIST**

### **1. Environment Security:**
- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS everywhere
- [ ] Set up SSL certificates
- [ ] Configure firewall rules

### **2. Application Security:**
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Enable audit logging
- [ ] Set up alerts

### **3. Domain Security:**
- [ ] Enable DNSSEC
- [ ] Set up SPF records
- [ ] Configure DMARC
- [ ] Enable domain privacy

## 📊 **MONITORING & MAINTENANCE**

### **1. Monitoring Tools:**
- **Uptime**: UptimeRobot (Free)
- **Performance**: Vercel Analytics
- **Errors**: Sentry (Free tier)
- **Logs**: PM2 logs (DigitalOcean)

### **2. Backup Strategy:**
- **Database**: Firebase automatic backups
- **Code**: GitHub repository
- **Config**: Environment variables backup

### **3. Maintenance Tasks:**
- **Weekly**: Check server logs
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Annually**: SSL certificate renewal

## 🚀 **DEPLOYMENT COMMANDS**

### **Quick Deploy Script:**
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment..."

# Backend deployment
echo "📦 Deploying backend..."
cd backend
npm run build
pm2 restart usdt-backend

# Frontend deployment
echo "🌐 Deploying frontend..."
cd ../apps/buy-site
vercel --prod

# Admin deployment
echo "👑 Deploying admin panel..."
cd ../admin
vercel --prod

echo "✅ Deployment complete!"
```

## 🎯 **RECOMMENDED APPROACH**

### **For Beginners: Railway**
- ✅ **Simple**: One-click deployment
- ✅ **Cheap**: $5/month
- ✅ **Fast**: Quick setup
- ✅ **Managed**: No server management

### **For Advanced: DigitalOcean + Vercel**
- ✅ **Scalable**: Easy to scale
- ✅ **Flexible**: Full control
- ✅ **Professional**: Enterprise-grade
- ✅ **Cost-effective**: Better long-term

## 📞 **SUPPORT & HELP**

### **Deployment Support:**
- **DigitalOcean**: 24/7 support
- **Vercel**: Community support
- **Railway**: Discord community
- **Firebase**: Google support

### **Domain Support:**
- **Namecheap**: 24/7 chat support
- **DNS Issues**: Namecheap help center

---

## 🎉 **FINAL RESULT**

After deployment, you'll have:
- ✅ **Live Website**: https://usdtinr.com
- ✅ **Admin Panel**: https://admin.usdtinr.com
- ✅ **API**: https://api.usdtinr.com
- ✅ **SSL Certificates**: All secured
- ✅ **Professional Setup**: Production-ready

**Your USDT-INR platform will be live and ready for users!** 🚀
