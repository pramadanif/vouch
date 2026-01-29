# Vouch Backend - VPS Deployment Guide

Complete step-by-step guide for deploying the Vouch backend to a VPS with PostgreSQL and PM2.

---

## 📋 Prerequisites

- VPS with Ubuntu 22.04+ (or similar)
- SSH access to VPS
- Domain name (optional, for SSL)
- Git installed on VPS

---

## 🔧 Step 1: Install Node.js (v18+)

```bash
# Connect to VPS
ssh user@your-vps-ip

# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node -v  # Should show v18.x.x
npm -v
```

---

## 🐘 Step 2: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

Inside PostgreSQL shell:
```sql
-- Create database
CREATE DATABASE vouch;

-- Create user with password
CREATE USER vouchuser WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE vouch TO vouchuser;

-- Grant schema permissions (PostgreSQL 15+)
\c vouch
GRANT ALL ON SCHEMA public TO vouchuser;

-- Exit
\q
```

**Test connection:**
```bash
psql -h localhost -U vouchuser -d vouch
# Enter password when prompted
```

---

## 📦 Step 3: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs (copy and run it)
```

---

## 📂 Step 4: Clone and Setup Project

```bash
# Create app directory
sudo mkdir -p /var/www/vouch-server
sudo chown $USER:$USER /var/www/vouch-server

# Clone repository (server folder only)
cd /var/www/vouch-server
git clone https://github.com/pramadanif/vouch.git .

# Navigate to server folder
cd server

# Install dependencies
npm install
```

---

## ⚙️ Step 5: Configure Environment Variables

```bash
# Create .env file
nano .env
```

Add the following (edit with your values):
```env
# Database
DATABASE_URL="postgresql://vouchuser:your_secure_password_here@localhost:5432/vouch"

# Server
PORT=3001
NODE_ENV=production

# Blockchain
PRIVATE_KEY=0x_your_protocol_wallet_private_key
LISK_RPC_URL=https://rpc.sepolia-api.lisk.com

# Token Addresses (Lisk Sepolia)
MOCK_USDC_ADDRESS=0xB7c78ceCB25a1c40b3fa3382bAf3F34c9b5bdD66
MOCK_IDRX_ADDRESS=0xDfef62cf7516508B865440E5819e5435e69adceb
VOUCH_ESCROW_ADDRESS=0xb015d8Eb15B5E82E10aCF1606c60cFD64C4c7cB2

# Xendit (Optional - for real payments)
XENDIT_SECRET_KEY=xnd_production_xxx
XENDIT_CALLBACK_TOKEN=your_callback_token

# Frontend URL (for CORS)
FRONTEND_URL=https://vouch.your-domain.com
```

Save: `Ctrl+X`, then `Y`, then `Enter`

---

## 🗄️ Step 6: Setup Prisma Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to PostgreSQL
npx prisma db push

# (Optional) Verify tables created
npx prisma studio
# Opens browser at http://localhost:5555
```

**If you have existing SQLite data to migrate:**
```bash
# Create migration from schema
npx prisma migrate dev --name init

# Apply migration
npx prisma migrate deploy
```

---

## 🔨 Step 7: Build and Start with PM2

```bash
# Build TypeScript to JavaScript
npm run build

# Verify build output
ls dist/  # Should show index.js and other files

# Start with PM2
pm2 start dist/index.js --name vouch-server

# View logs
pm2 logs vouch-server

# Save PM2 process list
pm2 save
```

**Useful PM2 Commands:**
```bash
pm2 status                 # View all processes
pm2 restart vouch-server   # Restart server
pm2 stop vouch-server      # Stop server
pm2 delete vouch-server    # Remove from PM2
pm2 logs vouch-server      # View logs
pm2 monit                  # Real-time monitoring
```

---

## 🌐 Step 8: Setup Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install nginx -y

# Create site configuration
sudo nano /etc/nginx/sites-available/vouch-server
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name api.vouch.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/vouch-server /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔒 Step 9: Setup SSL (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.vouch.your-domain.com

# Auto-renewal is enabled by default
# Test renewal:
sudo certbot renew --dry-run
```

---

## 🔥 Step 10: Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

---

## ✅ Post-Deployment Checklist

| Check | Command/Action |
|-------|----------------|
| Server running | `pm2 status` |
| Database connected | `pm2 logs vouch-server` |
| API responding | `curl http://localhost:3001/health` |
| Nginx working | `curl http://api.your-domain.com` |
| SSL working | Visit `https://api.your-domain.com` |
| Xendit callback configured | Add `https://api.your-domain.com/api/payment/xendit/callback` in Xendit dashboard |

---

## 🔄 Updating Deployment

When you push new code:

```bash
cd /var/www/vouch-server/server

# Pull latest
git pull origin main

# Install dependencies (if changed)
npm install

# Regenerate Prisma (if schema changed)
npx prisma generate
npx prisma db push

# Rebuild
npm run build

# Restart PM2
pm2 restart vouch-server
```

---

## 🛠️ Troubleshooting

### Database connection error
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U vouchuser -d vouch
```

### PM2 process not starting
```bash
# View full logs
pm2 logs vouch-server --lines 100

# Check if port is in use
sudo lsof -i :3001
```

### Nginx 502 Bad Gateway
```bash
# Check if server is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `PORT` | Server port (default: 3001) | ❌ |
| `PRIVATE_KEY` | Protocol wallet private key | ✅ |
| `LISK_RPC_URL` | Lisk RPC endpoint | ❌ |
| `XENDIT_SECRET_KEY` | Xendit API key | ❌ |
| `XENDIT_CALLBACK_TOKEN` | Webhook verification | ❌ |
| `FRONTEND_URL` | CORS allowed origin | ✅ |

---

Done! Your Vouch backend is now deployed on VPS. 🎉
