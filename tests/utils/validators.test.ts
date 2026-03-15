import { isValidAddress, isValidPhoneNumber, isValidAmount } from '../../src/utils/validators';

describe('Validators', () => {
  describe('isValidAddress', () => {
    test('should validate correct Ethereum address', () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE5';
      expect(isValidAddress(validAddress)).toBe(true);
    });

    test('should reject invalid address', () => {
      expect(isValidAddress('0x123')).toBe(false);
      expect(isValidAddress('not-an-address')).toBe(false);
    });
  });

  describe('isValidPhoneNumber', () => {
    test('should validate E.164 format phone numbers', () => {
      expect(isValidPhoneNumber('+256701234567')).toBe(true);
      expect(isValidPhoneNumber('+1234567890')).toBe(true);
    });

    test('should reject invalid phone numbers', () => {
      expect(isValidPhoneNumber('0701234567')).toBe(false);
      expect(isValidPhoneNumber('+12345')).toBe(false);
      expect(isValidPhoneNumber('not-a-phone')).toBe(false);
    });
  });

  describe('isValidAmount', () => {
    test('should validate positive amounts', () => {
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount('100.50')).toBe(true);
      expect(isValidAmount(0.01)).toBe(true);
    });

    test('should reject invalid amounts', () => {
      expect(isValidAmount(-100)).toBe(false);
      expect(isValidAmount(0)).toBe(false);
      expect(isValidAmount('not-a-number')).toBe(false);
      expect(isValidAmount(Infinity)).toBe(false);
    });
  });
});
