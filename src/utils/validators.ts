/**
 * Validates if a string is a valid Ethereum address (40 hex characters with 0x prefix)
 */
export function isValidAddress(address: string): boolean {
  // Check if address is a valid Ethereum address format: 0x followed by 40 hex characters
  const addressRegex = /^0x[0-9a-fA-F]{40}$/;
  return addressRegex.test(address);
}

/**
 * Validates if a string is a valid phone number (E.164 format)
 * Examples: +256701234567, +1234567890
 * E.164 requires 7-15 total digits (including country code)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const e164Regex = /^\+[1-9]\d{6,14}$/;
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
