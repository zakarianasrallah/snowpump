import { NextResponse } from 'next/server';
import { startOfMonth, endOfMonth } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { requireApiSession } from '@/lib/api-auth';
import { getHouseholdId } from '@/lib/household';
import { buildProjection, calculateNet } from '@/lib/projection';

export async function GET(request: Request) {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const householdId = await getHouseholdId(session.user.id);
  const url = new URL(request.url);
  const fromParam = url.searchParams.get('from');
  const toParam = url.searchParams.get('to');
  const month = url.searchParams.get('month');
  let from: Date;
  let to: Date;
  if (fromParam && toParam) {
    from = new Date(fromParam);
    to = new Date(toParam);
  } else if (month) {
    const [year, monthIndex] = month.split('-').map(Number);
    from = startOfMonth(new Date(year, monthIndex - 1, 1));
    to = endOfMonth(from);
  } else {
    return NextResponse.json({ error: 'month or from/to required' }, { status: 400 });
  }

  const [recurring, oneTimes, overrides, categories] = await Promise.all([
    prisma.recurringItem.findMany({ where: { householdId } }),
    prisma.oneTimeItem.findMany({
      where: {
        householdId,
        date: { gte: from, lte: to }
      }
    }),
    prisma.occurrenceOverride.findMany({ where: { householdId } }),
    prisma.category.findMany({ where: { householdId } })
  ]);

  const entries = await buildProjection({
    householdId,
    recurring,
    oneTimes,
    overrides,
    from,
    to
  });
  const totals = calculateNet(entries);

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const byCategory: Record<string, { name: string; total: number }> = {};
  const madTotals = entries.filter((entry) => entry.currency === 'MAD');

  for (const entry of entries) {
    if (entry.type !== 'EXPENSE') continue;
    const amount = entry.convertedAmount?.toNumber() ?? 0;
    const key = entry.categoryId ?? 'uncategorized';
    if (!byCategory[key]) {
      byCategory[key] = {
        name: entry.categoryId ? categoryMap.get(entry.categoryId) ?? 'Sans catégorie' : 'Sans catégorie',
        total: 0
      };
    }
    byCategory[key].total += amount;
  }

  return NextResponse.json({
    totals,
    byCategory: Object.values(byCategory),
    mad: {
      original: madTotals.reduce((sum, item) => sum + item.amount.toNumber(), 0),
      converted: madTotals.reduce(
        (sum, item) => sum + (item.convertedAmount?.toNumber() ?? 0),
        0
      )
    }
  });
}
