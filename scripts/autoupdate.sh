#!/bin/bash

# ThemeVN Auto Update Script
# Run this script to update and fix the application on your VPS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   ThemeVN Auto Update Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Detect installation directory
if [ -d "/www/wwwroot/vnthemes.store" ]; then
    APP_DIR="/www/wwwroot/vnthemes.store"
elif [ -d "/var/www/themevn" ]; then
    APP_DIR="/var/www/themevn"
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

# Step 1: Check for .env file
echo -e "${BLUE}[1/6] Checking environment configuration...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}No .env file found. Creating template...${NC}"
    cat > .env << 'EOF'
# Database Configuration
DB_TYPE=postgresql
DATABASE_URL=your_database_url_here

# Session Secret (change this!)
SESSION_SECRET=change-this-to-a-random-64-character-string

# Node Environment
NODE_ENV=production

# SMTP (optional)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
EOF
    echo -e "${RED}Please edit .env file with your database credentials${NC}"
    echo -e "${RED}Run: nano $APP_DIR/.env${NC}"
    exit 1
else
    echo -e "${GREEN}Found .env file${NC}"
fi

# Step 2: Fix server/vite.ts for production
echo -e "${BLUE}[2/6] Fixing production server configuration...${NC}"
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

# Step 3: Install dependencies
echo -e "${BLUE}[3/6] Installing dependencies...${NC}"
npm install --legacy-peer-deps
echo -e "${GREEN}Dependencies installed${NC}"

# Step 4: Build the application
echo -e "${BLUE}[4/6] Building application...${NC}"
npm run build
echo -e "${GREEN}Build complete${NC}"

# Step 5: Setup systemd service
echo -e "${BLUE}[5/6] Setting up systemd service...${NC}"

# Load environment variables for service
source .env 2>/dev/null || true

cat > /etc/systemd/system/themevn.service << EOF
[Unit]
Description=ThemeVN CMS
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node dist/index.cjs
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=DATABASE_URL=${DATABASE_URL:-}
Environment=SESSION_SECRET=${SESSION_SECRET:-themevn-secret-key}
Environment=DB_TYPE=${DB_TYPE:-postgresql}
Environment=SMTP_HOST=${SMTP_HOST:-}
Environment=SMTP_PORT=${SMTP_PORT:-}
Environment=SMTP_USER=${SMTP_USER:-}
Environment=SMTP_PASS=${SMTP_PASS:-}

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable themevn
echo -e "${GREEN}Systemd service configured${NC}"

# Step 6: Restart service
echo -e "${BLUE}[6/6] Starting ThemeVN service...${NC}"
systemctl restart themevn
sleep 3

# Check status
if systemctl is-active --quiet themevn; then
    echo -e "${GREEN}ThemeVN is running!${NC}"
else
    echo -e "${RED}Service failed to start. Checking logs...${NC}"
    journalctl -u themevn -n 20 --no-pager
    exit 1
fi

# Test API
echo ""
echo -e "${BLUE}Testing API...${NC}"
sleep 2
RESPONSE=$(curl -s http://localhost:5000/api/install/status 2>/dev/null || echo "failed")
if [[ "$RESPONSE" == *"installed"* ]]; then
    echo -e "${GREEN}API is responding correctly!${NC}"
    echo "Response: $RESPONSE"
else
    echo -e "${YELLOW}API test failed. Checking service logs...${NC}"
    journalctl -u themevn -n 10 --no-pager
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}   Update Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "1. Configure Nginx if not already done"
echo -e "2. Access your site: ${YELLOW}https://your-domain.com/setup${NC}"
echo -e "3. Complete the web installer wizard"
echo ""
echo -e "Useful commands:"
echo -e "  ${YELLOW}systemctl status themevn${NC}  - Check service status"
echo -e "  ${YELLOW}journalctl -u themevn -f${NC}  - View live logs"
echo -e "  ${YELLOW}systemctl restart themevn${NC} - Restart service"
echo ""
