import { MicrofinanceService } from '../../src/services/microfinance';
import Decimal from 'decimal.js';

describe('MicrofinanceService', () => {
  let service: MicrofinanceService;

  beforeEach(() => {
    // Create a fresh instance for each test by clearing the singleton
    const serviceInstance = MicrofinanceService.getInstance();
    // Access private properties through type assertion to clear them
    (serviceInstance as any).loans.clear();
    (serviceInstance as any).ubiPayments.clear();
    service = serviceInstance;
  });

  test('should disburse a loan', async () => {
    const borrowerPhone = '+256701234567';
    const borrowerAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE5';
    const amount = new Decimal(1000);

    const loanId = await service.disburseLoan(borrowerPhone, borrowerAddress, amount, 365, 10);

    expect(loanId).toBeDefined();
    expect(loanId.startsWith('LOAN_')).toBe(true);
  });

  test('should throw on invalid phone', async () => {
    const invalidPhone = '123456';
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE5';

    await expect(service.disburseLoan(invalidPhone, address, 1000)).rejects.toThrow(
      'Invalid borrower phone'
    );
  });

  test('should record loan repayment', async () => {
    const borrowerPhone = '+256701234567';
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE5';

    const loanId = await service.disburseLoan(borrowerPhone, address, 1000, 365, 10);
    service.recordRepayment(loanId, new Decimal(500));

    const loan = service.getLoan(loanId);
    expect(loan?.repaidAmount.equals(new Decimal(500))).toBe(true);
    expect(loan?.status).toBe('active');
  });

  test('should mark loan as paid when fully repaid', async () => {
    const borrowerPhone = '+256701234567';
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE5';

    const loanId = await service.disburseLoan(borrowerPhone, address, 1000, 365, 10);
    service.recordRepayment(loanId, new Decimal(1000));

    const loan = service.getLoan(loanId);
    expect(loan?.status).toBe('paid');
  });

  test('should get loans for borrower', async () => {
    const borrowerPhone = '+256701234567';
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE5';

    await service.disburseLoan(borrowerPhone, address, 1000, 365, 10);
    await service.disburseLoan(borrowerPhone, address, 500, 365, 10);

    const loans = service.getLoansByPhone(borrowerPhone);
    expect(loans.length).toBe(2);
  });

  test('should queue UBI payments', async () => {
    const recipientPhone = '+256701234567';
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE5';

    const paymentId = await service.queueUBIPayment(recipientPhone, address, 50, 'monthly');

    expect(paymentId).toBeDefined();
    expect(paymentId.startsWith('UBI_')).toBe(true);
  });

  test('should calculate portfolio stats', async () => {
    const borrowerPhone = '+256701234567';
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE5';

    const loanId = await service.disburseLoan(borrowerPhone, address, 1000, 365, 10);
    service.recordRepayment(loanId, new Decimal(500));

    const stats = service.getPortfolioStats();
    expect(stats.totalLoaned.equals(new Decimal(1000))).toBe(true);
    expect(stats.totalRepaid.equals(new Decimal(500))).toBe(true);
    expect(stats.activeLoans).toBe(1);
  });
});
