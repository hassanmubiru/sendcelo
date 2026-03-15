import Decimal from 'decimal.js';
import logger from '../utils/logger';
import RemittanceAgent from '../agent';
import MicrofinanceUIService from './microfinance-ui';
import MultiCurrencyService from './multi-currency';
import RegionalOfficeService from './regional-office';

interface MobileAppRequest {
  requestId: string;
  userId: string;
  endpoint: string;
  timestamp: number;
}

interface MobileAppResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  requestId: string;
  timestamp: number;
}

/**
 * Mobile App API Service - Provides REST API endpoints for mobile integration
 */
export class MobileAppAPIService {
  private static instance: MobileAppAPIService;
  private agent: RemittanceAgent;
  private microfinanceUI: MicrofinanceUIService;
  private multiCurrency: MultiCurrencyService;
  private regionalOffice: RegionalOfficeService;
  private requestLog: Map<string, MobileAppRequest> = new Map();

  private constructor() {
    this.agent = RemittanceAgent.getInstance();
    this.microfinanceUI = MicrofinanceUIService.getInstance();
    this.multiCurrency = MultiCurrencyService.getInstance();
    this.regionalOffice = RegionalOfficeService.getInstance();
  }

  static getInstance(): MobileAppAPIService {
    if (!this.instance) {
      this.instance = new MobileAppAPIService();
    }
    return this.instance;
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<MobileAppResponse<{ status: string; version: string }>> {
    const requestId = `REQ_${Date.now()}`;

    return {
      success: true,
      data: {
        status: 'healthy',
        version: '1.0.0',
      },
      requestId,
      timestamp: Date.now(),
    };
  }

  /**
   * Get exchange rates
   */
  async getExchangeRates(
    from: string,
    to: string,
    requestId: string
  ): Promise<MobileAppResponse<{ rate: string; displayRate: string }>> {
    try {
      const rate = await this.agent.getExchangeRate(from, to);
      const displayRate = await this.multiCurrency.getDisplayRate(
        from as any,
        to as any
      );

      return {
        success: true,
        data: {
          rate,
          displayRate,
        },
        requestId,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        requestId,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Send remittance
   */
  async sendRemittance(
    request: {
      senderPhone: string;
      recipientPhone: string;
      amount: string;
      currency: string;
    },
    requestId: string
  ): Promise<MobileAppResponse<{ transactionHash: string; amount: string; fee: string }>> {
    try {
      const result = await this.agent.processRemittance({
        senderPhone: request.senderPhone,
        recipientPhone: request.recipientPhone,
        amount: request.amount,
        sourceCurrency: request.currency,
      });

      return {
        success: true,
        data: {
          transactionHash: result.transactionHash,
          amount: result.amount.toString(),
          fee: result.fee.toString(),
        },
        requestId,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error({ error }, 'Remittance failed');
      return {
        success: false,
        error: (error as Error).message,
        requestId,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get loan details
   */
  async getLoanDetails(loanId: string, requestId: string): Promise<MobileAppResponse<any>> {
    try {
      const loan = this.microfinanceUI.viewLoan(loanId);

      if (!loan) {
        return {
          success: false,
          error: `Loan not found: ${loanId}`,
          requestId,
          timestamp: Date.now(),
        };
      }

      return {
        success: true,
        data: loan,
        requestId,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        requestId,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get borrower loans
   */
  async getBorrowerLoans(phone: string, requestId: string): Promise<MobileAppResponse<any[]>> {
    try {
      const loans = this.microfinanceUI.viewLoans(phone);

      return {
        success: true,
        data: loans,
        requestId,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        requestId,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get portfolio dashboard
   */
  async getDashboard(requestId: string): Promise<MobileAppResponse<any>> {
    try {
      const dashboard = this.microfinanceUI.getDashboardData();

      return {
        success: true,
        data: dashboard,
        requestId,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        requestId,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get supported currencies
   */
  async getSupportedCurrencies(
    requestId: string
  ): Promise<MobileAppResponse<any[]>> {
    try {
      const currencies = this.multiCurrency.getSupportedCurrencies().map((c) => ({
        code: c.code,
        name: c.name,
        symbol: c.symbol,
        region: c.region,
      }));

      return {
        success: true,
        data: currencies,
        requestId,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        requestId,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get remittance corridors
   */
  async getRemittanceCorridors(
    requestId: string
  ): Promise<MobileAppResponse<any[]>> {
    try {
      const corridors = this.multiCurrency.getRemittanceCorridors();

      return {
        success: true,
        data: corridors,
        requestId,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        requestId,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Estimate transfer cost
   */
  async estimateTransferCost(
    amount: string,
    from: string,
    to: string,
    requestId: string
  ): Promise<MobileAppResponse<any>> {
    try {
      const cost = await this.multiCurrency.calculateTransferCost(
        new Decimal(amount),
        from as any,
        to as any
      );

      return {
        success: true,
        data: {
          gross: cost.gross.toString(),
          fee: cost.fee.toString(),
          net: cost.net.toString(),
          exchangeRate: cost.exchangeRate.toString(),
        },
        requestId,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        requestId,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get regional offices
   */
  async getRegionalOffices(requestId: string): Promise<MobileAppResponse<any[]>> {
    try {
      const offices = this.regionalOffice.getActiveOffices().map((o) => ({
        officeId: o.officeId,
        name: o.name,
        region: o.region,
        country: o.country,
        phone: o.phone,
        contactEmail: o.contactEmail,
      }));

      return {
        success: true,
        data: offices,
        requestId,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        requestId,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get API usage stats
   */
  getAPIStats(): Record<string, any> {
    return {
      totalRequests: this.requestLog.size,
      requestsLastHour: Array.from(this.requestLog.values()).filter(
        (r) => Date.now() - r.timestamp < 3600000
      ).length,
      endpoints: ['health', 'exchange-rates', 'remittance', 'loans', 'currencies', 'corridors', 'offices'],
      version: '1.0.0',
    };
  }

  /**
   * Log API request
   */
  logRequest(userId: string, endpoint: string): string {
    const requestId = `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.requestLog.set(requestId, {
      requestId,
      userId,
      endpoint,
      timestamp: Date.now(),
    });

    return requestId;
  }
}

export default MobileAppAPIService;
