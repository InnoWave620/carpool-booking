import { PrismaClient } from '@prisma/client';

const testUrls = [
  { name: 'Port 51091 Windows Auth', url: 'sqlserver://localhost:51091;database=Carpool;integratedSecurity=true;trustServerCertificate=true' },
  { name: 'Port 51091 User ngemasenzo60@gmail.com', url: 'sqlserver://localhost:51091;database=Carpool;user=ngemasenzo60@gmail.com;password=@IPhone13User.;encrypt=true;trustServerCertificate=true' },
  { name: 'Port 51091 User sa', url: 'sqlserver://localhost:51091;database=Carpool;user=sa;password=@IPhone13User.;encrypt=true;trustServerCertificate=true' },
  { name: 'Port 51091 User Dell', url: 'sqlserver://localhost:51091;database=Carpool;user=Dell;password=@IPhone13User.;encrypt=true;trustServerCertificate=true' },
];

async function run() {
  console.log('🚀 Testing direct port 51091 connection...\n');
  for (const item of testUrls) {
    console.log(`Testing ${item.name}...`);
    const prisma = new PrismaClient({ datasources: { db: { url: item.url } } });
    try {
      const res: any = await prisma.$queryRaw`SELECT 1 as connected, DB_NAME() as db, @@SERVERNAME as server`;
      console.log(`\n🎉 SUCCESS! Connected on 51091!`);
      console.log(`   Database: ${res[0]?.db}`);
      console.log(`   Server: ${res[0]?.server}`);
      console.log(`   Working URL: ${item.url}\n`);
      await prisma.$disconnect();
      return item.url;
    } catch (err: any) {
      console.log(`   ❌ Failed: ${err.message.split('\n')[0]}`);
      await prisma.$disconnect();
    }
  }
}

run();
