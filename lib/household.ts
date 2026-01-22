import { prisma } from './prisma';

export async function getHouseholdId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { householdId: true }
  });
  if (!user) {
    throw new Error('User not found');
  }
  return user.householdId;
}
