import type { Metadata } from 'next';
import './globals.css';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AuthProvider } from '@/lib/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'AutoCare Insight | Vehicle service, connected',
  description: 'A connected workshop workspace for vehicle intake, repair diagnostics, spare parts, and billing. Built with Next.js, MySQL and MongoDB.',
  openGraph: {
    title: 'AutoCare Insight',
    description: 'Every vehicle. Every detail. Under control.',
    type: 'website',
    images: [{ url: '/branding/autocare-banner.png', width: 1600, height: 650, alt: 'AutoCare Insight workshop intelligence' }],
  },
  twitter: { card: 'summary_large_image', title: 'AutoCare Insight', images: ['/branding/autocare-banner.png'] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try { const saved = localStorage.getItem('autocare-theme'); document.documentElement.classList.toggle('dark', saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches); } catch {}` }} />
      </head>
      <body className="antialiased min-h-screen font-sans bg-slate-50 text-slate-900">
        <ThemeToggle />
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
