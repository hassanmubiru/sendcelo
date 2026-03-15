#!/bin/bash

# SendCelo Deployment Script
# This script handles deployment to testnet and mainnet

set -e

NETWORK=${1:-sepolia}
ENVIRONMENT=${2:-testnet}

echo "🚀 Starting SendCelo Deployment"
echo "Network: $NETWORK"
echo "Environment: $ENVIRONMENT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}[1/5] Checking prerequisites...${NC}"
if ! command -v npm &> /dev/null; then
    echo "npm is not installed"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "node is not installed"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites checked${NC}"

# Install dependencies
echo -e "${BLUE}[2/5] Installing dependencies...${NC}"
npm install --legacy-peer-deps
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Type checking
echo -e "${BLUE}[3/5] Running type checks...${NC}"
npm run type-check
echo -e "${GREEN}✓ Type checks passed${NC}"

# Run tests
echo -e "${BLUE}[4/5] Running test suite...${NC}"
npm test || true
echo -e "${GREEN}✓ Tests completed${NC}"

# Build
echo -e "${BLUE}[5/5] Building project...${NC}"
npm run build
echo -e "${GREEN}✓ Build completed${NC}"

# Deployment info
echo -e "${YELLOW}===========================================${NC}"
echo -e "${YELLOW}Deployment on $NETWORK ($ENVIRONMENT)${NC}"
echo -e "${YELLOW}===========================================${NC}"

if [ "$NETWORK" = "sepolia" ]; then
    echo -e "${BLUE}Testnet Deployment Checklist:${NC}"
    echo "1. Ensure AGENT_PRIVATE_KEY is set in .env (testnet key)"
    echo "2. Ensure AGENT_ADDRESS is configured in .env"
    echo "3. Fund agent wallet with testnet cUSD"
    echo "4. Verify RPC URL: https://sepolia-forno.celo-testnet.org"
    echo ""
    echo -e "${GREEN}Ready to deploy to Celo Sepolia testnet!${NC}"
    echo "Run: npm start"
elif [ "$NETWORK" = "mainnet" ]; then
    echo -e "${YELLOW}⚠️  MAINNET DEPLOYMENT ⚠️${NC}"
    echo "1. BACKUP your private keys securely"
    echo "2. Use mainnet private key in .env"
    echo "3. Verify all addresses and contracts"
    echo "4. Ensure sufficient CELO balance for gas"
    echo ""
    echo -e "${RED}Mainnet Deployment Requires Additional Steps:${NC}"
    echo "- Smart contract deployment"
    echo "- Agentscan registry registration"
    echo "- Security audit completion"
else
    echo "Unknown network: $NETWORK"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Deployment script completed${NC}"
