import { ethers } from 'ethers';

/**
 * Validates if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Validates if a string is a valid phone number (E.164 format)
 * Examples: +256701234567, +1234567890
 */
export function isValidPhoneNumber(phone: string): boolean {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

/**
 * Validates if a string is a valid amount (positive decimal)
 */
export function isValidAmount(amount: string | number): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num > 0 && isFinite(num);
}

/**
 * Validates if a string is a valid currency code (ISO 4217)
 */
export function isValidCurrencyCode(code: string): boolean {
  const currencyRegex = /^[A-Z]{3}$/;
  return currencyRegex.test(code);
}

/**
 * Validates transaction parameters
 */
export function validateTransaction(params: {
  recipient: string;
  amount: string;
  stablecoin: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isValidAddress(params.recipient)) {
    errors.push('Invalid recipient address');
  }

  if (!isValidAmount(params.amount)) {
    errors.push('Invalid amount');
  }

  if (!isValidAddress(params.stablecoin)) {
    errors.push('Invalid stablecoin address');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
