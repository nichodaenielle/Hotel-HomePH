import './globals.css';
import type { Metadata } from 'next';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'Hotel at Home',
  description: 'Your Mediterranean escape in Amadeo, Cavite. Boutique hotel rooms and rooftop lounge for unforgettable stays.',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [
      { url: '/favicon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
  },
  manifest: '/manifest.json',
};

// Preconnect hints for fonts to prevent FOUC
export const viewport = {
  themeColor: '#011478',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <Head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <meta name="msapplication-TileImage" content="/favicon.png" />
      </Head>
      <body className="antialiased">
        <ToastProvider>
          <Header />
          {/* Spacer for fixed header */}
          <div className="h-[72px]" />
          {children}
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
