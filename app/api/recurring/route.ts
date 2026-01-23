import { NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
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

export async function PUT(request: Request) {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const body = await request.json();
  const parsed = recurringSchema.extend({ id: z.string().min(1) }).parse(body);
  const householdId = await getHouseholdId(session.user.id);

  await prisma.recurringItem.updateMany({
    where: { id: parsed.id, householdId },
    data: {
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

  const item = await prisma.recurringItem.findFirst({
    where: { id: parsed.id, householdId }
  });

  return NextResponse.json(item);
}

export async function DELETE(request: Request) {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const body = await request.json();
  const parsed = z.object({ id: z.string().min(1) }).parse(body);
  const householdId = await getHouseholdId(session.user.id);

  await prisma.recurringItem.deleteMany({
    where: { id: parsed.id, householdId }
  });

  return NextResponse.json({ ok: true });
}
