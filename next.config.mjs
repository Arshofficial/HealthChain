/** @type {import('next').NextConfig} */
export const dynamic = "force-dynamic";

const nextConfig = {
  output: "export",   // <-- THIS MUST BE PRESENT 🔥🔥🔥
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === "production" ? "/HealthChain" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/HealthChain/" : "",
};

export default nextConfig;
