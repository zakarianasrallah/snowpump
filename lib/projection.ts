import type { RecurringItem, OneTimeItem, OccurrenceOverride, ItemType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { generateRecurringDates } from './recurrence';
import { convertMadToCad } from './fx';

export type ProjectionEntry = {
  date: Date;
  type: ItemType;
  name: string;
  categoryId?: string | null;
  amount: Decimal;
  currency: 'CAD' | 'MAD';
  convertedAmount: Decimal | null;
  paid: boolean;
  graceDays?: number | null;
  recurringId?: string;
  oneTimeId?: string;
};

export async function buildProjection({
  householdId,
  recurring,
  oneTimes,
  overrides,
  from,
  to
}: {
  householdId: string;
  recurring: RecurringItem[];
  oneTimes: OneTimeItem[];
  overrides: OccurrenceOverride[];
  from: Date;
  to: Date;
}) {
  const entries: ProjectionEntry[] = [];

  for (const item of recurring) {
    if (!item.isActive) continue;
    const dates = generateRecurringDates(
      {
        id: item.id,
        startDate: item.startDate,
        endDate: item.endDate,
        frequency: item.frequency
      },
      from,
      to
    );

    for (const date of dates) {
      const override = overrides.find(
        (value) =>
          value.recurringItemId === item.id &&
          value.date.toISOString().slice(0, 10) === date.toISOString().slice(0, 10)
      );
      const amount = override?.editedAmount ?? item.amount;
      const paid = override?.paid ?? false;
      let convertedAmount: Decimal | null = null;
      if (item.currency === 'MAD') {
        const conversion = await convertMadToCad(householdId, amount, date);
        convertedAmount = conversion.converted;
      } else {
        convertedAmount = amount;
      }

      entries.push({
        date,
        type: item.type,
        name: item.name,
        categoryId: item.categoryId,
        amount,
        currency: item.currency,
        convertedAmount,
        paid,
        graceDays: item.graceDays,
        recurringId: item.id
      });
    }
  }

  for (const item of oneTimes) {
    const date = item.date;
    let convertedAmount: Decimal | null = null;
    if (item.currency === 'MAD') {
      const conversion = await convertMadToCad(householdId, item.amount, date);
      convertedAmount = conversion.converted;
    } else {
      convertedAmount = item.amount;
    }
    entries.push({
      date,
      type: item.type,
      name: item.name,
      categoryId: item.categoryId,
      amount: item.amount,
      currency: item.currency,
      convertedAmount,
      paid: false,
      oneTimeId: item.id
    });
  }

  return entries.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function calculateNet(entries: ProjectionEntry[]) {
  let totalIncome = new Decimal(0);
  let totalExpense = new Decimal(0);

  for (const entry of entries) {
    const amount = entry.convertedAmount ?? new Decimal(0);
    if (entry.type === 'INCOME') {
      totalIncome = totalIncome.add(amount);
    } else {
      totalExpense = totalExpense.add(amount);
    }
  }

  return {
    totalIncome,
    totalExpense,
    net: totalIncome.sub(totalExpense)
  };
}

export function calculateCumulative(entries: ProjectionEntry[]) {
  let cumulative = new Decimal(0);
  return entries.map((entry) => {
    const amount = entry.convertedAmount ?? new Decimal(0);
    cumulative = entry.type === 'INCOME' ? cumulative.add(amount) : cumulative.sub(amount);
    return {
      ...entry,
      cumulative
    };
  });
}
