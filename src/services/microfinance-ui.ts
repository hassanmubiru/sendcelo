import Decimal from 'decimal.js';
import logger from '../utils/logger';
import MicrofinanceService from './microfinance';

interface MicrofinanceAPICalls {
  viewLoan(loanId: string): Record<string, any> | null;
  viewLoans(phone: string): Record<string, any>[];
  viewPortfolio(): Record<string, any>;
  queryUBIPayments(phone: string): Record<string, any>[];
  calculateMonthlyPayment(loanId: string): Decimal;
  getRepaymentSchedule(loanId: string): Record<string, any>[];
}

/**
 * Microfinance UI Service - Provides API endpoints for microfinance UI
 */
export class MicrofinanceUIService {
  private static instance: MicrofinanceUIService;
  private microfinanceService: MicrofinanceService;

  private constructor() {
    this.microfinanceService = MicrofinanceService.getInstance();
  }

  static getInstance(): MicrofinanceUIService {
    if (!this.instance) {
      this.instance = new MicrofinanceUIService();
    }
    return this.instance;
  }

  /**
   * Get loan details for UI
   */
  viewLoan(loanId: string): Record<string, any> | null {
    const loan = this.microfinanceService.getLoan(loanId);
    if (!loan) {
      return null;
    }

    const interest = this.microfinanceService.calculateInterest(loanId);
    const daysRemaining = Math.max(0, Math.ceil((loan.dueDate - Date.now()) / (24 * 3600 * 1000)));

    return {
      loanId: loan.loanId,
      borrowerPhone: loan.borrowerPhone,
      amount: loan.amount.toString(),
      interestRate: loan.interestRate.toFixed(2),
      status: loan.status,
      disbursedAt: new Date(loan.disbursedAt).toISOString(),
      dueDate: new Date(loan.dueDate).toISOString(),
      repaidAmount: loan.repaidAmount.toString(),
      totalRepayable: loan.amount.plus(interest).toString(),
      accruedInterest: interest.toString(),
      daysRemaining,
      isOverdue: daysRemaining <= 0 && loan.status === 'active',
    };
  }

  /**
   * Get all loans for a borrower
   */
  viewLoans(phone: string): Record<string, any>[] {
    const loans = this.microfinanceService.getLoansByPhone(phone);
    return loans.map((loan) => {
      const interest = this.microfinanceService.calculateInterest(loan.loanId);
      const daysRemaining = Math.max(0, Math.ceil((loan.dueDate - Date.now()) / (24 * 3600 * 1000)));

      return {
        loanId: loan.loanId,
        amount: loan.amount.toString(),
        status: loan.status,
        disbursedAt: new Date(loan.disbursedAt).toISOString(),
        dueDate: new Date(loan.dueDate).toISOString(),
        repaidAmount: loan.repaidAmount.toString(),
        daysRemaining,
        isOverdue: daysRemaining <= 0 && loan.status === 'active',
      };
    });
  }

  /**
   * Get portfolio overview for UI dashboard
   */
  viewPortfolio(): Record<string, any> {
    const stats = this.microfinanceService.getPortfolioStats();

    return {
      totalLoaned: stats.totalLoaned.toString(),
      totalRepaid: stats.totalRepaid.toString(),
      totalOutstanding: stats.totalOutstanding.toString(),
      activeLoans: stats.activeLoans,
      paidLoans: stats.paidLoans,
      defaultedLoans: stats.defaultedLoans,
      repaymentRate:
        stats.totalLoaned.isZero()
          ? '0'
          : stats.totalRepaid.div(stats.totalLoaned).mul(100).toFixed(2),
    };
  }

  /**
   * Query UBI payments for a beneficiary
   */
  queryUBIPayments(phone: string): Record<string, any>[] {
    const payments = (this.microfinanceService as any).ubiPayments;
    const result: Record<string, any>[] = [];

    for (const [paymentId, payment] of payments) {
      if (payment.recipientPhone === phone) {
        result.push({
          paymentId,
          amount: payment.amount.toString(),
          frequency: payment.frequency,
          nextPaymentDate: new Date(payment.paidAt + 30 * 24 * 3600 * 1000).toISOString(),
          status: 'active',
        });
      }
    }

    return result;
  }

  /**
   * Calculate monthly payment for a loan
   */
  calculateMonthlyPayment(loanId: string): Decimal {
    const loan = this.microfinanceService.getLoan(loanId);
    if (!loan) {
      throw new Error(`Loan not found: ${loanId}`);
    }

    const totalDurationDays = (loan.dueDate - loan.disbursedAt) / (24 * 3600 * 1000);
    const months = totalDurationDays / 30;

    const interest = loan.amount.mul(loan.interestRate).div(100);
    const totalAmount = loan.amount.plus(interest);
    const monthlyPayment = totalAmount.div(months);

    return monthlyPayment;
  }

  /**
   * Get repayment schedule for visualization
   */
  getRepaymentSchedule(loanId: string): Record<string, any>[] {
    const loan = this.microfinanceService.getLoan(loanId);
    if (!loan) {
      throw new Error(`Loan not found: ${loanId}`);
    }

    const monthlyPayment = this.calculateMonthlyPayment(loanId);
    const totalDurationDays = (loan.dueDate - loan.disbursedAt) / (24 * 3600 * 1000);
    const months = Math.ceil(totalDurationDays / 30);

    const schedule: Record<string, any>[] = [];
    let remainingBalance = loan.amount;

    for (let i = 1; i <= months; i++) {
      const dueDate = new Date(loan.disbursedAt + i * 30 * 24 * 3600 * 1000);
      const principalPayment = monthlyPayment.mul(0.9); // 90% principal, 10% interest
      const interestPayment = monthlyPayment.mul(0.1);

      remainingBalance = remainingBalance.minus(principalPayment);

      schedule.push({
        month: i,
        dueDate: dueDate.toISOString(),
        payment: monthlyPayment.toFixed(2),
        principal: principalPayment.toFixed(2),
        interest: interestPayment.toFixed(2),
        remainingBalance: remainingBalance.toFixed(2),
      });
    }

    return schedule;
  }

  /**
   * Get dashboard data
   */
  getDashboardData(): Record<string, any> {
    const portfolio = this.viewPortfolio();
    const defaultedLoans = (this.microfinanceService as any).loans;
    const overdue = Array.from(defaultedLoans.values()).filter((loan: any) => {
      const daysRemaining = (loan.dueDate - Date.now()) / (24 * 3600 * 1000);
      return daysRemaining <= 0 && loan.status === 'active';
    });

    return {
      portfolio,
      overdueCount: overdue.length,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export default MicrofinanceUIService;
