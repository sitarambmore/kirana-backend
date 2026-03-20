import prisma from '../src/config/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding Database with Realistic Image Products...');

  // 1. Create or override a dummy shopkeeper with EXACT password 'admin123'
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@kirana.com' },
    update: { password: hashedPassword, role: 'SHOPKEEPER' },
    create: {
      name: 'Master Shopkeeper',
      email: 'admin@kirana.com',
      password: hashedPassword,
      role: 'SHOPKEEPER'
    }
  });

  // Skipped product resets to preserve previous states.
  console.log('✅ Admin User Verified/Updated successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
