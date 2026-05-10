export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: 'https://flashi.pk/sitemap.xml',
    host: 'https://flashi.pk',
  };
}
