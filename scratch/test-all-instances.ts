import { PrismaClient } from '@prisma/client';

const instances = ['SQLEXPRESS', 'SQLEXPRESS01', 'SQLEXPRESS02'];
const users = ['ngemasenzo60@gmail.com', 'sa', 'Dell'];
const passwords = ['@IPhone13User.', '@IPhone13User'];

async function testAll() {
  console.log('🔍 Scanning all 3 SQL Server Express instances for database Carpool...\n');

  // Also test Windows Authentication (integratedSecurity) for each instance
  for (const inst of instances) {
    const winUrl = `sqlserver://localhost;instanceName=${inst};database=Carpool;integratedSecurity=true;trustServerCertificate=true`;
    console.log(`Testing Windows Auth on ${inst}...`);
    const prisma = new PrismaClient({ datasources: { db: { url: winUrl } } });
    try {
      const res: any = await prisma.$queryRaw`SELECT 1 as connected, DB_NAME() as db, @@SERVERNAME as server`;
      console.log(`🎉 SUCCESS! Connected to ${inst} using Windows Auth! DB: ${res[0]?.db}, Server: ${res[0]?.server}`);
      await prisma.$disconnect();
      return winUrl;
    } catch (err: any) {
      console.log(`   ❌ Windows Auth failed on ${inst}: ${err.message.split('\n')[0]}`);
      await prisma.$disconnect();
    }

    for (const u of users) {
      for (const p of passwords) {
        const sqlUrl = `sqlserver://localhost;instanceName=${inst};database=Carpool;user=${u};password=${p};encrypt=true;trustServerCertificate=true`;
        console.log(`Testing SQL Auth (${u}) on ${inst}...`);
        const pClient = new PrismaClient({ datasources: { db: { url: sqlUrl } } });
        try {
          const res: any = await pClient.$queryRaw`SELECT 1 as connected, DB_NAME() as db, @@SERVERNAME as server`;
          console.log(`🎉 SUCCESS! Connected to ${inst} with user ${u}! DB: ${res[0]?.db}`);
          await pClient.$disconnect();
          return sqlUrl;
        } catch (err: any) {
          console.log(`   ❌ SQL Auth (${u}) failed on ${inst}: ${err.message.split('\n')[0]}`);
          await pClient.$disconnect();
        }
      }
    }
  }
}

testAll();
