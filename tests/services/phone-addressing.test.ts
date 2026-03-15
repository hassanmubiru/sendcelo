import { PhoneAddressingService } from '../../src/services/phone-addressing';
import Decimal from 'decimal.js';

describe('PhoneAddressingService', () => {
  let service: PhoneAddressingService;

  beforeEach(() => {
    service = PhoneAddressingService.getInstance();
    service.clearAll();
  });

  test('should register phone to address mapping', async () => {
    const phone = '+256701234567';
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE5';

    await service.registerPhoneToAddress(phone, address);

    const resolved = await service.resolvePhoneToAddress(phone);
    expect(resolved).toBe(address);
  });

  test('should throw on invalid phone number', async () => {
    const invalidPhone = '123456';
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE5';

    await expect(service.registerPhoneToAddress(invalidPhone, address)).rejects.toThrow(
      'Invalid phone number'
    );
  });

  test('should resolve address to phone', async () => {
    const phone = '+256701234567';
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE5';

    await service.registerPhoneToAddress(phone, address);
    const resolved = await service.resolveAddressToPhone(address);

    expect(resolved).toBe(phone);
  });

  test('should record payment', async () => {
    const phone = '+256701234567';
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE5';

    await service.registerPhoneToAddress(phone, address);
    service.recordPayment(phone, new Decimal(100));

    const stats = service.getPhoneStats(phone);
    expect(stats?.totalReceived.equals(new Decimal(100))).toBe(true);
  });

  test('should retrieve all mappings', async () => {
    service.clearAll();
    await service.registerPhoneToAddress('+256701234567', '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE5');
    await service.registerPhoneToAddress('+256701234568', '0x8ba1f109551bD432803012645Ac136ddd64DBA72');

    const allNumbers = service.getAllPhoneNumbers();
    expect(allNumbers.length).toBe(2);
  });
});
