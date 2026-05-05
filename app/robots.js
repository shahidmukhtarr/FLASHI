export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/special-discounts'],
      },
    ],
    sitemap: 'https://flashi.pk/sitemap.xml',
    host: 'https://flashi.pk',
  };
}
