import Decimal from 'decimal.js';
import logger from '../utils/logger';
import { isValidPhoneNumber, isValidAddress } from '../utils/validators';

interface PhoneAddressMapping {
  phone: string;
  address: string;
  createdAt: number;
  totalReceived: Decimal;
}

/**
 * Phone Addressing Service - Maps phone numbers to blockchain addresses
 * In production, this would integrate with Celo's Identities contract
 */
export class PhoneAddressingService {
  private static instance: PhoneAddressingService;
  private mapping: Map<string, PhoneAddressMapping> = new Map();

  private constructor() {}

  static getInstance(): PhoneAddressingService {
    if (!this.instance) {
      this.instance = new PhoneAddressingService();
    }
    return this.instance;
  }

  /**
   * Register a phone number to an address
   * In production, this would call the Celo Identity contract
   */
  async registerPhoneToAddress(phone: string, address: string): Promise<void> {
    if (!isValidPhoneNumber(phone)) {
      throw new Error(`Invalid phone number: ${phone}`);
    }

    if (!isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }

    const existing = this.mapping.get(phone);

    if (existing && existing.address.toLowerCase() !== address.toLowerCase()) {
      logger.warn(
        `Phone number ${phone} already registered to ${existing.address}, updating to ${address}`
      );
    }

    this.mapping.set(phone, {
      phone,
      address,
      createdAt: Date.now(),
      totalReceived: new Decimal(0),
    });

    logger.info(`✓ Registered ${phone} → ${address}`);
  }

  /**
   * Get address for a phone number
   */
  async resolvePhoneToAddress(phone: string): Promise<string | null> {
    if (!isValidPhoneNumber(phone)) {
      throw new Error(`Invalid phone number: ${phone}`);
    }

    const mapping = this.mapping.get(phone);
    return mapping?.address || null;
  }

  /**
   * Get phone number for an address
   */
  async resolveAddressToPhone(address: string): Promise<string | null> {
    if (!isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }

    const lowerAddress = address.toLowerCase();

    for (const [phone, mapping] of this.mapping) {
      if (mapping.address.toLowerCase() === lowerAddress) {
        return phone;
      }
    }

    return null;
  }

  /**
   * Record a successful payment to a phone
   */
  recordPayment(phone: string, amount: Decimal | number | string): void {
    const mapping = this.mapping.get(phone);

    if (!mapping) {
      logger.warn(`Phone ${phone} not found in mapping`);
      return;
    }

    mapping.totalReceived = mapping.totalReceived.plus(new Decimal(amount));
  }

  /**
   * Get phone mapping stats
   */
  getPhoneStats(phone: string): PhoneAddressMapping | null {
    return this.mapping.get(phone) || null;
  }

  /**
   * Get all registered phone numbers
   */
  getAllPhoneNumbers(): string[] {
    return Array.from(this.mapping.keys());
  }

  /**
   * Get all mappings
   */
  getAllMappings(): PhoneAddressMapping[] {
    return Array.from(this.mapping.values());
  }

  /**
   * Clear all mappings (for testing)
   */
  clearAll(): void {
    this.mapping.clear();
    logger.info('Phone address mappings cleared');
  }
}

export default PhoneAddressingService;
