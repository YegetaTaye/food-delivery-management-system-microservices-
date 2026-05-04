import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Define categories to match frontend
  const categoriesData = [
    { name: 'Burgers', description: 'Gourmet burgers and sandwiches' },
    { name: 'Pizza', description: 'Artisan wood-fired pizzas' },
    { name: 'Sushi', description: 'Fresh rolls and nigiri' },
    { name: 'Salads', description: 'Fresh and healthy greens' },
    { name: 'Desserts', description: 'Sweet treats and pastries' },
    { name: 'Drinks', description: 'Refreshing beverages' },
  ];

  console.log('🌱 Seeding categories...');
  const categoryMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categoryMap[cat.name] = created.id;
  }

  // Scraped menu items from Foodiesfeed
  const menuItems = [
    {
      name: 'Coffee Crema',
      description: 'A rich, aromatic coffee with a creamy layer on top.',
      price: 4.50,
      imageUrl: 'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/thumbnails/coffee-crema-v9GagSChFHN0stN6iFJAw.webp',
      category: 'Drinks'
    },
    {
      name: 'Colorful Garden Salad',
      description: 'A vibrant bowl filled with fresh greens, cherry tomatoes, and cucumbers.',
      price: 12.99,
      imageUrl: 'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/thumbnails/colorful-fresh-vegetable-salad-arrangement-P_mOkVjd_sGYfvcqnZMRJ.webp',
      category: 'Salads'
    },
    {
      name: 'Flaky Croissants',
      description: 'Delicious flaky croissants fresh from the oven, served with butter.',
      price: 6.50,
      imageUrl: 'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/thumbnails/flaky-croissants-in-a-charming-basket-gJYqeL1uVNsYA3D6Yeoka.webp',
      category: 'Desserts'
    },
    {
      name: 'Margherita Pizza',
      description: 'Classic pizza topped with fresh basil, mozzarella cheese, and artisan tomato sauce.',
      price: 15.99,
      imageUrl: 'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/thumbnails/pizza-margherita-with-fresh-basil-fy0ftYwpux8buReixljM6.webp',
      category: 'Pizza'
    },
    {
      name: 'Juicy Cheeseburger',
      description: 'A juicy beef burger topped with melted cheddar, fresh lettuce, and tomatoes.',
      price: 14.50,
      imageUrl: 'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/thumbnails/juicy-cheeseburger-5uNrwj9W_yiI-AAleYCvk.webp',
      category: 'Burgers'
    },
    {
      name: 'Creamy Lime Ice Cream',
      description: 'Zesty and creamy lime ice cream topped with fresh mint leaves.',
      price: 7.99,
      imageUrl: 'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/thumbnails/creamy-lime-ice-cream-with-fresh-mint-Y8HOWcrgrt2IwLHjKzvZt.webp',
      category: 'Desserts'
    },
    {
      name: 'Assorted Sushi Platter',
      description: 'A premium selection of fresh sushi rolls beautifully arranged.',
      price: 24.99,
      imageUrl: 'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/thumbnails/assorted-sushi-selection-on-vibrant-plate-53LzfwClOsWBqSOhQ7-lP.webp',
      category: 'Sushi'
    },
    {
      name: 'Raspberry Cheesecake',
      description: 'Delicious raspberry cheesecake slice garnished with fresh berries and coulis.',
      price: 8.50,
      imageUrl: 'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/generated/thumbnails/delicious-raspberry-cheesecake-slice-GoJ_0GJJuQLHmW9Ob-l1H.webp',
      category: 'Desserts'
    },
    {
      name: 'Fresh Avocado Salad',
      description: 'A colorful bowl of fresh vegetables tossed with ripe avocado and olive oil.',
      price: 13.50,
      imageUrl: 'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/thumbnails/fresh-vegetables-a6qqTPAUNStKnebqidpJb.webp',
      category: 'Salads'
    }
  ];

  console.log('🍔 Seeding menu items...');
  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: `item-${item.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        categoryId: categoryMap[item.category],
      },
      create: {
        id: `item-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        stock: 50,
        categoryId: categoryMap[item.category],
      },
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
