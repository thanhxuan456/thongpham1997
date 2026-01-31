#!/bin/bash

# ============================================
# ThemeVN Auto Installation Script (MySQL)
# ============================================
# This script installs the ThemeVN marketplace
# on a VPS with MySQL database
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logo
echo -e "${PURPLE}"
echo "  _____ _                    __     ___   _ "
echo " |_   _| |__   ___ _ __ ___  \ \   / / \ | |"
echo "   | | | '_ \ / _ \ '\` _ \`  \  \ \ / /|  \| |"
echo "   | | | | | |  __/ | | | | |  \ V / | |\  |"
echo "   |_| |_| |_|\___|_| |_| |_|   \_/  |_| \_|"
echo -e "${NC}"
echo -e "${CYAN}WordPress Themes Marketplace - MySQL Auto Installer${NC}"
echo "======================================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Warning: It's recommended to run this script as root${NC}"
fi

# Default values
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="themevn"
DB_USER="themevn"
DB_PASSWORD=""
DB_ROOT_PASSWORD=""
APP_PORT="5000"
DOMAIN=""
INSTALL_DIR="/var/www/themevn"
ENABLE_SSL="n"
CREATE_DB="y"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --db-host)
      DB_HOST="$2"
      shift 2
      ;;
    --db-port)
      DB_PORT="$2"
      shift 2
      ;;
    --db-name)
      DB_NAME="$2"
      shift 2
      ;;
    --db-user)
      DB_USER="$2"
      shift 2
      ;;
    --db-password)
      DB_PASSWORD="$2"
      shift 2
      ;;
    --db-root-password)
      DB_ROOT_PASSWORD="$2"
      shift 2
      ;;
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    --port)
      APP_PORT="$2"
      shift 2
      ;;
    --install-dir)
      INSTALL_DIR="$2"
      shift 2
      ;;
    --ssl)
      ENABLE_SSL="y"
      shift
      ;;
    --skip-db-create)
      CREATE_DB="n"
      shift
      ;;
    --help)
      echo "Usage: ./autoinstall.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --db-host           MySQL host (default: localhost)"
      echo "  --db-port           MySQL port (default: 3306)"
      echo "  --db-name           Database name (default: themevn)"
      echo "  --db-user           Database user (default: themevn)"
      echo "  --db-password       Database user password (required)"
      echo "  --db-root-password  MySQL root password (for creating database)"
      echo "  --domain            Domain name for the application"
      echo "  --port              Application port (default: 5000)"
      echo "  --install-dir       Installation directory (default: /var/www/themevn)"
      echo "  --ssl               Enable SSL with Let's Encrypt"
      echo "  --skip-db-create    Skip database creation (use existing)"
      echo "  --help              Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Interactive mode if no password provided
if [ -z "$DB_PASSWORD" ]; then
  echo -e "${CYAN}Interactive Setup Mode${NC}"
  echo "========================"
  echo ""
  
  # Database host
  read -p "MySQL host [localhost]: " input
  DB_HOST=${input:-$DB_HOST}
  
  # Database port
  read -p "MySQL port [$DB_PORT]: " input
  DB_PORT=${input:-$DB_PORT}
  
  # Database name
  read -p "Database name [themevn]: " input
  DB_NAME=${input:-$DB_NAME}
  
  # Database user
  read -p "Database user [themevn]: " input
  DB_USER=${input:-$DB_USER}
  
  # Database password
  while [ -z "$DB_PASSWORD" ]; do
    read -sp "Database user password (required): " DB_PASSWORD
    echo ""
    if [ -z "$DB_PASSWORD" ]; then
      echo -e "${RED}Password cannot be empty${NC}"
    fi
  done
  
  # Create database
  read -p "Create database and user? [Y/n]: " CREATE_DB
  CREATE_DB=${CREATE_DB:-Y}
  if [[ "$CREATE_DB" =~ ^[Yy]$ ]]; then
    CREATE_DB="y"
    read -sp "MySQL root password: " DB_ROOT_PASSWORD
    echo ""
  else
    CREATE_DB="n"
  fi
  
  # Domain
  read -p "Domain name (e.g., themevn.com) [leave empty for IP access]: " DOMAIN
  
  # SSL
  if [ -n "$DOMAIN" ]; then
    read -p "Enable SSL with Let's Encrypt? [y/N]: " ENABLE_SSL
    ENABLE_SSL=${ENABLE_SSL:-n}
  fi
  
  # Installation directory
  read -p "Installation directory [$INSTALL_DIR]: " input
  INSTALL_DIR=${input:-$INSTALL_DIR}
  
  echo ""
fi

# Build DATABASE_URL
DATABASE_URL="mysql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

