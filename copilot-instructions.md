# Celo Remittance Agent - Copilot Configuration

This project is a TypeScript-based AI agent for cross-border remittances and micropayments on the Celo blockchain.

## Project Overview

**Purpose**: Build an autonomous agent that enables instant, low-cost remittances for unbanked users in emerging markets (e.g., Uganda) using Celo's stablecoins (cUSD/USDC).

**Key Features**:
- Phone number-based wallet addressing
- Real-time exchange rate monitoring
- Autonomous payment execution via ERC-8004 wallets and x/402 protocol
- Idle fund yield farming on Moola Market
- Microfinance loan management and disbursement
- Agentscan registry integration for on-chain deployment

**Tech Stack**: TypeScript, Node.js, Celo ContractKit, Ethers.js

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Format code with Prettier before commits
- Document public APIs with JSDoc comments

### Project Structure
```
src/
├── agent/          # Core agent logic and orchestration
├── services/       # Celo integration, DeFi, exchange rates
├── utils/          # Helper functions and utilities
└── index.ts        # Entry point
tests/              # Jest test suite
```

### Celo Integration
- Use @celo/contractkit for blockchain interactions
- All transactions target the configured CELO_NETWORK (default: alfajores testnet)
- Exchange rates queried from external APIs with fallback mechanisms
- All currency values use Decimal.js for precision

### Before Committing
1. Run `npm run lint:fix` to auto-fix linting issues
2. Run `npm run type-check` to verify TypeScript
3. Run `npm test` to ensure tests pass
4. Update `.env.example` if adding new environment variables

## Quick Start

```bash
npm install
cp .env.example .env
# Update .env with your configuration
npm run build
npm run dev
```

## Testing
```bash
npm test              # Run all tests
npm run test:watch   # Run tests in watch mode
```
