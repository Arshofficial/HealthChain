/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  // basePath: process.env.NODE_ENV === "production" ? "" : "",
  // assetPrefix: process.env.NODE_ENV === "production" ? "" : "",
};

export default nextConfig;
