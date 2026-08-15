import type { Metadata } from 'next';
import './globals.css';
import { Shell } from '@/components/layout/Shell';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'AGL Transport Hub | AGL Namibia',
  description: 'Centralized Carpool & Pool Vehicle Booking Solution for Africa Global Logistics Namibia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
