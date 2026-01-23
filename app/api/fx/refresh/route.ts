import { NextResponse } from 'next/server';
import { requireApiSession } from '@/lib/api-auth';
import { getHouseholdId } from '@/lib/household';
import { refreshFxRates } from '@/lib/fx';

export async function POST() {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const householdId = await getHouseholdId(session.user.id);
  try {
    await refreshFxRates(householdId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 503 });
  }
}
