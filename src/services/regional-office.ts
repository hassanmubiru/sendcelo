import Decimal from 'decimal.js';
import logger from '../utils/logger';

interface RegionalOffice {
  officeId: string;
  name: string;
  region: string;
  country: string;
  address: string;
  contactEmail: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  agentWallet: string;
  operationalCapital: Decimal;
  transactionVolume: Decimal;
  activeUsers: number;
  createdAt: number;
  updatedAt: number;
}

interface RegionalMetrics {
  officeId: string;
  region: string;
  totalTransactions: number;
  totalVolume: Decimal;
  averageTransactionSize: Decimal;
  activeUsers: number;
  monthlyGrowth: number;
}

/**
 * Regional Office Management Service - Manages distributed regional offices
 */
export class RegionalOfficeService {
  private static instance: RegionalOfficeService;
  private offices: Map<string, RegionalOffice> = new Map();
  private metrics: Map<string, RegionalMetrics> = new Map();
  private officeCounter: number = 0;

  private constructor() {
    this.initializeDefaultOffices();
  }

  static getInstance(): RegionalOfficeService {
    if (!this.instance) {
      this.instance = new RegionalOfficeService();
    }
    return this.instance;
  }

  /**
   * Initialize default regional offices
   */
  private initializeDefaultOffices(): void {
    const defaultOffices: Omit<RegionalOffice, 'officeId' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'SendCelo East Africa Hub',
        region: 'East Africa',
        country: 'Uganda',
        address: 'Plot 123, Kampala, Uganda',
        contactEmail: 'east-africa@sendcelo.io',
        phone: '+256701234567',
        status: 'active',
        agentWallet: '0x0000000000000000000000000000000000000001',
        operationalCapital: new Decimal(50000),
        transactionVolume: new Decimal(0),
        activeUsers: 0,
      },
      {
        name: 'SendCelo West Africa Hub',
        region: 'West Africa',
        country: 'Nigeria',
        address: 'Block A, Lagos, Nigeria',
        contactEmail: 'west-africa@sendcelo.io',
        phone: '+2341234567890',
        status: 'active',
        agentWallet: '0x0000000000000000000000000000000000000002',
        operationalCapital: new Decimal(50000),
        transactionVolume: new Decimal(0),
        activeUsers: 0,
      },
    ];

    for (const office of defaultOffices) {
      this.registerOffice(office);
    }
  }

  /**
   * Register a new regional office
   */
  registerOffice(data: Omit<RegionalOffice, 'officeId' | 'createdAt' | 'updatedAt'>): string {
    const officeId = `REGIONAL_${Date.now()}_${++this.officeCounter}`;
    const now = Date.now();

    const office: RegionalOffice = {
      ...data,
      officeId,
      createdAt: now,
      updatedAt: now,
    };

    this.offices.set(officeId, office);

    // Initialize metrics
    this.metrics.set(officeId, {
      officeId,
      region: data.region,
      totalTransactions: 0,
      totalVolume: new Decimal(0),
      averageTransactionSize: new Decimal(0),
      activeUsers: 0,
      monthlyGrowth: 0,
    });

    logger.info(
      { officeId, region: data.region, country: data.country },
      '✓ Regional office registered'
    );

    return officeId;
  }

  /**
   * Get office details
   */
  getOffice(officeId: string): RegionalOffice | null {
    return this.offices.get(officeId) || null;
  }

  /**
   * Get all offices
   */
  getAllOffices(): RegionalOffice[] {
    return Array.from(this.offices.values());
  }

  /**
   * Get offices by region
   */
  getOfficesByRegion(region: string): RegionalOffice[] {
    return Array.from(this.offices.values()).filter((o) => o.region === region);
  }

  /**
   * Get active offices
   */
  getActiveOffices(): RegionalOffice[] {
    return Array.from(this.offices.values()).filter((o) => o.status === 'active');
  }

  /**
   * Update office status
   */
  updateOfficeStatus(officeId: string, status: 'active' | 'inactive' | 'pending'): void {
    const office = this.offices.get(officeId);
    if (!office) {
      throw new Error(`Office not found: ${officeId}`);
    }

    office.status = status;
    office.updatedAt = Date.now();

    logger.info({ officeId, status }, 'Office status updated');
  }

  /**
   * Update operational capital
   */
  addOperationalCapital(officeId: string, amount: Decimal | number | string): void {
    const office = this.offices.get(officeId);
    if (!office) {
      throw new Error(`Office not found: ${officeId}`);
    }

    const amountDecimal = new Decimal(amount);
    office.operationalCapital = office.operationalCapital.plus(amountDecimal);
    office.updatedAt = Date.now();

    logger.info(
      { officeId, addedCapital: amountDecimal.toString(), totalCapital: office.operationalCapital.toString() },
      'Operational capital added'
    );
  }

  /**
   * Record transaction for office
   */
  recordTransaction(
    officeId: string,
    amount: Decimal | number | string,
    transactionType: 'payment' | 'withdrawal'
  ): void {
    const office = this.offices.get(officeId);
    if (!office) {
      throw new Error(`Office not found: ${officeId}`);
    }

    const amountDecimal = new Decimal(amount);
    const metrics = this.metrics.get(officeId);

    if (!metrics) {
      throw new Error(`Metrics not found for office: ${officeId}`);
    }

    metrics.totalTransactions++;
    metrics.totalVolume = metrics.totalVolume.plus(amountDecimal);
    metrics.averageTransactionSize = metrics.totalVolume.div(metrics.totalTransactions);

    if (transactionType === 'payment') {
      office.transactionVolume = office.transactionVolume.plus(amountDecimal);
    }

    office.updatedAt = Date.now();
  }

  /**
   * Update active users
   */
  updateActiveUsers(officeId: string, count: number): void {
    const office = this.offices.get(officeId);
    if (!office) {
      throw new Error(`Office not found: ${officeId}`);
    }

    office.activeUsers = count;
    office.updatedAt = Date.now();
  }

  /**
   * Get regional metrics
   */
  getMetrics(officeId: string): RegionalMetrics | null {
    return this.metrics.get(officeId) || null;
  }

  /**
   * Get regional performance report
   */
  getPerformanceReport(): Record<string, any> {
    const allOffices = this.getAllOffices();
    const totalCapital = allOffices.reduce((sum, o) => sum.plus(o.operationalCapital), new Decimal(0));
    const totalVolume = allOffices.reduce((sum, o) => sum.plus(o.transactionVolume), new Decimal(0));
    const totalUsers = allOffices.reduce((sum, o) => sum + o.activeUsers, 0);

    const regionPerformance: Record<string, any> = {};
    for (const office of allOffices) {
      if (!regionPerformance[office.region]) {
        regionPerformance[office.region] = {
          officeCount: 0,
          totalCapital: new Decimal(0),
          totalVolume: new Decimal(0),
          totalUsers: 0,
        };
      }

      regionPerformance[office.region].officeCount++;
      regionPerformance[office.region].totalCapital = regionPerformance[office.region].totalCapital.plus(
        office.operationalCapital
      );
      regionPerformance[office.region].totalVolume = regionPerformance[office.region].totalVolume.plus(
        office.transactionVolume
      );
      regionPerformance[office.region].totalUsers += office.activeUsers;
    }

    return {
      totalOffices: allOffices.length,
      activeOffices: this.getActiveOffices().length,
      totalCapital: totalCapital.toString(),
      totalVolume: totalVolume.toString(),
      totalUsers,
      regionPerformance,
    };
  }
}

export default RegionalOfficeService;
