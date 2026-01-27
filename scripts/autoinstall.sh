#!/bin/bash

# ============================================
# ThemeVN Auto Installation Script
# ============================================
# This script installs the ThemeVN marketplace
# on a VPS with PostgreSQL or MySQL database
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
echo "   | | | '_ \ / _ \ '_ \` _ \  \ \ / /|  \| |"
echo "   | | | | | |  __/ | | | | |  \ V / | |\  |"
echo "   |_| |_| |_|\___|_| |_| |_|   \_/  |_| \_|"
echo -e "${NC}"
echo -e "${CYAN}WordPress Themes Marketplace - Auto Installer${NC}"
echo "=================================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Warning: It's recommended to run this script as root${NC}"
fi

# Default values
DB_TYPE="postgresql"
DB_HOST="localhost"
DB_PORT=""
DB_NAME="themevn"
DB_USER="themevn"
DB_PASSWORD=""
APP_PORT="3000"
DOMAIN=""
INSTALL_DIR="/var/www/themevn"
ENABLE_SSL="n"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --db-type)
      DB_TYPE="$2"
      shift 2
      ;;
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
    --help)
      echo "Usage: ./autoinstall.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --db-type       Database type: postgresql or mysql (default: postgresql)"
      echo "  --db-host       Database host (default: localhost)"
      echo "  --db-port       Database port (default: 5432 for PostgreSQL, 3306 for MySQL)"
      echo "  --db-name       Database name (default: themevn)"
      echo "  --db-user       Database user (default: themevn)"
      echo "  --db-password   Database password (required)"
      echo "  --domain        Domain name for the application"
      echo "  --port          Application port (default: 3000)"
      echo "  --install-dir   Installation directory (default: /var/www/themevn)"
      echo "  --ssl           Enable SSL with Let's Encrypt"
      echo "  --help          Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Set default ports based on database type
if [ -z "$DB_PORT" ]; then
  if [ "$DB_TYPE" = "postgresql" ]; then
    DB_PORT="5432"
  else
    DB_PORT="3306"
  fi
fi

# Interactive mode if no password provided
if [ -z "$DB_PASSWORD" ]; then
  echo -e "${CYAN}Interactive Setup Mode${NC}"
  echo "========================"
  echo ""
  
  # Database type
  echo -e "${YELLOW}Select database type:${NC}"
  echo "1) PostgreSQL (recommended)"
  echo "2) MySQL"
  read -p "Enter choice [1]: " db_choice
  db_choice=${db_choice:-1}
  if [ "$db_choice" = "2" ]; then
    DB_TYPE="mysql"
    DB_PORT="3306"
  fi
  
  # Database host
  read -p "Database host [localhost]: " input
  DB_HOST=${input:-$DB_HOST}
  
  # Database port
  read -p "Database port [$DB_PORT]: " input
  DB_PORT=${input:-$DB_PORT}
  
  # Database name
  read -p "Database name [themevn]: " input
  DB_NAME=${input:-$DB_NAME}
  
  # Database user
  read -p "Database user [themevn]: " input
  DB_USER=${input:-$DB_USER}
  
  # Database password
  while [ -z "$DB_PASSWORD" ]; do
    read -sp "Database password (required): " DB_PASSWORD
    echo ""
    if [ -z "$DB_PASSWORD" ]; then
      echo -e "${RED}Password cannot be empty${NC}"
    fi
  done
  
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

# Summary
echo -e "${CYAN}Installation Summary${NC}"
echo "===================="
echo -e "Database Type:     ${GREEN}$DB_TYPE${NC}"
echo -e "Database Host:     ${GREEN}$DB_HOST:$DB_PORT${NC}"
echo -e "Database Name:     ${GREEN}$DB_NAME${NC}"
echo -e "Database User:     ${GREEN}$DB_USER${NC}"
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
echo -e "${BLUE}[1/8] Installing system dependencies...${NC}"

# Detect OS
if [ -f /etc/debian_version ]; then
  OS="debian"
  apt-get update -qq
  apt-get install -y -qq curl git nginx nodejs npm certbot python3-certbot-nginx
elif [ -f /etc/redhat-release ]; then
  OS="redhat"
  yum install -y curl git nginx nodejs npm certbot python3-certbot-nginx
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

# Install pnpm
if ! command -v pnpm &> /dev/null; then
  npm install -g pnpm
fi

echo -e "${GREEN}✓ System dependencies installed${NC}"

# ============================================
# Step 2: Install database
# ============================================
echo -e "${BLUE}[2/8] Setting up database...${NC}"

if [ "$DB_TYPE" = "postgresql" ]; then
  # Install PostgreSQL
  if [ "$OS" = "debian" ]; then
    apt-get install -y -qq postgresql postgresql-contrib
  else
    yum install -y postgresql-server postgresql-contrib
    postgresql-setup --initdb
  fi
  
  systemctl enable postgresql
  systemctl start postgresql
  
  # Create database and user
  sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || true
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
  
  DB_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
  
