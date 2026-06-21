import type { Metadata } from 'next';
import { Fraunces } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['opsz'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Career Co-Pilot · From first year to first job',
  description: 'An AI career co-pilot that takes a student from their first year to their first job — roadmap, projects, progress, peer cohort, resume builder and a recruiter talent pool.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${GeistSans.variable} ${GeistMono.variable}`}>
      <body style={{ fontFamily: 'var(--font-geist-sans), "Segoe UI", system-ui, sans-serif', background: '#f5f6fa', color: '#1e1b3a' }}>
        {children}
      </body>
    </html>
  );
}
