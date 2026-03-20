import prisma from '../src/config/prisma';

async function main() {
  console.log('Seeding Sonam Masale Catalog...');

  const catalog = [
    // 1. Mutton Masala
    {
      name: 'Sonam Mutton Masala (200g)',
      description: 'Authentic Maharashtrian Mutton Masala. MRP: ₹180',
      price: 110,
      stock: 50,
      category: 'Sonam Masale',
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Spice bowl
    },
    {
      name: 'Sonam Mutton Masala (450g)',
      description: 'Authentic Maharashtrian Mutton Masala. MRP: ₹360',
      price: 220,
      stock: 50,
      category: 'Sonam Masale',
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    // 2. Chicken Masala
    {
      name: 'Sonam Chicken Masala (200g)',
      description: 'Premium Chicken Masala blend. MRP: ₹180',
      price: 110,
      stock: 50,
      category: 'Sonam Masale',
      imageUrl: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 
    },
    {
      name: 'Sonam Chicken Masala (450g)',
      description: 'Premium Chicken Masala blend. MRP: ₹360',
      price: 220,
      stock: 50,
      category: 'Sonam Masale',
      imageUrl: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    // 3. Kala Masala
    {
      name: 'Sonam Kala Masala (200g)',
      description: 'Traditional Special Kala Masala. MRP: ₹160',
      price: 100,
      stock: 50,
      category: 'Sonam Masale',
      imageUrl: 'https://images.unsplash.com/photo-1574316075191-490333d45fc8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Dark spice
    },
    {
      name: 'Sonam Kala Masala (450g)',
      description: 'Traditional Special Kala Masala. MRP: ₹320',
      price: 200,
      stock: 50,
      category: 'Sonam Masale',
      imageUrl: 'https://images.unsplash.com/photo-1574316075191-490333d45fc8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    // 4. Kanda Lasun Masala
    {
      name: 'Sonam Kanda Lasun Masala (200g)',
      description: 'Ambari Kanda Lasun Masala. MRP: ₹90',
      price: 65,
      stock: 50,
      category: 'Sonam Masale',
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Sonam Kanda Lasun Masala (450g)',
      description: 'Ambari Kanda Lasun Masala. MRP: ₹180',
      price: 130,
      stock: 50,
      category: 'Sonam Masale',
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    // 5. Mirchi Powder
    {
      name: 'Sonam Lal Mirchi Powder (200g)',
      description: 'Pure Red Chili Powder. MRP: ₹90',
      price: 65,
      stock: 50,
      category: 'Sonam Masale',
      imageUrl: 'https://images.unsplash.com/photo-1584347514781-80c1dfbdac1c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Red chili powder
    },
    {
      name: 'Sonam Lal Mirchi Powder (450g)',
      description: 'Pure Red Chili Powder. MRP: ₹205',
      price: 142,
      stock: 50,
      category: 'Sonam Masale',
      imageUrl: 'https://images.unsplash.com/photo-1584347514781-80c1dfbdac1c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    // 6. Halad Powder
    {
      name: 'Sonam Halad Powder (200g)',
      description: 'Pure Turmeric Powder. MRP: ₹95',
      price: 70,
      stock: 50,
      category: 'Sonam Masale',
      imageUrl: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Turmeric powder
    },
    {
      name: 'Sonam Halad Powder (450g)',
      description: 'Pure Turmeric Powder. MRP: ₹220',
      price: 160,
      stock: 50,
      category: 'Sonam Masale',
      imageUrl: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const product of catalog) {
    await prisma.product.create({
      data: product
    });
  }

  console.log('✅ 12 Sonam Masale Products Injected Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
