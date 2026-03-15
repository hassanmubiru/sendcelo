import 'dotenv/config';
import logger from './utils/logger';
import RemittanceAgent from './agent';

/**
 * SendCelo - Main application entry point
 * Demonstrates agent initialization and basic operations
 */
async function main() {
  try {
    logger.info('🚀 Starting SendCelo - Cross-border remittance agent');

    // Initialize agent
    const agent = RemittanceAgent.getInstance();
    await agent.initialize();

    // Example: Register phone numbers
    logger.info('Registering phone addresses...');
    await agent.registerPhoneNumber('+256701234567', '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE5');
    await agent.registerPhoneNumber('+256701234568', '0x8ba1f109551bD432803012645Ac136ddd64DBA72');

    // Example: Get exchange rate
    logger.info('Fetching exchange rates...');
    const usdToUgx = await agent.getExchangeRate('USD', 'UGX');
    logger.info({ rate: usdToUgx }, 'USD to UGX exchange rate');

    // Example: Check status
    const status = await agent.getStatus();
    logger.info({ status }, 'Agent status');

    // Example: Optimize idle funds
    // Note: Requires actual funds to be present
    // await agent.optimizeIdleFunds(1000);

    logger.info('✓ Agent ready for operations');

    // Keep agent running
    process.on('SIGINT', () => {
      logger.info('Shutting down gracefully');
      process.exit(0);
    });
  } catch (error) {
    logger.error({ error }, 'Fatal error');
    process.exit(1);
  }
}

// Run if this is the main module
if (require.main === module) {
  main().catch((error) => {
    logger.error({ error }, 'Unhandled error');
    process.exit(1);
  });
}

export { RemittanceAgent };
