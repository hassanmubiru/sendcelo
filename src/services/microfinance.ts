import Decimal from 'decimal.js';
import logger from '../utils/logger';
import { isValidPhoneNumber } from '../utils/validators';

interface Loan {
  loanId: string;
  borrowerPhone: string;
  borrowerAddress: string;
  amount: Decimal;
  interestRate: Decimal;
  disbursedAt: number;
  dueDate: number;
  status: 'active' | 'paid' | 'defaulted';
  repaidAmount: Decimal;
}

interface UBIPayment {
  recipientPhone: string;
  recipientAddress: string;
  amount: Decimal;
  paidAt: number;
  frequency: 'weekly' | 'monthly' | 'quarterly';
}

/**
 * Microfinance Service - Manages loans and UBI distributions
 */
export class MicrofinanceService {
  private static instance: MicrofinanceService;
  private loans: Map<string, Loan> = new Map();
  private ubiPayments: Map<string, UBIPayment> = new Map();
  private defaultInterestRate: Decimal = new Decimal(10); // 10% APR

  private constructor() {}

  static getInstance(): MicrofinanceService {
    if (!this.instance) {
      this.instance = new MicrofinanceService();
    }
    return this.instance;
  }

  /**
   * Disburse a microfinance loan
   */
  async disburseLoan(
    borrowerPhone: string,
    borrowerAddress: string,
    amount: Decimal | number | string,
    durationDays: number = 365,
    interestRate?: Decimal | number | string
  ): Promise<string> {
    if (!isValidPhoneNumber(borrowerPhone)) {
      throw new Error(`Invalid borrower phone: ${borrowerPhone}`);
    }

    const amountDecimal = new Decimal(amount);
    const interestRateDecimal = new Decimal(interestRate || this.defaultInterestRate);
    const loanId = `LOAN_${borrowerPhone}_${Date.now()}`;
    const now = Date.now();
    const dueDate = now + durationDays * 24 * 3600 * 1000;

    const loan: Loan = {
      loanId,
      borrowerPhone,
      borrowerAddress,
      amount: amountDecimal,
      interestRate: interestRateDecimal,
      disbursedAt: now,
      dueDate,
      status: 'active',
      repaidAmount: new Decimal(0),
    };

    this.loans.set(loanId, loan);

    logger.info(
      {
        loanId,
        borrowerPhone,
        amount: amountDecimal.toString(),
        interestRate: interestRateDecimal.toString(),
        durationDays,
      },
      'Loan disbursed'
    );

    return loanId;
  }

  /**
   * Record loan repayment
   */
  recordRepayment(loanId: string, amount: Decimal | number | string): void {
    const loan = this.loans.get(loanId);

    if (!loan) {
      throw new Error(`Loan not found: ${loanId}`);
    }

    const amountDecimal = new Decimal(amount);
    loan.repaidAmount = loan.repaidAmount.plus(amountDecimal);

    if (loan.repaidAmount.greaterThanOrEqualTo(loan.amount)) {
      loan.status = 'paid';
      logger.info({ loanId, totalRepaid: loan.repaidAmount.toString() }, 'Loan fully repaid');
    } else {
      logger.info(
        { loanId, repaidAmount: loan.repaidAmount.toString(), totalAmount: loan.amount.toString() },
        'Partial repayment recorded'
      );
    }
  }

  /**
   * Mark loan as defaulted
   */
  markAsDefaulted(loanId: string): void {
    const loan = this.loans.get(loanId);

    if (!loan) {
      throw new Error(`Loan not found: ${loanId}`);
    }

    loan.status = 'defaulted';
    logger.warn({ loanId }, 'Loan marked as defaulted');
  }

  /**
   * Queue UBI payment
   */
  async queueUBIPayment(
    recipientPhone: string,
    recipientAddress: string,
    amount: Decimal | number | string,
    frequency: 'weekly' | 'monthly' | 'quarterly' = 'monthly'
  ): Promise<string> {
    if (!isValidPhoneNumber(recipientPhone)) {
      throw new Error(`Invalid recipient phone: ${recipientPhone}`);
    }

    const amountDecimal = new Decimal(amount);
    const paymentId = `UBI_${recipientPhone}_${Date.now()}`;

    const payment: UBIPayment = {
      recipientPhone,
      recipientAddress,
      amount: amountDecimal,
      paidAt: Date.now(),
      frequency,
    };

    this.ubiPayments.set(paymentId, payment);

    logger.info(
      { paymentId, recipientPhone, amount: amountDecimal.toString(), frequency },
      'UBI payment queued'
    );

    return paymentId;
  }

  /**
   * Get loan details
   */
  getLoan(loanId: string): Loan | null {
    return this.loans.get(loanId) || null;
  }

  /**
   * Get all active loans
   */
  getActiveLoans(): Loan[] {
    return Array.from(this.loans.values()).filter((loan) => loan.status === 'active');
  }

  /**
   * Get loans for borrower
   */
  getLoansByPhone(phone: string): Loan[] {
    return Array.from(this.loans.values()).filter((loan) => loan.borrowerPhone === phone);
  }

  /**
   * Check for defaulted loans
   */
  checkForDefaults(): Loan[] {
    const now = Date.now();
    const defaulted: Loan[] = [];

    for (const loan of this.loans.values()) {
      if (loan.status === 'active' && now > loan.dueDate) {
        loan.status = 'defaulted';
        defaulted.push(loan);
        logger.warn({ loanId: loan.loanId }, 'Loan automatically marked as defaulted');
      }
    }

    return defaulted;
  }

  /**
   * Calculate interest accrued for a loan
   */
  calculateInterest(loanId: string): Decimal {
    const loan = this.loans.get(loanId);

    if (!loan) {
      throw new Error(`Loan not found: ${loanId}`);
    }

    if (loan.status === 'paid') {
      return new Decimal(0);
    }

    const timeInSeconds = (Date.now() - loan.disbursedAt) / 1000;
    const years = timeInSeconds / (365 * 24 * 3600);
    const interest = loan.amount.mul(loan.interestRate).div(100).mul(years);

    return interest;
  }

  /**
   * Get total loan portfolio
   */
  getPortfolioStats() {
    const loans = Array.from(this.loans.values());
    const totalLoaned = loans.reduce((sum, loan) => sum.plus(loan.amount), new Decimal(0));
    const totalRepaid = loans.reduce((sum, loan) => sum.plus(loan.repaidAmount), new Decimal(0));
    const activeLoans = loans.filter((l) => l.status === 'active').length;
    const defaultedLoans = loans.filter((l) => l.status === 'defaulted').length;

    return {
      totalLoaned,
      totalRepaid,
      totalOutstanding: totalLoaned.minus(totalRepaid),
      activeLoans,
      paidLoans: loans.filter((l) => l.status === 'paid').length,
      defaultedLoans,
    };
  }
}

export default MicrofinanceService;
