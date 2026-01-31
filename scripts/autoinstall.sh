#!/bin/bash

# ============================================
# ThemeVN Auto Installation Script
# ============================================
# Supports: MySQL (VPS) and PostgreSQL
# Features: Auto database creation, admin setup
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logo
print_logo() {
  echo -e "${PURPLE}"
  echo "  _____ _                    __     ___   _ "
  echo " |_   _| |__   ___ _ __ ___  \ \   / / \ | |"
  echo "   | | | '_ \ / _ \ '\` _ \`  \  \ \ / /|  \| |"
  echo "   | | | | | |  __/ | | | | |  \ V / | |\  |"
  echo "   |_| |_| |_|\___|_| |_| |_|   \_/  |_| \_|"
  echo -e "${NC}"
  echo -e "${CYAN}WordPress Themes Marketplace - Auto Installer v2.0${NC}"
  echo "======================================================"
  echo ""
}

# Error handler
error_exit() {
  echo -e "${RED}ERROR: $1${NC}" >&2
  exit 1
}

# Success message
success_msg() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Warning message
warn_msg() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# Info message
info_msg() {
  echo -e "${BLUE}→ $1${NC}"
}

# Check if command exists
command_exists() {
  command -v "$1" &> /dev/null
}

# Generate random password
generate_password() {
  openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 20
}

# Print logo
print_logo

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  warn_msg "Warning: It's recommended to run this script as root (sudo)"
  read -p "Continue anyway? [y/N]: " continue_anyway
  if [[ ! "$continue_anyway" =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Default values
DB_TYPE="mysql"
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
CREATE_ADMIN="y"
ADMIN_EMAIL=""
ADMIN_PASSWORD=""

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
    --skip-admin)
      CREATE_ADMIN="n"
      shift
      ;;
    --admin-email)
      ADMIN_EMAIL="$2"
      shift 2
      ;;
    --admin-password)
      ADMIN_PASSWORD="$2"
      shift 2
      ;;
    --help)
      echo "Usage: ./autoinstall.sh [OPTIONS]"
      echo ""
      echo "Database Options:"
      echo "  --db-type           Database type: mysql or postgresql (default: mysql)"
      echo "  --db-host           Database host (default: localhost)"
      echo "  --db-port           Database port (default: 3306 for MySQL, 5432 for PostgreSQL)"
      echo "  --db-name           Database name (default: themevn)"
      echo "  --db-user           Database user (default: themevn)"
      echo "  --db-password       Database user password (will prompt if not provided)"
      echo "  --db-root-password  Database root password (for creating database)"
      echo "  --skip-db-create    Skip database creation (use existing database)"
      echo ""
      echo "Application Options:"
      echo "  --domain            Domain name for the application"
      echo "  --port              Application port (default: 5000)"
      echo "  --install-dir       Installation directory (default: /var/www/themevn)"
      echo "  --ssl               Enable SSL with Let's Encrypt"
      echo ""
      echo "Admin Options:"
      echo "  --admin-email       Admin user email"
      echo "  --admin-password    Admin user password"
      echo "  --skip-admin        Skip admin user creation"
      echo ""
      echo "  --help              Show this help message"
      echo ""
      echo "Examples:"
      echo "  # Interactive mode:"
      echo "  sudo ./autoinstall.sh"
      echo ""
      echo "  # Full command line:"
      echo "  sudo ./autoinstall.sh --domain themevn.com --ssl --db-password secret123"
      echo ""
      echo "  # With PostgreSQL:"
      echo "  sudo ./autoinstall.sh --db-type postgresql --db-port 5432"
      exit 0
      ;;
    *)
      error_exit "Unknown option: $1. Use --help for usage."
      ;;
  esac
done

# Set default port based on database type
if [ "$DB_TYPE" = "postgresql" ] && [ "$DB_PORT" = "3306" ]; then
  DB_PORT="5432"
fi

