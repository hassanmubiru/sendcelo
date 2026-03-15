import Decimal from 'decimal.js';
import logger from '../utils/logger';
import { validateTransaction } from '../utils/validators';
import { calculateFee, calculateNetAmount } from '../utils/conversions';
import CeloService from './celo-service';
import ExchangeRateService from './exchange-rate';
import PhoneAddressingService from './phone-addressing';

interface PaymentRequest {
  senderPhone?: string;
  senderAddress?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  amount: Decimal | number | string;
  sourceCurrency: string;
  stablecoinAddress: string;
  metadata?: Record<string, unknown>;
}

interface PaymentResult {
  transactionHash: string;
  amount: Decimal;
  fee: Decimal;
  netAmount: Decimal;
  recipientAddress: string;
  timestamp: number;
}

/**
 * Payment Router - Routes payments through Celo network
 */
export class PaymentRouter {
  private static instance: PaymentRouter;
  private celoService: CeloService;
  private exchangeRateService: ExchangeRateService;
  private phoneAddressingService: PhoneAddressingService;
  private feePercentage: number = 0.5; // 0.5% fee

  private constructor() {
    this.celoService = CeloService.getInstance();
    this.exchangeRateService = ExchangeRateService.getInstance();
    this.phoneAddressingService = PhoneAddressingService.getInstance();
  }

  static getInstance(): PaymentRouter {
    if (!this.instance) {
      this.instance = new PaymentRouter();
    }
    return this.instance;
  }

  /**
   * Process a remittance payment
   */
  async processRemittance(request: PaymentRequest): Promise<PaymentResult> {
    logger.info({ request }, 'Processing remittance');

    // Resolve recipient address
    let recipientAddress = request.recipientAddress ?? undefined;
    if (!recipientAddress && request.recipientPhone) {
      recipientAddress = (await this.phoneAddressingService.resolvePhoneToAddress(
        request.recipientPhone
      )) ?? undefined;
      if (!recipientAddress) {
        throw new Error(`No address found for phone ${request.recipientPhone}`);
      }
    }

    if (!recipientAddress) {
      throw new Error('Recipient address or phone required');
    }

    // Validate transaction parameters
    const validation = validateTransaction({
      recipient: recipientAddress,
      amount: request.amount.toString(),
      stablecoin: request.stablecoinAddress,
    });

    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Convert amount to USD if necessary
    let transferAmount = new Decimal(request.amount);
    if (request.sourceCurrency !== 'USD') {
      transferAmount = await this.exchangeRateService.convertAmount(
        request.amount,
        request.sourceCurrency,
        'USD'
      );
    }

    // Calculate fees
    const fee = calculateFee(transferAmount, this.feePercentage);
    const netAmount = calculateNetAmount(transferAmount, this.feePercentage);

    logger.info(
      {
        grossAmount: transferAmount.toString(),
        fee: fee.toString(),
        netAmount: netAmount.toString(),
      },
      'Payment breakdown'
    );

    // Execute transfer
    const txHash = await this.celoService.transferStablecoin(
      recipientAddress,
      netAmount,
      request.stablecoinAddress
    );

    // Record payment in phone addressing service
    if (request.recipientPhone) {
      this.phoneAddressingService.recordPayment(request.recipientPhone, netAmount);
    }

    const result: PaymentResult = {
      transactionHash: txHash,
      amount: transferAmount,
      fee,
      netAmount,
      recipientAddress,
      timestamp: Date.now(),
    };

    logger.info(result, 'Remittance completed successfully');
    return result;
  }

  /**
   * Batch process multiple remittances
   */
  async processBatch(requests: PaymentRequest[]): Promise<PaymentResult[]> {
    logger.info({ count: requests.length }, 'Processing batch remittances');

    const results: PaymentResult[] = [];

    for (const request of requests) {
      try {
        const result = await this.processRemittance(request);
        results.push(result);
      } catch (error) {
        logger.error({ error, request }, 'Batch item failed');
      }
    }

    logger.info({ succeeded: results.length, total: requests.length }, 'Batch processing complete');
    return results;
  }

  /**
   * Set fee percentage (for governance)
   */
  setFeePercentage(percentage: number): void {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Fee percentage must be between 0 and 100');
    }
    this.feePercentage = percentage;
    logger.info({ feePercentage: percentage }, 'Fee percentage updated');
  }

  /**
   * Get current fee percentage
   */
  getFeePercentage(): number {
    return this.feePercentage;
  }
}

export default PaymentRouter;