# Summary
echo -e "${CYAN}Installation Summary${NC}"
echo "===================="
echo -e "Database Type:     ${GREEN}MySQL${NC}"
echo -e "Database Host:     ${GREEN}$DB_HOST:$DB_PORT${NC}"
echo -e "Database Name:     ${GREEN}$DB_NAME${NC}"
echo -e "Database User:     ${GREEN}$DB_USER${NC}"
echo -e "Create Database:   ${GREEN}$CREATE_DB${NC}"
echo -e "Domain:            ${GREEN}${DOMAIN:-"None (IP access)"}${NC}"
echo -e "SSL Enabled:       ${GREEN}$ENABLE_SSL${NC}"
echo -e "Install Directory: ${GREEN}$INSTALL_DIR${NC}"
echo ""
read -p "Continue with installation? [Y/n]: " confirm
confirm=${confirm:-Y}
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Installation cancelled."
  exit 0
fi

echo ""
echo -e "${CYAN}Starting installation...${NC}"
echo ""

# ============================================
# Step 1: Install system dependencies
# ============================================
echo -e "${BLUE}[1/9] Installing system dependencies...${NC}"

# Detect OS
if [ -f /etc/debian_version ]; then
  OS="debian"
  apt-get update -qq
  apt-get install -y -qq curl git nginx certbot python3-certbot-nginx
elif [ -f /etc/redhat-release ]; then
  OS="redhat"
  yum install -y curl git nginx certbot python3-certbot-nginx
else
  echo -e "${RED}Unsupported OS. Please use Debian/Ubuntu or RHEL/CentOS${NC}"
  exit 1
fi

# Install Node.js 20.x if not present or outdated
if ! command -v node &> /dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 18 ]]; then
  echo "Installing Node.js 20.x..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# Install npm if not present
if ! command -v npm &> /dev/null; then
  apt-get install -y npm
fi

echo -e "${GREEN}✓ System dependencies installed${NC}"

# ============================================
# Step 2: Install MySQL
# ============================================
echo -e "${BLUE}[2/9] Installing MySQL Server...${NC}"

if [ "$OS" = "debian" ]; then
  # Install MySQL Server
  if ! command -v mysql &> /dev/null; then
    apt-get install -y -qq mysql-server
  fi
else
  if ! command -v mysql &> /dev/null; then
    yum install -y mysql-server
  fi
fi

# Start and enable MySQL
systemctl enable mysql 2>/dev/null || systemctl enable mysqld 2>/dev/null
systemctl start mysql 2>/dev/null || systemctl start mysqld 2>/dev/null

echo -e "${GREEN}✓ MySQL Server installed and running${NC}"

# ============================================
# Step 3: Create database and user
# ============================================
if [[ "$CREATE_DB" =~ ^[Yy]$ ]]; then
  echo -e "${BLUE}[3/9] Creating MySQL database and user...${NC}"
  
  # Create database and user using root
  if [ -n "$DB_ROOT_PASSWORD" ]; then
    MYSQL_CMD="mysql -uroot -p$DB_ROOT_PASSWORD"
  else
    MYSQL_CMD="mysql -uroot"
  fi
  
  # Create database
  $MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || {
    echo -e "${YELLOW}Warning: Could not create database (may already exist)${NC}"
  }
  
  # Create user and grant privileges
  $MYSQL_CMD -e "CREATE USER IF NOT EXISTS '$DB_USER'@'$DB_HOST' IDENTIFIED BY '$DB_PASSWORD';" 2>/dev/null || {
    echo -e "${YELLOW}Warning: Could not create user (may already exist)${NC}"
  }
  
  $MYSQL_CMD -e "GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'$DB_HOST';" 2>/dev/null
  $MYSQL_CMD -e "GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';" 2>/dev/null
  $MYSQL_CMD -e "FLUSH PRIVILEGES;" 2>/dev/null
  
  echo -e "${GREEN}✓ Database and user created${NC}"
else
  echo -e "${BLUE}[3/9] Skipping database creation (using existing)...${NC}"
fi

# ============================================
# Step 4: Create installation directory
# ============================================
echo -e "${BLUE}[4/9] Creating installation directory...${NC}"

mkdir -p $INSTALL_DIR
cd $INSTALL_DIR

echo -e "${GREEN}✓ Directory created${NC}"

# ============================================
# Step 5: Copy application files
# ============================================
echo -e "${BLUE}[5/9] Setting up application files...${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

# Check if files exist
if [ -f "$SCRIPT_DIR/package.json" ]; then
  # Copy all files except node_modules
  rsync -av --exclude 'node_modules' --exclude '.git' "$SCRIPT_DIR/" "$INSTALL_DIR/"
  echo -e "${GREEN}✓ Application files copied${NC}"
else
  echo -e "${YELLOW}Note: Please copy your application files to $INSTALL_DIR${NC}"
  echo "Run this script from the project root directory."
fi

