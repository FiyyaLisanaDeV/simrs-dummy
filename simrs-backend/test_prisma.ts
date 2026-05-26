import { PrismaClient } from '@prisma/client';

async function test() {
  console.log("Starting test...");
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log("Connected to Prisma!");
    
    // Just a quick query to test
    const user = await prisma.user.findFirst();
    console.log("Found user:", user);
    
    await prisma.$disconnect();
  } catch (err) {
    console.error("Prisma Error:", err);
  }
}

test();
