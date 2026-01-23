import { NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/lib/prisma';
import { requireApiSession } from '@/lib/api-auth';
import { getHouseholdId } from '@/lib/household';
import { listFxRates } from '@/lib/fx';
import { manualFxSchema } from '@/lib/validators';

export async function GET() {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const householdId = await getHouseholdId(session.user.id);
  const rates = await listFxRates(householdId);
  return NextResponse.json(rates);
}

export async function POST(request: Request) {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const body = await request.json();
  const parsed = manualFxSchema.parse(body);
  const householdId = await getHouseholdId(session.user.id);

  const effectiveDate = new Date(parsed.effectiveDate);
  const effectiveDateOnly = new Date(
    Date.UTC(effectiveDate.getUTCFullYear(), effectiveDate.getUTCMonth(), effectiveDate.getUTCDate())
  );

  const rate = await prisma.fxRate.upsert({
    where: {
      householdId_fromCurrency_toCurrency_effectiveDate_source: {
        householdId,
        fromCurrency: 'MAD',
        toCurrency: 'CAD',
        effectiveDate: effectiveDateOnly,
        source: 'MANUAL'
      }
    },
    update: {
      rate: new Decimal(parsed.rate),
      fetchedAt: new Date()
    },
    create: {
      householdId,
      fromCurrency: 'MAD',
      toCurrency: 'CAD',
      rate: new Decimal(parsed.rate),
      effectiveDate: effectiveDateOnly,
      source: 'MANUAL'
    }
  });

  return NextResponse.json(rate);
}
