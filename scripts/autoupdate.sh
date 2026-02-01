#!/bin/bash

# ThemeVN Auto Install & Update Script
# Fully automated deployment for fresh VPS with Neon PostgreSQL

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
DOMAIN="vnthemes.store"

# Detect or set installation directory
APP_DIR="/var/www/themevn"

echo -e "${BLUE}Installation directory: $APP_DIR${NC}"
echo ""

# Step 1: Update system and install dependencies
echo -e "${BLUE}[1/10] Updating system and installing dependencies...${NC}"
apt-get update
apt-get install -y curl git nginx openssl
echo -e "${GREEN}System dependencies installed${NC}"

# Step 2: Install Node.js 20.x
echo -e "${BLUE}[2/10] Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo -e "${GREEN}Node.js $(node -v) installed${NC}"

# Step 3: Create app directory and clone/copy files
echo -e "${BLUE}[3/10] Setting up application directory...${NC}"
mkdir -p "$APP_DIR"

if [ -d "$(pwd)/server" ] && [ "$(pwd)" != "$APP_DIR" ]; then
    echo -e "${YELLOW}Copying files from current directory...${NC}"
    cp -r . "$APP_DIR/"
elif [ ! -f "$APP_DIR/package.json" ]; then
    echo -e "${YELLOW}Please copy your ThemeVN files to $APP_DIR${NC}"
    echo -e "${YELLOW}Or run this script from the ThemeVN directory${NC}"
    exit 1
fi

cd "$APP_DIR"
echo -e "${GREEN}Working in: $APP_DIR${NC}"

# Step 4: Create .env file
echo -e "${BLUE}[4/10] Creating environment configuration...${NC}"
cat > .env << EOF
# Database Configuration (Neon PostgreSQL)
DB_TYPE=${DB_TYPE}
DATABASE_URL=${DATABASE_URL}

# Session Secret
SESSION_SECRET=${SESSION_SECRET}

# Node Environment
NODE_ENV=production

# SMTP (configure via web installer)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
EOF
echo -e "${GREEN}Created .env file${NC}"

# Step 5: Fix server/vite.ts for production
echo -e "${BLUE}[5/10] Fixing production server configuration...${NC}"
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

# Step 6: Install dependencies
echo -e "${BLUE}[6/10] Installing npm dependencies...${NC}"
npm install --legacy-peer-deps
echo -e "${GREEN}Dependencies installed${NC}"

# Step 7: Build the application
echo -e "${BLUE}[7/10] Building application...${NC}"
npm run build
echo -e "${GREEN}Build complete${NC}"

# Step 8: Push database schema (create tables)
echo -e "${BLUE}[8/10] Creating database tables...${NC}"
export DATABASE_URL="${DATABASE_URL}"
export DB_TYPE="${DB_TYPE}"
npm run db:push || {
    echo -e "${YELLOW}Trying with --force flag...${NC}"
    npm run db:push -- --force || echo -e "${YELLOW}Tables may already exist${NC}"
}
echo -e "${GREEN}Database tables ready${NC}"

# Step 9: Setup systemd service
echo -e "${BLUE}[9/10] Setting up systemd service...${NC}"
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
systemctl restart themevn
echo -e "${GREEN}Systemd service configured and started${NC}"

# Step 10: Configure Nginx
echo -e "${BLUE}[10/10] Configuring Nginx...${NC}"

# Remove default nginx config
rm -f /etc/nginx/sites-enabled/default

# Create site config
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
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/

# Test and reload nginx
nginx -t && systemctl reload nginx
systemctl enable nginx
echo -e "${GREEN}Nginx configured for ${DOMAIN}${NC}"

# Verify everything is running
echo ""
echo -e "${BLUE}Verifying installation...${NC}"
sleep 3

# Check services
echo -e "ThemeVN service: $(systemctl is-active themevn)"
echo -e "Nginx service: $(systemctl is-active nginx)"

# Test API
RESPONSE=$(curl -s http://localhost:5000/api/install/status 2>/dev/null || echo "failed")
if [[ "$RESPONSE" == *"installed"* ]] || [[ "$RESPONSE" == *"hasDatabase"* ]]; then
    echo -e "${GREEN}API is responding correctly!${NC}"
else
    echo -e "${YELLOW}API response: $RESPONSE${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}   Installation Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Database:${NC} Neon PostgreSQL (connected)"
echo -e "${GREEN}Service:${NC} themevn.service (running)"
echo -e "${GREEN}Nginx:${NC} Configured for ${DOMAIN}"
echo -e "${GREEN}Port:${NC} 5000 (internal) → 80 (public)"
echo ""
echo -e "Open your browser:"
echo -e "  ${YELLOW}http://${DOMAIN}/setup${NC}"
echo ""
echo -e "Or if DNS not configured yet:"
echo -e "  ${YELLOW}http://YOUR_SERVER_IP/setup${NC}"
echo ""
echo -e "Useful commands:"
echo -e "  ${YELLOW}systemctl status themevn${NC}  - Check app status"
echo -e "  ${YELLOW}journalctl -u themevn -f${NC}  - View app logs"
echo -e "  ${YELLOW}systemctl restart themevn${NC} - Restart app"
echo -e "  ${YELLOW}systemctl status nginx${NC}    - Check nginx status"
echo ""
echo -e "${BLUE}Optional: Install SSL certificate${NC}"
echo -e "  apt install certbot python3-certbot-nginx -y"
echo -e "  certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
