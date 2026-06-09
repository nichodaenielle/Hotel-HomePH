import './globals.css';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'Hotel at Home',
  description: 'Hotel at Home landing page with a video walkthrough, booking navigation, and availability search.',
  icons: {
    icon: '/favicon.png',
  },
};

// Preconnect hints for fonts to prevent FOUC
export const viewport = {
  themeColor: '#011478',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
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
