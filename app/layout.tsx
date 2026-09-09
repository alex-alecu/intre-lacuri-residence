import type { Metadata } from 'next';
import './globals.css';
import { sitePath } from '@/lib/site-path';

export const metadata: Metadata = {
  title: 'A32 | Acasă, împreună',
  description: 'Explorează locuința familiei: living, bucătărie, trei dormitoare și balcoane verzi.',
  icons: { icon: sitePath('/home-icon.svg') },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
