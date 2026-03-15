# SendCelo Deployment Guide

## Overview

This guide covers deployment of SendCelo across all three phases:
- **Phase 1 (MVP)**: Testnet deployment
- **Phase 2 (Production)**: Mainnet launch
- **Phase 3 (Scale)**: Multi-regional deployment

## Phase 1: MVP (Testnet Deployment)

### Prerequisites
- Node.js 18+
- npm or yarn
- Celo testnet account with funded wallet
- Private key for agent wallet

### Setup

1. **Configure environment**
```bash
cp .env.example .env
```

2. **Set testnet variables**
```env
CELO_NETWORK=alfajores
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
AGENT_PRIVATE_KEY=0x... (your testnet private key)
AGENT_ADDRESS=0x... (agent wallet address)
cUSD_ADDRESS=0x874069fa1eb16d44d622f2e0ca25eea172369bc1
```

3. **Run deployment**
```bash
bash scripts/deploy.sh alfajores
npm start
```

### Verification

- Agent initialization logs confirm successful deployment
- Test remittance transactions using sample phone numbers
- Verify agent registration on Agentscan

## Phase 2: Production (Mainnet Launch)

### Additional Requirements
- Mainnet Celo account with sufficient CELO balance
- Smart contract deployment (Celo Composer recommended)
- Security audit completion
- Mainnet private key

### Migration Steps

1. **Update environment to mainnet**
```env
CELO_NETWORK=mainnet
CELO_RPC_URL=https://forno.celo.org
```

2. **Deploy smart contracts**
```bash
# Using Celo Composer
celotoolbox deploy:mainnet
```

3. **Register on Agentscan**
- Navigate to agentscan.io
- Register agent with mainnet address
- Complete KYC if required

4. **Launch production**
```bash
bash scripts/deploy.sh mainnet
```

## Phase 3: Scale (Regional Deployment)

### Multi-Regional Setup

Regional offices are pre-configured in the system:

#### East Africa Hub (Uganda)
- Regional capital: $50,000 USD
- Primary currency: UGX (Ugandan Shilling)
- Focus: Uganda, Kenya, Tanzania

#### West Africa Hub (Nigeria)
- Regional capital: $50,000 USD
- Primary currency: NGN (Nigerian Naira)
- Focus: Nigeria, Ghana, Benin

### Adding New Regional Office

```typescript
import { RegionalOfficeService } from './services/regional-office';

const service = RegionalOfficeService.getInstance();

const officeId = service.registerOffice({
  name: 'SendCelo Southern Africa Hub',
  region: 'Southern Africa',
  country: 'South Africa',
  address: '123 Main St, Johannesburg',
  contactEmail: 'southern-africa@sendcelo.io',
  phone: '+27123456789',
  status: 'active',
  agentWallet: '0x...',
  operationalCapital: new Decimal(50000),
  transactionVolume: new Decimal(0),
  activeUsers: 0,
});
```

### Multi-Currency Support

Supported currencies include:
- **Global**: USD, EUR, GBP, JPY
- **African**: UGX, KES, NGN, GHS
- **Crypto**: CELO, cUSD, USDC

### Mobile App Integration

The Mobile App API provides REST endpoints:

```
GET /api/health
GET /api/exchange-rates/{from}/{to}
POST /api/remittance
GET /api/loans/{loanId}
GET /api/loans/borrower/{phone}
GET /api/currencies
GET /api/corridors
GET /api/offices
```

### Performance Targets

**Phase 1 (MVP - 3 months)**
- Basic remittances: ~1,000 transactions/day
- 500+ active users
- $50,000 TVL

**Phase 2 (Production - 6 months)**
- Full platform: ~10,000 transactions/day
- 5,000+ active users
- $500,000 TVL
- Multi-currency support live

**Phase 3 (Scale - 12 months)**
- Regional scaling: ~50,000 transactions/day
- 50,000+ active users
- $5M+ TVL
- Mobile app launches
- Multiple regional offices operational

## Testing Deployments

### Local Testing
```bash
npm run dev
npm test
```

### Testnet Validation
```bash
# Test remittance (requires funded wallet)
curl -X POST http://localhost:3000/api/remittance \
  -H "Content-Type: application/json" \
  -d '{
    "senderPhone": "+256701234567",
    "recipientPhone": "+256701234568",
    "amount": "50",
    "currency": "USD"
  }'
```

## Monitoring & Maintenance

### Health Checks
```bash
curl http://localhost:3000/api/health
```

### Performance Monitoring
- Track transaction throughput
- Monitor gas costs
- Review regional office metrics

### Scaling Considerations
- Database optimization for volume
- Gas optimization strategies
- Rate limiting implementation
- Load balancing across regions

## Troubleshooting

### Testnet Issues
- Verify testnet funds in wallet
- Check RPC endpoint connectivity
- Confirm private key format (0x prefix)

### Mainnet Issues
- Validate smart contract addresses
- Check gas price volatility
- Verify Agentscan registration

## Support

For deployment issues:
- Check [Celo Documentation](https://docs.celo.org)
- Review [Agentscan Guide](https://agentscan.io)
- Join [Celo Discord](https://discord.gg/celo)
