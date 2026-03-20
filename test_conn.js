const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing connection to:', process.env.DATABASE_URL);
    await prisma.$connect();
    console.log('Database connected successfully!');
    const users = await prisma.user.findMany();
    console.log('Users found:', users.length);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
