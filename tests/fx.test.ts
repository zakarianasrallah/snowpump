import { describe, expect, it } from 'vitest';
import { Decimal } from '@prisma/client/runtime/library';
import { applyFxRate, selectRateForDate } from '@/lib/fx';
import type { FxRate } from '@prisma/client';

const mockRate = (effectiveDate: string, rate: string, source: 'API' | 'MANUAL'): FxRate => ({
  id: '1',
  householdId: 'h1',
  fromCurrency: 'MAD',
  toCurrency: 'CAD',
  rate: new Decimal(rate),
  effectiveDate: new Date(effectiveDate),
  source,
  fetchedAt: new Date('2024-01-01T00:00:00Z')
});

describe('fx selection', () => {
  it('selects the nearest effective date before the transaction', () => {
    const rates = [
      mockRate('2024-01-01T00:00:00Z', '0.12', 'API'),
      mockRate('2024-01-15T00:00:00Z', '0.11', 'API')
    ];
    const result = selectRateForDate(rates, new Date('2024-01-20T00:00:00Z'));
    expect(result?.rate.toString()).toBe('0.11');
  });

  it('prioritizes manual rates on the same date', () => {
    const rates = [
      mockRate('2024-01-15T00:00:00Z', '0.11', 'API'),
      mockRate('2024-01-15T00:00:00Z', '0.10', 'MANUAL')
    ];
    const result = selectRateForDate(rates, new Date('2024-01-15T12:00:00Z'));
    expect(result?.source).toBe('MANUAL');
  });
});

describe('fx conversion', () => {
  it('converts MAD to CAD using the rate', () => {
    const amount = new Decimal(100);
    const converted = applyFxRate(amount, new Decimal('0.12'));
    expect(converted.toString()).toBe('12');
  });
});
