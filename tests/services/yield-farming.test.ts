import { YieldFarmingService } from '../../src/services/yield-farming';
import Decimal from 'decimal.js';

describe('YieldFarmingService', () => {
  let service: YieldFarmingService;

  beforeEach(() => {
    service = YieldFarmingService.getInstance();
    // Clear positions between tests by accessing private property
    (service as any).positions.clear();
    (service as any).totalYieldEarned = new Decimal(0);
  });

  test('should deposit to pool', async () => {
    const amount = new Decimal(1000);
    const poolId = 'moola-cusd-pool';

    const positionId = await service.depositToPool(amount, poolId, 5);

    expect(positionId).toBeDefined();
    const position = service.getPosition(positionId);
    expect(position?.amount.equals(amount)).toBe(true);
  });

  test('should throw on negative amount', async () => {
    const amount = new Decimal(-100);
    const poolId = 'moola-cusd-pool';

    await expect(service.depositToPool(amount, poolId)).rejects.toThrow(
      'Deposit amount must be positive'
    );
  });

  test('should withdraw from pool and calculate yield', async () => {
    const amount = new Decimal(1000);
    const poolId = 'moola-cusd-pool';

    const positionId = await service.depositToPool(amount, poolId, 5);

    // Wait a moment to simulate time passing
    await new Promise((resolve) => setTimeout(resolve, 100));

    const withdrawn = await service.withdrawFromPool(positionId);
    expect(withdrawn.greaterThanOrEqualTo(amount)).toBe(true);
  });

  test('should get all positions', async () => {
    const poolId = 'moola-cusd-pool';

    await service.depositToPool(1000, poolId);
    await service.depositToPool(500, poolId);

    const positions = service.getAllPositions();
    expect(positions.length).toBe(2);
  });

  test('should optimize idle funds', async () => {
    const idleAmount = new Decimal(500);
    const minThreshold = 100;

    const positionId = await service.optimizeIdleFunds(idleAmount, {
      minIdleThreshold: minThreshold,
      targetPoolId: 'moola-cusd-pool',
      maxUtilization: 0.8,
    });

    expect(positionId).toBeDefined();
  });

  test('should skip optimization if below threshold', async () => {
    const idleAmount = new Decimal(50);
    const minThreshold = 100;

    const positionId = await service.optimizeIdleFunds(idleAmount, {
      minIdleThreshold: minThreshold,
      targetPoolId: 'moola-cusd-pool',
      maxUtilization: 0.8,
    });

    expect(positionId).toBe('');
  });
});
