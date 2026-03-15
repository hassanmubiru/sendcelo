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
    logger.info('Getting RemittanceAgent instance...');
    const agent = RemittanceAgent.getInstance();
    
    logger.info('Initializing agent...');
    try {
      await agent.initialize();
      logger.info('Agent initialized successfully!');
    } catch (initError) {
      logger.warn({ error: initError }, 'Agent initialization warning (continuing anyway)');
    }

    logger.info('✓ SendCelo Agent is running');

    // Keep agent running
    process.on('SIGINT', () => {
      logger.info('Shutting down gracefully');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down');
      process.exit(0);
    });

    // Promise that never resolves to keep process alive
    await new Promise(() => {});
  } catch (error) {
    if (error instanceof Error) {
      logger.error({ error: error.message, stack: error.stack }, 'Fatal error');
    } else {
      logger.error({ error: String(error) }, 'Fatal error');
    }
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