# Interactive mode if no password provided
if [ -z "$DB_PASSWORD" ]; then
  echo -e "${CYAN}=== Interactive Setup Mode ===${NC}"
  echo ""
  
  # Database type
  echo "Select database type:"
  echo "  1) MySQL (recommended for VPS)"
  echo "  2) PostgreSQL"
  read -p "Choice [1]: " db_choice
  case $db_choice in
    2) DB_TYPE="postgresql"; DB_PORT="5432" ;;
    *) DB_TYPE="mysql"; DB_PORT="3306" ;;
  esac
  
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
    if [ "$DB_TYPE" = "mysql" ]; then
      read -sp "MySQL root password (press Enter if no password): " DB_ROOT_PASSWORD
    else
      read -sp "PostgreSQL superuser password: " DB_ROOT_PASSWORD
    fi
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
  
  # Admin user setup
  echo ""
  read -p "Create admin user? [Y/n]: " CREATE_ADMIN
  CREATE_ADMIN=${CREATE_ADMIN:-Y}
  if [[ "$CREATE_ADMIN" =~ ^[Yy]$ ]]; then
    CREATE_ADMIN="y"
    while [ -z "$ADMIN_EMAIL" ]; do
      read -p "Admin email: " ADMIN_EMAIL
      if [ -z "$ADMIN_EMAIL" ]; then
        echo -e "${RED}Email cannot be empty${NC}"
      fi
    done
    while [ -z "$ADMIN_PASSWORD" ]; do
      read -sp "Admin password (min 6 characters): " ADMIN_PASSWORD
      echo ""
      if [ ${#ADMIN_PASSWORD} -lt 6 ]; then
        echo -e "${RED}Password must be at least 6 characters${NC}"
        ADMIN_PASSWORD=""
      fi
    done
  else
    CREATE_ADMIN="n"
  fi
  
  echo ""
fi

# Build DATABASE_URL
if [ "$DB_TYPE" = "mysql" ]; then
  DATABASE_URL="mysql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
else
  DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
fi

# Summary
echo -e "${CYAN}=== Installation Summary ===${NC}"
echo ""
echo -e "Database Type:     ${GREEN}$DB_TYPE${NC}"
echo -e "Database Host:     ${GREEN}$DB_HOST:$DB_PORT${NC}"
echo -e "Database Name:     ${GREEN}$DB_NAME${NC}"
echo -e "Database User:     ${GREEN}$DB_USER${NC}"
echo -e "Create Database:   ${GREEN}$CREATE_DB${NC}"
echo -e "Domain:            ${GREEN}${DOMAIN:-"None (IP access)"}${NC}"
echo -e "SSL Enabled:       ${GREEN}$ENABLE_SSL${NC}"
echo -e "Install Directory: ${GREEN}$INSTALL_DIR${NC}"
echo -e "Create Admin:      ${GREEN}$CREATE_ADMIN${NC}"
if [ "$CREATE_ADMIN" = "y" ]; then
  echo -e "Admin Email:       ${GREEN}$ADMIN_EMAIL${NC}"
fi
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
echo -e "${BLUE}[1/10] Installing system dependencies...${NC}"

# Detect OS
if [ -f /etc/debian_version ]; then
  OS="debian"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get install -y -qq curl git nginx certbot python3-certbot-nginx rsync openssl bc
elif [ -f /etc/redhat-release ]; then
  OS="redhat"
  yum install -y curl git nginx certbot python3-certbot-nginx rsync openssl bc
else
  error_exit "Unsupported OS. Please use Debian/Ubuntu or RHEL/CentOS"
fi

# Install Node.js 20.x if not present or outdated
if ! command_exists node || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 18 ]]; then
  info_msg "Installing Node.js 20.x..."
  if [ "$OS" = "debian" ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y -qq nodejs
  else
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
  fi
fi

# Install npm if not present
if ! command_exists npm; then
  if [ "$OS" = "debian" ]; then
    apt-get install -y -qq npm
  else
    yum install -y npm
  fi
fi

success_msg "System dependencies installed (Node $(node -v), npm $(npm -v))"

# ============================================
# Step 2: Install Database Server
# ============================================
echo -e "${BLUE}[2/10] Installing $DB_TYPE Server...${NC}"

if [ "$DB_TYPE" = "mysql" ]; then
  if [ "$OS" = "debian" ]; then
    if ! command_exists mysql; then
      apt-get install -y -qq mysql-server
    fi
  else
    if ! command_exists mysql; then
      yum install -y mysql-server
    fi
  fi
  
  # Start and enable MySQL
  systemctl enable mysql 2>/dev/null || systemctl enable mysqld 2>/dev/null || true
  systemctl start mysql 2>/dev/null || systemctl start mysqld 2>/dev/null || true
  
  success_msg "MySQL Server installed and running"
else
  # PostgreSQL
  if [ "$OS" = "debian" ]; then
    if ! command_exists psql; then
      apt-get install -y -qq postgresql postgresql-contrib
    fi
  else
    if ! command_exists psql; then
      yum install -y postgresql-server postgresql-contrib
      postgresql-setup --initdb
    fi
  fi
  
  systemctl enable postgresql
  systemctl start postgresql
  
  success_msg "PostgreSQL Server installed and running"
fi

# ============================================
# Step 3: Create database and user
# ============================================
if [[ "$CREATE_DB" =~ ^[Yy]$ ]]; then
  echo -e "${BLUE}[3/10] Creating database and user...${NC}"
  
  if [ "$DB_TYPE" = "mysql" ]; then
    # MySQL database creation
    if [ -n "$DB_ROOT_PASSWORD" ]; then
      MYSQL_CMD="mysql -uroot -p$DB_ROOT_PASSWORD"
    else
      MYSQL_CMD="mysql -uroot"
    fi
    
    # Test MySQL connection
    if ! $MYSQL_CMD -e "SELECT 1" &>/dev/null; then
      # Try with sudo
      MYSQL_CMD="sudo mysql"
      if ! $MYSQL_CMD -e "SELECT 1" &>/dev/null; then
        error_exit "Cannot connect to MySQL. Check root password."
      fi
    fi
    
    # Create database
    $MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null && \
      success_msg "Database '$DB_NAME' created" || warn_msg "Database may already exist"
    
    # Create user and grant privileges
    $MYSQL_CMD -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';" 2>/dev/null || true
    $MYSQL_CMD -e "CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';" 2>/dev/null || true
    $MYSQL_CMD -e "ALTER USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';" 2>/dev/null || true
    $MYSQL_CMD -e "GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';" 2>/dev/null
    $MYSQL_CMD -e "GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'%';" 2>/dev/null || true
    $MYSQL_CMD -e "FLUSH PRIVILEGES;" 2>/dev/null
    
    success_msg "User '$DB_USER' created with privileges"
    
  else
    # PostgreSQL database creation
    if [ -n "$DB_ROOT_PASSWORD" ]; then
      export PGPASSWORD="$DB_ROOT_PASSWORD"
      PSQL_CMD="psql -U postgres -h localhost"
    else
      PSQL_CMD="sudo -u postgres psql"
    fi
    
    # Create user
    $PSQL_CMD -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || \
      $PSQL_CMD -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
    
    # Create database
    $PSQL_CMD -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null && \
      success_msg "Database '$DB_NAME' created" || warn_msg "Database may already exist"
    
    # Grant privileges
    $PSQL_CMD -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null
    
    success_msg "User '$DB_USER' created with privileges"
  fi
else
  echo -e "${BLUE}[3/10] Skipping database creation (using existing)...${NC}"
fi

# ============================================
# Step 4: Test database connection
# ============================================
echo -e "${BLUE}[4/10] Testing database connection...${NC}"

if [ "$DB_TYPE" = "mysql" ]; then
  if mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -P"$DB_PORT" "$DB_NAME" -e "SELECT 1" &>/dev/null; then
    success_msg "Database connection successful"
  else
    error_exit "Cannot connect to database. Check credentials."
  fi
else
  export PGPASSWORD="$DB_PASSWORD"
  if psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "SELECT 1" &>/dev/null; then
    success_msg "Database connection successful"
  else
    error_exit "Cannot connect to database. Check credentials."
  fi
fi

# ============================================
# Step 5: Create installation directory
# ============================================
echo -e "${BLUE}[5/10] Creating installation directory...${NC}"

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

success_msg "Directory created: $INSTALL_DIR"

# ============================================
# Step 6: Copy application files
# ============================================
echo -e "${BLUE}[6/10] Setting up application files...${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

# Check if files exist
if [ -f "$SCRIPT_DIR/package.json" ]; then
  if command_exists rsync; then
    rsync -av --exclude 'node_modules' --exclude '.git' --exclude '.env' "$SCRIPT_DIR/" "$INSTALL_DIR/"
  else
    cp -r "$SCRIPT_DIR"/* "$INSTALL_DIR/" 2>/dev/null || true
    rm -rf "$INSTALL_DIR/node_modules" 2>/dev/null || true
    rm -rf "$INSTALL_DIR/.git" 2>/dev/null || true
  fi
  success_msg "Application files copied"
else
  warn_msg "No source files found. Please copy application files to $INSTALL_DIR manually."
  echo "  Expected location: $SCRIPT_DIR/package.json"
fi

# ============================================
# Step 7: Create environment file
# ============================================
echo -e "${BLUE}[7/10] Creating environment configuration...${NC}"

SESSION_SECRET=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)

cat > "$INSTALL_DIR/.env" << EOF
# ThemeVN Environment Configuration
# Generated: $(date)

# Database Configuration
DATABASE_URL=$DATABASE_URL
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

# Security (Auto-generated)
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET

# SMTP Email Configuration
# Update these with your email provider settings
# Gmail: smtp.gmail.com (use App Password)
# SendGrid: smtp.sendgrid.net
# Mailgun: smtp.mailgun.org
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_NAME=ThemeVN
SMTP_FROM_EMAIL=noreply@${DOMAIN:-localhost}

# Storage Configuration
UPLOAD_DIR=$INSTALL_DIR/uploads
MAX_FILE_SIZE=10485760
EOF

chmod 600 "$INSTALL_DIR/.env"

success_msg "Environment file created"

# ============================================
# Step 8: Install dependencies and build
# ============================================
echo -e "${BLUE}[8/10] Installing dependencies and building...${NC}"

cd "$INSTALL_DIR"

# Install dependencies
info_msg "Installing npm packages..."
npm install --legacy-peer-deps 2>/dev/null || npm install

# Build the application
info_msg "Building application..."
npm run build

success_msg "Application built successfully"

# ============================================
# Step 9: Initialize database schema
# ============================================
echo -e "${BLUE}[9/10] Initializing database schema...${NC}"

cd "$INSTALL_DIR"

# Load environment variables
set -a
source "$INSTALL_DIR/.env"
set +a

# Push database schema
info_msg "Pushing database schema..."
npm run db:push 2>/dev/null || {
  warn_msg "Standard push failed, trying with force..."
  npm run db:push -- --force 2>/dev/null || true
}

# Create admin user if requested
if [[ "$CREATE_ADMIN" =~ ^[Yy]$ ]] && [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  info_msg "Creating admin user..."
  
  # Hash password using Node.js
  HASHED_PASSWORD=$(node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('$ADMIN_PASSWORD', 10));")
  
  if [ "$DB_TYPE" = "mysql" ]; then
    mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" "$DB_NAME" -e "
      INSERT INTO users (email, password, role, full_name, is_active, created_at)
      VALUES ('$ADMIN_EMAIL', '$HASHED_PASSWORD', 'admin', 'Administrator', 1, NOW())
      ON DUPLICATE KEY UPDATE role='admin', password='$HASHED_PASSWORD';
    " 2>/dev/null && success_msg "Admin user created: $ADMIN_EMAIL" || warn_msg "Could not create admin user (may need to create manually)"
  else
    export PGPASSWORD="$DB_PASSWORD"
    psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -c "
      INSERT INTO users (email, password, role, full_name, is_active, created_at)
      VALUES ('$ADMIN_EMAIL', '$HASHED_PASSWORD', 'admin', 'Administrator', true, NOW())
      ON CONFLICT (email) DO UPDATE SET role='admin', password='$HASHED_PASSWORD';
    " 2>/dev/null && success_msg "Admin user created: $ADMIN_EMAIL" || warn_msg "Could not create admin user (may need to create manually)"
  fi
fi

success_msg "Database schema initialized"

# ============================================
# Step 10: Configure Nginx and systemd
# ============================================
echo -e "${BLUE}[10/10] Configuring web server and services...${NC}"

# Create systemd service
cat > /etc/systemd/system/themevn.service << EOF
[Unit]
Description=ThemeVN Marketplace
After=network.target mysql.service postgresql.service
Wants=network-online.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node $INSTALL_DIR/dist/index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=themevn
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

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

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

    location /assets {
        alias $INSTALL_DIR/dist/public/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 50M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/themevn /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Test and reload Nginx
nginx -t && systemctl reload nginx

# Create uploads directory
mkdir -p "$INSTALL_DIR/uploads"
chown -R www-data:www-data "$INSTALL_DIR"
chmod -R 755 "$INSTALL_DIR"

# Enable and start service
systemctl daemon-reload
systemctl enable themevn
systemctl start themevn

success_msg "Web server configured"

# ============================================
# SSL Configuration (if enabled)
# ============================================
if [[ "$ENABLE_SSL" =~ ^[Yy]$ ]] && [ -n "$DOMAIN" ]; then
  echo -e "${BLUE}Configuring SSL...${NC}"
  
  # Wait for service to start
  sleep 3
  
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" --redirect && \
    success_msg "SSL configured" || warn_msg "SSL setup failed. Run manually: certbot --nginx -d $DOMAIN"
fi

# ============================================
# Health Check
# ============================================
echo -e "${BLUE}Running health check...${NC}"

sleep 5

# Check if service is running
if systemctl is-active --quiet themevn; then
  success_msg "ThemeVN service is running"
else
  warn_msg "Service may not be running. Check: journalctl -u themevn -f"
fi

# Check if app responds
if curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$APP_PORT/api/themes" | grep -q "200\|304"; then
  success_msg "API is responding"
else
  warn_msg "API may not be responding yet. Wait a moment and check logs."
fi

# ============================================
# Installation Complete
# ============================================
echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}  Installation Complete!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""

# Get public IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || hostname -I | awk '{print $1}')

if [ -n "$DOMAIN" ]; then
  APP_URL="http://$DOMAIN"
  if [[ "$ENABLE_SSL" =~ ^[Yy]$ ]]; then
    APP_URL="https://$DOMAIN"
  fi
else
  APP_URL="http://$PUBLIC_IP"
fi

echo -e "Application URL:   ${CYAN}$APP_URL${NC}"
echo ""
echo -e "${YELLOW}Database:${NC}"
echo -e "  Type:     $DB_TYPE"
echo -e "  Host:     $DB_HOST:$DB_PORT"
echo -e "  Database: $DB_NAME"
echo -e "  User:     $DB_USER"
echo ""

if [[ "$CREATE_ADMIN" =~ ^[Yy]$ ]] && [ -n "$ADMIN_EMAIL" ]; then
  echo -e "${YELLOW}Admin Account:${NC}"
  echo -e "  Email:    $ADMIN_EMAIL"
  echo -e "  Panel:    $APP_URL/admin"
  echo ""
fi

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update .env with your SMTP settings for email OTP"
echo "2. Access the admin panel at $APP_URL/admin"
echo "3. Configure your themes and settings"
echo ""

echo -e "${YELLOW}Useful Commands:${NC}"
echo "  systemctl status themevn   - Check status"
echo "  systemctl restart themevn  - Restart application"
echo "  journalctl -u themevn -f   - View logs"
echo "  nano $INSTALL_DIR/.env     - Edit configuration"
echo ""

if [ "$DB_TYPE" = "mysql" ]; then
  echo -e "${YELLOW}MySQL Commands:${NC}"
  echo "  mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME"
else
  echo -e "${YELLOW}PostgreSQL Commands:${NC}"
  echo "  psql -U $DB_USER -d $DB_NAME"
fi
echo ""

echo -e "${PURPLE}Thank you for using ThemeVN!${NC}"
echo ""
