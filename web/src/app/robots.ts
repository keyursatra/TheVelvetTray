import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thevelvettray.com';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/checkout', '/cart', '/account', '/api/'] },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
