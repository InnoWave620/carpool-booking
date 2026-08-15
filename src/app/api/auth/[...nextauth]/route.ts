import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';
import { INITIAL_EMPLOYEES } from '@/lib/store';

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
      tenantId: process.env.AZURE_AD_TENANT_ID || 'common',
    }),
    // Fallback Microsoft Simulator Provider for Local Dev / Testing
    CredentialsProvider({
      id: 'microsoft-entra-sim',
      name: 'Microsoft Entra ID (AGL SSO)',
      credentials: {
        email: { label: 'AGL Corporate Email', type: 'email', placeholder: 'admin.namibia@aglgroup.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const employee = INITIAL_EMPLOYEES.find(
          (e) => e.email.toLowerCase() === credentials.email.toLowerCase()
        ) || INITIAL_EMPLOYEES[0];

        return {
          id: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          email: employee.email,
          image: employee.avatarUrl,
          role: employee.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'agl-transport-hub-secret-key-2026',
});

export { handler as GET, handler as POST };