# ============================================
# Step 6: Create environment file
# ============================================
echo -e "${BLUE}[6/9] Creating environment configuration...${NC}"

cat > $INSTALL_DIR/.env << EOF
# Database Configuration (MySQL)
DATABASE_URL=$DATABASE_URL
DB_TYPE=mysql
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Application Configuration
NODE_ENV=production
PORT=$APP_PORT
DOMAIN=$DOMAIN

# Authentication (Auto-generated secrets)
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

# SMTP Email Configuration (Update with your email provider settings)
# Common providers: Gmail, SendGrid, Mailgun, Amazon SES, or your own mail server
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
SMTP_FROM_NAME=ThemeVN
SMTP_FROM_EMAIL=noreply@${DOMAIN:-localhost}

# Storage Configuration
UPLOAD_DIR=$INSTALL_DIR/uploads
MAX_FILE_SIZE=10485760

# Generated at: $(date)
EOF

chmod 600 $INSTALL_DIR/.env

echo -e "${GREEN}✓ Environment file created${NC}"

# ============================================
# Step 7: Install dependencies and build
# ============================================
echo -e "${BLUE}[7/9] Installing dependencies and building...${NC}"

cd $INSTALL_DIR

# Install dependencies
npm install --production=false

# Build the application
npm run build

echo -e "${GREEN}✓ Application built${NC}"

# ============================================
# Step 8: Initialize database schema
# ============================================
echo -e "${BLUE}[8/9] Initializing database schema...${NC}"

# Create tables using Drizzle push
cd $INSTALL_DIR
npm run db:push 2>/dev/null || {
  echo -e "${YELLOW}Running db:push with force...${NC}"
  npm run db:push -- --force 2>/dev/null || true
}

echo -e "${GREEN}✓ Database schema initialized${NC}"

# ============================================
# Step 9: Configure Nginx and systemd
# ============================================
echo -e "${BLUE}[9/9] Configuring web server and services...${NC}"

# Create systemd service
cat > /etc/systemd/system/themevn.service << EOF
[Unit]
Description=ThemeVN Marketplace
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node $INSTALL_DIR/dist/index.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=$INSTALL_DIR/.env

[Install]
WantedBy=multi-user.target
EOF

# Create Nginx configuration
if [ -n "$DOMAIN" ]; then
  SERVER_NAME="$DOMAIN www.$DOMAIN"
else
  SERVER_NAME="_"
fi

cat > /etc/nginx/sites-available/themevn << EOF
server {
    listen 80;
    server_name $SERVER_NAME;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location /uploads {
        alias $INSTALL_DIR/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 10M;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/themevn /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null

# Test and reload Nginx
nginx -t && systemctl reload nginx

# Create uploads directory
mkdir -p $INSTALL_DIR/uploads
chown -R www-data:www-data $INSTALL_DIR

# Enable and start service
systemctl daemon-reload
systemctl enable themevn
systemctl start themevn

echo -e "${GREEN}✓ Web server configured${NC}"

# ============================================
# SSL Configuration (if enabled)
# ============================================
if [[ "$ENABLE_SSL" =~ ^[Yy]$ ]] && [ -n "$DOMAIN" ]; then
  echo -e "${BLUE}Configuring SSL...${NC}"
  certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN
  echo -e "${GREEN}✓ SSL configured${NC}"
fi

# ============================================
# Installation Complete
# ============================================
echo ""
echo -e "${GREEN}=================================================="
echo "  Installation Complete!"
echo "==================================================${NC}"
echo ""

# Get public IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

if [ -n "$DOMAIN" ]; then
  APP_URL="http://$DOMAIN"
  if [[ "$ENABLE_SSL" =~ ^[Yy]$ ]]; then
    APP_URL="https://$DOMAIN"
  fi
else
  APP_URL="http://$PUBLIC_IP"
fi

echo -e "Application URL: ${CYAN}$APP_URL${NC}"
echo ""
echo -e "${YELLOW}Database Connection:${NC}"
echo -e "  Host:     $DB_HOST:$DB_PORT"
echo -e "  Database: $DB_NAME"
echo -e "  User:     $DB_USER"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update .env file with your SMTP settings for emails (Gmail, SendGrid, etc.)"
echo "2. Create an admin user via the registration page"
echo "3. Access the admin panel at $APP_URL/admin"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "  systemctl start themevn    - Start the application"
echo "  systemctl stop themevn     - Stop the application"
echo "  systemctl restart themevn  - Restart the application"
echo "  systemctl status themevn   - Check status"
echo "  journalctl -u themevn -f   - View logs"
echo ""
echo -e "${YELLOW}MySQL Commands:${NC}"
echo "  mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME  - Connect to database"
echo ""
echo -e "${PURPLE}Thank you for using ThemeVN!${NC}"
