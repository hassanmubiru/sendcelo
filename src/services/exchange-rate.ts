import axios from 'axios';
import Decimal from 'decimal.js';
import logger from '../utils/logger';

interface ExchangeRateData {
  [key: string]: number;
}

/**
 * Exchange Rate Service - Fetches and caches real-time exchange rates
 */
export class ExchangeRateService {
  private static instance: ExchangeRateService;
  private cache: Map<string, { rate: Decimal; timestamp: number }> = new Map();
  private cacheDuration: number = 60 * 1000; // 1 minute

  private constructor() {}

  static getInstance(): ExchangeRateService {
    if (!this.instance) {
      this.instance = new ExchangeRateService();
    }
    return this.instance;
  }

  /**
   * Get exchange rate from one currency to another
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<Decimal> {
    if (fromCurrency === toCurrency) {
      return new Decimal(1);
    }

    const cacheKey = `${fromCurrency}_${toCurrency}`;
    const cachedRate = this.getCachedRate(cacheKey);

    if (cachedRate) {
      return cachedRate;
    }

    try {
      // Try primary API (exchangerate-api.com)
      const rate = await this.fetchFromExchangeRateAPI(fromCurrency, toCurrency);
      this.cache.set(cacheKey, { rate, timestamp: Date.now() });
      return rate;
    } catch (error) {
      logger.error(
        { error, fromCurrency, toCurrency },
        'Failed to fetch exchange rate from primary API'
      );

      try {
        // Fallback to CoinGecko API for crypto
        const rate = await this.fetchFromCoinGecko(fromCurrency, toCurrency);
        this.cache.set(cacheKey, { rate, timestamp: Date.now() });
        return rate;
      } catch (fallbackError) {
        logger.error({ error: fallbackError }, 'All exchange rate APIs failed');
        throw new Error(
          `Unable to fetch exchange rate for ${fromCurrency} → ${toCurrency}`
        );
      }
    }
  }

  /**
   * Fetch from exchangerate-api.com
   */
  private async fetchFromExchangeRateAPI(
    fromCurrency: string,
    toCurrency: string
  ): Promise<Decimal> {
    const apiUrl = process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4/latest';
    const url = `${apiUrl}/${fromCurrency}`;

    const response = await axios.get(url, { timeout: 5000 });
    const rate = response.data.rates[toCurrency];

    if (!rate) {
      throw new Error(`Rate not found for ${toCurrency}`);
    }

    return new Decimal(rate);
  }

  /**
   * Fetch from CoinGecko API (for crypto)
   */
  private async fetchFromCoinGecko(
    fromCurrency: string,
    toCurrency: string
  ): Promise<Decimal> {
    const apiUrl = process.env.CMP_PRICE_API_URL || 'https://api.coingecko.com/api/v3';

    // Map common currency codes to CoinGecko IDs
    const coinMap: ExchangeRateData = {
      CELO: 'celo',
      CUSD: 'celo-dollar',
      cUSD: 'celo-dollar',
      USDC: 'usd-coin',
      ETH: 'ethereum',
      BTC: 'bitcoin',
    };

    const fromId = coinMap[fromCurrency] || fromCurrency.toLowerCase();
    const toCurrency_ = toCurrency.toLowerCase();

    const url = `${apiUrl}/simple/price?ids=${fromId}&vs_currencies=${toCurrency_}`;

    const response = await axios.get(url, { timeout: 5000 });
    const rate = response.data[fromId]?.[toCurrency_];

    if (!rate) {
      throw new Error(`Rate not found for ${fromCurrency} → ${toCurrency}`);
    }

    return new Decimal(rate);
  }

  /**
   * Get cached rate if still valid
   */
  private getCachedRate(key: string): Decimal | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    const age = Date.now() - cached.timestamp;

    if (age > this.cacheDuration) {
      this.cache.delete(key);
      return null;
    }

    return cached.rate;
  }

  /**
   * Convert amount from one currency to another
   */
  async convertAmount(
    amount: Decimal | number | string,
    fromCurrency: string,
    toCurrency: string
  ): Promise<Decimal> {
    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    const amountDecimal = new Decimal(amount);
    return amountDecimal.mul(rate);
  }

  /**
   * Clear all cached rates
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Exchange rate cache cleared');
  }
}

export default ExchangeRateService;
