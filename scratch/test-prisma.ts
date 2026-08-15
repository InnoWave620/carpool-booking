import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing Prisma connection to SQL Server...');
  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected, @@SERVERNAME as server, DB_NAME() as db`;
    console.log('✅ Connection Successful:', result);
  } catch (err: any) {
    console.error('❌ Connection Failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
