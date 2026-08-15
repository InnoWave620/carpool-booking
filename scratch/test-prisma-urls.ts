import { PrismaClient } from '@prisma/client';

const urls = [
  { name: 'SQLEXPRESS sa', url: 'sqlserver://localhost;instanceName=SQLEXPRESS;database=Carpool;user=sa;password=@IPhone13User.;encrypt=true;trustServerCertificate=true' },
  { name: 'SQLEXPRESS ngemasenzo60@gmail.com', url: 'sqlserver://localhost;instanceName=SQLEXPRESS;database=Carpool;user=ngemasenzo60@gmail.com;password=@IPhone13User.;encrypt=true;trustServerCertificate=true' },
  { name: 'SQLEXPRESS Dell', url: 'sqlserver://localhost;instanceName=SQLEXPRESS;database=Carpool;user=Dell;password=@IPhone13User.;encrypt=true;trustServerCertificate=true' },
  { name: 'DESKTOP-17K1HAK sa', url: 'sqlserver://DESKTOP-17K1HAK;instanceName=SQLEXPRESS;database=Carpool;user=sa;password=@IPhone13User.;encrypt=true;trustServerCertificate=true' },
  { name: 'DESKTOP-17K1HAK ngemasenzo60@gmail.com', url: 'sqlserver://DESKTOP-17K1HAK;instanceName=SQLEXPRESS;database=Carpool;user=ngemasenzo60@gmail.com;password=@IPhone13User.;encrypt=true;trustServerCertificate=true' },
  { name: 'Port 1433 sa', url: 'sqlserver://localhost:1433;database=Carpool;user=sa;password=@IPhone13User.;encrypt=true;trustServerCertificate=true' },
  { name: 'Port 1433 ngemasenzo60@gmail.com', url: 'sqlserver://localhost:1433;database=Carpool;user=ngemasenzo60@gmail.com;password=@IPhone13User.;encrypt=true;trustServerCertificate=true' },
];

async function run() {
  for (const item of urls) {
    console.log(`\nTesting ${item.name}...`);
    const prisma = new PrismaClient({ datasources: { db: { url: item.url } } });
    try {
      const res: any = await prisma.$queryRaw`SELECT 1 as connected, DB_NAME() as db`;
      console.log(`🎉 SUCCESS with ${item.name}! DB Name: ${res[0]?.db}`);
      await prisma.$disconnect();
      return item.url;
    } catch (err: any) {
      console.log(`❌ Failed with ${item.name}: ${err.message.split('\n')[0]}`);
      await prisma.$disconnect();
    }
  }
}

run();
