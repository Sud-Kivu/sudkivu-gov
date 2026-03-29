/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a self-contained Node.js server – ideal for Docker / Azure App Service
  output: 'standalone',

  // Allow serving unoptimised images (Azure CDN or Blob Storage handles optimisation)
  images: {
    unoptimized: true,
  },

  // Public runtime environment variables (prefix with NEXT_PUBLIC_)
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://sudkivu.cd',
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'Province du Sud-Kivu',
  },

  // Keep existing .html links working when served through the catch-all route
  trailingSlash: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
