import type { Metadata } from 'next';
import './globals.css';
import './palette-motion.css';
import './cinematic-motion.css';
import { SiteMotion } from '@/components/motion/SiteMotion';
import { motionCSS } from '@/lib/motion-tokens';
import { AuthProvider } from '@/lib/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  title: 'AutoCare Insight | Vehicle service, connected',
  description: 'A connected workshop workspace for vehicle intake, repair diagnostics, spare parts, and billing. Built with Next.js, MySQL and MongoDB.',
  openGraph: {
    title: 'AutoCare Insight',
    description: 'Vehicle service. Connected.',
    type: 'website',
    images: [{ url: '/branding/autocare-cinematic.png', width: 1774, height: 887, alt: 'AutoCare Insight workshop intelligence' }],
  },
  twitter: { card: 'summary_large_image', title: 'AutoCare Insight', images: ['/branding/autocare-cinematic.png'] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try { const saved = localStorage.getItem('autocare-theme'); document.documentElement.classList.toggle('dark', saved ? saved === 'dark' : true); } catch {}` }} />
      </head>
      <body style={motionCSS} className="antialiased min-h-screen font-sans bg-slate-50 text-slate-900">
        <SiteMotion><AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider></SiteMotion>
      </body>
    </html>
  );
}
