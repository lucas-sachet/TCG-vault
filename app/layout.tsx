import type { Metadata, Viewport } from 'next';
import { getPublicEnv } from '@/lib/env';
import { createSiteMetadata, siteViewport } from '@/lib/site-metadata';
import { ServiceWorkerRegistration } from './components/ServiceWorkerRegistration';
import { AppProviders } from './providers';
import './globals.css';

export const metadata: Metadata = createSiteMetadata();
export const viewport: Viewport = siteViewport;

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicEnv();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href={NEXT_PUBLIC_SUPABASE_URL} crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.pokemontcg.io" />
        <link rel="dns-prefetch" href="https://images.weserv.nl" />
      </head>
      <body className="antialiased">
        <noscript>
          <div className="mx-auto max-w-lg px-6 py-16 text-center text-[#f3f4f6]">
            <h1 className="mb-3 text-2xl font-semibold">TCG Vault requires JavaScript</h1>
            <p className="leading-relaxed text-slate-400">
              Enable JavaScript in your browser to track your Pokémon TCG collection,
              valuations, and binders.
            </p>
          </div>
        </noscript>
        <AppProviders>
          {children}
          <ServiceWorkerRegistration />
        </AppProviders>
      </body>
    </html>
  );
}
