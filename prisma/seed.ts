import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  'Loyer',
  'Épicerie',
  'Bébé',
  'Abonnements',
  'Transport',
  'Assurance',
  'Crédit / Prêt',
  'Énergie',
  'Transfert international',
  'Santé',
  'Maison',
  'Autre'
];

async function main() {
  const households = await prisma.household.findMany();
  if (households.length === 0) {
    return;
  }
  for (const household of households) {
    const existing = await prisma.category.findMany({
      where: { householdId: household.id }
    });
    if (existing.length === 0) {
      await prisma.category.createMany({
        data: defaultCategories.map((name) => ({
          name,
          householdId: household.id
        }))
      });
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
