import { describe, expect, it } from 'vitest';
import { generateRecurringDates } from '@/lib/recurrence';

const baseDate = new Date('2024-01-10T00:00:00Z');

describe('recurrence generation', () => {
  it('generates weekly dates', () => {
    const dates = generateRecurringDates(
      { id: '1', startDate: baseDate, frequency: 'WEEKLY' },
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-02-01T00:00:00Z')
    );
    expect(dates).toHaveLength(4);
    expect(dates[0].toISOString().slice(0, 10)).toBe('2024-01-10');
  });

  it('generates biweekly dates', () => {
    const dates = generateRecurringDates(
      { id: '1', startDate: baseDate, frequency: 'BIWEEKLY' },
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-02-20T00:00:00Z')
    );
    expect(dates).toHaveLength(3);
    expect(dates[1].toISOString().slice(0, 10)).toBe('2024-01-24');
  });

  it('generates monthly dates with month-end adjustment', () => {
    const dates = generateRecurringDates(
      { id: '1', startDate: new Date('2024-01-31T00:00:00Z'), frequency: 'MONTHLY' },
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-03-31T00:00:00Z')
    );
    expect(dates.map((date) => date.toISOString().slice(0, 10))).toEqual([
      '2024-01-31',
      '2024-02-29',
      '2024-03-31'
    ]);
  });
});
