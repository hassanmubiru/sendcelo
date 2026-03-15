# SendCelo - Quick Start Guide

## ✅ Project Status

- **Build**: ✓ Successful
- **Tests**: ✓ 27/27 Passing
- **Type-Check**: ✓ Strict Mode Compliant
- **All Phases**: ✓ Implemented

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables

Edit `.env` file with your Celo testnet wallet:

```bash
# Required: Generate a testnet wallet address
# Visit: https://alfajores-faucet.celo-testnet.org/

AGENT_PRIVATE_KEY=0x{your_private_key_in_hex}
AGENT_ADDRESS=0x{your_wallet_address}
```

**Getting testnet CELO/cUSD:**
1. Generate a wallet private key (or import existing)
2. Visit https://alfajores-faucet.celo-testnet.org/
3. Paste your address to get free testnet funds

### 3. Build the Project
```bash
npm run build
```

### 4. Run Type Checking
```bash
npm run type-check
```

### 5. Run Tests
```bash
npm test
```

### 6. Start the Application
```bash
npm start
```

The application will:
- Initialize all services
- Register with Agentscan
- Set up phone address mappings
- Initialize multi-currency support
- Create regional offices (East/West Africa)
- Display agent status

## 📋 Available Commands

```bash
# Development
npm run dev          # Watch mode compilation
npm run build        # Production build
npm run type-check   # TypeScript strict checking
npm run lint         # Run ESLint
npm start            # Run application

# Testing
npm test             # Run all tests
npm test -- --watch  # Watch mode testing
npm test -- --coverage  # Coverage report

# Deployment (Phase-specific)
bash scripts/deploy.sh alfajores  # Deploy to testnet
bash scripts/deploy.sh mainnet     # Deploy to mainnet (requires AGENT_PRIVATE_KEY)
```

## 🎯 What to Test

### Test 1: Register Phone Number
```bash
# The app will register test phone numbers automatically:
# +256701234567 → 0x742d35Cc6634C0532925a3b844Bc9e7595f42bE5
# +256701234568 → 0x8ba1f109551bD432803012645Ac136ddd64DBA72
```

### Test 2: Get Exchange Rate
```bash
# The app will fetch USD to UGX rate
# Expected: Rate will print in debug output
```

### Test 3: View Agent Status
```bash
# Check agent initialization status
# Shows: All services initialized and ready
```

## 🔐 Security Notes

- **Never commit `.env` with real private keys**
- Use `.env.example` as template for new installations
- For production, use environment management tools (AWS Secrets Manager, HashiCorp Vault, etc.)
- Always test on testnet (Alfajores) first before mainnet

## 📱 Mobile App Integration

To test the mobile app API:

```javascript
const agent = RemittanceAgent.getInstance();

// Get exchange rates
const rate = await agent.getExchangeRate('USD', 'UGX');

// Process remittance
const result = await agent.processRemittance({
  senderPhone: '+256701234567',
  recipientAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
  amount: 100,
  sourceCurrency: 'USD'
});

// Get microfinance info
const loanDetails = await agent.getLoanDetails('LOAN_123');
const borrowerLoans = await agent.getBorrowerLoans('+256701234567');

// Check regional offices
const offices = await agent.getRegionalOffices();
```

## 🌍 Supported Currencies

**Phase 3 - Multi-Currency Support:**

- **Global**: USD, EUR, GBP, JPY
- **African**: UGX (Uganda), KES (Kenya), NGN (Nigeria), GHS (Ghana)
- **Crypto**: CELO, cUSD, USDC

**Transfer Corridors:**
- Uganda ↔ USA / UK / EU
- Nigeria ↔ USA / UK / USA
- Kenya ↔ USA / UK
- International remittances via CELO

## 📊 Regional Offices

Pre-configured offices:

| Office | Region | Country | Status |
|--------|--------|---------|--------|
| OFFICE_1 | East Africa | Uganda | Active |
| OFFICE_2 | West Africa | Nigeria | Active |

View all offices:
```javascript
const offices = await agent.getRegionalOffices();
console.log(offices); // Shows office details, metrics, transactions
```

## 🛑 Troubleshooting

### Issue: "AGENT_PRIVATE_KEY not configured"
**Solution**: Set environment variables in `.env` file

### Issue: "Exchange rate API unreachable"
**Solution**: Check internet connection and API URL in `.env`

### Issue: "Tests failing"
**Solution**: Run `npm install --legacy-peer-deps` to ensure all dependencies are correct

### Issue: "Build fails with TypeScript errors"
**Solution**: Run `npm run type-check` to see all errors, then fix according to error messages

## 📚 Documentation

- [Complete Feature List](README.md) - All features and services
- [Deployment Guide](DEPLOYMENT.md) - Phase 1, 2, 3 deployment steps
- [Completion Report](COMPLETION_REPORT.md) - Project summary and statistics

## 🎓 Learning Resources

- [Celo Docs](https://docs.celo.org/)
- [ContractKit Reference](https://docs.celo.org/developer/contractkit)
- [Moola Market](https://moola.market/) - Earn yield on deposits
- [Agentscan](https://agentscan.io/) - Agent registry

## ✨ Next Steps

1. **Fund Testnet Wallet**: Get cUSD from faucet
2. **Deploy to Alfajores**: Run `bash scripts/deploy.sh alfajores`
3. **Test Remittances**: Try sending test transactions
4. **Monitor Yield Farming**: Check idle fund optimization
5. **Prepare Mainnet**: Follow DEPLOYMENT.md Phase 2 guide

---

**Status**: All 3 development phases complete and ready for deployment. ✅
