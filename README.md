# Celo Remittance Agent

An autonomous AI agent for cross-border remittances and micropayments on the Celo blockchain, enabling instant, low-cost transfers for unbanked users in emerging markets.

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Environment Setup](#environment-setup)
- [Usage](#usage)
- [Testing](#testing)
- [Hackathon Submission](#hackathon-submission)

## Overview

Traditional remittance services charge 5-10% fees and take days to process. This agent leverages Celo's Layer 2 blockchain to enable:

- **Instant transfers** via stablecoins (cUSD/USDC)
- **Sub-cent transaction costs** due to Celo's efficient architecture
- **Phone-number addressing** for accessibility to unbanked populations
- **Real-time exchange rates** through integrated price oracles
- **Autonomous yield farming** for idle fund optimization
- **Microfinance integration** for loan management and UBI disbursement

### Target Users

- Migrant workers sending remittances home
- Emerging market residents receiving cross-border payments
- NGOs managing microfinance programs
- Commerce platforms enabling global payments

## Problem Statement

### Current State
- **Western Union**: 5-10% fees, 2-5 days delivery, requires bank accounts
- **MTN MoMo**: Limited to local markets, expensive for cross-border transfers
- **Traditional banking**: Prohibitive fees for small amounts, slow settlement

### Solution
A Celo-powered agent that:
- Automates payment routing via x/402 protocol
- Eliminates intermediaries with direct blockchain settlement
- Scales to Celo's 700K+ daily active users in Africa
- Provides real-time liquidity management

## Key Features

### 1. **Autonomous Payment System**
- Phone number → blockchain address resolution
- Real-time exchange rate monitoring
- Automatic payment routing
- Transaction batching for cost optimization

### 2. **Yield Farming Integration**
- Idle fund deployment to Moola Market
- Automated deposit/withdrawal based on demand
- Risk management and portfolio rebalancing

### 3. **Microfinance Management**
- Loan disbursement directly to recipient phones
- Automated UBI distribution
- Repayment tracking and collection

### 4. **On-Chain Agent Deployment**
- ERC-8004 wallet standards compliance
- x/402 protocol integration for protocol fees
- Agentscan registry registration
- Agent skill framework compatibility

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Celo testnet RPC access (Alfajores)
- Private key for agent wallet (testnet)

### Installation

```bash
# Clone and setup
git clone <repo>
cd celo-remittance-agent
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration
```

### Configuration

Create a `.env` file with:

```env
# Network
CELO_NETWORK=alfajores
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org

# Agent Wallet (use testnet key only)
AGENT_PRIVATE_KEY=0x...
AGENT_ADDRESS=0x...

# Stablecoin Configuration
cUSD_ADDRESS=0x874069fa1eb16d44d622f2e0ca25eea172369bc1
USDC_ADDRESS=0x2a3684e9dc20b857375ea04235f2f7edbe816c29

# API Keys
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest
CMP_PRICE_API_URL=https://api.coingecko.com/api/v3
```

## Architecture

### System Design

```
┌─────────────────┐
│   Phone User    │
│                 │
└────────┬────────┘
         │ Phone Number Request
         ▼
┌─────────────────────────────────┐
│  Remittance Agent               │
│  ┌─────────────────────────────┐│
│  │ Payment Router              ││
│  │ - Phone → Address Mapping   ││
│  │ - Exchange Rate Sync        ││
│  │ - Auto-routing              ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ DeFi Yield Service          ││
│  │ - Moola Market Integration  ││
│  │ - Yield Optimization        ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ Microfinance Module         ││
│  │ - Loan Management           ││
│  │ - UBI Distribution          ││
│  └─────────────────────────────┘│
└────────┬────────────────────────┘
         │
         ▼
    ┌─────────────┐
    │ Celo Layer 2│
    │ Blockchain  │
    │ (Alfajores) │
    └─────────────┘
```

### Core Modules

- **CeloService**: Blockchain RPC interactions, wallet management
- **PaymentRouter**: Transaction execution, fee optimization
- **ExchangeRateService**: Real-time price data aggregation
- **YieldFarmingService**: Moola Market interactions
- **MicrofinanceService**: Loan and UBI management
- **PhoneAddressing**: Phone-to-address resolution and caching
- **AgentRegistry**: Agentscan integration

## Usage

### Run the Agent

```bash
# Development mode with hot reload
npm run dev

# Production build and start
npm run build
npm start
```

### Example: Process a Remittance

```typescript
const remittance = {
  senderPhone: '+256701234567',       // Uganda number
  recipientPhone: '+256701234568',
  amount: 50,                          // USD
  currency: 'USD',
  targetCurrency: 'UGX',              // Recipient receives in local stablecoin
  metadata: {
    purpose: 'Family support',
    recurring: false
  }
};

await agent.processRemittance(remittance);
```

### Example: Auto-Farm Idle Funds

```typescript
await agentYieldService.optimizeIdleFunds({
  minIdleThreshold: 100,              // USD
  targetPoolId: 'moola-cusd-pool',
  maxUtilization: 0.8
});
```

## Testing

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Run specific test file
npm test -- tests/services/celo.test.ts

# Coverage report
npm test -- --coverage
```

## Project Structure

```
celo-remittance-agent/
├── src/
│   ├── agent/
│   │   ├── index.ts                 # Main agent orchestration
│   │   ├── remittance-processor.ts  # Payment handling
│   │   └── state-manager.ts         # Agent state persistence
│   ├── services/
│   │   ├── celo-service.ts          # Blockchain interactions
│   │   ├── payment-router.ts        # Payment routing logic
│   │   ├── exchange-rate.ts         # Price data aggregation
│   │   ├── yield-farming.ts         # DeFi yield optimization
│   │   ├── microfinance.ts          # Loan management
│   │   ├── phone-addressing.ts      # Phone number resolution
│   │   └── agentscan.ts             # Registry integration
│   ├── utils/
│   │   ├── logger.ts                # Pino logger setup
│   │   ├── validators.ts            # Input validation
│   │   ├── conversions.ts           # Unit conversions
│   │   └── cache.ts                 # Caching utilities
│   └── index.ts                     # Application entry point
├── tests/
│   ├── services/
│   ├── agent/
│   └── utils/
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Development Guide

### Adding a New Service

1. Create a new file in `src/services/your-service.ts`
2. Export a singleton class following the pattern:

```typescript
export class YourService {
  private static instance: YourService;
  
  static getInstance(): YourService {
    if (!this.instance) {
      this.instance = new YourService();
    }
    return this.instance;
  }
}
```

3. Integrate into `src/agent/index.ts`

### Code Standards

- Use TypeScript strict mode
- Document public methods with JSDoc
- Handle errors gracefully with typed exceptions
- Use Pino for structured logging
- Use Decimal.js for financial calculations (avoid floating point)

## Hackathon Submission

### Track: Best Agent

This project demonstrates:

✅ **Real-world utility**: Solves remittance pain for 700K+ Celo users  
✅ **Agent skills framework**: Leverages Celo's native agent infrastructure  
✅ **On-chain deployment**: ERC-8004 wallet + x/402 protocol ready  
✅ **Agentscan integration**: Registry-compatible for discoverability  
✅ **Scalable architecture**: Yield farming + microfinance for revenue sharing  

### Deployment Checklist

- [ ] Agent registered on Agentscan
- [ ] Smart contract deployed to Celo mainnet
- [ ] Documentation complete
- [ ] Test suite passing
- [ ] Performance benchmarks documented

## Roadmap

Phase 1 (MVP): ✅ COMPLETE
- [x] Basic payment routing
- [x] Phone address resolution
- [x] Testnet deployment configuration

Phase 2 (Production): ✅ COMPLETE
- [x] Yield farming optimization
- [x] Microfinance UI API layer
- [x] Mainnet deployment configuration

Phase 3 (Scale): ✅ COMPLETE
- [x] Multi-currency support (12 currencies, African markets)
- [x] Regional office management (East/West Africa hubs)
- [x] Mobile app REST API layer

## Supporting Documents

- [Celo Documentation](https://docs.celo.org)
- [Agentscan Registry](https://agentscan.io)
- [Moola Market Docs](https://moola.market)
- [Hackathon Guide](https://celo.org/hackathon)
- [Deployment Guide](./DEPLOYMENT.md)

## License

MIT

## Support

For questions or issues:
- Create an issue on GitHub
- Join [Celo Discord](https://discord.gg/celo)
- Check [Celo Docs](https://docs.celo.org)
