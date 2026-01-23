import { NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/lib/prisma';
import { requireApiSession } from '@/lib/api-auth';
import { getHouseholdId } from '@/lib/household';
import { demoSchema } from '@/lib/validators';

export async function POST(request: Request) {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const body = await request.json();
  const parsed = demoSchema.parse(body);
  const householdId = await getHouseholdId(session.user.id);

  await prisma.demoState.upsert({
    where: { householdId },
    update: { enabled: parsed.enabled },
    create: { householdId, enabled: parsed.enabled }
  });

  if (parsed.enabled) {
    const today = new Date();
    await prisma.oneTimeItem.createMany({
      data: [
        {
          householdId,
          type: 'EXPENSE',
          name: 'Courses DEMO',
          amount: new Decimal(120),
          currency: 'CAD',
          date: today
        },
        {
          householdId,
          type: 'EXPENSE',
          name: 'Transfert DEMO',
          amount: new Decimal(900),
          currency: 'MAD',
          date: today
        },
        {
          householdId,
          type: 'INCOME',
          name: 'Salaire DEMO',
          amount: new Decimal(2500),
          currency: 'CAD',
          date: today
        }
      ]
    });
  } else {
    await prisma.oneTimeItem.deleteMany({
      where: {
        householdId,
        name: { endsWith: 'DEMO' }
      }
    });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const householdId = await getHouseholdId(session.user.id);
  const state = await prisma.demoState.findUnique({ where: { householdId } });
  return NextResponse.json({ enabled: state?.enabled ?? false });
}
