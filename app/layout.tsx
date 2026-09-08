import type { Metadata } from 'next';
import './globals.css';
import { sitePath } from '@/lib/site-path';

export const metadata: Metadata = {
  title: 'A32 | Our connected home',
  description: 'Explore the connected apartments in a furnished 3D model.',
  icons: { icon: sitePath('/home-icon.svg') },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
