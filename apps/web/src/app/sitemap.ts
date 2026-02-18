import type { MetadataRoute } from 'next';
import { collections, tools } from '@/lib/catalog';

const DEFAULT_SITE_URL = 'http://localhost:3000';

function getSiteUrl(): string {
  try {
    return new globalThis.URL(process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL)
      .toString()
      .replace(/\/$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/favorites`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/recents`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((collection) => ({
    url: `${siteUrl}/c/${collection.id}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const toolRoutes: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${siteUrl}${tool.href}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...collectionRoutes, ...toolRoutes];
}
