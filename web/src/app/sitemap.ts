import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import type { Hamper, Occasion, Region } from '@/lib/types';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thevelvettray.com';

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p; } catch { return fallback; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [hampers, occasions, regions] = await Promise.all([
    safe(api<Hamper[]>('/hampers?limit=96'), [] as Hamper[]),
    safe(api<Occasion[]>('/occasions'), [] as Occasion[]),
    safe(api<Region[]>('/regions'), [] as Region[]),
  ]);

  const now = new Date();
  const staticPaths: MetadataRoute.Sitemap = [
    '', '/hampers', '/occasions', '/studio',
    '/corporate', '/weddings', '/custom-orders',
    '/about', '/faq', '/contact', '/track-order',
  ].map((path) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  return [
    ...staticPaths,
    ...hampers.map<MetadataRoute.Sitemap[number]>((h) => ({
      url: `${SITE}/hampers/${h.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
    ...occasions.map<MetadataRoute.Sitemap[number]>((o) => ({
      url: `${SITE}/occasions/${o.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
    ...regions.map<MetadataRoute.Sitemap[number]>((r) => ({
      url: `${SITE}/studio/${r.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
  ];
}
