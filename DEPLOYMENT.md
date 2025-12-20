# Deployment Guide - Hamara Samachar

## Overview
- **Frontend**: Deploy on Vercel
- **Backend**: Deploy on Ubuntu VPS (Contabo)

---

## Frontend Deployment (Vercel)

### Prerequisites
1. Vercel account
2. GitHub repository connected to Vercel

### Steps

1. **Install Vercel CLI** (optional, for local testing):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `frontend`
   - Configure build settings:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Environment Variables** (in Vercel Dashboard):
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://your-backend-domain.com/api
     ```
   - Replace `your-backend-domain.com` with your actual backend URL

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy

5. **Custom Domain** (Optional):
   - Go to Project Settings → Domains
   - Add your domain: `hamarasamachar.co.in`
   - Follow DNS configuration instructions

---

## Backend Deployment (Ubuntu VPS - Contabo)

### Prerequisites
1. Ubuntu VPS (20.04 or later)
2. Domain name pointing to VPS IP
3. SSH access to VPS

### Step 1: Server Setup

1. **Update system**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js** (v18 or later):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   node --version  # Verify installation
   ```

3. **Install PM2** (Process Manager):
   ```bash
   sudo npm install -g pm2
   ```

4. **Install MongoDB** (if not using MongoDB Atlas):
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. **Install Nginx** (for reverse proxy):
   ```bash
   sudo apt install nginx -y
   ```

### Step 2: Deploy Application

1. **Clone repository**:
   ```bash
   cd /var/www
   sudo git clone <your-repo-url> hamarasamachar
   cd hamarasamachar/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install --production
   ```

3. **Create .env file**:
   ```bash
   sudo nano .env
   ```
   Copy contents from `backend/.env.example` and update with your values:
   ```env
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb://localhost:27017/hamarasamachar
   JWT_SECRET=your_strong_secret_key_here
   JWT_EXPIRE=7d
   ADMIN_JWT_SECRET=your_strong_admin_secret_key_here
   ADMIN_JWT_EXPIRE=24h
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   OTP_EXPIRE_MINUTES=10
   TEST_OTP_MODE=false
   SMSINDIAHUB_API_KEY=your_api_key
   SMSINDIAHUB_SENDER_ID=your_sender_id
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   MAX_FILE_SIZE=10485760
   ALLOWED_IMAGE_TYPES=jpg,jpeg,png,gif,webp
   ALLOWED_PDF_TYPES=pdf
   ```

4. **Create logs directory**:
   ```bash
   mkdir -p logs
   ```

5. **Start with PM2**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup  # Follow instructions to enable auto-start on reboot
   ```

6. **Check status**:
   ```bash
   pm2 status
   pm2 logs hamarasamachar-backend
   ```

### Step 3: Configure Nginx (Reverse Proxy)

1. **Create Nginx configuration**:
   ```bash
   sudo nano /etc/nginx/sites-available/hamarasamachar
   ```

2. **Add configuration**:
   ```nginx
   server {
       listen 80;
       server_name api.hamarasamachar.co.in;  # Replace with your domain

       location / {
           proxy_pass http://localhost:5000;
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

3. **Enable site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/hamarasamachar /etc/nginx/sites-enabled/
   sudo nginx -t  # Test configuration
   sudo systemctl restart nginx
   ```

### Step 4: SSL Certificate (Let's Encrypt)

1. **Install Certbot**:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Get SSL certificate**:
   ```bash
   sudo certbot --nginx -d api.hamarasamachar.co.in
   ```

3. **Auto-renewal** (already configured by certbot):
   ```bash
   sudo certbot renew --dry-run
   ```

### Step 5: Firewall Configuration

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## Post-Deployment Checklist

### Backend
- [ ] Server is running: `pm2 status`
- [ ] Health check: `curl http://localhost:5000/api/health`
- [ ] Nginx is running: `sudo systemctl status nginx`
- [ ] SSL certificate is active
- [ ] MongoDB is running: `sudo systemctl status mongod`
- [ ] Environment variables are set correctly
- [ ] CORS includes frontend domain

### Frontend
- [ ] Build succeeds on Vercel
- [ ] Environment variable `VITE_API_URL` is set
- [ ] Custom domain is configured (if applicable)
- [ ] Frontend can connect to backend API

### Testing
- [ ] Test API endpoints from frontend
- [ ] Test authentication (admin and user)
- [ ] Test file uploads
- [ ] Test payment integration (if applicable)
- [ ] Test SMS/OTP functionality

---

## Useful Commands

### PM2 Commands
```bash
pm2 list                    # List all processes
pm2 logs hamarasamachar-backend  # View logs
pm2 restart hamarasamachar-backend  # Restart app
pm2 stop hamarasamachar-backend     # Stop app
pm2 delete hamarasamachar-backend  # Delete from PM2
pm2 monit                   # Monitor resources
```

### Nginx Commands
```bash
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t              # Test configuration
sudo tail -f /var/log/nginx/error.log
```

### MongoDB Commands
```bash
sudo systemctl status mongod
sudo systemctl restart mongod
mongo                      # Connect to MongoDB shell
```

---

## Troubleshooting

### Backend not starting
- Check logs: `pm2 logs hamarasamachar-backend`
- Verify .env file exists and has correct values
- Check MongoDB connection
- Verify port 5000 is not in use: `sudo lsof -i :5000`

### Nginx 502 Bad Gateway
- Check if backend is running: `pm2 status`
- Check backend logs: `pm2 logs`
- Verify proxy_pass URL in Nginx config

### CORS Errors
- Verify frontend URL is in backend CORS configuration
- Check `server.js` CORS origin array

### SSL Certificate Issues
- Verify domain DNS is pointing to server IP
- Check Nginx configuration
- Renew certificate: `sudo certbot renew`

---

## Security Recommendations

1. **Firewall**: Only open necessary ports (22, 80, 443)
2. **SSH**: Use key-based authentication, disable password login
3. **Environment Variables**: Never commit .env files
4. **JWT Secrets**: Use strong, random secrets
5. **MongoDB**: Enable authentication if using local MongoDB
6. **Regular Updates**: Keep system and dependencies updated
7. **Backups**: Set up regular database backups

---

## Support

For issues or questions, check:
- PM2 logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/error.log`
- Application logs: `backend/logs/`

