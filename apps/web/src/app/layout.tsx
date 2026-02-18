import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '../components/theme/ThemeProvider';

const DEFAULT_SITE_URL = 'http://localhost:3000';

function resolveSiteUrl() {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
  try {
    return new globalThis.URL(rawSiteUrl);
  } catch {
    return new globalThis.URL(DEFAULT_SITE_URL);
  }
}

const siteUrl = resolveSiteUrl();
const appName = 'Deepo';
const appDescription = 'Mini Tools Suite for fast developer, design, and operations workflows.';

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: appName,
    template: `%s · ${appName}`,
  },
  description: appDescription,
  manifest: '/manifest.webmanifest',
  applicationName: appName,
  icons: {
    icon: [
      { url: '/icons/icon-192.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-512.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg',
  },
  openGraph: {
    title: appName,
    description: appDescription,
    type: 'website',
    url: '/',
    siteName: appName,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${appName} open graph image`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: appName,
    description: appDescription,
    images: ['/opengraph-image'],
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Script src="/sw-register.js" strategy="afterInteractive" />
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
