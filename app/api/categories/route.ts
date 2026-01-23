import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiSession } from '@/lib/api-auth';
import { getHouseholdId } from '@/lib/household';
import { categorySchema, idSchema } from '@/lib/validators';

export async function GET() {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const householdId = await getHouseholdId(session.user.id);
  const items = await prisma.category.findMany({
    where: { householdId },
    orderBy: { name: 'asc' }
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const body = await request.json();
  const parsed = categorySchema.parse(body);
  const householdId = await getHouseholdId(session.user.id);
  const item = await prisma.category.create({
    data: {
      name: parsed.name,
      householdId
    }
  });
  return NextResponse.json(item);
}

export async function PUT(request: Request) {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const body = await request.json();
  const parsed = categorySchema.extend({ id: idSchema }).parse(body);
  const householdId = await getHouseholdId(session.user.id);
  await prisma.category.updateMany({
    where: { id: parsed.id, householdId },
    data: { name: parsed.name }
  });
  const item = await prisma.category.findFirst({ where: { id: parsed.id, householdId } });
  return NextResponse.json(item);
}

export async function DELETE(request: Request) {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const body = await request.json();
  const id = idSchema.parse(body?.id);
  const householdId = await getHouseholdId(session.user.id);
  await prisma.category.deleteMany({
    where: { id, householdId }
  });
  return NextResponse.json({ ok: true });
}
