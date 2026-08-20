#!/bin/bash

# PertaSmart Backend - Quick Deployment Script
# Run this script to deploy/update the backend

set -e

echo "╔════════════════════════════════════════╗"
echo "║  PertaSmart Backend Deployment Script  ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="/www/wwwroot/frontend/backend"
PM2_APP_NAME="pertasmart-api"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (sudo)${NC}"
    exit 1
fi

echo -e "${GREEN}1. Checking environment...${NC}"
cd $BACKEND_DIR

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed!${NC}"
    exit 1
fi
echo "   ✓ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed!${NC}"
    exit 1
fi
echo "   ✓ npm version: $(npm --version)"

echo ""
echo -e "${GREEN}2. Installing dependencies...${NC}"
npm install --production

echo ""
echo -e "${GREEN}3. Checking database connection...${NC}"
# Test database connection
if psql -h 10.9.40.17 -p 5432 -U pertasmart_user -d pertasmart_db -c "SELECT 1;" &> /dev/null; then
    echo "   ✓ Database connection successful"
else
    echo -e "${RED}   ✗ Cannot connect to database!${NC}"
    echo -e "${YELLOW}   Make sure WireGuard is running and database is accessible${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}4. Checking PM2 installation...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo "   Installing PM2..."
    npm install -g pm2
fi
echo "   ✓ PM2 installed"

echo ""
echo -e "${GREEN}5. Deploying backend...${NC}"

# Check if app is already running
if pm2 list | grep -q $PM2_APP_NAME; then
    echo "   Restarting existing application..."
    pm2 restart $PM2_APP_NAME
    echo "   ✓ Application restarted"
else
    echo "   Starting new application..."
    pm2 start server.js --name $PM2_APP_NAME
    pm2 save
    echo "   ✓ Application started"
fi

echo ""
echo -e "${GREEN}6. Configuring PM2 startup...${NC}"
pm2 startup systemd -u root --hp /root &> /dev/null || true
echo "   ✓ PM2 startup configured"

echo ""
echo -e "${GREEN}7. Checking NGINX configuration...${NC}"
if nginx -t &> /dev/null; then
    echo "   ✓ NGINX configuration is valid"
    echo "   Reloading NGINX..."
    systemctl reload nginx
    echo "   ✓ NGINX reloaded"
else
    echo -e "${YELLOW}   ⚠ NGINX configuration has errors${NC}"
    echo "   Please check: nginx -t"
fi

echo ""
echo -e "${GREEN}8. Verification...${NC}"

# Wait a bit for the app to start
sleep 3

# Check if port 5000 is listening
if netstat -tlnp | grep -q ":5000"; then
    echo "   ✓ Backend is listening on port 5000"
else
    echo -e "${RED}   ✗ Backend is not listening on port 5000${NC}"
    echo "   Check logs: pm2 logs $PM2_APP_NAME"
fi

# Test health endpoint
if curl -s http://localhost:5000/health | grep -q "success"; then
    echo "   ✓ Health check passed"
else
    echo -e "${YELLOW}   ⚠ Health check failed${NC}"
    echo "   Check logs: pm2 logs $PM2_APP_NAME"
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║         Deployment Complete! 🎉        ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Backend Status:"
pm2 status $PM2_APP_NAME
echo ""
echo "Useful Commands:"
echo "  pm2 logs $PM2_APP_NAME        - View logs"
echo "  pm2 restart $PM2_APP_NAME     - Restart backend"
echo "  pm2 stop $PM2_APP_NAME        - Stop backend"
echo "  pm2 monit                     - Monitor processes"
echo ""
echo "API Endpoints:"
echo "  Health: https://pertasmart.unpad.ac.id/api/health"
echo "  Login:  https://pertasmart.unpad.ac.id/api/auth/login"
echo ""
echo "Accounts:"
echo "  Managed with: node scripts/manage-user.js <email> --role <admin|operator|viewer>"
echo "  Passwords are never printed or stored in this repository."
echo ""
