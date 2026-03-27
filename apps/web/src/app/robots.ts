import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flowboard.dev';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/workspaces', '/api'] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
