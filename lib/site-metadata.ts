import type { Metadata, Viewport } from 'next';

export const SITE_NAME = 'TCG Vault';
export const SITE_TITLE = 'TCG Vault — Pokémon TCG Portfolio';
export const SITE_DESCRIPTION =
  'Track card valuations, manage holdings, organize virtual binders, and plan collection goals for your Pokémon TCG portfolio.';

function resolveMetadataBase(): URL {
  const configuredAppUrl = process.env.APP_URL ?? 'http://localhost:3000';
  const normalizedAppUrl = configuredAppUrl.endsWith('/')
    ? configuredAppUrl
    : `${configuredAppUrl}/`;

  return new URL(normalizedAppUrl);
}

export function createSiteMetadata(): Metadata {
  return {
    metadataBase: resolveMetadataBase(),
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    robots: {
      index: true,
      follow: true,
    },
    formatDetection: {
      telephone: false,
    },
    alternates: {
      canonical: '/',
    },
    icons: {
      icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/favicon.svg' }],
    },
    manifest: '/site.webmanifest',
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_US',
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: '/',
    },
    twitter: {
      card: 'summary',
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: SITE_NAME,
    },
    referrer: 'strict-origin-when-cross-origin',
  };
}

export const siteViewport: Viewport = {
  themeColor: '#1b202c',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};
