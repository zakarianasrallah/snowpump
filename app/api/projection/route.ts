import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiSession } from '@/lib/api-auth';
import { getHouseholdId } from '@/lib/household';
import { buildProjection, calculateCumulative, calculateNet } from '@/lib/projection';

export async function GET(request: Request) {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const householdId = await getHouseholdId(session.user.id);
  const url = new URL(request.url);
  const from = new Date(url.searchParams.get('from') ?? new Date().toISOString());
  const to = new Date(url.searchParams.get('to') ?? new Date().toISOString());

  const [recurring, oneTimes, overrides] = await Promise.all([
    prisma.recurringItem.findMany({ where: { householdId } }),
    prisma.oneTimeItem.findMany({
      where: {
        householdId,
        date: { gte: from, lte: to }
      }
    }),
    prisma.occurrenceOverride.findMany({ where: { householdId } })
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
  const cumulative = calculateCumulative(entries);

  return NextResponse.json({ entries: cumulative, totals });
}
