import { NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/lib/prisma';
import { requireApiSession } from '@/lib/api-auth';
import { getHouseholdId } from '@/lib/household';
import { oneTimeSchema } from '@/lib/validators';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const body = await request.json();
  const parsed = oneTimeSchema.parse(body);
  const householdId = await getHouseholdId(session.user.id);

  await prisma.oneTimeItem.updateMany({
    where: { id: params.id, householdId },
    data: {
      type: parsed.type,
      name: parsed.name,
      categoryId: parsed.categoryId ?? null,
      amount: new Decimal(parsed.amount),
      currency: parsed.currency,
      date: new Date(parsed.date)
    }
  });

  const item = await prisma.oneTimeItem.findFirst({
    where: { id: params.id, householdId }
  });

  return NextResponse.json(item);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const householdId = await getHouseholdId(session.user.id);

  await prisma.oneTimeItem.deleteMany({
    where: { id: params.id, householdId }
  });

  return NextResponse.json({ ok: true });
}
