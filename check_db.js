const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  const products = await prisma.product.findMany();
  console.log(`Total Products: ${count}`);
  products.forEach(p => console.log(`- ${p.name}: ₹${p.price}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
