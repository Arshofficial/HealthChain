/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === "production" ? "/HealthChain" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/HealthChain/" : "",
};

export default nextConfig;
