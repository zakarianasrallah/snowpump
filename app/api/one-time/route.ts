import { NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/lib/prisma';
import { requireApiSession } from '@/lib/api-auth';
import { getHouseholdId } from '@/lib/household';
import { oneTimeSchema } from '@/lib/validators';

export async function GET() {
  const { session, response } = await requireApiSession();
  if (response) return response;

  const householdId = await getHouseholdId(session.user.id);
  const items = await prisma.oneTimeItem.findMany({
    where: { householdId },
    orderBy: { date: 'desc' },
    include: { category: true }
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { session, response } = await requireApiSession();
  if (response) return response;

  const body = await request.json();
  const parsed = oneTimeSchema.parse(body);
  const householdId = await getHouseholdId(session.user.id);

  const item = await prisma.oneTimeItem.create({
    data: {
      householdId,
      type: parsed.type,
      name: parsed.name,
      categoryId: parsed.categoryId ?? null,
      amount: new Decimal(parsed.amount),
      currency: parsed.currency,
      date: new Date(parsed.date)
    }
  });

  return NextResponse.json(item);
}
