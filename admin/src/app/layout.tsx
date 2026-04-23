import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Velvet Tray · Admin',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
