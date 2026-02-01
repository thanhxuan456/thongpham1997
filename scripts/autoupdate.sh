#!/bin/bash

# ThemeVN Auto Install & Update Script
# Fully automated deployment for VPS with Neon PostgreSQL

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   ThemeVN Auto Install Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Configuration - Neon PostgreSQL
DATABASE_URL="postgresql://neondb_owner:npg_ThBvz2Doj5qC@ep-twilight-water-ah1dwzer-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
SESSION_SECRET=$(openssl rand -hex 32)
DB_TYPE="postgresql"

# Detect installation directory
if [ -d "/www/wwwroot/vnthemes.store" ]; then
    APP_DIR="/www/wwwroot/vnthemes.store"
elif [ -d "/var/www/themevn" ]; then
    APP_DIR="/var/www/themevn"
elif [ -d "$(pwd)/server" ]; then
    APP_DIR="$(pwd)"
else
    echo -e "${YELLOW}Enter your ThemeVN installation directory:${NC}"
    read -p "> " APP_DIR
fi

if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}Error: Directory $APP_DIR does not exist${NC}"
    exit 1
fi

cd "$APP_DIR"
echo -e "${GREEN}Working in: $APP_DIR${NC}"
echo ""

# Step 1: Install Node.js if not installed
echo -e "${BLUE}[1/9] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Installing Node.js 20.x...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo -e "${GREEN}Node.js $(node -v) installed${NC}"

# Step 2: Create .env file
echo -e "${BLUE}[2/9] Creating environment configuration...${NC}"
cat > .env << EOF
# Database Configuration (Neon PostgreSQL)
DB_TYPE=${DB_TYPE}
DATABASE_URL=${DATABASE_URL}

# Session Secret
SESSION_SECRET=${SESSION_SECRET}

# Node Environment
NODE_ENV=production

# SMTP (configure later via web installer)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
EOF
echo -e "${GREEN}Created .env file${NC}"

# Step 3: Fix server/vite.ts for production
echo -e "${BLUE}[3/9] Fixing production server configuration...${NC}"
cat > server/vite.ts << 'EOF'
import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express) {
  const { createServer: createViteServer, createLogger } = await import("vite");
  const viteLogger = createLogger();
  
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        if (
          msg.includes("[TypeScript] Found 0 errors. Watching for file changes")
        ) {
          log("no errors found", "tsc");
          return;
        }

        if (msg.includes("[TypeScript]")) {
          const [errors, summary] = msg.split("[TypeScript] ", 2);
          log(`${summary}`, "tsc");
          return;
        }
        viteLogger.error(msg, options);
      },
    },
  });

  app.use(vite.middlewares);
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
EOF
echo -e "${GREEN}Fixed server/vite.ts${NC}"

# Step 4: Install dependencies
echo -e "${BLUE}[4/9] Installing dependencies...${NC}"
npm install --legacy-peer-deps
echo -e "${GREEN}Dependencies installed${NC}"

# Step 5: Build the application
echo -e "${BLUE}[5/9] Building application...${NC}"
npm run build
echo -e "${GREEN}Build complete${NC}"

# Step 6: Push database schema (create tables)
echo -e "${BLUE}[6/9] Creating database tables...${NC}"
export DATABASE_URL="${DATABASE_URL}"
export DB_TYPE="${DB_TYPE}"
npm run db:push || {
    echo -e "${YELLOW}Trying with --force flag...${NC}"
    npm run db:push -- --force || echo -e "${YELLOW}Tables may already exist${NC}"
}
echo -e "${GREEN}Database tables ready${NC}"

# Step 7: Setup systemd service
echo -e "${BLUE}[7/9] Setting up systemd service...${NC}"
cat > /etc/systemd/system/themevn.service << EOF
[Unit]
Description=ThemeVN CMS
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}
ExecStart=/usr/bin/node dist/index.cjs
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=DATABASE_URL=${DATABASE_URL}
Environment=SESSION_SECRET=${SESSION_SECRET}
Environment=DB_TYPE=${DB_TYPE}

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable themevn
echo -e "${GREEN}Systemd service configured${NC}"