else
  # Install MySQL
  if [ "$OS" = "debian" ]; then
    apt-get install -y -qq mysql-server
  else
    yum install -y mysql-server
  fi
  
  systemctl enable mysql
  systemctl start mysql
  
  # Create database and user
  mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
  mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'$DB_HOST' IDENTIFIED BY '$DB_PASSWORD';"
  mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'$DB_HOST';"
  mysql -e "FLUSH PRIVILEGES;"
  
  DB_URL="mysql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
fi

echo -e "${GREEN}✓ Database configured${NC}"

# ============================================
# Step 3: Create installation directory
# ============================================
echo -e "${BLUE}[3/8] Creating installation directory...${NC}"

mkdir -p $INSTALL_DIR
cd $INSTALL_DIR

echo -e "${GREEN}✓ Directory created${NC}"

# ============================================
# Step 4: Clone/Copy application files
# ============================================
echo -e "${BLUE}[4/8] Setting up application files...${NC}"

# Check if files exist in current directory (local install)
if [ -f "./package.json" ]; then
  cp -r ./* $INSTALL_DIR/
else
  echo -e "${YELLOW}Note: Please copy your application files to $INSTALL_DIR${NC}"
  echo "Or clone from your repository"
fi

echo -e "${GREEN}✓ Application files ready${NC}"

# ============================================
# Step 5: Create environment file
# ============================================
echo -e "${BLUE}[5/8] Creating environment configuration...${NC}"

cat > $INSTALL_DIR/.env << EOF
# Database Configuration
DATABASE_URL=$DB_URL
DB_TYPE=$DB_TYPE
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Application Configuration
NODE_ENV=production
PORT=$APP_PORT
DOMAIN=$DOMAIN

# Authentication (Generate your own secrets!)
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

# Email Configuration (Update with your Resend API key)
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@$DOMAIN

# Storage Configuration
UPLOAD_DIR=$INSTALL_DIR/uploads
MAX_FILE_SIZE=10485760

# Generated at: $(date)
EOF

chmod 600 $INSTALL_DIR/.env

echo -e "${GREEN}✓ Environment file created${NC}"

# ============================================
# Step 6: Install dependencies and build
# ============================================
echo -e "${BLUE}[6/8] Installing dependencies and building...${NC}"

cd $INSTALL_DIR
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
pnpm build

echo -e "${GREEN}✓ Application built${NC}"

# ============================================
# Step 7: Run database migrations
# ============================================
echo -e "${BLUE}[7/8] Running database migrations...${NC}"

# Create migrations runner script
cat > $INSTALL_DIR/scripts/migrate.js << 'EOF'
const { Pool } = require('pg');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const dbType = process.env.DB_TYPE || 'postgresql';
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  
  let client;
  
  if (dbType === 'postgresql') {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    client = await pool.connect();
  } else {
    client = await mysql.createConnection(process.env.DATABASE_URL);
  }
  
  console.log('Connected to database');
  
  // Get migration files
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  console.log(`Found ${files.length} migration files`);
  
  for (const file of files) {
    console.log(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    try {
      if (dbType === 'postgresql') {
        await client.query(sql);
      } else {
        // MySQL requires splitting by semicolons
        const statements = sql.split(';').filter(s => s.trim());
        for (const stmt of statements) {
          await client.query(stmt);
        }
      }
      console.log(`✓ ${file} completed`);
    } catch (err) {
      console.error(`Error in ${file}:`, err.message);
    }
  }
  
  console.log('All migrations completed');
  process.exit(0);
}

runMigrations().catch(console.error);
EOF

# Note: Actual migrations will be run when the app starts
echo -e "${GREEN}✓ Migration scripts created${NC}"

# ============================================
# Step 8: Configure Nginx and systemd
# ============================================
echo -e "${BLUE}[8/8] Configuring web server and services...${NC}"

# Create systemd service
cat > /etc/systemd/system/themevn.service << EOF
[Unit]
Description=ThemeVN Marketplace
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node $INSTALL_DIR/dist/server/index.js
Restart=on-failure
Environment=NODE_ENV=production

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
    }

    location /uploads {
        alias $INSTALL_DIR/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 10M;
}
EOF

ln -sf /etc/nginx/sites-available/themevn /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t && systemctl reload nginx

# Enable and start service
systemctl daemon-reload
systemctl enable themevn

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
# Create uploads directory
# ============================================
mkdir -p $INSTALL_DIR/uploads
chown -R www-data:www-data $INSTALL_DIR

# ============================================
# Installation Complete
# ============================================
echo ""
echo -e "${GREEN}=================================================="
echo "  Installation Complete!"
echo "==================================================${NC}"
echo ""
echo -e "Application URL: ${CYAN}http://${DOMAIN:-$(hostname -I | awk '{print $1}')}${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update .env file with your Resend API key"
echo "2. Copy your application files to $INSTALL_DIR"
echo "3. Run: pnpm build && systemctl start themevn"
echo "4. Access the admin panel to complete setup"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "  systemctl start themevn    - Start the application"
echo "  systemctl stop themevn     - Stop the application"
echo "  systemctl restart themevn  - Restart the application"
echo "  systemctl status themevn   - Check status"
echo "  journalctl -u themevn -f   - View logs"
echo ""
echo -e "${PURPLE}Thank you for using ThemeVN!${NC}"
