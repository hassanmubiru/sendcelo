import logger from '../utils/logger';
import CeloService from '../services/celo-service';
import PaymentRouter from '../services/payment-router';
import ExchangeRateService from '../services/exchange-rate';
import YieldFarmingService from '../services/yield-farming';
import PhoneAddressingService from '../services/phone-addressing';
import MicrofinanceService from '../services/microfinance';
import AgentscanService from '../services/agentscan';
import DeploymentConfigService from '../services/deployment-config';
import MicrofinanceUIService from '../services/microfinance-ui';
import MultiCurrencyService from '../services/multi-currency';
import RegionalOfficeService from '../services/regional-office';
import MobileAppAPIService from '../services/mobile-app-api';

/**
 * Remittance Agent - Main orchestrator for cross-border payments and micropayments
 */
export class RemittanceAgent {
  private static instance: RemittanceAgent;
  private celoService: CeloService;
  private paymentRouter: PaymentRouter;
  private exchangeRateService: ExchangeRateService;
  private yieldFarmingService: YieldFarmingService;
  private phoneAddressingService: PhoneAddressingService;
  private microfinanceService: MicrofinanceService;
  private agentscanService: AgentscanService;
  private isInitialized: boolean = false;

  private constructor() {
    this.celoService = CeloService.getInstance();
    this.paymentRouter = PaymentRouter.getInstance();
    this.exchangeRateService = ExchangeRateService.getInstance();
    this.yieldFarmingService = YieldFarmingService.getInstance();
    this.phoneAddressingService = PhoneAddressingService.getInstance();
    this.microfinanceService = MicrofinanceService.getInstance();
    this.agentscanService = AgentscanService.getInstance();
  }

  static getInstance(): RemittanceAgent {
    if (!this.instance) {
      this.instance = new RemittanceAgent();
    }
    return this.instance;
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    logger.info('🚀 Initializing Celo Remittance Agent');

    try {
      // Initialize wallet
      const privateKey = process.env.AGENT_PRIVATE_KEY;
      if (privateKey) {
        this.celoService.initializeWallet(privateKey);
      }

      // Register on Agentscan
      await this.agentscanService.registerAgent({
        name: 'SendCelo',
        description: 'Autonomous agent for instant, low-cost cross-border remittances and micropayments',
        version: '1.0.0',
        capabilities: [
          'cross-border-remittances',
          'phone-addressing',
          'yield-farming',
          'microfinance-management',
          'real-time-exchange-rates',
        ],
        address: process.env.AGENT_ADDRESS,
      });

      this.isInitialized = true;
      logger.info('✓ Agent initialization complete');
    } catch (error) {
      logger.error({ error }, 'Agent initialization failed');
      throw error;
    }
  }

  /**
   * Register a phone number to address mapping
   */
  async registerPhoneNumber(phone: string, address: string): Promise<void> {
    this.validateInitialized();
    await this.phoneAddressingService.registerPhoneToAddress(phone, address);
  }

  /**
   * Resolve phone number to address
   */
  async resolvePhone(phone: string): Promise<string | null> {
    this.validateInitialized();
    return await this.phoneAddressingService.resolvePhoneToAddress(phone);
  }

  /**
   * Process a remittance
   */
  async processRemittance(request: {
    senderPhone?: string;
    senderAddress?: string;
    recipientPhone?: string;
    recipientAddress?: string;
    amount: string | number;
    sourceCurrency: string;
    metadata?: Record<string, unknown>;
  }): Promise<any> {
    this.validateInitialized();

    const cusdAddress = process.env.cUSD_ADDRESS || '';

    return await this.paymentRouter.processRemittance({
      ...request,
      stablecoinAddress: cusdAddress,
    });
  }

  /**
   * Get exchange rate
   */
  async getExchangeRate(from: string, to: string): Promise<string> {
    this.validateInitialized();
    const rate = await this.exchangeRateService.getExchangeRate(from, to);
    return rate.toString();
  }

  /**
   * Optimize idle funds through yield farming
   */
  async optimizeIdleFunds(
    idleAmount: string | number,
    minThreshold: number = 100
  ): Promise<string | null> {
    this.validateInitialized();

    const positionId = await this.yieldFarmingService.optimizeIdleFunds(
      idleAmount,
      {
        minIdleThreshold: minThreshold,
        targetPoolId: 'moola-cusd-pool',
        maxUtilization: 0.8,
      }
    );

    return positionId || null;
  }

  /**
   * Disburse a microloan
   */
  async disburseMicroloan(
    borrowerPhone: string,
    borrowerAddress: string,
    amount: string | number,
    durationDays: number = 365
  ): Promise<string> {
    this.validateInitialized();

    return await this.microfinanceService.disburseLoan(
      borrowerPhone,
      borrowerAddress,
      amount,
      durationDays
    );
  }

  /**
   * Queue UBI payment
   */
  async queueUBIPayment(
    recipientPhone: string,
    recipientAddress: string,
    amount: string | number,
    frequency: 'weekly' | 'monthly' | 'quarterly' = 'monthly'
  ): Promise<string> {
    this.validateInitialized();

    return await this.microfinanceService.queueUBIPayment(
      recipientPhone,
      recipientAddress,
      amount,
      frequency
    );
  }

  /**
   * Get agent status
   */
  async getStatus(): Promise<any> {
    return {
      initialized: this.isInitialized,
      agentscanStatus: await this.agentscanService.getStatus(),
      walletAddress: this.celoService.getWalletAddress(),
    };
  }

  /**
   * Validate agent is initialized
   */
  private validateInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }
  }
}

export default RemittanceAgent;