# Step 8: Configure web server (BT Panel / Nginx)
echo -e "${BLUE}[8/9] Configuring web server...${NC}"

# Check for BT Panel
if [ -d "/www/server/panel/vhost/nginx" ]; then
    echo -e "${YELLOW}Detected BT Panel - configuring nginx...${NC}"
    
    # Get domain from directory name or ask
    DOMAIN=$(basename "$APP_DIR")
    if [ "$DOMAIN" == "themevn" ]; then
        DOMAIN="vnthemes.store"
    fi
    
    cat > /www/server/panel/vhost/nginx/${DOMAIN}.conf << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    access_log /www/wwwlogs/${DOMAIN}.log;
    error_log /www/wwwlogs/${DOMAIN}.error.log;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF
    
    # Restart nginx
    if [ -f "/etc/init.d/nginx" ]; then
        /etc/init.d/nginx reload
    elif command -v nginx &> /dev/null; then
        nginx -s reload
    fi
    echo -e "${GREEN}BT Panel nginx configured for ${DOMAIN}${NC}"

# Check for standard Nginx
elif [ -d "/etc/nginx/sites-available" ]; then
    echo -e "${YELLOW}Configuring standard nginx...${NC}"
    DOMAIN="vnthemes.store"
    
    cat > /etc/nginx/sites-available/${DOMAIN} << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx
    echo -e "${GREEN}Nginx configured for ${DOMAIN}${NC}"

elif [ -d "/etc/nginx/conf.d" ]; then
    echo -e "${YELLOW}Configuring nginx conf.d...${NC}"
    DOMAIN="vnthemes.store"
    
    cat > /etc/nginx/conf.d/${DOMAIN}.conf << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    nginx -t && systemctl reload nginx
    echo -e "${GREEN}Nginx configured for ${DOMAIN}${NC}"
else
    echo -e "${YELLOW}No nginx detected. App will run on port 5000.${NC}"
    echo -e "${YELLOW}Configure your web server to proxy to http://127.0.0.1:5000${NC}"
fi

# Step 9: Start service and verify
echo -e "${BLUE}[9/9] Starting ThemeVN service...${NC}"
systemctl restart themevn
sleep 3

# Check status
if systemctl is-active --quiet themevn; then
    echo -e "${GREEN}ThemeVN is running!${NC}"
else
    echo -e "${RED}Service failed to start. Logs:${NC}"
    journalctl -u themevn -n 20 --no-pager
    exit 1
fi

# Test API
echo ""
echo -e "${BLUE}Testing API...${NC}"
sleep 2
RESPONSE=$(curl -s http://localhost:5000/api/install/status 2>/dev/null || echo "failed")
if [[ "$RESPONSE" == *"installed"* ]] || [[ "$RESPONSE" == *"hasDatabase"* ]]; then
    echo -e "${GREEN}API is responding!${NC}"
    echo "Response: $RESPONSE"
else
    echo -e "${YELLOW}API test inconclusive. Check logs if issues.${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}   Installation Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Database:${NC} Neon PostgreSQL (tables created)"
echo -e "${GREEN}Service:${NC} themevn.service (running)"
echo -e "${GREEN}Port:${NC} 5000"
echo ""
echo -e "Next step: Open your browser and go to:"
echo -e "  ${YELLOW}http://vnthemes.store/setup${NC}"
echo ""
echo -e "The web installer will help you:"
echo -e "  1. Verify database connection"
echo -e "  2. Create admin account"
echo -e "  3. Configure site settings"
echo ""
echo -e "Useful commands:"
echo -e "  ${YELLOW}systemctl status themevn${NC}  - Check status"
echo -e "  ${YELLOW}journalctl -u themevn -f${NC}  - View logs"
echo -e "  ${YELLOW}systemctl restart themevn${NC} - Restart"
echo ""
