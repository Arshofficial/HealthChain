/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  images: {
    unoptimized: true,            // Disable image optimization (good for GitHub Pages)
  },
  basePath: isProd ? '/HealthChain' : '',    // ✅ Needed for GitHub Pages
  assetPrefix: isProd ? '/HealthChain/' : '', // ✅ Needed for GitHub Pages
  experimental: {
    serverActions: true,          // Optional, if you are using latest Next.js features
  },
};

export default nextConfig;
