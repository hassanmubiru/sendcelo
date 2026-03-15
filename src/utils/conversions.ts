import Decimal from 'decimal.js';

/**
 * Convert from wei/smallest unit to human-readable amount
 * @param amount Amount in smallest unit (wei/satoshi)
 * @param decimals Number of decimal places (default: 18 for ERC20)
 */
export function fromSmallestUnit(
  amount: string | number | Decimal,
  decimals: number = 18
): Decimal {
  const decimal = new Decimal(amount);
  return decimal.div(Decimal.pow(10, decimals));
}

/**
 * Convert from human-readable amount to wei/smallest unit
 * @param amount Human-readable amount
 * @param decimals Number of decimal places (default: 18 for ERC20)
 */
export function toSmallestUnit(
  amount: string | number | Decimal,
  decimals: number = 18
): Decimal {
  const decimal = new Decimal(amount);
  return decimal.mul(Decimal.pow(10, decimals));
}

/**
 * Format amount for display
 */
export function formatAmount(amount: Decimal | number | string, decimals: number = 2): string {
  const decimal = new Decimal(amount);
  return decimal.toFixed(decimals);
}

/**
 * Calculate percentage of amount
 */
export function calculatePercentage(amount: Decimal | number | string, percentage: number): Decimal {
  const decimal = new Decimal(amount);
  return decimal.mul(percentage).div(100);
}

/**
 * Calculate fee based on percentage
 */
export function calculateFee(amount: Decimal | number | string, feePercentage: number): Decimal {
  return calculatePercentage(amount, feePercentage);
}

/**
 * Calculate net amount after fee
 */
export function calculateNetAmount(amount: Decimal | number | string, feePercentage: number): Decimal {
  const decimal = new Decimal(amount);
  const fee = calculateFee(decimal, feePercentage);
  return decimal.minus(fee);
}
