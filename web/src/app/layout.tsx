import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Announcement } from '@/components/layout/Announcement';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});
const sans = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thevelvettray.com'),
  title: {
    default: 'The Velvet Tray — A curated gifting house',
    template: '%s · The Velvet Tray',
  },
  description:
    'Premium gifting, curated with craft. Corporate, festive, and personal hampers sourced from twelve regions of India.',
  openGraph: {
    type: 'website',
    siteName: 'The Velvet Tray',
    title: 'The Velvet Tray — A curated gifting house',
    description:
      'Premium gifting, curated with craft. Corporate, festive, and personal hampers sourced from twelve regions of India.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#7A1F2B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <Announcement />
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
