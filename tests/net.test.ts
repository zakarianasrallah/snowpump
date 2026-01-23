import { describe, expect, it } from 'vitest';
import { Decimal } from '@prisma/client/runtime/library';
import { calculateCumulative, calculateNet } from '@/lib/projection';

const entries = [
  {
    date: new Date('2024-01-01'),
    type: 'INCOME' as const,
    name: 'Salaire',
    amount: new Decimal(1000),
    currency: 'CAD' as const,
    convertedAmount: new Decimal(1000),
    paid: false
  },
  {
    date: new Date('2024-01-02'),
    type: 'EXPENSE' as const,
    name: 'Loyer',
    amount: new Decimal(400),
    currency: 'CAD' as const,
    convertedAmount: new Decimal(400),
    paid: true
  }
];

describe('net calculations', () => {
  it('calculates net totals', () => {
    const result = calculateNet(entries);
    expect(result.totalIncome.toString()).toBe('1000');
    expect(result.totalExpense.toString()).toBe('400');
    expect(result.net.toString()).toBe('600');
  });

  it('calculates cumulative net', () => {
    const result = calculateCumulative(entries);
    expect(result[0].cumulative.toString()).toBe('1000');
    expect(result[1].cumulative.toString()).toBe('600');
  });
});
