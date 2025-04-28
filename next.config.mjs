/** @type {import('next').NextConfig} */

// Force dynamic rendering for client components
export const dynamic = "force-dynamic";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',                     // Export the site as static HTML
  images: {
    unoptimized: true,                   // Disable Image Optimization
  },
  basePath: isProd ? '/HealthChain' : '', // GitHub Pages/Netlify Subfolder Setup
  assetPrefix: isProd ? '/HealthChain/' : '',
  trailingSlash: true,                   // Important for Static Export
};

export default nextConfig;
