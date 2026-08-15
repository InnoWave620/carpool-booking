import { Connection } from 'tedious';

const attempts = [
  {
    name: 'SQL Auth (ngemasenzo60@gmail.com)',
    server: 'localhost',
    options: {
      instanceName: 'SQLEXPRESS',
      database: 'Carpool',
      userName: 'ngemasenzo60@gmail.com',
      password: '@IPhone13User',
      trustServerCertificate: true,
      connectTimeout: 5000,
    }
  },
  {
    name: 'SQL Auth (sa)',
    server: 'localhost',
    options: {
      instanceName: 'SQLEXPRESS',
      database: 'Carpool',
      userName: 'sa',
      password: '@IPhone13User',
      trustServerCertificate: true,
      connectTimeout: 5000,
    }
  },
  {
    name: 'Windows NTLM Auth',
    server: 'localhost',
    options: {
      instanceName: 'SQLEXPRESS',
      database: 'Carpool',
      domain: 'DESKTOP-17K1HAK',
      userName: 'ngemasenzo60@gmail.com',
      password: '@IPhone13User',
      trustServerCertificate: true,
      connectTimeout: 5000,
    }
  },
  {
    name: 'Windows Local Auth',
    server: 'localhost',
    options: {
      instanceName: 'SQLEXPRESS',
      database: 'Carpool',
      userName: 'Dell',
      password: '@IPhone13User',
      trustServerCertificate: true,
      connectTimeout: 5000,
    }
  }
];

async function testAll() {
  for (const item of attempts) {
    console.log(`\nTesting ${item.name}...`);
    await new Promise<void>((resolve) => {
      const conn = new Connection(item as any);
      conn.on('connect', (err) => {
        if (err) {
          console.log(`❌ Failed: ${err.message}`);
        } else {
          console.log(`🎉 SUCCESS! Connected with ${item.name}`);
          conn.close();
        }
        resolve();
      });
      conn.connect();
    });
  }
}

testAll();
