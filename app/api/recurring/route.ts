import { NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/lib/prisma';
import { requireApiSession } from '@/lib/api-auth';
import { getHouseholdId } from '@/lib/household';
import { recurringSchema } from '@/lib/validators';

export async function GET() {
  const { session, response } = await requireApiSession();
  if (response) return response;

  const householdId = await getHouseholdId(session.user.id);
  const items = await prisma.recurringItem.findMany({
    where: { householdId },
    orderBy: { startDate: 'asc' },
    include: { category: true }
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const body = await request.json();
  const parsed = recurringSchema.parse(body);
  const householdId = await getHouseholdId(session.user.id);

  const item = await prisma.recurringItem.create({
    data: {
      householdId,
      type: parsed.type,
      name: parsed.name,
      categoryId: parsed.categoryId ?? null,
      amount: new Decimal(parsed.amount),
      currency: parsed.currency,
      frequency: parsed.frequency,
      startDate: new Date(parsed.startDate),
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      graceDays: parsed.graceDays ?? null,
      isActive: parsed.isActive ?? true
    }
  });

  return NextResponse.json(item);
}
