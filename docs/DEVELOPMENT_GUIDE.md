# ThemeVN Development Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Email Configuration](#email-configuration)
5. [Running Locally](#running-locally)
6. [VPS Deployment](#vps-deployment)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL (Replit) or MySQL 8.0+ (VPS)
- npm or yarn

### Clone and Install
```bash
git clone <repository-url>
cd themevn
npm install
```

### Run Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

---

## Environment Setup

### Required Environment Variables

Create a `.env` file in the project root:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/themevn
# OR for MySQL:
# DB_TYPE=mysql
# DATABASE_URL=mysql://user:password@localhost:3306/themevn

# Session Configuration
SESSION_SECRET=your_random_secret_here_at_least_32_chars

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_NAME=ThemeVN
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

### Generate Session Secret
```bash
openssl rand -hex 32
```

---

## Database Configuration

### PostgreSQL (Replit/Default)
```env
DATABASE_URL=postgresql://username:password@host:5432/database_name
```

### MySQL (VPS Deployment)
```env
DB_TYPE=mysql
DATABASE_URL=mysql://username:password@localhost:3306/themevn
```

### Database Commands
```bash
# Push schema to database
npm run db:push

# Open Drizzle Studio (database browser)
npm run db:studio

# Force push (use with caution)
npm run db:push --force
```

---

## Email Configuration

### Gmail SMTP Setup

1. **Enable 2-Factor Authentication** on your Gmail account

2. **Create App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Configure Environment:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # App password (with spaces removed)
SMTP_FROM_NAME=ThemeVN
SMTP_FROM_EMAIL=your_email@gmail.com
```

### SendGrid SMTP Setup
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxx  # Your SendGrid API key
SMTP_FROM_NAME=ThemeVN
SMTP_FROM_EMAIL=verified_sender@yourdomain.com
```

### Mailgun SMTP Setup
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your_mailgun_password
SMTP_FROM_NAME=ThemeVN
SMTP_FROM_EMAIL=noreply@your-domain.mailgun.org
```

### Test Email Configuration
```bash
# Test OTP email sending
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "type": "login"}'

# Expected response when configured:
# {"success":true,"message":"OTP sent via Email","method":"email","configured":true}

# Expected response when not configured:
# {"success":true,"message":"OTP generated (check console)","method":"email","configured":false}
```

---

## Running Locally

### Development Mode
```bash
npm run dev
```
- Hot reload enabled
- Frontend: Vite dev server
- Backend: Express with tsx watch

### Production Build
```bash
npm run build
npm start
```

### Available Scripts
| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:push` | Sync database schema |
| `npm run db:studio` | Open Drizzle Studio |

---

## VPS Deployment

### Automated Installation (Recommended)

```bash
# Download and run the installer
cd /tmp
wget https://your-repo/scripts/autoinstall.sh
chmod +x autoinstall.sh
sudo ./autoinstall.sh --domain yourdomain.com --ssl
```

### Manual Installation

#### 1. Install Dependencies
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs mysql-server nginx

# Check versions
node --version  # Should be v20.x
npm --version
```

#### 2. Setup MySQL
```bash
sudo mysql_secure_installation

sudo mysql -u root -p
```

```sql
CREATE DATABASE themevn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'themevn'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON themevn.* TO 'themevn'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Clone and Configure
```bash
cd /var/www
git clone <repository-url> themevn
cd themevn
npm install
```

Create `.env` file:
```bash
nano .env
```

```env
DATABASE_URL=mysql://themevn:your_secure_password@localhost:3306/themevn
DB_TYPE=mysql
NODE_ENV=production
SESSION_SECRET=$(openssl rand -hex 32)

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_NAME=ThemeVN
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

#### 4. Build and Push Schema
```bash
npm run build
npm run db:push
```

#### 5. Create Systemd Service
```bash
sudo nano /etc/systemd/system/themevn.service
```

```ini
[Unit]
Description=ThemeVN Application
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/themevn
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/var/www/themevn/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable themevn
sudo systemctl start themevn
```

#### 6. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/themevn
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
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
sudo ln -s /etc/nginx/sites-available/themevn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 7. Setup SSL (Optional)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/send-otp` | POST | Send OTP to email/phone |
| `/api/auth/verify-otp` | POST | Verify OTP and login/signup |
| `/api/auth/login` | POST | Login with email/password |
| `/api/auth/logout` | POST | Logout current session |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/reset-password` | POST | Reset password |

### Send OTP
```bash
# Email OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "type": "login"}'

# Phone OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+84123456789", "type": "signup"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "code": "123456", "type": "login"}'
```

### Themes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/themes` | GET | List all themes |
| `/api/themes/:id` | GET | Get theme by ID |
| `/api/themes` | POST | Create theme (admin) |
| `/api/themes/:id` | PUT | Update theme (admin) |
| `/api/themes/:id` | DELETE | Delete theme (admin) |

### Orders

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orders` | GET | List orders |
| `/api/orders` | POST | Create order |
| `/api/orders/:id` | PUT | Update order |

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u themevn -p -h localhost themevn
```

#### 2. Email Not Sending
```bash
# Check SMTP configuration
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "type": "login"}'

# Check logs
journalctl -u themevn -f
```

#### 3. Permission Denied
```bash
sudo chown -R www-data:www-data /var/www/themevn
sudo chmod -R 755 /var/www/themevn
```

#### 4. Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# Kill process
kill -9 <PID>
```

#### 5. Nginx 502 Bad Gateway
```bash
# Check app is running
sudo systemctl status themevn

# Check logs
journalctl -u themevn --no-pager -n 50
```

### Useful Commands

```bash
# View app logs
journalctl -u themevn -f

# Restart app
sudo systemctl restart themevn

# Check app status
sudo systemctl status themevn

# Restart Nginx
sudo systemctl reload nginx

# Test Nginx config
sudo nginx -t
```

---

## Support

For issues and questions:
- Check the logs: `journalctl -u themevn -f`
- Review environment variables in `.env`
- Ensure database is accessible
- Verify SMTP credentials are correct

---

*Last updated: January 2026*
