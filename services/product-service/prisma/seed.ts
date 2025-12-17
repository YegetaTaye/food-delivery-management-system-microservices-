import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const appetizers = await prisma.category.upsert({
    where: { name: 'Appetizers' },
    update: {},
    create: { name: 'Appetizers', description: 'Starters and small bites' },
  });

  const mains = await prisma.category.upsert({
    where: { name: 'Main Courses' },
    update: {},
    create: { name: 'Main Courses', description: 'Hearty main dishes' },
  });

  const beverages = await prisma.category.upsert({
    where: { name: 'Beverages' },
    update: {},
    create: { name: 'Beverages', description: 'Drinks' },
  });

  // Create menu items
  await prisma.menuItem.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Garlic Bread', price: 5.99, stock: 100, categoryId: appetizers.id },
      { name: 'Chicken Wings', price: 12.99, stock: 50, categoryId: appetizers.id },
      { name: 'Grilled Salmon', price: 24.99, stock: 30, categoryId: mains.id },
      { name: 'Margherita Pizza', price: 14.99, stock: 60, categoryId: mains.id },
      { name: 'Classic Burger', price: 13.99, stock: 45, categoryId: mains.id },
      { name: 'Fresh Lemonade', price: 4.99, stock: 100, categoryId: beverages.id },
    ],
  });

  console.log('✅ Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
