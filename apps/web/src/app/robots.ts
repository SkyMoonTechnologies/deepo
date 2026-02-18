import type { MetadataRoute } from 'next';

const DEFAULT_SITE_URL = 'http://localhost:3000';

function getSiteUrl(): string {
  try {
    return new globalThis.URL(process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
