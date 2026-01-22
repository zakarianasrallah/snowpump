import { NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/lib/prisma';
import { requireApiSession } from '@/lib/api-auth';
import { getHouseholdId } from '@/lib/household';
import { overrideSchema } from '@/lib/validators';

export async function POST(request: Request) {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const body = await request.json();
  const parsed = overrideSchema.parse(body);
  const householdId = await getHouseholdId(session.user.id);

  const item = await prisma.occurrenceOverride.upsert({
    where: {
      recurringItemId_date: {
        recurringItemId: parsed.recurringItemId,
        date: new Date(parsed.date)
      }
    },
    update: {
      paid: parsed.paid,
      note: parsed.note ?? null,
      editedAmount: parsed.editedAmount ? new Decimal(parsed.editedAmount) : null
    },
    create: {
      householdId,
      recurringItemId: parsed.recurringItemId,
      date: new Date(parsed.date),
      paid: parsed.paid,
      note: parsed.note ?? null,
      editedAmount: parsed.editedAmount ? new Decimal(parsed.editedAmount) : null
    }
  });

  return NextResponse.json(item);
}

export async function PUT(request: Request) {
  return POST(request);
}
