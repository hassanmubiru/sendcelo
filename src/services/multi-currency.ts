import Decimal from 'decimal.js';
import logger from '../utils/logger';
import ExchangeRateService from './exchange-rate';

type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'UGX' | 'KES' | 'NGN' | 'GHS' | 'CELO' | 'cUSD' | 'USDC';

interface CurrencyMetadata {
  code: SupportedCurrency;
  name: string;
  symbol: string;
  region: string;
  decimals: number;
  isStablecoin: boolean;
}

/**
 * Multi-Currency Support Service - Handles multiple currencies and conversions
 */
export class MultiCurrencyService {
  private static instance: MultiCurrencyService;
  private exchangeRateService: ExchangeRateService;
  private supportedCurrencies: Map<SupportedCurrency, CurrencyMetadata> = new Map();

  private constructor() {
    this.exchangeRateService = ExchangeRateService.getInstance();
    this.initializeCurrencies();
  }

  static getInstance(): MultiCurrencyService {
    if (!this.instance) {
      this.instance = new MultiCurrencyService();
    }
    return this.instance;
  }

  /**
   * Initialize supported currencies
   */
  private initializeCurrencies(): void {
    const currencies: CurrencyMetadata[] = [
      // Fiat currencies
      {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        region: 'Global',
        decimals: 2,
        isStablecoin: false,
      },
      {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        region: 'Europe',
        decimals: 2,
        isStablecoin: false,
      },
      {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        region: 'UK',
        decimals: 2,
        isStablecoin: false,
      },
      {
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        region: 'Japan',
        decimals: 0,
        isStablecoin: false,
      },
      // African currencies
      {
        code: 'UGX',
        name: 'Ugandan Shilling',
        symbol: 'Sh',
        region: 'Uganda',
        decimals: 0,
        isStablecoin: false,
      },
      {
        code: 'KES',
        name: 'Kenyan Shilling',
        symbol: 'KSh',
        region: 'Kenya',
        decimals: 2,
        isStablecoin: false,
      },
      {
        code: 'NGN',
        name: 'Nigerian Naira',
        symbol: '₦',
        region: 'Nigeria',
        decimals: 2,
        isStablecoin: false,
      },
      {
        code: 'GHS',
        name: 'Ghanaian Cedi',
        symbol: 'GH₵',
        region: 'Ghana',
        decimals: 2,
        isStablecoin: false,
      },
      // Celo stablecoins
      {
        code: 'cUSD',
        name: 'Celo Dollar',
        symbol: 'cUSD',
        region: 'Celo',
        decimals: 18,
        isStablecoin: true,
      },
      {
        code: 'USDC',
        name: 'USD Coin',
        symbol: 'USDC',
        region: 'Celo',
        decimals: 6,
        isStablecoin: true,
      },
      {
        code: 'CELO',
        name: 'Celo Native',
        symbol: 'CELO',
        region: 'Celo',
        decimals: 18,
        isStablecoin: false,
      },
    ];

    for (const currency of currencies) {
      this.supportedCurrencies.set(currency.code, currency);
    }

    logger.info(
      { count: currencies.length },
      'Multi-currency support initialized'
    );
  }

  /**
   * Get currency metadata
   */
  getCurrencyMetadata(code: SupportedCurrency): CurrencyMetadata | null {
    return this.supportedCurrencies.get(code) || null;
  }

  /**
   * Get all supported currencies
   */
  getSupportedCurrencies(): CurrencyMetadata[] {
    return Array.from(this.supportedCurrencies.values());
  }

  /**
   * Get currencies by region
   */
  getCurrenciesByRegion(region: string): CurrencyMetadata[] {
    return Array.from(this.supportedCurrencies.values()).filter(
      (c) => c.region.toLowerCase() === region.toLowerCase()
    );
  }

  /**
   * Check if currency is supported
   */
  isSupported(code: string): boolean {
    return this.supportedCurrencies.has(code as SupportedCurrency);
  }

  /**
   * Convert amount between currencies
   */
  async convertCurrency(
    amount: Decimal | number | string,
    fromCurrency: SupportedCurrency,
    toCurrency: SupportedCurrency
  ): Promise<Decimal> {
    if (!this.isSupported(fromCurrency) || !this.isSupported(toCurrency)) {
      throw new Error(`Unsupported currency conversion: ${fromCurrency} → ${toCurrency}`);
    }

    const amountDecimal = new Decimal(amount);
    const rate = await this.exchangeRateService.getExchangeRate(fromCurrency, toCurrency);

    return amountDecimal.mul(rate);
  }

  /**
   * Get exchange rate for display
   */
  async getDisplayRate(
    fromCurrency: SupportedCurrency,
    toCurrency: SupportedCurrency
  ): Promise<string> {
    const rate = await this.exchangeRateService.getExchangeRate(fromCurrency, toCurrency);
    const fromMeta = this.getCurrencyMetadata(fromCurrency);
    const toMeta = this.getCurrencyMetadata(toCurrency);

    return `1 ${fromCurrency} = ${rate.toFixed((toMeta?.decimals || 2) + 2)} ${toCurrency}`;
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: Decimal | number | string, currency: SupportedCurrency): string {
    const meta = this.getCurrencyMetadata(currency);
    if (!meta) {
      return amount.toString();
    }

    const amountDecimal = new Decimal(amount);
    const formatted = amountDecimal.toFixed(meta.decimals);

    return `${meta.symbol} ${formatted}`;
  }

  /**
   * Calculate cross-border transfer cost
   */
  async calculateTransferCost(
    amount: Decimal | number | string,
    fromCurrency: SupportedCurrency,
    toCurrency: SupportedCurrency,
    feePercentage: number = 0.5
  ): Promise<{
    gross: Decimal;
    fee: Decimal;
    net: Decimal;
    exchangeRate: Decimal;
  }> {
    const grossAmount = new Decimal(amount);
    const fee = grossAmount.mul(feePercentage).div(100);
    const netAmount = grossAmount.minus(fee);
    const convertedAmount = await this.convertCurrency(netAmount, fromCurrency, toCurrency);
    const exchangeRate = await this.exchangeRateService.getExchangeRate(fromCurrency, toCurrency);

    return {
      gross: grossAmount,
      fee,
      net: convertedAmount,
      exchangeRate,
    };
  }

  /**
   * Get remittance corridors (popular routes)
   */
  getRemittanceCorridors(): Array<{
    source: string;
    destination: string;
    sourceCurrency: SupportedCurrency;
    destinationCurrency: SupportedCurrency;
    volume: string;
  }> {
    return [
      {
        source: 'USA',
        destination: 'Uganda',
        sourceCurrency: 'USD',
        destinationCurrency: 'UGX',
        volume: 'High',
      },
      {
        source: 'UK',
        destination: 'Nigeria',
        sourceCurrency: 'GBP',
        destinationCurrency: 'NGN',
        volume: 'High',
      },
      {
        source: 'Europe',
        destination: 'Kenya',
        sourceCurrency: 'EUR',
        destinationCurrency: 'KES',
        volume: 'Medium',
      },
      {
        source: 'Global',
        destination: 'Ghana',
        sourceCurrency: 'USD',
        destinationCurrency: 'GHS',
        volume: 'Medium',
      },
    ];
  }
}

export default MultiCurrencyService;
