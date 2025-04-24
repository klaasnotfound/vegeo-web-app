import { Geist, Geist_Mono } from 'next/font/google';
import { Theme } from '@radix-ui/themes';
import type { Metadata } from 'next';

import '@radix-ui/themes/styles.css';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Vegeo Client',
  description: 'A small demo app to showcase vegetation risk assessment',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Theme accentColor="green">{children}</Theme>
      </body>
    </html>
  );
}
